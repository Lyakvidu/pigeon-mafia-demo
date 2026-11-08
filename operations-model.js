/* Shared deterministic objective model. Used by the game and the content validator. */
(function(root){
  'use strict';
  const types={
    take:{ru:'ЗАБРАТЬ',en:'TAKE',cargo:'gain'},deliver:{ru:'ПЕРЕДАТЬ',en:'DELIVER',cargo:'use'},
    rescue:{ru:'ОТКРЫТЬ',en:'FREE',hits:3},escort:{ru:'ВЕСТИ',en:'ESCORT',auto:true},
    claim:{ru:'ЗАНЯТЬ',en:'CLAIM',hold:2.2},divert:{ru:'ОТВЛЕЧЬ',en:'DISTRACT'},
    lure:{ru:'СВИСТ',en:'WHISTLE',auto:true},switch:{ru:'ЗАДВИЖКА',en:'SWITCH'},
    repair:{ru:'ПОЧИНИТЬ',en:'REPAIR',cargo:'use',hits:3},hide:{ru:'УКРЫТЬСЯ',en:'HIDE',hold:1.7},
    flight:{ru:'ПЕРЕЛЁТ',en:'FLY',auto:true},scout:{ru:'РАЗВЕДАТЬ',en:'SCOUT'},
    trade:{ru:'ОБМЕНЯТЬ',en:'TRADE',cargo:'swap'},station:{ru:'ОСТАВИТЬ',en:'POST ALLY'},
    sync:{ru:'ВМЕСТЕ',en:'TOGETHER'},evade:{ru:'ПРОРЫВ',en:'ESCAPE',auto:true},
    travel:{ru:'ПЕРЕЙТИ',en:'TRAVEL'},rally:{ru:'ПОЗВАТЬ',en:'RECRUIT'}
  };
  function create(m){return {index:0,cargo:null,hits:0,hold:0,rescued:0,station:null,district:m.district,done:false,history:[]};}
  function active(s,m){return m.steps[s.index]||[];}
  function accept(s,m,event){
    if(s.done)return {changed:false};
    const choices=active(s,m),n=choices.find(n=>n.key===event.key);
    if(!n)return {changed:false};
    if(!event.near){s.hold=0;return {changed:false};}
    const type=types[n.type];if(!type)return {changed:false};
    let eligible=true;
    if(type.cargo==='gain')eligible=!s.cargo;
    if(type.cargo==='use'||type.cargo==='swap')eligible=Boolean(s.cargo);
    if(n.type==='escort')eligible=event.escorted;
    if(n.type==='claim')eligible=event.allies&&event.clear;
    if(n.type==='divert')eligible=event.diversion;
    if(n.type==='lure')eligible=event.signalled;
    if(n.type==='hide')eligible=event.calm&&event.unseen;
    if(n.type==='flight')eligible=event.flying;
    if(n.type==='scout')eligible=event.unseen;
    if(n.type==='station'||n.type==='rally')eligible=event.allies;
    if(n.type==='sync')eligible=Boolean(s.station)&&event.stationed;
    if(n.type==='evade')eligible=event.chased;
    if(n.stealth)eligible=eligible&&event.unseen;
    if(n.window)eligible=eligible&&event.window;
    if(!eligible){if(type.hold)s.hold=0;return {changed:false};}
    if(type.hold){if(event.kind!=='tick')return {changed:false};s.hold+=Math.min(.05,event.dt||0);if(s.hold<type.hold)return {changed:false};}
    else if(type.auto){if(event.kind!=='tick')return {changed:false};}
    else if(event.kind!=='action')return {changed:false};
    if(type.hits&&++s.hits<type.hits)return {changed:false,peck:true};
    if(type.cargo==='gain'||type.cargo==='swap')s.cargo=n.item||'parcel';
    if(type.cargo==='use')s.cargo=null;
    if(n.type==='rescue')s.rescued++;
    if(n.type==='station')s.station={district:s.district,at:n.at};
    if(n.type==='sync')s.station=null;
    if(n.type==='travel')s.district=n.to;
    s.history.push(n.key);s.index++;s.hits=0;s.hold=0;s.done=s.index===m.steps.length;
    return {changed:true,node:n,done:s.done};
  }
  const api={types,create,active,accept};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.OPS_MODEL=api;
})(typeof window==='undefined'?globalThis:window);
