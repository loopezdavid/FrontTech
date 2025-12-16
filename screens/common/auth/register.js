// screens/auth/register.js

let avatarBase64 = null;

document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const avatarInput = document.getElementById("avatarInput");
  const avatarPreview = document.getElementById("avatarPreview");
  const avatarImg = document.getElementById("avatarImg");
  const registerBtn = document.getElementById("registerBtn");
  const errorBox = document.getElementById("errorBox");

  // ===== Avatar preview =====
  avatarInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      errorBox.textContent = "El archivo debe ser una imagen";
      avatarInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      avatarBase64 = reader.result;
      avatarImg.src = avatarBase64;
      avatarPreview.style.display = "flex";
    };
    reader.readAsDataURL(file);
  });

  // ===== Registro =====
  registerBtn.addEventListener("click", async () => {
    errorBox.textContent = "";

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!name || !email || !password || !confirmPassword) {
      errorBox.textContent = "Completa todos los campos";
      return;
    }

    if (password !== confirmPassword) {
      errorBox.textContent = "Las contraseñas no coinciden";
      return;
    }

    const payload = {
      name,
      email,
      password,
      confirm_password: confirmPassword,
      avatar: avatarBase64
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        errorBox.textContent = data.detail || "Error en el registro";
        return;
      }

      // Registro exitoso → ir a login
      window.location.href = "login.html";

    } catch (err) {
      errorBox.textContent = "No se pudo conectar con el servidor";
    }
  });
});
