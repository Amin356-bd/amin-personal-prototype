import {startFps,autoLite,setLite} from "./perf.js";
import {restoreFonts} from "./idb.js";
const R={bauth:"./s-bauth.js",bai:"./s-bai.js",bpdf:"./s-bpdf.js",bremind:"./s-bremind.js",share:"./s-share.js",today:"./s-today.js",family:"./s-family.js",path:"./s-path.js",prayer:"./s-prayer.js",hub:"./s-hub.js",fonts:"./s-fonts.js",glass:"./s-glass.js",learn:"./s-learn.js",icons:"./s-icons.js",print:"./s-print.js",install:"./s-install.js"};
const view=document.getElementById("view");
export const toast=(m)=>{const t=document.getElementById("toast");t.textContent=m;t.classList.add("on");clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove("on"),2600)};
window.toast=toast;
try{if(localStorage.getItem("lite"))setLite(true);const th=localStorage.getItem("theme");if(th)document.documentElement.dataset.theme=th}catch{}
// global FPS meter + auto-lite (only counts when blur is active)
const auto=autoLite({min:40,bad:3,onTrigger:f=>{setLite(true);toast("ফোন ধীর — হালকা মোড চালু হলো ("+f.toFixed(0)+" fps)");window.__autoLite=true}});
startFps(f=>{document.getElementById("fps").textContent=f.toFixed(0)+" fps";window.__fps=f;if(!document.documentElement.hasAttribute("data-lite")&&!window.__noAuto)auto(f)});
// Web Share Target (GET): ?title=&text=&url= → keep in IndexedDB-free localStorage inbox, clean URL, open #/share
try{const q=new URLSearchParams(location.search);if(q.has("text")||q.has("url")||q.has("title")){const inbox=JSON.parse(localStorage.getItem("shareInbox")||"[]");inbox.unshift({title:q.get("title")||"",text:q.get("text")||"",url:q.get("url")||"",at:Date.now()});localStorage.setItem("shareInbox",JSON.stringify(inbox.slice(0,20)));history.replaceState(null,"",location.pathname+"#/share")}}catch{}
let tok=0;
async function go(){
  const name=(location.hash.replace(/^#\/?/,"")||"today").split("/")[0];
  const key=R[name]?name:"hub",my=++tok;
  document.querySelectorAll(".bar a").forEach(a=>a.classList.toggle("on",a.dataset.r===key));
  view.innerHTML='<div class="card mut">লোড হচ্ছে…</div>';
  try{const m=await import(R[key]);if(my!==tok)return;view.innerHTML="";await m.render(view);view.focus({preventScroll:true})}
  catch(e){view.innerHTML=`<div class="card"><h3>এই অংশ খুলল না</h3><p class="mut small">${String(e)}</p><button onclick="location.reload()">আবার চেষ্টা</button></div>`;console.error(e)}
}
addEventListener("hashchange",go);
restoreFonts().then(l=>{window.__fontsRestored=l;go()});
if("serviceWorker"in navigator){navigator.serviceWorker.register("sw.js").then(r=>{window.__sw=r}).catch(e=>console.warn("sw",e))}
