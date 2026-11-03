const open=()=>new Promise((res,rej)=>{const r=indexedDB.open("amin-proto",1);r.onupgradeneeded=()=>r.result.createObjectStore("fonts",{keyPath:"name"});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const tx=async(mode,fn)=>{const db=await open();return new Promise((res,rej)=>{const t=db.transaction("fonts",mode);const r=fn(t.objectStore("fonts"));t.oncomplete=()=>res(r.result);t.onerror=()=>rej(t.error)})};
export const putFont=(name,buf,type)=>tx("readwrite",s=>s.put({name,buf,type,at:Date.now()}));
export const allFonts=()=>tx("readonly",s=>s.getAll());
export const delFont=n=>tx("readwrite",s=>s.delete(n));
export async function restoreFonts(){
  let list=[];try{list=await allFonts()}catch{return[]}
  const ok=[];
  for(const f of list){try{const ff=new FontFace("U-"+f.name,f.buf);await ff.load();document.fonts.add(ff);ok.push(f.name)}catch(e){console.warn("font restore failed",f.name,e)}}
  return ok;
}
