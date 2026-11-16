(()=>{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE=matchMedia('(pointer:fine)').matches&&innerWidth>960;
const MOB=()=>innerWidth<=960;
const G=window.gsap,ST=window.ScrollTrigger;
if(G&&ST)G.registerPlugin(ST);
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));

/* ---------- smooth scroll ---------- */
let lenis=null;
if(!RM&&window.Lenis){lenis=new Lenis({duration:1.15,smoothWheel:true});
 if(G&&ST){lenis.on('scroll',ST.update);G.ticker.add(t=>lenis.raf(t*1000));G.ticker.lagSmoothing(0)}
 else{const raf=t=>{lenis.raf(t);requestAnimationFrame(raf)};requestAnimationFrame(raf)}}
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href');const t=id==='#top'?0:$(id);if(t===null)return;e.preventDefault();lenis?lenis.scrollTo(t,{offset:id==='#top'?0:-10}):(t===0?scrollTo({top:0}):t.scrollIntoView())}));

/* ---------- header + progress ---------- */
const hd=$('#hd'),prog=$('#prog');
const onScroll=()=>{const y=scrollY,h=document.documentElement.scrollHeight-innerHeight;hd.classList.toggle('s',y>40);prog.style.transform='scaleX('+(h>0?y/h:0)+')'};
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* ---------- cursor glow + magnetic ---------- */
if(FINE&&!RM&&G){const cg=$('#cglow'),cd=$('#cdot');
 const gx=G.quickTo(cg,'x',{duration:.9,ease:'power3'}),gy=G.quickTo(cg,'y',{duration:.9,ease:'power3'});
 const dx=G.quickTo(cd,'x',{duration:.15}),dy=G.quickTo(cd,'y',{duration:.15});
 addEventListener('pointermove',e=>{cg.style.opacity=1;cd.style.opacity=1;gx(e.clientX);gy(e.clientY);dx(e.clientX);dy(e.clientY)});
 document.addEventListener('pointerleave',()=>{cg.style.opacity=0;cd.style.opacity=0});
 $$('a,button').forEach(el=>{el.addEventListener('pointerenter',()=>cd.classList.add('big'));el.addEventListener('pointerleave',()=>cd.classList.remove('big'))});
 $$('.mag').forEach(el=>{const mx=G.quickTo(el,'x',{duration:.5,ease:'power3'}),my=G.quickTo(el,'y',{duration:.5,ease:'power3'});
  el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();mx((e.clientX-r.left-r.width/2)*.32);my((e.clientY-r.top-r.height/2)*.4)});
  el.addEventListener('pointerleave',()=>{mx(0);my(0)})});
}

/* ---------- split words ---------- */
function split(el){const out=[];const walk=n=>{[...n.childNodes].forEach(c=>{if(c.nodeType===3){const parts=c.textContent.split(/(\s+)/);const frag=document.createDocumentFragment();parts.forEach(p=>{if(!p)return;if(/^\s+$/.test(p)){frag.appendChild(document.createTextNode(p));return}const w=document.createElement('span');w.className='w';const i=document.createElement('span');i.textContent=p;w.appendChild(i);frag.appendChild(w);out.push(i)});c.replaceWith(frag)}else if(c.nodeType===1)walk(c)})};walk(el);return out}

if($('#net')){
/* ---------- hero canvas: data lines into the node ---------- */
const cv=$('#net'),ctx=cv.getContext('2d');
let W=0,H=0,DPR=1,lines=[],N={x:0,y:0},heroVis=true,heroP=0,t0=performance.now();
function rnd(s){return()=>{s=(s*16807)%2147483647;return s/2147483647}}
function layout(){const r=cv.getBoundingClientRect();W=r.width;H=r.height;DPR=Math.min(devicePixelRatio||1,MOB()?1.5:1.75);cv.width=W*DPR;cv.height=H*DPR;
 const s=Math.max(W/1280,H/720),iw=1280*s,ih=720*s,px=innerWidth<=620?.64:.5,ox=(W-iw)*px,oy=(H-ih)*.6;const m=(x,y)=>({x:ox+x*s,y:oy+y*s});
 N=m(804,327);const R=rnd(7);const n=innerWidth<=620?14:24;lines=[];
 for(let i=0;i<n;i++){const ix=60+R()*1160,iy=468+R()*140;const P=m(ix,iy);const span=Math.abs(P.x-N.x);
  const C={x:P.x*.55+N.x*.45,y:Math.min(P.y,N.y)-(.12+R()*.22)*span-20*s};
  const pts=[];for(let k=0;k<=48;k++){const t=k/48,a=(1-t)*(1-t),b=2*(1-t)*t,c=t*t;pts.push({x:a*P.x+b*C.x+c*N.x,y:a*P.y+b*C.y+c*N.y})}
  lines.push({pts,P,d:.25+i*.07+R()*.3,parts:[R(),R()+.5].map(v=>v%1),sp:.12+R()*.16,tw:R()*6.28})}
}
let pulse=0;
function draw(now){const T=(now-t0)/1000;ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H);ctx.globalCompositeOperation='lighter';
 const boost=1+heroP*1.4;
 for(const L of lines){const pr=RM?1:clamp((T-L.d)/1.5);if(pr<=0)continue;const e=1-Math.pow(1-pr,3);const k=Math.max(1,Math.floor(e*48));
  // origin light
  const tw=.55+.45*Math.sin(T*2+L.tw);ctx.fillStyle='rgba(255,230,163,'+(.5*tw)+')';ctx.beginPath();ctx.arc(L.P.x,L.P.y,2.2,0,6.283);ctx.fill();
  ctx.fillStyle='rgba(232,198,106,'+(.12*tw)+')';ctx.beginPath();ctx.arc(L.P.x,L.P.y,7,0,6.283);ctx.fill();
  ctx.beginPath();ctx.moveTo(L.pts[0].x,L.pts[0].y);for(let j=1;j<=k;j++)ctx.lineTo(L.pts[j].x,L.pts[j].y);
  ctx.strokeStyle='rgba(232,198,106,'+(.07*boost)+')';ctx.lineWidth=5;ctx.stroke();
  ctx.strokeStyle='rgba(255,226,150,'+(.34*boost)+')';ctx.lineWidth=1.1;ctx.stroke();
  if(pr>=1&&!RM){for(let q=0;q<L.parts.length;q++){L.parts[q]+=L.sp/60*(1+heroP);if(L.parts[q]>=1){L.parts[q]-=1;pulse=Math.min(1.6,pulse+.12)}
    const f=L.parts[q]*48,j=Math.floor(f),u=f-j,a=L.pts[j],b=L.pts[Math.min(48,j+1)],x=a.x+(b.x-a.x)*u,y=a.y+(b.y-a.y)*u;
    ctx.fillStyle='rgba(255,240,200,.95)';ctx.beginPath();ctx.arc(x,y,1.6,0,6.283);ctx.fill();
    ctx.fillStyle='rgba(232,198,106,.25)';ctx.beginPath();ctx.arc(x,y,5,0,6.283);ctx.fill();}}
 }
 // node glow + rings
 pulse*=.96;const g=.35+pulse*.4+heroP*.5;const rg=ctx.createRadialGradient(N.x,N.y,0,N.x,N.y,90);rg.addColorStop(0,'rgba(255,236,180,'+(.55*g)+')');rg.addColorStop(.3,'rgba(232,198,106,'+(.18*g)+')');rg.addColorStop(1,'rgba(232,198,106,0)');ctx.fillStyle=rg;ctx.beginPath();ctx.arc(N.x,N.y,90,0,6.283);ctx.fill();
 if(!RM)for(let r=0;r<3;r++){const ph=((T*.45+r/3)%1);ctx.strokeStyle='rgba(255,226,150,'+(.5*(1-ph))+')';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(N.x,N.y,8+ph*70,(8+ph*70)*.55,0,0,6.283);ctx.stroke()}
 ctx.globalCompositeOperation='source-over';
 // diamond node
 const sz=10+pulse*2;ctx.save();ctx.translate(N.x,N.y);ctx.fillStyle='rgba(255,236,180,.95)';ctx.beginPath();ctx.moveTo(0,-sz);ctx.lineTo(sz,0);ctx.lineTo(0,sz);ctx.lineTo(-sz,0);ctx.closePath();ctx.fill();ctx.restore();
}
function loop(now){if(heroVis)draw(now);if(!RM)requestAnimationFrame(loop)}
layout();if(RM){setTimeout(()=>draw(performance.now()+9e4),50)}else requestAnimationFrame(loop);
let rz;addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{layout();if(RM)draw(performance.now()+9e4)},150)});
new IntersectionObserver(es=>{heroVis=es[0].isIntersecting},{threshold:0}).observe($('.hero'));

/* hero loop video (desktop only) */
const hl=$('#heroLoop');
if(RM||innerWidth<=620){hl.remove();}
else{
  const play=()=>hl.play().catch(()=>{});
  if(hl.readyState>=2) play();
  else hl.addEventListener('canplay',play,{once:true});
}


/* ---------- hero intro + scroll + tilt ---------- */
const hw=split($('#h1'));
if(G&&!RM){
 G.from(hw,{yPercent:115,rotate:4,duration:1.15,ease:'expo.out',stagger:.07,delay:.25});
 G.from('.hero [data-in]',{y:26,opacity:0,duration:1,ease:'power3.out',stagger:.12,delay:.7});
 G.from('#tilt img',{scale:1.18,duration:2.6,ease:'power2.out'});
 if(ST){G.to('#stage',{scale:1.22,yPercent:10,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true,onUpdate:s=>heroP=s.progress}});
  G.to('#heroCopy',{yPercent:-28,opacity:0,ease:'none',scrollTrigger:{trigger:'.hero',start:'15% top',end:'75% top',scrub:true}})}
 if(FINE){const tx=G.quickTo('#tilt','rotationY',{duration:1.2,ease:'power3'}),ty=G.quickTo('#tilt','rotationX',{duration:1.2,ease:'power3'}),mx=G.quickTo('#tilt','x',{duration:1.2,ease:'power3'}),my=G.quickTo('#tilt','y',{duration:1.2,ease:'power3'});
  $('.hero').addEventListener('pointermove',e=>{const nx=e.clientX/innerWidth-.5,ny=e.clientY/innerHeight-.5;tx(nx*5);ty(-ny*4);mx(-nx*22);my(-ny*14)});
  $('.hero').addEventListener('pointerleave',()=>{tx(0);ty(0);mx(0);my(0)})}
}

}
if($('#ttrack')){
/* ---------- ticker velocity ---------- */
if(G&&ST&&!RM){let sk=G.quickTo('#ttrack','skewX',{duration:.5,ease:'power3'});ST.create({onUpdate:s=>sk(clamp(s.getVelocity()/-260,-8,8))});}

}
/* ---------- section reveals ---------- */
if(G&&ST&&!RM){
 $$('h2.sp').forEach(h=>{const ws=split(h);G.from(ws,{yPercent:110,duration:1,ease:'expo.out',stagger:.05,scrollTrigger:{trigger:h,start:'top 86%'}})});
 $$('.eb').forEach(e=>{if(e.closest('.hero'))return;G.fromTo(e,{'--ebl':0,opacity:0,x:-10},{'--ebl':1,opacity:1,x:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:e,start:'top 90%'}})});
 $$('[data-in]').forEach(e=>{if(e.closest('.hero'))return;G.from(e,{y:30,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:e,start:'top 90%'}})});
 if($('#console')){G.from('#console',{y:60,opacity:0,rotateX:8,transformPerspective:1200,duration:1.2,ease:'power3.out',scrollTrigger:{trigger:'#console',start:'top 92%'}});}
 if($('#tiles')){G.from('.tile',{y:40,opacity:0,duration:.9,ease:'power3.out',stagger:.08,scrollTrigger:{trigger:'#tiles',start:'top 85%'}});}
 if($('.pgrid')){G.from('.pc',{y:50,opacity:0,rotateX:-12,duration:1,ease:'power3.out',stagger:.1,scrollTrigger:{trigger:'.pgrid',start:'top 88%'}});}
 if($('.cards3')){G.from('.vcard',{y:50,opacity:0,duration:1,ease:'power3.out',stagger:.1,scrollTrigger:{trigger:'.cards3',start:'top 88%'}});}
 if($('#feat')){G.matchMedia().add('(min-width:961px)',()=>{G.fromTo('.feat .vwrap',{rotateY:-26,rotateX:12,scale:.88},{rotateY:-7,rotateX:3,scale:1,ease:'none',scrollTrigger:{trigger:'#feat',start:'top 95%',end:'center 55%',scrub:true}})});}
 if($('#feat')){G.from('.finfo',{x:-40,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:'#feat',start:'top 80%'}});}
 if($('.cta .orb')){G.from('.orb',{scale:.5,opacity:0,ease:'none',scrollTrigger:{trigger:'.cta',start:'top bottom',end:'center center',scrub:true}});}
 // section parallax for big headings
 $$('.sec').forEach(s=>G.fromTo(s,{'--sy':0},{'--sy':1,ease:'none',scrollTrigger:{trigger:s,start:'top bottom',end:'bottom top',scrub:true}}));
 // mission quote word scrub
 if($('#quote')){const qw=split($('#quote'));G.fromTo(qw,{opacity:.14},{opacity:1,stagger:.1,ease:'none',scrollTrigger:{trigger:'#quote',start:'top 80%',end:'bottom 45%',scrub:true}});}
 // focus icons draw in
 $$('.tile .ic').forEach((ic,i)=>{G.fromTo(ic,{'--dr':1},{'--dr':0,duration:1.6,ease:'power2.inOut',delay:.15+i%3*.12,scrollTrigger:{trigger:ic,start:'top 88%'}})});
}

/* ---------- tiles spotlight + replay draw on hover ---------- */
$$('.tile,.pc').forEach(t=>{t.addEventListener('pointermove',e=>{const r=t.getBoundingClientRect();t.style.setProperty('--mx',(e.clientX-r.left)+'px');t.style.setProperty('--my',(e.clientY-r.top)+'px')})});
if(G&&!RM){$$('.tile').forEach(t=>{const ic=$('.ic',t);t.addEventListener('pointerenter',()=>G.fromTo(ic,{'--dr':1},{'--dr':0,duration:1,ease:'power2.inOut'}))});
 if(FINE)$$('.pc').forEach(c=>{const rx=G.quickTo(c,'rotationX',{duration:.6,ease:'power3'}),ry=G.quickTo(c,'rotationY',{duration:.6,ease:'power3'});c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();ry(((e.clientX-r.left)/r.width-.5)*10);rx(-((e.clientY-r.top)/r.height-.5)*10)});c.addEventListener('pointerleave',()=>{rx(0);ry(0)})});}

if($('#console')&&$('#path')){
/* ---------- readiness engine ---------- */
const STG=[{n:'Identify need',d:'Individuals or partner populations are identified where readiness evaluation would improve outcomes.'},{n:'Fund access',d:'Foundation support covers evaluation, certification, and readiness infrastructure access.'},{n:'Evaluate',d:'Participants move through governed readiness evaluation processes aligned with BRSA standards.'},{n:'Track outcomes',d:'Partner organizations track outcomes and long-term readiness impact.'}];
const DOM=[{n:'Housing',d:'Supporting evaluation and certification that strengthens housing placement, retention, and stability outcomes.'},{n:'Workforce',d:'Helping individuals demonstrate behavioral readiness required for workforce training, employment, and advancement.'},{n:'Education',d:'Funding readiness evaluation that supports persistence and success within educational programs.'},{n:'Reentry',d:'Providing structured readiness verification for justice-impacted individuals transitioning back into society.'}];
const EV=[[['DAY 00','IDENTIFY · partner referral received'],['DAY 02','IDENTIFY · readiness need noted']],[['DAY 05','FUND · evaluation access covered'],['DAY 06','FUND · session scheduled']],[['DAY 14','EVALUATE · governed evaluation started'],['DAY 21','EVALUATE · evaluation complete']],[['DAY 30','TRACK · 30-day outcome check logged'],['DAY 90','TRACK · 90-day outcome check logged']]];
const nodes=$$('#path .node'),sl=$$('#stagelist button'),bars=$$('#domains .bar'),feed=$('#feed'),detail=$('#detail'),dtitle=$('#dtitle');
let cur=-1,selD=-1,typer=null,EP=0;
function renderFeed(s,anim){clearInterval(typer);const all=[];for(let i=0;i<=s;i++)EV[i].forEach(e=>all.unshift(e));const rows=all.slice(0,6);
 feed.innerHTML=rows.map((r,i)=>'<div'+(i===0?' class="cur"':'')+'><b>'+r[0]+'</b> <span>'+(i===0&&anim?'':r[1])+'</span></div>').join('');
 if(anim){const sp=$('div span',feed),txt=rows[0][1];let k=0;typer=setInterval(()=>{sp.textContent=txt.slice(0,++k);if(k>=txt.length)clearInterval(typer)},22)}}
function showDetail(){if(selD>=0){dtitle.textContent='Domain · '+DOM[selD].n+' (sample)';detail.innerHTML='<b>'+DOM[selD].n+':</b> '+DOM[selD].d}else{dtitle.textContent='Stage '+(cur+1)+' · '+STG[cur].n;detail.innerHTML='<b>'+STG[cur].n+':</b> '+STG[cur].d}}
function setP(p){p=clamp(p);EP=p;const s=Math.min(3,Math.floor(p*4+1e-6));
 $('#pfill').style.transform='scaleX('+p+')';$('#token').style.left=(12.5+p*75)+'%';
 let sum=0;bars.forEach((b,i)=>{const w=+$('s b',b).dataset.w,v=w*clamp(.12+.88*p);sum+=v;$('s b',b).style.transform='scaleX('+(v/100)+')';$('.bv',b).textContent=Math.round(v)});
 $('#c0').textContent=Math.round(90*p);$('#c1').textContent=Math.round(sum/4);$('#c2').textContent=Math.round(12*p);
 if(s!==cur){const up=s>cur;cur=s;nodes.forEach((n,i)=>{n.classList.toggle('on',i<=s);n.classList.toggle('cur',i===s)});sl.forEach((b,i)=>b.classList.toggle('on',i===s));$('#sbadge').textContent='STAGE '+(s+1)+' OF 4';renderFeed(s,up&&!RM);showDetail()}}
setP(0);
let engST=null;const prox={p:0};
function goStage(i){selD=-1;bars.forEach(b=>b.classList.remove('sel'));$('#domains').classList.remove('dim');const target=(i+.6)/4;
 if(engST&&engST.isActive!==undefined&&engST.end>engST.start){const y=engST.start+(engST.end-engST.start)*target;lenis?lenis.scrollTo(y,{duration:1.2}):scrollTo({top:y,behavior:'smooth'})}
 else if(G){prox.p=EP;G.to(prox,{p:target,duration:RM?0:1.1,ease:'power2.inOut',onUpdate:()=>setP(prox.p)})}else setP(target);
 userTouched=true;showDetail()}
nodes.forEach(n=>n.addEventListener('click',()=>goStage(+n.dataset.s)));sl.forEach(b=>b.addEventListener('click',()=>goStage(+b.dataset.s)));
bars.forEach(b=>b.addEventListener('click',()=>{const d=+b.dataset.d;selD=selD===d?-1:d;bars.forEach((x,i)=>x.classList.toggle('sel',i===selD));$('#domains').classList.toggle('dim',selD>=0);userTouched=true;showDetail();
 if(G&&!RM&&selD>=0)G.fromTo($('s b',b),{filter:'brightness(2)'},{filter:'brightness(1)',duration:.8})}));
let userTouched=false,auto=null;
function startAuto(){if(auto||RM)return;auto=setInterval(()=>{if(userTouched){userTouched=false;return}const nx=(cur+1)%4;prox.p=nx===0?0:EP;if(nx===0)setP(0);G?G.to(prox,{p:(nx+.6)/4,duration:1.4,ease:'power2.inOut',onUpdate:()=>setP(prox.p)}):setP((nx+.6)/4)},3200)}
function stopAuto(){clearInterval(auto);auto=null}
if(G&&ST&&!RM){const mm=G.matchMedia();
 mm.add('(min-width:961px) and (min-height:700px)',()=>{engST=ST.create({trigger:'#engine',start:'top top',end:'+=2400',pin:true,scrub:true,anticipatePin:1,onUpdate:s=>setP(s.progress*1.02)});return()=>{engST=null}});
 mm.add('(max-width:960px), (max-height:699px)',()=>{const io=new IntersectionObserver(es=>{es[0].isIntersecting?(EP<.1&&G.to(prox,{p:.15,duration:1,onUpdate:()=>setP(prox.p)}),startAuto()):stopAuto()},{threshold:.35});io.observe($('#console'));return()=>{io.disconnect();stopAuto()}});
}else{setP(RM?1:.15);if(!RM)new IntersectionObserver(es=>es[0].isIntersecting?startAuto():stopAuto(),{threshold:.3}).observe($('#console'))}

}
if($('#pipe')){
/* ---------- how it works pipeline ---------- */
const pipe=$('#pipe'),sts=$$('.st',pipe);
function setPipe(p){pipe.style.setProperty('--p',p);sts.forEach((s,i)=>s.classList.toggle('on',p>=i/3-.02))}
if(G&&ST&&!RM){ST.create({trigger:pipe,start:'top 75%',end:'bottom 55%',scrub:.6,onUpdate:s=>setPipe(s.progress)});setPipe(0)}else setPipe(1);

}
if($('#nmmap')){
/* ---------- NM network map ---------- */
const svg=$('#nmmap'),NS='http://www.w3.org/2000/svg';const K=92,X0=-109.35,Y0=37.25;const pj=(lon,lat)=>[((lon-X0)*K+20).toFixed(1),((Y0-lat)*K+20).toFixed(1)];
const el=(t,a,p=svg)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);p.appendChild(e);return e};
const outline=[[-109.05,37],[-103.0,37],[-103.0,36.5],[-103.04,32],[-106.62,32],[-106.53,31.78],[-108.21,31.78],[-108.21,31.33],[-109.05,31.33]];
const defs=el('defs',{});const pat=el('pattern',{id:'dots',width:10,height:10,patternUnits:'userSpaceOnUse'},defs);el('circle',{cx:1,cy:1,r:.9,fill:'rgba(127,216,255,.18)'},pat);
const cp=el('clipPath',{id:'nmclip'},defs);const od='M'+outline.map(p=>pj(...p).join(' ')).join('L')+'Z';el('path',{d:od},cp);
el('path',{d:od,class:'nm-out'});el('rect',{x:0,y:0,width:620,height:600,fill:'url(#dots)','clip-path':'url(#nmclip)'});
const rio=[[-105.73,37],[-105.9,36.4],[-106.2,35.8],[-106.65,35.1],[-106.78,34.4],[-106.9,33.8],[-107.2,33.2],[-107.0,32.6],[-106.75,32.1],[-106.55,31.78]];
el('path',{d:'M'+rio.map(p=>pj(...p).join(' ')).join('L'),fill:'none',stroke:'rgba(127,216,255,.35)','stroke-width':1.5,'stroke-dasharray':'2 4'});
el('text',{x:pj(-106.95,33.55)[0],y:pj(-106.95,33.55)[1],class:'cityl',fill:'#5d7f99',transform:'rotate(-72 '+pj(-106.95,33.55).join(' ')+')',style:'font-size:8px;fill:#4f6d85'}).textContent='RIO GRANDE';
const hub=pj(-106.65,35.08);
const cities=[['Santa Fe',-105.94,35.69],['Taos',-105.57,36.41],['Farmington',-108.2,36.73],['Gallup',-108.74,35.53],['Clovis',-103.2,34.4],['Roswell',-104.52,33.39],['Hobbs',-103.14,32.70],['Las Cruces',-106.76,32.32],['Silver City',-108.28,32.77]];
const arcsG=el('g',{}),dotsG=el('g',{});const arcs=[];
cities.forEach((c,i)=>{const p=pj(c[1],c[2]);const mx=(+hub[0]+ +p[0])/2,my=(+hub[1]+ +p[1])/2;const dx=p[0]-hub[0],dy=p[1]-hub[1];const L=Math.hypot(dx,dy);const cx=mx-dy/L*L*.22,cy=my+dx/L*L*.22;
 const d='M'+hub.join(' ')+'Q'+cx.toFixed(1)+' '+cy.toFixed(1)+' '+p.join(' ');
 const a=el('path',{d,class:'arc',id:'arc'+i},arcsG);const f=el('path',{d,class:'arc flow',style:'animation-delay:-'+(i*.3)+'s;opacity:0'},arcsG);arcs.push([a,f]);
 const g=el('g',{class:'city',style:'opacity:0'},dotsG);el('circle',{cx:p[0],cy:p[1],r:9,class:'ndr',style:'animation-delay:'+(i*.33)+'s'},g);el('circle',{cx:p[0],cy:p[1],r:3.6,class:'nd'},g);
 const right=+p[0]<480;const t=el('text',{x:+p[0]+(right?9:-9),y:+p[1]+4,class:'cityl','text-anchor':right?'start':'end'},g);t.textContent=c[0].toUpperCase();
 const tt=el('title',{},g);tt.textContent=c[0]+' · illustrative sample node';
 const m=el('circle',{r:2.6,fill:'#fff',opacity:0},dotsG);const am=el('animateMotion',{dur:(2.4+i%3*.5)+'s',repeatCount:'indefinite',begin:(i*.37)+'s'},m);el('mpath',{href:'#arc'+i},am);m.dataset.i=i;});
const hg=el('g',{});el('circle',{cx:hub[0],cy:hub[1],r:12,class:'hubr'},hg);el('circle',{cx:hub[0],cy:hub[1],r:12,class:'hubr',style:'animation-delay:1.1s'},hg);
el('path',{d:`M${hub[0]} ${+hub[1]-9}l9 9-9 9-9-9z`,fill:'#e8c66a'},hg);el('text',{x:+hub[0]-16,y:+hub[1]+5,class:'hubl','text-anchor':'end'},hg).textContent='ALBUQUERQUE';
el('text',{x:+hub[0]-16,y:+hub[1]+20,class:'cityl','text-anchor':'end',style:'font-size:8.5px;fill:#8e9bb0'},hg).textContent='HUB · BRSA FOUNDATION';
svg.pauseAnimations&&svg.pauseAnimations();
const mlog=$('#mlog');let pings=0,mapOn=false,pingT=null;
function logPing(){const i=Math.floor(Math.random()*cities.length);pings++;$('#pings').textContent=pings;const ms=12+Math.floor(Math.random()*30);
 const row=document.createElement('div');row.innerHTML='<b>PING</b> hub → '+cities[i][0]+' · ok · '+ms+'ms <span style="color:#56627a">(sim)</span>';mlog.prepend(row);while(mlog.children.length>7)mlog.lastChild.remove();
 const a=arcs[i][1];a.style.opacity=1;setTimeout(()=>a.style.opacity=.8,600)}
function mapStart(){if(mapOn)return;mapOn=true;svg.unpauseAnimations&&svg.unpauseAnimations();$$('circle[r="2.6"]',svg).forEach(c=>c.setAttribute('opacity',.95));
 const tl=G&&!RM?G.timeline():null;
 arcs.forEach(([a,f],i)=>{const len=a.getTotalLength();if(tl){a.style.strokeDasharray=len;a.style.strokeDashoffset=len;tl.to(a,{strokeDashoffset:0,duration:.9,ease:'power2.out'},i*.12).to(dotsG.children[i*2],{opacity:1,duration:.4},i*.12+.6).add(()=>{f.style.opacity=.8;$('#ncount').textContent=(i+1)+' / 9'},i*.12+.8)}else{f.style.opacity=.8;dotsG.children[i*2].style.opacity=1}});
 if(!tl)$('#ncount').textContent='9 / 9';
 if(!RM)pingT=setInterval(logPing,1400);logPing()}
function mapStop(){if(!mapOn)return;svg.pauseAnimations&&svg.pauseAnimations();clearInterval(pingT);pingT=null;mapOn=false;mapOnce=true}
let mapOnce=false;
new IntersectionObserver(es=>{if(es[0].isIntersecting){if(mapOnce){mapOn=true;svg.unpauseAnimations&&svg.unpauseAnimations();if(!RM)pingT=setInterval(logPing,1400)}else mapStart()}else if(mapOn){svg.pauseAnimations&&svg.pauseAnimations();clearInterval(pingT);mapOn=false;mapOnce=true}},{threshold:.25}).observe($('.mapbox'));
if(RM){/* static */}

}
if($('#feat')){
/* ---------- videos ---------- */
const BLOB='https://r3ttymbsgoc2vq9s.public.blob.vercel-storage.com/kamili/2026-10-25/';
const V={
 kamili:{tab:'Readiness platform',t:'Kamili',loop:'media/kamili-loop.mp4',poster:'media/kamili-loop.jpg',full:BLOB+'kamili-demo-full.mp4',fposter:'media/kamili-full-poster.jpg',d:'One standard for people and programs. A sample program followed from the organization to the funder: readiness records, evaluation, certification and follow-ups.',m:'Full demo · 8 min · captions on · sample data',note:'Sample data · fictional people · no real participant information'},
 obr:{tab:'Organizational readiness',t:'OBR',loop:'media/obr-loop.mp4',poster:'media/obr-loop.jpg',full:'media/obr-chapter.mp4',fposter:'media/obr-chapter-poster.jpg',d:'Organizational Behavioral Readiness: an organization keeps its readiness file, checklist and evidence in one place, inside its case-management system.',m:'Chapter · 50 sec · sample data',note:'Sample data · fictional people · no real participant information'},
 vs:{tab:'Case management',t:'Vizionz Sankofa',loop:'media/vs-loop.mp4',poster:'media/vs-loop.jpg',full:'media/vizionz-sankofa-walkthrough.mp4',fposter:'media/vizionz-sankofa-walkthrough-poster.jpg',d:'Intake, case files, a case manager\u2019s day, funder reports and team chat in one office system, walked through end to end.',m:'Guided tour · 9 min · captions on · sample data',note:'Sample data · fictional people · no real participant information'},
 yakini:{tab:'Technology partner',t:'Yakini Digital',loop:'media/yakini-loop.mp4',poster:'media/yakini-loop.jpg',full:'media/yakini-launch.mp4',fposter:'media/yakini-launch-poster.jpg',d:'The team that builds these systems. Their launch film: one bad week in a business, and the system that pulls it together.',m:'Launch film · 1 min',note:'Launch film with actors · Platform built by Yakini Digital'}
};
const KEYS=Object.keys(V),fvid=$('#fvid'),tabs=$('#tabs');let fk='kamili',fTimer=null,fTween=null,featVis=false;
tabs.innerHTML=KEYS.map((k,i)=>'<button class="tab" data-k="'+k+'"><span class="mono">0'+(i+1)+' · '+V[k].tab+'</span><b>'+V[k].t+'</b><i></i></button>').join('');
function setFeat(k,user){fk=k;const v=V[k];$$('.tab',tabs).forEach(t=>t.classList.toggle('on',t.dataset.k===k));
 const sw=()=>{fvid.poster=v.poster;if(!RM){fvid.src=v.loop;if(featVis)fvid.play().catch(()=>{})}$('#fkick').textContent='Now playing · '+v.t;$('#ftitle').textContent=v.t;$('#fdesc').textContent=v.d;$('#fmeta').textContent=v.m;$('#fbtn span').textContent=k==='yakini'?'Watch the film':'Watch the full demo'};
 if(G&&!RM&&fvid.src){G.to([fvid,'.finfo'],{opacity:0,duration:.3,onComplete:()=>{sw();G.to([fvid,'.finfo'],{opacity:1,duration:.5})}})}else sw();
 if(fTween)fTween.kill();$$('.tab i',tabs).forEach(i=>i.style.transform='scaleX(0)');
 if(G&&!RM){const bar=$('.tab[data-k="'+k+'"] i',tabs);fTween=G.fromTo(bar,{scaleX:0},{scaleX:1,duration:user?14:9,ease:'none',paused:!featVis,onComplete:()=>setFeat(KEYS[(KEYS.indexOf(k)+1)%KEYS.length])})}}
$$('.tab',tabs).forEach(t=>t.addEventListener('click',()=>setFeat(t.dataset.k,true)));
new IntersectionObserver(es=>{featVis=es[0].isIntersecting;if(featVis){if(!RM){if(!fvid.src)fvid.src=V[fk].loop;fvid.play().catch(()=>{})}fTween&&fTween.resume()}else{fvid.pause();fTween&&fTween.pause()}},{threshold:.3}).observe($('#feat'));
setFeat('kamili');
// card loops play only in view
const cio=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target;if(e.isIntersecting&&!RM){if(!v.src)v.src=v.dataset.src;v.play().catch(()=>{})}else v.pause()}),{threshold:.25});
$$('.vcard video').forEach(v=>cio.observe(v));
// rail
const EPS=[['v1','An organization joins','Riverside opens its own readiness record first.','1:31'],['v2','A person sees their record','Maya opens her record, coaching steps and check-ins on her phone.','1:47'],['v3','Staff track progress','A case manager spots who has gone quiet.','1:08'],['v4','An evaluator review','A second evaluator signs off before certification.','1:24'],['v5','Certification and verify','A landlord checks standing, never the files.','1:05'],['v6','The funder view','Reading the day 30, 90 and 180 follow-ups.','1:36']];
$('#rail').innerHTML=EPS.map((e,i)=>'<button class="ep" data-src="'+BLOB+'kamili-demo-'+e[0]+'.mp4" data-poster="media/kamili-'+e[0]+'-poster.jpg" data-title="Kamili · Part '+(i+1)+': '+e[1]+'"><div class="vm"><img loading="lazy" src="media/kamili-'+e[0]+'-poster.jpg" alt=""><span class="vtag mono">Sample data</span><span class="vplay"><svg width="16" height="16"><use href="#play"/></svg></span></div><div class="vb"><span class="mono">Part '+(i+1)+' of 6 · '+e[3]+'</span><b>'+e[1]+'</b><p>'+e[2]+'</p></div></button>').join('');
if(G&&ST&&!RM)G.from('.ep',{x:80,opacity:0,duration:.9,ease:'power3.out',stagger:.07,scrollTrigger:{trigger:'#rail',start:'top 90%'}});
// drag rail
(()=>{const r=$('#rail');let d=false,sx=0,sl=0,moved=0;r.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;d=true;moved=0;sx=e.clientX;sl=r.scrollLeft;r.style.scrollSnapType='none'});addEventListener('pointerup',()=>{if(d){d=false;r.style.scrollSnapType=''}});r.addEventListener('pointermove',e=>{if(!d)return;moved=Math.abs(e.clientX-sx);r.scrollLeft=sl-(e.clientX-sx)});r.addEventListener('click',e=>{if(moved>6){e.stopPropagation();e.preventDefault()}},true)})();
// modal
const modal=$('#modal'),mv=$('#mvid');
function openM(src,poster,title,note){mv.poster=poster||'';mv.src=src;$('#mtitle').textContent=title;$('.mnote',modal).textContent=note||V.kamili.note;modal.classList.add('open');lenis&&lenis.stop();fvid.pause();mv.play().catch(()=>{});
 if(G&&!RM)G.fromTo('.mbox',{y:40,scale:.96,opacity:0},{y:0,scale:1,opacity:1,duration:.6,ease:'expo.out'});$('#mclose').focus()}
function closeM(){mv.pause();mv.removeAttribute('src');mv.load();modal.classList.remove('open');lenis&&lenis.start();if(featVis&&!RM)fvid.play().catch(()=>{})}
const openKey=k=>{const v=V[k];openM(v.full,v.fposter,v.t+({kamili:' · full demo',obr:' · chapter from the Vizionz Sankofa tour',vs:' · guided tour',yakini:' · launch film'})[k],v.note)};
$('#fplay').addEventListener('click',()=>openKey(fk));$('#fbtn').addEventListener('click',()=>openKey(fk));
$$('[data-open]').forEach(b=>b.addEventListener('click',()=>openKey(b.dataset.open)));
$$('.ep').forEach(b=>b.addEventListener('click',()=>openM(b.dataset.src,b.dataset.poster,b.dataset.title)));
$('#mclose').addEventListener('click',closeM);modal.addEventListener('click',e=>{if(e.target===modal)closeM()});addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))closeM()});

}

/* ---------- inquiry forms (progressive enhancement; works without JS via normal POST) ---------- */
$$('form.inq').forEach(f=>{const msg=$('.fmsg',f),btn=$('button[type=submit]',f);
 f.addEventListener('submit',async e=>{if(!window.fetch)return;e.preventDefault();
  if(!f.reportValidity())return;btn.disabled=true;const old=btn.textContent;btn.textContent='Sending…';msg.className='fmsg';msg.textContent='';
  try{const r=await fetch(f.action,{method:'POST',headers:{'Accept':'application/json'},body:new URLSearchParams(new FormData(f))});const j=await r.json().catch(()=>({}));
   if(r.ok&&j.ok){f.reset();msg.className='fmsg ok';msg.textContent=f.dataset.ok||'Thank you. Your message was received. We will reply by email.'}
   else{msg.className='fmsg err';msg.textContent=(j&&j.error)||'Something went wrong. Please call (505) 750-9202 or email info@brsafoundation.org.'}}
  catch(_){msg.className='fmsg err';msg.textContent='Network error. Please call (505) 750-9202 or email info@brsafoundation.org.'}
  btn.disabled=false;btn.textContent=old})});
if(ST){addEventListener('load',()=>ST.refresh());document.fonts&&document.fonts.ready.then(()=>ST.refresh())}
window.__ready=true;
})();
