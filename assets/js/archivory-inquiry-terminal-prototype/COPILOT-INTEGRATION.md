# Copilot Integration Instructions

## Objective

Integrate the supplied ArchIvory Inquiry Terminal prototype into the Natural History room without
redesigning the existing exhibit architecture.

## Non-negotiable constraints

1. Do not rewrite or replace the existing SVG-overlay system.
2. The tusk hotspot must open the terminal by calling:
   `window.ArchIvoryInquiry.open()`
3. Do not put API credentials in frontend code.
4. Do not hard-code navigation behavior into AI response text.
5. Module navigation must use the event:
   `archivory:open-module`
6. Scoring must use the event:
   `archivory:award-points`
7. Keep these stable module IDs:
   - `bone-identification`
   - `elephant-species`
   - `proboscidean-timeline`
   - `habitation-map`
8. Preserve keyboard accessibility:
   - hotspot reachable with Tab
   - Enter/Space opens terminal
   - Escape closes terminal
   - focus returns to the hotspot after closing
9. Preserve the current ArchIvory visual language. Do not convert the interface into a modern SaaS,
   neon, glassmorphism, or generic chatbot design.

## First integration milestone

Do only the following:

- add the terminal HTML;
- load the CSS and JavaScript;
- wire the tusk hotspot;
- confirm opening and closing;
- confirm a mock question returns a response;
- confirm the two custom events fire.

Do not connect an external AI API until this milestone is working.

## Host application listeners

The host ArchIvory code should listen for:

```js
window.addEventListener("archivory:award-points", (event) => {
  // Integrate with the existing score state here.
  console.log("POINT EVENT", event.detail);
});

window.addEventListener("archivory:open-module", (event) => {
  // Map moduleId to the existing room-module activation logic.
  console.log("MODULE EVENT", event.detail);
});
```

## Later AI integration

When the backend is added, replace only `getMockResponse()` in `inquiry-terminal.js` with a call like:

```js
const response = await fetch("/api/inquiry", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ question })
});

if (!response.ok) throw new Error("Inquiry request failed");
return await response.json();
```

Do not otherwise restructure the frontend unless necessary.
