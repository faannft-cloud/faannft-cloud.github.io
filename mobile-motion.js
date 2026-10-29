/* Touch edition: bounded accents and compositor entrances, no scroll paint loop. */
(() => {
  const root=document.documentElement;
  if(!matchMedia('(max-width:760px), (hover:none) and (pointer:coarse)').matches)return;
  root.classList.add('mobile-motion');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)'),active=new Set();
  const stopped=()=>document.hidden||reduce.matches||root.classList.contains('effects-paused');
  const targets=[...document.querySelectorAll('.opening-copy h1,.opening-art,.section-head h2,#experience-title,#habit-title,#listen-title,#about-title,#contact-title,.case-visual:not(.career-console):not(.career-flow),.cover-wall .cover')];
  function play(el){
    if(stopped()||!el.animate)return;
    const cord=el.classList.contains('mobile-cord');
    const frames=cord?[{opacity:.35,transform:'translateX(-20px)'},{opacity:1,transform:'translateX(0)'}]:[{opacity:.35,translate:'0 32px',scale:'.96'},{opacity:1,translate:'0 0',scale:'1'}];
    const a=el.animate(frames,{duration:cord?850:700,easing:'cubic-bezier(.2,.7,.2,1)',fill:'none'});
    active.add(a);a.finished.then(()=>active.delete(a)).catch(()=>active.delete(a));
  }
  if('IntersectionObserver'in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(e=>{
      if(e.isIntersecting){play(e.target);observer.unobserve(e.target);}
    }),{threshold:.15});targets.forEach(el=>observer.observe(el));
  }
  function stop(){if(stopped()){active.forEach(a=>a.finish());active.clear();}}
  document.querySelector('.motion-toggle')?.addEventListener('click',()=>queueMicrotask(stop));
  document.addEventListener('visibilitychange',stop);reduce.addEventListener('change',stop);
})();
