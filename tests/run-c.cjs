// স্বাধীন-পর্যায় পরীক্ষা: ফন্ট-পছন্দ টিকে থাকা, ব্যাকআপ/ইমপোর্ট, ক্লাউড-বিচ্ছিন্নতা
const {chromium}=require("playwright");const fs=require("fs");const os=require("os");const path=require("path");
const EV=process.argv[2],FREE=process.argv[3];const R={};const URL="http://localhost:8765/index.html";
const PROBE=`<script>window.__ui0=getComputedStyle(document.documentElement).getPropertyValue("--ui");window.__fu0=document.documentElement.dataset.fontUi;</script>`;
(async()=>{
const dir=fs.mkdtempSync(path.join(os.tmpdir(),"amin-prof-"));
const open=async()=>{const ctx=await chromium.launchPersistentContext(dir,{viewport:{width:412,height:915},isMobile:true,hasTouch:true,acceptDownloads:true});
  await ctx.route("**/index.html*",async r=>{const resp=await r.fetch();let b=await resp.text();b=b.replace('<link rel="stylesheet" href="css/app.css">','<link rel="stylesheet" href="css/app.css">'+PROBE);r.fulfill({response:resp,body:b})});
  const p=ctx.pages()[0]||await ctx.newPage();p._e=[];p.on("pageerror",e=>p._e.push(e.message));p.on("dialog",d=>d.accept(d.message().includes("বদলাও")?"বদলাও":d.message().includes("পাসফ্রেজ দিন")?"ui-pass-১":""));return [ctx,p]};
const fam=(p,sel)=>p.$eval(sel,e=>getComputedStyle(e).fontFamily);
// ---- A) font preference persistence across reload / navigation / full browser restart
{let [ctx,p]=await open();await p.goto(URL+"#/settings");await p.waitForTimeout(1200);
 await p.check('input[name="fontUI"][value="anek"]');await p.check('input[name="fontRead"][value="notoserif"]');await p.waitForTimeout(500);
 R.font={afterSelect:{ui:await fam(p,"main p.mut"),pv:await fam(p,"#pv")}};
 await p.evaluate(()=>location.hash="#/hub");await p.waitForTimeout(600);await p.evaluate(()=>location.hash="#/settings");await p.waitForTimeout(800);R.font.afterNavigate={ui:await fam(p,"main p.mut"),checked:await p.$eval('input[name="fontUI"]:checked',e=>e.value)};
 await p.reload();await p.waitForTimeout(1200);
 R.font.afterReload={beforeFirstPaint_cssVar:await p.evaluate(()=>window.__ui0),beforeFirstPaint_attr:await p.evaluate(()=>window.__fu0),descFont:await fam(p,"main p.mut"),checked:await p.$eval('input[name="fontUI"]:checked',e=>e.value),readChecked:await p.$eval('input[name="fontRead"]:checked',e=>e.value),googleLinkInjected:await p.$$eval('link[id^="gf-"]',l=>l.map(x=>x.id))};
 await ctx.close();
 [ctx,p]=await open();await p.goto(URL+"#/settings");await p.waitForTimeout(1500);
 R.font.afterFullRestart={beforeFirstPaint_cssVar:await p.evaluate(()=>window.__ui0),descFont:await fam(p,"main p.mut"),bodyFont:await fam(p,"body"),checked:await p.$eval('input[name="fontUI"]:checked',e=>e.value)};
 await p.screenshot({path:EV+"/tc-settings-anek.png"});
 // user-uploaded font as UI font persists too
 await p.goto(URL+"#/fonts");await p.waitForTimeout(1200);await p.setInputFiles("#pick",FREE);await p.waitForTimeout(1200);
 await p.evaluate(()=>location.hash="#/settings");await p.waitForTimeout(900);await p.check('input[name="fontUI"][value="U-FreeSerif"]');await p.waitForTimeout(500);await ctx.close();
 [ctx,p]=await open();await p.goto(URL+"#/settings");await p.waitForTimeout(1800);
 R.font.userFontAfterRestart={cssVar:await p.evaluate(()=>window.__ui0),descFont:await fam(p,"main p.mut"),faceLoaded:await p.evaluate(()=>[...document.fonts].filter(f=>f.family.includes("U-FreeSerif")).map(f=>f.status)),checked:await p.$eval('input[name="fontUI"]:checked',e=>e.value)};
 await p.click("#rst");await p.waitForTimeout(500);R.font.afterReset={descFont:await fam(p,"main p.mut"),attr:await p.evaluate(()=>document.documentElement.dataset.fontUi),amiriOffered:await p.$$eval('input[name="fontUI"]',r=>r.some(x=>/amiri/i.test(x.value)))};
 R.font.errs=p._e;await ctx.close()}
// ---- B) backup / import (in-page API) + UI round trip
{let [ctx,p]=await open();await p.goto(URL+"#/hub");await p.waitForTimeout(1200);
 const API=await p.evaluate(async()=>{
  const {repo}=await import("./js/core/repo.js");const B=await import("./js/core/backup.js");const {openDb,allFonts}=await import("./js/idb.js");
  const out={};const n=repo("notes");const made=[];for(const t of["নোট ১ — বাংলা","note 2","নোট ৩ آ"])made.push(await n.put({text:t}));
  localStorage.setItem("district","গাজীপুর");localStorage.setItem("ptconf",'{"6/24":"0"}');localStorage.setItem("fontUI","anek");
  out.before={notes:await n.count(),fonts:(await allFonts()).length};
  const t0=performance.now();const payload=await B.collect({fonts:true});const sealed=await B.seal(payload,"গোপন-pass-১২৩");out.sealMs=Math.round(performance.now()-t0);out.enc=sealed.enc;out.sealedHasPlainText=JSON.stringify(sealed).includes("নোট ১");
  const plain=await B.seal(payload,"");
  // wipe everything
  localStorage.clear();(await openDb()).close();await new Promise(r=>{const q=indexedDB.deleteDatabase("amin-proto");q.onsuccess=q.onerror=q.onblocked=r});
  out.afterWipe={notes:await n.count(),district:localStorage.getItem("district"),fonts:(await allFonts()).length};
  const errs={};const tryOpen=async(k,txt,pw)=>{try{await B.openFile(txt,pw);errs[k]="OPENED(unexpected)"}catch(e){errs[k]=e.code}};
  await tryOpen("wrongPass",JSON.stringify(sealed),"غلط");await tryOpen("noPass",JSON.stringify(sealed),"");
  const tam=JSON.parse(JSON.stringify(sealed));tam.data=tam.data.slice(0,40)+(tam.data[40]==="A"?"B":"A")+tam.data.slice(41);await tryOpen("tamperedCipher",JSON.stringify(tam),"গোপন-pass-১২৩");
  const tp=JSON.parse(JSON.stringify(plain));tp.payload.records[0].data.text="বদলানো";await tryOpen("tamperedPlain",JSON.stringify(tp),"");
  await tryOpen("notAmin",'{"hello":1}',"");await tryOpen("notJson","<html>","");await tryOpen("newerVersion",JSON.stringify({...plain,v:99}),"");
  out.errs=errs;
  // hostile payload: unknown LS key, tier C record, bad record shape
  const evil=JSON.parse(JSON.stringify(payload));evil.ls.evil="x";evil.ls.theme="light";evil.records.push({key:"vault:1",coll:"vault",tier:"C",updatedAt:1,data:{secret:1}},{key:"bad"},null);
  const ev=await B.openFile(JSON.stringify(await B.seal(evil,"")),"");out.hostileFiltered={lsKeys:Object.keys(ev.ls),records:ev.records.length};
  // restore from encrypted file
  const opened=await B.openFile(JSON.stringify(sealed),"গোপন-pass-১২৩");const res=await B.apply(opened,{mode:"replace"});
  out.after={notes:await n.count(),texts:(await n.list()).map(x=>x.text).sort(),district:localStorage.getItem("district"),ptconf:localStorage.getItem("ptconf"),fontUI:localStorage.getItem("fontUI"),fonts:(await allFonts()).length,summary:B.summary(opened)};
  // merge LWW: file has OLDER version of a note → must not overwrite newer local
  const one=(await n.list())[0];const old=JSON.parse(JSON.stringify(payload));const rr=old.records.find(r=>r.key==="notes:"+one.id);rr.data.text="পুরোনো";rr.updatedAt=1;
  await B.apply(await B.openFile(JSON.stringify(await B.seal(old,"")),""),{mode:"merge"});out.lww_newerLocalKept=(await n.get(one.id)).text===one.text;
  // undo
  await n.put({text:"ইমপোর্টের পর নোট"});await B.apply(opened,{mode:"replace"});out.afterSecondReplace=await n.count();const u=await B.undoLast();out.undo={restoredRecords:u.records,notesNow:await n.count(),hasAfterNote:(await n.list()).some(x=>x.text==="ইমপোর্টের পর নোট")};
  // tier C guard
  try{repo("vault",{tier:"C"});out.tierC="allowed(!)"}catch(e){out.tierC="blocked"}
  return out});R.backup=API;
 await ctx.close()}
// ---- C) UI round trip: notes → export (encrypted, download) → wipe → import → notes back
{fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir);let [ctx,p]=await open();await p.goto(URL+"#/notes");await p.waitForTimeout(1200);
 for(const t of["প্রথম নোট","দ্বিতীয় নোট"]){await p.fill("#t",t);await p.click("#add");await p.waitForTimeout(300)}
 await p.goto(URL+"#/data");await p.waitForTimeout(800);await p.fill("#p1","ui-pass-১");await p.fill("#p2","ui-pass-১");
 const [dl]=await Promise.all([p.waitForEvent("download"),p.click("#ex")]);const f=EV+"/tc-backup-ui.json";await dl.saveAs(f);await p.waitForTimeout(500);
 const raw=fs.readFileSync(f,"utf8");R.ui={fileName:dl.suggestedFilename(),encrypted:JSON.parse(raw).enc,plainTextLeak:raw.includes("প্রথম নোট"),lastBackupSet:await p.evaluate(()=>!!localStorage.getItem("lastBackupAt")),exportMsg:await p.$eval("#exo",e=>e.innerText)};
 await p.evaluate(async()=>{localStorage.clear();await new Promise(r=>{const q=indexedDB.deleteDatabase("amin-proto");q.onsuccess=q.onerror=q.onblocked=r})});await p.goto(URL+"#/notes");await p.reload();await p.waitForTimeout(1200);
 R.ui.notesAfterWipe=await p.$eval("main",m=>m.innerText.includes("প্রথম নোট"));
 await p.goto(URL+"#/data");await p.waitForTimeout(800);await p.setInputFiles("#im",f);await p.waitForTimeout(2500);R.ui.importPreview=await p.$eval("#imo",e=>e.innerText.replace(/\n/g," ").slice(0,160));
 await p.click("#mg");await p.waitForTimeout(1500);await p.goto(URL+"#/notes");await p.reload();await p.waitForTimeout(1200);R.ui.notesAfterImport=await p.$eval("main",m=>m.innerText.includes("প্রথম নোট")&&m.innerText.includes("দ্বিতীয় নোট"));
 await p.screenshot({path:EV+"/tc-notes-restored.png"});R.ui.errs=p._e;await ctx.close()}
// ---- D) cloud isolation: no Firebase/Google requests while using standalone pages, also offline
{const ctx=await chromium.launchPersistentContext(fs.mkdtempSync(path.join(os.tmpdir(),"amin-iso-")),{viewport:{width:412,height:915}});const p=ctx.pages()[0]||await ctx.newPage();const reqs=[];p.on("request",r=>{const u=r.url();if(!u.startsWith("http://localhost"))reqs.push(u)});
 await p.goto(URL+"#/today");await p.waitForTimeout(1500);for(const r of["hub","settings","data","notes","prayer","print","family","path","learn","share"]){await p.evaluate(x=>location.hash="#/"+x,r);await p.waitForTimeout(500)}
 R.isolation={externalRequestsOnStandalonePages:[...new Set(reqs.map(u=>new URL(u).host))]};
 await p.evaluate(x=>location.hash="#/bauth",0);await p.waitForTimeout(700);R.isolation.cloudPageWithoutConfig=(await p.$eval("main",m=>m.innerText)).includes("কনফিগ বসানো হয়নি");
 await ctx.setOffline(true);await p.goto(URL+"#/data");await p.waitForTimeout(1200);R.isolation.dataPageOffline=(await p.$eval("main",m=>m.innerText)).includes("ব্যাকআপ নিন");await ctx.close()}
fs.writeFileSync(EV+"/results-c.json",JSON.stringify(R,null,1));console.log(JSON.stringify(R,null,1));process.exit(0)})();
