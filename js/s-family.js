const P={"বাবা":["👨","নমুনা প্রোফাইল","ফোন: —","জন্মদিন: —"],"মা":["👩","নমুনা প্রোফাইল","ফোন: —","জন্মদিন: —"],"ভাই ১":["🧑","নমুনা","ফোন: —","শেষ যোগাযোগ: —"],"ভাই ২":["🧑","নমুনা","ফোন: —","শেষ যোগাযোগ: —"],"বোন":["👩","নমুনা","ফোন: —","শেষ যোগাযোগ: —"],"আমি":["🙂","নমুনা","—","—"]};
export function render(el){
  const n=k=>`<button class="node" data-k="${k}"><div class="av">${P[k][0]}</div>${k}</button>`;
  el.innerHTML=`<h1>পরিবারের গাছ</h1><p class="small mut">নমুনা নোড (আসল তথ্য নয়)। কোনো নোডে ট্যাপ করুন — কার্ডটাই বড় হয়ে প্রোফাইল হবে।</p>
  <div class="card tree"><div class="gen">${n("বাবা")}${n("মা")}</div><div class="gen">${["ভাই ১","ভাই ২","বোন","আমি"].map(n).join("")}</div></div><div id="vt" class="chip"></div>`;
  const vt=el.querySelector("#vt");vt.textContent="View Transitions: "+(document.startViewTransition?"সমর্থিত":"নেই → সাধারণ ফেড");
  el.querySelectorAll(".node").forEach(b=>b.onclick=()=>open(b));
  function open(b){
    const k=b.dataset.k,p=P[k];
    const show=()=>{b.style.viewTransitionName="";const s=document.createElement("div");s.className="profile";s.innerHTML=`<div class="sheet" style="view-transition-name:card"><div class="row"><div class="av node" style="width:64px;height:64px;font-size:2rem;display:grid;place-items:center">${p[0]}</div><div><h2>${k}</h2><span class="chip warn">${p[1]}</span></div></div><p>${p.slice(2).join("<br>")}</p><button id="x">বন্ধ</button></div>`;document.body.appendChild(s);
      const close=()=>{const rm=()=>{s.remove()};if(document.startViewTransition){b.style.viewTransitionName="card";s.querySelector(".sheet").style.viewTransitionName="";document.startViewTransition(()=>{rm()}).finished.finally(()=>b.style.viewTransitionName="")}else rm()};
      s.querySelector("#x").onclick=close;s.onclick=e=>{if(e.target===s)close()}};
    if(document.startViewTransition){b.style.viewTransitionName="card";const t=document.startViewTransition(show);window.__vt=t}else{show()}
  }
}
