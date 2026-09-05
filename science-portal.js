/* Add the seven Science weeks to the existing portal without touching the Science Baseline. */
(() => {
 'use strict';
 const S=window.ScienceStore,C=S.C;let changed=false;
 try{
  for(const w of C.weeks){let task=data.assignments.find(x=>x.id===w.id);if(!task){data.assignments.push({id:w.id,title:'Science Week '+w.week+' · '+w.title,subject:'Science',due:'',description:w.subtitle+'. '+w.assignment.title+'.',link:'science.html?id='+w.id,complete:false,completedDate:'',scienceWeek:w.week});changed=true;}else{if(!task.scienceWeek){task.scienceWeek=w.week;changed=true;}if(!task.link){task.link='science.html?id='+w.id;changed=true;}}}
  if(changed)saveData();S.syncPortal();data=S.read(S.recordKey,data);
  const filter=document.createElement('select');filter.id='scienceWeekFilter';filter.setAttribute('aria-label','Science week');filter.innerHTML='<option value="all">Science: all weeks</option>'+C.weeks.map(w=>`<option value="${w.week}">Science week ${w.week}: ${S.esc(w.title)}</option>`).join('');document.querySelector('#assignments .filter-row').append(filter);
  const banner=document.createElement('section');banner.className='panel science-assignment-banner';banner.innerHTML='<h3>Rory’s Science Lab · Seven-week Grade 3 course</h3><p>Build on a strong Science Baseline through hands-on investigations. Every week follows <strong>observe → record data → choose evidence → make a claim</strong>.</p><div class="actions"><a href="science.html">Open all seven Science weeks</a><a href="parent.html#science-parent">Parent plan and review</a></div>';document.querySelector('#assignments .filter-row').before(banner);
  const previous=renderAssignments;
  renderAssignments=function(){
   const ela=document.getElementById('elaWeekFilter');if(subjectFilter.value==='Science'&&ela)ela.value='all';if(subjectFilter.value==='English Language Arts')filter.value='all';
   previous();const showScience=subjectFilter.value==='all'||subjectFilter.value==='Science';banner.hidden=!showScience;filter.hidden=!showScience;
   for(const card of [...assignmentList.querySelectorAll('[data-assignment-id]')]){const task=data.assignments.find(x=>x.id===card.dataset.assignmentId);if(!task)continue;if(filter.value!=='all'&&subjectFilter.value==='Science'&&task.scienceWeek!==Number(filter.value)){card.remove();continue;}if(!task.scienceWeek)continue;card.dataset.scienceId=task.id;const w=C.weeks.find(x=>x.id===task.id),meta=document.createElement('p');meta.className='meta';meta.textContent='Week '+w.week+' · '+w.scope+' · Evidence checkpoint and parent review';card.querySelector('h3').after(meta);card.querySelectorAll('.actions button').forEach(button=>button.remove());const link=card.querySelector('.actions a');if(link){link.textContent='Open Science week';link.removeAttribute('target');}}
   if(!assignmentList.children.length)assignmentList.innerHTML='<p class="empty">No assignments match these filters.</p>';
  };
  filter.onchange=()=>{if(filter.value!=='all'){subjectFilter.value='Science';const ela=document.getElementById('elaWeekFilter');if(ela)ela.value='all';const history=document.getElementById('historyWeekFilter');if(history)history.value='all';}renderAssignments();};
  const ela=document.getElementById('elaWeekFilter');if(ela)ela.addEventListener('change',()=>{if(ela.value!=='all')filter.value='all';renderAssignments();});
  subjectFilter.onchange=()=>{filter.value='all';renderAssignments();};statusFilter.onchange=renderAssignments;
  const report=document.createElement('article');report.className='panel';report.innerHTML='<h3>Seven-week Science record</h3><p>Investigation data, evidence-based explanations, saved checkpoints, assistance, portfolio samples, and parent review.</p><a href="parent.html#science-parent">Open Science teaching records</a>';document.querySelector('#reports .report-grid').append(report);
  renderAll();if(location.hash==='#science'){setView('assignments');subjectFilter.value='Science';renderAssignments();}
 }catch(error){const message=document.createElement('p');message.className='science-alert';message.setAttribute('role','alert');message.textContent='Science course needs attention: '+error.message;document.getElementById('assignments').prepend(message);}
})();
