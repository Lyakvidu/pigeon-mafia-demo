'use strict';
(() => {
  const canvas = document.querySelector('#square');
  const ctx = canvas.getContext('2d', { alpha:false });
  const ui = Object.fromEntries(['loot','danger','tip','result','result-label','result-title','result-text','again',
    'restart','joystick','action','action-label','call','flock-label'].map(id => [id, document.getElementById(id)]));
  const W=320, H=346, TAU=Math.PI*2;
  const home={x:36,y:306};
  const STEAL=29, HEARING=47, TARGET=72;
  let MAX_LOOT=2, mission=CAMPAIGN[0], scene=SCENE, kit={};
  const keys=new Set();
  const motionKeys=new Set(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyS','KeyA','KeyD']);
  let objects=SCENE.fixed.filter(o=>['tree','table','bench','bin','crate'].includes(o.type));
  const directions=[0,.63,-.63,1.17,-1.17,1.59,-1.59];
  const joystick={id:null,x:0,y:0};
  const paintOrder=[];
  let reducedMotion=false, paused=true, round, raf=0, lastFrame=0, lastPaint=0, lastHud=0, mapTouch=null;
  let cache=[];
  function selectScene() {
    scene=mission.district==='market'?DISTRICTS.market:SCENE;
    objects=scene.fixed.filter(o=>['tree','table','bench','bin','crate'].includes(o.type));
    cache=scene.fixed.map(prop=>{
    const image=document.createElement('canvas');
    image.width=70;
    image.height=66;
    scene.prop(image.getContext('2d'),{...prop,x:35,y:59});
    return {...prop,image};
    });
  }
  const between=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
  const point=([x,y])=>({x,y});
  function actor(x,y,path=[],variant=0) {
    return {x,y,path:path.map(point),index:0,flip:false,angle:0,variant,moving:false,pose:'',until:0};
  }
  function occupied(x,y) {
    const cage=round?.job?.cage;
    if(cage&&!cage.open&&['rescue','finale'].includes(mission.mode)&&Math.hypot((x-cage.x)/15,(y-cage.y)/9)<1) return true;
    return objects.some(o=>{
      const ry=o.type==='table'?9:o.type==='tree'?7:6;
      const rx=o.type==='table'?16:o.type==='bench'?16:o.type==='tree'?10:7;
      const dx=(x-o.x)/rx, dy=(y-(o.y-(o.type==='table'?4:0)))/ry;
      return dx*dx+dy*dy < 1;
    });
  }
  function clearSight(a,b) {
    const n=Math.ceil(between(a,b)/9);
    for(let i=1;i<n;i++) {
      const t=i/n;
      if(occupied(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t)) return false;
    }
    return true;
  }
  function move(a,angle,step) {
    for (const offset of directions) {
      const heading=angle+offset;
      const x=clamp(a.x+Math.cos(heading)*step,12,308);
      const y=clamp(a.y+Math.sin(heading)*step,92,319);
      if (between(a,{x,y}) < .01 || occupied(x,y)) continue;
      a.x=x; a.y=y; a.angle=heading;
      if(Math.abs(Math.cos(heading))>.17) a.flip=Math.cos(heading)<0;
      a.moving=true;
      return true;
    }
    return false;
  }
  function approach(a,target,speed,dt,stop=2) {
    const dist=between(a,target);
    if(dist<=stop) return false;
    return move(a,Math.atan2(target.y-a.y,target.x-a.x),Math.min(dist-stop,speed*dt));
  }
  function patrol(a,speed,dt) {
    if(between(a,a.path[a.index])<4) a.index=(a.index+1)%a.path.length;
    approach(a,a.path[a.index],speed,dt);
  }
  function setPose(a,pose,duration) {
    a.pose=pose; a.until=round.time+duration;
  }
  function currentPose(a) { return round.time<a.until ? a.pose : ''; }
  function notice(message,duration=2.35) {
    round.message=message;
    round.messageUntil=round.time+duration;
  }
  function reset() {
    selectScene();
    MAX_LOOT=mission.goal;
    const save=PROGRESS.state();
    kit={...save.upgrades,flight:Boolean(save.completed.courier),scout:Boolean(save.completed.rescue),courier:Boolean(save.completed.wind),protector:Boolean(save.completed.lure)};
    document.querySelector('.mission strong').textContent=I18N.language()==='en'?mission.en:mission.title;
    document.querySelector('.mission span').textContent=T(mission.district==='market'?'РЫНОК У КАНАЛА':'ВОКЗАЛЬНАЯ ПЛОЩАДЬ');
    const p=actor(57,290);
    const sweeper=actor(145,117,[[145,170],[195,215],[262,241],[283,167],[235,116],[141,115]]);
    sweeper.mode='patrol';
    sweeper.interest=0;
    sweeper.lastSeen=0;
    const cat=actor(279,295,[[244,297],[221,263],[247,239],[274,258],[283,296]]);
    cat.mode='stalk'; cat.readyAt=1.2; cat.pounceUntil=0; cat.chargeTarget=null;
    round={
      p,sweeper,cat,
      people:[
        actor(68,126,[[72,115],[70,148],[101,148],[119,126],[116,113]],0),
        actor(196,153,[[197,167],[169,175],[151,154],[152,137],[195,133]],1),
        actor(262,228,[[235,221],[233,202],[244,181],[276,192],[278,220]],2),
        actor(202,279,[[157,265],[123,216],[128,183],[147,224],[217,263],[232,285]],0)
      ],
      birds:[
        actor(77,239,[[81,237],[70,232],[71,245]],0),
        actor(185,251,[[183,245],[196,255],[181,262]],1),
        actor(270,150,[[276,155],[269,163],[260,148]],2)
      ],
      meals:scene.tables.map(t=>({...t,taken:false})),
      time:0, food:0, carrying:false, phase:'play', moved:false, target:null,
      message:'', messageUntil:0, readyAt:0, diversion:null, particles:[]
    };
    setupJob();
    clearInput();
    ui.result.hidden=true;
    ui.result.dataset.outcome='';
    document.getElementById('reward').textContent='';
    lastFrame=lastPaint=lastHud=0;
    updateHud();
    draw();
    start();
  }
  function nearest(list,from,range=Infinity) {
    let selected=null;
    for(const candidate of list) {
      const d=between(candidate,from);
      if(d>range) continue;
      range=d; selected=candidate;
    }
    return selected;
  }
  function lureTargets() { return mission.mode==='distraction'?[round.job.token]:round.meals.filter(t=>!t.taken); }
  function availableMeal(range) {
    return nearest(round.meals.filter(t=>!t.taken),round.p,range);
  }
  function uncalledBird() { return nearest(round.birds.filter(b=>!b.recruited),round.p,HEARING); }
  function followers() { return round.birds.filter(b=>b.recruited); }
  function canDistract() { return followers().length>0 && !round.diversion && round.time>=round.readyAt && nearest(lureTargets(),round.p,TARGET); }
  function surprise(person) {
    person.distracted=false;
    setPose(person,'surprise',.45);
    person.anger=round.time+2.25;
    person.flip=round.p.x<person.x;
  }
  function alertSweeper(source,direct) {
    const guard=round.sweeper;
    if (direct && guard.mode!=='chase') SOUND.effect('alert');
    if(direct&&guard.mode!=='chase') {
      round.job.alerts++;
      if(mission.mode==='quiet'&&round.job.alerts>=2) {finish('alarm');return;}
    }
    guard.mode=direct?'chase':'check';
    guard.target={x:source.x,y:source.y};
    guard.interest=round.time+(direct?5:2.4);
    guard.lastSeen=round.time;
  }
  function seenByGuard() {
    const {p,sweeper}=round;
    const dist=between(p,sweeper);
    if(dist>89 || !clearSight(sweeper,p)) return false;
    if(dist<35) return true;
    const angle=Math.atan2(p.y-sweeper.y,p.x-sweeper.x);
    return Math.cos(angle-sweeper.angle)>.08;
  }
  function puff(x,y,type,count=5) {
    for(let i=0;i<count;i++) {
      const angle=i*TAU/count+round.time;
      round.particles.push({x,y,age:0,life:.37+(i%3)*.14,dx:Math.cos(angle)*(15+i%4*8),dy:Math.sin(angle)*20-17,type});
    }
  }
  function useAction() {
    if(paused || round.phase!=='play' || document.hidden) return;
    if(jobAction()) {updateHud();return;}
    const p=round.p;
    if(round.carrying && between(p,home)<=23) {
      round.carrying=false; round.food++;
      round.job.flightReady=Math.max(round.time,round.job.flightReady-kit.nest);
      SOUND.effect('deliver');
      puff(home.x,home.y-7,'gold',9);
      setPose(p,'peck',.27);
      if(round.food===MAX_LOOT) finish('win');
      else notice('Одна порция в гнезде. Нужна ещё одна!');
    } else if(!round.carrying) {
      const meal=availableMeal(STEAL);
      if(meal) {
        meal.taken=true; round.carrying=true;
        SOUND.effect('steal');
        p.flip=meal.x<p.x;
        setPose(p,'peck',.27);
        puff(meal.x,meal.y-13,'gold');
        const witness=nearest(round.people.filter(a=>!a.distracted && clearSight(a,p)),p,49);
        if(seenByGuard()) {
          alertSweeper(p,true);
          notice('Дворник засёк налёт! Уноси лапы.');
        } else if(witness && between(round.sweeper,p)<108 && clearSight(round.sweeper,witness)) {
          alertSweeper(witness,false);
          notice('Прохожий поднял шум. Дворник идёт сюда!');
        } else {
          notice(witness?'Кто-то возмущён! Неси добычу в гнездо.':'Чисто сработано! Неси добычу в гнездо.');
        }
        if(witness) surprise(witness);
      } else {
        setPose(p,'peck',.22);
        SOUND.effect('peck');
        puff(p.x+(p.flip?-9:9),p.y-5,'dust',3);
        notice('Картошка на столиках. Подойди ближе.',1.5);
      }
    } else {
      notice('Добыча в клюве. Отнеси её в гнездо слева внизу.',1.65);
    }
    updateHud();
  }
  function useFlock() {
    if(paused || round.phase!=='play' || document.hidden) return;
    if(hasRival()&&followers().length&&between(round.job.rival,round.p)<65) {
      round.job.rival.fleeUntil=round.time+4.5;SOUND.effect('flutter');notice('Соперник отступает. Занимай точку!');return;
    }
    if(kit.protector&&between(round.cat,round.p)<70&&round.time>=round.readyAt) {
      round.cat.mode='recover';round.cat.readyAt=round.time+4;round.readyAt=round.time+6;
      SOUND.effect('coo');notice('Гром отпугнул кота. Проходи!');return;
    }
    const bird=uncalledBird();
    if(bird) {
      bird.recruited=true; setPose(bird,'flap',.4);
      SOUND.effect('coo');
      puff(bird.x,bird.y-14,'feather',3);
      notice('Подкрепление! У столика нажми «Стая» ещё раз.');
    } else if(canDistract()) {
      const meal=nearest(lureTargets(),round.p,TARGET);
      SOUND.effect('flutter');
      round.diversion={meal,until:round.time+6.5,arrived:false};
      round.readyAt=round.time+9;
      notice('Стая летит к столику. Подбирайся к картошке!');
    } else if(followers().length===0) {
      notice('Подойди к любому голубю и позови его.',1.6);
    } else {
      notice(round.time<round.readyAt?'Стая переводит дух.':'Подойди ближе к столику с картошкой.',1.6);
    }
    updateHud();
  }
  function finish(outcome) {
    if(round.phase!=='play') return;
    const win=outcome==='win';
    round.phase=outcome;
    round.target=null;
    clearInput();
    ui.result.dataset.outcome=outcome;
    ui['result-label'].textContent=T(win?'ОПЕРАЦИЯ ВЫПОЛНЕНА':'ОПЕРАЦИЯ СОРВАЛАСЬ');
    ui['result-title'].textContent=T(win?'Заказ выполнен!':outcome==='cat'?'Кот перехватил!':outcome==='rival'?'Соперник перехватил!':outcome==='alarm'?'Слишком много шума!':'Дворник догнал!');
    ui['result-text'].textContent=T(win?mission.unlock:outcome==='cat'?'Когда кот приседает, резко меняй направление.':'Отвлеки противника стаей или используй взлёт.');
    ui.result.hidden=false;
    SOUND.scene('silent');
    SOUND.effect(win?'win':'lose');
    window.dispatchEvent(new CustomEvent('game-ended',{detail:{outcome,food:round.food,time:round.time,mission}}));
    updateHud();
  }
  function movePlayer(dt) {
    const p=round.p;
    const horizontal=Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA'));
    const vertical=Number(keys.has('ArrowDown')||keys.has('KeyS'))-Number(keys.has('ArrowUp')||keys.has('KeyW'));
    const x=horizontal||vertical ? horizontal : joystick.x;
    const y=horizontal||vertical ? vertical : joystick.y;
    const length=Math.hypot(x,y);
    const flying=round.time<round.job.flightUntil;
    const speed=(flying?145:round.carrying?(kit.courier?79:67):85)*(currentPose(p)==='peck'?.69:1);
    if(length>.06) {
      round.target=null;
      move(p,Math.atan2(y,x),speed*dt*Math.min(1,length));
    } else if(round.target) {
      if(between(p,round.target)<=4 || round.time>round.target.until) round.target=null;
      else approach(p,round.target,speed,dt,2);
    }
    if(p.moving) round.moved=true;
  }
  function updateBirds(dt) {
    const p=round.p, lure=round.diversion;
    if(lure && round.time>=lure.until) round.diversion=null;
    round.birds.forEach((b,i)=>{
      if(!b.recruited) {
        patrol(b,8,dt);
      } else if(round.diversion) {
        const target={x:lure.meal.x-24+i*16,y:lure.meal.y+8+Math.sin(round.time*7+i)*8};
        approach(b,target,113,dt,5);
        setPose(b,'flap',.15);
        if(between(b,lure.meal)<38 && !lure.arrived) {
          lure.arrived=true;
          puff(b.x,b.y-14,'feather',6);
          notice('Они смотрят на стаю. Сейчас!',1.9);
        }
      } else {
        const slot=followers().indexOf(b);
        const target=between(p,home)<30
          ? {x:home.x+slot*7,y:home.y-4}
          : {x:p.x+(p.flip?1:-1)*(16+slot*7),y:p.y+8+(slot%2)*7};
        approach(b,target,round.carrying?79:96,dt,6);
        if(between(b,p)>43) setPose(b,'flap',.18);
      }
    });
  }
  function updatePeople(dt) {
    const p=round.p, lure=round.diversion;
    for (const a of round.people) {
      a.distracted=Boolean(lure?.arrived && between(a,lure.meal)<78);
      if(a.distracted) {
        const b=nearest(followers(),a);
        setPose(a,'shoo',.15);
        approach(a,b,26,dt,21);
        a.flip=b.x<a.x;
        a.anger=0;
      } else if(round.time<(a.anger||0)) {
        if(currentPose(a)!=='surprise') {
          setPose(a,'shoo',.18);
          if(between(a,p)<62) {
            const target=a.variant===1?{x:a.x+(a.x-p.x),y:a.y+(a.y-p.y)}:p;
            approach(a,target,a.variant===2?22:35,dt,10);
          }
          a.flip=p.x<a.x;
        }
      } else {
        patrol(a,15+3*a.variant,dt);
        if(between(a,p)<12 && !currentPose(a)) {
          setPose(a,'surprise',.34);
          if(a.path.length) a.index=(a.index+1)%a.path.length;
        }
      }
    }
  }
  function updateSweeper(dt) {
    const {sweeper:g,p}=round;
    const time=round.time;
    if(g.mode==='investigate') {
      if(between(g,g.target)<12) {
        g.target.done=true;g.mode='patrol';SOUND.effect('deliver');notice('Метка пройдена. Следующая точка или домой.');
      } else {
        if(between(g,p)<9&&round.time>round.job.flightUntil) return finish('sweeper');
        approach(g,g.target,mission.variant?58:44,dt,4);
      }
    } else if(g.mode==='patrol') {
      patrol(g,28,dt);
      if(round.carrying && seenByGuard() && between(g,p)<62) alertSweeper(p,true);
    } else if(g.mode==='check') {
      if(round.carrying && seenByGuard()) alertSweeper(p,true);
      else if(time>g.interest || between(g,g.target)<5) g.mode='patrol';
      else approach(g,g.target,41,dt);
    } else {
      const distance=between(g,p);
      if(distance<=9 && clearSight(g,p)&&round.time>round.job.flightUntil) return finish('sweeper');
      if(distance<100 && clearSight(g,p)) {
        g.target={x:p.x,y:p.y};
        if(distance<67) g.lastSeen=time;
      }
      if(time>g.interest || distance>129 || time-g.lastSeen>2.5) {
        g.mode='patrol';
        notice('Дворник потерял след.',1.4);
      } else {
        approach(g,g.target,63,dt,5);
        if(g.moving && Math.floor(time*16)%5===0 && !g.dust) {
          puff(g.x,g.y,'dust',1);
          g.dust=true;
        }
        if(Math.floor(time*16)%5!==0) g.dust=false;
      }
    }
  }
  function updateCat(dt) {
    const {cat,p}=round;
    const time=round.time, dist=between(cat,p);
    if(cat.mode==='stalk') {
      patrol(cat,20,dt);
      if(time>=cat.readyAt && dist<(round.carrying?59:42) && clearSight(cat,p)) {
        SOUND.effect('cat');
        cat.mode='crouch'; cat.pounceUntil=time+.54; cat.flip=p.x<cat.x;
        cat.chargeTarget={x:p.x,y:p.y}; setPose(p,'alarm',.25);
        notice('Кот присел. Резко меняй направление!',1.6);
      }
    } else if(cat.mode==='crouch') {
      if(time>=cat.pounceUntil) {
        cat.mode='leap'; cat.pounceUntil=time+.63;
        puff(cat.x,cat.y,'dust',5);
      }
    } else if(cat.mode==='leap') {
      const lunging=approach(cat,cat.chargeTarget,119,dt,2);
      if(between(cat,p)<10 && clearSight(cat,p)&&time>round.job.flightUntil) return finish('cat');
      if(!lunging || time>=cat.pounceUntil) {
        cat.mode='recover'; cat.readyAt=time+2.25;
        puff(cat.x,cat.y,'dust',5);
      }
    } else if(time>=cat.readyAt) {
      cat.mode='stalk'; cat.readyAt=time+1;
    }
  }
  function tick(dt) {
    round.time+=dt;
    const {p,birds,people,cat,sweeper}=round;
    [p,...birds,...people,cat,sweeper].forEach(a=>{a.moving=false;});
    movePlayer(dt);
    updateJob(dt);
    if(round.phase!=='play') return;
    updateBirds(dt);
    updatePeople(dt);
    updateSweeper(dt);
    if(round.phase==='play') updateCat(dt);
    for(const f of round.particles) {
      f.age+=dt; f.x+=f.dx*dt; f.y+=f.dy*dt;
    }
    round.particles=round.particles.filter(f=>f.age<f.life);
  }
  function updateHud() {
    const {p,food,carrying,time,sweeper,cat,diversion}=round;
    const nearHome=carrying && between(p,home)<=23;
    const nearFood=!carrying && availableMeal(STEAL);
    const nearby=uncalledBird();
    const count=followers().length;
    const support=hasRival()&&followers().length&&between(round.job.rival,p)<65;
    const guardCat=kit.protector&&between(cat,p)<70&&time>=round.readyAt;
    const ready=Boolean(nearby||canDistract()||support||guardCat);
    const danger=cat.mode==='leap'||cat.mode==='crouch'?'КОТ!':sweeper.mode==='chase'?'ПОГОНЯ!':sweeper.mode==='check'?'ШУМ':sweeper.mode==='investigate'?'НА СВИСТ':'ТИХО';
    const content={
      loot:''+food+'/'+MAX_LOOT+(carrying?' +1':''),
      danger,
      'action-label':nearHome?'В ГНЕЗДО':nearFood?'УКРАСТЬ':'КЛЮНУТЬ',
      'flock-label':support?'ПРОГНАТЬ':guardCat?'ЗАЩИТИТЬ':nearby?'ПОЗВАТЬ':diversion?'ОТВЛЕКАЕТ':time<round.readyAt?'ПЕРЕДЫШКА':ready?'ОТВЛЕЧЬ · '+count:count?'В СТАЕ · '+count:'РЯДОМ С ГОЛУБЕМ',
      tip:time<round.messageUntil?round.message:
        !round.moved?'Коснись площади или веди голубя джойстиком.':
        nearHome?'Гнездо рядом. Оставь порцию.':
        carrying?'Неси картошку в гнездо слева внизу.':
        nearFood?'Картошка рядом. Жми «Украсть».':
        nearby?'Голубь рядом. Позови его кнопкой «Стая».':
        'Найди две порции картошки. Гнездо слева внизу.'
    };
    for(const [id,text] of Object.entries(content)) {
      if(ui[id].textContent!==T(text)) ui[id].textContent=T(text);
    }
    ui.danger.classList.toggle('alert',danger!=='ТИХО');
    ui.loot.classList.toggle('carrying',carrying);
    ui.action.classList.toggle('ready',Boolean(nearFood||nearHome));
    ui.call.classList.toggle('ready',ready);
    ui.danger.dataset.guard=sweeper.mode;
    ui.danger.dataset.cat=cat.mode;
    specialHud();
    if(!paused && round.phase==='play') SOUND.scene(sweeper.mode==='chase'?'chase':'play');
  }
  const rect=(color,x,y,w,h)=>{ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h);};
  function shadow(x,y,w) {
    rect('#996b6b',x-w/2+2,y-2,w-4,5);
    rect('#aa7770',x-w/2,y-1,w,3);
    rect('#9b6d6b',x-w/2+1,y,w-2,1);
  }
  function sign(x,y,symbol) {
    rect('#372b40',x-5,y-6,10,11);
    rect('#372b40',x-3,y-7,6,13);
    rect(symbol==='!'?'#ffe590':'#a4d4ad',x-3,y-5,6,8);
    if(symbol==='!') {
      rect('#a35053',x-1,y-4,2,4); rect('#a35053',x-1,y+1,2,1);
    } else {
      rect('#3b6762',x-2,y-2,4,2); rect('#3b6762',x-1,y-3,2,4);
    }
  }
  function diamond(x,y,tone) {
    rect('#593d50',x-4,y-1,9,3); rect('#593d50',x-2,y-3,5,7);
    rect(tone,x-3,y,7,1); rect(tone,x-1,y-2,3,5);
  }
  function draw() {
    const {p,cat,sweeper,people,birds,meals,time}=round;
    scene.frame(ctx,reducedMotion?0:time);
    shadow(home.x,home.y,27);
    ART.draw(ctx,'nest',home.x,home.y+2);
    if(round.food>0) ART.draw(ctx,'fries',home.x-2,home.y-3);
    if(round.food>1) ART.draw(ctx,'fries',home.x+4,home.y-3);
    const flash=Math.floor(time*3)%2;
    if(round.carrying || !round.moved) diamond(home.x,home.y-19-flash,'#ffdc83');
    if(round.target) diamond(round.target.x,round.target.y,'#f9d9a0');
    paintOrder.length=0;
    for(const o of cache) paintOrder.push(o);
    for(const a of people) paintOrder.push({y:a.y,person:a});
    for(const b of birds) paintOrder.push({y:b.y,bird:b});
    paintOrder.push({y:p.y,player:p},{y:sweeper.y,guard:sweeper},{y:cat.y,cat});
    paintOrder.sort((a,b)=>a.y-b.y);
    for(const item of paintOrder) {
      if(item.image) {
        ctx.drawImage(item.image,item.x-35,item.y-59);
        if(item.type==='table' && !meals[item.kind].taken) {
          ART.draw(ctx,'fries',item.x-3,item.y-12);
          if(flash && !round.carrying && between(p,item)<55) rect('#fff4b4',item.x+5,item.y-24,2,2);
        }
      } else if(item.person) {
        const a=item.person;
        shadow(a.x,a.y,13);
        ART.draw(ctx,currentPose(a)||'person',a.x,a.y,{frame:a.moving?Math.floor(time*8):0,flip:a.flip,variant:a.variant});
        if(a.distracted) sign(a.x,a.y-39,'+');
        else if(round.time<(a.anger||0)) sign(a.x,a.y-39,'!');
      } else if(item.bird) {
        const b=item.bird;
        const flying=currentPose(b)==='flap';
        shadow(b.x,b.y,13);
        ART.draw(ctx,flying?'flap':'ally',b.x,b.y-(flying?6:0),{frame:Math.floor(time*(b.moving?11:2)),flip:b.flip,variant:b.variant});
        if(!b.recruited && between(b,p)<HEARING && flash) sign(b.x,b.y-24,'+');
      } else if(item.player) {
        const excited=sweeper.mode==='chase' || cat.mode==='leap';
        const pose=currentPose(p)||(p.moving?(excited&&Math.floor(time*10)%3===0?'flap':'walk'):'pigeon');
        shadow(p.x,p.y,18);
        ART.draw(ctx,pose,p.x,p.y,{frame:Math.floor(time*12),flip:p.flip});
        if(round.carrying) {
          const cargoX=p.x+(p.flip?-10:10);
          if(['courier','distraction','finale','wind'].includes(mission.mode)) DISTRICTS.drawObject(ctx,mission.mode==='wind'?'twig':'parcel',cargoX,p.y-7);
          else ART.draw(ctx,'fries',cargoX,p.y-7);
        }
        rect('#4b4660',p.x-3,p.y+4,7,2);
        rect('#94e2b1',p.x-2,p.y+4,5,1);
      } else if(item.guard) {
        const g=sweeper, chasing=g.mode==='chase';
        shadow(g.x,g.y,19);
        ART.draw(ctx,chasing?'chase':'sweeper',g.x,g.y,{frame:g.moving?Math.floor(time*(chasing?12:6)):0,flip:g.flip});
        if(g.mode!=='patrol') sign(g.x,g.y-42,'!');
      } else {
        const leap=cat.mode==='leap', crouch=cat.mode==='crouch';
        shadow(cat.x,cat.y,19);
        ART.draw(ctx,leap||crouch?'pounce':'cat',cat.x,cat.y-(leap?5:0),{frame:Math.floor(time*(cat.moving?10:2)),flip:cat.flip});
        if(leap||crouch) sign(cat.x,cat.y-24,'!');
      }
    }
    drawJob();
    for(const f of round.particles) {
      if(f.type==='feather') ART.draw(ctx,'feather',f.x,f.y);
      else rect(f.type==='gold'?'#ffdc83':'#efbd8b',f.x,f.y,f.age<.2?3:2,2);
    }
  }
  function setupJob() {
    const mode=mission.mode;
    const job={stage:0,alerts:0,flightUntil:0,flightReady:0,capture:null,signal:null,peckAt:0};
    job.flags=[{x:69,y:166,progress:0},{x:175,y:239,progress:0},{x:276,y:158,progress:0}];
    job.markers=mode==='lure'?[{x:95,y:245},{x:252,y:174}]:[{x:mode==='courier'?273:218,y:mode==='courier'?166:252}];
    job.cage={x:190,y:112,hits:0,open:false};
    job.lever={x:62,y:109};
    const tokens={distraction:{x:93,y:130},courier:{x:63,y:110},wind:{x:274,y:144},finale:{x:256,y:191}};
    job.token=tokens[mode]?{...tokens[mode],taken:false}:null;
    job.cart={x:174,y:205,type:'cart'};
    job.rival=actor(272,174,[[276,158],[175,239],[69,166]],2);
    job.rival.fleeUntil=0;
    round.job=job;
    if(!['steal','quiet'].includes(mode)) round.meals.forEach(m=>m.taken=true);
    if(mode==='quiet') round.meals.forEach((m,i)=>m.taken=i!==1);
    if(mode==='escort') {
      round.birds=[actor(70,113,[[70,113]],0),actor(273,169,[[273,169]],1)];
      round.birds.forEach(b=>b.escort=true);
    }
    if(mode!=='escort') {
      for(let i=0;i<Math.min(3,kit.flock+Number(kit.scout)+Number(kit.courier)+Number(kit.protector));i++) {
        const b=actor(34+i*15,310,[[34+i*15,310]],i);
        b.recruited=true;
        round.birds.push(b);
      }
    }
    notice(jobHint(),4);
  }
  function jobHint() {
    const mode=mission.mode, job=round.job;
    if(round.carrying) return ['courier','wind'].includes(mode)&&!job.markers[0].done?'Пройди через зелёную метку.':'Груз в клюве. Возвращайся в гнездо.';
    const hints={steal:'Укради две порции и принеси в гнездо.',distraction:'Отвлеки людей стаей у левого столика.',courier:'Забери письмо у кафе слева.',rescue:job.cage.open?'Доведи спасённого голубя до гнезда.':'Открой клетку тремя ударами клюва.',territory:'Займи три флажка вместе с союзником.',wind:'Забери ветки у правого прилавка.',quiet:'Средний прилавок открывается по зелёной метке.',lure:job.markers.every(m=>m.done)?'Оба обхода выполнены. Возвращайся домой.':'Свистни у метки и отойди с пути.',escort:job.markers[0].done?'Веди обоих голубей домой.':'Позови двух голубей и проведи через метку.',finale:!job.lever.open?'Открой задвижку слева.':!job.cage.open?'Освободи своего из клетки.':'Собери двух союзников и забери большой ящик.'};
    return hints[mode];
  }
  function nearbyMarker() { return nearest(round.job.markers.filter(m=>!m.done),round.p,25); }
  function hasRival() { return ['territory','escort','finale'].includes(mission.mode); }
  function fly() {
    if(paused||round.phase!=='play'||!kit.flight) return;
    if(round.time<round.job.flightReady) return;
    round.job.flightUntil=round.time+.75;
    round.job.flightReady=round.time+Math.max(3,6-kit.wings);
    SOUND.effect('flutter');
    setPose(round.p,'flap',.75);
  }
  function jobAction() {
    const {p,job}=round, mode=mission.mode;
    if(mode==='steal'||mode==='quiet') {
      if(mode==='quiet'&&!round.carrying&&availableMeal(STEAL)&&round.time%8>3) {
        notice('Прилавок закрыт. Дождись зелёной метки.',1.5);
        return true;
      }
      return false;
    }
    if(mode==='territory') {
      const flag=nearest(job.flags.filter(f=>!f.done),p,23);
      if(flag) {
        if(!followers().length) notice('Для захвата точки нужен союзник.');
        else {job.capture=flag;notice('Удерживай место рядом с флажком.',2);}
      } else notice('Подойди к незанятому флажку.');
      return true;
    }
    if(mode==='lure') {
      const marker=nearbyMarker();
      if(marker) {
        round.sweeper.mode='investigate';
        round.sweeper.target=marker;
        round.sweeper.interest=round.time+20;
        job.signal=marker;
        SOUND.effect('coo');
        notice('Дворник идёт на свист. Отойди с его пути!');
      } else if(job.markers.every(m=>m.done)&&between(p,home)<25) finish('win');
      else notice('Свистни у метки. Потом отойди в сторону.');
      return true;
    }
    if(mode==='rescue'||mode==='finale') {
      if(mode==='finale'&&!job.lever.open&&between(p,job.lever)<25) {
        job.lever.open=true;job.stage++;
        SOUND.effect('peck');notice('Задвижка открыта. Теперь освободи своего.');
        return true;
      }
      if(between(p,job.cage)<26&&!job.cage.open) {
        if(mode==='finale'&&!job.lever.open) {notice('Сначала открой задвижку у левого прилавка.');return true;}
        if(round.time<job.peckAt) return true;
        job.peckAt=round.time+.28;
        job.cage.hits++;
        SOUND.effect('peck');setPose(p,'peck',.22);
        if(job.cage.hits===3) {
          job.cage.open=true;job.stage++;
          const saved=actor(job.cage.x+16,job.cage.y+8,[],2);
          saved.recruited=true;saved.rescued=true;
          round.birds.push(saved);
          SOUND.effect('coo');notice('Свободен! Доведи его до гнезда.');
        } else notice('Замок поддаётся. Клюнь ещё раз.');
        return true;
      }
      if(mode==='rescue') {
        if(job.cage.open&&between(p,home)<26&&round.birds.some(b=>b.rescued&&between(b,home)<45)) finish('win');
        else notice(job.cage.open?'Доведи освобождённого голубя до гнезда.':'Подойди к клетке у кафе.');
        return true;
      }
    }
    if(mode==='escort') {
      if(between(p,home)<26&&round.birds.every(b=>b.escort&&b.checked&&between(b,home)<45)) finish('win');
      else notice('Собери обоих, проведи через метку, затем вернись домой.');
      return true;
    }
    if(round.carrying&&between(p,home)<25) {
      if(['courier','wind'].includes(mode)&&!job.markers[0].done) {notice('Сначала пройди через отмеченную точку.');return true;}
      round.food++;round.carrying=false;finish('win');
      return true;
    }
    if(job.token&&!job.token.taken&&between(p,job.token)<28) {
      if(mode==='distraction'&&!round.diversion?.arrived) {notice('Сначала отвлеки людей стаей у столика.');return true;}
      if(mode==='finale'&&(!job.cage.open||followers().length<2)) {notice('Для большого ящика нужны два союзника и открытая клетка.');return true;}
      job.token.taken=true;round.carrying=true;job.stage++;
      SOUND.effect('steal');setPose(p,'peck',.25);
      if(mode==='courier'||mode==='finale') alertSweeper(p,true);
      notice('Груз в клюве. Следуй к метке и возвращайся домой.');
      return true;
    }
    notice(jobHint(),3);
    return true;
  }
  function updateJob(dt) {
    const {job,p,time}=round, mode=mission.mode;
    if(mission.district==='market') {
      job.cart.x=174+68*Math.sin(time*(mission.variant ? 0.9 : 0.55));
      if(p.x>202&&p.x<235&&p.y>215&&p.y<285&&time>job.flightUntil) {
        p.y=clamp(p.y-(mission.variant?29:18)*dt,92,319);
      }
      if(between(p,job.cart)<18&&time>job.flightUntil) {
        p.y+=p.y<job.cart.y?-2:2;
        round.target=null;
        notice('Тележка! Обойди её или перелети.',1);
      }
    }
    if(hasRival()) {
      const rival=job.rival;
      rival.moving=false;
      if(time<rival.fleeUntil) approach(rival,{x:301,y:305},72,dt);
      else if(between(rival,p)<62) approach(rival,p,mission.variant?62:48,dt,6);
      else patrol(rival,27,dt);
      if(between(rival,p)<9&&time>job.flightUntil&&time>rival.fleeUntil) finish('rival');
    }
    if(mode==='territory'&&job.capture) {
      const flag=job.capture;
      if(between(p,flag)<25&&followers().some(b=>between(b,flag)<50)&&between(job.rival,flag)>28) {
        flag.progress+=dt/2.2;
        if(flag.progress>=1) {flag.done=true;job.capture=null;SOUND.effect('deliver');}
      } else if(between(p,flag)>30) {flag.progress=0;job.capture=null;}
      if(job.flags.every(f=>f.done)) finish('win');
    }
    if(['courier','wind'].includes(mode)&&round.carrying&&!job.markers[0].done&&between(p,job.markers[0])<23) {
      job.markers[0].done=true;job.stage++;SOUND.effect('deliver');
      notice('Отметка получена. Теперь в гнездо!');
    }
    if(mode==='escort') {
      for(const b of round.birds) if(b.escort&&b.recruited&&between(b,job.markers[0])<30) b.checked=true;
      if(round.birds.every(b=>b.checked)&&!job.markers[0].done) {
        job.markers[0].done=true;SOUND.effect('deliver');notice('Все прошли. Веди стаю домой.');
      }
    }
  }
  function specialHud() {
    const {job,p,time}=round,mode=mission.mode;
    let count=round.food, label='', ready=false;
    if(['courier','wind','finale'].includes(mode)) count=job.stage;
    if(mode==='territory') {
      count=job.flags.filter(f=>f.done).length;
      if(nearest(job.flags.filter(f=>!f.done),p,23)) {label='ЗАНЯТЬ';ready=true;}
    }
    if(mode==='lure') {
      count=job.markers.filter(m=>m.done).length;
      if(nearbyMarker()) {label='СВИСТ';ready=true;}
    }
    if((mode==='rescue'||mode==='finale')&&!job.cage.open&&between(p,job.cage)<26) {label='ОТКРЫТЬ';ready=true;}
    if(mode==='finale'&&!job.lever.open&&between(p,job.lever)<25) {label='ЗАДВИЖКА';ready=true;}
    if(job.token&&!job.token.taken&&between(p,job.token)<28) {label='ЗАБРАТЬ';ready=true;}
    if(mode==='escort') count=round.birds.filter(b=>b.checked).length;
    if(['rescue','escort','lure'].includes(mode)&&between(p,home)<26) {label='В ГНЕЗДО';ready=true;}
    if(round.carrying&&between(p,home)<25) {label='В ГНЕЗДО';ready=true;}
    if(mode==='quiet'&&!round.carrying&&availableMeal(STEAL)&&time%8>3) {label='ЗАКРЫТО';ready=false;}
    if(label) ui['action-label'].textContent=T(label);
    if(!['steal','quiet'].includes(mode)) ui.loot.textContent=count+'/'+mission.goal+(round.carrying?' +':'');
    ui.action.classList.toggle('ready',ready||Boolean(!label&&ui.action.classList.contains('ready')));
    const ability=document.getElementById('ability');
    ability.hidden=!kit.flight;
    const cooldown=Math.max(0,Math.ceil(job.flightReady-time));
    ability.disabled=cooldown>0;
    ability.textContent=cooldown?T('ВЗЛЁТ')+' '+cooldown:T('ВЗЛЁТ');
    if(round.time>=round.messageUntil&&mission.mode!=='steal') ui.tip.textContent=T(jobHint());
  }
  function drawJob() {
    const {job,time}=round,mode=mission.mode;
    if(kit.scout) {
      const g=round.sweeper;
      ctx.save();ctx.globalAlpha=.13;ctx.fillStyle='#fff0ad';
      ctx.beginPath();ctx.moveTo(g.x,g.y);ctx.arc(g.x,g.y,68,g.angle-.7,g.angle+.7);ctx.closePath();ctx.fill();ctx.restore();
    }
    if(mode==='territory') for(const f of job.flags) DISTRICTS.drawObject(ctx,'flag',f.x,f.y,{friendly:f.done,progress:f.progress});
    if(mode==='rescue'||mode==='finale') DISTRICTS.drawObject(ctx,'cage',job.cage.x,job.cage.y,{open:job.cage.open,progress:job.cage.hits/3});
    if(mode==='finale') DISTRICTS.drawObject(ctx,'sign',job.lever.x,job.lever.y,{friendly:job.lever.open});
    if(job.token&&!job.token.taken) DISTRICTS.drawObject(ctx,mode==='wind'?'twig':'parcel',job.token.x,job.token.y-6);
    if(['courier','wind','escort','lure'].includes(mode)) for(const marker of job.markers) {
      if(!marker.done) diamond(marker.x,marker.y,'#8fd0bc');
      else rect('#8fd0bc',marker.x-4,marker.y,8,2);
    }
    if(mode==='quiet') DISTRICTS.drawObject(ctx,'sign',176,125,{friendly:time%8<3});
    if(mission.district==='market') DISTRICTS.drawObject(ctx,'cart',job.cart.x,job.cart.y);
    if(hasRival()) {
      const r=job.rival;shadow(r.x,r.y,17);
      ART.draw(ctx,'ally',r.x,r.y,{variant:2,frame:Math.floor(time*11),flip:r.flip});
      sign(r.x,r.y-26,'!');
    }
    if(kit.nest>0) {
      rect('#d6b16b',home.x-13,home.y+3,26,2);
      for(let i=0;i<kit.nest;i++) rect('#f3dfb6',home.x-6+i*7,home.y-6,4,3);
    }
    if(kit.nest>1) {
      rect('#79606c',home.x-17,home.y-27,2,28);rect('#79606c',home.x+17,home.y-27,2,28);
      rect('#78998b',home.x-18,home.y-30,38,5);rect('#bdd3ad',home.x-17,home.y-30,36,1);
    }
  }

  function start() {
    if(!raf && !paused && !document.hidden && round.phase==='play') raf=requestAnimationFrame(loop);
  }
  function loop(now) {
    raf=0;
    if(paused || document.hidden || round.phase!=='play') return;
    const dt=lastFrame?Math.min((now-lastFrame)/1000,.05):0;
    lastFrame=now;
    tick(dt);
    if(now-lastPaint>=28 || round.phase!=='play') {
      draw();
      lastPaint=now;
    }
    if(now-lastHud>=90) { updateHud(); lastHud=now; }
    start();
  }
  function clearInput() {
    keys.clear();
    joystick.id=null; joystick.x=0; joystick.y=0; mapTouch=null;
    ui.joystick.style.setProperty('--dx','0px');
    ui.joystick.style.setProperty('--dy','0px');
  }
  function stick(event) {
    const bounds=ui.joystick.getBoundingClientRect();
    const dx=event.clientX-bounds.left-bounds.width/2;
    const dy=event.clientY-bounds.top-bounds.height/2;
    const length=Math.hypot(dx,dy);
    const power=clamp((length-5)/22,0,1);
    joystick.x=length?dx/length*power:0;
    joystick.y=length?dy/length*power:0;
    ui.joystick.style.setProperty('--dx',String(joystick.x*22)+'px');
    ui.joystick.style.setProperty('--dy',String(joystick.y*22)+'px');
  }
  ui.joystick.addEventListener('pointerdown',event=>{
    if(paused||round.phase!=='play'||joystick.id!==null) return;
    event.preventDefault();
    joystick.id=event.pointerId;
    ui.joystick.setPointerCapture(event.pointerId);
    stick(event);
  });
  ui.joystick.addEventListener('pointermove',event=>{
    if(event.pointerId===joystick.id) stick(event);
  });
  for(const type of ['pointerup','pointercancel','lostpointercapture']) {
    ui.joystick.addEventListener(type,event=>{
      if(event.pointerId!==joystick.id) return;
      joystick.id=null; joystick.x=0; joystick.y=0;
      ui.joystick.style.setProperty('--dx','0px');
      ui.joystick.style.setProperty('--dy','0px');
    });
  }
  function moveTo(event) {
    const bounds=canvas.getBoundingClientRect();
    const x=clamp((event.clientX-bounds.left)*W/bounds.width,12,308);
    const y=clamp((event.clientY-bounds.top)*H/bounds.height,92,319);
    round.target={x,y,until:round.time+4.2};
  }
  canvas.addEventListener('pointerdown',event=>{
    if(paused||round.phase!=='play'||event.button!==0) return;
    event.preventDefault();
    mapTouch=event.pointerId;
    canvas.setPointerCapture(event.pointerId);
    moveTo(event);
  });
  canvas.addEventListener('pointermove',event=>{
    if(mapTouch===event.pointerId) moveTo(event);
  });
  for(const type of ['pointerup','pointercancel','lostpointercapture']) {
    canvas.addEventListener(type,event=>{if(mapTouch===event.pointerId) mapTouch=null;});
  }
  window.addEventListener('keydown',event=>{
    if(paused||round.phase!=='play'||event.metaKey||event.altKey||event.ctrlKey) return;
    const {code}=event;
    if(motionKeys.has(code)) {
      event.preventDefault();
      keys.add(code);
    } else if(['Space','KeyE','KeyQ','KeyR','KeyF'].includes(code) && !(event.target instanceof HTMLButtonElement && code==='Space')) {
      event.preventDefault();
      if(event.repeat) return;
      if(code==='KeyR') { reset(); SOUND.scene('play'); }
      else if(code==='KeyQ') useFlock();
      else if(code==='KeyF') fly();
      else useAction();
    }
  });
  window.addEventListener('keyup',event=>keys.delete(event.code));
  window.addEventListener('blur',clearInput);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden) {
      cancelAnimationFrame(raf);
      raf=0; lastFrame=0;
      clearInput();
    } else start();
  });
  ui.action.addEventListener('click',useAction);
  ui.call.addEventListener('click',useFlock);
  document.getElementById('ability').addEventListener('click',fly);
  window.GAME=Object.freeze({
    newRun(selected=mission) { mission=selected;paused=false; reset(); SOUND.scene('play'); },
    pause() {
      paused=true;
      cancelAnimationFrame(raf);
      raf=0; lastFrame=0;
      round.target=null;
      clearInput();
    },
    resume() { paused=false; lastFrame=0; updateHud(); start(); },
    setReducedMotion(value) { reducedMotion=Boolean(value); },
    status() { return {paused,phase:round.phase,mission:mission.id}; }
  });
  window.addEventListener('language-changed',()=>{
    document.querySelector('.mission strong').textContent=I18N.language()==='en'?mission.en:mission.title;
    document.querySelector('.mission span').textContent=T(mission.district==='market'?'РЫНОК У КАНАЛА':'ВОКЗАЛЬНАЯ ПЛОЩАДЬ');
    updateHud();
  });
  reset();
})();
