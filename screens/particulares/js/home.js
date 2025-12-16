function initHome() {
  // ================= ELEMENTS =================
  var drop = document.getElementById("dropzone");
  var fileInput = document.getElementById("fileInput");
  var uploaderTitle = document.getElementById("uploaderTitle");
  var dzGlow = document.getElementById("dzGlow");
  var uploadFill = document.getElementById("uploadFill");
  var analyzeBtn = document.getElementById("analyzeBtn");
  var pasteBtn = document.getElementById("pasteBtn");
  var demoBtn = document.getElementById("demoBtn");
  var pasteModal = document.getElementById("pasteModal");
  var pasteConfirm = document.getElementById("pasteConfirm");
  var pasteArea = document.getElementById("pasteArea");
  var recentList = document.getElementById("recentList");
  var clearRecent = document.getElementById("clearRecent");
  var miniCanvas = document.getElementById("miniCanvas");

  // 🛑 GUARD CLAUSE
  if (!drop || !fileInput || !miniCanvas) {
    console.warn("home.js: elementos principales no encontrados. Script detenido.");
    return;
  }

  // ================= UI SOUND =================
  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  function uiClick(p) {
    p = p || 0.012;
    var o = audioCtx.createOscillator();
    var g = audioCtx.createGain();
    o.type = "sine";
    o.frequency.value = 800;
    g.gain.value = p;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
    o.stop(audioCtx.currentTime + 0.15);
  }

  // ================= DROPZONE =================
  var selectedFile = null;

  function handleFile(file) {
    if (!file) return;
    selectedFile = file;
    uploaderTitle.textContent =
      "Archivo: " + file.name + " · " + ((file.size / 1024) | 0) + " KB";
    uiClick(0.01);
  }

  drop.addEventListener("mousemove", function (e) {
    var r = drop.getBoundingClientRect();
    dzGlow.style.left = e.clientX - r.left + "px";
    dzGlow.style.top = e.clientY - r.top + "px";
    dzGlow.style.background =
      "radial-gradient(circle at center, rgba(110,241,212,0.14), rgba(63,183,255,0.06) 40%, transparent 70%)";
    drop.classList.add("active");
  });

  drop.addEventListener("mouseleave", function () {
    drop.classList.remove("active");
  });

  drop.addEventListener("click", function () {
    fileInput.click();
  });

  drop.addEventListener("dragover", function (e) {
    e.preventDefault();
    drop.classList.add("active");
  });

  drop.addEventListener("dragleave", function () {
    drop.classList.remove("active");
  });

  drop.addEventListener("drop", function (e) {
    e.preventDefault();
    drop.classList.remove("active");
    handleFile(e.dataTransfer.files[0]);
  });

  fileInput.addEventListener("change", function (e) {
    handleFile(e.target.files[0]);
  });

  // ================= MINI CHART =================
  function drawMiniChart() {
    var ctx = miniCanvas.getContext("2d");
    var w = miniCanvas.width;
    var h = miniCanvas.height;

    var analysis = JSON.parse(localStorage.getItem("analysis_result") || "null");
    var backend = 0.6,
      frontend = 0.48,
      devops = 0.22;

    if (analysis && analysis.distribution) {
      backend = analysis.distribution.backend || backend;
      frontend = analysis.distribution.frontend || frontend;
      devops = analysis.distribution.devops || devops;
    }

    var data = [backend, frontend, devops];
    var labels = ["Backend", "Frontend", "DevOps"];

    ctx.clearRect(0, 0, w, h);
    var barW = (w - 40) / data.length;

    for (var i = 0; i < data.length; i++) {
      var v = data[i];
      var x = 20 + i * (barW + 10);
      var barH = Math.max(6, v * (h - 30));

      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.fillRect(x, 10, barW, h - 30);

      var grad = ctx.createLinearGradient(x, 0, x + barW, 0);
      grad.addColorStop(0, "rgba(110,241,212,0.9)");
      grad.addColorStop(1, "rgba(63,183,255,0.95)");
      ctx.fillStyle = grad;
      ctx.fillRect(x, h - 20 - barH, barW, barH);

      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "11px Inter, system-ui";
      ctx.fillText(labels[i], x, h - 2);
    }
  }

  drawMiniChart();
  window.addEventListener("resize", drawMiniChart);

  // ================= ANALYZE =================
  analyzeBtn.addEventListener("click", function () {
    if (!selectedFile && !localStorage.getItem("cv_text")) {
      if (!confirm("No has subido archivo. ¿Usar demo?")) return;
      demoFlow();
      return;
    }

    uiClick();

    if (selectedFile) {
      var reader = new FileReader();
      reader.onprogress = function (ev) {
        if (ev.lengthComputable) {
          var pct = Math.round((ev.loaded / ev.total) * 100);
          uploadFill.style.width = pct + "%";
        }
      };
      reader.onload = function () {
        try {
          localStorage.setItem("cv_file_b64", reader.result);
        } catch (e) {
          console.warn("Archivo demasiado grande para localStorage");
        }
        localStorage.setItem("cv_file_name", selectedFile.name);
        window.location.href = "../common/loader.html";
      };
      reader.readAsDataURL(selectedFile);
      return;
    }

    window.location.href = "../common/loader.html";
  });

  function demoFlow() {
    localStorage.setItem(
      "cv_text",
      "Demo: Desarrollador Full Stack con 6 años de experiencia..."
    );
    localStorage.setItem("cv_file_name", "CV_demo.pdf");
    uiClick();
    window.location.href = "../common/loader.html";
  }

  if (demoBtn) demoBtn.addEventListener("click", demoFlow);
}

// 🚀 Ejecutar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", initHome);
