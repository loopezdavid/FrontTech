// minimal api wrapper (uses window.fetch). Adjust API_BASE to your backend.
const API_BASE = "http://127.0.0.1:8000";

const api = {
  async extract_text_from_pdf(b64){
    // expects backend endpoint /extract_text that returns { text: "..." }
    const resp = await fetch(API_BASE + '/extract_text', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ file_b64: b64 }) });
    if(!resp.ok) throw new Error('extract_text failed: ' + resp.status);
    return await resp.json();
  },
  async full_analysis(text){
    // expects backend endpoint /analyze_cv that returns full analysis object
    const resp = await fetch(API_BASE + '/analyze_cv', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ cv_text: text }) });
    if(!resp.ok) throw new Error('analyze_cv failed: ' + resp.status);
    return await resp.json();
  }
};

window.api = api;
