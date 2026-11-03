// খ-অংশের পেজ-যুক্তি পরীক্ষা — Firebase SDK এখানে MOCK (আসল Firebase/নিয়ম নয়)। আসল ফল BLOCKED।
const {chromium}=require("playwright");const fs=require("fs");const EV=process.argv[2];const R={};const URL="http://localhost:8765/index.html";const V="12.14.0";
const MOCK={
"firebase-app.js":`export const initializeApp=c=>({c});`,
"firebase-auth.js":`const S=window.__m=window.__m||{user:null,ls:[]};const A={};Object.defineProperty(A,"currentUser",{get:()=>S.user});export const getAuth=()=>A;export class GoogleAuthProvider{};export const signInWithPopup=async()=>{S.user={uid:window.__uid||"OWNER1"};S.ls.forEach(f=>f(S.user));return{user:S.user}};export const onAuthStateChanged=(a,f)=>{S.ls.push(f);f(S.user)};export const signOut=async()=>{S.user=null;S.ls.forEach(f=>f(null))};`,
"firebase-firestore.js":`const S=()=>window.__m;export const getFirestore=()=>({});export const doc=(db,...s)=>({path:s.join("/")});export const serverTimestamp=()=>1;
const chk=p=>{const u=S().user,own="OWNER1";if(!(u&&u.uid===own&&(p.startsWith("users/"+u.uid+"/")||p.startsWith("catalog/"))))throw Object.assign(new Error("Missing or insufficient permissions."),{code:"permission-denied"})};export const setDoc=async(r)=>chk(r.path);export const getDoc=async(r)=>{chk(r.path);return{exists:()=>false}}`,
"firebase-app-check.js":`export class ReCaptchaEnterpriseProvider{constructor(k){this.k=k}};export const initializeAppCheck=()=>({});export const getToken=async()=>{if(window.__acFail)throw new Error("AppCheck: 403 token fetch failed");return{token:"t".repeat(40)}}`,
"firebase-ai.js":`export const getAI=()=>({});export class GoogleAIBackend{};export const getGenerativeModel=(ai,o)=>({generateContent:async(parts)=>{const m=window.__aiMode||"ok";if(m==="quota")throw Object.assign(new Error("[429] RESOURCE_EXHAUSTED quota"),{code:"fetch-error"});if(m==="appcheck")throw new Error("403 App Check token invalid");if(m==="model")throw new Error("404 model not found");if(m==="hang")return new Promise(()=>{});return{response:{text:()=>"নমুনা উত্তর (MOCK) — "+o.model,usageMetadata:{totalTokenCount:42}}}}})`};
const TESTCFG=`export default {firebase:{apiKey:"k",authDomain:"a",projectId:"p",appId:"i"},sdkVersion:"${V}",recaptchaEnterpriseSiteKey:"site",appCheckDebug:false,ownerUid:"OWNER1",model:"gemini-flash-latest"};`;
(async()=>{const b=await chromium.launch();
const mk=async(mock)=>{const ctx=await b.newContext({viewport:{width:412,height:915},deviceScaleFactor:2,isMobile:true,hasTouch:true,});await ctx.grantPermissions(["notifications"],{origin:"http://localhost:8765"});const p=await ctx.newPage();p._e=[];p.on("pageerror",e=>p._e.push(e.message));p.on("dialog",d=>d.accept());
 if(mock){await ctx.route("https://www.gstatic.com/firebasejs/**",r=>{const f=r.request().url().split("/").pop();r.fulfill({status:200,contentType:"text/javascript",body:MOCK[f]||"export {}"})});await ctx.route("**/js/firebase-config.js",r=>r.fulfill({status:200,contentType:"text/javascript",body:TESTCFG}))}
 return [ctx,p]};
// 0) no config → friendly notice on all 3 firebase pages
{const [ctx,p]=await mk(false);R.noConfig={};for(const r of["bauth","bai"]){await p.goto(URL+"#/"+r);await p.waitForTimeout(1200);R.noConfig[r]=(await p.$eval("main",m=>m.innerText)).includes("কনফিগ বসানো হয়নি")}await ctx.close()}
// 1) rules-test logic
{R.rules={};
 for(const [label,uid,signin] of [["owner","OWNER1",true],["otherAccount","STRANGER9",true],["signedOut","",false]]){
  const [ctx,p]=await mk(true);await p.goto(URL+"#/bauth");await p.waitForTimeout(1500);await p.evaluate(u=>window.__uid=u,uid);
  if(signin){await p.click("#in");await p.waitForTimeout(500)}
  await p.click("#run");await p.waitForTimeout(800);
  R.rules[label]=await p.$$eval("#res tr",rs=>rs.slice(1).map(r=>[...r.cells].map(c=>c.innerText.replace(/\n/g," ")).join(" | ")));
  if(label==="owner")await p.screenshot({path:EV+"/tb-rules-mock.png"});await ctx.close()}}
// 2) AI logic
{const [ctx,p]=await mk(true);await p.goto(URL+"#/bai");await p.waitForTimeout(1800);R.ai={appCheck:await p.$eval("#ac",e=>e.innerText)};
 await p.click('[data-i="0"]');await p.waitForTimeout(600);R.ai.ok=await p.$eval("#o0",e=>e.innerText);R.ai.counter=await p.$eval("#n",e=>e.innerText);
 for(const m of["quota","appcheck","model"]){await p.evaluate(x=>window.__aiMode=x,m);await p.click('[data-i="1"]');await p.waitForTimeout(500);R.ai[m]=await p.$eval("#o1",e=>e.innerText.split("\n")[0])}
 await p.evaluate(()=>window.__aiMode="ok");await p.screenshot({path:EV+"/tb-ai-mock.png"});
 await p.addInitScript(()=>{window.__acFail=true});await p.reload();await p.waitForTimeout(1800);R.ai.appCheckFail=await p.$eval("#ac",e=>e.innerText.split("\n")[0]);
 await ctx.close()}
// 3) PDF logic
{const [ctx,p]=await mk(true);await p.goto(URL+"#/bpdf");await p.waitForTimeout(1000);
 fs.writeFileSync("/tmp/big.pdf",Buffer.alloc(16*1024*1024,37));fs.writeFileSync("/tmp/small.pdf",Buffer.concat([Buffer.from("%PDF-1.4\n"),Buffer.alloc(200000,65)]));
 await p.setInputFiles("#f","/tmp/big.pdf");await p.waitForTimeout(800);R.pdf={big:await p.$eval("#info",e=>e.innerText),bigButtonDisabled:await p.$eval("#go",e=>e.disabled)};
 await p.setInputFiles("#f","/tmp/small.pdf");await p.waitForTimeout(800);R.pdf.small=await p.$eval("#info",e=>e.innerText);
 await p.click("#go");await p.waitForTimeout(800);R.pdf.result=(await p.$eval("#out",e=>e.innerText)).split("\n").slice(0,3).join(" / ");
 await p.fill("#u","https://example.org/blocked.pdf");await ctx.route("https://example.org/**",r=>r.abort());await p.click("#cors");await p.waitForTimeout(1500);R.pdf.corsBlocked=await p.$eval("#uo",e=>e.innerText);
 await ctx.unroute("https://example.org/**");await ctx.route("https://example.org/**",r=>r.fulfill({status:200,headers:{"access-control-allow-origin":"*"},body:Buffer.alloc(1000)}));await p.click("#cors");await p.waitForTimeout(1200);R.pdf.corsOk=await p.$eval("#uo",e=>e.innerText);await ctx.close()}
// 4) reminders page (desktop capability + SW timer)
{const [ctx,p]=await mk(false);await p.goto(URL+"#/bremind");await p.waitForTimeout(2500);
 R.remind={caps:await p.$eval("main .card.small",e=>e.innerText.replace(/\n/g," ")).catch(()=>null)};
 await p.click('[data-m="trigger"]');await p.waitForTimeout(500);R.remind.triggerMsg=await p.$eval("#msg",e=>e.innerText);
 await p.click('[data-m="periodic"]');await p.waitForTimeout(500);R.remind.periodicMsg=await p.$eval("#msg",e=>e.innerText);
 await p.click('[data-m="swtimer"]');await p.waitForTimeout(500);R.remind.swtimerMsg=await p.$eval("#msg",e=>e.innerText);
 await p.waitForTimeout(66000);await p.click("#clr").catch(()=>{});
 const log=await p.evaluate(async()=>{const c=await caches.open("remind-log");const r=await c.match("/log.json");return r?await r.json():null});R.remind.swLogAfter66s=log;await ctx.close()}
R.pageErrors="see per-run";fs.writeFileSync(EV+"/results-b2.json",JSON.stringify(R,null,1));console.log(JSON.stringify(R,null,1));await b.close()})();
