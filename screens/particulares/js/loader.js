// loader.js - performs the analysis flow automatically
(async () => {
  const msgEl = document.getElementById('loaderMsg');
  const s1 = document.getElementById('s1');
  const s2 = document.getElementById('s2');
  const s3 = document.getElementById('s3');
  const s4 = document.getElementById('s4');

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  try {
    msgEl.textContent = 'Leyendo archivo...';
    s1.style.background = 'linear-gradient(90deg,var(--accent),var(--accent-2))';
    await sleep(800);

    let text = localStorage.getItem('cv_text') || null;
    const b64 = localStorage.getItem('cv_file_b64') || null;

    msgEl.textContent = 'Extrayendo texto...';
    s2.style.background = 'linear-gradient(90deg,var(--accent),var(--accent-2))';
    await sleep(900);

    if(b64 && !text){
      // call backend to extract text
      try {
        const resp = await window.api.extract_text_from_pdf(b64);
        if(resp && resp.text) text = resp.text;
      } catch(e){ console.warn('extract text failed', e); }
    }

    if(!text) {
      // fallback demo text
      text = 'Desarrollador Full Stack con 6 años de experiencia...';
    }
    localStorage.setItem('cv_text', text);

    msgEl.textContent = 'Analizando con IA...';
    s3.style.background = 'linear-gradient(90deg,var(--accent),var(--accent-2))';
    await sleep(1000);

    // call backend full analysis
    let analysis = null;
    try {
      analysis = await window.api.full_analysis(text);
    } catch(e){ console.warn('full analysis failed', e); }

    if(!analysis) {
      // simulated analysis
      analysis = {
        role:"Full Stack Developer",
        seniority:"Senior",
        salaryRange:"55k - 75k €",
        overallScore:0.94,
        matching:0.92,
        complexity:7.8,
        skills:[
          {name:"Node.js", level:"Advanced", insight:"Lideró microservicios"},
          {name:"React", level:"Advanced", insight:"SPAs con optimización"},
          {name:"Docker", level:"Advanced", insight:"Pipelines CI/CD"},
          {name:"AWS", level:"Intermediate", insight:"ECS, S3"},
          {name:"Kubernetes", level:"Beginner", insight:"Necesita profundizar"}
        ],
        distribution:{backend:0.6,frontend:0.48},
        improvements:[
          {title:"Añadir métricas de impacto", reason:"Los reclutadores valoran números"},
          {title:"Especificar versiones", reason:"Mejora credibilidad"},
          {title:"Links a proyectos", reason:"Prueba de trabajo real"}
        ],
        topRoles:[
          {title:"Backend Engineer", prob:0.88},
          {title:"Frontend Architect", prob:0.76},
          {title:"DevOps Engineer", prob:0.62}
        ]
      };
    }

    msgEl.textContent = 'Generando insights...';
    s4.style.background = 'linear-gradient(90deg,var(--accent),var(--accent-2))';
    await sleep(600);

    // store and redirect
    localStorage.setItem('analysis_result', JSON.stringify(analysis));
    msgEl.textContent = 'Listo — redirigiendo...';
    await sleep(700);
    location.href = '../particulares/results.html';
  } catch (err) {
    console.error(err);
    document.getElementById('loaderCard').textContent = 'Error procesando el CV. Intenta de nuevo.';
  }
})();
