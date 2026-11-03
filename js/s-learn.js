export function render(el){
  el.innerHTML=`<h1>জানার কোণ</h1><div class="card glass"><div class="row"><svg class="flag" viewBox="0 0 96 58"><rect width="96" height="58" fill="#006a4e"/><circle cx="43" cy="29" r="17" fill="#f42a41"/></svg><div><h2>বাংলাদেশ</h2><span class="chip warn">নমুনা কার্ড — AI-এর JSON থেকে আসবে</span></div></div>
  <div class="facts" style="margin-top:12px">${[["রাজধানী","ঢাকা"],["ভাষা","বাংলা"],["মুদ্রা","টাকা"],["জনসংখ্যা","প্রায় ১৭ কোটি"]].map(([a,b])=>`<div class="fact"><b>${a}</b>${b} <span class="chip warn">যাচাই করুন</span></div>`).join("")}</div></div>
  <h3>ফ্ল্যাশকার্ড</h3><div class="flip" id="fl"><div class="in"><div class="f">বাংলাদেশের রাজধানী কী?<br><span class="mut small">ট্যাপ করুন</span></div><div class="b"><b>ঢাকা</b></div></div></div>`;
  el.querySelector("#fl").onclick=e=>e.currentTarget.classList.toggle("on");
}
