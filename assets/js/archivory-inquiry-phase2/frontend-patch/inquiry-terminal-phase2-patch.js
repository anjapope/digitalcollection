/* PHASE II PATCH FOR THE EXISTING inquiry-terminal.js

Add near CONFIG:

const INQUIRY_API_URL =
  window.ARCHIVORY_INQUIRY_API_URL ||
  "https://YOUR-RENDER-SERVICE.onrender.com/api/inquiry";

Replace getMockResponse(question) with the function below, then change the submit handler from
getMockResponse(question) to getInquiryResponse(question).
*/
async function getInquiryResponse(question) {
  const response = await fetch(INQUIRY_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question })
  });
  let payload = null;
  try { payload = await response.json(); } catch {}
  if (!response.ok) throw new Error(payload?.error || `Inquiry request failed (${response.status}).`);
  return payload;
}
