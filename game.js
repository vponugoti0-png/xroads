'use strict';
// ===== Config =====
const HEROES=[
 {id:'rebel',name:'Rebel',color:'#ff4d6d',power:'Bigger gap once — press ⚡/E to widen the next banner by 50%',active:true},
 {id:'icon',name:'Icon',color:'#ffcf3a',power:'Double center bonus — CENTER gives +6 instead of +3 (passive)'},
 {id:'tiger',name:'Tiger',color:'#ff8a00',power:'Slow-mo burst — press ⚡/E for 3 s of half-speed time',active:true},
 {id:'heir',name:'Heir',color:'#9b7bff',power:'Magnet — gently pulled toward the gap center near banners (passive)'},
 {id:'prince',name:'Prince',color:'#5fd3ff',power:'Shield — survive one banner hit (passive)'},
 {id:'lion',name:'Lion',color:'#7dff7a',power:'Extra life — revive once after any crash (passive)'}];
const DIFF={easy:{speed:26,gap0:40,gap1:30,ramp:.8,noise:9},normal:{speed:30,gap0:34,gap1:25,ramp:1.2,noise:6},hard:{speed:35,gap0:29,gap1:21,ramp:1.6,noise:3.5}};
const G=170,FLAP=-58,GROUND=90,HR=3.4,BW=9,SPACING=46,FIRST=78,N=10,DT=1/120;
const FLAVOR=[["సింహం లేచింది రా.","The lion is up."],["షేర్ చూడు రా.","Look at the share."],["హౌస్‌ఫుల్ అయిందా?","Is the house full?"],["ఫస్ట్ షో మీమ్.","First-show meme."],["విజిల్ వేయండి!","Blow the whistle!"],["మాస్ ఎంట్రీ.","Mass entry."]];
const MEMES=['Box office lo ${w} rampage! 🔥','${l}: "Ee scene lo nenu ledu" 😭','${w} — single frame lo storm 🌪️','Blockbuster ${w}, disaster ${l} 💀','${w} entry ki whistles ఆగలేదు 📣'];
// ===== State =====
const $=s=>document.querySelector(s);
const S={hero:localStorage.xrHero||'rebel',diff:localStorage.xrDiff||'normal',lang:localStorage.xrLang||'te',mute:localStorage.xrMute==='1'};
let game=null,heroImg={};
// Background movie dialogues per hero — edit freely: [Telugu, English transliteration · meaning]
const DIALOGUES={
 rebel:[['బాహుబలి!','Baahubali!'],['నా మాటే శాసనం','Naa maate shaasanam · My word is the law'],['ఒక్కసారి ఫిక్స్ అయితే...','Okkasari fix aithe... · Once I decide...'],['డార్లింగ్!','Darling!'],['అమరేంద్ర బాహుబలి అనే నేను...','Amarendra Baahubali ane nenu... · I, Amarendra Baahubali...']],
 icon:[['తగ్గేదే లే','Thaggedhe Le · Not backing down'],['పుష్ప అంటే ఫ్లవర్ అనుకుంటివా? ఫైర్!','Pushpa ante flower anukuntiva? Fire!'],['పుష్ప... పుష్ప రాజ్','Pushpa... Pushpa Raj'],['వైల్డ్ ఫైర్!','Wild fire!'],['నేనే రాజు','Nene raju · I am the king']],
 tiger:[['కొమురం భీముడో','Komuram Bheemudo'],['నాటు నాటు!','Naatu Naatu!'],['వీరా... రాఘవ','Veera... Raghava'],['టెంపర్ పెరిగితే ఎవ్వడూ ఆపలేడు','Temper perigithe evvadu aapaledu · No one stops me when angry'],['జై లవ కుశ','Jai Lava Kusa']],
 heir:[['ఒక్కసారి కమిట్ అయితే నా మాట నేనే వినను','Okkasari commit aithe naa maata nene vinanu · Once I commit, I don\'t even listen to myself'],['ఎవడు కొడితే దిమ్మ తిరిగి మైండ్ బ్లాక్ అవుతుందో వాడే పండుగాడు','Evadu kodithe dimma tirigi mind block... vaade Pandugadu'],['ఐ యామ్ ఎ బిట్ ఫ్యామస్','I\'m a bit famous'],['కుర్చీ మడతపెట్టి','Kurchi madathapetti'],['శ్రీమంతుడు','Srimanthudu · The rich-hearted']],
 prince:[['వంద మందిని ఒకేసారి పంపు','Vanda mandini okesari pampu · Send a hundred at once'],['రామ రాజు... సీతా రామ రాజు','Rama Raju... Seetha Rama Raju'],['నాటు నాటు!','Naatu Naatu!'],['మగధీర','Magadheera · The great warrior'],['చిట్టి బాబు','Chitti Babu']],
 lion:[['ఫ్లూట్ జింక ముందు ఊదు, సింహం ముందు కాదు','Flute jinka mundu oodu, simham mundu kaadu · Play the flute to a deer, not a lion'],['జై బాలయ్య!','Jai Balayya!'],['కత్తులతో కాదురా, కంటిచూపుతో చంపేస్తా','Kattulatho kaadura, kantichooputho champesta · I kill with a glance, not swords'],['సింహం సింగిల్ గానే వస్తుంది','Simham single gaane vasthundi · The lion comes alone'],['దబిడి దిబిడి','Dabidi Dibidi']]};
const dlgCache=new Map();
function dlgSprite(txt,px,col){const k=txt+'|'+px+'|'+col;let c=dlgCache.get(k);if(c)return c;c=document.createElement('canvas');const x=c.getContext('2d');const f=`bold ${px}px "Noto Sans Telugu",Oswald,sans-serif`;x.font=f;const w=Math.ceil(x.measureText(txt).width)+8;c.width=Math.min(w,4096);c.height=Math.ceil(px*1.5);x.font=f;x.textBaseline='middle';x.fillStyle=col;x.fillText(txt,4,c.height/2);if(dlgCache.size>60)dlgCache.clear();dlgCache.set(k,c);return c}
function drawDialogue(g,dt){const D=g.dlg||(g.dlg={t:0,i:-1,line:null,y:.3,hero:g.p.hero});D.t-=dt;if(D.t<=0){D.t=4.5;D.i++;const rival=false;D.hero=rival?g.ghost.hero:g.p.hero;const L=DIALOGUES[D.hero]||[];D.line=L.length?L[Math.random()*L.length|0]:null;D.y=.18+Math.random()*.35}
 if(!D.line)return;const ph=1-D.t/4.5,a=Math.min(1,ph*4,(1-ph)*4)*.22;if(a<=0)return;const col=heroBy(D.hero)?.color||'#fff',big=Math.round(Math.max(18,Math.min(W,H)*.07)*DPR),sm=Math.round(big*.45);
 cx.save();cx.setTransform(1,0,0,1,0,0);cx.globalAlpha=a;const dx=(1-ph)*40*DPR-20*DPR;let y=D.y*H*DPR;
 if(S.lang==='te'){const s1=dlgSprite(D.line[0],big,col);{const k=Math.min(1,W*DPR*.92/s1.width);cx.drawImage(s1,(W*DPR-s1.width*k)/2+dx,y,s1.width*k,s1.height*k);y+=s1.height*k}}
 const s2=dlgSprite(D.line[1],S.lang==='te'?sm:big,S.lang==='te'?'#fff':col);{const k=Math.min(1,W*DPR*.92/s2.width);cx.drawImage(s2,(W*DPR-s2.width*k)/2+dx,y,s2.width*k,s2.height*k)}cx.restore()}

// ===== Audio =====
let AC=null;function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();return AC}
function tone(f,d,type='square',v=.08,slide=0,delay=0){if(S.mute)return;const a=ac();if(!a)return;const t=a.currentTime+delay,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g).connect(a.destination);o.start(t);o.stop(t+d+.02)}
function noise(d,v=.15){if(S.mute)return;const a=ac();if(!a)return;const b=a.createBuffer(1,a.sampleRate*d,a.sampleRate),c=b.getChannelData(0);for(let i=0;i<c.length;i++)c[i]=(Math.random()*2-1)*(1-i/c.length);const s=a.createBufferSource(),g=a.createGain();g.gain.value=v;s.buffer=b;s.connect(g).connect(a.destination);s.start()}
const SFX={flap:()=>tone(520,.08,'square',.05,780),pass:()=>tone(660,.1,'triangle',.08),center:()=>{tone(880,.1,'triangle',.1);tone(1320,.15,'triangle',.08,0,.08)},whistle:()=>tone(1400,.35,'sine',.1,2600),crash:()=>{noise(.4,.25);tone(200,.4,'sawtooth',.1,50)},count:h=>tone(h?990:440,.15,'square',.08),win:()=>[523,659,784,1046].forEach((f,i)=>tone(f,.2,'triangle',.1,0,i*.12)),lose:()=>[400,300,200].forEach((f,i)=>tone(f,.25,'sawtooth',.07,0,i*.18)),hit:()=>{noise(.12,.2);tone(150,.1,'square',.1)},power:()=>tone(300,.4,'sine',.1,1200)};
function setMute(m){S.mute=m;localStorage.xrMute=m?'1':'0';document.querySelectorAll('.mute').forEach(b=>{b.textContent=m?'🔇 Muted':'🔊 Sound';b.setAttribute('aria-pressed',m)})}
// ===== Hero images =====
function placeholder(h){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');x.shadowColor=h.color;x.shadowBlur=24;x.strokeStyle=h.color;x.lineWidth=6;x.fillStyle=h.color+'33';
 x.beginPath();x.arc(128,92,46,0,7);x.fill();x.stroke();x.beginPath();x.moveTo(50,236);x.quadraticCurveTo(56,150,128,146);x.quadraticCurveTo(200,150,206,236);x.closePath();x.fill();x.stroke();
 x.shadowBlur=12;x.fillStyle='#fff';x.font='bold 40px Oswald,Arial Narrow,sans-serif';x.textAlign='center';x.fillText(h.name.toUpperCase(),128,214);return c.toDataURL()}
function loadHero(h){return new Promise(res=>{const tryS=(list)=>{if(!list.length){const i=new Image();i.onload=()=>res(i);i.src=placeholder(h);return}const i=new Image();i.onload=()=>res(i);i.onerror=()=>tryS(list.slice(1));i.src=list[0]};tryS([`heroes/${h.id}.jpg`,`heroes/${h.id}.png`,`heroes/${h.id}.jpeg`,`heroes/${h.id}.webp`])})}
const heroBy=id=>HEROES.find(h=>h.id===id);
// ===== RNG / course =====
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function makeCourse(seed,diff,practice){const r=rng(seed),d=DIFF[diff],b=[];let x=FIRST;
 if(practice){b.push({x,c:50,gap:d.gap0+8,practice:true});x+=SPACING+10}
 let prev=50;for(let i=0;i<N;i++){const gap=d.gap0-(d.gap0-d.gap1)*(i/(N-1));const maxJ=10+i*3;let c=prev+(r()*2-1)*maxJ;c=Math.max(gap/2+8,Math.min(GROUND-gap/2-6,c));b.push({x,c,gap,idx:i});prev=c;x+=SPACING-i*.8}
 return b}
// ===== Runner (shared physics for player & ghost) =====
class Runner{constructor(hero,course,diff){Object.assign(this,{hero,course,diff,x:0,y:45,vy:0,alive:true,done:false,passed:0,seats:0,combo:0,best:0,centers:0,whistles:0,next:0,lives:hero==='lion'?1:0,shield:hero==='prince',inv:0,wide:-1,powerUsed:false,slow:0,t:0,events:[]})}
 speed(){return DIFF[this.diff].speed+DIFF[this.diff].ramp*this.passed}
 gapOf(b,i){return b.gap*(i===this.wide?1.5:1)}
 usePower(){if(this.powerUsed||!this.alive)return false;if(this.hero==='tiger'){this.slow=3;this.powerUsed=true;return true}if(this.hero==='rebel'){this.wide=this.next;this.powerUsed=true;return true}return false}
 flap(){if(this.alive&&!this.done)this.vy=FLAP}
 step(dt){if(!this.alive||this.done)return;this.t+=dt;if(this.inv>0)this.inv-=dt;
  const b=this.course[this.next];
  if(this.hero==='heir'&&b&&b.x-this.x<16&&b.x-this.x>-BW)this.vy+=(b.c-this.y)*7*dt;
  this.vy+=G*dt;this.y+=this.vy*dt;this.x+=this.speed()*dt;if(this.y<HR){this.y=HR;this.vy=0}
  const crash=why=>{if(this.inv>0)return;if(why==='banner'&&this.shield){this.shield=false;this.inv=1;this.events.push(['SHIELD!','#5fd3ff']);return}
   if(this.lives>0){this.lives--;const nb=this.course[this.next]||b;this.y=nb?nb.c:45;this.vy=-20;this.inv=1.6;this.events.push(['EXTRA LIFE!','#7dff7a']);return}
   this.alive=false;this.events.push(['CRASH','#ff4d4d','crash'])};
  if(this.y>GROUND-HR){this.y=GROUND-HR;crash('ground');return}
  if(b){const g=this.gapOf(b,this.next);if(this.x+HR>b.x&&this.x-HR<b.x+BW&&Math.abs(this.y-b.c)>g/2-HR)crash('banner');
   if(this.x-HR>b.x+BW&&this.alive){const dist=Math.abs(this.y-b.c)/(g/2-HR);this.next++;
    if(b.practice){this.events.push(['PRACTICE ✓','#aaa','pass'])}
    else{this.passed++;let pts=1,lab='+1',col='#fff',snd='pass';
     if(dist<.3){const cb=this.hero==='icon'?6:3;pts+=cb;this.centers++;lab=`+${cb} CENTER`;col='#ffcf3a';snd='center';this.combo++}
     else if(dist>.72){pts+=2;this.whistles++;lab='WHISTLE! +2';col='#ff5af0';snd='whistle';this.combo++}else this.combo=0;
     if(this.combo>1){pts+=this.combo-1;lab+=` · COMBO x${this.combo}`}this.best=Math.max(this.best,this.combo);this.seats+=pts;this.events.push([lab,col,snd]);
     if(this.passed>=N){this.done=true;this.events.push(['HOUSEFULL! 10/10','#ffcf3a','win'])}}}}}
 stats(){const share=this.passed*10,gross=this.seats,overseas=this.best*5,loudest=this.whistles*5;return{passed:this.passed,seats:this.seats,centers:this.centers,whistles:this.whistles,best:this.best,share,gross,overseas,loudest,total:share+gross+overseas+loudest}}}
// ===== Ghost: simulated believable runs with an imperfect autopilot =====
function simulate(hero,course,diff,seed){const r=rng(seed),R=new Runner(hero,course,diff),fr=[];let kk=0,react=0,target=50,noiseV=DIFF[diff].noise;
 for(let k=0;k<120*90&&R.alive&&!R.done;k++){const b=course[R.next];
  if(k%30===0)target=(b?b.c:50)+(r()*2-1)*noiseV;react-=DT;
  if(R.y>target+3&&R.vy>-5&&react<=0){R.flap();react=.12+r()*.18}
  if(hero==='tiger'&&!R.powerUsed&&R.passed>=5)R.usePower();if(hero==='rebel'&&!R.powerUsed&&R.passed>=3)R.usePower();
  R.step(R.slow>0?DT*.5:DT);if(R.slow>0)R.slow-=DT;kk+=R.slow>0?.5:1;if(kk>=2){kk-=2;fr.push([R.x,R.y])}}
 fr.push([R.x,R.y]);return{frames:fr,stats:R.stats(),hero}}
const ghostCache=new Map();
function houseGhost(course,diff,seed,exclude,key){if(key&&ghostCache.has(key))return ghostCache.get(key);const _g=houseGhostRaw(course,diff,seed,exclude);if(key)ghostCache.set(key,_g);return _g}
function houseGhostRaw(course,diff,seed,exclude){const hs=HEROES.filter(h=>h.id!==exclude);const hero=hs[seed%hs.length].id;const runs=[];for(let i=0;i<5;i++)runs.push(simulate(hero,course,diff,seed*7+i));runs.sort((a,b)=>a.stats.total-b.stats.total);return{...runs[2],name:'House ('+heroBy(hero).name+')'}}// median of 5
// ===== Canvas =====
const cv=$('#cv'),cx=cv.getContext('2d');let W=0,H=0,U=1,DPR=1;
function resize(){DPR=Math.min(1.5,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;U=H/100}
addEventListener('resize',resize);resize();
const city=[...Array(40)].map((_,i)=>({x:i*14,h:15+((i*37)%30),w:9+(i*13)%6}));
function draw(){const g=game;cx.setTransform(DPR,0,0,DPR,0,0);
 const grd=cx.createLinearGradient(0,0,0,H);grd.addColorStop(0,'#1a1410');grd.addColorStop(1,'#4a2c15');cx.fillStyle=grd;cx.fillRect(0,0,W,H);
 if(!g)return;let sx=0,sy=0;if(g.shake>0){sx=(Math.random()-.5)*g.shake*U;sy=(Math.random()-.5)*g.shake*U}
 cx.save();cx.translate(sx,sy);const camX=g.p.x-(W/U)*(W<H?.2:.3);const X=x=>(x-camX)*U,Y=y=>y*U;
 cx.fillStyle='#2a1d14';city.forEach(c=>{let x=((c.x-camX*.3)%560+560)%560-20;cx.fillRect(x*U,(GROUND-c.h)*U,c.w*U,c.h*U);cx.fillStyle='#ffcf3a22';cx.fillRect(x*U+2,(GROUND-c.h+3)*U,2,2);cx.fillStyle='#2a1d14'});
 cx.restore();{const n=performance.now();drawDialogue(g,g.paused?0:Math.min(.1,(n-(g._dn||n))/1000));g._dn=n};cx.save();cx.translate(sx,sy);
 match.course.forEach((b,i)=>{const x=X(b.x);if(x<-BW*U||x>W+20)return;const gap=g.p.gapOf(b,i);const top=b.c-gap/2,bot=b.c+gap/2,col=b.practice?'#666':'#c8331f';
  cx.fillStyle='#222';cx.fillRect(x+BW*U/2-2,0,4,GROUND*U);cx.fillStyle=col;cx.fillRect(x,0,BW*U,Y(top));cx.fillRect(x,Y(bot),BW*U,Y(GROUND-bot));if(!b.practice){cx.strokeStyle='#ff3a1f88';cx.lineWidth=3;cx.strokeRect(x-1.5,-2,BW*U+3,Y(top)+2);cx.strokeRect(x-1.5,Y(bot),BW*U+3,Y(GROUND-bot)+2)}
  cx.fillStyle='#ffcf3a';cx.fillRect(x,Y(top)-4,BW*U,4);cx.fillRect(x,Y(bot),BW*U,4);
  cx.fillStyle='#ffcf3a33';cx.fillRect(x,Y(b.c-gap*.15),BW*U,Y(gap*.3));// center zone hint
  cx.fillStyle='#fff';cx.font=`bold ${Math.max(11,2.2*U)}px Oswald,sans-serif`;cx.textAlign='center';cx.fillText(b.practice?'PRACTICE':(b.idx+1),x+BW*U/2,Y(top)-8)});
 cx.fillStyle='#111';cx.fillRect(0,Y(GROUND),W,H);cx.fillStyle='#ffcf3a';cx.fillRect(0,Y(GROUND),W,3);cx.fillStyle='#555';for(let i=0;i<W/U/8+2;i++){cx.fillRect(((i*8-camX)%(W/U+8)+(W/U+8))%(W/U+8)*U,Y(GROUND+4),3*U,.6*U)}
 const gf=g.ghost.frames[Math.min(g.ghost.frames.length-1,Math.floor(g.gi))];if(gf){const gdy=(g.count>0||g.gi<60)?-16*Math.max(0,1-g.gi/60):0,gx=X(gf[0]),gy=Y(gf[1]+gdy);cx.globalAlpha=.45;drawHero(heroImg[g.ghost.hero],gx,gy,0);cx.globalAlpha=1;if(g.ghost.short){cx.font=`bold ${Math.max(12,2*U)}px sans-serif`;cx.textAlign='center';cx.lineWidth=3;cx.strokeStyle='#000';cx.strokeText(g.ghost.short,gx,gy-HR*1.9*U);cx.fillStyle='#7fd8ff';cx.fillText(g.ghost.short,gx,gy-HR*1.9*U)}}
 const p=g.p;if(!(p.inv>0&&Math.floor(p.inv*10)%2))drawHero(heroImg[p.hero],X(p.x),Y(p.y),Math.max(-.5,Math.min(.8,p.vy/90)));
 if(p.shield){cx.strokeStyle='#5fd3ff';cx.lineWidth=2;cx.beginPath();cx.arc(X(p.x),Y(p.y),HR*1.6*U,0,7);cx.stroke()}
 g.pops.forEach(o=>{cx.globalAlpha=Math.max(0,o.t);cx.fillStyle=o.col;cx.font=`bold ${Math.max(18,3.6*U)}px Oswald,sans-serif`;cx.textAlign='center';cx.strokeStyle='#000';cx.lineWidth=4;cx.strokeText(o.txt,X(o.x),Y(o.y));cx.fillText(o.txt,X(o.x),Y(o.y));cx.globalAlpha=1});
 cx.restore();
 if(p.slow>0){cx.fillStyle='#ff8a0022';cx.fillRect(0,0,W,H)}
 if(g.count>0){cx.fillStyle='#000a';cx.fillRect(0,0,W,H);cx.fillStyle='#ffcf3a';cx.textAlign='center';cx.font=`bold ${22*U}px Oswald,sans-serif`;cx.fillText(Math.ceil(g.count),W/2,H/2+7*U);cx.font=`${Math.max(16,3*U)}px sans-serif`;cx.fillStyle='#fff';cx.fillText(g.label,W/2,H/2+16*U)}
 if(g.rc>0){cx.fillStyle='#0008';cx.fillRect(0,0,W,H);cx.fillStyle='#ffcf3a';cx.textAlign='center';cx.font=`bold ${22*U}px Oswald,sans-serif`;cx.fillText(Math.ceil(g.rc),W/2,H/2+7*U);cx.font=`${Math.max(16,3*U)}px sans-serif`;cx.fillStyle='#fff';cx.fillText('Get ready…',W/2,H/2+16*U)}}
const spriteCache=new Map();
function heroSprite(img,px){px=Math.max(16,Math.round(px));const k=img&&img.src;let m=spriteCache.get(k);if(!m){m={};spriteCache.set(k,m)}if(m[px])return m[px];
 const c=document.createElement('canvas');c.width=c.height=px;const x=c.getContext('2d'),r=px/2,ring=Math.max(2,px*.07);
 x.save();x.beginPath();x.arc(r,r,r-ring*.5,0,Math.PI*2);x.clip();const iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height,sz=Math.min(iw,ih),sx=(iw-sz)/2,sy=(ih-sz)*.2;
 x.drawImage(img,sx+sz*.02,sy+sz*.02,sz*.96,sz*.96,0,0,px,px);x.restore();
 x.strokeStyle='#ff8a00';x.lineWidth=ring;x.beginPath();x.arc(r,r,r-ring/2,0,Math.PI*2);x.stroke();return m[px]=c}
function drawHero(img,x,y,rot){const s=HR*2.8*U;if(!img)return;const spr=heroSprite(img,s*DPR);cx.save();cx.translate(x,y);cx.rotate(rot);cx.drawImage(spr,-s/2,-s/2,s,s);cx.restore()}
// ===== Game flow =====
let mode='house',match=null;
function show(id){document.querySelectorAll('.screen').forEach(s=>s.classList.toggle('hidden',s.id!==id));const play=id===null;['#hud','#flavor','#tap'].forEach(q=>$(q).classList.toggle('hidden',!play))}
function dailySeed(){return Math.floor(Date.now()/864e5)*31+1}
let nextPrintSeed=Math.random()*1e9|0;const gKey=(seed,diff,pr,hero)=>seed+'|'+diff+'|'+(pr?1:0)+'|'+hero;
let preT=0;function precompute(){clearTimeout(preT);const idle=window.requestIdleCallback||(f=>setTimeout(f,30));preT=setTimeout(()=>{const pr=$('#practice').checked;[dailySeed(),nextPrintSeed].forEach((seed,i)=>idle(()=>{const k=gKey(seed,S.diff,pr,S.hero);if(!ghostCache.has(k))houseGhost(makeCourse(seed,S.diff,pr),S.diff,seed>>>0,S.hero,k)}))},120)}
function startMatch(m){ac();mode=m;let seed;if(m==='newprint'){seed=nextPrintSeed;nextPrintSeed=Math.random()*1e9|0}else seed=dailySeed();const pr=$('#practice').checked;const course=makeCourse(seed,S.diff,pr);
 match={mode:m,seed,course,diff:S.diff,players:[]};
 const opp=m==='pass'?null:houseGhost(course,S.diff,seed>>>0,S.hero,gKey(seed,S.diff,pr,S.hero));match.house=opp;setTimeout(precompute,1500);
 runRound(S.hero,m==='pass'?'Player 1':'You',opp||{frames:[[0,45]],stats:null,hero:S.hero,name:'(no rival yet)',short:'',empty:true})}
function runRound(hero,label,ghost){const p=new Runner(hero,match.course,match.diff);ghost.short=ghost.short??(ghost.empty?'':'RIVAL');
 game={p,ghost,gi:0,count:3,label:`${label} · ${heroBy(hero).name}`,lastCount:4,pops:[],shake:0,paused:false,over:false,who:label,flv:0};
 $('#gName').textContent=ghost.empty?'NO RIVAL (P1 sets the mark)':'vs '+ghost.name;const H_=heroBy(hero);$('#bPower').classList.toggle('hidden',!H_.active);$('#powHint').textContent=H_.name+': '+H_.power;
 show(null);setFlavor()}
function setFlavor(){const f=FLAVOR[Math.random()*FLAVOR.length|0];$('#flavor').textContent=S.lang==='te'?`${f[0]}  ·  ${f[1]}`:f[1]}
function flap(){if(!game||game.paused||game.over)return;if(game.count>0||game.rc>0)return;game.p.flap();SFX.flap()}
function power(){if(!game||game.paused||game.count>0)return;if(game.p.usePower()){SFX.power();game.pops.push({txt:game.p.hero==='tiger'?'SLOW-MO!':'WIDE GAP!',col:'#ff8a00',x:game.p.x,y:game.p.y-8,t:1.2});$('#bPower').disabled=true}}
function pause(on){if(!game||game.over)return;if(on===game.paused)return;game.paused=on;if(!on&&game.count<=0){game.rc=3;game.lastRc=4}$('#pauseS').classList.toggle('hidden',!on)}
let last=0,acc=0;
function loop(t){requestAnimationFrame(loop);const dt=Math.min(.05,(t-last)/1000||0);last=t;const g=game;
 if(g&&!g.paused&&!g.over){
  if(g.count>0){g.count-=dt;g.p.y=45+Math.sin(t/200)*2;const c=Math.ceil(g.count);if(c!==g.lastCount&&c>0){g.lastCount=c;SFX.count(false)}if(g.count<=0){SFX.count(true);g.p.vy=FLAP*.7}}
  else if(g.rc>0){const c=Math.ceil(g.rc);if(c!==g.lastRc){g.lastRc=c;SFX.count(false)}g.rc-=dt;if(g.rc<=0){g.rc=0;SFX.count(true);acc=0}}
  else{acc+=dt;while(acc>=DT){acc-=DT;const sc=g.p.slow>0?.5:1;g.p.step(DT*sc);if(g.p.slow>0)g.p.slow-=DT;g.gi+=sc*.5}
   g.p.events.splice(0).forEach(([txt,col,snd])=>{g.pops.push({txt,col,x:g.p.x,y:g.p.y-6,t:1.2});if(snd&&SFX[snd])SFX[snd]();if(snd==='whistle'||snd==='crash')g.shake=snd==='crash'?3:1.6;if(txt.startsWith('EXTRA')||txt==='SHIELD!'){SFX.hit();g.shake=2}});
   if(Math.random()<.002)setFlavor();
   if(!g.p.alive||g.p.done){g.over=true;setTimeout(()=>endRound(),g.p.done?900:1100)}}
  g.pops.forEach(o=>{o.t-=dt*.8;o.y-=dt*6});g.pops=g.pops.filter(o=>o.t>0);g.shake=Math.max(0,g.shake-dt*6);
  const s=g.p.stats();$('#hPassed').textContent=s.passed+'/10';$('#hSeats').textContent=s.seats;$('#hCombo').textContent='x'+g.p.combo;$('#pBar').style.width=s.passed*10+'%';
  const gf=g.ghost.frames[Math.min(g.ghost.frames.length-1,Math.floor(g.gi))];const gp=gf?match.course.filter(b=>!b.practice&&b.x+BW<gf[0]).length:0;$('#gBar').style.width=(g.ghost.empty?0:gp*10)+'%'}
 draw()}
requestAnimationFrame(loop);
function endRound(){const g=game,st=g.p.stats(),frames=[];
 match.players.push({label:g.who,hero:g.p.hero,stats:st});
 if(match.mode==='pass'&&match.players.length===1){// record P1 as ghost by replaying? store a simplified path
  match.p1ghost=g.recFrames;$('#p1Score').textContent=st.total;game=null;show('pass');buildGrid('#heroGrid2','#heroPow2');return}
 game=null;const a=match.players[match.players.length-1];
 const b=match.mode==='pass'?match.players[0]:{label:match.house.name,hero:match.house.hero,stats:match.house.stats};
 const left=match.mode==='pass'?b:a,right=match.mode==='pass'?a:b;fight(left,right)}
// record player path for pass-the-phone ghost
const _step=Runner.prototype.step;Runner.prototype.step=function(dt){_step.call(this,dt);if(game&&this===game.p){game.recFrames=game.recFrames||[];game._k=(game._k||0)+dt/DT*1;while(game._k>=2){game._k-=2;game.recFrames.push([this.x,this.y])}}};
// ===== Fight =====
let fightTimer=[];
function fight(A,B){show('fight');const tA=A.stats.total,tB=B.stats.total;$('#fN1').textContent=`${A.label} · ${tA}`;$('#fN2').textContent=`${B.label} · ${tB}`;
 [['#f1',A],['#f2',B]].forEach(([q,P])=>{const im=heroImg[P.hero].cloneNode();im.alt=heroBy(P.hero).name;im.decoding='sync';$(q).replaceChildren(im)});['#f1','#f2'].forEach(q=>{const e=$(q);e.className='fighter '+(q==='#f1'?'l':'r');void e.offsetWidth});
 const vs=$('#vs');vs.style.animation='none';void vs.offsetWidth;vs.style.animation='';
 let h1=100,h2=100;$('#hp1').style.width=$('#hp2').style.width='100%';$('#meme').className='meme';$('#meme').textContent='';
 const mx=Math.max(tA,tB,1);// damage scaled by scores
 const tie=tA===tB,winA=tA>tB;let n=0;fightTimer.forEach(clearTimeout);fightTimer=[];const steps=8;
 for(let i=1;i<=steps;i++)fightTimer.push(setTimeout(()=>{const hitA=i%2;// alternate
   const f1=tie?Math.max(10,100-60*tB/mx):winA?Math.max(10,100-60*tB/mx):0,f2=tie?f1:winA?0:Math.max(10,100-60*tA/mx);const fr=i/steps;
   if(hitA){h2=100-(100-f2)*fr;$('#hp2').style.width=h2+'%';$('#f2').classList.remove('hit');void $('#f2').offsetWidth;$('#f2').classList.add('hit')}
   else{h1=100-(100-f1)*fr;$('#hp1').style.width=h1+'%';$('#f1').classList.remove('hit');void $('#f1').offsetWidth;$('#f1').classList.add('hit')}SFX.hit()},900+i*280));
 fightTimer.push(setTimeout(()=>{if(!tie){$('#hp'+(winA?2:1)).style.width='0%';$(winA?'#f2':'#f1').classList.add('ko')}
  const W_=winA?A:B,L_=winA?B:A,m=tie?'Draw! Both heroes need a sequel 🎬':MEMES[Math.random()*MEMES.length|0].replace('${w}',heroBy(W_.hero).name).replace('${l}',heroBy(L_.hero).name);$('#meme').textContent=m;$('#meme').className='meme on'},900+steps*280+300));
 fightTimer.push(setTimeout(()=>result(A,B),900+steps*280+3200));match.fight=[A,B]}
$('#skipFight').onclick=()=>{fightTimer.forEach(clearTimeout);result(...match.fight)};
// ===== Result =====
const hdr=P=>{const n=heroBy(P.hero).name;return P.label.includes('('+n+')')?P.label:`${P.label} (${n})`};
function result(A,B){fightTimer.forEach(clearTimeout);show('result');const human=match.mode==='pass'?null:A;const d=A.stats.total-B.stats.total;
 const v=$('#verdict');if(match.mode==='pass'){const w=d>0?A:d<0?B:null;v.className='verdict win';v.innerHTML=w?`${w.label.toUpperCase()} WINS!<small>by ${Math.abs(d)} points (${A.stats.total} vs ${B.stats.total})</small>`:`DRAW<small>${A.stats.total} each</small>`;SFX.win()}
 else{v.className='verdict '+(d>=0?'win':'lose');v.innerHTML=d>0?`BLOCKBUSTER! YOU WIN<small>by ${d} points (${A.stats.total} vs ${B.stats.total})</small>`:d<0?`FLOP. YOU LOSE<small>by ${-d} points (${A.stats.total} vs ${B.stats.total})</small>`:`DRAW<small>${A.stats.total} each</small>`;(d>=0?SFX.win:SFX.lose)()}
 const r=(k,f)=>`<tr><td>${k}</td><td>${f(A.stats)}</td><td>${f(B.stats)}</td></tr>`;
 $('#breakdown').innerHTML=`<tr><th>Column</th><th>${hdr(A)}</th><th>${hdr(B)}</th></tr>`+
  r('Share = banners × 10',s=>`${s.passed} × 10 = <b>${s.share}</b>`)+r('Gross = seats',s=>`${s.passed} base + ${s.centers} centers + ${s.whistles} whistles + combo = <b>${s.gross}</b>`)+
  r('Overseas = best combo × 5',s=>`${s.best} × 5 = <b>${s.overseas}</b>`)+r('Loudest = whistles × 5',s=>`${s.whistles} × 5 = <b>${s.loudest}</b>`)+r('<b>TOTAL</b>',s=>`<b>${s.total}</b>`);
 const humans=match.mode==='pass'?[A,B]:[A];const ne=$('#nameEntry');ne.innerHTML='';
 humans.forEach((h,i)=>{const d_=document.createElement('div');d_.style.margin='8px';if(!(h.stats.total>0)){d_.textContent=`${h.label}: 0 points — not saved to leaderboard.`;ne.appendChild(d_);return}d_.innerHTML=`<input type="text" maxlength="16" placeholder="${h.label} name"> <button class="big">Save ${h.stats.total} to leaderboard</button>`;d_.querySelector('input').value=(localStorage['xrName'+i]||'').slice(0,16);
  d_.querySelector('button').onclick=e=>{const nm=d_.querySelector('input').value.trim().slice(0,16);if(!nm||!(h.stats.total>0)){d_.querySelector('input').focus();return}localStorage['xrName'+i]=nm;addLB({name:nm,score:h.stats.total,hero:h.hero,diff:match.diff,passed:h.stats.passed,date:new Date().toISOString().slice(0,10)});d_.innerHTML=`✓ Saved for ${nm.replace(/</g,'')}`};ne.appendChild(d_)});
 renderLB()}
// ===== Leaderboard (localStorage, real entries only) =====
function getLB(){try{return JSON.parse(localStorage.xrLB||'[]').filter(e=>e&&String(e.name||'').trim()&&e.score>0)}catch(e){return[]}}
function addLB(e){e.name=String(e.name||'').trim().slice(0,16);if(!e.name||!(e.score>0))return;const l=getLB();l.push(e);l.sort((a,b)=>b.score-a.score);localStorage.xrLB=JSON.stringify(l.slice(0,20));renderLB()}
function renderLB(){const l=getLB();const esc=s=>String(s).replace(/[<&>"]/g,c=>'&#'+c.charCodeAt(0)+';');const h=l.length?`<table class="gloss lb"><tr><th>#</th><th>Name</th><th>Score</th><th>Hero</th><th>Diff</th><th>Banners</th></tr>${l.slice(0,10).map((e,i)=>`<tr><td>${i+1}</td><td>${esc(e.name)}</td><td>${e.score}</td><td>${esc(heroBy(e.hero)?.name||'')}</td><td>${esc(e.diff)}</td><td>${e.passed}/10</td></tr>`).join('')}</table>`:'<p>No scores yet — play a round and save your name.</p>';$('#lbMenu').innerHTML=h;$('#lbRes').innerHTML=h}
// ===== Menu =====
function buildGrid(sel,powSel){const g=$(sel);g.innerHTML='';HEROES.forEach(h=>{const b=document.createElement('button');b.className='hero big'+(S.hero===h.id?' sel':'');b.innerHTML=`<img alt="${h.name}" src="${heroImg[h.id]?.src||''}"><span>${h.name}</span>`;b.title=h.power;b.onclick=()=>{S.hero=h.id;localStorage.xrHero=h.id;buildGrid(sel,powSel);precompute()};g.appendChild(b)});$(powSel).textContent='⚡ '+heroBy(S.hero).name+' power: '+heroBy(S.hero).power}
document.querySelectorAll('#diffSeg button').forEach(b=>{b.onclick=()=>{S.diff=b.dataset.d;localStorage.xrDiff=S.diff;document.querySelectorAll('#diffSeg button').forEach(x=>x.classList.toggle('sel',x===b));precompute()};b.classList.toggle('sel',b.dataset.d===S.diff)});
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>startMatch(b.dataset.mode));
$('#p2Go').onclick=()=>{const p1=match.players[0];runRound(S.hero,'Player 2',{frames:match.p1ghost||[[0,45]],hero:p1.hero,name:'Player 1 ('+heroBy(p1.hero).name+')',short:'P1'})};
$('#p2Back').onclick=$('#toMenu').onclick=()=>{game=null;show('menu');buildGrid('#heroGrid','#heroPow');renderLB()};
$('#again').onclick=()=>startMatch(match.mode);
$('#bLeave').onclick=$('#pLeave').onclick=()=>{game=null;$('#pauseS').classList.add('hidden');show('menu');buildGrid('#heroGrid','#heroPow')};
$('#bPause').onclick=e=>{e.stopPropagation();pause(true)};$('#resume').onclick=()=>pause(false);
$('#bPower').onclick=e=>{e.stopPropagation();power()};
document.querySelectorAll('.mute').forEach(b=>b.onclick=e=>{e.stopPropagation();setMute(!S.mute);if(!S.mute)SFX.pass()});
$('#langBtn').onclick=()=>{S.lang=S.lang==='te'?'en':'te';localStorage.xrLang=S.lang;$('#langBtn').textContent=S.lang==='te'?'Flavor: తెలుగు + EN':'Flavor: English';setFlavor()};
$('#langBtn').textContent=S.lang==='te'?'Flavor: తెలుగు + EN':'Flavor: English';
cv.addEventListener('pointerdown',e=>{e.preventDefault();flap()});
addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='ArrowUp'){e.preventDefault();flap()}else if(e.code==='KeyE')power();else if(e.code==='KeyP'||e.code==='Escape')pause(!(game&&game.paused));else if(e.code==='KeyM')setMute(!S.mute)});
setMute(S.mute);
Promise.all(HEROES.map(h=>loadHero(h).then(i=>heroImg[h.id]=i))).then(()=>{buildGrid('#heroGrid','#heroPow');renderLB();precompute()});
$('#practice').addEventListener('change',precompute);
window.__xr={get game(){return game},get match(){return match}};
