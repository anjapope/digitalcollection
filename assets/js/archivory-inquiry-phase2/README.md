# ArchIvory Inquiry Terminal — Phase II

This package turns the working Phase I mock terminal into a real server-backed historical inquiry engine.

## Included
- Node/Express backend for Render
- `GET /health`
- `POST /api/inquiry`
- OpenAI Responses API integration
- Structured Outputs via Zod
- editable behavior prompts
- editable Natural History knowledge files
- deterministic module-context router
- allowed-origin CORS policy
- basic request limiting
- frontend patch only; Phase I UI remains intact

## Deliberately not included yet
No vector database, transcript storage, user accounts, fine-tuning, curator dashboard, model-controlled points, or model-controlled navigation.

## Local setup

```bash
npm install
cp .env.example .env
```

Put your real OpenAI API key in `.env`. Never commit that file.

Start:

```bash
npm run dev
```

Health check:

```text
http://localhost:3000/health
```

Test inquiry:

```bash
curl -X POST http://localhost:3000/api/inquiry \
  -H "Content-Type: application/json" \
  -d '{"question":"How long have elephants existed?"}'
```

## Connect Phase I
Read `frontend-patch/inquiry-terminal-phase2-patch.js`.

For local testing, set the terminal's backend URL to:

```html
<script>
  window.ARCHIVORY_INQUIRY_API_URL = "http://localhost:3000/api/inquiry";
</script>
```

Make sure whatever origin serves the frontend is listed in `ALLOWED_ORIGINS`.

## Deploy to Render
Push this directory to GitHub and create a Render Web Service, or use `render.yaml`.

Dashboard values:
- Runtime: Node
- Build: `npm install`
- Start: `npm start`
- Health check path: `/health`

Environment variables:
- `OPENAI_API_KEY` = real secret
- `OPENAI_MODEL` = `gpt-5.6` unless you intentionally choose another compatible model
- `ALLOWED_ORIGINS` = exact allowed browser origins, comma separated

Then visit:

```text
https://YOUR-SERVICE.onrender.com/health
```

Finally place the production URL before `inquiry-terminal.js`:

```html
<script>
  window.ARCHIVORY_INQUIRY_API_URL =
    "https://YOUR-SERVICE.onrender.com/api/inquiry";
</script>
```

## Curating after deployment
Behavior is in `prompts/`. Exhibit knowledge is in `knowledge/`. Edit → commit → push → Render redeploys.

## Initial evaluation questions
1. How long have elephants existed?
2. What's the difference between bone and ivory?
3. Are African forest elephants just smaller savanna elephants?
4. Where did mammoths live?
5. Why did people want ivory?
6. How do we know this object is elephant ivory?
7. What should I ask about this tusk?
8. Who won the 1998 World Series? (should redirect toward exhibit relevance)

Evaluate factual usefulness, inquiry coaching, uncertainty, evidence awareness, module routing, brevity, and whether question refinement is genuinely useful.

## Core rule
**The model proposes; ArchIvory decides.**
