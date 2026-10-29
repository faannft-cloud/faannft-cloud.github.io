(() => {
 'use strict';
 const root=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const stage=document.querySelector('.constellation'),disc=document.querySelector('.vinyl-disc');
 const gate=document.querySelector('.scene-gate'),pin=gate.querySelector('.gate-pin');
 const left=gate.querySelector('.door-left'),right=gate.querySelector('.door-right'),invite=gate.querySelector('.gate-invitation');
 const visible=new Set();let frame=0;
 const clamp=n=>Math.max(0,Math.min(1,n));
 const stopped=()=>document.hidden||reduce.matches||root.classList.contains('effects-paused');
 function paint(){
  frame=0;if(stopped())return;
  // Read both active sections before writing: no document-wide geometry or filters.
  const sr=visible.has(stage)?stage.getBoundingClientRect():null;
  const gr=visible.has(gate)?gate.getBoundingClientRect():null;
  const ph=gr?pin.offsetHeight:0;
  if(sr){const p=clamp((innerHeight*.78-sr.top)/(innerHeight*.6));disc.style.transform=`translate3d(${8+p*30}%,0,0) rotate(${15+p*130}deg)`;}
  if(gr){const top=parseFloat(getComputedStyle(pin).top)||0,p=clamp((top-gr.top)/(Math.max(1,gate.offsetHeight-ph)*.82));left.style.transform=`translate3d(${-p*103}%,0,0)`;right.style.transform=`translate3d(${p*103}%,0,0)`;invite.style.opacity=String(1-clamp(p*3));}
 }
 function queue(){if(!frame&&!stopped()&&visible.size)frame=requestAnimationFrame(paint);}
 const observer=new IntersectionObserver(entries=>{entries.forEach(e=>e.isIntersecting?visible.add(e.target):visible.delete(e.target));queue();},{rootMargin:'80px'});
 observer.observe(stage);observer.observe(gate);
 addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue);
 document.addEventListener('visibilitychange',queue);reduce.addEventListener('change',queue);
 document.querySelector('.motion-toggle').addEventListener('click',()=>queueMicrotask(queue));
 new MutationObserver(()=>{disc.querySelector('img').src=document.querySelector('#scene-cover').src;}).observe(document.querySelector('#scene-cover'),{attributes:true,attributeFilter:['src']});
 // Enhance existing archive links; without JS they still open the archive.
 const covers=[...document.querySelectorAll('.cover-wall .cover')];let selected=0,origin=null;
 const dialog=document.createElement('dialog');dialog.className='art-inspector';dialog.setAttribute('aria-labelledby','inspector-title');
 dialog.innerHTML='<div class="inspector-layout"><div class="inspector-toolbar"><h2 id="inspector-title"></h2><button type="button" data-close>Close ×</button></div><img class="inspector-image" alt=""><div class="inspector-footer"><a href="dj-kimchi.html#artwork">Artwork details & credits ↗</a><div><button type="button" data-prev aria-label="Previous artwork">←</button><button type="button" data-next aria-label="Next artwork">→</button></div></div></div>';
 document.body.append(dialog);
 function show(index){selected=(index+covers.length)%covers.length;const cover=covers[selected],img=cover.querySelector('img');dialog.querySelector('h2').textContent=cover.querySelector('span').textContent;const target=dialog.querySelector('img');target.src=img.currentSrc||img.src;target.alt=img.alt;}
 covers.forEach((cover,i)=>cover.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();origin=cover;show(i);dialog.showModal();}));
 dialog.querySelector('[data-close]').onclick=()=>dialog.close();dialog.querySelector('[data-prev]').onclick=()=>show(selected-1);dialog.querySelector('[data-next]').onclick=()=>show(selected+1);
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});dialog.addEventListener('close',()=>origin?.focus({preventScroll:true}));
 dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();show(selected+1);}if(e.key==='ArrowLeft'){e.preventDefault();show(selected-1);}});
})();
