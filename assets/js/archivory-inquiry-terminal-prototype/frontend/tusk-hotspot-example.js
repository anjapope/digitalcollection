/* Example only.
   Your SVG code can be different; the only contract is calling:
   window.ArchIvoryInquiry.open()
*/

const tuskHotspot = document.querySelector('[data-hotspot="inquiry-tusk"]');

if (tuskHotspot) {
  tuskHotspot.setAttribute("role", "button");
  tuskHotspot.setAttribute("tabindex", "0");
  tuskHotspot.setAttribute("aria-label", "Open the Ivory Inquiry Terminal");

  const activate = () => {
    if (window.ArchIvoryInquiry) {
      window.ArchIvoryInquiry.open();
    }
  };

  tuskHotspot.addEventListener("click", activate);

  tuskHotspot.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate();
    }
  });
}
