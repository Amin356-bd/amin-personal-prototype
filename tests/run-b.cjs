const {chromium}=require("playwright");const fs=require("fs");const {execSync}=require("child_process");const EV=process.argv[2];const R={};const URL="http://localhost:8765/index.html";const sh=c=>execSync(c,{encoding:"utf8"});
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:412,height:915},deviceScaleFactor:2,isMobile:true,hasTouch:true});const p=await ctx.newPage();p._e=[];p.on("pageerror",e=>p._e.push(e.message));
// share target manifest + simulated delivery
await p.goto(URL+"#/today");await p.waitForTimeout(2000);const cdp=await ctx.newCDPSession(p);await cdp.send("Page.enable");
const m=await cdp.send("Page.getAppManifest");const mj=JSON.parse(m.data);R.share={manifestShareTarget:mj.share_target,manifestErrors:m.errors,installErrors:(await cdp.send("Page.getInstallabilityErrors")).installabilityErrors,shortcuts:(mj.shortcuts||[]).map(s=>s.name)};
await p.goto(URL+"?title=T&text="+encodeURIComponent("নমুনা শেয়ার")+"&url="+encodeURIComponent("https://example.com/a?b=1"));await p.waitForTimeout(1500);
R.share.afterSimulatedShare={hash:await p.evaluate(()=>location.hash),search:await p.evaluate(()=>location.search),text:await p.$eval("main",x=>x.innerText.slice(0,120)),link:await p.$$eval("main a",a=>a.map(x=>x.href))};
await p.screenshot({path:EV+"/t9-share.png"});
// offline: share page still opens with query (SW ignoreSearch)
await ctx.setOffline(true);const q=await ctx.newPage();await q.goto(URL+"?text=offline-test");await q.waitForTimeout(1200);R.share.offlineShareOpens=(await q.$eval("main",x=>x.innerText)).includes("offline-test");await ctx.setOffline(false);await q.close();
// RTL layouts
await p.goto(URL+"#/print");await p.waitForTimeout(900);R.rtl={};
for(const n of [1,2,3,4]){await p.selectOption("#d","rtl");await p.selectOption("#n",String(n));await p.waitForTimeout(300);await p.emulateMedia({media:"print"});const f=`${EV}/t4-rtl-n${n}.pdf`;await p.pdf({path:f,preferCSSPageSize:true,printBackground:true});await p.emulateMedia({media:"screen"});
 const pages=+sh(`pdfinfo "${f}"`).match(/Pages:\s+(\d+)/)[1];const order=[];for(let i=1;i<=pages;i++){const t=sh(`pdftotext -f ${i} -l ${i} -bbox "${f}" -`);const w=[...t.matchAll(/<word xMin="([\d.]+)"[^>]*>([^<]*)<\/word>/g)].map(x=>[+x[1],x[2]]);const o=[];for(let k=0;k<w.length-1;k++)if(w[k][1]==="[অর্ধ-পাতা")o.push([w[k][0],w[k+1][1].replace("]","")]);order.push(o.sort((a,b)=>a[0]-b[0]).map(x=>x[1]))}
 R.rtl[n]={pages,leftToRight:order,info:await p.$eval("#info",e=>e.textContent)}}
R.errs=p._e;fs.writeFileSync(EV+"/results-b.json",JSON.stringify(R,null,1));console.log(JSON.stringify(R,null,1));await b.close()})();
