(() => {
'use strict';
const root=document.documentElement, opening=document.querySelector('.motion-opening');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const icons={
record:'<circle cx="32" cy="35" r="21"/><circle cx="32" cy="35" r="13"/><circle cx="32" cy="35" r="4"/><path d="M14 23 9 7 26 15M39 15 55 7 51 25"/>',
quality:'<path d="M32 6 52 14v18c0 12-20 25-20 25S12 44 12 32V14Z"/><path d="m22 31 7 7 15-16"/>',
signal:'<circle cx="32" cy="32" r="24"/><circle cx="32" cy="32" r="13"/><path d="M32 32 50 14M8 32h7m34 0h7M32 8v7m0 34v7"/><circle cx="22" cy="23" r="3"/>',
people:'<circle cx="32" cy="18" r="8"/><path d="M17 53V41a15 15 0 0 1 30 0v12M9 23a6 6 0 1 1 4-11M5 48v-9a10 10 0 0 1 8-10M55 23a6 6 0 1 0-4-11m8 36v-9a10 10 0 0 0-8-10"/>'
};
const badge=(target,key)=>{
  if(!target)return;
  const el=document.createElement('span');
  el.className='kinetic-icon icon-'+key;
  el.setAttribute('aria-hidden','true');
  el.innerHTML='<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+icons[key]+'</svg>';
  target.prepend(el);
};
badge(document.querySelector('.hero-copy'),'record');
badge(document.querySelector('#work'),'quality');
badge(document.querySelector('#listen'),'record');
badge(document.querySelector('#experience'),'people');
badge(document.querySelector('.case:nth-of-type(2) > div'),'signal');

// The original headings remain plain, visible text without JavaScript.
const headings=[...document.querySelectorAll('#work-title,#demo-title,#experience-title')];
const iconNodes=[...document.querySelectorAll('.kinetic-icon')];
const hasObserver='IntersectionObserver' in window;
const onScreen=new WeakSet();
let headingObserver;
if(hasObserver){
  headingObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    entry.target.classList.add('motion-visible');
    headingObserver.unobserve(entry.target);
  }),{threshold:.2});
}
headings.forEach(heading=>{
  const text=heading.textContent.trim();
  heading.setAttribute('aria-label',text);
  heading.textContent='';
  text.split(/\s+/).forEach((word,index)=>{
    const span=document.createElement('span');
    span.textContent=word+' ';
    span.setAttribute('aria-hidden','true');
    span.style.setProperty('--word',index);
    heading.append(span);
  });
  heading.classList.add('motion-heading');
  if(!hasObserver||reduce.matches)heading.classList.add('motion-visible');
  else headingObserver.observe(heading);
});

function updateIconMotion(){
  const stopped=document.hidden||reduce.matches||root.classList.contains('effects-paused');
  iconNodes.forEach(icon=>{
    const svg=icon.querySelector('svg');
    if(svg)svg.style.setProperty('animation-play-state',!stopped&&onScreen.has(icon)?'running':'paused','important');
  });
}
if(hasObserver){
  const iconObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        onScreen.add(entry.target);
        entry.target.classList.add('motion-visible');
      }else onScreen.delete(entry.target);
    });
    updateIconMotion();
  });
  iconNodes.forEach(icon=>iconObserver.observe(icon));
}else iconNodes.forEach(icon=>icon.classList.add('motion-visible'));

let ticking=false,navHeight=0;
const header=document.querySelector('.site-header');
const pin=opening?.querySelector('.opening-pin');
function measureHeader(){
  navHeight=header?header.getBoundingClientRect().height:0;
  root.style.setProperty('--nav-height',navHeight+'px');
  request();
}
if(header&&'ResizeObserver' in window)new ResizeObserver(measureHeader).observe(header);
function paint(){
  ticking=false;
  if(!opening||!pin)return;
  const paused=root.classList.contains('effects-paused');
  opening.classList.toggle('motion-paused',paused);
  opening.classList.toggle('motion-reduced',reduce.matches);
  // Pause freezes the visual timeline without removing page space.
  if(document.hidden||paused||root.classList.contains('mobile-motion'))return;
  const r=opening.getBoundingClientRect();
  const travel=Math.max(1,opening.offsetHeight-pin.offsetHeight);
  const progress=reduce.matches?0:Math.max(0,Math.min(1,(navHeight-r.top)/travel));
  opening.style.setProperty('--intro',progress.toFixed(4));
}
function request(){if(!ticking){ticking=true;requestAnimationFrame(paint);}}
function syncMotion(){
  if(reduce.matches||root.classList.contains('effects-paused')){
    headings.forEach(heading=>{
      heading.classList.add('motion-visible');
      headingObserver?.unobserve(heading);
    });
    iconNodes.forEach(icon=>icon.classList.add('motion-visible'));
  }
  updateIconMotion();
  request();
}
if(!root.classList.contains('mobile-motion'))addEventListener('scroll',request,{passive:true});
addEventListener('resize',measureHeader);
document.addEventListener('visibilitychange',syncMotion);
reduce.addEventListener('change',syncMotion);
document.querySelector('.motion-toggle')?.addEventListener('click',syncMotion);
measureHeader();
syncMotion();
})();
