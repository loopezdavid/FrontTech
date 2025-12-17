const fileInput = document.getElementById("fileInput");
const fileLabel = document.getElementById("fileLabel");
const analyzeBtn = document.getElementById("analyzeBtn");

let selectedFile = null;

// ===== FILE SELECT =====
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (!file) return;

  if (file.type !== "application/pdf") {
    alert("Solo se permiten archivos PDF");
    return;
  }

  selectedFile = file;
  fileLabel.innerText = `✔ ${file.name}`;
  analyzeBtn.disabled = false;
});

// ===== ANALYZE =====
analyzeBtn.addEventListener("click", () => {
  if (!selectedFile) return;

  const reader = new FileReader();

  reader.onload = () => {
    // Guardamos el CV
    sessionStorage.setItem("cvFile", reader.result);

    // 👉 RUTA CORRECTA AHORA
    window.location.href = "/screens/particulares/loader.html";
  };

  reader.readAsDataURL(selectedFile);
});
