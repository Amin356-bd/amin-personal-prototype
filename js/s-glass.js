import {setLite} from "./perf.js";
export function render(el){
  window.__noAuto=false;
  el.innerHTML=`<h1>কাচ-চাপ-পরীক্ষা</h1><p class="small mut">ব্লার-স্তর বাড়িয়ে ওপরের FPS দেখুন। প্ল্যান: সর্বোচ্চ ২ স্তর। ৩ স্তর শুধু পরীক্ষার জন্য। ৩ সেকেন্ড টানা ৪০ fps-এর নিচে গেলে নিজে হালকা মোড চালু হবে।</p>
  <div class="row"><button data-n="0" class="ghost">০ স্তর</button><button data-n="1">১</button><button data-n="2">২</button><button data-n="3" class="ghost">৩ (শুধু পরীক্ষা)</button><button id="lite" class="ghost">হালকা মোড বদল</button></div>
  <div class="card"><div>FPS (গড় ১ সেকেন্ড): <b id="v">—</b> · স্তর: <b id="n">০</b> · হালকা মোড: <b id="l">বন্ধ</b></div><div id="log" class="small mut"></div></div>
  <div class="stress" id="st"><div class="blob"></div><div class="blob"></div><div class="blob"></div>
   <div class="layer l1 glass">স্তর ১</div><div class="layer l2 glass">স্তর ২</div><div class="layer l3 glass">স্তর ৩</div></div>`;
  const st=el.querySelector("#st"),log=el.querySelector("#log");
  const set=n=>{st.querySelectorAll(".layer").forEach((l,i)=>l.style.display=i<n?"":"none");el.querySelector("#n").textContent=n;window.__layers=n};
  el.querySelectorAll("[data-n]").forEach(b=>b.onclick=()=>set(+b.dataset.n));set(1);
  el.querySelector("#lite").onclick=()=>{setLite(!document.documentElement.hasAttribute("data-lite"))};
  const iv=setInterval(()=>{if(!el.querySelector("#v")){clearInterval(iv);return}el.querySelector("#v").textContent=(window.__fps||0).toFixed(0);el.querySelector("#l").textContent=document.documentElement.hasAttribute("data-lite")?(window.__autoLite?"চালু (নিজে)":"চালু"):"বন্ধ"},500);
}
