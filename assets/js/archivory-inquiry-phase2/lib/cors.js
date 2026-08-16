function parseAllowedOrigins() {
  return (process.env.ALLOWED_ORIGINS || "").split(",").map(v => v.trim()).filter(Boolean);
}
export function corsOptions() {
  const allowed = parseAllowedOrigins();
  return {
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    maxAge: 86400,
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowed.includes(origin)) return callback(null, true);
      return callback(new Error("Origin not allowed by ArchIvory CORS policy."));
    }
  };
}
