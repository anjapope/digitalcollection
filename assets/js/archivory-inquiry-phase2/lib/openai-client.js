import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { finalizeInquiryResponse } from "./classification.js";
import { modelInquiryResponseSchema } from "./schemas.js";
let client;
function getClient() {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured.");
  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}
export async function generateInquiryResponse({ question, systemPrompt, curatedKnowledge }) {
  const reasoningEffort = process.env.OPENAI_REASONING_EFFORT || "low";
  const startedAt = Date.now();
  const response = await getClient().responses.parse({
    model: process.env.OPENAI_MODEL || "gpt-5.6-terra",
    reasoning: {
      effort: reasoningEffort
    },
    input: [
      { role: "system", content: systemPrompt },
      { role: "system", content: `CURATED ARCHIVORY KNOWLEDGE\n\n${curatedKnowledge || "No module-specific curator context was selected for this question."}` },
      { role: "user", content: question }
    ],
    text: { format: zodTextFormat(modelInquiryResponseSchema, "archivory_inquiry_response") }
  });
  if (!response.output_parsed) throw new Error("The model did not return a parsed inquiry response.");
  const parsed = modelInquiryResponseSchema.parse(response.output_parsed);
  return {
    result: finalizeInquiryResponse(parsed),
    meta: {
      reasoningEffort,
      durationMs: Date.now() - startedAt
    }
  };
}
