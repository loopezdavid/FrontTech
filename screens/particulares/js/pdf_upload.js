document.addEventListener("DOMContentLoaded", () => {
  console.log("pdf_upload.js cargado");

  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");
  const analyzeBtn = document.getElementById("analyzeBtn");

  // Click en dropzone abre el input real
  dropzone.addEventListener("click", () => fileInput.click());

  // Drag & drop
  dropzone.addEventListener("dragover", e => {
    e.preventDefault();
    dropzone.style.borderColor = "#6ef1d4";
  });

  dropzone.addEventListener("dragleave", () => {
    dropzone.style.borderColor = "";
  });

  dropzone.addEventListener("drop", e => {
    e.preventDefault();
    dropzone.style.borderColor = "";
    if (e.dataTransfer.files.length > 0) {
      fileInput.files = e.dataTransfer.files;
    }
  });

  analyzeBtn.addEventListener("click", uploadPdf);

  loadHistory();
});

async function uploadPdf() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Selecciona un CV en PDF");
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
    console.error(err);
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
      container.innerHTML = "<p class='muted'>Aún no has subido CVs.</p>";
      return;
    }

    data.pdfs.forEach(pdf => {
      const div = document.createElement("div");
      div.className = "recent-item";

      div.innerHTML = `
        <span>${pdf.filename}</span>
        <button class="btn" style="padding:6px 10px"
          data-id="${pdf.idpdf}">Eliminar</button>
      `;

      div.querySelector("button").addEventListener("click", () => {
        deletePdf(pdf.idpdf);
      });

      container.appendChild(div);
    });
  } catch (err) {
    console.error("Error cargando historial", err);
  }
}

async function deletePdf(pdfId) {
  const userId = localStorage.getItem("user_id");
  if (!confirm("¿Eliminar este CV?")) return;

  try {
    const res = await fetch(
      `http://127.0.0.1:8000/api/v1/pdf/delete/${pdfId}?user_id=${userId}`,
      { method: "DELETE" }
    );

    const data = await res.json();
    alert(data.message);
    loadHistory();
  } catch (err) {
    console.error("Error borrando PDF", err);
  }
}
