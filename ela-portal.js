(() => {
 'use strict';
 const C=window.ELA_CURRICULUM,S=window.ELAStore;
 let changed=false;
 for(const a of C.assignments){
  let task=data.assignments.find(x=>x.id===a.id);
  if(!task){task={id:a.id,title:a.title,subject:'English Language Arts',due:'',description:a.objective,link:'ela.html?id='+a.id,complete:false,completedDate:'',elaWeek:a.week};data.assignments.push(task);changed=true;}
  const w=S.work(a.id);if(w.complete&&!task.complete){task.complete=true;task.completedDate=(w.updatedAt||'').slice(0,10);changed=true;}
  if(w.complete&&!data.portfolio.some(p=>p.id===a.id)){data.portfolio.push({id:a.id,title:'Week '+a.week+' · '+a.title,subject:'English Language Arts',date:(w.updatedAt||new Date().toISOString()).slice(0,10),description:'Saved writing-process evidence and dated checkpoints. California: '+a.standards.join(', '),link:'ela.html?id='+a.id});changed=true;}
 }
 const select=document.createElement('select');select.id='elaWeekFilter';select.setAttribute('aria-label','ELA week');select.innerHTML='<option value="all">All weeks</option>'+C.weeks.map(w=>`<option value="${w.week}">Week ${w.week}: ${S.esc(w.title)}</option>`).join('');document.querySelector('#assignments .filter-row').append(select);
 const original=renderAssignments;
 renderAssignments=function(){
  original();
  banner.hidden=subjectFilter.value!=='all'&&subjectFilter.value!=='English Language Arts';
  const cards=[...assignmentList.children];
  cards.forEach(card=>{const task=data.assignments.find(x=>x.id===card.dataset.assignmentId);if(!task)return;const a=C.assignments.find(x=>x.id===task.id);
   if(select.value!=='all'&&subjectFilter.value==='English Language Arts'&&a?.week!==Number(select.value)){card.remove();return;}
   if(!a)return;
   card.dataset.elaId=a.id;
   const meta=document.createElement('p');meta.className='meta ela-record-meta';meta.textContent=`Week ${a.week}.${a.sequence} · ${a.effort} · ${a.kind} · CA ${a.standards.join(', ')}`;card.querySelector('h3').after(meta);
   const link=card.querySelector('a');if(link){link.textContent='Open assignment';link.removeAttribute('target');}
   // Completion comes from a saved work checkpoint; the standard portal toggle remains for other tasks.
   const buttons=card.querySelectorAll('.actions button');buttons.forEach(b=>b.remove());
  });
  if(!assignmentList.children.length)assignmentList.innerHTML='<p class="empty">No assignments match these filters.</p>';
 };
 select.onchange=()=>{if(select.value!=='all'){subjectFilter.value='English Language Arts';const science=document.getElementById('scienceWeekFilter');if(science)science.value='all';const history=document.getElementById('historyWeekFilter');if(history)history.value='all';}renderAssignments();};subjectFilter.onchange=renderAssignments;statusFilter.onchange=renderAssignments;
 const banner=document.createElement('div');banner.className='panel ela-assignment-banner';banner.innerHTML='<h3>ELA · My seven-week writing workshop</h3><p>Choose a week. Start with the first unfinished activity. Short tasks are small practice steps; standard tasks can use a longer session. Take breaks when you need them. Your work saves as you go.</p>';
 document.querySelector('#assignments .filter-row').before(banner);
 // Complete exports include private parent material and therefore use the existing parent gate.
 exportJsonBtn.onclick=()=>{location.href='parent.html';};
 exportJsonBtn.textContent='Export Full Record (parent area)';
 if(changed)saveData();else renderAssignments();
 if(location.hash==='#ela'){setView('assignments');subjectFilter.value='English Language Arts';renderAssignments();}
})();
