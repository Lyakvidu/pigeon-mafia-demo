'use strict';
(() => {
  const app=document.getElementById('app');
  const byId=id=>document.getElementById(id);
  const screenIds=['menu','pause','settings','help','credits'];
  const defaults={music:35,effects:65,hints:true,leftHanded:false,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches};
  let settings={...defaults}, screen='menu', backTo='menu', hasRun=false;
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
    clickSound();
    hasRun=true;
    show('playing',false);
    GAME.newRun();
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
  byId('play').addEventListener('click',startRun);
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
  window.addEventListener('game-ended',event=>{
    drawResult(event.detail.outcome);
    show('result');
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
  drawTitle();
  applySettings();
  show('menu',false);
})();
