const buckets = new Map();
export function simpleRateLimit({ windowMs = 60000, max = 20 } = {}) {
  return function (req, res, next) {
    const key = req.ip || "unknown", now = Date.now();
    let bucket = buckets.get(key);
    if (!bucket || now - bucket.startedAt >= windowMs) bucket = { startedAt: now, count: 0 };
    bucket.count += 1; buckets.set(key, bucket);
    if (bucket.count > max) return res.status(429).json({ error: "Too many inquiry requests. Please wait a moment and try again." });
    next();
  };
}
