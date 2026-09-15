# Copilot Execution Instructions — Visible Relevance × Answerability UX

Implement the supplied frontend UX so the existing backend classification becomes visible to visitors inside the current ArchIvory Inquiry Terminal.

## Core hierarchy
The visitor should encounter:
1. Relevance
2. Answerability
3. Highlighted response bin
4. Originality as a separate diagnostic dimension

Do not expose raw JSON. Do not make a second API call.

## Existing backend fields
Use:
- `classification.relevance`
- `classification.answerability`
- `classification.originality`
- `responseBin`

Do not recalculate any of them in the browser.

## Install
Use:
- `frontend/classification-assessment.html`
- `frontend/classification-assessment.css`
- `frontend/classification-assessment.js`

Merge the HTML into `_includes/archivory-inquiry-terminal.html`, inside the response area and ABOVE the normal answer.

Merge/import the CSS into the existing inquiry-terminal styles.

Load/merge the JS alongside the existing inquiry-terminal JavaScript.

Do not create a second modal.

## Desired response order
YOUR QUESTION
→ INQUIRY ASSESSMENT
→ ANSWER
→ HOW YOU'RE ASKING
→ THINK LIKE A HISTORIAN
→ FOLLOW-UPS / RELATED EXHIBIT

The assessment must be hidden until a response arrives.

## 2×2 quadrant
Display:
- Relevant + Answerable
- Relevant + Not Answerable
- Not Relevant + Answerable
- Not Relevant + Not Answerable

Highlight exactly one cell using `responseBin`.

The active cell must include a textual indicator such as `Your question`; do not rely on color alone.

## Visible dimensions
Show score, visitor-friendly label, and the model-provided reason for each dimension.

Relevance labels:
- 75–100 relevant → Strongly Relevant
- 50–74 relevant → Relevant
- 25–49 not_relevant → Weakly Related
- 0–24 not_relevant → Not Relevant

Answerability:
- 75–100 answerable → Strongly Answerable
- 50–74 answerable → Answerable with Qualification
- 25–49 not_answerable → Substantial Uncertainty
- 0–24 not_answerable → Not Answerable

Originality:
- low → Foundational
- medium → Developing
- high → Generative

Originality is NOT another quadrant axis.

Never frame low originality as bad, weak, inferior, or a failing.

## Bin explanations
Use the supplied copy from the JS.

For `relevant_not_answerable`, visually emphasize the existing evidence / Think Like a Historian section.

For `not_relevant_answerable` and `not_relevant_not_answerable`, hide unnecessary stronger-question/refinement UI.

## Existing render pipeline
Inside the existing `renderResponse(response)` flow call:

```js
window.ArchIvoryClassificationUX?.render(response);
```

When a new question begins loading call:

```js
window.ArchIvoryClassificationUX?.reset();
```

This is important: no prior classification state may leak into the next question.

## UX character
This is an epistemic diagnostic instrument, not a grade.

Preserve the existing museum palette and visual language:
- parchment
- wood
- brass
- archival/museum typography

Do not introduce:
- red/green grading
- success/failure icons
- gamified good/bad question language
- neon AI styling
- generic SaaS dashboards

Classes/bin labels should be more visually important than the raw numbers.

## Do not change
Do not modify:
- backend classification rules
- response schema
- API architecture
- model
- adaptive reasoning
- scoring
- SVG room hotspot
- timeline
- habitation map
- module IDs
- CORS

This pass is frontend UX only.

## Required tests
Test sequentially, not just in isolated reloads, to catch stale state:

1. `What is elephant ivory made of?`
   Expected: Relevant + Answerable; Foundational.

2. `Was this specific tusk taken from an elephant killed in Kenya?`
   Expected: Relevant + Not Answerable; evidence section emphasized.

3. `Who was president of the United States in 1965?`
   Expected: Not Relevant + Answerable; refinement UI hidden.

4. `What was my grandfather thinking on July 4, 1965?`
   Expected: Not Relevant + Not Answerable; no speculative behavior; refinement UI hidden.

5. Advanced Zanzibar/Oman ivory-lathe question.
   Expected: Relevant + Answerable; Generative; no unnecessary refinement when `refinementNeeded=false`.

Confirm:
- one and only one quadrant cell highlights
- visible scores exactly match backend values
- reasons exactly match backend values
- originality is visually separate
- previous hidden sections restore correctly on the next question
- assessment resets during loading
- desktop and mobile layouts remain readable
- no console errors

## Report back
Report:
- files changed
- exact insertion point for the assessment HTML
- where CSS was integrated
- where `render(response)` and `reset()` are called
- results for all five tests
- any conditional UI behavior added
- any responsive/accessibility issue encountered

Do not make further behavioral or visual changes without approval.
