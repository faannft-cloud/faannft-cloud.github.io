/* Progressive enhancement only: no hidden waiting state and no scroll remapping. */
(() => {
  'use strict';
if(document.documentElement.classList.contains('mobile-motion'))return;
  const root=document.documentElement, body=document.body;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const running=new Set(),revealed=new WeakSet(),visible=new Set();
  let frame=0;
  const paused=()=>document.hidden||reduced.matches||root.classList.contains('effects-paused');
  body.classList.add('rich-ready');
  const animate=(el,keyframes,options={})=>{
    if(!el||typeof el.animate!=='function'||paused())return;
    const animation=el.animate(keyframes,{duration:800,easing:'cubic-bezier(.16,1,.3,1)',fill:'none',...options});
    running.add(animation);
    animation.finished.then(()=>running.delete(animation)).catch(()=>running.delete(animation));
  };
  // Existing text and ARIA labels are retained. Inner wrappers avoid competing
  // with earlier CSS transforms on the outer title letters.
  document.querySelectorAll('.world-title .ch').forEach(el=>{
    if(el.querySelector('.rich-letter'))return;
    const span=document.createElement('span');span.className='rich-letter';
    span.textContent=el.textContent;el.replaceChildren(span);
  });
  const reveals=[...document.querySelectorAll('.motion-heading,#habit-title,#about-title,#contact-title,.world-title,.case-visual:not(.career-console):not(.career-flow),.opening-copy h1,.opening-statement')];
  function reveal(el){
    if(revealed.has(el))return;
    revealed.add(el);
    if(paused())return;
    if(el.matches('.world-title')){
      el.querySelectorAll('.rich-letter').forEach((letter,i)=>animate(letter,[
        {opacity:.65,translate:'0 32px',rotate:'7deg',clipPath:'inset(0 0 18% 0)'},
        {opacity:1,translate:'0 0',rotate:'0deg',clipPath:'inset(0 0 0 0)'}
      ],{duration:1050,delay:i*42}));
    }else if(el.matches('.motion-heading')){
      [...el.children].forEach((word,i)=>animate(word,[
        {opacity:.72,translate:'0 19px',rotate:'1.8deg',clipPath:'inset(0 0 12% 0)'},
        {opacity:1,translate:'0 0',rotate:'0deg',clipPath:'inset(0 0 0 0)'}
      ],{duration:780,delay:Math.min(i*65,260)}));
    }else if(el.matches('.case-visual')){
      animate(el,[{opacity:.78,translate:'0 25px',clipPath:'inset(0 0 8% 0 round 8px)'},{opacity:1,translate:'0 0',clipPath:'inset(0 0 0 0 round 8px)'}],{duration:950});
    }else{
      animate(el,[{opacity:.75,translate:'0 20px',clipPath:'inset(0 0 15% 0)'},{opacity:1,translate:'0 0',clipPath:'inset(0 0 0 0)'}]);
    }
  }
  const covers=[...document.querySelectorAll('.cover-wall .cover')];
  covers.forEach((el,i)=>{el.classList.add('rich-cover');el.dataset.richDirection=i%2?'1':'-1';});
  const opening=document.querySelector('.opening-art');
  const world=document.querySelector('.world');
  const loop=document.querySelector('.habit-loop');
  const tracks=[...covers,opening,world,loop].filter(Boolean);
  function paint(){
    frame=0;if(paused())return;
    const vh=innerHeight,mobile=innerWidth<=760;
    visible.forEach(el=>{
      const r=el.getBoundingClientRect();
      const p=Math.max(-1,Math.min(1,(vh*.5-(r.top+r.height*.5))/(vh*.7+r.height*.5)));
      if(el.classList.contains('rich-cover')){
        const direction=Number(el.dataset.richDirection);
        el.style.setProperty('--rich-drift',`${p*(mobile?5:13)*direction}px`);
        el.style.setProperty('--rich-card-drift',`${p*(mobile?2:6)*direction}px`);
      }else if(el===opening){
        el.querySelector('.echo-left')?.style.setProperty('--rich-float',`${p*9-3}px`);
        el.querySelector('.echo-right')?.style.setProperty('--rich-float',`${-p*10+3}px`);
      }else if(el===world){
        el.style.setProperty('--rich-haze',`${p*16}px`);
      }else if(el===loop){
        el.style.setProperty('--rich-loop',`${p*11}deg`);
      }
    });
  }
  function request(){if(!frame&&!paused())frame=requestAnimationFrame(paint);}
  if('IntersectionObserver'in window){
    const entrance=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){reveal(entry.target);entrance.unobserve(entry.target);}
    }),{threshold:.12});
    reveals.forEach(el=>entrance.observe(el));
    const active=new IntersectionObserver(entries=>{
      entries.forEach(entry=>entry.isIntersecting?visible.add(entry.target):visible.delete(entry.target));request();
    },{rootMargin:'60px'});
    tracks.forEach(el=>active.observe(el));
  }else reveals.forEach(el=>revealed.add(el));
  function sync(){
    if(paused()){
      running.forEach(animation=>{try{animation.finish();}catch{animation.cancel();}});
      running.clear();
      if(frame){cancelAnimationFrame(frame);frame=0;}
      if(reduced.matches){
        covers.forEach(el=>{el.style.removeProperty('--rich-drift');el.style.removeProperty('--rich-card-drift');});
        world?.style.removeProperty('--rich-haze');loop?.style.removeProperty('--rich-loop');
      }
    }else request();
  }
  addEventListener('scroll',request,{passive:true});addEventListener('resize',request);
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
  document.querySelector('.motion-toggle')?.addEventListener('click',sync);
  // Atmosphere selection gets a brief image-only light/dissolve accent. Career
  // copy and buttons are never hidden or delayed by this interaction.
  document.querySelectorAll('[data-scene-choice]').forEach(button=>button.addEventListener('click',()=>{
    if(paused())return;
    const art=document.querySelector('.portal-cover img');
    animate(art,[{opacity:.65,filter:'saturate(.65)'},{opacity:1,filter:'saturate(1)'}],{duration:550});
  }));
  sync();
})();
