(() => {
  'use strict';
  const root=document.documentElement;
  const stage=document.querySelector('.constellation');
  const cover=document.querySelector('#scene-cover');
  const name=document.querySelector('#scene-name');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const scenes={
    seocheon:{image:'seocheon-cover.webp',left:'seocheon-river-440.webp',right:'seocheon-smoke-440.webp',name:'SEOCHEON · 서천',accent:'#c88647',wash:'#ead5b7'},
    genesis:{image:'genesis-protocol-800.webp',left:'protocol-null-bronze-800.webp',right:'protocol-breathline-800.webp',name:'GENESIS PROTOCOL',accent:'#687b77',wash:'#cbdad2'},
    present:{image:'present-red-cover.jpg',left:'present-sequence-01.jpg',right:'present-sequence-03.jpg',name:'PRESENT · cover study',accent:'#b65140',wash:'#edc7bd'}
  };
  if ('IntersectionObserver' in window) {
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('offscreen',!entry.isIntersecting)));
    document.querySelectorAll('.constellation,.world,.case-visual').forEach(el=>observer.observe(el));
  }
  document.addEventListener('visibilitychange',()=>root.classList.toggle('page-hidden',document.hidden));
  const toggle=document.querySelector('.motion-toggle');
  toggle.addEventListener('click',()=>{
    const paused=root.classList.toggle('effects-paused');
    toggle.setAttribute('aria-pressed',String(paused));
    toggle.textContent=paused?'Resume effects':'Pause effects';
    stage.style.setProperty('--mx','0deg');stage.style.setProperty('--my','0deg');
  });
  document.querySelectorAll('[data-scene-choice]').forEach(button=>{
    button.addEventListener('click',()=>{
      const key=button.dataset.sceneChoice, scene=scenes[key];
      if(!scene)return;
      cover.src='assets/art/'+scene.image;
      stage.querySelector('.echo-left').src='assets/art/'+scene.left;
      stage.querySelector('.echo-right').src='assets/art/'+scene.right;
      cover.alt=scene.name+' artwork, DJ KIMCHI × DJ ORCA';
      name.textContent=scene.name;stage.dataset.scene=key;
      document.body.style.setProperty('--scene-accent',scene.accent);
      document.body.style.setProperty('--scene-wash',scene.wash);
      document.querySelectorAll('[data-scene-choice]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    });
  });
  if(matchMedia('(hover:hover) and (pointer:fine)').matches){
    stage.addEventListener('pointermove',e=>{
      if(reduced.matches||root.classList.contains('effects-paused'))return;
      const r=stage.getBoundingClientRect();
      stage.style.setProperty('--mx',((e.clientX-r.left)/r.width*10-5)+'deg');
      stage.style.setProperty('--my',(-((e.clientY-r.top)/r.height*8-4))+'deg');
    });
    stage.addEventListener('pointerleave',()=>{stage.style.setProperty('--mx','0deg');stage.style.setProperty('--my','0deg');});
  }
})();
