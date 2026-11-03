import {load,configured,cfgOwner,friendly,needCfg,cfg} from "./fb.js";
export async function render(el){
  if(!configured())return needCfg(el);
  el.innerHTML=`<h1>খ-১ সাইন-ইন ও নিয়ম</h1><p class="small mut">Google সাইন-ইন (পপআপ) → আপনার UID → নিয়ম-পরীক্ষা। অন্য UID-র নেগেটিভ টেস্ট স্বয়ংক্রিয়।</p><div class="card" id="st">লোড হচ্ছে…</div><div class="row"><button id="in">Google দিয়ে সাইন-ইন</button><button class="ghost" id="out">সাইন-আউট</button><button class="ghost" id="run">নিয়ম-পরীক্ষা চালান</button></div><div id="res"></div>`;
  let F;try{F=await load()}catch(e){el.querySelector("#st").innerHTML=`<span class="chip bad">${friendly(e)}</span><div class="small">${e.message}</div>`;return}
  const {m,auth,db}=F,st=el.querySelector("#st"),res=el.querySelector("#res");
  const show=u=>{const own=cfgOwner();st.innerHTML=u?`<b>সাইন-ইন হয়েছে</b><br>UID: <code id="uid" style="word-break:break-all">${u.uid}</code> <button class="ghost" id="cp" style="padding:2px 8px">কপি</button><br><span class="chip ${own?(own===u.uid?"ok":"warn"):"warn"}">${own?(own===u.uid?"এটাই মালিক-UID":"মালিক-UID নয় (অন্য অ্যাকাউন্ট)"):"config-এ ownerUid বসান"}</span>`:`<span class="chip">সাইন-ইন নেই</span>`;st.querySelector("#cp")?.addEventListener("click",()=>navigator.clipboard?.writeText(u.uid))};
  m.auth.onAuthStateChanged(auth,show);
  el.querySelector("#in").onclick=async()=>{const t0=performance.now();try{await m.auth.signInWithPopup(auth,new m.auth.GoogleAuthProvider());toast("সাইন-ইন ("+((performance.now()-t0)/1000).toFixed(1)+"s)")}catch(e){st.innerHTML+=`<br><span class="chip bad">${e.code||""} ${friendly(e)}</span>`}};
  el.querySelector("#out").onclick=()=>m.auth.signOut(auth);
  el.querySelector("#run").onclick=async()=>{
    const u=auth.currentUser,own=cfgOwner();const rows=[];
    const T=async(name,expectAllow,fn)=>{let got,err="";try{await fn();got="allow"}catch(e){got=/permission-denied/i.test(e.code+e.message)?"deny":"error";err=got==="error"?friendly(e):""}
      rows.push({name,expect:expectAllow?"allow":"deny",got,err,pass:got===(expectAllow?"allow":"deny")})};
    const mine=u&&own&&u.uid===own;const D=(p)=>m.fs.doc(db,...p.split("/"));
    if(!u){await T("সাইন-ইন ছাড়া নিজের পথে পড়া",false,()=>m.fs.getDoc(D("users/ANON_TEST/probe/p1")))}
    else{
      await T("নিজের পথে লেখা  users/{uid}/probe/p1",!!mine,()=>m.fs.setDoc(D(`users/${u.uid}/probe/p1`),{note:"stage0a",t:m.fs.serverTimestamp()}));
      await T("নিজের পথে পড়া",!!mine,()=>m.fs.getDoc(D(`users/${u.uid}/probe/p1`)));
      await T("অন্য UID-র পথে পড়া (নেগেটিভ)",false,()=>m.fs.getDoc(D("users/OTHER_UID_TEST/probe/p1")));
      await T("অন্য UID-র পথে লেখা (নেগেটিভ)",false,()=>m.fs.setDoc(D("users/OTHER_UID_TEST/probe/p1"),{x:1}));
      await T("অজানা কালেকশনে লেখা strangers/x (নেগেটিভ)",false,()=>m.fs.setDoc(D("strangers/x"),{x:1}));
      await T("catalog পড়া (v1: শুধু মালিক)",!!mine,()=>m.fs.getDoc(D("catalog/probe")));
    }
    res.innerHTML=`<table><tr><th>পরীক্ষা</th><th>প্রত্যাশা</th><th>ফল</th><th></th></tr>${rows.map(r=>`<tr><td style="text-align:left">${r.name}</td><td>${r.expect}</td><td>${r.got}${r.err?"<br><span class='small'>"+r.err+"</span>":""}</td><td><span class="chip ${r.pass?"ok":"bad"}">${r.pass?"PASS":"FAIL"}</span></td></tr>`).join("")}</table><p class="small mut">${!own?"⚠ ownerUid বসানো নেই — নিয়মে OWNER_UID-ও বসান, তারপর আবার চালান।":mine?"আপনি মালিক: নিজের পথ allow, অন্যের পথ deny হওয়ার কথা।":"আপনি মালিক নন (দ্বিতীয় অ্যাকাউন্টের পরীক্ষা): সবকিছু deny হওয়ার কথা।"}</p><button class="ghost" id="cpy">ফল কপি করুন</button>`;
    res.querySelector("#cpy").onclick=()=>navigator.clipboard?.writeText(rows.map(r=>`${r.pass?"PASS":"FAIL"} | ${r.name} | expect ${r.expect} got ${r.got}`).join("\n")+`\nowner=${!!mine} signedIn=${!!u}`).then(()=>toast("কপি হয়েছে"));
  };
}
