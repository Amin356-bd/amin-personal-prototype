export async function render(el){
  const info=async()=>{const sw=await navigator.serviceWorker?.getRegistration();const keys=await caches.keys().catch(()=>[]);let est={};try{est=await navigator.storage.estimate()}catch{}let pers="?";try{pers=await navigator.storage.persisted()}catch{}
    const standalone=matchMedia("(display-mode: standalone)").matches||navigator.standalone;
    const rows=[["নিরাপদ সংযোগ (https)",isSecureContext],["Service Worker চালু",!!sw?.active],["ক্যাশ তৈরি",keys.length>0],["ইনস্টল-করা অ্যাপ হিসেবে খোলা",standalone],["এখন অনলাইন",navigator.onLine],["স্থায়ী স্টোরেজ (persist)",pers]];
    el.querySelector("#st").innerHTML=rows.map(([a,b])=>`<tr><td style="text-align:left">${a}</td><td>${b===true?'<span class="chip ok">হ্যাঁ</span>':b===false?'<span class="chip bad">না</span>':b}</td></tr>`).join("")+`<tr><td style="text-align:left">ক্যাশ-নাম</td><td class="small">${keys.join(", ")||"—"}</td></tr><tr><td style="text-align:left">ব্যবহৃত / কোটা</td><td class="small">${est.usage?(est.usage/1048576).toFixed(1):"?"} MB / ${est.quota?(est.quota/1048576).toFixed(0):"?"} MB</td></tr>`};
  el.innerHTML=`<h1>ইনস্টল ও অফলাইন</h1><div class="card"><button id="ins" disabled>অ্যাপ ইনস্টল করুন</button> <button class="ghost" id="rf">অবস্থা আবার দেখুন</button><table id="st" style="margin-top:10px"></table></div>
  <div class="card small"><b>ফোনে যা করবেন</b><ol><li>Chrome মেনু → "Install app / Add to Home screen"।</li><li>হোম-স্ক্রিনের আইকন ঠিক আছে কি না দেখুন (গোল/বর্গ কাটায়)।</li><li>একবার সব পাতা খুলে ঘুরে আসুন (ক্যাশ ভরবে)।</li><li>এয়ারপ্লেন মোড চালু করে অ্যাপ খুলুন → "আজ" ও "নামাজ" পাতা চলছে কি না।</li><li>উপরের তালিকায় "ফন্ট" পাতা অফলাইনে ফন্ট দেখায় কি না, আলাদা করে দেখুন।</li></ol></div>`;
  let dp;addEventListener("beforeinstallprompt",e=>{e.preventDefault();dp=e;el.querySelector("#ins").disabled=false});
  el.querySelector("#ins").onclick=async()=>{if(dp){dp.prompt();await dp.userChoice}};
  el.querySelector("#rf").onclick=info;info();window.__installDeferred=()=>dp;
}
