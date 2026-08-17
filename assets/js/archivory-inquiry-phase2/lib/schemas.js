import { z } from "zod";

export const moduleIdSchema = z.enum([
  "bone-identification",
  "elephant-species",
  "proboscidean-timeline",
  "habitation-map"
]);

export const inquiryResponseSchema = z.object({
  answer: z.string().min(1).max(1800),
  questionType: z.string().min(1).max(100),
  questionAssessment: z.enum(["underdeveloped", "sufficient", "advanced"]),
  analysis: z.string().min(1).max(1200),
  refinementNeeded: z.boolean(),
  refinementReason: z.string().min(1).max(500),
  strongerQuestion: z.string().min(1).max(500).nullable(),
  followUps: z.array(z.string().min(1).max(300)).min(2).max(4),
  evidencePrompt: z.string().min(1).max(500),
  suggestedModule: moduleIdSchema.nullable(),
  suggestedModuleReason: z.string().max(500)
}).strict();
