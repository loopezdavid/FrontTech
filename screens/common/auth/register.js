document.addEventListener("DOMContentLoaded", () => {
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const registerBtn = document.getElementById("registerBtn");
  const errorBox = document.getElementById("errorBox");

  // 🔹 El rol se define desde la pantalla común (particular / empresa)
  // Se asume que ya está guardado en localStorage como "mode"
  const role = localStorage.getItem("mode");

  if (!role || !["particular", "empresa"].includes(role)) {
    errorBox.textContent = "Rol de usuario no definido. Vuelve a seleccionar el tipo de cuenta.";
    registerBtn.disabled = true;
    return;
  }

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
      role: role
    };

    try {
      const res = await fetch("http://127.0.0.1:8001/api/v1/auth/register", {
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

      // Registro exitoso → limpiar rol temporal y redirigir a login
      localStorage.removeItem("mode");
      window.location.href = "login.html";

    } catch (err) {
      errorBox.textContent = "No se pudo conectar con el servidor";
    }
  });
});
