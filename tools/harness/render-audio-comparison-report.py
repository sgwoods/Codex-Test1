#!/usr/bin/env python3
import json
import math
import os
import sys
import wave

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np


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


def save_waveform(sample_rate, data, out_path, title):
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


def save_spectrogram(sample_rate, data, out_path, title):
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

    report = {"commit": manifest["commit"], "version": manifest["version"], "items": []}

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
            "| Variant | Duration (s) | Peak | RMS | Spectral Centroid (Hz) | Zero Crossings / s | Waveform | Spectrogram |",
            "| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |",
        ])

        for key in ("aurora", "galaga", "reference"):
            variant = item[key]
            wav_path = os.path.join(out_root, variant["wav"])
            sample_rate, data = load_wav(wav_path)
            m = metrics(sample_rate, data)
            wave_path = os.path.join(plots_dir, f"{item['id']}-{key}-waveform.png")
            spec_path = os.path.join(plots_dir, f"{item['id']}-{key}-spectrogram.png")
            save_waveform(sample_rate, data, wave_path, f"{item['label']} · {variant['label']} waveform")
            save_spectrogram(sample_rate, data, spec_path, f"{item['label']} · {variant['label']} spectrogram")
            item_report["variants"][key] = {
                "label": variant["label"],
                "wav": variant["wav"],
                "metrics": m,
                "waveform": rel(wave_path, out_root),
                "spectrogram": rel(spec_path, out_root),
            }
            readme_lines.append(
                f"| {variant['label']} | {m['duration_s']:.3f} | {m['peak']:.4f} | {m['rms']:.4f} | {m['spectral_centroid_hz']:.1f} | {m['zero_crossings_per_s']:.1f} | [{os.path.basename(wave_path)}]({rel(wave_path, out_root)}) | [{os.path.basename(spec_path)}]({rel(spec_path, out_root)}) |"
            )

        aur = item_report["variants"]["aurora"]["metrics"]
        gal = item_report["variants"]["galaga"]["metrics"]
        ref = item_report["variants"]["reference"]["metrics"]
        readme_lines.extend([
            "",
            f"- Quick read: synthetic Galaga duration delta vs reference = `{abs(gal['duration_s'] - ref['duration_s']):.3f}s`; Aurora duration delta vs reference = `{abs(aur['duration_s'] - ref['duration_s']):.3f}s`.",
            f"- Quick read: synthetic Galaga centroid delta vs reference = `{abs(gal['spectral_centroid_hz'] - ref['spectral_centroid_hz']):.1f}Hz`; Aurora centroid delta vs reference = `{abs(aur['spectral_centroid_hz'] - ref['spectral_centroid_hz']):.1f}Hz`.",
            "",
        ])
        report["items"].append(item_report)

    with open(os.path.join(out_root, "metrics.json"), "w", encoding="utf-8") as fh:
        json.dump(report, fh, indent=2)
    with open(os.path.join(out_root, "README.md"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(readme_lines) + "\n")


if __name__ == "__main__":
    main()
