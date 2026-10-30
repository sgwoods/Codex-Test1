// Proof-only authoring boundary; this is not a runtime importer or a playability gate.
const LIMITS = Object.freeze({ gx: [18, 22], gy: [16, 20], oy: [28, 32] });

function formationSlice(layouts, json) {
  if (typeof json !== 'string') throw new Error('Expected JSON text');
  const patch = JSON.parse(json);
  if (!patch || Array.isArray(patch) || typeof patch !== 'object' || !Object.keys(patch).length) {
    throw new Error('Expected nonempty patch object');
  }
  for (const [key, value] of Object.entries(patch)) {
    if (!Object.hasOwn(LIMITS, key)) throw new Error(`Unsupported field: ${key}`);
    const [min, max] = LIMITS[key];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
      throw new Error(`Outside proof envelope: ${key}`);
    }
  }
  if (!Array.isArray(layouts) || layouts.filter(row => row.fromStage === 4).length !== 1) {
    throw new Error('Expected exactly one stage-four layout');
  }
  return Object.freeze(layouts.map(row => Object.freeze({ ...row, ...(row.fromStage === 4 ? patch : {}) })));
}

module.exports = { formationSlice };
