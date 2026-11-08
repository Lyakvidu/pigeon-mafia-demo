(function(root){
 'use strict';
 const pins={home:[36,306],west:[65,110],north:[155,103],east:[270,145],center:[149,201],south:[174,285],garden:[75,230],crossing:[230,250],exit:[280,309],roof:[258,110],alcove:[43,185],yard:[270,175]};
 const worlds={
  square:{ru:'Вокзальная площадь',en:'Station square',theme:'square',fixed:[['tree',229,90],['tree',271,100],['tree',310,125],['tree',14,218],['tree',312,274],['table',93,130],['table',176,151],['table',256,207],['bin',293,264],['bin',305,268],['bench',286,134],['crate',37,282]]},
  market:{ru:'Рынок у канала',en:'Canal market',theme:'market',fixed:[['table',93,130],['table',176,151],['table',256,207],['tree',24,180],['tree',290,104],['bench',293,178],['crate',26,257],['crate',299,266],['bin',293,289]]},
  park:{ru:'Сад старого фонтана',en:'Fountain gardens',theme:'park',hazard:'sprinklers',fixed:[['tree',110,160],['tree',213,170],['bench',160,241],['bin',285,280],['table',90,134],['table',238,210],['crate',28,261]]},
  depot:{ru:'Трамвайное депо',en:'Tram depot',theme:'depot',hazard:'cart',fixed:[['crate',99,155],['crate',216,185],['bench',160,247],['bin',290,270],['table',88,134],['table',239,213],['lamp',23,110]]},
  canal:{ru:'Шлюзы и пристань',en:'Locks and quay',theme:'canal',hazard:'gusts',fixed:[['crate',100,160],['bin',285,272],['bench',154,236],['table',86,134],['table',238,211],['lamp',23,110]]},
  roofs:{ru:'Черепичный квартал',en:'Tiled rooftops',theme:'roofs',hazard:'gaps',fixed:[['crate',106,155],['bin',286,273],['bench',150,241],['table',87,134],['table',237,211],['lamp',23,110]]}
 };
 // Gates occupy a narrow lane; switches and repairs offer a persistent shortcut.
 const gates={west:{x:110,y:208,w:8,h:46},east:{x:210,y:124,w:8,h:46},north:{x:148,y:158,w:48,h:7}};
 function blocked(district,x,y,closedGates=[],cages=[]){
  if(x<12||x>308||y<92||y>319)return true;
  if(worlds[district].fixed.some(([type,px,py])=>{
   if(type==='lamp')return false;
   const rx=type==='table'||type==='bench'?16:type==='tree'?10:7,ry=type==='table'?9:type==='tree'?7:6;
   return Math.hypot((x-px)/rx,(y-py+(type==='table'?4:0))/ry)<1;
  }))return true;
  if(closedGates.some(g=>Math.abs(x-g.x)<g.w/2&&Math.abs(y-g.y)<g.h/2))return true;
  return cages.some(p=>Math.hypot((x-p.x)/15,(y-p.y)/9)<1);
 }
 const api={pins,worlds,gates,blocked,point(name){const p=pins[name];return p?{x:p[0],y:p[1]}:null;}};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WORLD_DATA=api;
})(typeof window==='undefined'?globalThis:window);
