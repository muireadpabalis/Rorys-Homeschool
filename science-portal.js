/* Add the seven Science weeks to the existing portal without touching the Science Baseline. */
(() => {
 'use strict';
 const S=window.ScienceStore,C=S.C;let changed=false;
 const schedule=[
  {start:'2026-09-08',due:'2026-09-11',label:'Start September 8; Friday checkpoint due September 11.'},
  {start:'2026-09-15',due:'2026-09-18',label:'Start September 15; Friday checkpoint due September 18.'},
  {start:'2026-09-22',due:'2026-09-25',label:'Start September 22; Friday checkpoint due September 25.'},
  {start:'2026-09-29',due:'2026-10-02',label:'Start September 29; Friday checkpoint due October 2.'},
  {start:'2026-10-06',due:'2026-10-09',label:'Start October 6; Friday checkpoint due October 9.'},
  {start:'2026-10-13',due:'2026-10-16',label:'Start October 13; Friday checkpoint due October 16.'},
  {start:'2026-10-20',due:'2026-10-23',label:'Start October 20; Friday checkpoint due October 23.'}
 ];
 try{
  for(const w of C.weeks){const plan=schedule[w.week-1],description=plan.label+' '+w.subtitle+'. '+w.assignment.title+'.';let task=data.assignments.find(x=>x.id===w.id);if(!task){data.assignments.push({id:w.id,title:'Science Week '+w.week+' · '+w.title,subject:'Science',due:plan.due,description,link:'science.html?id='+w.id,complete:false,completedDate:'',scienceWeek:w.week,scienceStart:plan.start});changed=true;}else{if(task.scienceWeek!==w.week){task.scienceWeek=w.week;changed=true;}if(task.link!=='science.html?id='+w.id){task.link='science.html?id='+w.id;changed=true;}if(task.due!==plan.due){task.due=plan.due;changed=true;}if(task.scienceStart!==plan.start){task.scienceStart=plan.start;changed=true;}if(task.description!==description){task.description=description;changed=true;}}}
  if(changed)saveData();S.syncPortal();data=S.read(S.recordKey,data);
  const filter=document.createElement('select');filter.id='scienceWeekFilter';filter.setAttribute('aria-label','Science week');filter.innerHTML='<option value="all">Science: all weeks</option>'+C.weeks.map(w=>`<option value="${w.week}">Science week ${w.week}: ${S.esc(w.title)}</option>`).join('');document.querySelector('#assignments .filter-row').append(filter);
  const banner=document.createElement('section');banner.className='panel science-assignment-banner';banner.innerHTML='<h3>Rory’s Science Lab · Seven-week Grade 3 course</h3><p><strong>Week 1 is ready now:</strong> Thinking Like a Scientist. Build on a strong Science Baseline through hands-on investigations. Every week follows <strong>observe → record data → choose evidence → make a claim</strong>.</p><div class="actions"><a href="science.html?id=science3-w1">Open today’s Science work</a><a href="science.html">Open all seven Science weeks</a><a href="parent.html#science-parent">Parent plan and review</a></div>';document.querySelector('#assignments .filter-row').before(banner);
  const previous=renderAssignments;
  renderAssignments=function(){
   const ela=document.getElementById('elaWeekFilter');if(subjectFilter.value==='Science'&&ela)ela.value='all';if(subjectFilter.value==='English Language Arts')filter.value='all';
   previous();const showScience=subjectFilter.value==='all'||subjectFilter.value==='Science';banner.hidden=!showScience;filter.hidden=!showScience;
   for(const card of [...assignmentList.querySelectorAll('[data-assignment-id]')]){const task=data.assignments.find(x=>x.id===card.dataset.assignmentId);if(!task)continue;if(filter.value!=='all'&&subjectFilter.value==='Science'&&task.scienceWeek!==Number(filter.value)){card.remove();continue;}if(!task.scienceWeek)continue;card.dataset.scienceId=task.id;const w=C.weeks.find(x=>x.id===task.id),meta=document.createElement('p');meta.className='meta';meta.textContent='Week '+w.week+' · Starts '+niceDate(task.scienceStart)+' · checkpoint due '+niceDate(task.due)+' · '+w.scope;card.querySelector('h3').after(meta);card.querySelectorAll('.actions button').forEach(button=>button.remove());const link=card.querySelector('.actions a');if(link){link.textContent='Open Science week';link.removeAttribute('target');}}
   if(!assignmentList.children.length)assignmentList.innerHTML='<p class="empty">No assignments match these filters.</p>';
  };
  filter.onchange=()=>{if(filter.value!=='all'){subjectFilter.value='Science';const ela=document.getElementById('elaWeekFilter');if(ela)ela.value='all';const history=document.getElementById('historyWeekFilter');if(history)history.value='all';}renderAssignments();};
  const ela=document.getElementById('elaWeekFilter');if(ela)ela.addEventListener('change',()=>{if(ela.value!=='all')filter.value='all';renderAssignments();});
  subjectFilter.onchange=()=>{filter.value='all';renderAssignments();};statusFilter.onchange=renderAssignments;
  const report=document.createElement('article');report.className='panel';report.innerHTML='<h3>Seven-week Science record</h3><p>Investigation data, evidence-based explanations, saved checkpoints, assistance, portfolio samples, and parent review.</p><a href="parent.html#science-parent">Open Science teaching records</a>';document.querySelector('#reports .report-grid').append(report);
  renderAll();if(location.hash==='#science'){setView('assignments');subjectFilter.value='Science';renderAssignments();}
 }catch(error){const message=document.createElement('p');message.className='science-alert';message.setAttribute('role','alert');message.textContent='Science course needs attention: '+error.message;document.getElementById('assignments').prepend(message);}
})();
