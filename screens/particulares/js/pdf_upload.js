document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById("analyzeBtn");
  analyzeBtn.addEventListener("click", goToLoader);
});

function goToLoader() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Selecciona un PDF");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    sessionStorage.setItem("cvFile", reader.result);
    window.location.href = "/screens/particulares/loader.html";
  };
  reader.readAsDataURL(file);
}
