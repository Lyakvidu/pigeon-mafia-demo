/* Extra districts use the original game's pixel palette and prop atlas. Cached once. */
window.NEIGHBORHOODS=(()=>{
 const built={};
 function get(id){
  if(id==='square')return SCENE;if(id==='market')return DISTRICTS.market;if(built[id])return built[id];
  const spec=WORLD_DATA.worlds[id],surface=document.createElement('canvas');surface.width=320;surface.height=346;
  const c=surface.getContext('2d');const r=(color,x,y,w,h)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
  const palettes={park:['#60796c','#91a17c','#aeb48a','#49645f'],depot:['#776e78','#a69b91','#c1b299','#504d60'],canal:['#496b74','#a9a995','#c7baa0','#344c60'],roofs:['#534859','#b78173','#d09a7e','#40384d']};
  const [edge,tile,light,dark]=palettes[id];r(edge,0,0,320,346);r(dark,10,77,310,253);r(light,15,80,305,245);r(tile,20,83,300,238);
  for(let y=84;y<320;y+=9)for(let x=20-(y%18?8:0);x<320;x+=17){r((x+y)%3?'#a08078':light,Math.max(20,x),y,Math.min(16,320-Math.max(20,x)),1);}
  // A different skyline and ground structure for each district; collision props stay explicit.
  if(id==='park'){
   r('#3c5c59',0,3,320,76);for(let x=0;x<320;x+=26){r('#789170',x+3,17+(x%3)*4,24,42);r('#a5b18a',x+5,18+(x%3)*4,18,3);r('#4b655e',x+5,62,20,12);}
   r('#7d8785',113,42,91,33);r('#c4c2a3',118,43,81,3);r('#4c777c',120,48,77,22);r('#86b4ae',127,54,62,2);r('#a3b4a6',152,25,13,38);r('#d5ceac',148,24,21,5);
   for(const [x,y]of [[26,123],[290,221],[30,291]]){r('#60775f',x,y,17,13);for(let k=0;k<4;k++){r('#ddac7f',x+k*4,y+3+(k%2)*5,3,3);r('#bc7874',x+k*4,y+2+(k%2)*5,2,2);}}
  }else if(id==='depot'){
   r('#493e51',9,7,302,72);r('#b18477',12,10,296,6);for(let x=20;x<300;x+=70){r('#302f45',x,24,57,52);r('#707881',x+3,27,51,7);r('#a4aa9c',x+8,29,13,4);r('#b66e66',x+4,45,49,25);r('#d7b08a',x+4,46,49,3);r('#302f45',x+9,69,9,6);r('#302f45',x+38,69,9,6);}
   for(let y=85;y<320;y+=12){r('#76616b',123,y,41,3);r('#dbb18b',126,y,35,1);}r('#565868',128,83,2,238);r('#b1aea0',130,83,1,238);r('#565868',156,83,2,238);r('#b1aea0',158,83,1,238);
  }else if(id==='canal'){
   r('#294d5d',0,6,320,66);for(let y=13;y<69;y+=8)for(let x=(y%3)*13;x<320;x+=36)r('#6d9c9c',x,y,17,1);
   r('#b19785',4,66,312,13);r('#d4bc98',4,66,312,3);for(let x=18;x<320;x+=40){r('#5c6269',x,51,6,29);r('#aaada0',x,50,6,3);}r('#789184',116,30,84,29);r('#b6b798',123,26,71,7);r('#e0c298',160,9,2,21);r('#c68e76',163,11,23,12);
   for(let y=218;y<284;y+=8){r('#688589',211,y,26,2);r('#c4b497',211,y+2,26,1);}
  }else{
   r('#35334b',0,0,320,76);for(let x=3;x<320;x+=25){const top=20+(x%7)*5;r('#514055',x,top,21,60-top);for(let yy=top+7;yy<65;yy+=10)r('#c6a282',x+6,yy,4,5);}
   r('#765565',16,73,304,9);r('#edbc96',20,74,300,2);for(let y=94;y<320;y+=18){r('#9c6b68',20,y,300,2);r('#d29a7e',20,y+2,300,1);}
   for(const [x,y]of [[53,46],[202,39]]){r('#805f69',x,y,29,34);r('#d19a83',x-3,y-3,35,5);r('#463c50',x+4,y+4,21,7);}
   r('#353447',197,218,42,60);r('#d6a187',195,216,45,3);r('#6c5263',196,219,3,59);r('#d6a187',196,278,44,3);
  }
  r(dark,0,329,320,17);for(let x=0;x<320;x+=15)r(edge,x,333,10,2);
  const fixed=spec.fixed.map(([type,x,y],i)=>({type,x,y,kind:type==='table'?0:i%3}));
  const tables=fixed.filter(o=>o.type==='table').map(({x,y},kind)=>({x,y,kind}));
  let tableIndex=0;for(const o of fixed)if(o.type==='table')o.kind=tableIndex++;
  for(const o of fixed){r('#886b70',o.x-10,o.y-1,24,4);r('#a27d73',o.x-7,o.y+3,23,3);}
  return built[id]={fixed,tables,prop:SCENE.prop,frame(ctx,time){ctx.drawImage(surface,0,0);if(id==='canal'){ctx.fillStyle='#98b8a9';ctx.fillRect(50+Math.floor(time*5)%80,21,12,1);}if(id==='park'){ctx.fillStyle='#d7dec4';ctx.fillRect(156,18+Math.floor(time*5)%6,2,5);}}};
 }
 return {get};
})();
