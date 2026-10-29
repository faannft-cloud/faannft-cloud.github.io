(() => {
  'use strict';
  const root=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=()=>root.classList.contains('mobile-motion');
  const stopped=()=>document.hidden||reduce.matches||root.classList.contains('effects-paused');
  const running=new Set();
  function motion(el,frames,duration=600,delay=0){
    if(stopped()||!el?.animate)return;
    // Repeated interactions replace an element's accent instead of stacking it.
    for(const a of running)if(a.effect?.target===el){a.cancel();running.delete(a);}
    const a=el.animate(frames,{duration,delay,easing:'cubic-bezier(.16,1,.3,1)',fill:'none'});
    running.add(a);a.finished.then(()=>running.delete(a)).catch(()=>running.delete(a));
  }
  const headings=[...document.querySelectorAll('.case-copy h3')];
  headings.forEach(h=>{
    const text=h.textContent.trim();h.setAttribute('aria-label',text);h.replaceChildren();
    text.split(/\s+/).forEach((word,i)=>{
      if(i)h.append(' ');
      const mask=document.createElement('span'),inner=document.createElement('span');
      mask.className='folio-word-window';mask.setAttribute('aria-hidden','true');
      inner.className='folio-word';inner.textContent=word;mask.append(inner);h.append(mask);
    });
  });
  function unfold(h){h.querySelectorAll('.folio-word').forEach((word,i)=>motion(word,[
    {transform:mobile()?'translateY(35%)':'translateY(90%) rotate(7deg)',opacity:.3},
    {transform:'translateY(0) rotate(0)',opacity:1}
  ],mobile()?470:720,Math.min(i*35,230)));}
  const routes=[...document.querySelectorAll('.career-route a')];
  function ink(link){link.querySelectorAll('svg path,svg circle,svg rect').forEach((line,i)=>{
    const length=line.getTotalLength();motion(line,[{strokeDasharray:String(length),strokeDashoffset:String(length),opacity:.3},{strokeDasharray:String(length),strokeDashoffset:'0',opacity:1}],600,i*35);
  });}
  routes.forEach(link=>{link.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')ink(link);});link.addEventListener('focus',()=>ink(link));});
  const flow=document.querySelector('.career-flow'),svg=flow?.querySelector('svg');
  const packets=[];
  if(svg){
    // Sample the existing diagram paths once; animate a few transforms, no frame loop.
    const paths=['M118 44C160 44 160 124 196 124','M118 124H196','M118 204C160 204 160 124 196 124','M280 124H312'];
    paths.forEach(d=>{
      const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);
      const length=path.getTotalLength(),frames=[];
      for(let i=0;i<=20;i++){const p=path.getPointAtLength(length*i/20);frames.push({transform:`translate(${p.x}px,${p.y}px)`,opacity:i===0||i===20?0:1,offset:i/20});}
      const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('r','4');dot.setAttribute('class','signal-packet');dot.setAttribute('aria-hidden','true');svg.append(dot);packets.push({dot,frames});
    });
    const transmit=()=>packets.forEach(({dot,frames},i)=>motion(dot,frames,mobile()?600:850,i===3?500:i*65));
    flow.querySelectorAll('button').forEach(b=>b.addEventListener('click',transmit));
    flow.addEventListener('folio-enter',transmit);
  }
  if('IntersectionObserver'in window){
    const once=new IntersectionObserver(entries=>entries.forEach(e=>{
      if(!e.isIntersecting)return;once.unobserve(e.target);
      if(headings.includes(e.target))unfold(e.target);
      else if(routes.includes(e.target))ink(e.target);
      else e.target.dispatchEvent(new Event('folio-enter'));
    }),{threshold:.3});[...headings,...routes,flow].filter(Boolean).forEach(el=>once.observe(el));
  }
  document.querySelectorAll('[data-music-player]').forEach(player=>{
    const cover=player.querySelector('[data-now-cover]');let previous=cover.getAttribute('src');
    new MutationObserver(()=>{
      const src=cover.getAttribute('src');if(src===previous)return;previous=src;
      motion(cover,[{transform:mobile()?'translateX(10px)':'rotateY(-16deg) translateX(14px)',opacity:.45},{transform:'rotateY(0) translateX(0)',opacity:1}],mobile()?320:500);
    }).observe(cover,{attributes:true,attributeFilter:['src']});
  });
  function settle(){if(stopped()){running.forEach(a=>a.cancel());running.clear();}}
  document.querySelector('.motion-toggle')?.addEventListener('click',()=>queueMicrotask(settle));
  document.addEventListener('visibilitychange',settle);reduce.addEventListener('change',settle);
})();
