// Stage 0a (ক) automated checks. Run: NODE_PATH=$(npm root -g) node run-a.cjs <evidence-dir> <path-to-private-font.ttf> <path-to-FreeSerif.ttf>
const {chromium}=require("playwright");const fs=require("fs");const {execSync}=require("child_process");
const [EV,SUT,FREE]=process.argv.slice(2);const R={};const URL="http://localhost:8765/index.html";
const sh=c=>execSync(c,{encoding:"utf8"});
(async()=>{
const b=await chromium.launch();
const mk=async(o={})=>{const ctx=await b.newContext({viewport:{width:412,height:915},deviceScaleFactor:2,isMobile:true,hasTouch:true,...o});const p=await ctx.newPage();p._errs=[];p.on("pageerror",e=>p._errs.push(e.message));return [ctx,p]};
// ---------- T1 design screens
{const [ctx,p]=await mk();await p.goto(URL+"#/family");await p.waitForTimeout(1200);
 const vt=await p.evaluate(()=>!!document.startViewTransition);
 await p.click('.node[data-k="মা"]');await p.waitForTimeout(700);
 const open=await p.$(".profile .sheet");await p.screenshot({path:EV+"/t1-family-profile.png"});
 await p.click("#x");await p.waitForTimeout(600);const closed=!(await p.$(".profile"));
 await p.goto(URL+"#/path");await p.waitForTimeout(800);await p.click('.pathlist button:has-text("শ্রেণি ৫")');await p.click('.pathlist button:has-text("কুরআন")');await p.waitForTimeout(400);
 const today=await p.$(".pathlist .today");await p.screenshot({path:EV+"/t1-path-chapter.png"});
 await p.goto(URL+"#/learn");await p.waitForTimeout(600);await p.click("#fl");await p.waitForTimeout(500);const flipped=await p.$eval("#fl",e=>e.classList.contains("on"));
 R.t1={viewTransitions:vt,profileOpened:!!open,profileClosed:closed,pathReachedChapterWithTodayMarker:!!today,flashcardFlip:flipped,errs:p._errs};await ctx.close();}
// ---------- T2 glass / fps / auto-lite
{R.t2={};
 for(const [layers,thr] of [[0,1],[1,1],[2,1],[3,1],[2,4],[3,4]]){
  const [ctx,p]=await mk();await p.goto(URL+"#/glass");await p.waitForTimeout(800);
  const cdp=await ctx.newCDPSession(p);await cdp.send("Emulation.setCPUThrottlingRate",{rate:thr});
  await p.evaluate(()=>{window.__noAuto=true});await p.click(`[data-n="${layers}"]`);await p.waitForTimeout(4000);
  const fps=await p.evaluate(()=>window.__fps);R.t2[`layers${layers}_cpu${thr}x`]=+fps.toFixed(1);await ctx.close();}
 // auto-lite trigger: heavy load must trigger; light load must not
 {const [ctx,p]=await mk();await p.goto(URL+"#/glass");await p.waitForTimeout(800);const cdp=await ctx.newCDPSession(p);await cdp.send("Emulation.setCPUThrottlingRate",{rate:12});await p.click('[data-n="3"]');await p.waitForTimeout(9000);
  R.t2.autoLite_heavy={triggered:await p.evaluate(()=>document.documentElement.hasAttribute("data-lite")),fpsAtEnd:+(await p.evaluate(()=>window.__fps)).toFixed(1),blurAfter:await p.$eval(".layer.l1",e=>getComputedStyle(e).backdropFilter)};
  await p.screenshot({path:EV+"/t2-autolite.png"});await ctx.close();}
 {const [ctx,p]=await mk();await p.goto(URL+"#/glass");await p.waitForTimeout(800);await p.click('[data-n="0"]');await p.waitForTimeout(6000);
  R.t2.autoLite_light={triggered:await p.evaluate(()=>document.documentElement.hasAttribute("data-lite")),fps:+(await p.evaluate(()=>window.__fps)).toFixed(1)};await ctx.close();}
}
// ---------- T3 fonts: load status online-blocked, file picker -> IDB -> reload -> print
{const [ctx,p]=await mk();await p.goto(URL+"#/fonts");await p.waitForTimeout(4500);
 const st=await p.$$eval("[data-f],#st-amiri",es=>es.map(e=>e.textContent));R.t3={googleFontsStatus:st};
 await p.screenshot({path:EV+"/t3-fonts-before.png",fullPage:true});
 for(const f of [SUT,FREE]){await p.setInputFiles("#pick",f);await p.waitForTimeout(900)}
 R.t3.savedList=await p.$$eval("#mine .nm",es=>es.map(e=>e.textContent.trim()));
 await p.screenshot({path:EV+"/t3-fonts-user.png",fullPage:true});
 await p.reload();await p.waitForTimeout(1500);await p.evaluate(()=>location.hash="#/fonts");await p.waitForTimeout(1200);
 R.t3.afterReloadStillListed=await p.$$eval("#mine .nm",es=>es.map(e=>e.textContent.trim()));
 R.t3.fontFaceRegisteredAfterReload=await p.evaluate(()=>[...document.fonts].filter(f=>f.family.includes("U-")).map(f=>f.family+":"+f.status));
 // T4 print with user font
 await p.evaluate(()=>location.hash="#/print");await p.waitForTimeout(900);
 const opts=await p.$$eval("#f option",o=>o.map(x=>x.value));R.t4={userFontOptionsInPrintPage:opts};
 R.t4.pages={};
 for(const [n,font] of [[1,""],[2,""],[3,""],[4,""],[2,"U-SutonnyOMJ"],[2,"U-FreeSerif"]]){
   await p.selectOption("#n",String(n));await p.selectOption("#f",font);await p.waitForTimeout(400);
   await p.emulateMedia({media:"print"});
   const file=`${EV}/t4-n${n}${font?"-"+font:""}.pdf`;
   await p.pdf({path:file,preferCSSPageSize:true,printBackground:true});await p.emulateMedia({media:"screen"});
   const info=sh(`pdfinfo "${file}"`);const pages=+info.match(/Pages:\s+(\d+)/)[1];const size=info.match(/Page size:\s+(.*)/)[1];
   const fonts=sh(`pdffonts "${file}"`).split("\n").slice(2).filter(Boolean).map(l=>l.trim().split(/\s+/)[0]);
   const order=[];for(let i=1;i<=pages;i++){const t=sh(`pdftotext -f ${i} -l ${i} -bbox "${file}" -`);const m=[...t.matchAll(/xMin="([\d.]+)"[^>]*>(\[অর্ধ-পাতা|ফাঁকা\]|[০-৯])/g)];
     // marker words: "[অর্ধ-পাতা" then digit word; collect x of the digit word following marker
     const words=[...t.matchAll(/<word xMin="([\d.]+)"[^>]*>([^<]*)<\/word>/g)].map(x=>[+x[1],x[2]]);const out=[];
     for(let k=0;k<words.length-1;k++){if(words[k][1]==="[অর্ধ-পাতা"){out.push([words[k][0],words[k+1][1].replace("]","")])}}
     order.push(out.sort((a,b)=>a[0]-b[0]).map(x=>x[1]))}
   R.t4.pages[`${n}${font?" "+font:""}`]={pages,size,fonts,leftToRightPerPage:order};
 }
 await ctx.close();}
// ---------- T5 offline/install
{const [ctx,p]=await mk({serviceWorkers:"allow"});await p.goto(URL+"#/today");await p.waitForTimeout(2500);
 R.t5={sw:await p.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();return r?.active?.state||null}),cacheKeys:await p.evaluate(()=>caches.keys())};
 const cdp=await ctx.newCDPSession(p);await cdp.send("Page.enable");
 try{const e=await cdp.send("Page.getInstallabilityErrors");R.t5.installabilityErrors=e.installabilityErrors}catch(e){R.t5.installabilityErrors="n/a "+e.message}
 try{const m=await cdp.send("Page.getAppManifest");R.t5.manifest={url:m.url,errors:m.errors,name:JSON.parse(m.data||"{}").name,icons:(JSON.parse(m.data||"{}").icons||[]).map(i=>i.sizes+" "+i.purpose)}}catch(e){}
 await ctx.setOffline(true);R.t5.offline={};
 for(const r of ["today","family","path","learn","glass","print","install","icons","prayer","hub"]){
   const q=await ctx.newPage();let ok=true;try{await q.goto(URL+"#/"+r,{waitUntil:"load",timeout:8000});await q.waitForTimeout(900);const t=await q.$eval("main",m=>m.innerText.trim().length);ok=t>20&&!(await q.$eval("main",m=>m.innerText.includes("খুলল না")))}catch(e){ok=false}R.t5.offline[r]=ok;if(r==="prayer")await q.screenshot({path:EV+"/t5-offline-prayer.png"});await q.close()}
 await ctx.setOffline(false);
 // icons at 48
 await p.evaluate(()=>location.hash="#/icons");await p.waitForTimeout(800);await p.screenshot({path:EV+"/t5-icons.png",fullPage:true,scale:"css"});await ctx.close();}
fs.writeFileSync(EV+"/results-a.json",JSON.stringify(R,null,2));console.log(JSON.stringify(R,null,2));await b.close();})();
