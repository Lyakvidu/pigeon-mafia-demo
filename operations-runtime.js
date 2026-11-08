/* Adapter from the shared objective reducer to live actors, collision and drawing. */
window.createOperations=env=>{
 const {ctx,rect,shadow,diamond,actor,between,followers,notice,setPose,alertSweeper,seenByGuard,finish,selectScene,paintOrder}=env;
 const round=()=>env.round(),mission=()=>env.mission(),kit=()=>env.kit();
 const text=(ru,en)=>I18N.language()==='en'?en:ru;
 const active=()=>OPS_MODEL.active(round().op,mission());
 const at=n=>WORLD_DATA.point(n.at);
 const has=rule=>mission().rules.includes(rule);
 const options=()=>active().map(n=>({...at(n),node:n}));
 let peckAt=0,signal=null,opened={},freed=[],posted=null;
 function setup(){
  const r=round();r.op=OPS_MODEL.create(mission());peckAt=0;signal=null;opened={};freed=[];posted=null;
  r.job.rival.x=286;r.job.rival.y=196;
  r.people.forEach((a,i)=>{a.variant=has('crowd')?i%3:a.variant;if(has('crowd'))a.path=[{x:110,y:185},{x:185,y:205},{x:265,y:160},{x:156,y:110}];});
  stageEntered();
 }
 function startChase(){alertSweeper(round().p,true);}
 function stageEntered(){
  signal=null;const r=round();
  if(active().some(n=>n.type==='evade')){
   // A scripted alarm starts a real pursuit, not an automatic success condition.
   const g=r.sweeper;g.mode='chase';g.target={x:r.p.x,y:r.p.y};g.interest=r.time+8;g.lastSeen=r.time;
   SOUND.effect('alert');
  }
  notice(hint(),3.5);
 }
 function hint(){
  return active().map(n=>I18N.language()==='en'?n.en:n.ru).join(text(' ИЛИ ',' OR '));
 }
 function closest(){return options().sort((a,b)=>between(a,round().p)-between(b,round().p))[0];}
 function facts(n,kind,dt=0){
  const r=round(),p=at(n),all=followers(),rescued=all.filter(b=>b.operative),group=rescued.length?rescued:all;
  return {key:n.key,kind,dt,near:between(r.p,p)<(n.type==='lure'?46:n.type==='escort'?29:24),
   allies:all.some(b=>between(b,p)<45),clear:!has('rival')||between(r.job.rival,p)>30,
   escorted:group.length>0&&group.every(b=>!b.station&&between(b,p)<46),
   diversion:Boolean(r.diversion?.arrived&&between(r.diversion.meal,p)<3),
   signalled:Boolean(signal?.key===n.key&&signal.done),calm:r.sweeper.mode!=='chase',unseen:!seenByGuard(),
   flying:r.time<r.job.flightUntil,stationed:Boolean(posted&&posted.station&&between(posted,posted.station)<12),
   chased:r.sweeper.mode==='chase',window:r.time%8<3};
 }
 function apply(n,event){
  const r=round(),result=OPS_MODEL.accept(r.op,mission(),event);
  if(result.peck){setPose(r.p,'peck',.22);SOUND.effect('peck');}
  if(!result.changed)return false;
  r.carrying=Boolean(r.op.cargo);SOUND.effect(n.type==='take'?'steal':'deliver');
  if(['take','trade'].includes(n.type)){
   setPose(r.p,'peck',.25);
   const witness=r.people.find(a=>between(a,r.p)<55&&!a.distracted);
   if(witness&&r.op.cargo!=='twig'){setPose(witness,'surprise',.45);witness.anger=r.time+2.5;}
   if(has('pursuit')||r.op.cargo!=='twig'&&seenByGuard())startChase();
  }
  if(n.type==='rescue'){
   const p=at(n),b=actor(p.x+17,p.y+12,[],1);b.recruited=true;b.operative=true;r.birds.push(b);freed.push({...p});
  }
  if(n.type==='switch'||n.type==='repair'||n.type==='sync')opened[r.op.district+':'+n.gate]=true;
  if(n.type==='station'){
   posted=followers().find(b=>between(b,r.p)<45);if(posted)posted.station=at(n);
  }
  if(n.type==='sync'){for(const b of r.birds)b.station=null;posted=null;}
  if(n.type==='travel'){
   selectScene(n.to);r.meals=env.scene().tables.map(t=>({...t,taken:true}));
   r.p.x=57;r.p.y=290;r.target=null;r.sweeper.x=145;r.sweeper.y=117;r.sweeper.mode='patrol';r.cat.x=279;r.cat.y=295;r.cat.mode='stalk';
   followers().forEach((b,i)=>{b.x=35+i*9;b.y=310;b.station=null;});freed=[];posted=null;r.diversion=null;
   document.querySelector('.mission span').textContent=I18N.language()==='en'?WORLD_DATA.worlds[n.to].en:WORLD_DATA.worlds[n.to].ru;
  }
  if(result.done){r.food=mission().goal;finish('win');}else stageEntered();
  return true;
 }
 function action(){
  const r=round(),near=closest();if(!near||between(near,r.p)>26){notice(hint(),3);return true;}
  const n=near.node;
  if(n.type==='lure'){
   signal={...at(n),key:n.key,done:false};r.sweeper.mode='investigate';r.sweeper.target=signal;r.sweeper.investigateAt=r.time+.45;
   SOUND.effect('coo');notice(text('Отойди в сторону, чтобы пропустить дворника.','Step aside and let the sweeper pass.'),3);return true;
  }
  if(n.type==='evade'&&r.sweeper.mode!=='chase'){startChase();return true;}
  if(['rescue','repair'].includes(n.type)){if(r.time<peckAt)return true;peckAt=r.time+.28;}
  if(!apply(n,facts(n,'action')))notice(hint(),2.5);
  return true;
 }
 function flock(){
  const r=round(),target=diversionTarget();
  if(!target)return false;
  r.diversion={meal:{x:target.x,y:target.y},until:r.time+8,arrived:false};r.readyAt=r.time+8;
  SOUND.effect('flutter');notice(text('Стая отвлекает. Подойди к метке и нажми действие.','The flock is distracting. Approach the marker and act.'),3);return true;
 }
 function diversionTarget(){
  const r=round();
  if(!followers().length||r.time<r.readyAt)return null;
  return options().find(p=>p.node.type==='divert'&&between(p,r.p)<72);
 }
 function nearby(){
  const p=closest();
  return p&&between(p,round().p)<26?p:null;
 }
 function occupied(x,y){
  const r=round();
  for(const n of active())if(n.type==='rescue'){
   const p=at(n);if(Math.hypot((x-p.x)/15,(y-p.y)/9)<1)return true;
  }
  return gates().some(g=>x>g.x-g.w/2&&x<g.x+g.w/2&&y>g.y-g.h/2&&y<g.y+g.h/2);
 }
 function gates(){
  const r=round(),names=new Set();let district=mission().district;
  for(const step of mission().steps)for(const n of step){if(n.gate&&district===r.op.district)names.add(n.gate);if(n.type==='travel')district=n.to;}
  return [...names].filter(name=>!opened[r.op.district+':'+name]).map(name=>({...WORLD_DATA.gates[name],name}));
 }
 function blockedTerrain(x,y){return round().op.district==='roofs'&&x>202&&x<235&&y>220&&y<276&&round().time>=round().job.flightUntil;}
 function tick(dt){
  const r=round(),spec=WORLD_DATA.worlds[r.op.district],p=r.p,time=r.time;
  if(spec.hazard==='gusts'||has('storm')){
   if(p.x>202&&p.x<235&&p.y>215&&p.y<285&&time>=r.job.flightUntil)p.y=Math.max(92,p.y-(has('storm')?24:16)*dt);
  }
  if(spec.hazard==='sprinklers'&&Math.floor(time/3)%2===0&&between(p,{x:156,y:201})<30&&time>=r.job.flightUntil){p.x+=p.x<156?-dt*19:dt*19;}
  if(spec.hazard==='cart'||r.op.district==='market'){
   r.job.cart.x=174+68*Math.sin(time*(has('rush')?.9:.55));
   if(between(p,r.job.cart)<18&&time>=r.job.flightUntil){p.y+=p.y<205?-2:2;r.target=null;}
  }
  if(has('rival'))env.updateRival(dt);
  if(r.phase!=='play')return;
  let near=false;
  for(const n of active()){
   const event=facts(n,'tick',dt);near||=event.near;
   if(apply(n,event))break;
  }
  if(!near)r.op.hold=0;
 }
 function ground(){
  const r=round(),spec=WORLD_DATA.worlds[r.op.district],time=r.time;
  if(spec.hazard==='sprinklers'){
   for(let i=0;i<8;i++){const angle=i*Math.PI/4+time*.5;rect(Math.floor(time/3)%2===0?'#a7d0c0':'#688e85',156+Math.round(Math.cos(angle)*26),201+Math.round(Math.sin(angle)*20),3,2);}
  }
  if(spec.hazard==='gusts'||has('storm'))for(let i=0;i<4;i++)rect('#d9d2ad',204+i*8,280-Math.floor((time*23+i*16)%65),6,1);
  if(posted?.station){diamond(posted.station.x,posted.station.y,'#b6c6ef');}
  for(const p of options()){
   const n=p.node,color=n.window&&time%8>=3?'#bc7b78':'#91c6ad';
   diamond(p.x,p.y+4,color);
   if(OPS_MODEL.types[n.type].hold&&r.op.hold){rect('#323448',p.x-12,p.y+7,25,3);rect('#9bccac',p.x-11,p.y+8,Math.min(23,r.op.hold/OPS_MODEL.types[n.type].hold*23),1);}
  }
 }
 function queue(){
  const r=round(),spec=WORLD_DATA.worlds[r.op.district];
  const add=(jobObject,p,options={})=>paintOrder.push({...p,jobObject,options});
  for(const p of freed)add('cage',p,{open:true});
  for(const p of options()){
   const n=p.node;
   const name={take:n.item==='twig'?'twig':'parcel',rescue:'cage',claim:'flag',switch:'sign',repair:'sign',trade:'parcel',travel:'sign',station:'flag',sync:'flag'}[n.type];
   if(name){shadow(p.x,p.y,name==='cage'?34:16);add(name,p,{friendly:['travel','station','sync'].includes(n.type)});}
  }
  for(const g of gates())paintOrder.push({x:g.x,y:g.y+g.h/2,operationGate:g});
  if(spec.hazard==='cart'||r.op.district==='market'){shadow(r.job.cart.x,r.job.cart.y,30);add('cart',r.job.cart);}
  if(has('rival'))paintOrder.push({y:r.job.rival.y,rival:r.job.rival});
 }
 function gateArt(g){
  rect('#40394f',g.x-g.w/2,g.y-g.h/2-8,g.w,g.h+8);
  rect('#ca9f7e',g.x-g.w/2+1,g.y-g.h/2-7,g.w-2,3);
  for(let y=g.y-g.h/2;y<g.y+g.h/2;y+=7)rect('#8c6d71',g.x-g.w/2+1,y,g.w-2,3);
 }
 function hud(){
  const r=round(),near=closest(),label=near?OPS_MODEL.types[near.node.type][I18N.language()==='en'?'en':'ru']:text('ДЕЙСТВИЕ','ACTION');
  document.getElementById('loot').textContent=r.op.index+'/'+mission().goal+(r.carrying?' +':'');
  document.getElementById('action-label').textContent=label;
  document.getElementById('action').classList.toggle('ready',Boolean(near&&between(near,r.p)<26));
  if(has('quiet')){const danger=document.getElementById('danger');danger.classList.add('alert');danger.textContent+=' · '+r.job.alerts+'/3';}
  if(r.time>=r.messageUntil)document.getElementById('tip').textContent=hint();
 }
 return {setup,hint,action,flock,tick,ground,queue,gateArt,hud,occupied,blockedTerrain,nearby,diversionTarget,targets:()=>options().filter(p=>['divert','take','trade'].includes(p.node.type)),has};
};
