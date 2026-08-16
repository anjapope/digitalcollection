import { Router } from "express";
import { loadConfig, loadSystemPrompt } from "../lib/loaders.js";
import { selectKnowledge } from "../lib/knowledge-router.js";
import { generateInquiryResponse } from "../lib/openai-client.js";
import { simpleRateLimit } from "../lib/rate-limit.js";
const router = Router();
const askLimit = simpleRateLimit({ windowMs: 60000, max: 15 });
router.post("/", askLimit, async (req, res, next) => {
  try {
    const config = await loadConfig();
    const question = String(req.body?.question ?? "").trim();
    if (!question) return res.status(400).json({ error: "Please enter a question." });
    if (question.length > config.limits.questionCharacters) return res.status(400).json({ error: `Question must be ${config.limits.questionCharacters} characters or fewer.` });
    const [systemPrompt, curatedKnowledge] = await Promise.all([loadSystemPrompt(), selectKnowledge(question, config)]);
    const result = await generateInquiryResponse({ question, systemPrompt, curatedKnowledge });
    return res.json(result);
  } catch (error) { next(error); }
});
export default router;
