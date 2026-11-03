import {load,configured,friendly,needCfg,withTimeout,cfg} from "./fb.js";
const P=[["বাংলা (সাধারণ জ্ঞান)","বাংলাদেশের রাজধানী কোথায়? এক বাক্যে বাংলায় উত্তর দাও।"],["আরবি (হরকতসহ, সাধারণ বাক্য)","اكتب جملة قصيرة بالعربية مع التشكيل الكامل عن المدرسة."]];
export async function render(el){
  if(!configured())return needCfg(el);
  let n=0;try{n=+localStorage.getItem("aiCalls")||0}catch{}
  el.innerHTML=`<h1>খ-২ App Check ও AI-কল</h1><p class="small mut">শুধু সাধারণ প্রশ্ন (ছাত্র/ব্যক্তিগত তথ্য নয় — C4)। প্রতিবার পাঠানোর আগে "Google-এ যাবে" নিশ্চিতকরণ আসবে।</p>
  <div class="card" id="ac">App Check: লোড হচ্ছে…</div>
  <div class="card"><label>মডেল: <input type="text" id="md" value="${cfg.model}" style="width:70%"></label><div class="small mut">নাম অনুমান। না চললে অন্য নাম দিয়ে দেখুন; যেটা চলে সেটা লিখে রাখুন।</div><div class="small">এই ডিভাইসে মোট AI-কল (নিজস্ব গণনা): <b id="n">${n}</b></div></div>
  ${P.map((p,i)=>`<div class="card"><b>${p[0]}</b><div class="${i?"arab":""}" style="${i?"":"margin:6px 0"}">${p[1]}</div><button data-i="${i}">পাঠান</button><div class="out" id="o${i}"></div></div>`).join("")}`;
  let F;try{F=await load()}catch(e){el.querySelector("#ac").innerHTML=`<span class="chip bad">${friendly(e)}</span> ${e.message}`;return}
  const ac=el.querySelector("#ac");
  try{const t=await withTimeout(F.m.ac.getToken(F.appCheck,false),12000);ac.innerHTML=`App Check (${F.acInfo}): <span class="chip ok">টোকেন পাওয়া গেছে</span> <span class="small mut">(${t.token.length} অক্ষর, মান দেখানো হয় না)</span>`}
  catch(e){ac.innerHTML=`App Check (${F.acInfo}): <span class="chip bad">টোকেন পাওয়া যায়নি</span> <div class="small">${friendly(e)} — ${String(e.message).slice(0,120)}</div>`}
  el.querySelectorAll("[data-i]").forEach(b=>b.onclick=async()=>{
    const i=+b.dataset.i,out=el.querySelector("#o"+i),model=el.querySelector("#md").value.trim();
    if(!confirm("এই লেখা Google-এ যাবে:\n\n"+P[i][1]+"\n\nমডেল: "+model+"\nপাঠাব?"))return;
    out.innerHTML="পড়ছে… সাজাচ্ছে…";const t0=performance.now();
    try{const gm=F.m.ai.getGenerativeModel(F.ai,{model});const r=await withTimeout(gm.generateContent(P[i][1]));const ms=performance.now()-t0;const um=r.response.usageMetadata||{};
      try{localStorage.setItem("aiCalls",++n)}catch{};el.querySelector("#n").textContent=n;
      out.innerHTML=`<div class="${i?"arab":""} sample">${r.response.text().replace(/</g,"&lt;")}</div><span class="chip ok">সফল</span> <span class="chip">${(ms/1000).toFixed(1)} সেকেন্ড</span> <span class="chip">মডেল: ${model}</span> <span class="chip">টোকেন: ${um.totalTokenCount??"?"}</span><div class="small mut">উত্তর ঠিক কি না (বিশেষ করে আরবি হরকত) আপনি নিজে দেখুন।</div>`}
    catch(e){out.innerHTML=`<span class="chip bad">ব্যর্থ</span> ${friendly(e)}<div class="small mut">${String(e.code||"")} ${String(e.message).slice(0,200)}</div>`}
  });
}
