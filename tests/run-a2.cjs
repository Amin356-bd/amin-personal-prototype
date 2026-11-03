const {chromium}=require("playwright");const fs=require("fs");const EV=process.argv[2];const R={};const URL="http://localhost:8765/index.html";
(async()=>{const b=await chromium.launch();
const mk=async()=>{const ctx=await b.newContext({viewport:{width:412,height:915},deviceScaleFactor:2,isMobile:true,hasTouch:true});return [ctx,await ctx.newPage()]};
// fonts status now must say NOT loaded (Google blocked here)
{const [ctx,p]=await mk();await p.goto(URL+"#/fonts");await p.waitForTimeout(5000);R.fontsStatusFixed=await p.$$eval("[data-f],#st-amiri",es=>es.map(e=>e.textContent));await ctx.close()}
// auto-lite pipeline with injected main-thread load (headless rAF stays 60 otherwise)
{const [ctx,p]=await mk();await p.goto(URL+"#/glass");await p.waitForTimeout(800);await p.click('[data-n="3"]');
 R.before={lite:await p.evaluate(()=>document.documentElement.hasAttribute("data-lite")),blur:await p.$eval(".layer.l1",e=>getComputedStyle(e).backdropFilter)};
 await p.evaluate(()=>{(function burn(){const t=performance.now();while(performance.now()-t<45);requestAnimationFrame(burn)})()});
 await p.waitForTimeout(7000);
 R.heavy={fps:+(await p.evaluate(()=>window.__fps)).toFixed(1),lite:await p.evaluate(()=>document.documentElement.hasAttribute("data-lite")),auto:await p.evaluate(()=>!!window.__autoLite),blur:await p.$eval(".layer.l1",e=>getComputedStyle(e).backdropFilter),toast:await p.$eval("#toast",e=>e.textContent)};
 await p.screenshot({path:EV+"/t2-autolite.png"});await ctx.close()}
// negative control: no load, 0 layers, 8s
{const [ctx,p]=await mk();await p.goto(URL+"#/glass");await p.waitForTimeout(500);await p.click('[data-n="0"]');await p.waitForTimeout(8000);R.control={lite:await p.evaluate(()=>document.documentElement.hasAttribute("data-lite")),fps:+(await p.evaluate(()=>window.__fps)).toFixed(1)};await ctx.close()}
// unit: autoLite requires 3 consecutive bad samples
const m=await (async()=>{const {autoLite}=await import("/home/claude/amin-proto/js/perf.js");let n=0;const f=autoLite({min:40,bad:3,onTrigger:()=>n++});[60,30,60,30,30,60,30,30,30,30].forEach(f);return n})();R.unit_trigger_count_expect1=m;
fs.writeFileSync(EV+"/results-a2.json",JSON.stringify(R,null,2));console.log(JSON.stringify(R,null,1));await b.close()})();
