# ArchIvory Inquiry Classification Change Report

## Scope

This report covers only the new inquiry-classification layer requested for the ArchIvory Inquiry Terminal backend.

It does **not** cover unrelated timeline, habitation-map, or room-integration work.

## Files changed

- `assets/js/archivory-inquiry-phase2/prompts/classification.md`
- `assets/js/archivory-inquiry-phase2/prompts/questioning-strategy.md`
- `assets/js/archivory-inquiry-phase2/lib/loaders.js`
- `assets/js/archivory-inquiry-phase2/lib/schemas.js`
- `assets/js/archivory-inquiry-phase2/lib/classification.js`
- `assets/js/archivory-inquiry-phase2/lib/openai-client.js`
- `assets/js/archivory-inquiry-phase2/api/inquiry.js`
- `assets/js/archivory-inquiry-phase2/tests/classification.test.js`
- `assets/js/archivory-inquiry-phase2/tests/run-classification-smoke.mjs`

## What was implemented

### 1. New prompt-layer classification framework

A dedicated prompt file was added at:

- `assets/js/archivory-inquiry-phase2/prompts/classification.md`

This file defines the three independent classification dimensions:

- `relevance`
- `answerability`
- `originality`

It also defines:

- semantic-first classification rules;
- score ranges as support, not mechanical thresholds;
- the four response bins;
- bin-specific response behavior;
- originality-driven scaffolding rules;
- the distinction between `questionAssessment` and classification;
- canonical examples aligned to the eight required tests.

### 2. Response-strategy prompt updates

The existing response-strategy prompt was updated at:

- `assets/js/archivory-inquiry-phase2/prompts/questioning-strategy.md`

Changes made:

- required the model to return a `classification` object;
- required semantic classification before scoring;
- stated that not every question should be improved;
- stated that high-originality questions should usually be answered on their own terms;
- stated that originality must not compensate for poor answerability.

### 3. Prompt loader update

The system prompt loader was updated at:

- `assets/js/archivory-inquiry-phase2/lib/loaders.js`

`loadSystemPrompt()` now includes:

- `prompts/classification.md`

in addition to the existing prompt files.

### 4. Structured-output schema extension

The backend schema was extended at:

- `assets/js/archivory-inquiry-phase2/lib/schemas.js`

Added:

- `classificationSchema`
- `responseBinSchema`
- `modelInquiryResponseSchema`
- final `inquiryResponseSchema` with deterministic `responseBin`

New required response structure:

- `classification.relevance.score`
- `classification.relevance.class`
- `classification.relevance.reason`
- `classification.answerability.score`
- `classification.answerability.class`
- `classification.answerability.reason`
- `classification.originality.score`
- `classification.originality.class`
- `classification.originality.reason`
- `responseBin`

Validation rules:

- all scores are integers;
- all scores are constrained to `0–100`;
- class values are strict enums;
- `responseBin` is a strict enum.

### 5. Deterministic response-bin computation in code

A new backend utility file was added at:

- `assets/js/archivory-inquiry-phase2/lib/classification.js`

Added functions:

- `computeResponseBin(classification)`
- `finalizeInquiryResponse(modelResponse)`
- `countWords(text)`

`responseBin` is computed only from semantic classes:

- `relevant` + `answerable` → `relevant_answerable`
- `relevant` + `not_answerable` → `relevant_not_answerable`
- `not_relevant` + `answerable` → `not_relevant_answerable`
- `not_relevant` + `not_answerable` → `not_relevant_not_answerable`

The model is **not** trusted to set `responseBin`.

### 6. Model-call flow changed

The OpenAI client was updated at:

- `assets/js/archivory-inquiry-phase2/lib/openai-client.js`

Before:

- the model response was parsed directly against the final response schema.

After:

1. the model response is parsed against `modelInquiryResponseSchema`;
2. the backend computes `responseBin` using `finalizeInquiryResponse()`;
3. the finalized response is validated against `inquiryResponseSchema`.

Additional metadata added internally:

- `reasoningEffort`
- `durationMs`

### 7. Logging added

The API route was updated at:

- `assets/js/archivory-inquiry-phase2/api/inquiry.js`

Added lightweight server-side logging of:

- `questionWordCount`
- `relevanceScore`
- `relevanceClass`
- `answerabilityScore`
- `answerabilityClass`
- `originalityScore`
- `originalityClass`
- `responseBin`
- `reasoningEffort`
- `durationMs`

Not logged:

- API keys
- full visitor questions
- full answers

### 8. Tests added

Unit tests added at:

- `assets/js/archivory-inquiry-phase2/tests/classification.test.js`

These test:

- all four `responseBin` mappings;
- deterministic finalization of `responseBin`.

A live smoke-test script was added at:

- `assets/js/archivory-inquiry-phase2/tests/run-classification-smoke.mjs`

This script sends the eight required questions to the local inquiry API and prints:

- `questionAssessment`
- `refinementNeeded`
- `strongerQuestion`
- `relevance`
- `answerability`
- `originality`
- `responseBin`
- `suggestedModule`
- answer preview

## What was intentionally not changed

The following systems were preserved:

- module IDs;
- frontend navigation;
- scoring behavior;
- timeline integration;
- habitation-map logic;
- CORS handling;
- API key handling;
- visual design of the Inquiry Terminal;
- single-call model architecture.

No additional model call was added.

## Important note about the visitor UI

The classification framework is implemented in the backend/API response, but is **not** rendered in the standard visitor UI.

That is why a visitor does not automatically see:

- `relevance`
- `answerability`
- `originality`
- `responseBin`

The frontend still renders only the existing visitor-facing fields such as:

- answer;
- analysis;
- question type;
- evidence prompt;
- stronger-question card;
- follow-ups;
- suggested module.

## Validation performed

### Unit tests

Command run:

- `npm test`

Result:

- passed

### Live smoke tests

The eight required questions were run against the local API.

Observed final classifications:

1. **What is elephant ivory made of?**
   - relevance: `relevant`
   - answerability: `answerable`
   - originality: `low`
   - responseBin: `relevant_answerable`

2. **How do we know whether this object is elephant ivory or bone?**
   - relevance: `relevant`
   - answerability: `answerable`
   - originality: `medium`
   - responseBin: `relevant_answerable`

3. **Was this specific tusk taken from an elephant killed in Kenya?**
   - relevance: `relevant`
   - answerability: `not_answerable`
   - originality: `medium`
   - responseBin: `relevant_not_answerable`

4. **Analyze the origins of the ivory lathe and compare the evidence for its development in Oman and Zanzibar.**
   - relevance: `relevant`
   - answerability: `answerable`
   - originality: `high`
   - responseBin: `relevant_answerable`

5. **Who was president of the United States in 1965?**
   - relevance: `not_relevant`
   - answerability: `answerable`
   - originality: `low`
   - responseBin: `not_relevant_answerable`

6. **What was my grandfather thinking on July 4, 1965?**
   - relevance: `not_relevant`
   - answerability: `not_answerable`
   - originality: `low`
   - responseBin: `not_relevant_not_answerable`

7. **How could isotope analysis help identify the geographic origin of elephant ivory?**
   - relevance: `relevant`
   - answerability: `answerable`
   - originality: `high`
   - responseBin: `relevant_answerable`

8. **Does the surviving evidence support the claim that Zanzibar was primarily an ivory-producing region rather than a commercial redistribution center?**
   - relevance: `relevant`
   - answerability: `answerable`
   - originality: `high`
   - responseBin: `relevant_answerable`

## Notable behavior during testing

One early live request reached an older running backend process, so the first raw response did not yet contain `classification`.

After restarting the inquiry backend, the API correctly returned:

- `classification`
- `responseBin`

for all subsequent tests.

## Notable edge case

A high-originality advanced question about the “ivory lathe” initially came back with unnecessary refinement behavior.

To reduce that behavior, the classification prompt was strengthened so that:

- if `questionAssessment` is `advanced` and originality is `high`, then `refinementNeeded` should normally be false and `strongerQuestion` should normally be null unless there is a genuine methodological defect.

Canonical examples were also added to reinforce the expected bins.

## Final status

The new inquiry-classification framework is implemented and validated in the backend.

It now:

- returns explicit relevance, answerability, and originality judgments;
- computes `responseBin` deterministically in code;
- preserves the existing API architecture;
- preserves the existing visitor-facing interface;
- supports research/logging/analytics use of scores without exposing them to normal visitors.
