// FPS meter + auto light-mode trigger (blur off when frames are slow)
export function startFps(onSample){
  let n=0,t0=performance.now(),run=true;
  (function loop(t){if(!run)return;n++;if(t-t0>=1000){onSample(n*1000/(t-t0));n=0;t0=t}requestAnimationFrame(loop)})(t0);
  return()=>{run=false};
}
// triggers when `bad` consecutive 1s samples are below `min` fps
export function autoLite({min=40,bad=3,onTrigger}){
  let c=0,done=false;
  return fps=>{if(done)return;if(fps<min){if(++c>=bad){done=true;onTrigger(fps)}}else c=0};
}
export function setLite(on){document.documentElement.toggleAttribute("data-lite",!!on);try{localStorage.setItem("lite",on?"1":"")}catch{}}
