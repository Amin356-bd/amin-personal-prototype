const {chromium}=require("playwright");(async()=>{
const OUT=process.argv[2];
const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:412,height:915},deviceScaleFactor:2,isMobile:true,hasTouch:true,serviceWorkers:"allow"});
const p=await ctx.newPage();const errs=[];
p.on("console",m=>{if(m.type()==="error")errs.push(m.text())});p.on("pageerror",e=>errs.push("PAGEERR "+e.message));
await p.goto("http://localhost:8765/index.html#/today");await p.waitForTimeout(1500);
for(const r of ["today","family","path","learn","glass","fonts","print","install","icons","prayer","hub"]){
  await p.evaluate(r=>location.hash="#/"+r,r);await p.waitForTimeout(1200);
  await p.screenshot({path:`${OUT}/s-${r}.png`});
  const t=await p.$eval("main",m=>m.innerText.slice(0,60).replace(/\n/g," "));console.log(r,"→",t);
}
console.log("ERRORS:",JSON.stringify(errs,null,1));
await b.close();
})();
