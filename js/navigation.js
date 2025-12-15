document.addEventListener("click", e => {
  const t = e.target.closest("[data-screen]");
  if (!t) return;
  Navigation.loadScreen(t.getAttribute("data-screen"));
});

const Navigation = {
  async loadScreen(path){
    const app = document.getElementById("app");
    const res = await fetch("screens/" + path);
    const html = await res.text();
    app.innerHTML = html;
    if (window.screenMounted) {
      window.screenMounted();
      window.screenMounted = null;
    }
  }
};
