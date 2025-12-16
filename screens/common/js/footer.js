// footer.js - robust version

document.addEventListener("DOMContentLoaded", () => {
  const footerContainer = document.getElementById("global-footer");
  if (!footerContainer) return;

  // Ruta ABSOLUTA desde la raíz del servidor
  const FOOTER_PATH = "/screens/common/components/footer.html";

  fetch(FOOTER_PATH)
    .then(res => {
      if (!res.ok) {
        throw new Error(`No se pudo cargar footer: ${res.status}`);
      }
      return res.text();
    })
    .then(html => {
      footerContainer.innerHTML = html;
    })
    .catch(err => {
      console.error("Error cargando footer:", err);
    });
});
