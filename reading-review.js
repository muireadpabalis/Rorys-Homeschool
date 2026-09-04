/* Generic parent-only review support. Private evidence is imported locally. */
window.ReadingReview = (() => {
 'use strict';
 const labels={confirmed:'Confirmed on parental review',reinforce:'Grade 2 skill to strengthen',readiness:'Grade 3 readiness / instruction'};
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function validate(v,b){
  if(!v||v.schemaVersion!==1||v.kind!=='reading-parental-review'||v.student!==window.PORTAL.student||v.assessmentVersion!==b.version||!/^\d{4}-\d{2}-\d{2}$/.test(v.reviewDate)||!Array.isArray(v.items)||!v.items.length)throw Error('Choose a reading parental-review export for this student and assessment version.');
  const ids=new Set();
  for(const x of v.items){const q=b.questions[x.questionNumber-1];if(!q||q.id!==x.questionId||ids.has(x.questionId)||!labels[x.classification]||['parentReportedOriginalResponse','reviewResponse','interpretation','instructionalTarget'].some(k=>typeof x[k]!=='string'||!x[k].trim())||(x.classification==='readiness'&&q.band!=='C')||(x.classification==='reinforce'&&q.band==='C'))throw Error('Invalid or inconsistent reviewed item. No changes saved.');ids.add(x.questionId);}
  if(typeof v.summary!=='string'||!Array.isArray(v.strengths)||v.strengths.some(s=>typeof s!=='string'))throw Error('Invalid review summary.');
  return JSON.parse(JSON.stringify(v));
 }
 function find(reviews,b,q){const v=reviews.readingFollowUp;return v?.assessmentVersion===b.version?v.items.find(x=>x.questionId===q.id):null;}
 function render(reviews,b,save,refresh){
  const host=document.getElementById('reading-followup'),v=reviews.readingFollowUp;
  host.innerHTML='<h2>Reading / ELA parental review</h2><p>Follow-up evidence is stored separately from the original attempt on this browser. Include it in a complete record export before changing devices.</p><label class="no-print">Import private reading review JSON<input id="reading-review-import" type="file" accept=".json,application/json"></label><p id="reading-review-status" role="status"></p>';
  if(v){
   host.innerHTML+=`<p><strong>Review date: ${esc(v.reviewDate)}</strong> · ${esc(v.source)}</p><p>${esc(v.summary)}</p><p>Parent-reported sampled strengths: ${v.strengths.map(esc).join('; ')}.</p>${!b.state?.submittedAt&&!b.state?.submitted?'<p class="notice">The original submitted reading attempt is not present in this browser. Original responses below are parent-reported; no attempt or submission timestamp has been created.</p>':''}`;
   for(const [status,label] of Object.entries(labels))host.innerHTML+=`<section class="panel"><h3>${label}</h3>${v.items.filter(x=>x.classification===status).map(x=>{const q=b.questions[x.questionNumber-1],a=b.state?.answers?.[q.id],actual=Number.isInteger(a?.choice)?q.options[a.choice]:null;return `<details open><summary>Q${x.questionNumber}: ${esc(x.instructionalTarget)}</summary><p>Parent-reported original response: ${esc(x.parentReportedOriginalResponse)}</p>${actual?`<p>Saved original response: ${esc(actual)}</p>${actual!==x.parentReportedOriginalResponse?'<p class="notice">The saved and parent-reported original responses differ. Both are retained; check the source record.</p>':''}`:''}<p>Original submission: ${esc(b.state?.submittedAt||'No timestamp available in this browser')}</p><p><strong>Parental-review response:</strong> ${esc(x.reviewResponse)}</p><p>Reference answer: ${esc(q.options[q.correct])}</p><p>${esc(x.interpretation)}</p><p><strong>Status:</strong> ${label} · ${esc(v.reviewDate)}</p></details>`;}).join('')}</section>`;
  }else host.innerHTML+='<p>No parental reading review imported yet.</p>';
  document.getElementById('reading-review-import').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;const next=validate(JSON.parse(await f.text()),b);if(v&&JSON.stringify(v)!==JSON.stringify(next))throw Error('A different review already exists. Export and reconcile the evidence before replacing it.');const old=reviews.readingFollowUp;reviews.readingFollowUp=next;if(!save()){reviews.readingFollowUp=old;throw Error('Review could not be saved.');}refresh();document.getElementById('reading-review-status').textContent='Parental review saved separately. Original attempt unchanged.';}catch(err){document.getElementById('reading-review-status').textContent=err.message;}finally{e.target.value='';}};
 }
 return {validate,find,render,labels};
})();
