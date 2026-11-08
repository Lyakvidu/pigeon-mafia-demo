'use strict';
const ROOF_ART=(()=>{
  const W=384;
  const H=216;
  const ink='#292739';
  const districts=[
    {id:'square',x:64,y:91,ru:'Вокзал',en:'Station'},
    {id:'park',x:192,y:87,ru:'Сад',en:'Gardens'},
    {id:'roofs',x:320,y:90,ru:'Крыши',en:'Rooftops'},
    {id:'market',x:64,y:192,ru:'Рынок',en:'Market'},
    {id:'depot',x:192,y:192,ru:'Депо',en:'Depot'},
    {id:'canal',x:320,y:192,ru:'Шлюзы',en:'Locks'}
  ];
  function rect(c,color,x,y,w,h) {
    c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);
  }
  function shape(c,color,points) {
    c.fillStyle=color;c.beginPath();
    for(const [i,[x,y]] of points.entries()) i?c.lineTo(x,y):c.moveTo(x,y);
    c.closePath();c.fill();
  }
  function sprite(c,name,x,y,scale=1,options={}) {
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(scale,scale);
    ART.draw(c,name,0,0,options);c.restore();
  }
  function surface(w,h,paint) {
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    paint(canvas.getContext('2d'));return canvas;
  }
  function windows(c,x,y,w,h,pitch=10) {
    for(let row=0;row<h;row+=10) for(let col=0;col<w;col+=pitch) {
      rect(c,ink,x+col-1,y+row-1,6,8);
      rect(c,(col+row)%3?'#bc886d':'#f5c68d',x+col,y+row,4,6);
      rect(c,'#8e6665',x+col,y+row+3,4,1);
    }
  }
  function roofBackdrop(c) {
    const sky=['#292942','#3c3650','#584257','#7c5262','#a56b70','#d38b73'];
    sky.forEach((tone,i)=>rect(c,tone,0,i*19,W,19));
    shape(c,'#edb88a',[[285,32],[303,32],[311,40],[311,58],[303,66],[285,66],[277,58],[277,40]]);
    for(const [x,y,w] of [[17,27,66],[76,31,59],[241,62,87],[317,40,40],[118,74,56]]) {
      rect(c,'#76576b',x,y,w,3);rect(c,'#a27177',x+10,y-3,w-16,2);
    }
    for(const [x,y,w,h] of [[0,83,32,58],[31,67,30,72],[58,91,37,48],[92,77,44,71],[138,92,30,56],[162,64,37,75],[196,81,49,63],[244,91,38,48],[277,77,36,62],[313,63,28,75],[341,93,43,45]]) {
      rect(c,'#39334a',x,y,w,h);rect(c,'#544254',x,y,w,2);windows(c,x+5,y+8,w-9,Math.min(h-10,34));
    }
    rect(c,ink,170,46,3,18);rect(c,ink,164,51,15,2);
    rect(c,ink,329,47,3,17);rect(c,ink,324,51,15,2);
    shape(c,'#716171',[[26,116],[358,116],[384,180],[384,216],[0,216],[0,177]]);
    shape(c,'#8b6f73',[[31,122],[353,122],[377,185],[7,185]]);
    for(let y=128;y<184;y+=7) {
      const left=Math.floor((177-y)*.38);
      for(let x=left+1;x<W-left-14;x+=18) {
        rect(c,(x+y)%3?'#9a7c7b':'#a28279',x,y,16,5);rect(c,'#ac8980',x,y,16,1);
      }
    }
    rect(c,'#c2a493',25,116,334,3);rect(c,'#5e4b60',0,187,W,29);
    for(let y=192;y<216;y+=8) for(let x=(y%16)*2-16;x<W;x+=21) {
      rect(c,'#775965',x,y,19,6);rect(c,'#987178',x,y,19,1);
    }
    rect(c,'#b99284',0,185,W,4);rect(c,'#574553',0,189,W,3);
    // Painted order box, brass slot and a protruding stamped envelope.
    rect(c,ink,63,117,4,34);rect(c,'#8d9d91',64,118,1,31);
    rect(c,ink,53,105,42,22);rect(c,'#48736f',55,106,37,19);
    rect(c,'#9fc6a7',55,106,37,3);rect(c,'#d6b686',62,111,23,3);
    rect(c,'#f0d9b5',69,116,15,7);rect(c,'#a65a55',78,117,3,3);
    rect(c,'#414554',50,149,29,3);
    // Receiver, dial and antenna beside the chimney.
    rect(c,'#4d394d',336,93,20,53);rect(c,'#9d6664',337,95,17,41);
    rect(c,'#c88a76',334,92,24,5);rect(c,'#704a57',337,108,17,2);
    rect(c,ink,287,133,49,19);rect(c,'#745259',289,132,45,17);
    rect(c,'#e2ab79',289,132,45,3);rect(c,'#a2b3a0',295,137,21,6);
    for(let x=297;x<=313;x+=4)rect(c,'#536e6b',x,137,1,6);
    rect(c,'#e7c390',321,137,8,8);rect(c,'#71525d',324,138,2,4);
    rect(c,'#b9a69a',327,113,1,18);rect(c,'#d1beaa',322,112,12,1);
    DISTRICTS.drawObject(c,'cart',355,175);
    DISTRICTS.drawObject(c,'parcel',114,167);
  }
  let roof, city;
  function recruits(save) {
    return ['rescue','wind','lure'].filter(id=>save.completed[id]);
  }
  function drawRoof(canvas,save,frame=0) {
    roof??=surface(W,H,roofBackdrop);
    const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(roof,0,0);
    const level=save.upgrades.nest;
    if(level>=1) {
      shape(c,'#5c5265',[[162,160],[216,160],[230,174],[151,174]]);
      rect(c,'#c19771',151,174,79,4);
      sprite(c,'fries',177,165,1);DISTRICTS.drawObject(c,'parcel',221,173,{friendly:true});
    }
    if(level>=2) {
      rect(c,'#4d4355',149,110,5,62);rect(c,'#7d6568',151,113,2,55);
      rect(c,'#4d4355',231,110,5,62);rect(c,'#7d6568',232,113,2,55);
      shape(c,'#4c676d',[[156,94],[229,94],[241,116],[142,116]]);
      for(let i=0;i<5;i++) rect(c,'#83a18d',151+i*17,111-i%2,14,4);
      rect(c,'#a1b39c',156,94,73,3);rect(c,'#303e51',143,116,98,3);
    }
    sprite(c,'nest',194,170,1.7);
    sprite(c,frame===1?'peck':frame===2?'walk':'pigeon',195+(frame===2?4:0),160,1.55);
    const positions=[[121,147],[256,165],[264,128],[44,166],[277,181]];
    const crew=recruits(save);
    const allies=crew.length+save.upgrades.flock;
    for(let i=0;i<allies;i++) {
      const [x,y]=positions[i];
      const variant=i<crew.length?['rescue','wind','lure'].indexOf(crew[i]):i%3;
      sprite(c,frame===2&&i===0?'flap':'ally',x,y,1.45,{variant,flip:i%2===1});
    }
    if(save.upgrades.wings) sprite(c,'feather',134,156,1.5);
    if(save.upgrades.signal) DISTRICTS.drawObject(c,'flag',105,143,{friendly:true});
    if(save.upgrades.satchel) DISTRICTS.drawObject(c,'parcel',244,176,{friendly:true});
    if(save.upgrades.watch) SCENE.prop(c,{type:'lamp',x:268,y:121});
  }
  function drawCityBackdrop(c) {
    rect(c,'#574a5d',0,0,W,218);
    // Two boulevards and three cross streets leave space for the landmarks.
    for(const y of [11,103,207]) {
      rect(c,'#333246',0,y,W,8);rect(c,'#938073',0,y+1,W,1);
      for(let x=4;x<W;x+=14)rect(c,'#bc9a7e',x,y+4,6,1);
    }
    for(const x of [12,124,252,371]) {
      rect(c,'#3b384d',x,10,7,202);
      for(let y=22;y<206;y+=11)rect(c,'#938073',x+3,y,1,5);
    }
    for(const [x,y,color] of [[23,25,'#9a766e'],[151,25,'#617967'],[269,26,'#94736e'],[23,116,'#8a6c68'],[150,116,'#817177'],[264,116,'#586c79']]) {
      rect(c,'#383348',x-2,y+4,96,69);rect(c,color,x,y,94,70);
      for(let i=0;i<6;i++)rect(c,'#b096861f',x+4,y+i*10,86,1);
    }
    // Station clock, canopy and tracks.
    rect(c,'#494052',26,72,76,11);rect(c,'#b29a87',26,74,76,2);rect(c,'#b29a87',26,80,76,1);
    for(let x=30;x<103;x+=7)rect(c,'#c4a08d',x,73,2,9);
    rect(c,ink,35,44,59,27);rect(c,'#c28e73',37,46,55,23);windows(c,42,52,47,8);
    shape(c,'#633e52',[[32,46],[46,34],[84,34],[97,46]]);
    rect(c,'#d6a984',57,30,15,26);rect(c,'#e9c6a0',59,34,11,11);
    rect(c,'#6f5960',64,36,1,5);rect(c,'#6f5960',64,40,4,1);
    // Fountain, hedges and trees.
    shape(c,'#77917a',[[162,48],[221,48],[235,75],[149,75]]);
    rect(c,'#bbab91',187,38,9,43);rect(c,'#bbab91',153,62,78,6);
    shape(c,'#454e60',[[179,55],[205,55],[211,62],[205,72],[179,72],[173,62]]);
    shape(c,'#76a2a0',[[180,57],[204,57],[208,62],[204,69],[180,69],[176,62]]);
    rect(c,'#d2dec1',190,53,3,10);rect(c,'#a5c9ae',186,54,11,2);
    for(const [x,y] of [[159,54],[224,56],[161,80],[224,79]]) {
      c.save();c.translate(x,y);c.scale(.45,.45);SCENE.prop(c,{type:'tree',x:0,y:0,kind:1});c.restore();
    }
    // Rows of terracotta roofs, dormers and brick chimneys.
    for(const [x,y,w] of [[274,52,34],[304,43,35],[330,61,28],[286,73,43]]) {
      rect(c,ink,x,y,w,15);rect(c,'#aa7770',x+1,y,w-2,12);
      shape(c,'#874d56',[[x-2,y],[x+6,y-12],[x+w-7,y-12],[x+w+2,y]]);
      rect(c,'#bd7666',x+6,y-12,w-13,2);rect(c,'#b36f66',x+2,y-5,w-4,2);
      rect(c,'#50394c',x+w-9,y-17,5,9);rect(c,'#dcb188',x+8,y+4,5,5);
    }
    // Canal market with a striped awning and crates.
    for(const [x,y] of [[34,142],[66,132],[53,163],[82,161]]) {
      rect(c,ink,x,y,24,20);rect(c,'#b38b71',x+2,y+8,20,10);
      for(let i=0;i<6;i++)rect(c,i%2?'#e1bb85':'#a95560',x+i*4,y,4,9);
      rect(c,'#703f51',x,y+9,24,2);rect(c,'#e8b773',x+5,y+12,6,3);
    }
    // Shed doors, railway ties and a green tram.
    rect(c,'#493d52',152,155,82,25);
    for(let x=158;x<232;x+=17){rect(c,'#b39280',x,152,2,30);rect(c,'#5d4b60',x+4,154,2,28);}
    rect(c,ink,158,126,68,34);rect(c,'#a27d73',159,128,66,13);
    for(let x=163;x<222;x+=21)rect(c,'#5e5363',x,142,17,16);
    shape(c,'#6b5563',[[153,128],[165,120],[218,120],[231,128]]);
    rect(c,ink,180,160,39,14);rect(c,'#749684',182,161,35,10);
    for(let x=184;x<214;x+=7)rect(c,'#d4c8a1',x,162,4,4);
    // Lock chamber, railings, two gates and a narrowboat.
    rect(c,'#43596f',263,126,102,52);rect(c,'#648995',265,131,98,42);
    for(const [x,y] of [[274,143],[294,155],[336,140],[335,168],[282,169]])rect(c,'#9db5a8',x,y,13,1);
    for(const x of [282,341]) {
      rect(c,'#ae9988',x,125,7,53);rect(c,'#63596b',x+1,129,5,43);
      for(let y=133;y<169;y+=6)rect(c,'#bdab93',x,y,7,2);
    }
    shape(c,ink,[[303,151],[327,151],[333,155],[327,160],[303,160],[299,155]]);
    rect(c,'#c89e73',304,152,22,5);rect(c,'#ad715f',309,149,11,6);
  }
  function drawCity(canvas) {
    city??=surface(W,218,drawCityBackdrop);
    canvas.getContext('2d').drawImage(city,0,0);
  }
  return {drawRoof,drawCity,districts,recruits};
})();
