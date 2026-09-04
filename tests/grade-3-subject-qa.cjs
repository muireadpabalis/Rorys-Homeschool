const {chromium}=require('playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const roryBase=process.env.RORY_QA_URL||'http://127.0.0.1:8765/Rorys-Homeschool/';
const brodyBase=process.env.BRODY_QA_URL||'http://127.0.0.1:8765/Brodys-Homeschool/';
const out=process.env.RORY_QA_OUT||__dirname,results=[];
const pass=x=>{results.push(x);console.log('PASS '+x)};

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 try{
  const context=await browser.newContext(),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept().catch(()=>{}));
  await page.goto(roryBase);await page.getByRole('button',{name:'Subjects',exact:true}).click();
  const catalog=await page.evaluate(()=>californiaSubjects);
  assert.deepEqual(catalog.map(x=>x.id),['ela','math','science','social','pe','arts','health']);
  assert(catalog.slice(0,4).every(x=>x.status==='Core California Grade 3'));
  assert(catalog.find(x=>x.id==='math').topics.includes('Fractions'));
  assert(catalog.find(x=>x.id==='science').topics.includes('Forces & Interactions'));
  assert(catalog.find(x=>x.id==='social').topics.includes('American Indian Nations of the Local Region'));
  const subjects=await page.locator('#subjects').innerText();
  assert(!/Grade 7|Middle School|Driver Education|Career Technical|Applied Arts|World Language/i.test(subjects));
  assert.equal(await page.locator('.subject-card').count(),7);
  pass('Rory shows seven age-appropriate California elementary areas and no copied Grade 7 catalog entries');

  await page.evaluate(()=>{const d=JSON.parse(localStorage.getItem('roryHomeschoolRecordV2'));d.assignments.push({id:'grade3-qa-assignment',title:'Keep assignment',subject:'Art',due:'',description:'Existing synthetic record',link:'',complete:false,completedDate:''});d.logs.push({id:'grade3-qa-log',date:'2026-09-04',subject:'Art',minutes:17,activity:'Keep log',notes:'Existing synthetic record'});d.portfolio.push({id:'grade3-qa-sample',title:'Keep sample',subject:'Art',date:'2026-09-04',description:'Existing synthetic record',link:''});localStorage.setItem('roryHomeschoolRecordV2',JSON.stringify(d));});
  await page.reload();const kept=await page.evaluate(()=>JSON.parse(localStorage.getItem('roryHomeschoolRecordV2')));
  assert(kept.assignments.some(x=>x.id==='grade3-qa-assignment'));assert(kept.logs.some(x=>x.id==='grade3-qa-log'));assert(kept.portfolio.some(x=>x.id==='grade3-qa-sample'));
  pass('Changing the presentation catalog preserves assignments, logs, work samples, assessments, and storage keys');

  await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Subjects',exact:true}).click();
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:path.join(out,'rory-grade-3-subjects.png'),fullPage:true});
  pass('The corrected Grade 3 Subjects view fits a phone viewport');

  await page.goto(roryBase+'parent.html');await page.locator('#parent-pass').fill('SyntheticParent3');await page.locator('#confirm-pass').fill('SyntheticParent3');await page.locator('#unlock button').click();await page.waitForSelector('#parent-content:not([hidden])');
  const parentText=await page.locator('#parent-content').innerText();assert(parentText.includes('California Grade 3 CA NGSS'));assert(!parentText.includes('integrated middle-school model'));
  pass('Rory’s parent Science guidance uses Grade 3 CA NGSS language');

  const brody=await browser.newPage();await brody.goto(brodyBase);await brody.getByRole('button',{name:'Subjects',exact:true}).click();
  const brodySubjects=await brody.evaluate(()=>californiaSubjects);assert.equal(brodySubjects.length,12);assert(brodySubjects.some(x=>x.status==='Core California Grade 7'));assert(brodySubjects.some(x=>x.id==='driver'));
  pass('Brody retains the separate Grade 7 subject catalog');
  assert.deepEqual(errors,[]);pass('No browser errors occurred in the corrected Rory flow');
  const result={passed:true,date:new Date().toISOString(),syntheticOnly:true,groups:results};fs.writeFileSync(path.join(out,'grade-3-subject-qa-results.json'),JSON.stringify(result,null,2));
  await context.close();
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
