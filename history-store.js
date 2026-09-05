/* History course records are additive and separate from every baseline assessment key. */
(() => {
 'use strict';
 const C=window.HISTORY_COURSE,prefix='roryHistoryBridge2026_',parentKey='roryHistoryParent2026',recordKey='roryHomeschoolRecordV2';
 const weeks=()=>C.weeks;
 const commonFields=[{id:'assistance',required:true},{id:'artifact',required:false},{id:'workSampleNote',required:false}];
 const allFields=w=>[...w.investigations.flatMap(x=>x.fields),...w.assignment.fields,...w.exit,...commonFields];
 const fieldIds=w=>new Set(allFields(w).map(x=>x.id));
 const checkIds=w=>new Set(w.investigations.flatMap(x=>x.checks||[]).map(x=>x[0]));
 const read=(key,fallback=null)=>{const raw=localStorage.getItem(key);return raw===null?fallback:JSON.parse(raw);};
 const write=(key,value)=>localStorage.setItem(key,JSON.stringify(value));
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const blank=()=>({schemaVersion:1,fields:{},taskChecks:{},snapshots:[],complete:false,completedAt:null,updatedAt:null});
 const date=x=>typeof x==='string'&&Number.isFinite(Date.parse(x));
 function validateWork(id,value){
  const week=weeks().find(x=>x.id===id);if(!week)throw Error('Unknown History week.');
  const ids=fieldIds(week),checks=checkIds(week),object=x=>x&&typeof x==='object'&&!Array.isArray(x);
  if(!object(value)||value.schemaVersion!==1||!object(value.fields)||!object(value.taskChecks)||!Array.isArray(value.snapshots)||typeof value.complete!=='boolean'||(value.updatedAt!==null&&!date(value.updatedAt))||(value.completedAt!==null&&!date(value.completedAt)))throw Error('History work has an unsupported format. Existing data was preserved.');
  if(Object.entries(value.fields).some(([k,v])=>!ids.has(k)||typeof v!=='string'))throw Error('History response fields need recovery.');
  if(Object.entries(value.taskChecks).some(([k,v])=>!checks.has(k)||typeof v!=='boolean'))throw Error('History activity checks need recovery.');
  const snapshotIds=new Set();for(const s of value.snapshots){if(!s||typeof s.id!=='string'||!s.id||snapshotIds.has(s.id)||!date(s.at)||!s.fields||!s.taskChecks)throw Error('Invalid History checkpoint.');snapshotIds.add(s.id);}
  if(value.complete&&(!value.completedAt||!value.snapshots.length))throw Error('Completed History work is missing its checkpoint.');
  value.snapshots.sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));return value;
 }
 function work(id){return validateWork(id,read(prefix+id,blank()));}
 function save(id,update){const value=work(id);update(value);value.updatedAt=new Date().toISOString();validateWork(id,value);write(prefix+id,value);return value;}
 function evidence(){return Object.fromEntries(weeks().map(w=>[w.id,read(prefix+w.id)]).filter(([,v])=>v).map(([id,v])=>[id,validateWork(id,v)]));}
 function parent(){const value=read(parentKey,{schemaVersion:1,weeks:{},summary:''});if(!value||value.schemaVersion!==1||!value.weeks||typeof value.weeks!=='object'||Array.isArray(value.weeks)||typeof value.summary!=='string')throw Error('History parent records need recovery; nothing was overwritten.');return value;}
 const download=(name,value,type='application/json')=>{const text=typeof value==='string'?value:JSON.stringify(value,null,2),url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 function backup(includeParent=false){return {schemaVersion:1,courseVersion:C.version,weekRecords:evidence(),...(includeParent?{parentReview:parent()}: {})};}
 function restorePlan(incoming){
  if(!incoming)return [];
  if(incoming.schemaVersion!==1||incoming.courseVersion!==C.version||!incoming.weekRecords||Array.isArray(incoming.weekRecords))throw Error('Choose a supported History course export.');
  const valid=new Set(weeks().map(w=>w.id)),plans=[];
  for(const [id,value] of Object.entries(incoming.weekRecords)){
   if(!valid.has(id))throw Error('Unknown History week in backup.');validateWork(id,value);
   const current=read(prefix+id);if(!current){plans.push([prefix+id,value]);continue;}validateWork(id,current);
   const snapshotIds=new Set(current.snapshots.map(s=>s.id)),snapshots=current.snapshots.slice();for(const s of value.snapshots)if(!snapshotIds.has(s.id)){snapshots.push(s);snapshotIds.add(s.id);}snapshots.sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));
   const complete=current.complete||value.complete,completedAt=current.completedAt||value.completedAt;
   plans.push([prefix+id,{...value,...current,fields:{...value.fields,...current.fields},taskChecks:{...value.taskChecks,...current.taskChecks},snapshots,complete,completedAt,updatedAt:current.updatedAt||value.updatedAt}]);
  }
  if(incoming.parentReview){const p=incoming.parentReview;if(!p||p.schemaVersion!==1||!p.weeks||typeof p.summary!=='string')throw Error('Invalid History parent review.');const current=parent();plans.push([parentKey,{...p,...current,weeks:{...p.weeks,...current.weeks},summary:current.summary||p.summary}]);}
  return plans;
 }
 function restore(incoming){const plans=restorePlan(incoming),before=plans.map(([key])=>[key,localStorage.getItem(key)]);try{plans.forEach(([key,value])=>write(key,value));}catch(error){for(const [key,value] of before){try{value===null?localStorage.removeItem(key):localStorage.setItem(key,value);}catch(ignored){}}throw error;}}
 function syncPortal(){
  const record=read(recordKey);if(!record)return;
  if(!['assignments','assessments','logs','portfolio'].every(k=>Array.isArray(record[k])))throw Error('The school record needs recovery. History work was kept separate.');
  const saved=evidence();let changed=false;
  for(const week of weeks()){
   const value=saved[week.id];if(!value?.complete)continue;
   const task=record.assignments.find(x=>x.id===week.id);if(task&&!task.complete){task.complete=true;task.completedDate=value.completedAt.slice(0,10);changed=true;}
   if(!record.portfolio.some(x=>x.id===week.id)){record.portfolio.push({id:week.id,title:'History Week '+week.week+' · '+week.title,subject:'History–Social Science',date:value.completedAt.slice(0,10),description:'Saved map, source, investigation, evidence, explanation, and end check. Portfolio work: '+week.portfolio+' Completion is not a mastery grade. Standards: '+week.standards.join(', '),link:'history.html?id='+week.id});changed=true;}
  }
  if(changed)write(recordKey,record);return record;
 }
 window.HistoryStore={C,prefix,parentKey,recordKey,weeks,commonFields,allFields,fieldIds,checkIds,read,write,esc,blank,validateWork,work,save,evidence,parent,download,backup,restorePlan,restore,syncPortal};
})();

\n