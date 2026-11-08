'use strict';
(() => {
  const app=document.getElementById('app');
  const byId=id=>document.getElementById(id);
  const screenIds=['menu','pause','settings','help','credits','board','nest'];
  const defaults={music:35,effects:65,hints:true,leftHanded:false,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches};
  let settings={...defaults}, screen='menu', backTo='menu', hasRun=false, selected=CAMPAIGN[0], activeMission=CAMPAIGN[0], saving=false;
  let progressReady=false, roofTimer=0;
  const isEnglish=()=>I18N.language()==='en';
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
    updateRoof();
    if(next!=='playing') GAME.pause();
    SOUND.scene(next==='playing'?'play':next==='pause'?'paused':next==='result'?'silent':'menu');
    if(focus) {
      const area=inGame?byId(next==='result'?'result':'game-screen'):byId(next+'-screen');
      area.querySelector('button:not([hidden])')?.focus({preventScroll:true});
    }
  }
  function canResume() {return hasRun&&GAME.status().phase==='play';}
  function updateRoof() {
    clearTimeout(roofTimer);
    if(screen!=='menu'||document.hidden) return;
    const save=PROGRESS.state();
    const done=CAMPAIGN.filter(m=>save.completed[m.id]).length;
    const next=canResume()?activeMission:PROGRESS.next();
    byId('continue').disabled=!progressReady||saving||(!canResume()&&!PROGRESS.unlocked(next));
    byId('continue-label').textContent=T(done||canResume()?'Продолжить дело':'Первое дело');
    byId('continue-job').textContent=missionName(next);
    byId('roof-progress').textContent=done+'/150 · '+(isEnglish()?'Jobs closed':'Дел закрыто');
    const canvas=byId('title-art');
    ROOF_ART.drawRoof(canvas,save);
    if(settings.reducedMotion) return;
    function stir() {
      if(screen!=='menu'||document.hidden||settings.reducedMotion) return;
      ROOF_ART.drawRoof(canvas,save,1);
      roofTimer=setTimeout(()=>{
        ROOF_ART.drawRoof(canvas,save,2);
        roofTimer=setTimeout(()=>{
          ROOF_ART.drawRoof(canvas,save);
          roofTimer=setTimeout(stir,3800);
        },240);
      },240);
    }
    roofTimer=setTimeout(stir,1800);
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
  byId('continue').addEventListener('click',()=>{
    if(canResume()) {resume();return;}
    const next=PROGRESS.next();
    if(!PROGRESS.unlocked(next)) return;
    activeMission=next;startRun();
  });
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
    updateRoof();
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
      const items=[...parent.querySelectorAll('button:not([disabled]),a[href],input')].filter(el=>el.getClientRects().length);
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
  function showSaveError() {
    const message=PROGRESS.error();
    byId('save-error').hidden=!message;
    byId('save-error').textContent=T(message);
  }
  function renderWallet() {
    document.querySelectorAll('.wallet').forEach(el=>el.textContent=PROGRESS.state().crumbs+' '+T('крошек'));
  }
  function medalName(medal) {return T({gold:'Золото',silver:'Серебро',bronze:'Бронза'}[medal]);}
  function missionName(m) {return isEnglish()?m.en:m.title;}
  const chapterThemes=[
    ['Первые налёты и сбор стаи','First heists and recruits'],['Передача грузов и разведка','Handoffs and scouting'],
    ['Задвижки и ремонт','Switches and repairs'],['Перелёты и ветер','Flight routes and wind'],
    ['Пути между крышами','Rooftop crossings'],['Укрытия и скрытность','Hideouts and stealth'],
    ['Спасение и сопровождение','Rescue and escort'],['Обмены на рынке','Market trades'],
    ['Работа в паре','Teamwork and plates'],['Борьба за территорию','Contested turf'],
    ['Сеть доставок','Delivery network'],['Восстановление проходов','Repair routes'],
    ['Толпы и отвлечения','Crowds and distractions'],['Финал депо','Depot finale'],['Дела между районами','Jobs across districts']
  ];
  function chooseOrder(list,save) {
    return list.find(m=>!save.completed[m.id]&&PROGRESS.unlocked(m))||list.find(m=>!save.completed[m.id])||list[0];
  }
  function renderDistricts(save,isChallenge) {
    const nav=byId('district-nav');
    for(const {id,x,y,ru,en} of ROOF_ART.districts) {
      const jobs=CAMPAIGN.filter(m=>m.district===id);
      const done=jobs.filter(m=>save.completed[m.id]).length;
      const open=jobs.some(PROGRESS.unlocked);
      let button=nav.querySelector(`[data-district="${id}"]`);
      if(!button) {
        button=document.createElement('button');button.className='district-pin';button.dataset.district=id;
        button.style.setProperty('--x',x/384*100+'%');button.style.setProperty('--y',y/218*100+'%');
        button.append(document.createElement('strong'),document.createElement('small'));
        button.addEventListener('click',()=>{
          if(selected.district!==id||selected.challenge||selected.id.startsWith('challenge-')) selected=chooseOrder(jobs,PROGRESS.state());
          SOUND.effect('click');renderBoard();
        });
        nav.append(button);
      }
      button.setAttribute('aria-pressed',String(!isChallenge&&selected.district===id));
      button.dataset.locked=String(!open);
      button.firstElementChild.textContent=isEnglish()?en:ru;
      button.lastElementChild.textContent=open?done+'/'+jobs.length:T('Закрыт');
    }
    byId('city-progress').textContent=CAMPAIGN.filter(m=>save.completed[m.id]).length+'/150 '+T('дел')+' · '+CHAPTERS.filter(c=>CAMPAIGN.filter(m=>m.chapter===c.id).every(m=>save.completed[m.id])).length+'/15 '+T('глав');
    byId('board-challenges').setAttribute('aria-pressed',String(isChallenge));
  }
  function renderBoard() {
    renderWallet();
    const list=byId('order-list');
    list.replaceChildren();
    const save=PROGRESS.state();
    const isChallenge=selected.id.startsWith('challenge-');
    const chapter=selected.chapter||1;
    const districtJobs=CAMPAIGN.filter(m=>m.district===selected.district);
    renderDistricts(save,isChallenge);
    const nav=byId('chapter-nav');nav.replaceChildren();
    const select=document.createElement('select');select.setAttribute('aria-label',I18N.language()==='en'?'Campaign chapter':'Глава кампании');
    for(const c of CHAPTERS.filter(c=>districtJobs.some(m=>m.chapter===c.id))) {
      const option=document.createElement('option');option.value=c.id;option.textContent=c.id+'. '+(isEnglish()?c.en:c.ru);select.append(option);
    }
    select.value=String(chapter);
    select.addEventListener('change',()=>{
      selected=chooseOrder(districtJobs.filter(m=>m.chapter===Number(select.value)),PROGRESS.state());
      renderBoard();nav.querySelector('select')?.focus({preventScroll:true});
    });
    if(!isChallenge) nav.append(select);
    const available=isChallenge?CHALLENGES:districtJobs.filter(m=>m.chapter===chapter);
    const chapterJobs=isChallenge?CHALLENGES:CAMPAIGN.filter(m=>m.chapter===chapter);
    byId('chapter-progress').textContent=(isChallenge?T('Испытания'):chapterThemes[chapter-1][isEnglish()?1:0])+' · '+chapterJobs.filter(m=>save.completed[m.id]).length+'/'+chapterJobs.length;
    for(const [index,m] of available.entries()) {
      const row=document.createElement('button');
      row.className='order-row'+(m.id===selected.id?' selected':'');
      const locked=!PROGRESS.unlocked(m);
      row.dataset.locked=String(locked);
      row.dataset.mission=m.id;
      row.setAttribute('aria-pressed',String(m.id===selected.id));
      const number=document.createElement('span');number.textContent=String(isChallenge?index+1:CAMPAIGN.indexOf(m)+1).padStart(2,'0');
      const name=document.createElement('span');name.textContent=missionName(m);
      const status=document.createElement('span');status.textContent=save.completed[m.id]?'':locked?'—':'›';
      if(save.completed[m.id]){status.className='done-mark';status.setAttribute('aria-label',T('Выполнено'));}
      row.append(number,name,status);
      row.addEventListener('click',()=>{
        selected=m;SOUND.effect('click');renderBoard();
        list.querySelector(`[data-mission="${m.id}"]`)?.focus({preventScroll:true});
        if(matchMedia('(max-width: 700px)').matches) byId('order-brief').scrollIntoView({block:'nearest'});
      });
      list.append(row);
    }
    byId('order-title').textContent=missionName(selected);
    const english=I18N.language()==='en';
    byId('order-intro').textContent=selected.steps?(english?selected.steps[0].map(n=>n.en):selected.steps[0].map(n=>n.ru)).join(english?' OR ':' ИЛИ ')+(english?' · Steps: ':' · Этапов: ')+selected.steps.length:T(selected.intro);
    if(selected.rules?.length){
      const rules={quiet:['Третья тревога сорвёт заказ','A third alarm fails the job'],pursuit:['Груз привлекает дворника','Cargo attracts the sweeper'],rival:['Район оспаривает соперник','A rival contests this district'],rush:['Тележка движется быстрее','The cart moves faster'],storm:['Сильный ветер','Strong wind'],crowd:['Толпа меняет маршруты','Crowds change their routes']};
      byId('order-intro').textContent+=' · '+selected.rules.map(rule=>rules[rule][english?1:0]).join(' · ');
    }
    const prereq=CAMPAIGN.find(m=>m.id===selected.requires)||(!isChallenge&&CAMPAIGN[CAMPAIGN.indexOf(selected)-1])||(isChallenge&&CAMPAIGN.find(m=>m.id==='territory'));
    const unlocked=PROGRESS.unlocked(selected);
    byId('order-unlock').textContent=!unlocked&&prereq?(english?'Opens after ':'Откроется после дела «')+missionName(prereq)+(english?'':'»'):english&&selected.unlockEn?selected.unlockEn:T(selected.unlock);
    byId('order-route').hidden=!selected.steps;
    byId('order-route-text').textContent=english&&selected.introEn?selected.introEn:selected.intro;
    const best=save.completed[selected.id];
    byId('order-record').textContent=best?T('Рекорд')+' '+best.best.toFixed(1)+' '+T('с')+' · '+medalName(best.medal)+' · '+T('Награда уже получена'):'+'+selected.reward+' '+T('крошек');
    byId('launch-order').disabled=!unlocked;
    showSaveError();
  }
  function renderNest() {
    renderWallet();
    const save=PROGRESS.state(), list=byId('upgrade-list');
    list.replaceChildren();
    for(const upgrade of UPGRADES) {
      const level=save.upgrades[upgrade.id],price=upgrade.prices[level];
      const row=document.createElement('div');row.className='upgrade-row';
      const title=document.createElement('h3');title.textContent=(I18N.language()==='en'?upgrade.en:upgrade.title)+' '+level+'/'+upgrade.prices.length;
      const description=document.createElement('p');description.textContent=I18N.language()==='en'&&upgrade.descriptionEn?upgrade.descriptionEn:T(upgrade.description);
      const buy=document.createElement('button');buy.className='text-button';buy.dataset.upgrade=upgrade.id;
      const locked=upgrade.requires&&!save.completed[upgrade.requires];
      buy.textContent=locked?(I18N.language()==='en'?'After chapter ':'После главы ')+Number(upgrade.requires.slice(1,3)):price===undefined?T('Завершено'):T('Улучшить')+' · '+price;
      buy.disabled=locked||price===undefined||save.crumbs<price;
      buy.addEventListener('click',async()=>{
        buy.disabled=true;
        try {await PROGRESS.buy(upgrade.id);SOUND.effect('deliver');byId('purchase-note').textContent=T('Улучшение сохранено.');}
        catch(e){byId('purchase-note').textContent=T(e.message);}
        renderNest();
      });
      row.append(title,description,buy);list.append(row);
    }
    const roles={rescue:'Сизый — разведчик',wind:'Рыжик — курьер',lure:'Гром — защитник'};
    const recruits=ROOF_ART.recruits(save).map(id=>T(roles[id]));
    byId('flock-progress').textContent=recruits.length?recruits.join(' · '):T('Спасай голубей в заказах, чтобы расширить стаю.');
    ROOF_ART.drawRoof(byId('nest-art'),save);
    showSaveError();
  }
  byId('open-nest').addEventListener('click',async()=>{await PROGRESS.ready;open('nest');});
  byId('board-nest').addEventListener('click',()=>show('nest'));
  byId('board-challenges').addEventListener('click',()=>{
    selected=chooseOrder(CHALLENGES,PROGRESS.state());SOUND.effect('click');renderBoard();
  });
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
    if(screen==='menu')updateRoof();
  });
  byId('language').value=I18N.language();
  byId('language').addEventListener('change',()=>{
    I18N.set(byId('language').value);
    if(screen==='board')renderBoard();
    if(screen==='nest')renderNest();
  });
  I18N.capture();
  PROGRESS.ready.then(()=>{progressReady=true;showSaveError();updateRoof();});
  ROOF_ART.drawCity(byId('city-art'));
  applySettings();
  show('menu',false);
})();
