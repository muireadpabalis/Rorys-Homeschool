(() => {
 'use strict';
 const cfg=window.PORTAL,prefix=cfg.student.toLowerCase(),reviewKey=prefix+'ParentReview2026',accessKey=prefix+'ParentAccess2026',P=window.AssessmentPersistence;
 const $=id=>document.getElementById(id), esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let reviews={},batteries=[],loaded=false;
 const subjects=['reading','writing','science','history'];
 const get=k=>JSON.parse(localStorage.getItem(k)||'null');
 function saveReviews(){try{localStorage.setItem(reviewKey,JSON.stringify(reviews));return true}catch(e){alert('Parent notes were not saved. Export now and free browser storage.');return false;}}
 const download=(name,content,type='application/json')=>{const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 async function digest(s){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))).map(x=>x.toString(16).padStart(2,'0')).join('');}
 function gate(){
  let saved;try{saved=get(accessKey)}catch(e){$('gate-status').textContent='Saved parent access settings need recovery. They have not been overwritten.';return;}
  $('gate-title').textContent=saved?'Parent sign-in':'Set a parent passphrase';
  $('setup-confirm').hidden=!!saved;
  $('parent-pass').autocomplete=saved?'current-password':'new-password';
  $('unlock').onsubmit=async e=>{e.preventDefault();try{
   const pass=$('parent-pass').value;if(pass.length<8){$('gate-status').textContent='Use at least 8 characters.';return;}
   if(!saved){if(pass!==$('confirm-pass').value){$('gate-status').textContent='Passphrases do not match.';return;}const salt=crypto.randomUUID();saved={salt,hash:await digest(salt+pass)};localStorage.setItem(accessKey,JSON.stringify(saved));}
   else if(await digest(saved.salt+pass)!==saved.hash){$('gate-status').textContent='Passphrase did not match.';return;}
   $('parent-pass').value='';$('confirm-pass').value='';$('gate').hidden=true;$('parent-content').hidden=false;await load();
  }catch(error){$('gate').hidden=false;$('parent-content').hidden=true;$('gate-status').textContent='Unable to open parent records: '+error.message;}};
 }
 async function fetchJSON(path){const r=await fetch(path);if(!r.ok)throw new Error('Could not load '+path);return r.json();}
 function mathBattery(qs,state){
  const brody=cfg.student==='Brody';
  return {subject:'math',title:'Mathematics Diagnostic',version:'legacy-with-QA-2026',state,questions:qs.map((q,i)=>{
   const originalLevel=q.level;let band=/reach|readiness|probe/i.test(q.level)?'C':'B';
   // Symbolic fractions, multiplication/division and representative sampling are readiness probes.
   const readinessRory=[18,19,20,21,22,23,24,27,37,39,41,42,43,44,45];
   if((!brody&&readinessRory.includes(q.id))||(brody&&q.id==='q59'))band='C';
   const opts=q.options.slice();if(opts.length===4)opts.push("I don't know / I haven't been taught this yet.");
   if(!brody&&q.id===28&&state.itemVersion===2)opts[1]='7 dimes';
   return {...q,id:String(q.id),type:'choice',band,role:band==='C'?'current-grade readiness':'prior-grade mastery',domain:q.ca_domain||q.section,topic:q.topic||q.section,ma:q.ma||q.maStandard,ca:q.caStandard||q.ca_domain,correct:brody?q.correct:'ABCD'.indexOf(q.correct),options:opts,legacyAccepted:!brody&&q.id===28&&state.itemVersion!==2?[0,1]:null,legacyAmbiguity:!brody&&q.id===28&&state.itemVersion!==2?'Original item had two valid responses. A and B are both credited.':null,originalLevel,mappingNote:band==='C'&&!/reach|readiness|probe/i.test(originalLevel)?'QA: interpreted as readiness rather than prior-grade failure; original mapping retained for audit.':null};
  })};
 }
 async function load(){
  reviews=get(reviewKey)||{};batteries=[];
  const all=await Promise.all(subjects.map(async subject=>{const definition=await fetchJSON('assessments/'+subject+'.parent.json');let state=null,stateIssue=null;try{state=P?P.read(prefix+'Baseline2026_'+subject):get(prefix+'Baseline2026_'+subject);if(state&&state.version!==definition.version){stateIssue='Saved version '+(state.version||'unknown')+' differs from current version '+definition.version+'. The response record is preserved but is not interpreted.';state=null;}}catch(error){stateIssue='Saved attempt needs recovery. Its original storage was not overwritten.';}return {...definition,state,stateIssue};}));
  batteries=all;
  const mathKey=cfg.student==='Brody'?'brodyMathDiagnosticV1':'rory_math_baseline_v1';let mathState=null;try{mathState=P?P.read(mathKey):get(mathKey);}catch(error){mathState=null;}
  batteries.unshift(mathBattery(await fetchJSON('parent-math.json'),mathState||{}));await Promise.all([window.ScienceParent?.load(),window.HistoryParent?.load()]);loaded=true;render();
 }
 function answer(b,q){
  const a=b.state?.answers?.[q.id];
  if(b.subject==='math'){return {choice:cfg.student==='Brody'?a:(typeof a==='string'?'ABCDE'.indexOf(a):null),exposure:'unsure'};}
  return a||{};
 }
 function rowsFor(b){
  if(!b.state?.submittedAt&&!b.state?.submitted)return [];
  return b.questions.map((q,i)=>{
   const a=answer(b,q),valid=Number.isInteger(a.choice)&&a.choice>=0&&a.choice<=4;
   const classification=q.type==='writing'?(a.text?.trim()?'parent-review':a.unknown?'dont-know':'blank'):!valid?'blank':a.choice===4?'dont-know':(q.legacyAccepted||[q.correct]).includes(a.choice)?'correct':'incorrect';
   const followUp=b.subject==='reading'?window.ReadingReview.find(reviews,b,q):null;
   return {parentalReview:followUp,reviewDate:followUp?reviews.readingFollowUp.reviewDate:null,currentInstructionalClassification:followUp?.classification||classification,student:cfg.student,assessment:b.title,subject:b.subject,version:b.version,questionId:q.id,questionNumber:i+1,domain:q.domain,topic:q.topic,skill:q.skill,question:q.prompt,passage:q.passage||'',studentResponse:q.type==='writing'?a.text||null:valid?'ABCDE'[a.choice]:null,responseText:q.type==='writing'?a.text||null:valid?q.options[a.choice]:null,correctAnswer:q.type==='writing'?null:q.options[q.correct],acceptedAnswers:q.legacyAccepted?.map(i=>q.options[i]),classification,exposureResponse:(a.choice===4||a.unknown)?a.exposure||'unsure':'not-requested',unknownSelected:!!a.unknown,maExpectation:q.ma,californiaStandardOrDomain:q.ca,diagnosticBand:q.band,role:q.role,knownParentInformation:q.knownExposure||null,mappingNote:q.mappingNote||null,originalDiagnosticLevel:q.originalLevel||null,legacyAmbiguity:q.legacyAmbiguity||null,sources:q.sources||[],rubric:q.rubric||null,parentWritingReview:reviews.writing?.[q.id]||null,submittedAt:b.state.submittedAt};
  });
 }
 function groups(){
  const map=new Map();
  batteries.flatMap(rowsFor).forEach(r=>{const key=[r.subject,r.domain,r.diagnosticBand].join('::');if(!map.has(key))map.set(key,{key,subject:r.subject,domain:r.domain,band:r.diagnosticBand,rows:[]});map.get(key).rows.push(r);});
  return [...map.values()].map(g=>{
   const note=reviews.domains?.[g.key]||{},rs=g.rows,mc=rs.filter(r=>!r.rubric),c=mc.filter(r=>(r.classification==='correct'||r.parentalReview?.classification==='confirmed')).length,w=mc.filter(r=>(r.classification==='incorrect'&&r.parentalReview?.classification!=='confirmed')).length,unknown=rs.filter(r=>(r.classification==='dont-know'&&!r.parentalReview)).length,blank=rs.filter(r=>r.classification==='blank').length;
   const known=rs.some(r=>r.knownParentInformation)&&!['taught','not-taught'].includes(note.exposure);const untaught=note.exposure==='not-taught'||known,reported=rs.some(r=>r.exposureResponse==='not-taught');
   let status,priority,action;
   if(untaught){status='Not previously instructed — instructional transition gap';priority='HIGH';action='Teach this domain before dependent California work; confirm learning with a work sample.';}
   else if(rs.some(r=>r.rubric)){status='Independent writing — parent rubric review';priority='MEDIUM';action='Read the complete sample, evaluate the rubric dimensions, and select one writing target.';}
   else if(g.band==='C'){status=c>=3&&c/mc.length>=.8?'California readiness strength (sampled)':'Readiness / reach — no remediation indicated';priority='REACH';action='Introduce through current-grade instruction; use these responses for planning, not a prior-grade failure label.';}
   else if(g.band==='T'){status=c>=3&&c/mc.length>=.8?'Transition knowledge appears secure (sampled)':'California sequencing bridge — exposure needs confirmation';priority=c>=3&&c/mc.length>=.8?'LOW':'HIGH';action='Confirm prior exposure and teach the sequence needed for California entry.';}
   else if(unknown||reported){status=reported?'Apparent non-exposure — student report, confirm':'Unknown response — exposure unresolved';priority=g.band==='A'?'HIGH':'MEDIUM';action='Ask about prior instruction, then use an oral or practical probe before assigning remediation.';}
   else if(blank){status='Insufficient evidence — legacy blanks';priority='MEDIUM';action='Collect evidence for unanswered legacy items without reopening the locked attempt.';}
   else if(mc.length<3){status=c===mc.length?'Correct sampled response — insufficient for mastery claim':'Needs follow-up — limited evidence';priority=g.band==='A'&&w?'HIGH':w?'MEDIUM':'LOW';action='Confirm this narrow sample through another task or explanation.';}
   else if(c/mc.length>=.8){status='Secure evidence on sampled items';priority='LOW';action='Apply during regular instruction and monitor transfer to new tasks.';}
   else{status=c?'Developing evidence':'Needs follow-up';priority=g.band==='A'?'HIGH':'MEDIUM';action=note.exposure==='taught'?'Revisit previously taught skills; ask the student to explain reasoning before identifying a misconception.':'Confirm what was taught, then investigate incorrect responses with a fresh task.';}
   if(rs.some(r=>r.parentalReview)){status=rs.some(r=>r.parentalReview?.classification==='reinforce')?'Grade 2 skill to strengthen':rs.some(r=>r.parentalReview?.classification==='readiness')?'Grade 3 readiness / instruction':w||unknown||blank?'Parental review confirmed selected items; other evidence needs follow-up':'Confirmed on parental review / other sampled evidence';priority=rs.some(r=>r.parentalReview?.classification==='reinforce')?'MEDIUM':g.band==='C'?'REACH':w||unknown||blank?'MEDIUM':'LOW';action='Use the separate reading parental review above for item-specific interpretation. Confirmed items do not indicate remediation; readiness targets belong to Grade 3 instruction.';}
   return {...g,originalCounts:{correct:rs.filter(r=>r.classification==='correct').length,incorrect:rs.filter(r=>r.classification==='incorrect').length,unknown:rs.filter(r=>r.classification==='dont-know').length},correct:c,incorrect:w,unknown,blank,exposure:untaught?'parent-confirmed not taught':note.exposure==='taught'?'parent-confirmed taught':reported?'student-reported non-exposure':'unconfirmed',parentNote:note.notes||'',status,priority,action,skillsToTeach:[...new Set(rs.filter(r=>(r.parentalReview?r.parentalReview.classification!=='confirmed':r.classification!=='correct')).map(r=>r.parentalReview?.instructionalTarget||r.skill))]};
  });
 }
 function bridge(gs){
  const sequence=['Mesopotamia','Ancient Egypt','Ancient Israel / Hebrews','Ancient India','Ancient China','Ancient Greece','Ancient Rome','Fall of Rome'];
  const profile=sequence.map(domain=>{const g=gs.find(g=>g.subject==='history'&&g.domain===domain);return {domain,status:g?.status||'No submitted evidence',exposure:g?.exposure|| (domain==='Ancient Rome'?'Parent reports not yet studied':'unconfirmed'),correct:g?.correct??null,total:g?.rows.length??0};});
  const secure=profile.filter(p=>/secure/i.test(p.status));
  return {knownHistory:cfg.student==='Brody'?'Parent reports no Rome instruction; California destination class is beginning the Fall of Rome. Other prior exposure remains unconfirmed.':'Completed Massachusetts Grade 2; specific instructional exposure remains to be confirmed.',sequenceProfile:cfg.student==='Brody'?profile:[],lastSecureSampledStage:secure.at(-1)?.domain||'Not established',caution:'A later correct answer does not establish mastery of every earlier stage. These are brief, nonstandardized probes; corroborate with school records and work samples.',recommendedSequence:cfg.student==='Brody'?['Confirm foundations and prior coverage using the sequence profile.','Ancient Rome foundations and geography','Roman Republic and institutions','Roman Empire and major political/social developments','Decline and fall of the Western Roman Empire; Eastern continuity','Continue the destination school’s Grade 7 sequence.']:['Confirm prerequisite gaps with work samples.','Teach or reinforce the identified subject skills.','Study the actual destination community’s geography, Indigenous peoples, local history, government, and economy.']};
 }
 function report(){const gs=groups();return {schemaVersion:1,student:cfg.student,schoolYear:'2026–2027',generatedAt:new Date().toISOString(),scope:'Local, nonstandardized diagnostic evidence. No overall percentage or placement decision.',parentContext:reviews.context||'',method:'Secure evidence requires at least three scored items and at least 80% correct in a subject/domain/band group. Threshold is a planning heuristic, not a validated cut score. E and non-exposure are never automatically remediation. Incorrect answers alone never establish instructional history or a misconception.',assessments:batteries.map(b=>({subject:b.subject,title:b.title,submittedAt:b.state?.submittedAt||null,started:!!b.state?.answers,questionCount:b.questions.length,responses:rowsFor(b),...(b.subject==='reading'?{followUpEvidence:reviews.readingFollowUp||null}:{})})),domains:gs,instructionalBridge:bridge(gs)};}
 function render(){
 window.ELAParent?.render();
 window.ScienceParent?.render();
 window.HistoryParent?.render();
  window.ReadingReview.render(reviews,batteries.find(b=>b.subject==='reading'),saveReviews,render);
  const rep=report(),gs=rep.domains;
  $('parent-name').textContent=cfg.student+' — Massachusetts → California Instructional Bridge Report';
  $('context').value=reviews.context||'';$('context-print').textContent=reviews.context||'No parent context recorded.';
  $('completion').innerHTML=batteries.map(b=>`<li>${esc(b.title)}: ${b.stateIssue?esc(b.stateIssue):b.state?.submittedAt||b.state?.submitted?'Submitted':b.state?.answers?'In progress':'Not started'} (${b.questions.length} items)</li>`).join('');
  const recovery=$('assessment-recovery'),legacy=P?.legacySummaries()||[],storageIssues=P?.issues()||[];if(recovery){recovery.hidden=!legacy.length&&!storageIssues.length;recovery.innerHTML='<h2>Assessment recovery archive</h2><p>Earlier portal attempts stay separate from the current batteries because the questions changed. They are preserved and exported without being scored or turned into current responses.</p>'+(legacy.length?'<ul>'+legacy.map(x=>`<li><strong>${esc(x.title)}</strong>: ${x.submittedAt?'submitted '+esc(new Date(x.submittedAt).toLocaleDateString()):'in progress'} · ${x.responseCount} saved response${x.responseCount===1?'':'s'}</li>`).join('')+'</ul>':'<p>No earlier-format attempts were found in this browser profile.</p>')+(storageIssues.length?'<ul>'+storageIssues.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'');}
  const categories=[['Strengths / secure sampled knowledge',g=>/secure|strength\b/i.test(g.status)],['Developing / prior-grade follow-up',g=>['A','B'].includes(g.band)&&g.incorrect>0],['Apparent non-exposure / unknowns',g=>g.unknown||/not taught/.test(g.exposure)],['California transition gaps',g=>g.band==='T'||/transition gap/.test(g.status)],['California readiness',g=>g.band==='C']];
  $('highlights').innerHTML=categories.map(([title,filter])=>`<div class="panel"><h3>${title}</h3>${gs.filter(filter).length?'<ul>'+gs.filter(filter).map(g=>`<li>${esc(g.subject)} / ${esc(g.domain)} (Band ${g.band}): ${esc(g.status)}</li>`).join('')+'</ul>':'<p>No submitted evidence in this category yet.</p>'}</div>`).join('');
  $('domains').innerHTML=gs.length?gs.map(g=>`<section class="panel parent-domain"><span class="badge">${esc(g.subject)} · Band ${g.band} · ${g.priority}</span><h3>${esc(g.domain)}</h3><p><strong>${esc(g.status)}</strong></p><p>Current evidence (including parental confirmation): ${g.correct} correct / confirmed · ${g.incorrect} incorrect · ${g.unknown} unknown · ${g.blank} blank · ${g.rows.length} sampled items</p><p><strong>Action:</strong> ${esc(g.action)}</p>${g.skillsToTeach.length?'<p>Follow-up skills: '+esc(g.skillsToTeach.join('; '))+'</p>':''}<details class="no-print"><summary>Record parent knowledge of prior instruction</summary><label>Exposure<select data-exposure="${esc(g.key)}"><option value="uncertain">Unconfirmed</option><option value="taught">Previously taught</option><option value="not-taught">Not previously taught</option></select></label><label>Evidence / notes<textarea data-notes="${esc(g.key)}">${esc(g.parentNote)}</textarea></label></details><p>Parent evidence: ${esc(g.exposure)}${g.parentNote?' — '+esc(g.parentNote):''}</p><details><summary>Item evidence and standards (${g.rows.length})</summary>${g.rows.map(r=>`<div class="card"><strong>Q${r.questionNumber}: ${esc(r.skill)}</strong><p>${esc(r.question)}</p>${r.passage?`<details><summary>Original passage / stimulus</summary><div class="passage">${esc(r.passage)}</div></details>`:''}<p class="text-response">Response: ${esc(r.responseText||'(no written response)')}</p>${r.parentalReview?`<p><strong>Current parental review:</strong> ${esc(window.ReadingReview.labels[r.parentalReview.classification])} — ${esc(r.parentalReview.interpretation)}</p>`:''}<p>Original classification: ${esc(r.classification)}${r.correctAnswer?' · Key: '+esc(r.correctAnswer):''}</p><p>MA: ${esc(r.maExpectation)}<br>CA: ${esc(r.californiaStandardOrDomain)}</p>${r.legacyAmbiguity?`<p>${esc(r.legacyAmbiguity)}</p>`:''}${r.mappingNote?`<p>${esc(r.mappingNote)}</p>`:''}</div>`).join('')}</details></section>`).join(''):'<p>Submit an assessment to see item-based findings. No results are invented for unstarted work.</p>';
  $('domains').querySelectorAll('[data-exposure]').forEach(el=>{el.value=reviews.domains?.[el.dataset.exposure]?.exposure||'uncertain';el.onchange=()=>{reviews.domains??={};reviews.domains[el.dataset.exposure]={...reviews.domains[el.dataset.exposure],exposure:el.value};if(saveReviews())render();};});
  $('domains').querySelectorAll('[data-notes]').forEach(el=>el.onchange=()=>{reviews.domains??={};reviews.domains[el.dataset.notes]={...reviews.domains[el.dataset.notes],notes:el.value};saveReviews();});
  const writing=batteries.find(b=>b.subject==='writing');
  $('writing-reviews').innerHTML=rowsFor(writing).filter(r=>r.rubric).map(r=>`<section class="panel parent-domain"><h3>${esc(r.domain)}</h3><p>${esc(r.question)}</p><div class="text-response">${esc(r.responseText||'No writing supplied; insufficient evidence.')}</div><p>${esc(r.rubric.guidance)}</p>${r.rubric.dimensions.map(d=>`<label>${esc(d)}<select data-rubric="${esc(r.questionId)}" data-dimension="${esc(d)}"><option value="">Not reviewed / insufficient evidence</option>${Object.entries(r.rubric.scale).map(([k,v])=>`<option value="${k}">${k}: ${esc(v)}</option>`).join('')}</select></label>`).join('')}<label>Genre findings, assistance, mode, and next instructional step<textarea data-writing-note="${r.questionId}">${esc(reviews.writing?.[r.questionId]?.notes||'')}</textarea></label><p class="print-only text-response">${esc(reviews.writing?.[r.questionId]?.notes||'')}</p></section>`).join('');
  $('writing-reviews').querySelectorAll('[data-rubric]').forEach(el=>{el.value=reviews.writing?.[el.dataset.rubric]?.scores?.[el.dataset.dimension]??'';el.onchange=()=>{reviews.writing??={};const v=reviews.writing[el.dataset.rubric]??={};v.scores??={};v.scores[el.dataset.dimension]=el.value;saveReviews();};});
  $('writing-reviews').querySelectorAll('[data-writing-note]').forEach(el=>el.onchange=()=>{reviews.writing??={};const v=reviews.writing[el.dataset.writingNote]??={};v.notes=el.value;saveReviews();});
  const br=rep.instructionalBridge;
  $('bridge').innerHTML=`<h2>Instructional bridge</h2><p>${esc(br.knownHistory)}</p>${br.sequenceProfile.length?'<ol>'+br.sequenceProfile.map(p=>`<li><strong>${esc(p.domain)}</strong>: ${esc(p.status)} — ${esc(p.exposure)}</li>`).join('')+'</ol><p>Last secure sampled stage: '+esc(br.lastSecureSampledStage)+'</p>':''}<p>${esc(br.caution)}</p><h3>Recommended homeschool sequence</h3><ol>${br.recommendedSequence.map(s=>'<li>'+esc(s)+'</li>').join('')}</ol>`;
 }
 function backup(){const attempts={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith(prefix+'Baseline2026_')||k===(cfg.student==='Brody'?'brodyMathDiagnosticV1':'rory_math_baseline_v1')){try{attempts[k]=P&&P.currentKeys.includes(k)?P.read(k):get(k);}catch(error){attempts[k]={recoveryRequired:true};}}}return {...window.ELAParent?.backup(),...window.ScienceParent?.backup(),...window.HistoryParent?.backup(),schemaVersion:2,student:cfg.student,exportedAt:new Date().toISOString(),record:get(cfg.recordKey),attempts,parentReview:reviews,assessmentRecovery:P?.exportArchive()||null,diagnosticReport:report()};}
 function validImportedAttempt(key,value){
  if(!value||typeof value!=='object'||Array.isArray(value)||value.student&&value.student!==cfg.student)return false;
  const mathKey=cfg.student==='Brody'?'brodyMathDiagnosticV1':'rory_math_baseline_v1';
  if(key===mathKey){if(value.itemVersion!==2||!value.answers||typeof value.answers!=='object'||Array.isArray(value.answers))return false;return Object.entries(value.answers).every(([id,answer])=>/^\\d+$/.test(id)&&['A','B','C','D','E'].includes(answer));}
  const subject=key.slice((prefix+'Baseline2026_').length),definition=batteries.find(b=>b.subject===subject);if(!definition||value.subject!==subject||value.version!==definition.version||!value.answers||typeof value.answers!=='object'||Array.isArray(value.answers))return false;
  const ids=new Set(definition.questions.map(q=>String(q.id)));return Object.entries(value.answers).every(([id,answer])=>ids.has(String(id))&&answer&&typeof answer==='object'&&!Array.isArray(answer)&&((answer.choice===undefined||Number.isInteger(answer.choice)&&answer.choice>=0&&answer.choice<=4))&&(answer.text===undefined||typeof answer.text==='string'));
 }
 $('context').onchange=()=>{reviews.context=$('context').value;saveReviews();};
 $('export-report').onclick=()=>download(prefix+'-instructional-bridge.json',JSON.stringify({...report(),elaWritingBridge:window.ELAParent?.backup()},null,2));
 $('export-all').onclick=()=>download(prefix+'-complete-homeschool-record.json',JSON.stringify(backup(),null,2));
 $('export-items').onclick=()=>{const fields=['student','assessment','questionNumber','domain','topic','skill','question','passage','studentResponse','responseText','correctAnswer','classification','exposureResponse','maExpectation','californiaStandardOrDomain','diagnosticBand','role','reviewDate','currentInstructionalClassification','parentalReview'];const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';download(prefix+'-diagnostic-items.csv',[fields.map(quote).join(','),...batteries.flatMap(rowsFor).map(r=>fields.map(k=>quote(k==='parentalReview'?JSON.stringify(r[k]):r[k])).join(','))].join('\r\n'),'text/csv');};
 $('print-parent').onclick=()=>{render();window.print();};
 $('lock-parent').onclick=()=>location.reload();
 $('refresh-parent').onclick=()=>load().catch(e=>alert(e.message));
 $('restore-file').onchange=async e=>{try{
  const file=e.target.files[0];if(!file)return;const imported=JSON.parse(await file.text());
  if((imported?.state?.assessmentAttempts||imported?.assessmentAttempts)&&(!imported.schemaVersion||imported.schemaVersion<2)){
   if(imported.student&&imported.student!==cfg.student)throw new Error('Choose an earlier portal backup for '+cfg.student+'.');
   if(!confirm('Archive these earlier assessment attempts? They will remain historical and will not be converted into the current batteries. A backup will download first.'))return;
   download(prefix+'-before-restore.json',JSON.stringify(backup(),null,2));P.importLegacy(imported,'Imported earlier Rory portal backup');await load();alert('Earlier assessment attempts were preserved in the recovery archive. No current answers were created.');return;
  }
  if(imported.schemaVersion===1&&imported.student===cfg.student&&imported.elaEvidence){
   if(!confirm('Merge this ELA work export? Existing responses take precedence. Missing checkpoints are added. A backup will download first.'))return;
   download(prefix+'-before-restore.json',JSON.stringify(backup(),null,2));window.ELAParent.restore(imported);await load();alert('Backup merged. ELA work preserved.');return;
  }
  if(imported.schemaVersion!==2||imported.student!==cfg.student||!imported.record||!['assignments','assessments','logs','portfolio'].every(k=>Array.isArray(imported.record[k])))throw new Error('Choose a complete export for '+cfg.student+'.');
  window.ScienceParent?.validateImport(imported);
  window.HistoryParent?.validateImport(imported);
  const validatedReadingReview=imported.parentReview?.readingFollowUp?window.ReadingReview.validate(imported.parentReview.readingFollowUp,batteries.find(b=>b.subject==='reading')):null;
  if(!confirm('Merge '+imported.student+'’s backup ('+imported.record.logs.length+' logs, '+imported.record.portfolio.length+' work samples)? Existing records and attempts take precedence when IDs match. A backup will download first.'))return;
  download(prefix+'-before-restore.json',JSON.stringify(backup(),null,2));
  const allowed=[...subjects.map(s=>prefix+'Baseline2026_'+s),cfg.student==='Brody'?'brodyMathDiagnosticV1':'rory_math_baseline_v1'];
  for(const [k,v] of Object.entries(imported.attempts||{}))if(allowed.includes(k)&&v&&typeof v==='object'&&!validImportedAttempt(k,v))throw new Error('The backup contains an unsupported attempt for '+k+'. It was not installed.');
  const before={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.toLowerCase().startsWith(prefix))before[k]=localStorage.getItem(k);}
  const rollback=()=>{for(let i=localStorage.length-1;i>=0;i--){const k=localStorage.key(i);if(k&&k.toLowerCase().startsWith(prefix)&&!(k in before))localStorage.removeItem(k);}for(const [k,v] of Object.entries(before)){try{localStorage.setItem(k,v);}catch(ignored){}}};
  try{
   const current=get(cfg.recordKey)||imported.record;
   for(const k of ['assignments','assessments','logs','portfolio']){const ids=new Set(current[k].map(x=>x.id));for(const item of imported.record[k])if(item.id&&!ids.has(item.id)){current[k].push(item);ids.add(item.id);}}
   localStorage.setItem(cfg.recordKey,JSON.stringify(current));
   for(const [k,v] of Object.entries(imported.attempts||{}))if(allowed.includes(k)&&(P?P.inspect(k).value===null:localStorage.getItem(k)===null)&&v&&typeof v.answers==='object'){if(P&&P.currentKeys.includes(k))P.write(k,v);else localStorage.setItem(k,JSON.stringify(v));}
   window.ELAParent?.restore(imported);window.ScienceParent?.restore(imported);window.HistoryParent?.restore(imported);
   if(imported.parentReview?.readingFollowUp){const incoming=validatedReadingReview;const currentReviews=get(reviewKey)||{};if(!currentReviews.readingFollowUp){currentReviews.readingFollowUp=incoming;localStorage.setItem(reviewKey,JSON.stringify({...imported.parentReview,...currentReviews}));}}
   if(!localStorage.getItem(reviewKey)&&imported.parentReview)localStorage.setItem(reviewKey,JSON.stringify(imported.parentReview));if(imported.assessmentRecovery)P?.mergeRecovery(imported.assessmentRecovery);await load();alert('Backup merged. Existing records and attempts were preserved.');
  }catch(error){rollback();throw error;}
 }catch(error){alert('Restore needs attention: '+error.message);}finally{e.target.value='';}};
 window.addEventListener('beforeprint',()=>{if(loaded){render();document.querySelectorAll('#ela-parent details,#science-parent details,#history-parent details').forEach(d=>d.open=true);}});
 window.addEventListener('afterprint',()=>{if(loaded)render();});
 gate();
})();
