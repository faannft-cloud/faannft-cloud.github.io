/* One continuous cord, revealed by viewport depth rather than page percentage. */
(() => {
'use strict';
if(document.documentElement.classList.contains('mobile-motion'))return;
const main=document.querySelector('main');if(!main)return;
const ns='http://www.w3.org/2000/svg',root=document.documentElement;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const svg=document.createElementNS(ns,'svg');
svg.classList.add('red-thread');svg.setAttribute('aria-hidden','true');svg.setAttribute('focusable','false');
svg.innerHTML=`<defs>
 <linearGradient id="cord-color" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#6f1729"/><stop offset=".45" stop-color="#d95359"/><stop offset=".72" stop-color="#a92e42"/><stop offset="1" stop-color="#601728"/></linearGradient>
 <filter id="cord-glow" x="-1.2%" y="-.3%" width="102.4%" height="100.6%"><feGaussianBlur stdDeviation="3.2"/></filter><filter id="tip-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4"/></filter>
 <filter id="thread-smoke" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".012 .021" numOctaves="3" seed="17" result="cloud"/><feColorMatrix in="cloud" type="matrix" values="0 0 0 0 .055 0 0 0 0 .085 0 0 0 0 .075 .5 .5 .5 0 -.4"/><feGaussianBlur stdDeviation="5"/></filter>
 <radialGradient id="mist-fade"><stop offset="0" stop-color="white" stop-opacity=".75"/><stop offset=".45" stop-color="white" stop-opacity=".38"/><stop offset="1" stop-color="white" stop-opacity="0"/></radialGradient>
 <mask id="mist-mask" maskContentUnits="objectBoundingBox"><rect width="1" height="1" fill="url(#mist-fade)"/></mask>
 <mask id="cord-reveal" maskUnits="userSpaceOnUse"><path class="thread-reveal" fill="none" stroke="white" stroke-width="32" stroke-linecap="round"/></mask>
 </defs>
 <g class="thread-mist" mask="url(#mist-mask)"><rect width="360" height="420" fill="#162621" filter="url(#thread-smoke)"/></g>
 <g mask="url(#cord-reveal)" class="thread-ink">
 <path class="cord-glow"/><path class="cord-shadow"/><path class="cord-body"/><path class="cord-fiber fiber-a"/><path class="cord-fiber fiber-b"/><path class="cord-edge"/>
 </g>
 <g class="thread-head"><path class="loose-glow" d="M0 0 C12 -4 22 -20 35 -15 S55 7 63 -4"/><path class="loose-end" d="M0 0 C12 -4 22 -20 35 -15 S55 7 63 -4"/><path class="loose-fiber" d="M0 0 C12 -4 22 -20 35 -15 S55 7 63 -4"/></g>`;
const safe=document.createElementNS(ns,'mask');safe.id='thread-readable';safe.setAttribute('maskUnits','userSpaceOnUse');svg.querySelector('defs').append(safe);
const safeGroup=document.createElementNS(ns,'g');safeGroup.setAttribute('mask','url(#thread-readable)');
[...svg.children].filter(el=>el.tagName.toLowerCase()!=='defs').forEach(el=>safeGroup.append(el));svg.append(safeGroup);
main.prepend(svg);
const paths=[...svg.querySelectorAll('.thread-ink path')],reveal=svg.querySelector('.thread-reveal');
const body=svg.querySelector('.cord-body'),head=svg.querySelector('.thread-head'),mist=svg.querySelector('.thread-mist');
let samples=[],length=0,mainTop=0,startY=0,drawn=0,frame=0,layoutFrame=0,lastWidth=0,previousX=0,previousY=0,lastTime=0;
function point(el){return el.getBoundingClientRect().top+scrollY-mainTop;}
function measure(){
 layoutFrame=0;
 const w=main.clientWidth,h=main.offsetHeight,mobile=w<=760;lastWidth=w;
 mainTop=main.getBoundingClientRect().top+scrollY;
 safe.setAttribute('x','0');safe.setAttribute('y','0');safe.setAttribute('width',w);safe.setAttribute('height',h);
 safe.innerHTML=`<rect width="${w}" height="${h}" fill="white"/>`;
 main.querySelectorAll('p:not(.opening-statement),button,a.button,.career-route a,dl,table,select,audio,.track-list').forEach(el=>{
  if(el.closest('.red-thread')||!el.getClientRects().length)return;
  const r=el.getBoundingClientRect();if(!r.width||!r.height)return;
  const rect=document.createElementNS(ns,'rect');
  rect.setAttribute('x',Math.max(0,r.left-5));rect.setAttribute('y',r.top+scrollY-mainTop-3);
  rect.setAttribute('width',r.width+10);rect.setAttribute('height',r.height+6);rect.setAttribute('rx','6');rect.setAttribute('fill','black');safe.append(rect);
 });
 svg.setAttribute('viewBox',`0 0 ${w} ${h}`);svg.setAttribute('width',w);svg.setAttribute('height',h);
 const art=document.querySelector('.opening-art');
 const sx=mobile?w*.50:w*.52;
 startY=mobile?point(art)+28:Math.max(100,innerHeight*.37);
 let x=sx,y=startY;
 let d=`M ${x} ${y} C ${x-20} ${y+12} ${x+25} ${y+24} ${x+20} ${y+8} C ${x+14} ${y-8} ${x-9} ${y} ${x} ${y+30}`;
 y+=30;
 // A narrow, mostly vertical meander. Headings guide the route, never the viewport edges.
 const selectors=['#work-title','#case1-title','#case2-title','#demo-title','#experience-title','#habit-title','#listen-title','.world-sub','#about-title','#contact-title'];
 const anchors=selectors.map(sel=>document.querySelector(sel)).filter(Boolean).map(el=>{
   const r=el.getBoundingClientRect();
   const right=r.right+14,left=r.left-14;
   const nearest=Math.abs(right-w*.5)<Math.abs(left-w*.5)?right:left;
   return {x:mobile?w*.5:Math.max(w*.36,Math.min(w*.60,nearest)),y:point(el)+el.offsetHeight+12};
 }).filter(a=>a.y>y+90).sort((a,b)=>a.y-b.y);
 anchors.push({x:w*.51,y:h-45});
 anchors.forEach((a,i)=>{
   const dy=a.y-y,steps=Math.max(1,Math.ceil(dy/340));
   for(let k=1;k<=steps;k++){
     const t=k/steps,yy=y+dy*t;
     const xx=x+(a.x-x)*t+(k<steps?Math.sin(k*1.7+i)* (mobile?18:38):0);
     const px=k===1?x:previousX,py=k===1?y:previousY;
     const sway=(i+k)%2?1:-1;
     d+=` C ${px+sway*(mobile?20:34)} ${py+(yy-py)*.38} ${xx-sway*(mobile?16:28)} ${yy-(yy-py)*.32} ${xx} ${yy}`;
     previousX=xx;previousY=yy;
   }
   x=a.x;y=a.y;
   if(i<anchors.length-1){
     const loop=mobile?14:22;
     d+=` C ${x+loop} ${y+4} ${x+loop} ${y+22} ${x} ${y+22} C ${x-loop} ${y+22} ${x-loop} ${y+10} ${x-3} ${y+12} C ${x+8} ${y+15} ${x+8} ${y+31} ${x} ${y+40}`;
     y+=40;
   }
 });
 paths.forEach(p=>p.setAttribute('d',d));reveal.setAttribute('d',d);
 length=body.getTotalLength();reveal.style.strokeDasharray=`${length} ${length}`;
 samples=[];let maxY=-Infinity;const count=Math.min(1600,Math.max(300,Math.ceil(length/14)));
 for(let i=0;i<=count;i++){const l=length*i/count,p=body.getPointAtLength(l);maxY=Math.max(maxY,p.y);samples.push({l,y:maxY});}
 if(reduced.matches){drawn=length;render();}else update();
}
function render(){
 reveal.style.strokeDashoffset=String(length-drawn);
 const p=body.getPointAtLength(Math.max(0,drawn)),q=body.getPointAtLength(Math.max(0,drawn-5));
 const angle=Math.atan2(p.y-q.y,p.x-q.x)*180/Math.PI;
 head.setAttribute('transform',`translate(${p.x} ${p.y}) rotate(${angle-35})`);
 mist.setAttribute('transform',`translate(${p.x-180} ${p.y-210})`);
 svg.classList.toggle('thread-still',reduced.matches);svg.dataset.drawn=Math.round(drawn);
}
function update(timestamp=performance.now()){
 frame=0;if(!length||document.hidden)return;
 if(root.classList.contains('effects-paused'))return;
 if(reduced.matches){drawn=length;render();return;}
 const cutoff=Math.max(startY+35,scrollY-mainTop+innerHeight*.7);
 let lo=0,hi=samples.length-1;
 while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(samples[mid].y<=cutoff)lo=mid;else hi=mid-1;}
 const next=samples[lo+1]||samples[lo],current=samples[lo];
 const part=Math.max(0,Math.min(1,(cutoff-current.y)/Math.max(1,next.y-current.y)));
 const target=current.l+(next.l-current.l)*part;
 const dt=lastTime?Math.min(50,timestamp-lastTime):16;lastTime=timestamp;
 drawn+= (target-drawn)*(1-Math.exp(-dt/95));
 if(Math.abs(target-drawn)<.5)drawn=target;
 render();if(Math.abs(target-drawn)>.5)frame=requestAnimationFrame(update);
}
function schedule(){if(!frame&&!document.hidden)frame=requestAnimationFrame(update);}
function resize(){if(!layoutFrame)layoutFrame=requestAnimationFrame(measure);}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',resize);
addEventListener('load',resize);document.fonts?.ready.then(resize);
if('ResizeObserver'in window)new ResizeObserver(resize).observe(main);
reduced.addEventListener('change',resize);
document.addEventListener('visibilitychange',schedule);
document.querySelector('.motion-toggle')?.addEventListener('click',schedule);
measure();
})();
