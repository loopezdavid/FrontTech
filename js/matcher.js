// =============================
//   CONFIG
// =============================
const API_PDF = "http://127.0.0.1:8000/predict_pdf";
const API_SENIORITY = "http://127.0.0.1:8000/predict_seniority";

let selectedFile = null;
let currentResult = null;

// =============================
//   ELEMENTOS
// =============================
const fileinput = document.getElementById('fileinput');
const uploader = document.getElementById('uploader');
const sendBtn = document.getElementById('sendBtn');
const extracted = document.getElementById('extracted');
const downloadJson = document.getElementById('downloadJson');
const clearBtn = document.getElementById('clearBtn');

const predMain = document.getElementById('predMain');
const metaFilename = document.getElementById('metaFilename');
const topList = document.getElementById('topList');
const probTableBody = document.querySelector('#probTable tbody');
const top3mini = document.getElementById('top3mini');

const fmtPct = v => (v * 100).toFixed(1) + '%';

function escapeHtml(s) {
  return String(s||'').replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[c]);
}

// =============================
//   DRAG & DROP
// =============================
uploader.addEventListener('click', () => fileinput.click());

['dragenter','dragover'].forEach(ev =>
  uploader.addEventListener(ev, e => {
    e.preventDefault();
    e.stopPropagation();
    uploader.classList.add('drag');
  })
);

['dragleave','drop'].forEach(ev =>
  uploader.addEventListener(ev, e => {
    e.preventDefault();
    e.stopPropagation();
    uploader.classList.remove('drag');
  })
);

uploader.addEventListener('drop', e => {
  const f = e.dataTransfer.files && e.dataTransfer.files[0];
  if (f) handleFileSelected(f);
});

fileinput.addEventListener('change', e => {
  const f = e.target.files && e.target.files[0];
  if (f && f.type === 'application/pdf') handleFileSelected(f);
  else alert('Solo PDF permitido.');
});

// =============================
//   MANEJO DE ARCHIVO
// =============================
function handleFileSelected(file) {
  selectedFile = file;
  uploader.querySelector('strong').textContent = file.name;
  predMain.textContent = 'Archivo listo para enviar';
  extracted.value = '';
  metaFilename.textContent = '';
  currentResult = null;
}

// =============================
//   ENVIAR PDF + SENIORITY
// =============================
sendBtn.addEventListener('click', async () => {
  if (!selectedFile) return alert('Selecciona un archivo.');

  predMain.textContent = 'Procesando…';
  sendBtn.disabled = true;

  try {
    // ------- 1) ENVIAR PDF A /predict_pdf -------
    const fd = new FormData();
    fd.append('file', selectedFile, selectedFile.name);

    const res = await fetch(API_PDF, { method: 'POST', body: fd });
    if (!res.ok) throw new Error('HTTP ' + res.status);

    const data = await res.json();
    currentResult = data;

    extracted.value = data.texto_extraido || data.text || '';
    metaFilename.textContent = data.filename || selectedFile.name;

    // Render normal
    renderTop3(data.top3 || []);
    renderTable(data.probabilidades || {});
    if (data.skills) localStorage.setItem('skills_detected', JSON.stringify(data.skills));

    // ------- 2) PREDICCIÓN DE SENIORITY -------
    let seniority = "—";
    try {
      const resSen = await fetch(API_SENIORITY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cv_text: extracted.value })
      });

      const dataSen = await resSen.json();
      seniority = dataSen.seniority || "—";
      localStorage.setItem("seniority_detected", seniority);


    } catch (err) {
      console.error("Error SENIORITY:", err);
    }

    // ------- 3) MOSTRAR RESULTADO FINAL -------
    predMain.textContent = `${data.prediccion} — Nivel: ${seniority}`;

  } catch (e) {
    console.error(e);
    alert('Error: ' + (e.message || e));
    predMain.textContent = 'Error';
  } finally {
    sendBtn.disabled = false;
  }
});

// =============================
//   DESCARGAR RESULTADO JSON
// =============================
downloadJson.addEventListener('click', () => {
  if (!currentResult) return alert('Nada para descargar');
  const blob = new Blob([JSON.stringify(currentResult, null, 2)], { type:'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (currentResult.filename || 'resultado') + '.json';
  a.click();
});

// =============================
//   LIMPIAR
// =============================
clearBtn.addEventListener('click', () => {
  selectedFile = null;
  extracted.value = '';
  predMain.textContent = '— Esperando archivo —';
  topList.innerHTML = '';
  probTableBody.innerHTML = '';
  top3mini.innerHTML = '';
  uploader.querySelector('strong').textContent = 'Haz clic o arrastra tu archivo';
  localStorage.removeItem('skills_detected');
});

// =============================
//   RENDER TOP3
// =============================
function renderTop3(arr) {
  topList.innerHTML = '';
  top3mini.innerHTML = '';
  if (!arr.length) {
    topList.innerHTML = '<div class="muted">Sin predicciones</div>';
    return;
  }
  arr.forEach(item => {
    const pct = ((item.prob||0)*100).toFixed(1)+'%';
    top3mini.innerHTML += `${escapeHtml(item.job_title)} — ${pct}<br/>`;
    const el = document.createElement('div');
    el.className = 'top3-card';
    el.innerHTML = `
      <div class="t-left">
        <div class="t-title">${escapeHtml(item.job_title)}</div>
        <div class="t-sub muted">${pct}</div>
      </div>
      <div class="t-bar"><div class="bar" style="width:${(item.prob||0)*100}%"></div></div>
    `;
    topList.appendChild(el);
  });
}

// =============================
//   RENDER TABLA DE PROBABILIDADES
// =============================
function renderTable(obj) {
  const entries = Object.entries(obj).sort((a,b)=>b[1]-a[1]);
  probTableBody.innerHTML = '';
  entries.forEach(([k,v]) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${escapeHtml(k)}</td><td style="text-align:right">${fmtPct(v)}</td>`;
    probTableBody.appendChild(tr);
  });
}

// =============================
//   EFECTO VISUAL
// =============================
function highlightBest() {
  const first = document.querySelector('.top3-card');
  if (first) {
    first.animate(
      [{ transform: 'scale(1)' }, { transform: 'scale(1.03)' }],
      { duration: 220, fill: 'forwards' }
    );
  }
}
