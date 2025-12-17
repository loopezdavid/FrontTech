document.addEventListener("DOMContentLoaded", () => {
  console.log("pdf_upload.js cargado");

  const uploadBtn = document.getElementById("uploadBtn");
  if (uploadBtn) {
    uploadBtn.addEventListener("click", uploadPdf);
  }

  loadHistory();
});

async function uploadPdf() {
  const fileInput = document.getElementById("pdfInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Selecciona un PDF");
    return;
  }

  const userId = localStorage.getItem("user_id");
  if (!userId) {
    alert("No estás logueado");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(
      `http://127.0.0.1:8000/api/v1/pdf/upload?user_id=${userId}`,
      {
        method: "POST",
        body: formData
      }
    );

    const data = await res.json();
    alert(data.message);

    fileInput.value = "";
    loadHistory();
  } catch (err) {
    console.error("Error subiendo PDF:", err);
    alert("Error al subir el PDF");
  }
}

async function loadHistory() {
  const userId = localStorage.getItem("user_id");
  if (!userId) return;

  try {
    const res = await fetch(
      `http://127.0.0.1:8000/api/v1/pdf/history/${userId}`
    );

    const data = await res.json();
    const container = document.getElementById("pdfHistory");
    container.innerHTML = "";

    if (!data.pdfs || data.pdfs.length === 0) {
      container.innerHTML = "<p>No has subido ningún CV aún.</p>";
      return;
    }

    data.pdfs.forEach(pdf => {
      const div = document.createElement("div");
      div.className = "pdf-item";

      div.innerHTML = `
        <span>${pdf.filename}</span>
        <span>${pdf.processed ? "Procesado" : "Pendiente"}</span>
        <button data-id="${pdf.idpdf}">Eliminar</button>
      `;

      div.querySelector("button").addEventListener("click", () => {
        deletePdf(pdf.idpdf);
      });

      container.appendChild(div);
    });
  } catch (err) {
    console.error("Error cargando historial:", err);
  }
}

async function deletePdf(pdfId) {
  const userId = localStorage.getItem("user_id");

  if (!confirm("¿Seguro que quieres borrar este PDF?")) return;

  try {
    const res = await fetch(
      `http://127.0.0.1:8000/api/v1/pdf/delete/${pdfId}?user_id=${userId}`,
      {
        method: "DELETE"
      }
    );

    const data = await res.json();
    alert(data.message);
    loadHistory();
  } catch (err) {
    console.error("Error borrando PDF:", err);
    alert("Error al borrar el PDF");
  }
}
