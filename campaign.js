'use strict';
const CAMPAIGN = [
  {id:'fries', title:'Картошка фри', en:'French fry job', district:'square', mode:'steal', goal:2, reward:30, par:18, intro:'Укради две порции с любых столиков и принеси их в гнездо.', unlock:'Дальше — отвлечение прохожих стаей.'},
  {id:'distraction', title:'Шумная компания', en:'A noisy crowd', district:'square', mode:'distraction', goal:1, reward:40, par:12, intro:'Позови голубя. Отвлеки людей у левого столика и забери пакет, пока они смотрят на стаю.', unlock:'Дальше — доставка через всю площадь.'},
  {id:'courier', title:'Письмо на лапке', en:'Special delivery', district:'square', mode:'courier', goal:2, reward:45, par:20, intro:'Забери письмо у кафе, отметься у правой скамейки и вернись в гнездо. Дворник следит за курьером.', unlock:'Откроется короткий полёт — кнопка «Взлёт».'},
  {id:'rescue', title:'Своих не бросаем', en:'Leave no bird behind', district:'square', mode:'rescue', goal:1, reward:55, par:16, intro:'Трижды клюнь замок клетки. Освобождённый голубь пойдёт за тобой. Доведи его до гнезда.', unlock:'В стаю вступит разведчик Сизый. Он показывает поле зрения дворника.'},
  {id:'territory', title:'Наш двор', en:'Our turf', district:'square', mode:'territory', goal:3, reward:60, par:23, intro:'Приведи союзника к каждому из трёх флажков. Нажми «Занять» и удержи место. Стая отгоняет соперников.', unlock:'Откроются рынок и дополнительные испытания.'},
  {id:'wind', title:'Против ветра', en:'Against the wind', district:'market', mode:'wind', goal:2, reward:60, par:17, intro:'Забери ветки у дальнего прилавка. Пройди через метку у канала и доставь их домой. Взлёт помогает против ветра.', unlock:'В стаю вступит курьер Рыжик. С ним груз несут быстрее.'},
  {id:'quiet', title:'Тихая смена', en:'Quiet shift', district:'market', mode:'quiet', goal:1, reward:65, par:20, intro:'Дождись открытия среднего прилавка, забери заказ и вернись. Две замеченные кражи сорвут операцию.', unlock:'Дальше — выманивание дворника к двум меткам.'},
  {id:'lure', title:'Уборка по плану', en:'Sweep the way', district:'market', mode:'lure', goal:2, reward:70, par:23, intro:'У каждой метки свистни дворнику и отойди. Он должен дойти до обеих меток. Затем вернись в гнездо.', unlock:'В стаю вступит Гром. Его крик на время отпугивает кота.'},
  {id:'escort', title:'Через весь рынок', en:'Across the market', district:'market', mode:'escort', goal:2, reward:75, par:18, intro:'Позови двух голубей у прилавков. Проведи обоих через метку у канала и доведи до гнезда.', unlock:'Откроется общий налёт с разведкой, спасением и тяжёлым грузом.'},
  {id:'finale', title:'Большой налёт', en:'The big heist', district:'market', mode:'finale', goal:3, reward:100, par:23, intro:'Открой задвижку слева, освободи голубя, затем унеси большой ящик из правого прилавка. Нужны два союзника.', unlock:'Все заказы открыты. Улучшай рекорды и пробуй испытания.'}
];
const CHALLENGES = [
  {id:'challenge-flags', title:'Перехват квартала', en:'Block takeover', district:'square',mode:'territory',goal:3,reward:25,par:18,variant:1,intro:'Соперники быстрее. Займи три точки с союзником. Стая и взлёт помогут оторваться.',unlock:'Рекорд сохраняется. Награда выдаётся за первое прохождение.'},
  {id:'challenge-wind', title:'Срочная посылка', en:'Express parcel',district:'market',mode:'wind',goal:2,reward:25,par:12,variant:1,intro:'Тележка движется быстрее, ветер сильнее. Забери ветки, пройди метку и вернись.',unlock:'Рекорд сохраняется. Награда выдаётся за первое прохождение.'},
  {id:'challenge-lure',title:'Двойной обход',en:'Double diversion',district:'market',mode:'lure',goal:2,reward:25,par:20,variant:1,intro:'Дворник идёт быстрее. Вымани его к обеим меткам и вернись домой.',unlock:'Рекорд сохраняется. Награда выдаётся за первое прохождение.'}
];
const UPGRADES = [
  {id:'nest',title:'Уютное гнездо',en:'A proper nest',prices:[40,85],description:'Новая подстилка и навес. При доставке быстрее восстанавливается взлёт.'},
  {id:'wings',title:'Сильные крылья',en:'Strong wings',prices:[50,90],description:'Взлёт восстанавливается на секунду быстрее за каждый уровень.'},
  {id:'flock',title:'Сбор стаи',en:'Flock rally',prices:[70,110],description:'По одному союзнику ждёт у гнезда за каждый уровень.'}
];
const PROGRESS = (() => {
  let db, snapshot, error='';
  const empty=()=>({schema:1,completed:{},upgrades:{nest:0,wings:0,flock:0},crumbs:0});
  function publish(data) { snapshot=data; window.dispatchEvent(new Event('progress-changed')); }
  function failure() { error='Не удалось сохранить прогресс. Разреши хранение данных сайта и попробуй ещё раз.'; }
  function transact(update) {
    return new Promise((resolve,reject)=>{
      if(!db) return reject(new Error(error||'Хранилище пока недоступно.'));
      const tx=db.transaction('save','readwrite');
      const store=tx.objectStore('save');
      const read=store.get('campaign');
      let result, data;
      read.onsuccess=()=>{
        data=read.result||empty();
        try { result=update(data);store.put(data,'campaign'); }
        catch(e){tx.abort();reject(e);}
      };
      tx.oncomplete=()=>{error='';publish(data);resolve(result);};
      tx.onerror=()=>{failure();reject(new Error(error));};
    });
  }
  const ready=new Promise(resolve=>{
    try {
      const request=indexedDB.open('pigeon-mafia',1);
      request.onupgradeneeded=()=>request.result.createObjectStore('save');
      request.onerror=()=>{failure();publish(empty());resolve();};
      request.onsuccess=()=>{
        db=request.result;
        db.onversionchange=()=>{db.close();db=null;failure();};
        transact(()=>null).then(resolve).catch(resolve);
      };
    } catch {failure();publish(empty());resolve();}
  });
  function unlocked(mission) {
    const i=CAMPAIGN.findIndex(m=>m.id===mission.id);
    if(i<0) return Boolean(snapshot?.completed.territory);
    return i===0||Boolean(snapshot?.completed[CAMPAIGN[i-1].id]);
  }
  return {
    ready,
    state:()=>structuredClone(snapshot||empty()),
    error:()=>error,
    unlocked,
    next:()=>CAMPAIGN.find(m=>!snapshot?.completed[m.id])||CHALLENGES[0],
    async complete(mission,stats) {
      await ready;
      return transact(data=>{
        const old=data.completed[mission.id];
        const medal=stats.time<=mission.par?'gold':stats.time<=mission.par*1.7?'silver':'bronze';
        const reward=old?0:mission.reward;
        data.crumbs+=reward;
        data.completed[mission.id]={best:Math.min(old?.best??Infinity,stats.time),medal:old&&old.best<stats.time?old.medal:medal};
        return {reward,medal,best:data.completed[mission.id].best,first:!old};
      });
    },
    async buy(id) {
      await ready;
      return transact(data=>{
        const upgrade=UPGRADES.find(u=>u.id===id);
        const level=data.upgrades[id]||0;
        const price=upgrade?.prices[level];
        if(price===undefined) throw new Error('Улучшение уже завершено.');
        if(data.crumbs<price) throw new Error('Пока не хватает крошек.');
        data.crumbs-=price;
        data.upgrades[id]=level+1;
        return data.upgrades[id];
      });
    },
    refresh:async()=>{await ready;if(db)await transact(()=>null);}
  };
})();
