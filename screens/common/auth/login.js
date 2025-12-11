// screens/auth/login.js

document.addEventListener("DOMContentLoaded", () => {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginBtn = document.getElementById("loginBtn");
  const errorBox = document.getElementById("errorBox");

  loginBtn.addEventListener("click", async () => {
    errorBox.textContent = "";

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      errorBox.textContent = "Completa todos los campos";
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        errorBox.textContent = data.detail || "Credenciales incorrectas";
        return;
      }

      // Guardar sesión (stateless, frontend-only)
      localStorage.setItem("auth_user", JSON.stringify(data.user));

      // Redirección base (puedes afinarla luego)
      window.location.href = "../particulares/home.html";

    } catch (err) {
      errorBox.textContent = "No se pudo conectar con el servidor";
    }
  });
});
