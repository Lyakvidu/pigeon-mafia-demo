/* Original music and sound design for LyaGame's Pigeon Mafia demo. */
'use strict';
(() => {
  const SAMPLE_RATE = 32000;
  const BPM = 112;
  const BEAT = 60 / BPM;
  const BAR = BEAT * 4;
  const MUSIC_LENGTH = BAR * 8;
  const levels = { music: .38, effects: .8 };
  const voices = new Set();
  const lastEffect = new Map();
  let context = null;
  let master = null;
  let musicBus = null;
  let effectsBus = null;
  let musicFilter = null;
  let musicSource = null;
  let musicBuffer = null;
  let effects = null;
  let wantedScene = 'menu';
  let explicitlySuspended = false;
  let sleepTimer = 0;
  let revision = 0;

  const limit = value => Math.min(1, Math.max(0, Number(value) || 0));
  const hz = note => 440 * Math.pow(2, (note - 69) / 12);
  const envelope = (time, duration, attack, decay) => {
    const onset = Math.min(1, time / attack);
    const release = Math.min(1, (duration - time) / .025);
    return onset * Math.max(0, release) * Math.exp(-time * decay);
  };
  function seedNoise(seed) {
    let state = seed;
    return () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 2147483648 - 1;
    };
  }
  function add(target, start, duration, render, wrap = false) {
    const offset = Math.round(start * SAMPLE_RATE);
    const count = Math.ceil(duration * SAMPLE_RATE);
    for (let i = 0; i < count; i++) {
      const index = offset + i;
      if (!wrap && index >= target.length) break;
      target[index % target.length] += render(i / SAMPLE_RATE, i) * Math.min(1, i / 60, (count - i) / 80);
    }
  }
  function note(target, start, pitch, duration, volume, instrument = 'keys', wrap = false) {
    const f = hz(pitch);
    add(target, start, duration, time => {
      const phase = time * f * Math.PI * 2;
      const decay = instrument === 'bass' ? 5 : instrument === 'pluck' ? 8 : 3.5;
      const sustain = envelope(time, duration, .007, decay);
      let tone;
      if (instrument === 'bass') {
        tone = Math.sin(phase) * .79 + Math.sin(phase * 2) * .16 + Math.sin(phase * 3) * .05;
      } else if (instrument === 'pluck') {
        tone = Math.sin(phase) * .72 + Math.sin(phase * 2) * Math.exp(-time * 12) * .2 + Math.sin(phase * 3) * .08;
      } else {
        tone = Math.sin(phase + Math.sin(phase * 2) * .42 * Math.exp(-time * 7)) * .81;
        tone += Math.sin(phase * 2.002) * .12 + Math.sin(phase * 3) * .07 * Math.exp(-time * 9);
      }
      return tone * sustain * volume;
    }, wrap);
  }
  function brushedHit(target, start, duration, volume, seed, wrap = false) {
    const random = seedNoise(seed);
    let previous = 0;
    add(target, start, duration, time => {
      const noise = random();
      const high = noise - previous;
      previous = noise;
      return high * envelope(time, duration, .008, 22) * volume;
    }, wrap);
  }
  function audioBuffer(samples, ceiling = .85) {
    let peak = 0;
    for (const value of samples) peak = Math.max(peak, Math.abs(value));
    const scale = peak > ceiling ? ceiling / peak : 1;
    const buffer = context.createBuffer(1, samples.length, SAMPLE_RATE);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) data[i] = samples[i] * scale;
    return buffer;
  }
  function composeMusic() {
    const samples = new Float32Array(Math.round(MUSIC_LENGTH * SAMPLE_RATE));
    // Eight-bar original minor swing. Sparse phrases leave room for game sounds.
    const harmony = [
      [50, 57, 60, 64], [50, 57, 60, 64], [55, 59, 62, 65], [55, 59, 62, 64],
      [51, 58, 62, 65], [51, 58, 62, 65], [45, 55, 61, 65], [45, 55, 61, 64],
    ];
    const bass = [[38,45,41,44], [38,45,48,42], [43,50,47,46], [43,47,50,49],
      [39,46,43,45], [39,46,50,46], [33,40,43,44], [33,40,37,37]];
    const melody = [
      [[.64,74],[1,77],[2.64,76],[3,72]],
      [[.64,69],[1.5,72],[2.64,74]],
      [[.64,74],[1,77],[2.64,79],[3,77]],
      [[.5,76],[1,74],[2.64,71]],
      [[.64,74],[1,77],[2.64,79],[3,82]],
      [[.64,81],[1.5,77],[2.64,74]],
      [[.64,73],[1,76],[2.64,77],[3,76]],
      [[.64,73],[1.5,69],[2.64,72],[3,73]],
    ];
    for (let bar = 0; bar < 8; bar++) {
      const origin = bar * BAR;
      for (let beat = 0; beat < 4; beat++) {
        note(samples, origin + beat * BEAT, bass[bar][beat], .41, .25, 'bass', true);
        brushedHit(samples, origin + beat * BEAT, .11, beat % 2 ? .045 : .025, bar * 13 + beat + 11, true);
        brushedHit(samples, origin + (beat + .65) * BEAT, .065, .015, bar * 17 + beat + 37, true);
      }
      for (const offbeat of [.65, 2.65]) {
        harmony[bar].forEach((pitch, index) => {
          note(samples, origin + offbeat * BEAT + index * .009, pitch + 12, .47, .045, 'keys', true);
        });
      }
      for (const [beat, pitch] of melody[bar]) {
        note(samples, origin + beat * BEAT, pitch, .28, .068, 'pluck', true);
        note(samples, origin + beat * BEAT + .085, pitch - 12, .17, .014, 'keys', true);
      }
    }
    return audioBuffer(samples, .7);
  }
  function makeEffects() {
    const bank = {};
    const create = (name, duration, render) => {
      const data = new Float32Array(Math.ceil(duration * SAMPLE_RATE));
      render(data);
      bank[name] = audioBuffer(data, .65);
    };
    create('click', .09, data => {
      note(data, 0, 79, .055, .28, 'pluck');
      note(data, .012, 67, .06, .1, 'keys');
    });
    create('peck', .1, data => {
      brushedHit(data, 0, .045, .16, 43);
      note(data, .002, 64, .065, .22, 'pluck');
    });
    create('coo', .65, data => {
      for (const [start, duration, pitch] of [[0,.22,440],[.23,.36,320]]) {
        add(data, start, duration, time => {
          const vibrato = 6 * Math.sin(time * 25);
          const phase = Math.PI * 2 * (pitch * time - 38 * time * time + vibrato * .009);
          const shape = Math.sin(Math.PI * time / duration) ** 1.5;
          return (Math.sin(phase) + Math.sin(phase * 2) * .3 + Math.sin(phase * 3) * .12) * shape * .24;
        });
      }
    });
    create('flutter', .48, data => {
      for (let i = 0; i < 4; i++) {
        const random = seedNoise(103 + i);
        let filtered = 0;
        add(data, i * .085, .13, time => {
          filtered = filtered * .72 + random() * .28;
          return filtered * Math.sin(Math.PI * time / .13) ** 2 * .74;
        });
      }
    });
    create('steal', .33, data => {
      [72,76,81].forEach((pitch,i) => note(data, i * .045, pitch, .17, .2, 'pluck'));
      brushedHit(data, 0, .1, .06, 89);
    });
    create('deliver', .55, data => {
      [62,69,74,77].forEach((pitch,i) => note(data, i * .065, pitch, .3, .19, 'keys'));
    });
    create('alert', .55, data => {
      for (const [start,pitch] of [[0,690],[.2,850]]) {
        add(data, start, .2, time => {
          const phase = Math.PI * 2 * (pitch * time + 160 * time * time);
          return Math.sin(phase) * Math.sin(Math.PI * time / .2) * .24;
        });
      }
    });
    create('cat', .56, data => {
      add(data, 0, .48, time => {
        const phase = Math.PI * 2 * (490 * time - 290 * time * time);
        const formant = Math.sin(phase) * .55 + Math.sin(phase * 3) * .25 + Math.sin(phase * 5) * .08;
        return formant * Math.sin(Math.PI * time / .48) ** 1.3 * .45;
      });
      brushedHit(data, .36, .18, .1, 96);
    });
    create('win', 1.6, data => {
      const lead = [[0,74],[.13,77],[.26,81],[.52,86],[.84,84],[1.02,86]];
      for (const [start,pitch] of lead) note(data,start,pitch,.42,.24,'keys');
      [50,57,62,66].forEach(pitch=>note(data,.52,pitch,.85,.12,'keys'));
    });
    create('lose', .95, data => {
      [69,65,62,61].forEach((pitch,i) => note(data,i * .16,pitch,.4,.22,'keys'));
      note(data,.4,38,.5,.16,'bass');
    });
    return bank;
  }
  function ramp(node, value, duration = .04) {
    const now = context.currentTime;
    node.gain.cancelScheduledValues(now);
    node.gain.setValueAtTime(node.gain.value, now);
    node.gain.linearRampToValueAtTime(value, now + duration);
  }
  function initialize() {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return false;
    context = new Audio({ latencyHint:'interactive' });
    master = context.createGain();
    master.gain.value = .72;
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -16;
    compressor.knee.value = 15;
    compressor.ratio.value = 5;
    compressor.attack.value = .004;
    compressor.release.value = .16;
    musicBus = context.createGain();
    effectsBus = context.createGain();
    musicFilter = context.createBiquadFilter();
    musicFilter.type = 'lowpass';
    musicFilter.frequency.value = 3600;
    musicFilter.Q.value = .4;
    musicBus.connect(musicFilter);
    musicFilter.connect(master);
    effectsBus.connect(master);
    master.connect(compressor);
    compressor.connect(context.destination);
    musicBuffer = composeMusic();
    effects = makeEffects();
    return true;
  }
  function stopMusic() {
    if (!musicSource) return;
    const source = musicSource;
    musicSource = null;
    ramp(musicBus, 0, .025);
    source.onended = () => source.disconnect();
    source.stop(context.currentTime + .03);
  }
  function startMusic() {
    if (musicSource || levels.music === 0 || wantedScene === 'silent') return;
    musicSource = context.createBufferSource();
    musicSource.buffer = musicBuffer;
    musicSource.loop = true;
    musicSource.connect(musicBus);
    musicSource.start();
  }
  function playable() {
    return !document.hidden && !explicitlySuspended && wantedScene !== 'paused' && (levels.music > 0 || levels.effects > 0);
  }
  function sync() {
    if (!context) return Promise.resolve(false);
    clearTimeout(sleepTimer);
    const current = ++revision;
    if (!playable()) {
      if (context.state === 'running') {
        ramp(master, 0, .025);
        for (const voice of voices) voice.stop(context.currentTime + .03);
        sleepTimer = setTimeout(() => {
          if (current === revision && !playable()) context.suspend().catch(() => {});
        }, 35);
      }
      return Promise.resolve(false);
    }
    return context.resume().then(() => {
      if (current !== revision || !playable()) return false;
      ramp(master, .72);
      ramp(effectsBus, levels.effects);
      ramp(musicBus, levels.music * (wantedScene === 'menu' ? .72 : 1), .12);
      if (wantedScene === 'silent' || levels.music === 0) stopMusic();
      else startMusic();
      if (musicSource) {
        const speed = wantedScene === 'chase' ? 1.12 : wantedScene === 'menu' ? .93 : 1;
        musicSource.playbackRate.setTargetAtTime(speed, context.currentTime, .18);
        musicFilter.frequency.setTargetAtTime(wantedScene === 'chase' ? 4400 : 3600, context.currentTime, .12);
      }
      return true;
    }).catch(() => false);
  }
  function effect(name) {
    if (!context || context.state !== 'running' || !playable() || levels.effects === 0 || !effects[name]) return;
    const now = context.currentTime;
    if (now - (lastEffect.get(name) ?? -1) < .06 || voices.size >= 12) return;
    lastEffect.set(name, now);
    const source = context.createBufferSource();
    source.buffer = effects[name];
    source.connect(effectsBus);
    voices.add(source);
    source.onended = () => {
      voices.delete(source);
      source.disconnect();
    };
    source.start();
  }
  window.SOUND = Object.freeze({
    async unlock() {
      if (!context) {
        try { if (!initialize()) return false; }
        catch { return false; }
      }
      explicitlySuspended = false;
      return sync();
    },
    effect,
    setLevels(next) {
      if (Object.hasOwn(next,'music')) levels.music = limit(next.music);
      if (Object.hasOwn(next,'effects')) levels.effects = limit(next.effects);
      return sync();
    },
    scene(name) {
      if (!['menu','play','chase','paused','silent'].includes(name)) return;
      if (wantedScene === name) return;
      wantedScene = name;
      return sync();
    },
    suspend() {
      explicitlySuspended = true;
      return sync();
    },
    resume() {
      explicitlySuspended = false;
      return sync();
    },
    getState() {
      return { unlocked:Boolean(context), state:context?.state || 'locked', scene:wantedScene,
        music:levels.music, effects:levels.effects, activeVoices:voices.size, musicPlaying:Boolean(musicSource && context?.state === 'running') };
    },
  });
  document.addEventListener('visibilitychange',sync);
})();

