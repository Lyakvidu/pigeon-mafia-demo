(function(root){
 'use strict';
 function migrate(old,upgrades){
  const data=old?structuredClone(old):{completed:{},upgrades:{},crumbs:0};
  if(!data.completed||typeof data.completed!=='object')throw new Error('Повреждены данные прогресса.');
  if(!Number.isSafeInteger(data.crumbs)||data.crumbs<0)throw new Error('Повреждён баланс крошек.');
  data.upgrades||={};
  for(const u of upgrades){if(data.upgrades[u.id]===undefined)data.upgrades[u.id]=0;if(!Number.isInteger(data.upgrades[u.id])||data.upgrades[u.id]<0||data.upgrades[u.id]>u.prices.length)throw new Error('Повреждены данные улучшений.');}
  data.schema=2;return data;
 }
 function unlocked(data,m,campaign){
  if(!m)return false;
  const index=campaign.findIndex(row=>row.id===m.id);
  if(index>=0)return index===0||Boolean(data.completed[campaign[index-1].id])||Boolean(data.completed[m.id]);
  return Boolean(data.completed[m.requires||'territory']);
 }
 function complete(data,id,time,campaign,challenges){
  const m=[...campaign,...challenges].find(m=>m.id===id);
  if(!m||!Number.isFinite(time)||time<=0||!unlocked(data,m,campaign))throw new Error('Недопустимый результат задания.');
  const old=data.completed[id],medal=time<=m.par?'gold':time<=m.par*1.7?'silver':'bronze',reward=old?0:m.reward;
  data.crumbs+=reward;data.completed[id]={best:Math.min(old?.best??Infinity,time),medal:old&&old.best<time?old.medal:medal};
  return {reward,medal,best:data.completed[id].best,first:!old};
 }
 function buy(data,id,upgrades){
  const u=upgrades.find(u=>u.id===id),level=data.upgrades[id]||0,price=u?.prices[level];
  if(u?.requires&&!data.completed[u.requires])throw new Error('Сначала заверши нужную главу.');
  if(price===undefined)throw new Error('Улучшение уже завершено.');
  if(data.crumbs<price)throw new Error('Пока не хватает крошек.');
  data.crumbs-=price;data.upgrades[id]=level+1;return data.upgrades[id];
 }
 const api={migrate,unlocked,complete,buy};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SAVE_MODEL=api;
})(typeof window==='undefined'?globalThis:window);
