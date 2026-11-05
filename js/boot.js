// Classic (blocking) script: applies saved font/size/theme BEFORE first paint so a reload never flashes or resets the default font.
(function(){
  var d=document.documentElement,L;try{L=localStorage}catch(e){return}
  var F=window.AMIN_FONTS={
    "default":{l:"অ্যাপের ডিফল্ট (Hind Siliguri)",s:null,g:null},
    anek:{l:"Anek Bangla",s:"'Anek Bangla'",g:"Anek+Bangla:wght@400;600"},
    hind:{l:"Hind Siliguri",s:"'Hind Siliguri'",g:"Hind+Siliguri:wght@400;600"},
    notoserif:{l:"Noto Serif Bengali",s:"'Noto Serif Bengali'",g:"Noto+Serif+Bengali:wght@400;600"},
    device:{l:"ডিভাইসের ডিফল্ট",s:"'Noto Sans Bengali'",g:null}};
  var base=",'Noto Sans Bengali',Poppins,system-ui,sans-serif";
  function stack(k){if(!k||k==="default")return null;if(k.indexOf("U-")===0)return "'"+k.replace(/['"\\]/g,"")+"'";return F[k]?F[k].s:null}
  function link(k){var f=F[k];if(!f||!f.g||document.getElementById("gf-"+k))return;var l=document.createElement("link");l.id="gf-"+k;l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family="+f.g+"&display=swap";document.head.appendChild(l)}
  function apply(){
    var u=L.getItem("fontUI"),r=L.getItem("fontRead"),fs=L.getItem("fs"),th=L.getItem("theme"),s;
    if(th)d.dataset.theme=th;
    if(fs&&+fs>=12&&+fs<=26)d.style.setProperty("--fs",fs+"px");
    s=stack(u);if(s){d.style.setProperty("--ui",s+base);d.style.setProperty("--head",s+base);link(u)}else{d.style.removeProperty("--ui");d.style.removeProperty("--head")}
    s=stack(r);if(s){d.style.setProperty("--read",s+base);link(r)}else d.style.removeProperty("--read");
    d.dataset.fontUi=u||"default";d.dataset.fontRead=r||"default";
  }
  window.AMIN_applyFonts=apply;apply();
})();
