import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { inquiryResponseSchema } from "./schemas.js";
let client;
function getClient() {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured.");
  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}
export async function generateInquiryResponse({ question, systemPrompt, curatedKnowledge }) {
  const response = await getClient().responses.parse({
    model: process.env.OPENAI_MODEL || "gpt-5.6",
    input: [
      { role: "system", content: systemPrompt },
      { role: "system", content: `CURATED ARCHIVORY KNOWLEDGE\n\n${curatedKnowledge || "No module-specific curator context was selected for this question."}` },
      { role: "user", content: question }
    ],
    text: { format: zodTextFormat(inquiryResponseSchema, "archivory_inquiry_response") }
  });
  if (!response.output_parsed) throw new Error("The model did not return a parsed inquiry response.");
  return inquiryResponseSchema.parse(response.output_parsed);
}
