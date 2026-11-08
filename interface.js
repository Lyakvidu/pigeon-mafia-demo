'use strict';
(() => {
  const app=document.getElementById('app');
  const byId=id=>document.getElementById(id);
  const screenIds=['menu','pause','settings','help','credits','board','nest'];
  const defaults={music:35,effects:65,hints:true,leftHanded:false,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches};
  let settings={...defaults}, screen='menu', backTo='menu', hasRun=false, selected=CAMPAIGN[0], activeMission=CAMPAIGN[0], saving=false;
  try {
    const saved=JSON.parse(localStorage.getItem('pigeon-mafia-settings')||'{}');
    for(const key of ['music','effects']) if(Number.isFinite(saved[key])) settings[key]=Math.max(0,Math.min(100,saved[key]));
    for(const key of ['hints','leftHanded','reducedMotion']) if(typeof saved[key]==='boolean') settings[key]=saved[key];
  } catch {}
  function applySettings() {
    SOUND.setLevels({music:settings.music/100,effects:settings.effects/100});
    document.body.classList.toggle('no-hints',!settings.hints);
    document.body.classList.toggle('left-handed',settings.leftHanded);
    document.body.classList.toggle('reduced-motion',settings.reducedMotion);
    GAME.setReducedMotion(settings.reducedMotion);
    for(const key of ['music','effects']) {
      byId(key).value=settings[key];
      byId(key+'-value').value=settings[key]+'%';
      byId(key).style.setProperty('--fill',settings[key]+'%');
    }
    byId('hints').checked=settings.hints;
    byId('left-handed').checked=settings.leftHanded;
    byId('reduced-motion').checked=settings.reducedMotion;
    try { localStorage.setItem('pigeon-mafia-settings',JSON.stringify(settings)); } catch {}
  }
  function show(next,focus=true) {
    screen=next;
    if(next==='board') renderBoard();
    if(next==='nest') renderNest();
    app.dataset.screen=next;
    const inGame=next==='playing'||next==='result';
    byId('game-screen').hidden=!inGame;
    byId('game-screen').inert=!inGame;
    for(const name of screenIds) byId(name+'-screen').hidden=next!==name;
    byId('continue').hidden=!hasRun||GAME.status().phase!=='play';
    byId('play').classList.toggle('primary',byId('continue').hidden);
    if(next!=='playing') GAME.pause();
    SOUND.scene(next==='playing'?'play':next==='pause'?'paused':next==='result'?'silent':'menu');
    if(focus) {
      const area=inGame?byId(next==='result'?'result':'game-screen'):byId(next+'-screen');
      area.querySelector('button:not([hidden])')?.focus({preventScroll:true});
    }
  }
  function clickSound() { SOUND.unlock().then(()=>SOUND.effect('click')); }
  function startRun() {
    if(saving) return;
    clickSound();
    hasRun=true;
    show('playing',false);
    GAME.newRun(activeMission);
  }
  function resume() {
    clickSound();
    show('playing',false);
    GAME.resume();
  }
  function pause() {
    if(screen!=='playing') return;
    show('pause');
  }
  function open(name) {
    backTo=screen;
    clickSound();
    show(name);
  }
  byId('play').addEventListener('click',async()=>{await PROGRESS.ready;selected=PROGRESS.next();clickSound();show('board');});
  byId('restart').addEventListener('click',startRun);
  byId('again').addEventListener('click',startRun);
  byId('resume').addEventListener('click',resume);
  byId('continue').addEventListener('click',resume);
  byId('pause').addEventListener('click',pause);
  for(const id of ['home','result-menu']) byId(id).addEventListener('click',()=>{clickSound();show('menu');});
  byId('open-settings').addEventListener('click',()=>open('settings'));
  byId('pause-settings').addEventListener('click',()=>open('settings'));
  byId('open-help').addEventListener('click',()=>open('help'));
  byId('open-credits').addEventListener('click',()=>open('credits'));
  document.querySelectorAll('[data-back]').forEach(button=>button.addEventListener('click',()=>{clickSound();show(backTo);}));
  for(const key of ['music','effects']) {
    byId(key).addEventListener('input',()=>{
      settings[key]=Number(byId(key).value);
      applySettings();
      SOUND.unlock();
    });
    byId(key).addEventListener('change',()=>SOUND.effect(key==='effects'?'coo':'click'));
  }
  for(const [id,key] of [['hints','hints'],['left-handed','leftHanded'],['reduced-motion','reducedMotion']]) {
    byId(id).addEventListener('change',()=>{settings[key]=byId(id).checked;applySettings();clickSound();});
  }
  byId('defaults').addEventListener('click',()=>{settings={...defaults};applySettings();clickSound();});
  window.addEventListener('game-ended',async event=>{
    const {outcome,mission,time}=event.detail;
    drawResult(outcome);
    show('result');
    if(outcome!=='win') return;
    saving=true;
    byId('next-order').disabled=true;
    byId('again').disabled=true;
    try {
      const receipt=await PROGRESS.complete(mission,{time});
      byId('reward').textContent=receipt.first?'+'+receipt.reward+' '+T('крошек')+' · '+T('Рекорд')+' '+receipt.best.toFixed(1)+' '+T('с')+' · '+medalName(receipt.medal):T('Награда уже получена')+' · '+T('Рекорд')+' '+receipt.best.toFixed(1)+' '+T('с');
    } catch(e) {byId('reward').textContent=T(e.message);showSaveError();}
    saving=false;byId('next-order').disabled=false;byId('again').disabled=false;
  });
  window.addEventListener('blur',pause);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden) { pause(); SOUND.suspend(); }
    else SOUND.resume();
  });
  window.addEventListener('keydown',event=>{
    if(event.ctrlKey||event.altKey||event.metaKey) return;
    if(event.code==='Escape') {
      event.preventDefault();
      if(screen==='playing') pause();
      else if(screen==='pause') resume();
      else if(['board','nest'].includes(screen)) show('menu');
      else if(['settings','help','credits'].includes(screen)) show(backTo);
      return;
    }
    if(screen==='playing'||event.target instanceof HTMLInputElement) return;
    if(['ArrowUp','ArrowDown'].includes(event.code)) {
      event.preventDefault();
      const parent=screen==='result'?byId('result'):byId(screen+'-screen');
      const items=[...parent.querySelectorAll('button:not([hidden]),a[href],input')].filter(el=>el.getClientRects().length);
      const index=items.indexOf(document.activeElement);
      const next=(index+(event.code==='ArrowDown'?1:-1)+items.length)%items.length;
      items[next]?.focus();
      SOUND.effect('click');
    }
  });

  function sprite(c,name,x,y,scale=1,options={}) {
    c.save();c.translate(x,y);c.scale(scale,scale);ART.draw(c,name,0,0,options);c.restore();
  }
  for(const node of document.querySelectorAll('canvas[data-art]')) {
    const c=node.getContext('2d');
    c.imageSmoothingEnabled=false;
    ART.draw(c,node.dataset.art,node.width/2,node.height-1,{variant:1});
  }
  function drawResult(outcome) {
    const c=byId('result-art').getContext('2d');
    c.clearRect(0,0,120,50);
    if(outcome==='win') {
      sprite(c,'ally',25,45,1.4);sprite(c,'pigeon',60,43,1.8);sprite(c,'ally',95,45,1.4,{flip:true,variant:2});
      sprite(c,'fries',63,44,1.5);
    } else {
      sprite(c,'alarm',43,44,1.5);
      sprite(c,outcome==='cat'?'cat':'sweeper',86,45,1.1,{flip:true});
    }
  }
  function drawTitle() {
    const c=byId('title-art').getContext('2d');
    c.imageSmoothingEnabled=false;
    const r=(color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
    const poly=(color,points)=>{
      c.fillStyle=color;c.beginPath();
      points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
      c.closePath();c.fill();
    };
    r('#1b2031',0,0,320,158);
    r('#2a2b41',18,27,287,68);
    r('#343247',8,45,307,50);
    r('#49394b',10,63,300,39);
    r('#75505a',15,79,294,26);
    r('#c77c67',23,96,276,8);
    // Low clouds and warm windows punctuate the silhouette of the city.
    r('#4e4154',28,37,29,3);r('#4e4154',37,34,29,3);
    r('#675263',225,55,38,2);r('#675263',212,57,31,3);
    r('#d3ae8d',259,29,11,10);r('#1b2031',256,26,10,9);
    for(const [x,y,w,h] of [[18,63,23,47],[44,52,30,57],[76,72,24,40],[102,50,36,60],[141,64,23,48],[166,76,35,35],[207,59,29,52],[242,72,25,40],[269,48,28,61],[302,73,18,39]]) {
      r('#292b40',x,y,w,h);r('#383347',x+2,y+3,w-4,2);
      for(let yy=y+9;yy<y+h-4;yy+=9) for(let xx=x+5;xx<x+w-5;xx+=8) {
        r((xx+yy)%3?'#77626b':'#e3aa79',xx,yy,3,4);
      }
    }
    r('#282a3e',57,39,3,15);r('#282a3e',51,42,15,2);
    r('#292b40',114,40,3,12);r('#292b40',107,41,15,2);
    r('#292b40',281,36,3,15);r('#292b40',276,39,13,2);
    poly('#101827',[[0,125],[35,112],[77,117],[103,105],[153,117],[210,106],[263,115],[320,103],[320,158],[0,158]]);
    // A brick cornice makes a stage for the three birds.
    poly('#5f5262',[[8,131],[38,118],[289,118],[313,128],[289,139],[26,139]]);
    r('#b09889',38,118,251,3);r('#d1b599',47,118,230,1);
    r('#88717a',28,128,267,7);r('#b29a8c',29,128,265,2);
    r('#534857',28,135,267,17);
    for(let y=138;y<153;y+=6) {
      for(let x=28+(y%12?9:0);x<295;x+=18) {
        r('#705766',x,y,16,4);r('#8e6b71',x,y,16,1);
      }
    }
    r('#26293b',24,152,275,6);
    // Original game sprites are drawn at exact integer scales.
    sprite(c,'ally',76,126,2,{variant:1});
    sprite(c,'pigeon',166,125,3);
    sprite(c,'ally',246,126,2,{variant:2,flip:true});
    sprite(c,'fries',195,104,2);
    sprite(c,'nest',122,132,1);
    // Windblown fries, crumbs and an improvised crown.
    r('#f2c779',99,128,3,2);r('#e6a460',223,126,4,2);r('#f2c779',234,130,2,1);
    r('#eebd6b',183,76,3,5);r('#eebd6b',188,74,3,7);r('#eebd6b',193,77,3,4);
    r('#ffe09a',183,81,13,2);r('#ac7655',183,83,13,2);
    r('#92b8ae',47,91,2,3);r('#92b8ae',45,93,6,1);
    r('#92b8ae',273,80,1,4);r('#92b8ae',271,82,5,1);
  }
  function showSaveError() {
    const message=PROGRESS.error();
    byId('save-error').hidden=!message;
    byId('save-error').textContent=T(message);
  }
  function renderWallet() {
    document.querySelectorAll('.wallet').forEach(el=>el.textContent=PROGRESS.state().crumbs+' '+T('крошек'));
  }
  function medalName(medal) {return T({gold:'Золото',silver:'Серебро',bronze:'Бронза'}[medal]);}
  function missionName(m) {return I18N.language()==='en'?m.en:m.title;}
  function renderBoard() {
    renderWallet();
    const list=byId('order-list');
    list.replaceChildren();
    const save=PROGRESS.state();
    const available=save.completed.territory?[...CAMPAIGN,...CHALLENGES]:CAMPAIGN;
    for(const [index,m] of available.entries()) {
      if(index===10){const heading=document.createElement('p');heading.className='eyebrow challenge-heading';heading.textContent=T('Испытания');list.append(heading);}
      const row=document.createElement('button');
      row.className='order-row'+(m.id===selected.id?' selected':'');
      row.disabled=!PROGRESS.unlocked(m);
      row.dataset.mission=m.id;
      row.setAttribute('aria-pressed',String(m.id===selected.id));
      const number=document.createElement('span');number.textContent=index<10?String(index+1).padStart(2,'0'):String(index-9);
      const name=document.createElement('span');name.textContent=missionName(m);
      const status=document.createElement('span');status.textContent=save.completed[m.id]?'':row.disabled?'—':'›';
      if(save.completed[m.id]){status.className='done-mark';status.setAttribute('aria-label',T('Выполнено'));}
      row.append(number,name,status);
      row.addEventListener('click',()=>{selected=m;SOUND.effect('click');renderBoard();});
      list.append(row);
    }
    byId('order-title').textContent=missionName(selected);
    byId('order-intro').textContent=T(selected.intro);
    byId('order-unlock').textContent=T(selected.unlock);
    const best=save.completed[selected.id];
    byId('order-record').textContent=best?T('Рекорд')+' '+best.best.toFixed(1)+' '+T('с')+' · '+medalName(best.medal)+' · '+T('Награда уже получена'):'+'+selected.reward+' '+T('крошек');
    byId('launch-order').disabled=!PROGRESS.unlocked(selected);
    showSaveError();
  }
  function renderNest() {
    renderWallet();
    const save=PROGRESS.state(), list=byId('upgrade-list');
    list.replaceChildren();
    for(const upgrade of UPGRADES) {
      const level=save.upgrades[upgrade.id],price=upgrade.prices[level];
      const row=document.createElement('div');row.className='upgrade-row';
      const title=document.createElement('h3');title.textContent=(I18N.language()==='en'?upgrade.en:upgrade.title)+' '+level+'/2';
      const description=document.createElement('p');description.textContent=T(upgrade.description);
      const buy=document.createElement('button');buy.className='text-button';buy.dataset.upgrade=upgrade.id;
      buy.textContent=price===undefined?T('Завершено'):T('Улучшить')+' · '+price;
      buy.disabled=price===undefined||save.crumbs<price;
      buy.addEventListener('click',async()=>{
        buy.disabled=true;
        try {await PROGRESS.buy(upgrade.id);SOUND.effect('deliver');byId('purchase-note').textContent=T('Улучшение сохранено.');}
        catch(e){byId('purchase-note').textContent=T(e.message);}
        renderNest();
      });
      row.append(title,description,buy);list.append(row);
    }
    const recruits=[];
    if(save.completed.rescue) recruits.push(T('Сизый — разведчик'));
    if(save.completed.wind) recruits.push(T('Рыжик — курьер'));
    if(save.completed.lure) recruits.push(T('Гром — защитник'));
    byId('flock-progress').textContent=recruits.length?recruits.join(' · '):T('Спасай голубей в заказах, чтобы расширить стаю.');
    const c=byId('nest-art').getContext('2d');c.clearRect(0,0,280,92);c.imageSmoothingEnabled=false;
    c.fillStyle='#524852';c.fillRect(10,75,260,8);c.fillStyle='#997365';c.fillRect(10,75,260,2);
    sprite(c,'nest',140,76,3);sprite(c,'pigeon',100,73,2);
    for(let i=0;i<recruits.length;i++)sprite(c,'ally',174+i*32,74,1.5,{variant:i});
    if(save.upgrades.nest>0){c.fillStyle='#ead5ab';c.fillRect(132,62,7,5);c.fillRect(143,60,7,5);}
    if(save.upgrades.nest>1){c.fillStyle='#788e80';c.fillRect(93,22,98,8);c.fillRect(96,29,4,46);c.fillRect(183,29,4,46);}
    showSaveError();
  }
  byId('open-nest').addEventListener('click',async()=>{await PROGRESS.ready;open('nest');});
  byId('board-nest').addEventListener('click',()=>show('nest'));
  byId('nest-orders').addEventListener('click',()=>show('board'));
  for(const id of ['board-home','nest-home'])byId(id).addEventListener('click',()=>show('menu'));
  byId('launch-order').addEventListener('click',()=>{
    if(!PROGRESS.unlocked(selected)) return;
    activeMission=selected;startRun();
  });
  byId('next-order').addEventListener('click',()=>{selected=PROGRESS.next();show('board');});
  window.addEventListener('progress-changed',()=>{
    showSaveError();
    if(screen==='board')renderBoard();
    if(screen==='nest')renderNest();
  });
  byId('language').value=I18N.language();
  byId('language').addEventListener('change',()=>{
    I18N.set(byId('language').value);
    if(screen==='board')renderBoard();
    if(screen==='nest')renderNest();
  });
  I18N.capture();
  PROGRESS.ready.then(showSaveError);
  drawTitle();
  applySettings();
  show('menu',false);
})();
