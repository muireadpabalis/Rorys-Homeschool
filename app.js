const STORE = "roryHomeschoolCompleteV2";

const SUBJECTS = [
  {name:"Reading",icon:"📚",skills:["Fluency and accuracy","Literature comprehension","Informational-text comprehension","Vocabulary and context clues","Main idea, details, inference"]},
  {name:"Writing",icon:"✏️",skills:["Complete sentences","Paragraph development","Narrative and informative writing","Spelling and conventions","Revision and editing"]},
  {name:"Language & Grammar",icon:"🔤",skills:["Nouns, verbs, adjectives","Capitalization and punctuation","Verb tense","Prefixes and suffixes","Sentence structure"]},
  {name:"Math",icon:"➗",skills:["Place value","Addition and subtraction","Multiplication and division concepts","Fractions","Measurement, time, money, data","Geometry and problem solving"]},
  {name:"Science",icon:"🔬",skills:["Life science","Earth and space","Matter and forces","Weather and environment","Observation and evidence"]},
  {name:"Social Studies",icon:"🌎",skills:["Maps and geography","Communities","History and change over time","Civics and government","Economics basics"]},
  {name:"Study Skills",icon:"🧠",skills:["Following directions","Planning and organization","Persistence","Checking work","Explaining thinking"]},
  {name:"Technology",icon:"💻",skills:["Keyboard and mouse","File awareness","Digital citizenship","Internet safety","Using learning tools"]},
  {name:"Art & Music",icon:"🎨",skills:["Creative expression","Visual arts","Music appreciation","Projects and performance"]},
  {name:"Health & PE",icon:"🏃",skills:["Physical activity","Safety","Nutrition and health","Healthy routines"]}
];

const ASSIGNMENTS = [
  {id:"read20",subject:"Reading",title:"Independent Reading",desc:"Read a book of your choice for 20 minutes. Tell an adult the beginning, middle, and end.",minutes:20},
  {id:"mascot",subject:"Art & Music",title:"Create a Homeschool Mascot",desc:"Draw a mascot for your homeschool. Give it a name, personality, and special learning power.",minutes:30},
  {id:"nature",subject:"Science",title:"Backyard Scientist",desc:"Observe something outdoors for 15 minutes. Draw it and write three things you notice.",minutes:25},
  {id:"maphome",subject:"Social Studies",title:"Map My Home",desc:"Draw a simple map of one room or part of your home. Add a title, symbols, and a key.",minutes:30},
  {id:"movement",subject:"Health & PE",title:"Movement Challenge",desc:"Complete 30 minutes of active play, walking, biking, sports, or another physical activity.",minutes:30},
  {id:"type",subject:"Technology",title:"Keyboard Explorer",desc:"Practice typing your first name, the alphabet, and five complete sentences.",minutes:20}
];

const ASSESSMENTS = [
{
 id:"math", title:"Math Baseline", subject:"Math", time:"35–50 min",
 description:"End-of-Grade-2 skills plus a small sample of Grade 3 readiness.",
 questions:[
  q("m1","Place Value","What is the value of the 6 in 462?",["6","60","600","46"],"60"),
  q("m2","Place Value","Which number is greatest?",["398","389","983","839"],"983"),
  q("m3","Place Value","Which number is 500 + 30 + 7?",["537","573","507","357"],"537"),
  q("m4","Addition","46 + 27 = ?",["63","73","83","74"],"73"),
  q("m5","Addition","158 + 236 = ?",["384","394","404","294"],"394"),
  q("m6","Subtraction","82 - 35 = ?",["47","57","53","46"],"47"),
  q("m7","Subtraction","400 - 176 = ?",["224","234","324","214"],"224"),
  q("m8","Word Problems","Maya has 38 stickers. She gets 25 more. How many stickers does she have now?",["53","63","73","62"],"63"),
  q("m9","Word Problems","There are 71 apples. 29 are used. How many are left?",["42","52","48","41"],"42"),
  q("m10","Equal Groups","There are 4 bags with 3 marbles in each bag. How many marbles are there?",["7","10","12","14"],"12"),
  q("m11","Arrays","Which multiplication sentence matches 3 rows of 5?",["3 + 5 = 8","3 × 5 = 15","5 - 3 = 2","15 ÷ 5 = 5"],"3 × 5 = 15"),
  q("m12","Division Concepts","12 crackers are shared equally among 3 children. How many does each child get?",["3","4","6","9"],"4"),
  q("m13","Fractions","A sandwich is cut into 4 equal pieces. You eat 1 piece. What fraction did you eat?",["1/2","1/3","1/4","4/1"],"1/4"),
  q("m14","Fractions","Which is larger?",["1/2","1/4","They are equal","Cannot tell"],"1/2"),
  q("m15","Time","School starts at 9:00 AM. One hour later it is:",["8:00 AM","9:30 AM","10:00 AM","10:00 PM"],"10:00 AM"),
  q("m16","Time","Half past 3 means:",["3:15","3:30","4:30","2:30"],"3:30"),
  q("m17","Money","Which amount equals 75 cents?",["3 quarters","7 dimes","2 quarters","1 quarter and 1 dime"],"3 quarters"),
  q("m18","Measurement","Which is the best unit to measure the length of a pencil?",["miles","inches","gallons","pounds"],"inches"),
  q("m19","Data","A class survey shows 5 cats, 8 dogs, and 3 fish. Which pet got the most votes?",["cats","dogs","fish","all equal"],"dogs"),
  q("m20","Geometry","How many sides does a hexagon have?",["4","5","6","8"],"6"),
  q("m21","Geometry","Which shape always has 4 equal sides and 4 right angles?",["triangle","square","pentagon","circle"],"square"),
  q("m22","Grade 3 Readiness","6 × 4 = ?",["10","20","24","64"],"24"),
  q("m23","Grade 3 Readiness","24 ÷ 6 = ?",["3","4","5","6"],"4"),
  q("m24","Grade 3 Readiness","Round 47 to the nearest ten.",["40","45","50","60"],"50"),
  q("m25","Reasoning","Sam says 39 + 21 is about 60. Is his estimate reasonable?",["Yes","No"],"Yes")
 ]
},
{
 id:"reading",title:"Reading Baseline",subject:"Reading",time:"30–40 min",
 description:"Literature and informational-text comprehension, vocabulary, evidence, sequence, and inference.",
 passages:[
  {title:"The Lost Kite",text:"On Saturday, Nora took her bright yellow kite to the park. At first, the wind was gentle, and the kite barely lifted from the grass. Then a stronger breeze swept across the field. The kite climbed higher and higher. Nora laughed as she let out more string. Suddenly, the string slipped from her hand. The kite sailed over the trees and disappeared. Nora and her brother searched near the playground, the pond, and the picnic tables. At last, her brother pointed to a tall oak tree. A flash of yellow fluttered between the branches. They could not reach it, so they asked a park worker for help. Using a long pole, the worker carefully brought the kite down. Nora thanked him and tied the string tightly around her wrist before flying the kite again."},
  {title:"Why Bees Visit Flowers",text:"Bees visit flowers to collect nectar and pollen. Nectar is a sweet liquid that gives bees energy. Pollen is a fine powder made by flowers. As a bee crawls across a flower, grains of pollen stick to its fuzzy body. When the bee visits another flower, some of the pollen rubs off. This helps many plants make seeds and fruit. The plant helps the bee by providing food, and the bee helps the plant by carrying pollen. This kind of relationship benefits both living things."}
 ],
 questions:[
  q("r1","Literature: Key Details","What color is Nora's kite?",["red","yellow","green","blue"],"yellow","The Lost Kite"),
  q("r2","Literature: Sequence","What happens right after the string slips from Nora's hand?",["The kite disappears over the trees.","Nora goes home.","The park worker arrives.","The wind stops."],"The kite disappears over the trees.","The Lost Kite"),
  q("r3","Literature: Setting","Where does the story take place?",["at school","at a park","at a beach","at a store"],"at a park","The Lost Kite"),
  q("r4","Literature: Inference","Why does Nora tie the string around her wrist at the end?",["She wants the kite to look nicer.","She does not want to lose it again.","Her brother tells her to go home.","The string is too short."],"She does not want to lose it again.","The Lost Kite"),
  q("r5","Literature: Character","Which word best describes the park worker?",["helpful","angry","careless","confused"],"helpful","The Lost Kite"),
  q("r6","Vocabulary","In the story, fluttered most nearly means:",["moved lightly back and forth","fell straight down","made a loud sound","became invisible"],"moved lightly back and forth","The Lost Kite"),
  q("r7","Main Idea","What is the story mostly about?",["Nora learns to climb trees.","Nora loses her kite and gets it back.","Nora buys a new kite.","A worker closes the park."],"Nora loses her kite and gets it back.","The Lost Kite"),
  q("r8","Text Evidence","Who first spots the kite in the oak tree?",["Nora","her brother","the park worker","a friend"],"her brother","The Lost Kite"),
  q("r9","Informational: Key Details","What do bees collect from flowers?",["water and leaves","nectar and pollen","seeds and soil","fruit and bark"],"nectar and pollen","Why Bees Visit Flowers"),
  q("r10","Informational: Vocabulary","What is pollen?",["a sweet liquid","a fine powder made by flowers","a kind of bee","a flower petal"],"a fine powder made by flowers","Why Bees Visit Flowers"),
  q("r11","Informational: Cause & Effect","What happens when pollen rubs off a bee onto another flower?",["It can help the plant make seeds and fruit.","The bee loses its wings.","The flower turns blue.","The nectar disappears."],"It can help the plant make seeds and fruit.","Why Bees Visit Flowers"),
  q("r12","Informational: Main Idea","What is the passage mostly explaining?",["Why bees and flowers help each other","How to grow a garden indoors","Why all insects make honey","How flowers get their colors"],"Why bees and flowers help each other","Why Bees Visit Flowers"),
  q("r13","Informational: Details","What gives bees energy?",["pollen","nectar","seeds","leaves"],"nectar","Why Bees Visit Flowers"),
  q("r14","Informational: Structure","Which sentence best describes the relationship in the passage?",["Only the bee benefits.","Only the plant benefits.","The bee and plant both benefit.","Neither living thing benefits."],"The bee and plant both benefit.","Why Bees Visit Flowers"),
  q("r15","Vocabulary in Context","Benefits most nearly means:",["helps","hides","frightens","changes"],"helps","Why Bees Visit Flowers"),
  q("r16","Grade 3 Readiness","Which detail best supports the idea that bees help plants?",["Nectar is sweet.","Pollen sticks to a bee's fuzzy body.","Pollen can rub off on another flower and help it make seeds.","Bees have energy."],"Pollen can rub off on another flower and help it make seeds.","Why Bees Visit Flowers")
 ]
},
{
 id:"language",title:"Language & Grammar Baseline",subject:"Language & Grammar",time:"20–30 min",
 description:"Sentences, parts of speech, capitalization, punctuation, spelling patterns, and vocabulary.",
 questions:[
  q("l1","Sentences","Which is a complete sentence?",["Running very fast.","The small dog barked.","Because it was raining.","Under the table."],"The small dog barked."),
  q("l2","Capitalization","Which sentence is written correctly?",["we went to Boston on monday.","We went to boston on Monday.","We went to Boston on Monday.","we went to Boston on Monday."],"We went to Boston on Monday."),
  q("l3","Punctuation","Which mark belongs at the end? Where is my backpack",[".",",","?","!"],"?"),
  q("l4","Nouns","Which word is a noun?",["jump","happy","river","quickly"],"river"),
  q("l5","Verbs","Which word is the verb? The birds sing loudly.",["birds","sing","loudly","the"],"sing"),
  q("l6","Adjectives","Which word describes the noun? The fluffy cat slept.",["the","fluffy","cat","slept"],"fluffy"),
  q("l7","Plural Nouns","What is the plural of puppy?",["puppys","puppies","puppyes","puppy"],"puppies"),
  q("l8","Verb Tense","Yesterday I ___ to the store.",["walk","walks","walked","walking"],"walked"),
  q("l9","Contractions","Which contraction means do not?",["don't","doesn't","didn't","can't"],"don't"),
  q("l10","Possessives","Which sentence shows that the ball belongs to Mia?",["Mias ball is red.","Mia's ball is red.","Mias' ball is red.","Mia ball's is red."],"Mia's ball is red."),
  q("l11","Spelling","Which word is spelled correctly?",["becaus","because","becose","beacause"],"because"),
  q("l12","Prefixes","What does unhappy mean?",["very happy","not happy","happy again","before happy"],"not happy"),
  q("l13","Suffixes","A person who teaches is a:",["teachful","teacher","teaching","reteach"],"teacher"),
  q("l14","Synonyms","Which word means about the same as big?",["tiny","large","quiet","slow"],"large"),
  q("l15","Antonyms","Which word is the opposite of early?",["late","fast","soon","first"],"late"),
  q("l16","Grade 3 Readiness","Choose the best way to combine: I like apples. I like oranges.",["I like apples and oranges.","I like apples because oranges.","I like apples but.","Apples I oranges like."],"I like apples and oranges.")
 ]
},
{
 id:"science",title:"Science Baseline",subject:"Science",time:"20–30 min",
 description:"Life, Earth and space, matter, forces, weather, and scientific thinking.",
 questions:[
  q("s1","Living Things","Which is living?",["rock","tree","cloud","pencil"],"tree"),
  q("s2","Plants","What do most plants need to grow?",["sunlight, water, air","plastic, sand, salt","darkness only","rocks only"],"sunlight, water, air"),
  q("s3","Animals","Which body part helps a fish breathe underwater?",["lungs","gills","feathers","fur"],"gills"),
  q("s4","Habitats","A polar bear is best suited to live in:",["a cold Arctic habitat","a hot desert","a tropical pond","a city sidewalk"],"a cold Arctic habitat"),
  q("s5","Life Cycles","Which stage comes after a caterpillar in a butterfly life cycle?",["egg","chrysalis","seed","tadpole"],"chrysalis"),
  q("s6","Matter","Which is a solid?",["air","milk","ice cube","steam"],"ice cube"),
  q("s7","Matter","What happens to ice when it gets warm enough?",["It melts.","It grows.","It becomes a rock.","It disappears into nothing."],"It melts."),
  q("s8","Forces","A push or a pull is called:",["a force","a habitat","a season","a shadow"],"a force"),
  q("s9","Earth","What causes day and night?",["Earth rotates.","The Moon turns off the Sun.","Clouds cover Earth.","Earth stops moving."],"Earth rotates."),
  q("s10","Weather","Which tool measures temperature?",["ruler","thermometer","scale","clock"],"thermometer"),
  q("s11","Water Cycle","Water falling from clouds as rain or snow is:",["precipitation","evaporation","soil","wind"],"precipitation"),
  q("s12","Observation","Which is an observation?",["The leaf is 5 cm long.","The leaf is probably lonely.","I think the leaf wants water.","The leaf is the best leaf."],"The leaf is 5 cm long."),
  q("s13","Experiments","Why should a scientist change only one thing at a time in a fair test?",["To make the test harder","To know what caused the result","To finish faster","To use more supplies"],"To know what caused the result"),
  q("s14","Grade 3 Readiness","Which statement is evidence?",["I like plants.","The plant grew 4 cm in one week.","Plants are pretty.","I think this plant is lucky."],"The plant grew 4 cm in one week.")
 ]
},
{
 id:"social",title:"Social Studies Baseline",subject:"Social Studies",time:"20–30 min",
 description:"Maps, geography, communities, history, civics, and basic economics.",
 questions:[
  q("ss1","Geography","Which is a continent?",["Pacific","California","North America","Boston"],"North America"),
  q("ss2","Geography","Which is an ocean?",["Atlantic","Canada","Texas","Nile"],"Atlantic"),
  q("ss3","Maps","What does a map key explain?",["what symbols mean","how old the map is","who owns the land","what the weather will be"],"what symbols mean"),
  q("ss4","Maps","Which direction is opposite north?",["east","west","south","up"],"south"),
  q("ss5","Community","Which person helps put out fires?",["firefighter","librarian","farmer","cashier"],"firefighter"),
  q("ss6","Civics","Why do communities have rules?",["To help keep people safe and organized","To make maps colorful","To change the weather","To make everyone identical"],"To help keep people safe and organized"),
  q("ss7","Civics","Voting is one way people can:",["make a community decision","measure rainfall","grow crops","read a compass"],"make a community decision"),
  q("ss8","History","A primary source can be:",["a diary written by someone who lived during an event","a modern cartoon about an old event","a textbook summary","a made-up story"],"a diary written by someone who lived during an event"),
  q("ss9","History","A timeline shows:",["events in time order","only places","weather symbols","prices at a store"],"events in time order"),
  q("ss10","Economics","A good is:",["something people can buy and use","a rule made by a town","a direction on a compass","a type of election"],"something people can buy and use"),
  q("ss11","Economics","A service is:",["work someone does for another person","a mountain","a coin","a map symbol"],"work someone does for another person"),
  q("ss12","Geography","Which is a human-made feature?",["river","mountain","bridge","lake"],"bridge"),
  q("ss13","Grade 3 Readiness","If a town builds a new park, which level of government is most directly involved?",["local government","another country","a classroom only","no government"],"local government"),
  q("ss14","Grade 3 Readiness","Why might people move from one place to another?",["for jobs, family, safety, or opportunity","because maps stop working","because north changes direction","because time goes backward"],"for jobs, family, safety, or opportunity")
 ]
},
{
 id:"studytech",title:"Study Skills & Technology",subject:"Study Skills",time:"15–20 min",
 description:"Following directions, organization, checking work, digital citizenship, and basic technology skills.",
 questions:[
  q("st1","Following Directions","A direction says: Circle the noun, then underline the verb. What should you do first?",["underline the verb","circle the noun","erase the sentence","write a new sentence"],"circle the noun"),
  q("st2","Planning","You have a 20-minute assignment. What is a good first step?",["Read the directions","Guess at every answer","Close the assignment","Skip everything"],"Read the directions"),
  q("st3","Checking Work","What should you do before turning in work?",["Check that you answered each question","Change every answer","Ask the computer for the answers","Delete it"],"Check that you answered each question"),
  q("st4","Persistence","If a problem is hard, a useful strategy is to:",["try another strategy or ask for clarification","immediately quit","randomly click","hide the problem"],"try another strategy or ask for clarification"),
  q("st5","Technology","Which device is used to type letters and numbers into a computer?",["keyboard","speaker","screen","printer"],"keyboard"),
  q("st6","Files","A file is:",["saved information on a device","only a paper folder","a computer mouse","a password"],"saved information on a device"),
  q("st7","Internet Safety","If a website asks for your home address, you should:",["ask a parent or trusted adult before sharing","always type it in","share a friend's address","guess"],"ask a parent or trusted adult before sharing"),
  q("st8","Digital Citizenship","Which is kind and responsible online behavior?",["Using respectful words","Posting someone's private information","Sending mean messages","Pretending to be someone else"],"Using respectful words"),
  q("st9","Passwords","A password should usually be:",["kept private","shared with everyone","posted publicly","the word password"],"kept private"),
  q("st10","Learning","If you do not understand directions, you should:",["ask what they mean","pretend you understand","skip the whole day","choose randomly"],"ask what they mean")
 ]
},
{
 id:"writing",title:"Writing Baseline",subject:"Writing",time:"30–40 min",
 description:"Independent writing sample. There is no single right answer.",
 questions:[
  t("w1","Narrative Writing","Write about a time you had an adventure, solved a problem, or tried something new. Tell what happened in order. Include details about what you saw, thought, or felt."),
  t("w2","Informative Writing","Choose an animal, place, hobby, game, or topic you know well. Teach the reader about it. Include at least three facts or important details."),
  t("w3","Editing","Read your writing again. In the box below, write one thing you changed or checked before submitting.")
 ]
},
{
 id:"oral",title:"Speaking & Listening Check",subject:"Study Skills",time:"10–15 min",
 description:"A short parent-facilitated oral assessment. Rory answers aloud; the adult records brief notes.",
 questions:[
  t("o1","Retell","Choose a short story Rory has recently read or heard. Ask him to retell the beginning, middle, and end. Record brief notes about his response."),
  t("o2","Explain Thinking","Ask Rory to explain how he would solve 36 + 27 without a calculator. Record his explanation, not just the answer."),
  t("o3","Listening","Read aloud three directions: 'Touch your head, pick up a pencil, then draw a small star.' Record whether he follows the sequence independently."),
  t("o4","Conversation","Ask Rory to tell you about something he knows a lot about. Note whether he stays on topic, gives details, and answers follow-up questions.")
 ]
}
];

function q(id,skill,text,choices,answer,passage=null){return {id,skill,text,type:"choice",choices,answer,passage}}
function t(id,skill,text){return {id,skill,text,type:"text"}}

function initialState(){return {assignments:ASSIGNMENTS,assignmentCompletion:{},assessmentAttempts:{},learningLog:[],portfolio:[],observations:[]}}
let state=load();

function load(){
 try{
   const raw=localStorage.getItem(STORE);
   if(!raw)return initialState();
   const p=JSON.parse(raw);
   return {...initialState(),...p,assignments:p.assignments||ASSIGNMENTS};
 }catch(e){return initialState()}
}
function save(){localStorage.setItem(STORE,JSON.stringify(state));renderAll()}
function esc(s){return String(s??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}
function fmt(d){const x=new Date(String(d).includes("T")?d:d+"T12:00:00");return x.toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"})}
function stamp(){return new Date().toISOString().slice(0,10)}
function uid(){return crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(16).slice(2)}
function subjectNames(){return SUBJECTS.map(s=>s.name)}

document.querySelectorAll(".navbtn").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
function showPage(id){
 document.querySelectorAll(".navbtn").forEach(b=>b.classList.toggle("active",b.dataset.page===id));
 document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===id));
 window.scrollTo({top:0,behavior:"smooth"});
}

function renderSubjects(){
 const target=document.getElementById("subjectCards"); target.innerHTML="";
 SUBJECTS.forEach(s=>{
   const el=document.createElement("article");el.className="subject-card";
   el.innerHTML=`<div class="icon">${s.icon}</div><h3>${esc(s.name)}</h3><ul>${s.skills.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`;
   target.appendChild(el);
 });
}

function assignmentCard(a){
 const done=state.assignmentCompletion[a.id];
 const el=document.createElement("article"); el.className="activity"+(done?" completed":"");
 el.innerHTML=`<span class="pill">${esc(a.subject)}</span><h3>${esc(a.title)}</h3><div class="meta">About ${a.minutes} min</div><p class="desc">${esc(a.desc)}</p>
 <div class="status ${done?"done":""}">${done?"✓ Completed "+fmt(done.completedAt):"Not completed yet"}</div>
 <button class="${done?"":"primary"}" data-assignment="${esc(a.id)}">${done?"Mark Not Complete":"Mark Complete"}</button>`;
 return el;
}
function bindAssignments(){
 document.querySelectorAll("[data-assignment]").forEach(b=>b.onclick=()=>{
   const id=b.dataset.assignment;
   if(state.assignmentCompletion[id])delete state.assignmentCompletion[id];
   else state.assignmentCompletion[id]={completedAt:new Date().toISOString()};
   save();
 });
}
function renderAssignments(){
 const t=document.getElementById("assignmentCards");t.innerHTML="";
 state.assignments.forEach(a=>t.appendChild(assignmentCard(a)));bindAssignments();
}
document.getElementById("addAssignmentBtn").onclick=()=>{
 const box=document.getElementById("assignmentEditor");box.classList.remove("hidden");
 box.innerHTML=`<h3>Add Assignment</h3>
 <form id="newAssignmentForm">
 <label>Subject<select id="newASubject">${subjectNames().map(x=>`<option>${esc(x)}</option>`).join("")}</select></label>
 <label>Title<input id="newATitle" required></label>
 <label>Description<textarea id="newADesc" rows="3" required></textarea></label>
 <label>Estimated minutes<input id="newAMin" type="number" min="1" value="30" required></label>
 <button class="primary" type="submit">Save Assignment</button> <button type="button" id="cancelA">Cancel</button></form>`;
 document.getElementById("cancelA").onclick=()=>box.classList.add("hidden");
 document.getElementById("newAssignmentForm").onsubmit=e=>{
   e.preventDefault();
   state.assignments.push({id:uid(),subject:newASubject.value,title:newATitle.value.trim(),desc:newADesc.value.trim(),minutes:Number(newAMin.value)});
   box.classList.add("hidden");save();
 };
};

function assessmentCard(a){
 const attempt=state.assessmentAttempts[a.id];
 const el=document.createElement("article");el.className="assessment-card"+(attempt?.submittedAt?" submitted":"");
 el.innerHTML=`<span class="pill">${esc(a.subject)}</span><h3>${esc(a.title)}</h3><div class="meta">${esc(a.time)} · ${a.questions.length} items</div><p class="desc">${esc(a.description)}</p>
 <div class="status ${attempt?.submittedAt?"done":""}">${attempt?.submittedAt?"✓ Submitted "+fmt(attempt.submittedAt):attempt?"In progress — responses saved":"Not started"}</div>
 <button class="${attempt?.submittedAt?"":"primary"}" data-openassessment="${a.id}">${attempt?.submittedAt?"View Submission Status":attempt?"Continue Assessment":"Start Assessment"}</button>`;
 return el;
}
function renderAssessmentCards(){
 const t=document.getElementById("assessmentCards");t.innerHTML="";
 ASSESSMENTS.forEach(a=>t.appendChild(assessmentCard(a)));
 document.querySelectorAll("[data-openassessment]").forEach(b=>b.onclick=()=>openAssessment(b.dataset.openassessment));
}
function openAssessment(id){
 const a=ASSESSMENTS.find(x=>x.id===id), runner=document.getElementById("assessmentRunner");
 document.getElementById("assessmentCards").classList.add("hidden");runner.classList.remove("hidden");
 const existing=state.assessmentAttempts[id]||{responses:{},startedAt:new Date().toISOString()};
 if(!state.assessmentAttempts[id]){state.assessmentAttempts[id]=existing;localStorage.setItem(STORE,JSON.stringify(state))}
 if(existing.submittedAt){
   runner.innerHTML=`<div class="submitted-message"><div class="check">✓</div><h2>Assessment submitted</h2><p>Your responses have been saved. There is nothing else you need to do on this assessment.</p><p class="muted">Scores and answer details are kept in the parent report.</p><button id="backAssess">Back to Assessments</button></div>`;
   document.getElementById("backAssess").onclick=closeAssessment; return;
 }
 let passages="";
 if(a.passages) passages=a.passages.map(p=>`<article class="panel"><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></article>`).join("");
 runner.innerHTML=`<div class="assessment-head"><div class="kicker dark">Diagnostic assessment</div><h2>${esc(a.title)}</h2><p>${esc(a.description)} You may change answers until you submit. The site will not show whether any response is correct.</p></div>
 ${passages}<form id="assessmentForm">${a.questions.map((q,i)=>questionHTML(q,i,existing.responses[q.id])).join("")}
 <div class="assessment-footer"><p>Your work saves automatically on this device.</p><div><button type="button" id="saveExit">Save & Exit</button> <button type="submit" class="primary">Submit Assessment</button></div></div></form>`;
 bindAssessmentAutosave(id);
 document.getElementById("saveExit").onclick=closeAssessment;
 document.getElementById("assessmentForm").onsubmit=e=>{
   e.preventDefault(); collectAssessment(id);
   if(!confirm("Submit this assessment? You will not be able to change answers after submission."))return;
   state.assessmentAttempts[id].submittedAt=new Date().toISOString(); save(); openAssessment(id);
 };
}
function questionHTML(q,i,value){
 const prompt=`<legend>${i+1}. ${esc(q.text)}</legend>${q.passage?`<div class="meta">Use: ${esc(q.passage)}</div>`:""}<span class="progress-chip">${esc(q.skill)}</span>`;
 if(q.type==="text")return `<fieldset class="question">${prompt}<textarea name="${q.id}" rows="7" placeholder="Type the response here.">${esc(value||"")}</textarea></fieldset>`;
 return `<fieldset class="question">${prompt}<div class="choices">${q.choices.map(c=>`<label class="choice"><input type="radio" name="${q.id}" value="${esc(c)}" ${value===c?"checked":""}><span>${esc(c)}</span></label>`).join("")}</div></fieldset>`;
}
function bindAssessmentAutosave(id){
 document.querySelectorAll("#assessmentForm input,#assessmentForm textarea").forEach(x=>x.addEventListener("change",()=>collectAssessment(id)));
 document.querySelectorAll("#assessmentForm textarea").forEach(x=>x.addEventListener("input",debounce(()=>collectAssessment(id),350)));
}
function collectAssessment(id){
 const f=document.getElementById("assessmentForm"); if(!f)return;
 const a=ASSESSMENTS.find(x=>x.id===id), responses={...state.assessmentAttempts[id].responses};
 a.questions.forEach(q=>{
   if(q.type==="choice"){const x=f.querySelector(`[name="${q.id}"]:checked`); if(x)responses[q.id]=x.value}
   else {const x=f.querySelector(`[name="${q.id}"]`);responses[q.id]=x.value}
 });
 state.assessmentAttempts[id].responses=responses;localStorage.setItem(STORE,JSON.stringify(state));
}
function debounce(fn,ms){let t;return(...args)=>{clearTimeout(t);t=setTimeout(()=>fn(...args),ms)}}
function closeAssessment(){document.getElementById("assessmentRunner").classList.add("hidden");document.getElementById("assessmentCards").classList.remove("hidden");renderAll()}

function renderDashboard(){
 const target=document.getElementById("upNext");target.innerHTML="";
 const pendingAssess=ASSESSMENTS.filter(a=>!state.assessmentAttempts[a.id]?.submittedAt).slice(0,2);
 pendingAssess.forEach(a=>{
  const el=document.createElement("article");el.className="activity";el.innerHTML=`<span class="pill">Assessment</span><h3>${esc(a.title)}</h3><p class="desc">${esc(a.description)}</p><button class="primary" data-dashassess="${a.id}">${state.assessmentAttempts[a.id]?"Continue":"Start"}</button>`;target.appendChild(el);
 });
 const pendingA=state.assignments.filter(a=>!state.assignmentCompletion[a.id]).slice(0,Math.max(0,3-pendingAssess.length));
 pendingA.forEach(a=>target.appendChild(assignmentCard(a)));
 bindAssignments();document.querySelectorAll("[data-dashassess]").forEach(b=>b.onclick=()=>{showPage("assessments");openAssessment(b.dataset.dashassess)});
}

function fillSubjectSelects(){
 ["logSubject","portfolioSubject","obsSubject"].forEach(id=>{
  const x=document.getElementById(id);x.innerHTML=subjectNames().map(s=>`<option>${esc(s)}</option>`).join("");
 });
}
function minutesTotal(){return state.learningLog.reduce((n,x)=>n+Number(x.minutes||0),0)}
document.getElementById("logForm").onsubmit=e=>{
 e.preventDefault();state.learningLog.push({id:uid(),date:logDate.value,subject:logSubject.value,minutes:Number(logMinutes.value),text:logText.value.trim(),note:logNote.value.trim()});
 logText.value="";logNote.value="";save();
};
function renderLog(){
 const total=minutesTotal();document.getElementById("totalHours").textContent=(total/60).toFixed(1);
 const by={};state.learningLog.forEach(x=>by[x.subject]=(by[x.subject]||0)+Number(x.minutes||0));
 document.getElementById("logSubjectTotals").innerHTML=Object.entries(by).sort((a,b)=>b[1]-a[1]).map(([s,m])=>`<div class="mini-stat"><span>${esc(s)}</span><strong>${(m/60).toFixed(1)} h</strong></div>`).join("")||"<p class='muted'>No learning time recorded yet.</p>";
 const t=document.getElementById("logEntries");t.innerHTML="";
 [...state.learningLog].sort((a,b)=>b.date.localeCompare(a.date)).forEach(x=>{
  const d=document.createElement("div");d.className="record";d.innerHTML=`<p><strong>${esc(x.subject)} · ${x.minutes} min</strong> — ${esc(x.text)}</p>${x.note?`<p>${esc(x.note)}</p>`:""}<small>${fmt(x.date)}</small><div class="record-actions"><button class="danger" data-del-log="${x.id}">Delete</button></div>`;t.appendChild(d);
 });
 if(!state.learningLog.length)t.innerHTML="<p class='muted'>No entries yet.</p>";
 document.querySelectorAll("[data-del-log]").forEach(b=>b.onclick=()=>{state.learningLog=state.learningLog.filter(x=>x.id!==b.dataset.delLog);save()});
}
document.getElementById("exportLogCsv").onclick=()=>downloadCSV("rory-learning-log-"+stamp()+".csv",[["Date","Subject","Minutes","Activity","Parent Note"],...state.learningLog.map(x=>[x.date,x.subject,x.minutes,x.text,x.note])]);

document.getElementById("portfolioForm").onsubmit=e=>{
 e.preventDefault();state.portfolio.push({id:uid(),date:portfolioDate.value,subject:portfolioSubject.value,title:portfolioTitle.value.trim(),description:portfolioDescription.value.trim(),link:portfolioLink.value.trim()});
 portfolioTitle.value="";portfolioDescription.value="";portfolioLink.value="";save();
};
function renderPortfolio(){
 const t=document.getElementById("portfolioItems");t.innerHTML="";
 [...state.portfolio].sort((a,b)=>b.date.localeCompare(a.date)).forEach(x=>{
   const e=document.createElement("article");e.className="portfolio-item";e.innerHTML=`<span class="pill">${esc(x.subject)}</span><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p>${x.link?`<p><strong>File/link:</strong> ${esc(x.link)}</p>`:""}<small>${fmt(x.date)}</small><div class="record-actions"><button class="danger" data-del-port="${x.id}">Delete</button></div>`;t.appendChild(e);
 });
 if(!state.portfolio.length)t.innerHTML="<div class='panel'><p class='muted'>No portfolio items yet.</p></div>";
 document.querySelectorAll("[data-del-port]").forEach(b=>b.onclick=()=>{state.portfolio=state.portfolio.filter(x=>x.id!==b.dataset.delPort);save()});
}

document.getElementById("observationForm").onsubmit=e=>{
 e.preventDefault();state.observations.push({id:uid(),date:obsDate.value,subject:obsSubject.value,text:obsText.value.trim()});obsText.value="";save();
};

function assessmentStats(a,attempt){
 const objective=a.questions.filter(q=>q.type==="choice");
 const answered=objective.filter(q=>attempt.responses?.[q.id]!=null);
 const correct=objective.filter(q=>attempt.responses?.[q.id]===q.answer);
 return {objective:objective.length,answered:answered.length,correct:correct.length,percent:objective.length?Math.round(correct.length/objective.length*100):null};
}
function skillRows(){
 const rows=[];
 ASSESSMENTS.forEach(a=>{
  const at=state.assessmentAttempts[a.id];
  const objectiveSkills=[...new Set(a.questions.filter(q=>q.type==="choice").map(q=>q.skill))];
  objectiveSkills.forEach(skill=>{
    const qs=a.questions.filter(q=>q.type==="choice"&&q.skill===skill);
    if(!at?.submittedAt){rows.push({subject:a.subject,skill,status:"Not Yet Assessed",cls:"notassessed"});return}
    const answered=qs.filter(q=>at.responses?.[q.id]!=null);
    const correct=qs.filter(q=>at.responses?.[q.id]===q.answer);
    const ratio=correct.length/qs.length;
    let status,cls;
    if(ratio>=.8){status="Mastered";cls="mastered"}else if(ratio>=.5){status="Developing";cls="developing"}else{status="Instruction Needed";cls="instruction"}
    rows.push({subject:a.subject,skill,status,cls});
  });
 });
 return rows;
}
function renderReports(){
 document.getElementById("reportAssessments").textContent=Object.values(state.assessmentAttempts).filter(x=>x.submittedAt).length;
 document.getElementById("reportAssignments").textContent=Object.keys(state.assignmentCompletion).length;
 document.getElementById("reportHours").textContent=(minutesTotal()/60).toFixed(1);
 document.getElementById("reportPortfolio").textContent=state.portfolio.length;
 document.getElementById("skillMap").innerHTML=skillRows().map(r=>`<div class="skill-row"><strong>${esc(r.subject)}</strong><span>${esc(r.skill)}</span><span class="skill-status ${r.cls}">${r.status}</span></div>`).join("");
 const t=document.getElementById("attemptReports");t.innerHTML="";
 ASSESSMENTS.forEach(a=>{
  const at=state.assessmentAttempts[a.id];if(!at)return;
  const st=assessmentStats(a,at);
  const d=document.createElement("div");d.className="record";
  const score=at.submittedAt?(st.objective?`${st.correct}/${st.objective} objective items (${st.percent}%)`:"Parent-scored / open response"):"In progress";
  const unanswered=st.objective-st.answered;
  d.innerHTML=`<p><strong>${esc(a.title)}</strong> — ${at.submittedAt?"Submitted":"In progress"}</p><p>Parent result: ${score}${at.submittedAt&&unanswered?` · ${unanswered} objective item(s) unanswered`:""}</p><small>Started ${fmt(at.startedAt)}${at.submittedAt?" · Submitted "+fmt(at.submittedAt):""}</small>`;
  t.appendChild(d);
 });
 if(!Object.keys(state.assessmentAttempts).length)t.innerHTML="<p class='muted'>No assessment attempts yet.</p>";
 const o=document.getElementById("observationList");o.innerHTML="";
 [...state.observations].sort((a,b)=>b.date.localeCompare(a.date)).forEach(x=>{
  const d=document.createElement("div");d.className="record";d.innerHTML=`<p><strong>${esc(x.subject)}</strong> — ${esc(x.text)}</p><small>${fmt(x.date)}</small><div class="record-actions"><button class="danger" data-del-obs="${x.id}">Delete</button></div>`;o.appendChild(d);
 });
 if(!state.observations.length)o.innerHTML="<p class='muted'>No parent observations yet.</p>";
 document.querySelectorAll("[data-del-obs]").forEach(b=>b.onclick=()=>{state.observations=state.observations.filter(x=>x.id!==b.dataset.delObs);save()});
}

function renderOverall(){
 const total=state.assignments.length+ASSESSMENTS.length;
 const done=Object.keys(state.assignmentCompletion).length+Object.values(state.assessmentAttempts).filter(x=>x.submittedAt).length;
 const pct=total?Math.round(done/total*100):0;
 overallPercent.textContent=pct+"%";overallBar.style.width=pct+"%";overallCount.textContent=`${done} of ${total} activities completed`;
}

document.getElementById("exportRecord").onclick=()=>{
 const payload={student:"Rory",schoolYear:"2026-2027",grade:"3",exportedAt:new Date().toISOString(),state,derived:{learningHours:(minutesTotal()/60).toFixed(2),skillMap:skillRows()}};
 download("rory-homeschool-record-"+stamp()+".json",JSON.stringify(payload,null,2),"application/json");
};
document.getElementById("exportSummary").onclick=()=>{
 const rows=[["Category","Subject","Item","Date","Status/Result"]];
 state.assignments.forEach(a=>{const c=state.assignmentCompletion[a.id];if(c)rows.push(["Assignment",a.subject,a.title,c.completedAt,"Completed"])});
 ASSESSMENTS.forEach(a=>{const at=state.assessmentAttempts[a.id];if(at?.submittedAt){const s=assessmentStats(a,at);rows.push(["Assessment",a.subject,a.title,at.submittedAt,s.objective?`${s.correct}/${s.objective} (${s.percent}%)`:"Submitted"])}})
 state.learningLog.forEach(x=>rows.push(["Learning Log",x.subject,x.text,x.date,`${x.minutes} minutes`]));
 state.portfolio.forEach(x=>rows.push(["Portfolio",x.subject,x.title,x.date,x.description]));
 state.observations.forEach(x=>rows.push(["Observation",x.subject,x.text,x.date,""]));
 downloadCSV("rory-progress-summary-"+stamp()+".csv",rows);
};
document.getElementById("importRecord").onchange=async e=>{
 const f=e.target.files[0];if(!f)return;
 try{
   const p=JSON.parse(await f.text());
   const incoming=p.state||p;
   if(!incoming||typeof incoming!=="object")throw new Error();
   state={...initialState(),...incoming};save();alert("Record imported.");
 }catch{alert("That file could not be imported.")}
 e.target.value="";
};
function download(name,text,type){const blob=new Blob([text],{type}),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;a.click();URL.revokeObjectURL(u)}
function csv(v){return `"${String(v??"").replaceAll('"','""')}"`}
function downloadCSV(name,rows){download(name,rows.map(r=>r.map(csv).join(",")).join("\n"),"text/csv")}

function renderAll(){renderSubjects();renderAssignments();renderAssessmentCards();renderDashboard();renderLog();renderPortfolio();renderReports();renderOverall()}
fillSubjectSelects();
["logDate","portfolioDate","obsDate"].forEach(id=>document.getElementById(id).value=stamp());
renderAll();
