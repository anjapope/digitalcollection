import { z } from "zod";

export const moduleIdSchema = z.enum([
  "bone-identification",
  "elephant-species",
  "proboscidean-timeline",
  "habitation-map"
]);

export const classificationSchema = z.object({
  relevance: z.object({
    score: z.number().int().min(0).max(100),
    class: z.enum(["relevant", "not_relevant"]),
    reason: z.string().min(1).max(500)
  }),
  answerability: z.object({
    score: z.number().int().min(0).max(100),
    class: z.enum(["answerable", "not_answerable"]),
    reason: z.string().min(1).max(500)
  }),
  originality: z.object({
    score: z.number().int().min(0).max(100),
    class: z.enum(["low", "medium", "high"]),
    reason: z.string().min(1).max(500)
  })
}).strict();

export const responseBinSchema = z.enum([
  "relevant_answerable",
  "relevant_not_answerable",
  "not_relevant_answerable",
  "not_relevant_not_answerable"
]);

export const modelInquiryResponseSchema = z.object({
  answer: z.string().min(1).max(1800),
  questionType: z.string().min(1).max(100),
  questionAssessment: z.enum(["underdeveloped", "sufficient", "advanced"]),
  classification: classificationSchema,
  analysis: z.string().min(1).max(1200),
  refinementNeeded: z.boolean(),
  refinementReason: z.string().min(1).max(500),
  strongerQuestion: z.string().min(1).max(500).nullable(),
  followUps: z.array(z.string().min(1).max(300)).min(2).max(4),
  evidencePrompt: z.string().min(1).max(500),
  suggestedModule: moduleIdSchema.nullable(),
  suggestedModuleReason: z.string().max(500)
}).strict();

export const inquiryResponseSchema = modelInquiryResponseSchema.extend({
  responseBin: responseBinSchema
}).strict();
