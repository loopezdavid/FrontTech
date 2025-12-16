const API_URL = "http://localhost:8000/api/v1/analyze-cv";

export async function analyzeCV(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(API_URL, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("Error al analizar el CV");
  }

  return await response.json();
}
