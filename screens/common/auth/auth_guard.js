// auth_guard.js

(function () {
  const PUBLIC_PAGES = [
    "/screens/auth/login.html",
    "/screens/auth/register.html",
    "/screens/common/",
    "/screens/common/index.html"
  ];

  const currentPath = window.location.pathname;

  // Si es página pública, no hacemos nada
  if (PUBLIC_PAGES.some(p => currentPath.endsWith(p))) {
    return;
  }

  const raw = localStorage.getItem("auth_user");
  if (!raw) {
    window.location.href = "../common/";
    return;
  }

  try {
    window.AUTH_USER = JSON.parse(raw);
  } catch (e) {
    localStorage.removeItem("auth_user");
    window.location.href = "../common/";
  }
})();

function logout() {
  localStorage.removeItem("auth_user");
  window.location.href = "../common/";
}
