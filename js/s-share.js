export function render(el){
  let inbox=[];try{inbox=JSON.parse(localStorage.getItem("shareInbox")||"[]")}catch{}
  const link=u=>/^https?:\/\//.test(u)?`<a href="${u.replace(/"/g,"%22")}" target="_blank" rel="noopener">${u.replace(/</g,"&lt;")}</a>`:"";
  const esc=t=>t.replace(/&/g,"&amp;").replace(/</g,"&lt;");
  el.innerHTML=`<h1>শেয়ার-ইনবক্স</h1><p class="small mut">ফেসবুক/Chrome থেকে "Share" → "AMIN" বেছে নিলে এখানে আসবে। (শুধু ইনস্টল-করা অ্যাপে কাজ করে।)</p>
  ${inbox.length?inbox.map(i=>`<div class="card"><div class="small mut">${new Date(i.at).toLocaleString("bn-BD")}</div>${i.title?`<b>${esc(i.title)}</b><br>`:""}${esc(i.text)}${i.url?`<br>${link(i.url)||esc(i.url)}`:""}</div>`).join(""):'<div class="card mut">এখনো কিছু আসেনি।</div>'}
  <button class="ghost" id="clr">ইনবক্স খালি করুন</button>`;
  el.querySelector("#clr").onclick=()=>{try{localStorage.removeItem("shareInbox")}catch{}render(el)};
}
