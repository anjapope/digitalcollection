import test from "node:test";
import assert from "node:assert/strict";
import { computeResponseBin, finalizeInquiryResponse } from "../lib/classification.js";

const baseResponse = {
  answer: "Test answer.",
  questionType: "descriptive",
  questionAssessment: "sufficient",
  analysis: "Test analysis.",
  refinementNeeded: false,
  refinementReason: "The question is already workable.",
  strongerQuestion: null,
  followUps: ["What evidence supports that?", "How might the answer change over time?"],
  evidencePrompt: "What evidence would confirm the claim?",
  suggestedModule: null,
  suggestedModuleReason: ""
};

test("computeResponseBin maps relevant + answerable", () => {
  assert.equal(computeResponseBin({ relevance: { class: "relevant" }, answerability: { class: "answerable" } }), "relevant_answerable");
});

test("computeResponseBin maps relevant + not_answerable", () => {
  assert.equal(computeResponseBin({ relevance: { class: "relevant" }, answerability: { class: "not_answerable" } }), "relevant_not_answerable");
});

test("computeResponseBin maps not_relevant + answerable", () => {
  assert.equal(computeResponseBin({ relevance: { class: "not_relevant" }, answerability: { class: "answerable" } }), "not_relevant_answerable");
});

test("computeResponseBin maps not_relevant + not_answerable", () => {
  assert.equal(computeResponseBin({ relevance: { class: "not_relevant" }, answerability: { class: "not_answerable" } }), "not_relevant_not_answerable");
});

test("finalizeInquiryResponse computes responseBin deterministically", () => {
  const result = finalizeInquiryResponse({
    ...baseResponse,
    classification: {
      relevance: { score: 88, class: "relevant", reason: "Directly concerns ivory identification." },
      answerability: { score: 79, class: "answerable", reason: "The question can be answered with established material criteria." },
      originality: { score: 41, class: "medium", reason: "It asks for method, not only a definition." }
    }
  });

  assert.equal(result.responseBin, "relevant_answerable");
  assert.equal(result.classification.originality.class, "medium");
});
