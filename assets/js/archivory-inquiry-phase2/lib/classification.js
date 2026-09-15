import { inquiryResponseSchema } from "./schemas.js";

export function computeResponseBin(classification) {
  const relevanceClass = classification?.relevance?.class;
  const answerabilityClass = classification?.answerability?.class;

  if (relevanceClass === "relevant" && answerabilityClass === "answerable") {
    return "relevant_answerable";
  }
  if (relevanceClass === "relevant" && answerabilityClass === "not_answerable") {
    return "relevant_not_answerable";
  }
  if (relevanceClass === "not_relevant" && answerabilityClass === "answerable") {
    return "not_relevant_answerable";
  }
  if (relevanceClass === "not_relevant" && answerabilityClass === "not_answerable") {
    return "not_relevant_not_answerable";
  }

  throw new Error("Unable to compute response bin from classification.");
}

export function finalizeInquiryResponse(modelResponse) {
  const responseBin = computeResponseBin(modelResponse.classification);
  return inquiryResponseSchema.parse({
    ...modelResponse,
    responseBin
  });
}

export function countWords(text) {
  return String(text ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}
