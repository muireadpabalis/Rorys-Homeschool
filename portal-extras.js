/* Additive integrations. Existing school-record storage keys and record IDs stay intact. */
(() => {
 const cfg=window.PORTAL,prefix=cfg.student.toLowerCase(),P=window.AssessmentPersistence;
 const storageIssues=[],supportedVersions={reading:'2026.1',writing:'2026.1',science:'2026.1',history:'2026.1'};
 const specs=[['ela','reading','ELA / Reading','English Language Arts'],['writing','writing','Writing / Language','English Language Arts'],['science','science','Science','Science'],['social','history','History–Social Science / Geography',cfg.student==='Brody'?'Social Studies':'History–Social Science']];
 let changed=false;
 for(const [id,subject,title,course] of specs){
  const link='diagnostic.html?subject='+subject;
  let a=data.assessments.find(a=>a.id===id);
  if(!a){a={id,title:title+' Baseline',subject:course,date:'',score:'',notes:'',status:'Not started',link};data.assessments.push(a);changed=true;}
  if(!a.link){a.link=link;changed=true;}
  if(id==='ela'&&/Reading.*Writing|ELA Exit/.test(a.title)){a.title='ELA / Reading Baseline';changed=true;}
  let task=data.assignments.find(a=>a.diagnosticId===subject)||data.assignments.find(a=>a.subject===course&&/Diagnostic|Baseline/.test(a.title)&&!a.diagnosticId);
  if(subject==='writing'&&task?.diagnosticId!=='writing')task=null;
  if(!task){task={id:'baseline2026-'+subject,title:title+' Baseline',subject:course,due:'',description:'Diagnostic baseline with separate readiness probes. Breaks are welcome.',link,complete:false,completedDate:'',diagnosticId:subject};data.assignments.push(task);changed=true;}
  if(!task.link){task.link=link;changed=true;}
  if(!task.diagnosticId){task.diagnosticId=subject;changed=true;}
  try{const key=prefix+'Baseline2026_'+subject,attempt=P?P.read(key):JSON.parse(localStorage.getItem(key)||'null');const valid=attempt&&attempt.student===cfg.student&&attempt.subject===subject&&attempt.version===supportedVersions[subject]&&attempt.answers&&typeof attempt.answers==='object'&&!Array.isArray(attempt.answers);if(attempt&&!valid){storageIssues.push(title+' saved attempt is preserved but does not match the current assessment definition.');}if(valid){const status=attempt.submittedAt?'Complete':'In progress';if(a.status!==status){a.status=status;changed=true;}if(attempt.submittedAt){a.score='Parent report available';task.complete=true;task.completedDate=attempt.submittedAt.slice(0,10);changed=true;}}}catch(error){storageIssues.push(title+' saved attempt needs parent recovery.');}
 }
 try{const key=cfg.student==='Brody'?'brodyMathDiagnosticV1':'rory_math_baseline_v1',m=P?P.read(key):JSON.parse(localStorage.getItem(key)||'null');if(m){const a=data.assessments.find(a=>a.id==='math');if(a){const status=m.submittedAt||m.submitted?'Complete':'In progress';if(a.status!==status){a.status=status;changed=true;}}}}catch(error){storageIssues.push('Mathematics saved attempt needs parent recovery.');}
 if(changed)saveData();else renderAll();
 const panel=document.createElement('article');panel.className='panel';panel.innerHTML='<h3>Parent diagnostics & instructional bridge</h3><p>Review domain findings, writing samples, prior-instruction evidence, and California transition priorities.</p><a class="button" href="parent.html">Open parent reports</a>';
 document.querySelector('#reports .report-grid').append(panel);
 const legacy=P?.legacySummaries()||[],warnings=[...new Set([...storageIssues,...(P?.issues()||[])])];
 if(legacy.length||warnings.length){const notice=document.createElement('section');notice.className='panel science-recovery';notice.innerHTML='<h3>Assessment records safeguarded</h3>'+(legacy.length?'<p>An earlier portal record was found and copied into the recovery archive. Its answers remain historical and are not converted into the current assessments. A parent can review and export the archive.</p>':'')+(warnings.length?'<ul>'+warnings.map(x=>'<li>'+String(x).replace(/[&<>"\']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))+'</li>').join('')+'</ul>':'')+'<a href="parent.html">Open parent records</a>';document.querySelector('#assessmentList').before(notice);}
 const fullBackup=()=>{
  const attempts={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith(prefix+'Baseline2026_')||k===(cfg.student==='Brody'?'brodyMathDiagnosticV1':'rory_math_baseline_v1')){try{attempts[k]=JSON.parse(localStorage.getItem(k));}catch(e){attempts[k]={unparsedRaw:localStorage.getItem(k)};}}}
  let parentReview=null;try{parentReview=JSON.parse(localStorage.getItem(prefix+'ParentReview2026')||'null')}catch(e){}
  return {schemaVersion:2,student:cfg.student,exportedAt:new Date().toISOString(),record:data,attempts,parentReview,assessmentRecovery:P?.exportArchive()||null,scienceBridge:window.ScienceStore?.backup(false)||null,historyBridge:window.HistoryStore?.backup(false)||null};
 };
 exportJsonBtn.onclick=()=>download(prefix+'-complete-homeschool-record.json',JSON.stringify(fullBackup(),null,2),'application/json');
 window.addEventListener('storage',e=>{if(e.key===cfg.recordKey||e.key?.startsWith(prefix+'Baseline2026_'))location.reload();});
})();
