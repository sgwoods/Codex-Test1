#!/usr/bin/env python3
import json
import math
import os
import sys
import wave

import numpy as np

try:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
except ModuleNotFoundError:
    matplotlib = None
    plt = None


def load_wav(path):
    with wave.open(path, "rb") as wav:
        channels = wav.getnchannels()
        sample_rate = wav.getframerate()
        frames = wav.getnframes()
        sample_width = wav.getsampwidth()
        raw = wav.readframes(frames)
    if sample_width == 2:
        data = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
    elif sample_width == 1:
        data = (np.frombuffer(raw, dtype=np.uint8).astype(np.float32) - 128.0) / 128.0
    else:
        raise ValueError(f"Unsupported sample width {sample_width} for {path}")
    if channels > 1:
        data = data.reshape(-1, channels).mean(axis=1)
    return sample_rate, data


def metrics(sample_rate, data):
    if data.size == 0:
        return {
            "duration_s": 0.0,
            "peak": 0.0,
            "rms": 0.0,
            "spectral_centroid_hz": 0.0,
            "zero_crossings_per_s": 0.0,
        }
    duration = float(data.size) / float(sample_rate)
    peak = float(np.max(np.abs(data)))
    rms = float(np.sqrt(np.mean(np.square(data))))
    spectrum = np.abs(np.fft.rfft(data))
    freqs = np.fft.rfftfreq(data.size, d=1.0 / sample_rate)
    mag_sum = float(np.sum(spectrum))
    centroid = float(np.sum(freqs * spectrum) / mag_sum) if mag_sum > 0 else 0.0
    zero_crossings = np.count_nonzero(np.diff(np.signbit(data)))
    return {
        "duration_s": round(duration, 3),
        "peak": round(peak, 4),
        "rms": round(rms, 4),
        "spectral_centroid_hz": round(centroid, 1),
        "zero_crossings_per_s": round(float(zero_crossings) / max(duration, 1e-9), 1),
    }


def active_window(sample_rate, data):
    if data.size == 0:
        return {"start_s": 0.0, "end_s": 0.0, "duration_s": 0.0, "coverage": 0.0}, data

    frame_size = max(1, int(sample_rate * 0.05))
    hop = max(1, int(sample_rate * 0.01))
    if data.size <= frame_size:
        full = float(data.size) / float(sample_rate)
        return {"start_s": 0.0, "end_s": round(full, 3), "duration_s": round(full, 3), "coverage": 1.0}, data

    frame_starts = np.arange(0, data.size - frame_size + 1, hop)
    frame_rms = np.array([
        float(np.sqrt(np.mean(np.square(data[start:start + frame_size]))))
        for start in frame_starts
    ])
    floor = float(np.percentile(frame_rms, 20))
    high = float(np.percentile(frame_rms, 90))
    threshold = max(0.015, floor + ((high - floor) * 0.35))
    active = np.where(frame_rms >= threshold)[0]
    if active.size == 0:
        full = float(data.size) / float(sample_rate)
        return {"start_s": 0.0, "end_s": round(full, 3), "duration_s": round(full, 3), "coverage": 1.0}, data

    pad = int(sample_rate * 0.05)
    start = max(0, int(frame_starts[int(active[0])]) - pad)
    end = min(data.size, int(frame_starts[int(active[-1])] + frame_size) + pad)
    duration = float(end - start) / float(sample_rate)
    full_duration = float(data.size) / float(sample_rate)
    return {
        "start_s": round(float(start) / float(sample_rate), 3),
        "end_s": round(float(end) / float(sample_rate), 3),
        "duration_s": round(duration, 3),
        "coverage": round(duration / max(full_duration, 1e-9), 3),
        "threshold_rms": round(threshold, 4),
    }, data[start:end]


def metric_deltas(left, right):
    return {
        "duration_s": round(abs((left.get("duration_s") or 0) - (right.get("duration_s") or 0)), 3),
        "spectral_centroid_hz": round(abs((left.get("spectral_centroid_hz") or 0) - (right.get("spectral_centroid_hz") or 0)), 1),
        "zero_crossings_per_s": round(abs((left.get("zero_crossings_per_s") or 0) - (right.get("zero_crossings_per_s") or 0)), 1),
        "rms": round(abs((left.get("rms") or 0) - (right.get("rms") or 0)), 4),
    }


def closeness(value, target, tolerance):
    if value is None or target is None:
        return 0.0
    return max(0.0, min(1.0, 1.0 - (abs(value - target) / max(tolerance, 0.001))))


def similarity_score(candidate, target):
    duration = closeness(candidate.get("duration_s"), target.get("duration_s"), 0.2)
    centroid = closeness(candidate.get("spectral_centroid_hz"), target.get("spectral_centroid_hz"), 1200)
    crossings = closeness(candidate.get("zero_crossings_per_s"), target.get("zero_crossings_per_s"), 800)
    rms = closeness(candidate.get("rms"), target.get("rms"), 0.2)
    return round((0.2 * duration) + (0.35 * centroid) + (0.25 * crossings) + (0.2 * rms), 3)


def reference_segment_candidates(sample_rate, data, target_metrics, max_candidates=3):
    target_duration = target_metrics.get("duration_s") or 0
    if target_duration <= 0 or data.size == 0:
        return []
    window_size = min(data.size, max(1, int(target_duration * sample_rate)))
    if window_size >= data.size:
        return []

    hop = max(1, int(sample_rate * 0.05))
    candidates = []
    for start in range(0, data.size - window_size + 1, hop):
        end = start + window_size
        segment_metrics = metrics(sample_rate, data[start:end])
        candidates.append({
            "start_s": round(float(start) / float(sample_rate), 3),
            "end_s": round(float(end) / float(sample_rate), 3),
            "score": similarity_score(segment_metrics, target_metrics),
            "metrics": segment_metrics,
        })

    candidates.sort(key=lambda candidate: (-candidate["score"], candidate["start_s"]))
    picked = []
    for candidate in candidates:
        overlaps = any(
            candidate["start_s"] < existing["end_s"] and candidate["end_s"] > existing["start_s"]
            for existing in picked
        )
        if overlaps:
            continue
        picked.append(candidate)
        if len(picked) >= max_candidates:
            break
    return picked


def average_delta(items, path):
    values = []
    for item in items:
        value = item
        for key in path:
            value = value.get(key, {}) if isinstance(value, dict) else {}
        if isinstance(value, (int, float)) and math.isfinite(value):
            values.append(float(value))
    return round(sum(values) / len(values), 3) if values else 0.0


def reference_window_status(reference_metrics, reference_window, aurora_metrics, galaga_metrics):
    runtime_duration = max(aurora_metrics["duration_s"], galaga_metrics["duration_s"], 1e-9)
    if reference_metrics["duration_s"] > runtime_duration * 1.8 and reference_window["coverage"] > 0.75:
        return "broad-reference-window-needs-segmentation"
    if reference_window["coverage"] < 0.65:
        return "active-segment-detected"
    return "direct-cue-comparison"


def save_waveform(sample_rate, data, out_path, title):
    if plt is None:
        return None
    t = np.arange(data.size) / float(sample_rate)
    fig, ax = plt.subplots(figsize=(12, 2.6), dpi=120)
    ax.plot(t, data, color="#9ae6ff", linewidth=0.8)
    ax.set_facecolor("#020617")
    fig.patch.set_facecolor("#020617")
    ax.set_title(title, color="white", fontsize=11)
    ax.set_xlabel("Seconds", color="#cbd5e1")
    ax.set_ylabel("Amp", color="#cbd5e1")
    ax.tick_params(colors="#cbd5e1")
    for spine in ax.spines.values():
        spine.set_color("#334155")
    fig.tight_layout()
    fig.savefig(out_path, facecolor=fig.get_facecolor())
    plt.close(fig)
    return out_path


def save_spectrogram(sample_rate, data, out_path, title):
    if plt is None:
        return None
    fig, ax = plt.subplots(figsize=(12, 3.6), dpi=120)
    ax.specgram(data, NFFT=512, Fs=sample_rate, noverlap=384, cmap="magma")
    ax.set_ylim(0, min(sample_rate / 2, 5000))
    ax.set_facecolor("#020617")
    fig.patch.set_facecolor("#020617")
    ax.set_title(title, color="white", fontsize=11)
    ax.set_xlabel("Seconds", color="#cbd5e1")
    ax.set_ylabel("Hz", color="#cbd5e1")
    ax.tick_params(colors="#cbd5e1")
    for spine in ax.spines.values():
        spine.set_color("#334155")
    fig.tight_layout()
    fig.savefig(out_path, facecolor=fig.get_facecolor())
    plt.close(fig)
    return out_path


def artifact_link(path, out_root):
    if not path:
        return "n/a"
    return f"[{os.path.basename(path)}]({rel(path, out_root)})"


def rel(path, base):
    return os.path.relpath(path, base)


def main():
    if len(sys.argv) != 2:
        raise SystemExit("usage: render-audio-comparison-report.py <manifest.json>")
    manifest_path = os.path.abspath(sys.argv[1])
    out_root = os.path.dirname(manifest_path)
    plots_dir = os.path.join(out_root, "plots")
    os.makedirs(plots_dir, exist_ok=True)

    with open(manifest_path, "r", encoding="utf-8") as fh:
        manifest = json.load(fh)

    readme_lines = [
        "# Aurora Audio Theme Comparison",
        "",
        f"- Generated from commit `{manifest['commit']}`",
        f"- Version: `{manifest['version']}`",
        f"- Generated at: `{manifest['generatedAt']}`",
        "",
        "This comparison captures the actual synthetic Aurora and synthetic Galaga-theme cue output from the live browser audio engine, then compares them against the labeled Galaga reference clips already cataloged in the repo.",
        "",
        "Metrics are lightweight and meant to help directionally, not declare perceptual fidelity by themselves.",
        "",
    ]
    if plt is None:
        readme_lines.extend([
            "> Plot generation was skipped because `matplotlib` is not installed in this local Python environment. Numeric waveform and spectral metrics were still computed from the captured WAV samples.",
            "",
        ])

    report = {"commit": manifest["commit"], "version": manifest["version"], "items": [], "summary": {}}

    for item in manifest["items"]:
        item_report = {
            "id": item["id"],
            "label": item["label"],
            "focus": item["focus"],
            "cue": item["cue"],
            "variants": {},
        }
        readme_lines.extend([
            f"## {item['label']}",
            "",
            f"- Cue: `{item['cue']}`",
            f"- Focus: {item['focus']}",
            "",
            "| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Active Window | Waveform | Spectrogram |",
            "| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- |",
        ])

        loaded_variants = {}
        for key in ("aurora", "galaga", "reference"):
            variant = item[key]
            wav_path = os.path.join(out_root, variant["wav"])
            sample_rate, data = load_wav(wav_path)
            loaded_variants[key] = {"sampleRate": sample_rate, "data": data}
            m = metrics(sample_rate, data)
            active, active_data = active_window(sample_rate, data)
            active_metrics = metrics(sample_rate, active_data)
            wave_path = os.path.join(plots_dir, f"{item['id']}-{key}-waveform.png")
            spec_path = os.path.join(plots_dir, f"{item['id']}-{key}-spectrogram.png")
            wave_path = save_waveform(sample_rate, data, wave_path, f"{item['label']} · {variant['label']} waveform")
            spec_path = save_spectrogram(sample_rate, data, spec_path, f"{item['label']} · {variant['label']} spectrogram")
            item_report["variants"][key] = {
                "label": variant["label"],
                "wav": variant["wav"],
                "metrics": m,
                "activeWindow": active,
                "activeMetrics": active_metrics,
                "waveform": rel(wave_path, out_root) if wave_path else None,
                "spectrogram": rel(spec_path, out_root) if spec_path else None,
            }
            readme_lines.append(
                f"| {variant['label']} | {m['duration_s']:.3f} | {m['peak']:.4f} | {m['rms']:.4f} | {m['spectral_centroid_hz']:.1f} | {m['zero_crossings_per_s']:.1f} | {active['start_s']:.3f}-{active['end_s']:.3f}s | {artifact_link(wave_path, out_root)} | {artifact_link(spec_path, out_root)} |"
            )

        aur = item_report["variants"]["aurora"]["metrics"]
        gal = item_report["variants"]["galaga"]["metrics"]
        ref = item_report["variants"]["reference"]["metrics"]
        aur_active = item_report["variants"]["aurora"]["activeMetrics"]
        gal_active = item_report["variants"]["galaga"]["activeMetrics"]
        ref_active = item_report["variants"]["reference"]["activeMetrics"]
        item_report["comparisons"] = {
            "auroraVsSyntheticGalaga": metric_deltas(aur_active, gal_active),
            "auroraVsReferenceActive": metric_deltas(aur_active, ref_active),
            "syntheticGalagaVsReferenceActive": metric_deltas(gal_active, ref_active),
            "referenceWindowStatus": reference_window_status(
                ref,
                item_report["variants"]["reference"]["activeWindow"],
                aur,
                gal,
            ),
        }
        item_report["referenceSegmentCandidates"] = reference_segment_candidates(
            loaded_variants["reference"]["sampleRate"],
            loaded_variants["reference"]["data"],
            aur_active,
        )
        readme_lines.extend([
            "",
            f"- Quick read: synthetic Galaga duration delta vs reference = `{abs(gal['duration_s'] - ref['duration_s']):.3f}s`; Aurora duration delta vs reference = `{abs(aur['duration_s'] - ref['duration_s']):.3f}s`.",
            f"- Quick read: synthetic Galaga centroid delta vs reference = `{abs(gal['spectral_centroid_hz'] - ref['spectral_centroid_hz']):.1f}Hz`; Aurora centroid delta vs reference = `{abs(aur['spectral_centroid_hz'] - ref['spectral_centroid_hz']):.1f}Hz`.",
            f"- Active-window status: `{item_report['comparisons']['referenceWindowStatus']}`.",
            f"- Active quick read: Aurora vs reference duration delta = `{item_report['comparisons']['auroraVsReferenceActive']['duration_s']:.3f}s`; centroid delta = `{item_report['comparisons']['auroraVsReferenceActive']['spectral_centroid_hz']:.1f}Hz`.",
        ])
        if item_report["referenceSegmentCandidates"]:
            candidate_text = "; ".join(
                f"{candidate['start_s']:.3f}-{candidate['end_s']:.3f}s score {candidate['score']:.3f}"
                for candidate in item_report["referenceSegmentCandidates"]
            )
            readme_lines.append(f"- Candidate reference subwindows: {candidate_text}.")
        readme_lines.append("")
        report["items"].append(item_report)

    report["summary"] = {
        "itemCount": len(report["items"]),
        "broadReferenceWindowCount": len([
            item for item in report["items"]
            if item["comparisons"]["referenceWindowStatus"] == "broad-reference-window-needs-segmentation"
        ]),
        "referenceSegmentCandidateCount": sum(len(item.get("referenceSegmentCandidates") or []) for item in report["items"]),
        "averageAuroraVsSyntheticGalagaDurationDeltaS": average_delta(report["items"], ["comparisons", "auroraVsSyntheticGalaga", "duration_s"]),
        "averageAuroraVsReferenceActiveDurationDeltaS": average_delta(report["items"], ["comparisons", "auroraVsReferenceActive", "duration_s"]),
        "averageAuroraVsReferenceActiveCentroidDeltaHz": average_delta(report["items"], ["comparisons", "auroraVsReferenceActive", "spectral_centroid_hz"]),
    }
    readme_lines.extend([
        "## Summary",
        "",
        f"- Items: {report['summary']['itemCount']}",
        f"- Broad reference windows needing tighter segmentation: {report['summary']['broadReferenceWindowCount']}",
        f"- Candidate reference subwindows found: {report['summary']['referenceSegmentCandidateCount']}",
        f"- Average active Aurora-vs-synthetic-Galaga duration delta: `{report['summary']['averageAuroraVsSyntheticGalagaDurationDeltaS']:.3f}s`",
        f"- Average active Aurora-vs-reference duration delta: `{report['summary']['averageAuroraVsReferenceActiveDurationDeltaS']:.3f}s`",
        f"- Average active Aurora-vs-reference centroid delta: `{report['summary']['averageAuroraVsReferenceActiveCentroidDeltaHz']:.1f}Hz`",
        "",
    ])

    with open(os.path.join(out_root, "metrics.json"), "w", encoding="utf-8") as fh:
        json.dump(report, fh, indent=2)
    with open(os.path.join(out_root, "README.md"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(readme_lines) + "\n")


if __name__ == "__main__":
    main()
