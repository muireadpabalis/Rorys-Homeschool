(() => {
 'use strict';
 const S=window.ELAStore,C=window.ELA_CURRICULUM,e=S.esc,$=id=>document.getElementById(id);
 const a=C.assignments.find(x=>x.id===new URLSearchParams(location.search).get('id'));
 if(!a){$('ela-app').innerHTML='<h1>Choose a writing activity</h1><p>Go back to ELA assignments to choose your activity.</p>';return;}
 let state;try{state=S.work(a.id);}catch(error){$('ela-app').innerHTML='<h1>Ask a parent for help with saved work</h1><p>Your saved record has not been changed.</p>';return;}
 document.title=a.title+' · Rory';
 function status(text){$('ela-status').textContent=text;}
 function persist(fn){try{state=S.save(a.id,fn);status('Saved on this device.');return true;}catch(error){status('Not saved. Download your work and ask a parent for help. '+error.message);return false;}}
 function field(f){return `<label for="${f.id}">${e(f.label)}${f.type==='select'?`<select id="${f.id}" data-field="${f.id}"><option value="">Choose…</option>${f.options.map(v=>`<option ${state.fields[f.id]===v?'selected':''}>${e(v)}</option>`).join('')}</select>`:`<textarea id="${f.id}" data-field="${f.id}" rows="${f.rows||4}" spellcheck="${!a.independent}" autocorrect="off" autocapitalize="off" autocomplete="off">${e(state.fields[f.id]||'')}</textarea>`}</label>`;}
 function prior(){return C.assignments.filter(x=>x.week<=a.week&&(x.week<a.week||x.sequence<a.sequence)).filter(x=>S.work(x.id).snapshots.length).map(x=>{const w=S.work(x.id);return `<details><summary>Week ${x.week}: ${e(x.title)}</summary>${x.fields.map(f=>`<h4>${e(f.label)}</h4><div class="ela-response">${e(w.fields[f.id]||'')}</div>`).join('')}</details>`;}).join('');}
 function render(){
  const released=S.read(S.prefix+'releases',{})[a.id],prompt=a.release?released?.prompt:a.prompt;
  $('ela-app').innerHTML=`<p class="eyebrow" style="margin-top:24px">Week ${a.week} · Activity ${a.sequence}</p><h1>${e(a.title)}</h1><p>${e(a.objective)}</p><div class="ela-meta"><span class="badge">${e(a.kind)}</span><span class="badge">${e(a.effort)}</span></div><p id="ela-status" class="ela-status" role="status" aria-live="polite"></p><div id="ela-body"></div>`;
  if(a.release&&!prompt){$('ela-body').innerHTML='<section class="panel"><h2>A new writing task</h2><p>Your parent will open your new prompt when it is time.</p><button id="check-prompt" class="button">Check for my prompt</button></section>';$('check-prompt').onclick=()=>location.reload();return;}
  if(a.requires&&!S.work(a.requires).snapshots.length){$('ela-body').innerHTML=`<section class="panel"><h2>Save your plan first</h2><p><a href="ela.html?id=${a.requires}">Open your earlier planning activity</a>. Save its checkpoint, then come back here.</p></section>`;return;}
  let html=a.independent?`<section class="panel"><h2>My prompt</h2><p class="ela-response">${e(prompt)}</p><p>Use your own ideas and words. Blank planning paper is okay. Take breaks when you need them.</p></section>`:`<section class="panel"><h2>${a.kind==='PARENT INSTRUCTION'?'Read together':'Notice'}</h2><p>${e(a.lesson)}</p><h2>Try it</h2><ol>${a.directions.map(d=>`<li>${e(d)}</li>`).join('')}</ol></section>`;
  const stage=state.stage||0,active=a.independent?[a.fields[stage]]:a.fields;
  if(!a.independent||stage<3){
   html+=`<section class="panel ${a.organizer?'ela-organizer':''}"><h2>${a.independent?`${stage+1} of 3 · ${e(active[0].label)}`:'My work'}</h2>`;
   if(a.independent&&stage===0)html+='<p>You may use this blank space for your plan or plan on paper.</p>';
   if(a.independent&&stage===2)html+='<p>Reread your writing. Make any changes you choose. You can keep your words as they are.</p><button class="button secondary no-print" id="use-draft">Use my first writing</button>';
   html+=active.map(field).join('');
   html+=(a.checklist||[]).map((text,i)=>`<label class="ela-check"><input type="checkbox" data-check="c${i}" ${state.checks['c'+i]?'checked':''}>${e(text)}</label>`).join('');
   html+=`<div class="ela-toolbar no-print"><button id="save-work" class="button secondary">Save for later</button><button id="checkpoint" class="button">${a.independent?(stage===2?'Save my work sample':'Save this step'):'Save checkpoint & finish activity'}</button></div><p class="privacy-note">Your work saves as you type. A checkpoint keeps a dated copy.</p></section>`;
  }else html+='<section class="panel"><h2>Your work sample is saved</h2><p>Your plan, first writing, and final writing are kept together.</p></section>';
  if(a.independent&&stage>0)html+='<section class="panel"><h2>My saved steps</h2>'+a.fields.slice(0,stage).map(f=>`<details><summary>${e(f.label)}</summary><div class="ela-response">${e(state.fields[f.id]||'(Blank planning space)')}</div></details>`).join('')+'</section>';
  if(!a.independent&&a.mini)html+=`<section class="panel"><h2>Quick language check</h2><p>${e(a.mini)}</p></section>`;
  if(!a.independent)html+=`<details class="panel"><summary>Open my earlier saved work</summary>${prior()||'<p>Your earlier writing will appear here after you save it.</p>'}</details>`;
  html+=`<div class="ela-toolbar no-print"><button id="export-work" class="button secondary">Download my writing</button><a href="index.html#ela">Back to ELA assignments</a></div><details><summary>Activity information</summary><p>California: ${e(a.standards.join(', '))}</p>${a.prerequisite?`<p>${e(a.prerequisite)}</p>`:''}<p>Skill practice: ${a.skills.map(s=>e(C.skills[s])).join('; ')}.</p></details><details id="history"><summary>My saved checkpoints</summary>${state.snapshots.map(s=>`<details><summary>${e(s.label)} · ${e(new Date(s.at).toLocaleString())}</summary>${Object.entries(s.fields).map(([id,v])=>`<h4>${e(a.fields.find(f=>f.id===id)?.label||id)}</h4><div class="ela-response">${e(v)}</div>`).join('')}</details>`).join('')}</details>`;
  $('ela-body').innerHTML=html;
  // Assign values as properties too: HTML parsing otherwise removes a leading textarea newline.
  document.querySelectorAll('[data-field]').forEach(el=>{el.value=state.fields[el.dataset.field]??'';});
  document.querySelectorAll('[data-field]').forEach(el=>el.addEventListener(el.tagName==='SELECT'?'change':'input',()=>{state.fields[el.dataset.field]=el.value;persist(w=>{w.fields[el.dataset.field]=el.value;});}));
  document.querySelectorAll('[data-check]').forEach(el=>el.onchange=()=>persist(w=>{w.checks[el.dataset.check]=el.checked;}));
  if($('save-work'))$('save-work').onclick=flush;
  if($('checkpoint'))$('checkpoint').onclick=()=>checkpoint(prompt);
  if($('use-draft'))$('use-draft').onclick=()=>{if($('f3').value&&!confirm('Replace the current final-writing box with your saved first writing?'))return;$('f3').value=state.fields.f2||'';flush();};
  $('export-work').onclick=()=>{const all=S.evidence();all[a.id]=state;S.download('rory-ela-work.json',{schemaVersion:1,student:'Rory',schoolYear:C.schoolYear,exportedAt:new Date().toISOString(),curriculum:C,elaEvidence:all,elaReleases:S.read(S.prefix+'releases',{})});};
  status(state.updatedAt?'Your saved work is ready.':'Ready. Your words save as you type.');
 }
 function flush(){const fields=Object.fromEntries([...document.querySelectorAll('[data-field]')].map(el=>[el.dataset.field,el.value]));return persist(w=>{Object.assign(w.fields,fields);});}
 function checkpoint(prompt){
  if(!flush())return;
  const stage=state.stage||0,fields=a.independent?[a.fields[stage]]:a.fields;
  if(fields.every(f=>!f.optional&&!state.fields[f.id]?.trim())){status('Add your response, or save for later and come back.');return;}
  if(!a.independent&&a.fields.some(f=>f.type==='select'&&!state.fields[f.id])){status('Make a choice for each sorting item, or save for later.');return;}
  if(!persist(w=>{w.snapshots.push({id:crypto.randomUUID(),at:new Date().toISOString(),label:a.independent?a.fields[stage].label:'Activity checkpoint',fields:structuredClone(w.fields),checks:structuredClone(w.checks),prompt:prompt||null,standards:a.standards,skills:a.skills});if(a.independent)w.stage=stage+1;w.complete=!a.independent||w.stage===3;w.prompt=prompt||null;}))return;
  if(state.complete){try{const d=S.read(PORTAL.recordKey);if(d){const task=d.assignments.find(x=>x.id===a.id);if(task){task.complete=true;task.completedDate=state.updatedAt.slice(0,10);}if(!d.portfolio.some(p=>p.id===a.id))d.portfolio.push({id:a.id,title:'Week '+a.week+' · '+a.title,subject:'English Language Arts',date:state.updatedAt.slice(0,10),description:'Saved writing, checkpoints, and skill evidence. CA '+a.standards.join(', '),link:'ela.html?id='+a.id});S.write(PORTAL.recordKey,d);}}catch(error){status('Your writing is saved. Ask a parent to refresh the assignment list.');return;}}
  render();status(state.complete?'Saved. You finished this activity.':'This step is saved. Continue when you are ready.');
 }
 window.addEventListener('storage',event=>{if(event.key===S.prefix+a.id){status('This activity changed in another tab. Download this copy and reload before writing more.');document.querySelectorAll('input,select,textarea,button').forEach(el=>{if(el.id!=='export-work')el.disabled=true;});}});
 render();
})();
