// Future endpoint contract only.
// Adapt this to your backend runtime (Render/Express/serverless/etc.).
//
// IMPORTANT:
// - Keep API credentials server-side.
// - Validate the model output against the response schema.
// - Load prompt/knowledge files server-side.
// - Never allow model output to directly mutate score or navigation state.

export async function askQuestion(req, res) {
  const question = String(req.body?.question || "").trim();

  if (!question || question.length > 500) {
    return res.status(400).json({ error: "Invalid question." });
  }

  // TODO:
  // 1. Load config and prompt files.
  // 2. Select relevant knowledge context.
  // 3. Send question + instructions to the model.
  // 4. Require structured output matching response-schema.example.json.
  // 5. Validate allowed suggestedModule IDs.
  // 6. Return only sanitized structured data.

  return res.status(501).json({
    error: "AI backend not connected in prototype."
  });
}
