// home.js - enhanced v2
(()=> {
  // elements
  const drop = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const uploaderTitle = document.getElementById('uploaderTitle');
  const dzGlow = document.getElementById('dzGlow');
  const uploadFill = document.getElementById('uploadFill');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const pasteBtn = document.getElementById('pasteBtn');
  const demoBtn = document.getElementById('demoBtn');
  const pasteModal = document.getElementById('pasteModal');
  const pasteConfirm = document.getElementById('pasteConfirm');
  const pasteArea = document.getElementById('pasteArea');
  const recentList = document.getElementById('recentList');
  const clearRecent = document.getElementById('clearRecent');
  const miniCanvas = document.getElementById('miniCanvas');

  // small WebAudio for UI feedback (no external files)
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  function uiClick(p=0.012){
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.value = 800;
    g.gain.value = p;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
    o.stop(audioCtx.currentTime + 0.15);
  }

  // reactive glow effect
  drop.addEventListener('mousemove', (e)=>{
    const r = drop.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    dzGlow.style.left = `${x}px`;
    dzGlow.style.top = `${y}px`;
    dzGlow.style.background = `radial-gradient(circle at center, rgba(110,241,212,0.14), rgba(63,183,255,0.06) 40%, transparent 70%)`;
    drop.classList.add('active');
  });
  drop.addEventListener('mouseleave', ()=> drop.classList.remove('active'));

  // file handling
  let selectedFile = null;
  function handleFile(f){
    if(!f) return;
    selectedFile = f;
    uploaderTitle.textContent = `Archivo: ${f.name} · ${(f.size/1024|0)} KB`;
    uiClick(0.01);
  }
  drop.addEventListener('click', ()=> fileInput.click());
  drop.addEventListener('dragover', e=> { e.preventDefault(); drop.classList.add('active'); });
  drop.addEventListener('dragleave', e=> { drop.classList.remove('active'); });
  drop.addEventListener('drop', e=>{ e.preventDefault(); drop.classList.remove('active'); handleFile(e.dataTransfer.files[0]); });
  fileInput.addEventListener('change', e=> handleFile(e.target.files[0]));

  // mini chart draw (simple bars animated)
  function drawMiniChart(){
    const ctx = miniCanvas.getContext('2d');
    const w = miniCanvas.width;
    const h = miniCanvas.height;
    // sample data - if analysis exists, use distribution
    const analysis = JSON.parse(localStorage.getItem('analysis_result') || 'null');
    let backend = 0.6, frontend = 0.48, devops = 0.22;
    if(analysis && analysis.distribution){
      backend = analysis.distribution.backend || backend;
      frontend = analysis.distribution.frontend || frontend;
      devops = analysis.distribution.devops || devops;
    }
    const data = [backend, frontend, devops];
    const labels = ['Backend','Frontend','DevOps'];
    ctx.clearRect(0,0,w,h);
    const barW = (w - 40) / data.length;
    data.forEach((v,i)=>{
      const x = 20 + i*(barW + 10);
      const barH = Math.max(6, v * (h - 30));
      // background
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.fillRect(x, 10, barW, h-30);
      // fill
      const grad = ctx.createLinearGradient(x,0,x+barW,0);
      grad.addColorStop(0, 'rgba(110,241,212,0.9)');
      grad.addColorStop(1, 'rgba(63,183,255,0.95)');
      ctx.fillStyle = grad;
      ctx.fillRect(x, h - 20 - barH, barW, barH);
      // label
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '11px Inter, system-ui';
      ctx.fillText(labels[i], x, h - 2);
    });
  }
  drawMiniChart();
  window.addEventListener('resize', drawMiniChart);

  // recent analyses list (localStorage)
  function loadRecent(){
    const arr = JSON.parse(localStorage.getItem('recent_analyses') || '[]');
    recentList.innerHTML = '';
    if(arr.length === 0){
      const el = document.createElement('div'); el.className='muted'; el.textContent = 'No hay análisis recientes'; recentList.appendChild(el); return;
    }
    arr.slice().reverse().forEach(item=>{
      const div = document.createElement('div'); div.className = 'recent-item';
      const left = document.createElement('div'); left.innerHTML = `<div style="font-weight:800">${item.role || 'Sin título'}</div><div class="meta">${item.seniority || ''} · ${item.date}</div>`;
      const right = document.createElement('div'); right.innerHTML = `<div style="text-align:right"><div style="font-weight:900">${Math.round((item.matching||0)*100)}%</div><div class="muted" style="font-size:12px">match</div></div>`;
      div.appendChild(left); div.appendChild(right);
      recentList.appendChild(div);
    });
  }
  loadRecent();
  clearRecent && clearRecent.addEventListener('click', ()=>{
    localStorage.removeItem('recent_analyses');
    loadRecent();
  });

  // save analysis to recent
  function pushRecent(analysis){
    if(!analysis) return;
    const arr = JSON.parse(localStorage.getItem('recent_analyses') || '[]');
    arr.push({
      role: analysis.role || '—',
      seniority: analysis.seniority || '—',
      matching: analysis.matching || 0,
      date: new Date().toLocaleString()
    });
    // keep last 20
    while(arr.length>20) arr.shift();
    localStorage.setItem('recent_analyses', JSON.stringify(arr));
    loadRecent();
    drawMiniChart();
  }

  // analyze flow: store base64 or text then redirect to loader
  analyzeBtn.addEventListener('click', async ()=>{
    if(!selectedFile && !localStorage.getItem('cv_text')){
      if(!confirm('No has subido archivo. ¿Usar demo?')) return;
      return demoFlow();
    }
    uiClick();
    // if file -> read base64 and store
    if(selectedFile){
      const reader = new FileReader();
      reader.onprogress = (ev)=>{
        if(ev.lengthComputable){
          const pct = Math.round(ev.loaded/ev.total*100);
          uploadFill.style.width = `${pct}%`;
        }
      };
      reader.onload = ()=>{
        try{ localStorage.setItem('cv_file_b64', reader.result); }catch(e){ console.warn('file too large for localStorage'); localStorage.removeItem('cv_file_b64'); }
        localStorage.setItem('cv_file_name', selectedFile.name);
        // go loader
        location.href = '../common/loader.html';
      };
      reader.readAsDataURL(selectedFile);
      return;
    }
    // else if text already in localStorage
    location.href = '../common/loader.html';
  });

  // demo flow
  function demoFlow(){
    localStorage.setItem('cv_text','Demo: Desarrollador Full Stack con 6 años de experiencia...');
    localStorage.setItem('cv_file_name','CV_demo.pdf');
    uiClick();
    location.href = '../common/loader.html';
  }
  demoBtn.addEventListener('click', demoFlow);

  // paste modal
  pasteBtn.addEventListener('click', ()=> {
    pasteModal.classList.add('show');
    pasteModal.setAttribute('aria-hidden','false');
    pasteArea.focus();
    uiClick();
  });
  window.closePaste = ()=>{
    pasteModal.classList.remove('show');
    pasteModal.setAttribute('aria-hidden','true');
  };
  pasteConfirm.addEventListener('click', ()=>{
    const txt = pasteArea.value || '';
    if(txt.trim().length < 20){ alert('Pega más texto del CV (al menos 20 caracteres).'); return; }
    localStorage.setItem('cv_text', txt);
    localStorage.setItem('cv_file_name','(pasted)');
    uiClick(0.015);
    location.href = '../common/loader.html';
  });

  // keyboard accessibility: Enter on drop -> open file
  drop.addEventListener('keydown', (e)=> { if(e.key === 'Enter' || e.key === ' ') fileInput.click(); });

  // small accessibility: press D to demo
  window.addEventListener('keydown', (e)=>{ if(e.key.toLowerCase() === 'd') demoFlow(); });

  // When loader finishes and writes analysis_result, the loader script pushes to localStorage 'analysis_result'
  // We listen for storage events (in case user returns) to push to recents
  window.addEventListener('storage', (ev)=>{
    if(ev.key === 'analysis_result' && ev.newValue){
      try{
        const a = JSON.parse(ev.newValue);
        pushRecent(a);
      }catch(e){console.warn(e)}
    }
  });

  // If user comes back to home and analysis_result exists (just finished), register it
  (function checkExistingAnalysis(){
    const a = JSON.parse(localStorage.getItem('analysis_result') || 'null');
    if(a){
      pushRecent(a);
      // remove to avoid duplicates if desired
      // localStorage.removeItem('analysis_result');
    }
  })();

  // initial small UI audio context resume on user gesture
  ['click','keydown','touchstart'].forEach(evt => {
    window.addEventListener(evt, ()=>{ if(audioCtx.state === 'suspended') audioCtx.resume(); }, {once:true});
  });

})();
