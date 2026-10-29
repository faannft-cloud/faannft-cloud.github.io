(() => {
 'use strict';
 const root=document.documentElement,reduce=matchMedia('(prefers-reduced-motion: reduce)'),animations=new Set();
 const stopped=()=>document.hidden||reduce.matches||root.classList.contains('effects-paused');
 function animate(el,frames,duration=650,delay=0){if(!el||stopped()||!el.animate)return;const a=el.animate(frames,{duration,delay,easing:'cubic-bezier(.16,1,.3,1)'});animations.add(a);a.finished.then(()=>animations.delete(a)).catch(()=>animations.delete(a));}
 const A=window.PortfolioAnalytics,records=window.PORTFOLIO_DATA.records,consoleEl=document.querySelector('.career-console'),chart=document.querySelector('#preview-chart');
 let agent='all';
 function draw(){
  const chosen=A.select(records,agent),summary=A.aggregate(chosen),weeks=A.weekly(chosen),width=500;
  ['csat','aht','sla'].forEach(k=>document.querySelector('#preview-'+k).textContent=A.format(summary.values[k],k));
  chart.setAttribute('viewBox','0 0 500 150');
  let svg='<line x1="32" y1="118" x2="485" y2="118" stroke="#617c68"/><line x1="32" y1="14" x2="485" y2="14" stroke="#617c68"/><text x="0" y="19" fill="#d0ddc8" font-size="11">100</text><text x="14" y="122" fill="#d0ddc8" font-size="11">0</text>',pts=[];
  weeks.forEach((w,i)=>{const x=38+i*63,value=w.values.csat,y=118-value*1.04;pts.push(x+','+y);svg+=`<text x="${x}" y="143" text-anchor="middle" fill="#d0ddc8" font-size="11">W${w.week}</text><circle cx="${x}" cy="${y}" r="4" fill="#e8c48d"/>`;});
  chart.innerHTML=`<polyline points="${pts.join(' ')}" fill="none" stroke="#e8c48d" stroke-width="2.5"/>`+svg;
  chart.setAttribute('aria-label',(agent==='all'?'All 14 fictional agents':'Fictional agent A07')+' weekly CSAT. '+weeks.map(w=>'Week '+w.week+': '+A.format(w.values.csat,'csat')).join('; '));
  consoleEl.querySelector('.console-context').textContent=agent==='all'?'Team view · 8 weeks. Select A07 to see how an individual pattern differs.':'A07 · CSAT falls in week 4. The pattern prompts a case review; it does not establish a cause.';
  consoleEl.querySelectorAll('[data-preview-agent]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.previewAgent===agent)));
  const line=chart.querySelector('polyline'),length=line.getTotalLength();animate(line,[{strokeDasharray:String(length),strokeDashoffset:String(length)},{strokeDasharray:String(length),strokeDashoffset:'0'}],700);
  animate(chart,[{opacity:.35,translate:'0 10px'},{opacity:1,translate:'0 0'}],450);
 }
 consoleEl.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{agent=b.dataset.previewAgent;draw();}));draw();
 // home.js also owns a legacy responsive chart; restore this fixed viewBox only on width changes.
 let lastWidth=innerWidth;addEventListener('resize',()=>{if(innerWidth!==lastWidth){lastWidth=innerWidth;draw();}});
 const flow=document.querySelector('.career-flow');
 const explanations={sources:'Read 40 public Korean crypto and US-stock Telegram channels.',themes:'Find tickers and themes shared across channels, and mark paid posts. Posts are treated as data only.',note:'At 8 a.m., produce a study note explaining terms and story background. First scheduled run: 28 Oct 2026; no impact claimed yet.'};
 flow.querySelectorAll('[data-flow-step]').forEach(b=>b.addEventListener('click',()=>{flow.dataset.flow=b.dataset.flowStep;flow.querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));const caption=flow.querySelector('figcaption');caption.textContent=explanations[b.dataset.flowStep];animate(caption,[{opacity:.4,translate:'0 8px'},{opacity:1,translate:'0 0'}],400);}));
 const exp=document.querySelector('.experience'),rows=[...exp.querySelectorAll('.experience-row')];
 const layout=document.createElement('div');layout.className='experience-layout';exp.before(layout);layout.append(exp);
 const nav=document.createElement('nav');nav.className='career-chapters';nav.setAttribute('aria-label','Career chapters');
 nav.innerHTML='<div aria-hidden="true"><p class="career-year"></p><p class="career-company"></p><p class="career-role"></p></div><div class="career-chapter-links"></div>';layout.prepend(nav);
 const chapters=rows.map((row,i)=>{row.id='career-chapter-'+i;const org=row.querySelector('.experience-org'),date=org.querySelector('small').textContent,years=date.match(/\d{4}/g);return {row,company:org.childNodes[0].textContent.trim(),role:row.querySelector('h3').textContent,year:years[0],range:years[0]===years[1]?years[0]:years[0]+'—'+years[1].slice(2)};});
 chapters.forEach((c,i)=>{const a=document.createElement('a');a.href='#'+c.row.id;a.innerHTML=c.year+'<span>'+c.company+'</span>';a.setAttribute('aria-label',c.year+' '+c.company);nav.querySelector('.career-chapter-links').append(a);});
 let selected=-1;
 function select(i){if(i===selected)return;selected=i;rows.forEach((r,j)=>r.classList.toggle('is-current',j===i));nav.querySelectorAll('a').forEach((a,j)=>a.setAttribute('aria-current',String(j===i)));const c=chapters[i];nav.querySelector('.career-year').textContent=c.range;nav.querySelector('.career-company').textContent=c.company;nav.querySelector('.career-role').textContent=c.role;if(innerWidth>760)animate(nav.firstElementChild,[{opacity:.4,translate:'0 18px'},{opacity:1,translate:'0 0'}]);}
 select(0);
 const chapterObserver=new IntersectionObserver(entries=>{const entering=entries.filter(e=>e.isIntersecting);if(entering.length)select(rows.indexOf(entering[entering.length-1].target));},{rootMargin:'-25% 0px -45% 0px',threshold:0});rows.forEach(r=>chapterObserver.observe(r));
 const entrance=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;entrance.unobserve(e.target);if(e.target===consoleEl)draw();if(e.target===flow){['.sig-channels','.sig-flow','.sig-note','.sig-lines'].forEach((s,i)=>flow.querySelectorAll(s).forEach(el=>animate(el,[{opacity:.15,translate:'-12px 0'},{opacity:1,translate:'0 0'}],600,i*140)));}animate(e.target,[{opacity:.5,translate:'0 34px',scale:'.97'},{opacity:1,translate:'0 0',scale:'1'}],800);}),{threshold:.2});entrance.observe(consoleEl);entrance.observe(flow);
 function stop(){if(stopped()){animations.forEach(a=>a.finish());animations.clear();}}
 document.querySelector('.motion-toggle').addEventListener('click',()=>queueMicrotask(stop));document.addEventListener('visibilitychange',stop);reduce.addEventListener('change',stop);
})();
