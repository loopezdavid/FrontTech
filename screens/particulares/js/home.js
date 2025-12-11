import { predictPdf } from "./api.js";

const form = document.getElementById("cv-form");
const inputFile = document.getElementById("cv-file");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = inputFile.files[0];
  if (!file) return alert("Selecciona un CV");

  try {
    localStorage.setItem("cv_status", "loading");

    const result = await predictPdf(file);

    localStorage.setItem("cv_result", JSON.stringify(result));
    window.location.href = "results.html";
  } catch (err) {
    alert("Error analizando el CV");
    console.error(err);
  }
});
