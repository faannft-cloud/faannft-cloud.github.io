(function(){
  'use strict';
  const buttons=[...document.querySelectorAll('[data-art]')];
  const dialog=document.getElementById('art-dialog');
  let current=0,opener=null;
  function display(i){
    current=(i+buttons.length)%buttons.length;
    const b=buttons[current],img=b.querySelector('img');
    document.getElementById('dialog-image').src=img.getAttribute('src');
    document.getElementById('dialog-image').alt=img.alt;
    document.getElementById('dialog-title').textContent=b.dataset.title;
    document.getElementById('dialog-credit').textContent=b.dataset.credit;
    document.getElementById('dialog-note').textContent=b.dataset.note;
    document.getElementById('dialog-count').textContent=String(current+1).padStart(2,'0')+' / '+buttons.length;
  }
  buttons.forEach((b,i)=>b.addEventListener('click',()=>{opener=b;display(i);dialog.showModal();}));
  document.getElementById('dialog-close').addEventListener('click',()=>dialog.close());
  document.getElementById('dialog-prev').addEventListener('click',()=>display(current-1));
  document.getElementById('dialog-next').addEventListener('click',()=>display(current+1));
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'){e.preventDefault();display(current+1);}if(e.key==='ArrowLeft'){e.preventDefault();display(current-1);}});
  dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
  const progress=document.querySelector('.progress-line');
  function onScroll(){const height=document.documentElement.scrollHeight-innerHeight;progress.style.transform='scaleX('+(height>0?Math.min(1,scrollY/height):0)+')';}
  window.addEventListener('scroll',onScroll,{passive:true});onScroll();
  if('IntersectionObserver' in window){
    const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');reveal.unobserve(e.target);}}),{threshold:.08});
    document.querySelectorAll('.reveal').forEach(el=>reveal.observe(el));
    const navLinks=[...document.querySelectorAll('.artist-menu a[href^="#"]')];
    const sectionObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)navLinks.forEach(a=>a.setAttribute('aria-current',String(a.getAttribute('href')==='#'+(e.target.dataset.nav||e.target.id))));}),{rootMargin:'-20% 0px -60% 0px'});
    document.querySelectorAll('section[data-chapter]').forEach(s=>sectionObserver.observe(s));
  }
})();
