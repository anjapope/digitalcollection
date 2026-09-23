import "dotenv/config";
import express from "express";
import cors from "cors";
import inquiryRouter from "./api/inquiry.js";
import { corsOptions } from "./lib/cors.js";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const app = express();
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const source = name => path.join(projectRoot, "_data", name);
const slotsPath = source("exhibit_slots.csv");
const anchorsPath = source("room_anchors.json");
const roomsPath = source("rooms.csv");
const placementsPath = source("placements.csv");
const parseCsv = text => {
  const [header, ...lines] = text.trimEnd().split(/\r?\n/);
  const keys = header.split(",");
  return lines.map(line => {
    const values = []; let value = "", quoted = false;
    for (let i = 0; i < line.length; i++) { const char = line[i]; if (char === '"' && line[i + 1] === '"') { value += '"'; i++; } else if (char === '"') quoted = !quoted; else if (char === "," && !quoted) { values.push(value); value = ""; } else value += char; }
    values.push(value); return Object.fromEntries(keys.map((key, index) => [key, values[index] || ""]));
  });
};
const csvValue = value => {
  const text = String(value || "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const csv = (rows, headers) => `${headers.join(",")}\n${rows.map(row => headers.map(key => csvValue(row[key])).join(",")).join("\n")}\n`;
async function structure() {
  const [rooms, slots, anchors, placements] = await Promise.all([roomsPath, slotsPath, anchorsPath, placementsPath].map(async file => file.endsWith(".json") ? JSON.parse(await fs.readFile(file, "utf8")) : parseCsv(await fs.readFile(file, "utf8"))));
  return { rooms, slots, anchors, placements };
}
function structuralErrors(model) {
  const errors = [], roomIds = new Set(model.rooms.map(room => room.room_id)), slotIds = new Set();
  for (const slot of model.slots) { if (!slot.slot_id || slotIds.has(slot.slot_id)) errors.push("Slots require unique IDs."); slotIds.add(slot.slot_id); if (!roomIds.has(slot.room_id)) errors.push(`Unknown room: ${slot.room_id}`); if (!["detail","collection","timeline","tool","inline"].includes(slot.slot_type)) errors.push(`Unsupported type: ${slot.slot_type}`); if (!Number.isInteger(Number(slot.capacity)) || Number(slot.capacity) < 1) errors.push(`Invalid capacity: ${slot.slot_id}`); }
  for (const anchor of model.anchors) { const slot = model.slots.find(item => item.slot_id === anchor.slot_id); const box = anchor.content_bounds; if (!slot || slot.room_id !== anchor.room_id || slot.anchor_id !== anchor.anchor_id) errors.push(`Invalid anchor reference: ${anchor.anchor_id}`); if (!anchor.component_mount && (!box || !anchor.coordinate_system || ["x","y","width","height"].some(key => !Number.isFinite(Number(box[key]))) || box.width <= 0 || box.height <= 0 || box.x < 0 || box.y < 0 || box.x + box.width > anchor.coordinate_system.width || box.y + box.height > anchor.coordinate_system.height)) errors.push(`Invalid geometry: ${anchor.anchor_id}`); }
  for (const placement of model.placements) if (!slotIds.has(placement.slot_id)) errors.push(`Placement references missing slot: ${placement.placement_id}`);
  return errors;
}
app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(cors(corsOptions()));
app.use(express.json({ limit: "256kb" }));
app.get("/health", (_req, res) => res.json({ status: "ok", service: "archivory-inquiry" }));
app.get("/api/authoring/structure", async (_req, res, next) => { try { res.json(await structure()); } catch (error) { next(error); } });
app.put("/api/authoring/structure", async (req, res, next) => {
  try {
    if (!Array.isArray(req.body?.slots) || !Array.isArray(req.body?.anchors)) return res.status(400).json({ error: "Slots and anchors are required." });
    const current = await structure(), proposed = { ...current, slots: req.body.slots, anchors: req.body.anchors };
    const removed = current.slots.filter(slot => !proposed.slots.some(item => item.slot_id === slot.slot_id));
    for (const slot of removed) { const refs = current.placements.filter(placement => placement.slot_id === slot.slot_id); if (refs.length) return res.status(409).json({ error: `Cannot remove ${slot.slot_id}; used by ${refs.map(ref => ref.placement_id).join(", ")}.` }); }
    const errors = structuralErrors(proposed); if (errors.length) return res.status(400).json({ error: errors.join(" ") });
    const headers = (await fs.readFile(slotsPath, "utf8")).split(/\r?\n/, 1)[0].split(",");
    const tempSlots = `${slotsPath}.tmp`, tempAnchors = `${anchorsPath}.tmp`;
    await Promise.all([fs.writeFile(tempSlots, csv(proposed.slots, headers), "utf8"), fs.writeFile(tempAnchors, JSON.stringify(proposed.anchors, null, 2) + "\n", "utf8")]);
    await Promise.all([fs.rename(tempSlots, slotsPath), fs.rename(tempAnchors, anchorsPath)]);
    res.json({ status: "saved" });
  } catch (error) { next(error); }
});
app.use("/api/inquiry", inquiryRouter);
app.use((err, req, res, _next) => {
  console.error("ArchIvory inquiry error:", { path: req.path, name: err?.name, message: err?.message });
  if (err?.message?.includes("CORS")) return res.status(403).json({ error: "Origin not allowed." });
  if (err?.status === 429) return res.status(429).json({ error: "The inquiry service is busy. Please try again shortly." });
  return res.status(500).json({ error: "The inquiry terminal could not complete that request." });
});
const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () => console.log(`ArchIvory inquiry service listening on 0.0.0.0:${port}`));
