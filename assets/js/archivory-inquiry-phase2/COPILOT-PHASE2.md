# Copilot Phase II Integration Brief

## Goal
Replace the Natural History room terminal's mock response generator with the supplied Render-hosted Node/Express backend.

## Preserve Phase I
Do not redesign the terminal, SVG overlay, score system, or events.

Stable contracts:
- `window.ArchIvoryInquiry.open()`
- `archivory:award-points`
- `archivory:open-module`

Stable module IDs:
- `bone-identification`
- `elephant-species`
- `proboscidean-timeline`
- `habitation-map`

## Backend contract
`POST /api/inquiry`

Body: `{ "question": "How long have elephants existed?" }`

The backend owns the OpenAI call and secret key. It returns structured JSON matching the existing terminal renderer.

## Frontend change
Follow `frontend-patch/inquiry-terminal-phase2-patch.js`. Do not otherwise restructure the working frontend unless a real incompatibility appears.

## Security and state
- Never expose `OPENAI_API_KEY` in GitHub Pages.
- Never let model text award points.
- Never let model text execute as HTML/JavaScript.
- Keep use of `textContent` when rendering model strings.
- Only accept module IDs represented by the backend schema.
- ArchIvory decides navigation; the model only recommends it.

## Test order
1. Run backend locally.
2. Confirm `GET /health`.
3. Confirm `POST /api/inquiry` with a real API key.
4. Connect existing terminal to local backend.
5. Deploy backend to Render.
6. Replace frontend backend URL with Render URL.
7. Test from the live GitHub Pages origin.
8. Only then begin prompt/knowledge tuning.

Do not add a vector database, visitor database, authentication system, or framework migration in Phase II.
