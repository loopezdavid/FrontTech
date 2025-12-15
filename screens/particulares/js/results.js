// results.js - renders analysis_result from localStorage
(() => {
  window.switchPanel = function(n){
    const p1 = document.getElementById('panel-summary');
    const p2 = document.getElementById('panel-skills');
    const p3 = document.getElementById('panel-improve');
    p1.style.display = n===1 ? 'block' : 'none';
    p2.style.display = n===2 ? 'block' : 'none';
    p3.style.display = n===3 ? 'block' : 'none';
    document.getElementById('f1').classList.toggle('active', n===1);
    document.getElementById('f2').classList.toggle('active', n===2);
    document.getElementById('f3').classList.toggle('active', n===3);
  };

  function downloadResume(){
    const data = localStorage.getItem('analysis_result') || '{}';
    const blob = new Blob([data], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'analysis.json';
    a.click();
  }
  window.downloadResume = downloadResume;

  function render(a){
    document.getElementById('roleTitle').textContent = a.role;
    document.getElementById('meta').textContent = a.seniority + ' · ' + (a.salaryRange||'—');
    const score = Math.round((a.overallScore||a.matching||0)*100);
    document.getElementById('scoreBig').textContent = score + '%';
    document.getElementById('scoreBar').style.width = score + '%';
    document.getElementById('kpmMatching').textContent = Math.round((a.matching||0)*100) + '%';
    document.getElementById('kpmComplex').textContent = (a.complexity||0) + '/10';
    document.getElementById('kpmSkills').textContent = (a.skills||[]).length;
    document.getElementById('asideRole').textContent = a.role;
    document.getElementById('asideSen').textContent = a.seniority;
    document.getElementById('asideSkillCount').textContent = (a.skills||[]).length;

    // highlights
    const h = document.getElementById('highlights');
    h.innerHTML = '';
    (a.skills||[]).slice(0,3).forEach(s=>{
      const el = document.createElement('div');
      el.innerHTML = '<span style="color:var(--accent)">•</span> <strong>' + s.name + '</strong> — ' + s.level;
      h.appendChild(el);
    });

    // skills list and insights
    const skillList = document.getElementById('skillList');
    skillList.innerHTML = '';
    (a.skills||[]).forEach(s=>{
      const sp = document.createElement('span'); sp.className='skill-pill'; sp.textContent = s.name; skillList.appendChild(sp);
    });
    const insightsList = document.getElementById('insightsList'); insightsList.innerHTML='';
    (a.skills||[]).forEach(s=>{
      const d = document.createElement('div'); d.className='insight'; d.innerHTML = '<div style="font-weight:800">'+s.name+' <span class="muted" style="font-weight:600">('+s.level+')</span></div><div class="muted">'+(s.insight||'')+'</div>';
      insightsList.appendChild(d);
    });

    // bars and radar
    document.getElementById('barBackend') && (document.getElementById('barBackend').style.width = ((a.distribution && a.distribution.backend)||0)*100 + '%');
    document.getElementById('barFrontend') && (document.getElementById('barFrontend').style.width = ((a.distribution && a.distribution.frontend)||0)*100 + '%');

    // improvements and top3
    const improvList = document.getElementById('improveList'); improvList.innerHTML='';
    (a.improvements||[]).forEach(i=>{
      const div = document.createElement('div'); div.className='insight'; div.innerHTML = '<div style="font-weight:800">'+i.title+'</div><div class="muted">'+i.reason+'</div>';
      improvList.appendChild(div);
    });
    const top3 = document.getElementById('top3List'); top3.innerHTML='';
    (a.topRoles||[]).forEach(t=>{
      const div = document.createElement('div'); div.className='insight'; div.innerHTML = '<div style="font-weight:800">'+t.title+' <span class="muted" style="float:right">'+Math.round(t.prob*100)+'%</span></div>';
      top3.appendChild(div);
    });
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const raw = localStorage.getItem('analysis_result');
    let a = raw ? JSON.parse(raw) : null;
    if(!a){
      // fallback simulated
      a = {
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
          {title:"Especificar versiones", reason:"Mejora credibilidad"}
        ],
        topRoles:[
          {title:"Backend Engineer", prob:0.88},
          {title:"Frontend Architect", prob:0.76},
          {title:"DevOps Engineer", prob:0.62}
        ]
      };
    }
    render(a);
    switchPanel(1);
  });
})();
