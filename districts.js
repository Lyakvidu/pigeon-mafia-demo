'use strict';

// Original market scenery and mission props, drawn on the same pixel grid as the square.
window.DISTRICTS = (() => {
  const colors = {
    ink: '#25253a', deep: '#343047', stone: '#9b9186', light: '#d8bd94',
    teal: '#547e74', pale: '#a5b9a3', orange: '#dc966c', rust: '#a65e5f'
  };
  const surface = document.createElement('canvas');
  surface.width = 320;
  surface.height = 346;
  const ground = surface.getContext('2d');
  let seed = 17501;

  function random(max) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return (seed >>> 8) % max;
  }

  function rect(ctx, color, x, y, width, height) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), width, height);
  }

  function block(ctx, color, x, y, width, height) {
    rect(ctx, color, x + 2, y, width - 4, height);
    rect(ctx, color, x, y + 2, width, height - 4);
  }

  function shape(ctx, color, x, y, points) {
    ctx.fillStyle = color;
    ctx.beginPath();
    points.forEach(([dx, dy], index) => {
      if (index === 0) ctx.moveTo(x + dx, y + dy);
      else ctx.lineTo(x + dx, y + dy);
    });
    ctx.closePath();
    ctx.fill();
  }

  function fruit(ctx, x, y, kind) {
    const tone = kind === 0 ? '#d88056' : kind === 1 ? '#a7ae70' : '#d0aa65';
    block(ctx, '#704f56', x, y, 6, 6);
    block(ctx, tone, x, y - 1, 5, 5);
    rect(ctx, '#f1cb88', x + 1, y, 2, 1);
    rect(ctx, '#546857', x + 2, y - 2, 2, 1);
  }

  function basket(ctx, x, y, kind = 0) {
    block(ctx, colors.ink, x - 10, y - 9, 21, 11);
    rect(ctx, '#8d655b', x - 9, y - 8, 19, 8);
    rect(ctx, '#c38f6c', x - 9, y - 8, 19, 2);
    for (let dx = -7; dx < 9; dx += 4) {
      rect(ctx, '#be8867', x + dx, y - 5, 2, 6);
    }
    fruit(ctx, x - 7, y - 12, kind);
    fruit(ctx, x - 1, y - 13, (kind + 1) % 3);
    fruit(ctx, x + 4, y - 11, kind);
    rect(ctx, '#e0b284', x - 9, y - 3, 19, 1);
  }

  function stall(x, width, stripe, contents) {
    const c = ground;
    rect(c, colors.deep, x, 26, width, 60);
    rect(c, '#78535e', x + 2, 29, width - 4, 53);
    rect(c, '#ab7467', x + 4, 32, width - 8, 43);
    for (let yy = 34; yy < 72; yy += 5) {
      for (let xx = x + 4 + (yy % 10 ? 0 : 6); xx < x + width - 5; xx += 12) {
        rect(c, '#c18b72', xx, yy, Math.min(9, x + width - 5 - xx), 2);
      }
    }
    rect(c, '#d5a67e', x + 3, 28, width - 6, 2);
    rect(c, '#463b50', x + 11, 42, width - 22, 29);
    rect(c, '#76535f', x + 14, 45, width - 28, 21);
    rect(c, '#c48a6c', x + 16, 47, width - 32, 3);
    rect(c, '#d5ad7e', x + 17, 48, width - 34, 1);
    for (let xx = x + 19; xx < x + width - 17; xx += 9) {
      rect(c, contents === 2 ? '#8fa199' : '#e0ad75', xx, 51, 4, 11);
      rect(c, '#f2cb8a', xx + 1, 51, 2, 2);
      rect(c, '#684854', xx, 60, 4, 2);
    }
    rect(c, '#483b4e', x + 5, 67, width - 10, 11);
    rect(c, '#b57d66', x + 6, 68, width - 12, 7);
    rect(c, '#e0ad78', x + 6, 68, width - 12, 2);
    for (let xx = x + 11; xx < x + width - 9; xx += 13) {
      basket(c, xx + 5, 75, contents);
    }
    rect(c, colors.ink, x + 3, 36, width - 6, 3);
    for (let index = 0; index < Math.floor((width - 6) / 8); index++) {
      const xx = x + 3 + index * 8;
      const bright = index % 2 === 0;
      rect(c, bright ? '#e6c599' : stripe, xx, 37, 8, 12);
      rect(c, bright ? '#f6d9a7' : '#92aa96', xx + 1, 38, 6, 2);
      rect(c, bright ? '#b4947c' : '#455f61', xx - 2, 49, 8, 3);
      rect(c, bright ? '#e6bc8b' : stripe, xx - 2, 48, 8, 2);
      rect(c, bright ? '#917368' : '#3f5057', xx - 1, 52, 6, 1);
    }
    rect(c, '#453b4d', x + 4, 53, 2, 27);
    rect(c, '#453b4d', x + width - 7, 53, 2, 27);
    rect(c, '#b69479', x + 4, 53, 1, 25);
    rect(c, '#b69479', x + width - 7, 53, 1, 25);
    rect(c, '#463949', x + 1, 82, width - 2, 4);
    rect(c, '#c09274', x + 3, 82, width - 6, 1);
  }

  function marketBackdrop() {
    const c = ground;
    rect(c, '#4e4a5d', 0, 0, 320, 346);
    rect(c, '#615968', 0, 0, 320, 89);
    for (let x = 0; x < 320; x += 12) {
      rect(c, '#786374', x, 5, 10, 20);
      rect(c, '#a17b7c', x + 1, 5, 9, 2);
      rect(c, '#554758', x + 2, 23, 8, 2);
    }
    rect(c, '#42394e', 0, 25, 320, 4);
    rect(c, '#c58c77', 0, 26, 320, 1);
    stall(8, 91, '#557f77', 0);
    stall(113, 92, '#9f5e65', 1);
    stall(218, 94, '#5b7585', 2);

    // Tiny pictorial shop signs avoid language-specific decoration.
    for (const [x, kind] of [[47, 0], [153, 1], [259, 2]]) {
      rect(c, colors.ink, x - 12, 8, 25, 17);
      rect(c, '#d9aa7b', x - 11, 9, 23, 15);
      rect(c, '#765461', x - 9, 11, 19, 11);
      if (kind < 2) {
        fruit(c, x - 4, 14, kind);
        fruit(c, x + 2, 15, kind);
      } else {
        shape(c, '#acb9b2', x - 6, 15, [[0, 1], [3, 0], [8, 0], [10, 2], [14, 0], [14, 5], [10, 3], [8, 5], [3, 5]]);
        rect(c, '#283748', x - 4, 17, 1, 1);
      }
    }
    for (let x = 101; x < 111; x += 3) {
      rect(c, '#2d3949', x, 35, 1, 45);
      rect(c, '#8f7c7c', x + 1, 36, 1, 41);
    }
    rect(c, '#392f45', 207, 39, 9, 42);
    rect(c, '#a28477', 209, 40, 2, 39);

    rect(c, '#695d68', 0, 87, 320, 241);
    const tones = ['#aea08d', '#b6a58e', '#a99b8a', '#b1a18c', '#bca68c', '#a89b8d'];
    for (let y = 89; y < 324; y += 10) {
      for (let x = -9 + (Math.floor(y / 10) % 2) * 9; x < 320; x += 19) {
        const left = Math.max(0, x);
        const width = Math.min(320, x + 18) - left;
        rect(c, tones[random(tones.length)], left, y, width, 9);
        rect(c, '#d1ba98', left, y, width, 1);
        if (random(4) === 0) {
          rect(c, '#938578', left + 2, y + 6, Math.min(6, Math.max(0, width - 2)), 1);
        }
      }
    }
    rect(c, '#d6bb94', 0, 86, 320, 2);
    rect(c, '#826b69', 0, 88, 320, 1);
    // Drainage channels and wheel tracks make this district visibly different.
    for (const x of [11, 304]) {
      rect(c, '#7b7777', x, 92, 5, 229);
      rect(c, '#d0b697', x, 92, 1, 229);
      for (let y = 96; y < 318; y += 6) rect(c, '#505667', x + 2, y, 2, 3);
    }
    for (let x = 107; x < 246; x += 7) {
      rect(c, '#a99581', x, 203, 4, 1);
      rect(c, '#d0b493', x, 209, 4, 1);
    }
    for (const [x, y] of [[52, 154], [126, 181], [281, 237], [86, 283], [158, 308], [32, 246]]) {
      block(c, '#858b84', x, y, 17, 5);
      rect(c, '#bdc2a7', x + 3, y + 1, 8, 1);
      rect(c, '#d7d1af', x + 7, y + 2, 4, 1);
    }
    for (let index = 0; index < 34; index++) {
      const x = 21 + random(277);
      const y = 99 + random(217);
      rect(c, '#d6bd8d', x, y, 2, 1);
      if (index % 3 === 0) rect(c, '#a87c65', x + 2, y - 1, 2, 1);
    }
    for (const [x, y] of [[35, 111], [294, 157], [59, 273], [280, 294]]) {
      rect(c, '#866a66', x, y, 4, 2);
      rect(c, '#77966e', x - 2, y - 2, 5, 3);
      rect(c, '#adc082', x - 1, y - 2, 3, 1);
    }

    // The canal sits outside the walkable area, beyond the stone embankment.
    rect(c, '#4d485c', 0, 322, 320, 7);
    for (let x = 0; x < 320; x += 16) {
      rect(c, '#d6b58b', x, 322, 15, 2);
      rect(c, '#998077', x, 324, 15, 3);
      rect(c, '#74636b', x + 2, 327, 13, 1);
    }
    rect(c, '#344f60', 0, 329, 320, 17);
    rect(c, '#4d6f76', 0, 330, 320, 2);
    for (let x = 3; x < 320; x += 31) {
      rect(c, '#638d8a', x, 338, 13, 1);
      rect(c, '#2d4358', x + 10, 343, 17, 1);
    }
    for (const x of [18, 75, 132, 189, 246, 303]) {
      rect(c, '#26364a', x - 1, 315, 3, 11);
      rect(c, '#9c9e93', x, 316, 1, 8);
    }
    rect(c, '#354052', 17, 317, 288, 2);
    rect(c, '#8a9790', 17, 317, 288, 1);
  }

  function marketTable(ctx, x, y, kind) {
    SCENE.prop(ctx, { type: 'table', x, y, kind });
    const cloth = kind === 1 ? '#a36d71' : '#668e82';
    rect(ctx, cloth, x - 10, y - 18, 20, 7);
    rect(ctx, '#dbc79d', x - 10, y - 18, 20, 1);
    rect(ctx, '#dbc79d', x - 9, y - 18, 1, 7);
    rect(ctx, '#dbc79d', x + 7, y - 18, 1, 7);
    rect(ctx, cloth, x - 4, y - 11, 8, 3);
    rect(ctx, '#d5bd95', x - 4, y - 9, 8, 1);
  }

  function marketTree(ctx, x, y, kind) {
    // Compact fruit trees leave the view of the market lanes unobstructed.
    rect(ctx, colors.ink, x - 3, y - 25, 6, 25);
    rect(ctx, '#a77a61', x - 2, y - 23, 3, 21);
    rect(ctx, '#d6a278', x - 1, y - 18, 1, 14);
    block(ctx, '#756064', x - 10, y - 5, 21, 7);
    block(ctx, '#b39a7d', x - 11, y - 7, 23, 6);
    block(ctx, '#877d67', x - 9, y - 6, 19, 4);
    const clumps = [[-17, -35, 18, 15], [-7, -43, 20, 18], [5, -34, 16, 15], [-8, -28, 19, 12]];
    clumps.forEach(([dx, dy, width, height]) => {
      block(ctx, colors.ink, x + dx, y + dy, width, height);
      block(ctx, '#587263', x + dx + 1, y + dy + 1, width - 2, height - 3);
      block(ctx, '#81956e', x + dx + 2, y + dy + 1, width - 4, height - 6);
      rect(ctx, '#b0b87b', x + dx + 4, y + dy + 2, width - 9, 2);
    });
    for (const [dx, dy] of [[-10, -30], [2, -37], [10, -27], [-1, -23]]) {
      rect(ctx, kind ? '#d7a065' : '#cf7859', x + dx, y + dy, 3, 3);
      rect(ctx, '#f4c48a', x + dx, y + dy, 2, 1);
    }
  }

  const tables = [
    { x: 93, y: 130 },
    { x: 176, y: 151 },
    { x: 256, y: 207 }
  ];
  const fixed = [
    ...tables.map((table, kind) => ({ ...table, type: 'table', kind })),
    { x: 24, y: 180, type: 'tree', kind: 0 },
    { x: 290, y: 104, type: 'tree', kind: 1 },
    { x: 293, y: 178, type: 'bench' },
    { x: 26, y: 257, type: 'crate', kind: 0 },
    { x: 299, y: 266, type: 'crate', kind: 1 },
    { x: 293, y: 289, type: 'bin', kind: 1 },
    { x: 14, y: 109, type: 'lamp' },
    { x: 306, y: 112, type: 'lamp' }
  ];

  function prop(ctx, object) {
    const { x, y, type, kind = 0 } = object;
    if (type === 'table') marketTable(ctx, x, y, kind);
    else if (type === 'tree') marketTree(ctx, x, y, kind);
    else if (type === 'crate') basket(ctx, x, y, kind);
    else SCENE.prop(ctx, object);
  }

  function drawShadows() {
    fixed.forEach(({ x, y, type }) => {
      const width = type === 'table' ? 39 : type === 'tree' ? 28 : 21;
      block(ground, '#8b827c', x - width / 2 + 4, y - 3, width, 7);
      rect(ground, '#9f9182', x - width / 2 + 6, y + 3, width - 3, 2);
    });
  }

  function frame(ctx, time) {
    ctx.drawImage(surface, 0, 0);
    for (let index = 0; index < 8; index++) {
      const x = Math.floor((index * 43 + time * 5) % 326) - 6;
      rect(ctx, index % 2 ? '#638d8a' : '#86a598', x, 334 + (index % 3) * 4, 8, 1);
    }
    // Loose paper travelling through the wind corridor previews its direction.
    for (let index = 0; index < 3; index++) {
      const cycle = (time * .33 + index / 3) % 1;
      const x = 205 + index * 9 + Math.round(Math.sin(cycle * 7) * 2);
      const y = 282 - Math.floor(cycle * 64);
      rect(ctx, '#ddd0ab', x, y, 4, 2);
      rect(ctx, '#a18c79', x + 2, y + 2, 3, 1);
    }
    // A few glints on the fishmonger stall provide a small living background.
    const glint = Math.floor(time * 2) % 4;
    rect(ctx, '#d9d2ac', 243 + glint * 10, 61, 2, 1);
  }

  function cage(ctx, x, y, options) {
    const doorOffset = options.open ? 18 : 0;
    block(ctx, colors.ink, x - 17, y - 25, 34, 26);
    block(ctx, '#465363', x - 15, y - 23, 30, 22);
    rect(ctx, '#293446', x - 12, y - 20, 24, 17);
    rect(ctx, '#899e9b', x - 15, y - 23, 30, 2);
    rect(ctx, '#bfbe9d', x - 12, y - 22, 24, 1);
    if (!options.open) ART.draw(ctx, 'ally', x - 1, y - 2, { variant: 1 });
    for (let dx = -12; dx <= 12; dx += 6) {
      rect(ctx, '#849392', x + dx, y - 20, 2, 18);
      rect(ctx, '#bac3ac', x + dx, y - 20, 1, 18);
    }
    rect(ctx, '#9caaa0', x - 14, y - 11, 28, 2);
    rect(ctx, '#697d83', x - 16, y - 3, 32, 3);
    if (options.open) {
      rect(ctx, '#293446', x - 5, y - 19, 12, 17);
      rect(ctx, '#a8b8a7', x + doorOffset - 2, y - 18, 3, 19);
      rect(ctx, '#899d98', x + 8, y - 19, doorOffset - 9, 2);
      rect(ctx, '#899d98', x + 8, y - 1, doorOffset - 9, 2);
    } else {
      rect(ctx, '#d6b072', x + 2, y - 9, 5, 6);
      rect(ctx, '#6b594f', x + 4, y - 7, 1, 3);
    }
    rect(ctx, '#718589', x - 4, y - 28, 8, 2);
    rect(ctx, '#a8b5a6', x - 3, y - 29, 6, 1);
  }

  function flag(ctx, x, y, options) {
    const friendly = Boolean(options.friendly);
    const cloth = friendly ? '#6caa94' : '#b96368';
    block(ctx, '#645560', x - 8, y - 3, 17, 5);
    rect(ctx, '#ac8c77', x - 6, y - 3, 13, 1);
    rect(ctx, colors.ink, x - 1, y - 37, 3, 36);
    rect(ctx, '#bfc0a5', x, y - 36, 1, 33);
    rect(ctx, '#ddc58e', x - 1, y - 39, 3, 3);
    shape(ctx, '#493c51', x + 2, y - 35, [[0, 0], [18, 0], [15, 7], [18, 14], [0, 14]]);
    shape(ctx, cloth, x + 2, y - 34, [[0, 0], [15, 0], [12, 6], [15, 11], [0, 11]]);
    rect(ctx, friendly ? '#c6dec0' : '#edbd9d', x + 4, y - 33, 9, 1);
    // A white wing is the flock's emblem.
    rect(ctx, '#f4dfb3', x + 5, y - 30, 2, 4);
    rect(ctx, '#f4dfb3', x + 7, y - 31, 2, 4);
    rect(ctx, '#f4dfb3', x + 9, y - 32, 2, 4);
    if (typeof options.progress === 'number' && options.progress > 0) {
      const progress = Math.min(1, Math.max(0, options.progress));
      rect(ctx, colors.ink, x - 12, y + 5, 25, 4);
      rect(ctx, '#8fc3a2', x - 11, y + 6, Math.round(progress * 23), 2);
    }
  }

  function parcel(ctx, x, y, options) {
    block(ctx, colors.ink, x - 8, y - 13, 17, 14);
    rect(ctx, options.friendly ? '#86a990' : '#ca9a6e', x - 7, y - 12, 15, 11);
    rect(ctx, '#f0c48a', x - 7, y - 12, 15, 2);
    rect(ctx, '#a57059', x - 7, y - 3, 15, 3);
    rect(ctx, '#f1d3a0', x - 1, y - 12, 3, 12);
    rect(ctx, '#f1d3a0', x - 7, y - 7, 15, 2);
    rect(ctx, '#78575c', x + 4, y - 10, 3, 2);
    rect(ctx, '#fff1c6', x - 4, y - 5, 3, 1);
  }

  function cart(ctx, x, y) {
    rect(ctx, colors.ink, x - 12, y - 5, 5, 7);
    rect(ctx, colors.ink, x + 8, y - 5, 5, 7);
    rect(ctx, '#6d777d', x - 11, y - 4, 3, 5);
    rect(ctx, '#6d777d', x + 9, y - 4, 3, 5);
    block(ctx, colors.ink, x - 15, y - 20, 30, 18);
    rect(ctx, '#759383', x - 14, y - 19, 28, 14);
    rect(ctx, '#b8c1a1', x - 14, y - 19, 28, 2);
    rect(ctx, '#526e6e', x - 13, y - 7, 26, 3);
    for (let dx = -10; dx < 13; dx += 6) rect(ctx, '#99ab8e', x + dx, y - 16, 2, 9);
    rect(ctx, '#c4c9a7', x - 15, y - 11, 30, 2);
    rect(ctx, '#3b4757', x + 14, y - 15, 5, 2);
    rect(ctx, '#a5b4a3', x + 17, y - 20, 2, 6);
    for (const [dx, dy, kind] of [[-10, -24, 0], [-3, -25, 1], [4, -24, 0], [-7, -20, 1], [1, -20, 2], [7, -20, 0]]) {
      fruit(ctx, x + dx, y + dy, kind);
    }
  }

  function twig(ctx, x, y) {
    rect(ctx, '#624b55', x - 7, y - 2, 14, 2);
    rect(ctx, '#d0a277', x - 6, y - 2, 12, 1);
    rect(ctx, '#735357', x - 1, y - 5, 2, 4);
    rect(ctx, '#c49a6d', x - 1, y - 5, 1, 4);
    rect(ctx, '#8d9a68', x + 4, y - 4, 4, 2);
    rect(ctx, '#bec28a', x + 5, y - 4, 2, 1);
  }

  function sign(ctx, x, y, options) {
    const color = options.friendly ? '#88ba9c' : '#d2a574';
    rect(ctx, colors.ink, x - 1, y - 26, 3, 25);
    rect(ctx, '#b3a18b', x, y - 25, 1, 23);
    shape(ctx, colors.ink, x - 12, y - 27, [[0, 0], [20, 0], [25, 6], [20, 12], [0, 12]]);
    shape(ctx, color, x - 11, y - 26, [[0, 0], [18, 0], [22, 5], [18, 9], [0, 9]]);
    rect(ctx, '#f4ddb0', x - 8, y - 24, 13, 1);
    rect(ctx, '#586b68', x - 6, y - 21, 9, 2);
    rect(ctx, '#586b68', x + 1, y - 23, 2, 6);
  }

  const missionObjects = { cage, flag, parcel, cart, twig, sign };

  function drawObject(ctx, name, x, y, options = {}) {
    const draw = missionObjects[name];
    if (draw) draw(ctx, Math.round(x), Math.round(y), options);
  }

  marketBackdrop();
  drawShadows();
  return { market: { fixed, tables, frame, prop }, drawObject };
})();
