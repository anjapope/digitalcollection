# ArchIvory Natural History Room — Inquiry Terminal Prototype

This package is the first implementation shell for the tusk-based **Ivory Inquiry Terminal**.

The prototype is deliberately split into layers so ArchIvory can later change the terminal's
behavior, historical-method rules, exhibit knowledge, and scoring without rewriting the core UI.

## What is included

- `frontend/inquiry-terminal.html`
  - Terminal overlay markup.
  - Designed to be inserted once into the Natural History room page.
- `frontend/inquiry-terminal.css`
  - Museum-workstation visual theme inspired by the current ArchIvory room aesthetic.
- `frontend/inquiry-terminal.js`
  - Opens/closes the terminal.
  - Accepts visitor questions.
  - Uses mock structured responses for now.
  - Emits scoring and module-navigation events for the host exhibit.
- `frontend/tusk-hotspot-example.js`
  - Shows how your SVG overlay can call the terminal without coupling the SVG code to the UI.
- `backend/api/ask-question.example.js`
  - Future server endpoint contract. It is intentionally not active in the prototype.
- `backend/prompts/*.md`
  - Editable agent-behavior files.
- `backend/knowledge/*.md`
  - Starter content files corresponding to Natural History modules.
- `backend/config/inquiry-config.json`
  - Scores, feature switches, module IDs, and UI behavior.
- `response-schema.example.json`
  - The structured response shape the frontend expects.

## Prototype workflow

1. Add the HTML fragment to the Natural History room page.
2. Load the CSS.
3. Load `inquiry-terminal.js`.
4. Wire your SVG tusk hotspot to:

   ```js
   window.ArchIvoryInquiry.open();
   ```

5. Ask a question.
6. The terminal returns a mock response and emits an ArchIvory scoring event.

No API key or backend is needed at this stage.

## Integration events

The prototype avoids directly manipulating the rest of ArchIvory. Instead it emits browser events.

### Score event

```js
window.addEventListener("archivory:award-points", (event) => {
  console.log(event.detail);
});
```

Example payload:

```json
{
  "source": "inquiry-terminal",
  "action": "ask-question",
  "points": 15
}
```

### Suggested-module event

```js
window.addEventListener("archivory:open-module", (event) => {
  console.log(event.detail.moduleId);
});
```

Known Natural History module IDs:

- `bone-identification`
- `elephant-species`
- `proboscidean-timeline`
- `habitation-map`

This lets the host exhibit decide whether to open, highlight, scroll to, or otherwise activate a module.

## Recommended first test

Do not connect an AI model yet. First test:

- tusk click → terminal opens;
- modal sizing on desktop/tablet;
- close button and Escape key;
- question submission;
- response readability;
- point notification;
- suggested-module button;
- keyboard focus behavior.

Once the interaction feels right, replace the mock response function in
`frontend/inquiry-terminal.js` with a fetch call to the backend endpoint.

## Architecture

The intended mature structure is:

```text
Engine
  |
  +-- UI + API transport
  |
Behavior
  |
  +-- identity.md
  +-- historical-method.md
  +-- questioning-strategy.md
  +-- tone.md
  |
Knowledge
  |
  +-- elephant-species.md
  +-- bone-identification.md
  +-- proboscidean-evolution.md
  +-- paleogeography.md
  |
Configuration
  |
  +-- points
  +-- feature switches
  +-- module IDs
```

The model may propose a destination, question refinement, or follow-up. The ArchIvory application
remains responsible for navigation, scoring, and state.

**Rule: the model proposes; ArchIvory decides.**
