'use strict';
const SCENE = (() => {
  const surface = document.createElement('canvas');
  surface.width = 320;
  surface.height = 346;
  const c = surface.getContext('2d');
  const ink = '#25253a', deep = '#343047', tile = '#c89571';
  const plaza = '#d4a67e', sand = '#e2b88c', shade = '#b17e71';
  let seed = 9037;
  function pick(max) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return (seed >>> 8) % max;
  }
  const rect = (ctx, color, x, y, w, h) => { ctx.fillStyle = color; ctx.fillRect(x, y, w, h); };
  function pixels(ctx, color, x, y, outline) {
    ctx.fillStyle = color;
    ctx.beginPath();
    outline.forEach(([dx,dy], i) => i ? ctx.lineTo(x+dx,y+dy) : ctx.moveTo(x+dx,y+dy));
    ctx.closePath();
    ctx.fill();
  }
  function bevel(ctx, color, x, y, w, h) {
    rect(ctx,color,x+2,y,w-4,h);
    rect(ctx,color,x,y+2,w,h-4);
  }
  const glyphs = {
    'Ф':[14,21,21,21,14,4], 'Р':[30,17,17,30,16,16], 'И':[17,19,21,25,17,17],
    'П':[31,17,17,17,17,17], 'Л':[7,9,9,17,17,17], 'О':[14,17,17,17,17,14],
    'Щ':[21,21,21,21,31,1], 'А':[14,17,17,31,17,17], 'Д':[14,10,18,18,31,17],
    'Ь':[16,16,30,17,17,30], '↗':[7,3,5,9,16,0]
  };
  function letters(str,x,y,color,scale=1) {
    for (const [i,ch] of Array.from(str).entries()) {
      const rows = glyphs[ch];
      if (!rows) continue;
      for (const [j,row] of rows.entries()) {
        for(let k=0;k<5;k++) if (row & (16 >> k)) rect(c,color,x+(i*6+k)*scale,y+j*scale,scale,scale);
      }
    }
  }
  function ground() {
    rect(c,'#51455b',0,0,320,346);
    for (let y=0;y<346;y+=4) for(let x=(y%8)*2;x<320;x+=15) {
      rect(c,['#675267','#594a61','#5c4d63','#766273'][pick(4)],x,y,3+pick(9),1);
    }
    for (let y=101;y<328;y+=21) {
      rect(c,'#8e7078',4,y,4,9);
      rect(c,'#6c5263',4,y+9,4,2);
    }
    rect(c,deep,10,77,310,253);
    rect(c,'#93646c',13,80,307,247);
    rect(c,'#ebc293',17,79,303,246);
    rect(c,tile,20,82,300,239);
    for (let y=82;y<324;y+=9) {
      for (let x=20-((y-82)%18===0 ? 0:8);x<320;x+=17) {
        const tones = ['#d4a67e','#d8a982','#d7a481','#d1a17c','#ca997a','#d7aa83','#d8a984','#d5a27c'];
        const left = Math.max(20,x), w = Math.min(320,x+16)-left;
        rect(c,tones[pick(tones.length)],left,y,w,8);
        rect(c,'#e2b58b',left,y,w,1);
        if (pick(5)===0) rect(c,'#c18a73',left+Math.min(3,w),y+5,Math.min(5,Math.max(0,w-3)),1);
      }
    }
    for (let y=102;y<304;y+=18) {
      for (let x=33;x<313;x+=34) {
        if ((x<54 || x>285) && pick(3)>0) rect(c,'#e8bd95',x,y,2,1);
      }
    }
    for (let x=20;x<320;x+=11) {
      rect(c,x%2 ? '#af7772':'#ba8776',x,319,10,4);
      rect(c,'#f0bf8b',x,323,10,1);
      rect(c,'#634953',x,327,9,1);
    }
    for(let y=86;y<326;y+=8) {
      rect(c,'#e8be97',16,y,3,7);
      rect(c,'#a67371',13,y+2,2,6);
    }
    for (const [x,y] of [[30,202],[113,187],[290,235],[181,289],[63,154],[302,110],[103,276],[151,314],[42,99]]) {
      rect(c,'#966675',x,y,5,2); rect(c,'#e8ba8e',x+1,y+2,3,1);
    }
    for (const [x,y] of [[109,258],[154,230],[276,165],[220,312]]) {
      bevel(c,'#8e696f',x-6,y-3,12,6);
      rect(c,'#6b5365',x-4,y-2,8,3);
      for(let i=-3;i<4;i+=2) rect(c,'#ae8278',x+i,y-2,1,3);
    }
    for (const [x,y] of [[27,284],[118,209],[167,112],[310,187],[212,288],[134,309],[58,260]]) {
      rect(c,'#985c59',x,y,2,1); rect(c,'#f2cb8f',x+1,y-1,3,1); rect(c,'#eaa471',x+3,y-2,2,1);
    }
    for (const [x,y] of [[133,175],[249,263],[64,196],[301,143]]) {
      rect(c,'#af7b70',x,y,7,2); rect(c,'#efce9c',x+1,y-2,3,3); rect(c,'#f6dda9',x+3,y-1,3,2);
    }
    rect(c,'#b48172',63,96,103,2);
    rect(c,'#ebc091',64,98,101,2);
  }
  function window(x,y,w,h) {
    rect(c,deep,x-2,y-2,w+4,h+4);
    rect(c,'#824957',x-1,y-1,w+2,h+2);
    rect(c,'#f4bf76',x,y,w,h);
    rect(c,'#825062',x+1,y+1,w-2,h-2);
    rect(c,'#ed9b66',x+3,y+3,w-6,h-6);
    rect(c,'#ffd48e',x+3,y+3,w-6,2);
    rect(c,'#563d54',x+2,y+Math.floor(h/2),w-4,2);
    rect(c,'#895267',x+Math.floor(w/2),y+1,2,h-2);
    rect(c,'#f4bd80',x-3,y+h,w+6,2);
    rect(c,'#b17664',x-3,y+h+2,w+6,2);
  }
  function cafe() {
    pixels(c,'#ac786e',5,69,[[0,0],[185,0],[212,14],[212,21],[182,26],[0,18]]);
    rect(c,deep,7,5,191,77);
    rect(c,'#6f4658',12,11,182,68);
    rect(c,'#b76c61',13,16,177,55);
    rect(c,'#d5856a',13,17,177,31);
    for(let row=0;row<10;row++) {
      const y=18+5*row;
      for(let x=15+8*(row%2);x<184;x+=16) {
        rect(c,['#c97b68','#be7463','#cb806a','#cb7c6b'][pick(4)],x,y,13,2);
        rect(c,'#a85d60',x,y+3,12,1);
      }
    }
    rect(c,'#684456',10,6,186,10);
    rect(c,'#a65e5f',10,7,186,3);
    rect(c,'#dc9673',11,9,184,2);
    for(let x=11;x<195;x+=8) rect(c,'#4b354b',x,13,6,2);
    rect(c,'#513b52',10,15,4,61);
    rect(c,'#a85f60',11,15,1,56);
    rect(c,'#60394b',189,15,5,58);
    window(21,30,26,27); window(152,31,25,27);
    for (const x of [19,152]) {
      rect(c,'#523f52',x,61,27,6);
      rect(c,'#9a6b60',x+1,61,25,4);
      for(let i=0;i<24;i+=3) {
        rect(c,i%2?'#72946c':'#5b775f',x+2+i,58-pick(3),3,4);
        if (i%2) rect(c,'#f0ac7a',x+2+i,57,2,2);
      }
    }
    rect(c,deep,58,38,83,41);
    rect(c,'#795761',61,40,78,36);
    window(65,44,25,21); window(109,44,25,21);
    rect(c,'#493447',93,43,13,33);
    rect(c,'#714751',95,45,9,31);
    rect(c,'#d99b71',96,47,7,14);
    rect(c,'#fbd17b',101,66,2,2);
    rect(c,'#a97768',59,77,80,4);
    rect(c,'#efb481',62,78,75,2);
    rect(c,'#d98e71',58,82,85,2);
    rect(c,deep,65,16,68,20);
    rect(c,'#f1b77e',67,17,64,17);
    rect(c,'#894653',69,19,60,13);
    rect(c,'#a95659',70,20,58,9);
    letters('ФРИ',82,20,'#512f45',2); letters('ФРИ',81,19,'#ffe092',2);
    rect(c,'#ffce76',73,23,3,3); rect(c,'#ffce76',123,23,3,3);
    rect(c,deep,56,35,89,4);
    for(let i=0;i<11;i++) {
      const x=53+i*8, bright=i%2===0;
      rect(c,bright?'#f5be8a':'#cf655a',x,37,8,7);
      rect(c,bright?'#ffe1a1':'#ef9271',x+1,37,6,2);
      rect(c,bright?'#c4836b':'#a54f56',x-1,44,8,3);
      rect(c,bright?'#e9ab80':'#b75957',x-1,43,8,2);
      rect(c,bright?'#a86b65':'#8e4656',x,47,6,1);
    }
    rect(c,'#735861',15,73,39,3); rect(c,'#735861',146,73,41,3);
    rect(c,'#dfa37c',16,73,37,1); rect(c,'#dfa37c',147,73,39,1);
    rect(c,ink,7,78,47,4); rect(c,ink,145,78,49,4);
    rect(c,'#8f5c64',9,79,43,2); rect(c,'#8f5c64',147,79,45,2);
    for (const [x,y] of [[54,57],[145,57],[186,48]]) {
      rect(c,deep,x-1,y-3,4,7); rect(c,'#ffd290',x,y-1,2,3); rect(c,'#ac6a63',x-1,y+3,4,1);
    }
    rect(c,deep,200,3,120,65);
    rect(c,'#65556c',200,5,120,59);
    for(let x=201;x<320;x+=10) {
      rect(c,'#55465f',x,8,1,57); rect(c,'#786579',x+1,8,2,55);
    }
    rect(c,'#413b54',200,24,120,4);
    rect(c,'#846a76',200,23,120,1);
    rect(c,'#a47673',201,63,119,7);
    rect(c,'#e0a87f',202,65,118,2);
    for(let x=207;x<317;x+=8) {
      rect(c,deep,x,39,2,24);
      rect(c,'#78627b',x+1,40,1,22);
    }
    rect(c,deep,204,47,116,3); rect(c,deep,204,58,116,3);
    rect(c,'#a9857d',206,47,114,1);
    rect(c,deep,263,27,45,13);
    rect(c,'#a37170',264,28,43,11);
    rect(c,'#484257',266,30,39,7);
    letters('ПЛОЩАДЬ',265,30,'#edc68e');
  }
  const trees = [[229,90,1],[271,100,2],[310,125,0],[14,218,2],[312,274,1]];
  const tables = [{x:93,y:130},{x:176,y:151},{x:256,y:207}];
  const fixed = [...trees.map(([x,y,kind])=>({x,y,kind,type:'tree'})),
    ...tables.map(({x,y},kind)=>({x,y,kind,type:'table'})),
    {x:293,y:264,type:'bin',kind:0},{x:305,y:268,type:'bin',kind:1},
    {x:286,y:134,type:'bench'},{x:37,y:282,type:'crate'},{x:207,y:86,type:'lamp'},{x:24,y:115,type:'lamp'}];
  function shadows() {
    for(const {x,y,type} of fixed) {
      if(type==='tree') {
        pixels(c,'#ad8279',x,y,[[0,-3],[18,1],[30,9],[30,13],[14,14],[9,18],[-7,16],[-17,10],[-16,6]]);
        rect(c,'#b28b7d',x+21,y+14,7,2);
      } else if(type==='table') {
        bevel(c,'#af8077',x-22,y-7,49,15);
        bevel(c,'#c69279',x-25,y-4,49,12);
      } else {
        bevel(c,'#ad8075',x-9,y-2,23,6);
      }
    }
    for (let i=0;i<58;i++) {
      const x=191+pick(128), y=71+pick(38);
      rect(c,['#aa8174','#bc8e72','#877764','#d2a379'][pick(4)],x,y,2+pick(4),1+pick(2));
    }
    for (const [x,y] of [[206,113],[295,159],[275,276],[41,306],[228,330]]) {
      rect(c,'#94656d',x,y,3,2); rect(c,'#e5b079',x-2,y-1,3,2);
      rect(c,'#f7cf88',x-1,y-2,2,1);
    }
  }
  function plant(ctx,x,y,kind) {
    const greens = [
      ['#334656','#4b6d62','#6c8964','#91a36a','#bdad6a'],
      ['#344757','#426563','#597e6a','#81a477','#b6b77a'],
      ['#3a4955','#586859','#78875b','#a5a366','#c7b374']
    ][kind];
    const r = (color,dx,dy,w,h) => rect(ctx,color,x+dx,y+dy,w,h);
    bevel(ctx,'#865d62',x-12,y-7,25,11);
    bevel(ctx,'#edb784',x-13,y-9,25,8);
    bevel(ctx,'#9c705f',x-10,y-8,19,5);
    r(ink,-4,-27,9,26); r('#71515b',-3,-26,7,24);
    r('#ad7b64',-2,-24,2,20); r('#d29e74',0,-13,1,9);
    r('#5a4a58',4,-17,1,14); r('#603e52',-5,-22,4,6);
    const outer=[[-23,-37],[-20,-48],[-14,-48],[-14,-53],[-5,-53],[-5,-56],[6,-56],[6,-52],[14,-52],[14,-48],[20,-48],[20,-41],[24,-41],[24,-29],[20,-29],[20,-23],[13,-23],[13,-18],[3,-18],[3,-20],[-9,-20],[-9,-23],[-17,-23],[-17,-28],[-23,-28]];
    pixels(ctx,ink,x,y,outer);
    pixels(ctx,greens[0],x,y,outer.map(([dx,dy])=>[Math.round(dx*.92),Math.round((dy+37)*.91)-37]));
    const clumps=[[-16,-43,15,12],[-14,-49,15,12],[-4,-51,18,13],[4,-47,14,13],[-20,-36,12,11],[-12,-38,17,14],[-5,-43,18,14],[7,-38,13,13],[-2,-33,15,10]];
    for(const [i,[dx,dy,w,h]] of clumps.entries()) {
      bevel(ctx,greens[i%4===3?1:2],x+dx,y+dy,w,h);
      bevel(ctx,greens[i>5?1:3],x+dx,y+dy,w-3,h-5);
    }
    for(const [dx,dy,w] of [[-13,-46,5],[-7,-49,4],[1,-48,6],[7,-44,6],[-17,-36,4],[-10,-40,7],[1,-40,4],[9,-36,4],[-5,-32,5],[-17,-29,3],[12,-30,4]]) {
      r(greens[3],dx,dy,w,2); if(dy<-35) r(greens[4],dx,dy,Math.max(2,w-2),1);
    }
    r(greens[0],-10,-26,9,2); r(greens[0],5,-25,7,2);
  }
  function chair(ctx,x,y) {
    const r = (color,dx,dy,w,h) => rect(ctx,color,x+dx,y+dy,w,h);
    r('#69485a',-4,-10,9,10); r('#b16a5b',-3,-10,7,2); r('#e19872',-3,-9,6,1);
    r('#8f5356',-4,-5,9,3); r('#ce8864',-3,-5,7,1); r('#594252',-3,-2,1,3); r('#594252',3,-2,1,3);
  }
  function table(ctx,x,y,kind) {
    const r = (color,dx,dy,w,h) => rect(ctx,color,x+dx,y+dy,w,h);
    chair(ctx,x-18,y-2); chair(ctx,x+18,y+2);
    r('#644553',-2,-11,4,12); r('#edab76',-1,-9,1,9);
    bevel(ctx,'#664653',x-15,y-20,30,14);
    bevel(ctx,kind===1?'#9d665c':'#aa6e5e',x-14,y-19,28,12);
    bevel(ctx,kind===1?'#eac38f':'#eeb98b',x-13,y-19,26,9);
    r('#f7d69f',-9,-19,17,1);
    for(let i=-10;i<12;i+=4) r('#d59a7b',i,-16,2,1);
    r('#f8dfb0',-8,-13,16,1);
    r('#825b60',-13,-10,26,1);
    r('#f5dca9',8,-18,2,3); r('#a76d66',8,-15,3,1);
  }
  function bench(ctx,x,y) {
    const r = (color,dx,dy,w,h) => rect(ctx,color,x+dx,y+dy,w,h);
    r(ink,-13,-10,2,11); r(ink,10,-10,2,11);
    r('#74525c',-14,-10,28,5); r('#c38362',-13,-10,26,2);
    r('#e5a775',-12,-10,24,1); r('#b07361',-13,-7,26,1);
    r('#72515b',-15,-5,30,4); r('#d28c64',-14,-5,28,2);
  }
  function bin(ctx,x,y,kind) {
    bevel(ctx,ink,x-6,y-14,12,14); bevel(ctx,kind?'#547e74':'#69736e',x-5,y-13,10,12);
    rect(ctx,kind?'#95a782':'#a1a48a',x-3,y-11,2,8); rect(ctx,'#394857',x+2,y-11,2,9);
    rect(ctx,'#2d3549',x-7,y-14,14,3); rect(ctx,'#a8ae90',x-6,y-14,12,1); rect(ctx,'#bbb391',x-2,y-16,4,2);
  }
  function lamp(ctx,x,y) {
    rect(ctx,ink,x-1,y-29,3,29); rect(ctx,'#9f7e78',x,y-24,1,21);
    rect(ctx,deep,x-4,y-3,9,3); rect(ctx,'#aa8277',x-3,y-3,7,1);
    bevel(ctx,deep,x-5,y-36,11,11); bevel(ctx,'#e1976f',x-4,y-34,9,7);
    rect(ctx,'#ffe19a',x-2,y-33,5,5); rect(ctx,'#fff1ad',x-1,y-32,3,2);
  }
  function crate(ctx,x,y) {
    rect(ctx,ink,x-7,y-8,15,9); rect(ctx,'#975e59',x-6,y-7,13,7);
    rect(ctx,'#d29667',x-5,y-8,10,2); rect(ctx,'#c38861',x-4,y-5,8,1); rect(ctx,'#bc7a5c',x-4,y-2,8,1);
  }
  function prop(ctx,{x,y,type,kind}) {
    if(type==='tree') plant(ctx,x,y,kind);
    else if(type==='table') table(ctx,x,y,kind);
    else if(type==='bench') bench(ctx,x,y);
    else if(type==='bin') bin(ctx,x,y,kind);
    else if(type==='lamp') lamp(ctx,x,y);
    else crate(ctx,x,y);
  }
  function frame(ctx,time) {
    ctx.drawImage(surface,0,0);
    for (const [i,x] of [26,37,48,66,77,88,99,110,121,132,143,155,166,177].entries()) {
      const y=75+Math.round(4*Math.sin(i*.29));
      const lit=(Math.floor(time*3)+i)%5 !== 0;
      rect(ctx,'#66505b',x,y-1,2,3);
      rect(ctx,lit?'#ffdb88':'#d99c72',x,y,2,2);
      if (lit) rect(ctx,'#fff1a8',x,y,1,1);
    }
    for(const [i,[x,y]] of [[218,119],[282,117],[302,174]].entries()) {
      const age = (time*.42+i*.38)%1;
      if(age<.85) {
        const a = Math.floor(x+age*17), b = Math.floor(y+age*13+Math.sin(age*12)*2);
        rect(ctx,'#e2a665',a,b,3,1); rect(ctx,'#a36e65',a+1,b+1,2,1);
      }
    }
  }
  ground(); cafe(); shadows();
  return {fixed,tables,frame,prop};
})();
