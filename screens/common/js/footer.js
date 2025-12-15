(async () => {
  // Detect the correct path for footer.html depending on screen depth
  const paths = [
    "../common/components/footer.html",       // from particulares/ or empresas/
    "./common/components/footer.html",        // from common/
    "../../common/components/footer.html"     // from nested screens if needed
  ];

  let footerHTML = null;

  for (const p of paths) {
    try {
      const res = await fetch(p);
      if (res.ok) {
        footerHTML = await res.text();
        break;
      }
    } catch (e) {}
  }

  if (!footerHTML) {
    console.warn("Footer could not load from expected paths.");
    return;
  }

  // Inject into placeholder
  const container = document.getElementById("global-footer");
  if (container) {
    container.innerHTML = footerHTML;
    document.getElementById("footer-year").textContent = new Date().getFullYear();
  }
})();
