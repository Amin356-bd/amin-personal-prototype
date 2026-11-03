import {load,configured,friendly,needCfg,withTimeout,cfg} from "./fb.js";
const MAX=15*1024*1024; // 20MB total request incl. base64 (+33%) per docs → ≤15MB raw
export async function render(el){
  el.innerHTML=`<h1>খ-৩ AI দিয়ে PDF পড়া</h1><p class="small mut">শুধু বইয়ের পাঠ-অংশ (≤১৫ MB; অধ্যায়/পৃষ্ঠা-পরিসর কেটে নিন)। ছাত্রের নাম/ব্যক্তিগত কিছু নয়।</p>
  <div class="card"><input type="file" id="f" accept="application/pdf"><div id="info" class="small mut"></div><label class="small">মডেল: <input type="text" id="md" value="${cfg.model}"></label><br><button id="go" disabled style="margin-top:8px">পাঠান ও লেখা তোলান</button><div id="out"></div></div>
  <div class="card"><h3>সরকারি PDF-র সরাসরি লিংক (C8)</h3><input type="text" id="u" placeholder="https://… .pdf" style="width:100%"><div class="row" style="margin-top:6px"><button class="ghost" id="cors">ব্রাউজার থেকে আনা যায় কি? (CORS)</button></div><div id="uo" class="small"></div>
  <p class="small mut">ডক (firebase ai-logic/input-file-requirements): Gemini Developer API-তে সরাসরি পাবলিক PDF-URL ফাইল-ইনপুট হিসেবে তালিকাভুক্ত নয় (শুধু YouTube URL) — তাই AI-কে URL দিয়ে পড়ানোর চেষ্টা <b>জোর করা হয়নি</b>। বিকল্প: ব্রাউজারে বাইট এনে ≤১৫ MB হলে inline পাঠানো, নয়তো হাতে আপলোড।</p></div>`;
  let file=null,b64=null;
  const info=el.querySelector("#info"),go=el.querySelector("#go");
  el.querySelector("#f").onchange=async e=>{file=e.target.files[0];go.disabled=true;if(!file)return;
    const mb=(file.size/1048576).toFixed(2);
    if(file.type&&file.type!=="application/pdf"){info.innerHTML=`<span class="chip bad">PDF নয়</span>`;return}
    if(file.size>MAX){info.innerHTML=`<span class="chip bad">${mb} MB — সীমা ১৫ MB পেরিয়েছে</span> (মোট অনুরোধ ২০ MB; base64-এ ~৩৩% বাড়ে)। পৃষ্ঠা-পরিসর ছোট করে আবার দিন।`;return}
    const buf=new Uint8Array(await file.arrayBuffer());let s="";for(let i=0;i<buf.length;i+=0x8000)s+=String.fromCharCode.apply(null,buf.subarray(i,i+0x8000));b64=btoa(s);
    info.innerHTML=`<span class="chip ok">${mb} MB · base64 ${(b64.length/1048576).toFixed(2)} MB</span>`;go.disabled=false;window.__pdfReady=true};
  go.onclick=async()=>{
    if(!configured())return needCfg(el.querySelector("#out"));
    if(!confirm(`এই PDF Google-এ যাবে:\n${file.name} (${(file.size/1048576).toFixed(1)} MB)\n\nএতে ছাত্রের নাম/ব্যক্তিগত তথ্য নেই তো?`))return;
    const out=el.querySelector("#out"),model=el.querySelector("#md").value.trim();out.innerHTML="পড়ছে… সাজাচ্ছে…";const t0=performance.now();
    try{const F=await load();const gm=F.m.ai.getGenerativeModel(F.ai,{model});
      const r=await withTimeout(gm.generateContent([{inlineData:{mimeType:"application/pdf",data:b64}},"এই PDF-এর লেখা হুবহু তুলে দাও (কোনো অনুমান বা সংযোজন নয়; অস্পষ্ট হলে [অস্পষ্ট] লিখো)। তারপর '---' দিয়ে ৩ বাক্যে সারাংশ দাও।"]),90000);
      const ms=performance.now()-t0,t=r.response.text();
      out.innerHTML=`<span class="chip ok">সফল</span> <span class="chip">${(ms/1000).toFixed(1)} সেকেন্ড</span> <span class="chip">${t.length} অক্ষর</span><div class="sample" style="max-height:300px;overflow:auto;white-space:pre-wrap">${t.replace(/</g,"&lt;")}</div><div class="small">আসল পাতার সঙ্গে মিলিয়ে বলুন:</div><div class="row"><button class="ghost" data-q="ভালো">লেখা ঠিক</button><button class="ghost" data-q="কিছু ভুল">কিছু ভুল</button><button class="ghost" data-q="উল্টোপাল্টা (পুরোনো ফন্ট?)">উল্টোপাল্টা</button></div><div id="q" class="small"></div>`;
      out.querySelectorAll("[data-q]").forEach(b=>b.onclick=()=>{try{localStorage.setItem("pdfq:"+file.name,b.dataset.q)}catch{};out.querySelector("#q").textContent="লেখা হলো: "+b.dataset.q+" — ফাইল: "+file.name})}
    catch(e){out.innerHTML=`<span class="chip bad">ব্যর্থ</span> ${friendly(e)}<div class="small mut">${String(e.message).slice(0,200)}</div>`}};
  el.querySelector("#cors").onclick=async()=>{const u=el.querySelector("#u").value.trim(),o=el.querySelector("#uo");if(!/^https:\/\//.test(u)){o.textContent="https:// লিংক দিন";return}
    o.textContent="দেখছি…";try{const ctl=new AbortController();setTimeout(()=>ctl.abort(),10000);const r=await fetch(u,{signal:ctl.signal});const len=r.headers.get("content-length");const buf=await r.arrayBuffer();o.innerHTML=`<span class="chip ok">আনা গেছে</span> ${r.status} · ${(buf.byteLength/1048576).toFixed(2)} MB${buf.byteLength>MAX?' <span class="chip warn">১৫ MB-এর বেশি — ভাগ করতে হবে</span>':""}`}
    catch(e){o.innerHTML=`<span class="chip bad">আনা যায়নি</span> (সম্ভবত CORS/ব্লক) — তখন লিংক খুলে পড়া বা হাতে আপলোড। <span class="mut">${e.name}</span>`}};
}
