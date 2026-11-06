import {repo} from "./core/repo.js";
const notes=repo("notes",{tier:"A"});
const esc=t=>String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;");
export async function render(el){
  el.innerHTML=`<h1>নোট <span class="chip warn">নমুনা মডিউল</span></h1><p class="small mut">স্বাধীন ডেটা-স্তরের পরীক্ষা: নোট শুধু এই ফোনে (IndexedDB), ব্যাকআপে যায়। নেটওয়ার্ক লাগে না।</p>
  <div class="card"><textarea id="t" rows="3" style="width:100%;background:var(--solid);color:inherit;border:1px solid var(--line);border-radius:12px;padding:8px;font:inherit" placeholder="নতুন নোট…"></textarea><div class="row" style="margin-top:6px"><button id="add">সংরক্ষণ</button><span id="n" class="small mut"></span></div></div><div id="l"></div>`;
  const draw=async()=>{const l=await notes.list({limit:30});el.querySelector("#n").textContent=(await notes.count())+"টি নোট";el.querySelector("#l").innerHTML=l.length?l.map(x=>`<div class="card"><div class="small mut">${new Date(x.updatedAt).toLocaleString("bn-BD")}</div><div style="white-space:pre-wrap">${esc(x.text)}</div><button class="ghost" data-d="${x.id}" style="padding:2px 10px;margin-top:6px">মুছুন</button></div>`).join(""):'<div class="card mut">এখনো কোনো নোট নেই</div>';el.querySelectorAll("[data-d]").forEach(b=>b.onclick=async()=>{await notes.delete(b.dataset.d)})};
  el.querySelector("#add").onclick=async()=>{const t=el.querySelector("#t").value.trim();if(!t)return;await notes.put({text:t});el.querySelector("#t").value=""};
  const off=notes.watch(draw);await draw();
}
