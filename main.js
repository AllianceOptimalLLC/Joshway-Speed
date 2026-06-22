// Joshway Speed - Full Production Sonic-like Side Scroller
// Gorgeous worlds, star rings, loops, power-ups, bosses, polish

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d', { alpha: true });
const gameContainer = document.getElementById('gameContainer');
const powerHud = document.getElementById('powerHud');

let gameState = 'title'; // title, playing, complete, over
let rings = 0;
let score = 0;
let time = 0;
let currentLevel = 0;
let worldWidth = 2600;
let cameraX = 0;

const player = {
  x: 120,
  y: 280,
  vx: 0,
  vy: 0,
  width: 34,
  height: 44,
  onGround: false,
  spin: false,
  facing: 1,
  frame: 0,
  animTimer: 0
};

let keys = {};
let platforms = [];
let collectibles = [];
let powerUps = [];
let enemies = [];
let loops = [];
let particles = [];
let hazards = [];
let boss = null;
let goalX = 2400;

let collectedThisLevel = 0;
let secretsFound = 0;
let powerupType = null;
let powerupTimer = 0;

const levelData = [
  {
    name: "GREEN HILLS",
    bg: '/assets/green-hills-bg.jpg',
    layer: '/assets/sidescroller-layer2.jpg',
    ringColor: '#facc15',
    worldWidth: 2400,
    goalX: 2250,
    platforms: [
      {x:0,y:380,w:520,h:70}, {x:580,y:380,w:420,h:70}, {x:1050,y:380,w:600,h:70},
      {x:1700,y:380,w:700,h:70},
      {x:280,y:280,w:110,h:18}, {x:440,y:210,w:90,h:18},
      {x:780,y:260,w:130,h:18}, {x:980,y:170,w:80,h:18},
      {x:1250,y:310,w:150,h:18}, {x:1480,y:230,w:95,h:18},
      {x:1750,y:290,w:140,h:18}, {x:2000,y:180,w:110,h:18}
    ],
    rings: [[160,240],[230,170],[320,290],[410,140],[510,250],[640,200],[820,100],[920,280],[1080,220],[1220,140],[1380,290],[1560,180],[1720,240],[1880,110],[2050,280],[105,95],[680,85],[1420,95],[1990,105]],
    secrets: [[420,80],[1150,60],[1920,70]],
    enemies: [{x:380,y:355,vx:1.8},{x:720,y:355,vx:-1.6},{x:1220,y:355,vx:1.4},{x:1700,y:355,vx:1.7},{x:1980,y:355,vx:-1.5}],
    powerups: [{x:740,y:220,type:'speed'},{x:1520,y:170,type:'flight'},{x:1980,y:120,type:'magnet'}],
    loops: [{x:1550,y:310,r:58}],
    hasBoss: false
  },
  {
    name: "DESERT DUNES",
    bg: '/assets/desert-bg.jpg',
    layer: '/assets/desert-layer.png',
    ringColor: '#fb923c',
    worldWidth: 2700,
    goalX: 2550,
    platforms: [
      {x:0,y:390,w:380,h:60}, {x:440,y:390,w:460,h:60}, {x:960,y:390,w:380,h:60},
      {x:1410,y:390,w:520,h:60}, {x:2000,y:390,w:700,h:60},
      {x:210,y:300,w:95,h:16}, {x:370,y:235,w:115,h:16},
      {x:680,y:275,w:80,h:16}, {x:850,y:175,w:95,h:16},
      {x:1100,y:310,w:130,h:16}, {x:1330,y:205,w:85,h:16},
      {x:1620,y:295,w:125,h:16}, {x:1860,y:160,w:100,h:16}, {x:2100,y:260,w:90,h:16}
    ],
    rings: [[130,260],[220,175],[310,320],[450,145],[580,235],[710,175],[850,95],[970,300],[1120,185],[1270,265],[1450,125],[1600,215],[1780,305],[1950,145],[2150,235],[2300,180]],
    secrets: [[560,95],[1420,105],[2110,85]],
    enemies: [{x:290,y:368,vx:2.1},{x:580,y:368,vx:-1.9},{x:1020,y:368,vx:1.6},{x:1530,y:368,vx:-1.8},{x:2040,y:368,vx:2.0}],
    powerups: [{x:620,y:240,type:'speed'},{x:1750,y:195,type:'flight'},{x:980,y:110,type:'magnet'}],
    loops: [{x:950,y:320,r:52},{x:1720,y:290,r:48}],
    hasBoss: false
  },
  {
    name: "AQUA RUINS",
    bg: '/assets/water-bg.jpg',
    layer: '/assets/water-layer.png',
    ringColor: '#67e8f9',
    worldWidth: 2800,
    goalX: 2650,
    platforms: [
      {x:0,y:385,w:350,h:65}, {x:410,y:385,w:380,h:65}, {x:850,y:385,w:480,h:65},
      {x:1400,y:385,w:440,h:65}, {x:1930,y:385,w:870,h:65},
      {x:180,y:295,w:105,h:15}, {x:360,y:205,w:80,h:15},
      {x:600,y:285,w:120,h:15}, {x:810,y:150,w:90,h:15},
      {x:1050,y:260,w:145,h:15}, {x:1270,y:175,w:100,h:15},
      {x:1530,y:305,w:115,h:15}, {x:1750,y:200,w:80,h:15}, {x:1980,y:275,w:130,h:15}, {x:2200,y:155,w:90,h:15}
    ],
    rings: [[140,235],[205,145],[295,310],[380,105],[520,205],[650,265],[780,125],[910,275],[1060,165],[1190,300],[1350,195],[1520,115],[1670,285],[1840,170],[2000,250],[2180,135],[2340,295]],
    secrets: [[290,70],[1040,90],[1990,65]],
    enemies: [{x:340,y:363,vx:1.5},{x:620,y:363,vx:-2.2},{x:990,y:363,vx:1.3},{x:1380,y:363,vx:-1.8},{x:1890,y:363,vx:2.3},{x:2270,y:363,vx:-1.6}],
    powerups: [{x:580,y:180,type:'flight'},{x:1680,y:235,type:'speed'},{x:820,y:95,type:'magnet'}],
    loops: [{x:1120,y:300,r:55}],
    hasBoss: false
  },
  {
    name: "COSMIC REALM",
    bg: '/assets/cosmic-bg.jpg',
    layer: '/assets/cosmic-layer.png',
    ringColor: '#c084fc',
    worldWidth: 3100,
    goalX: 2850,
    platforms: [
      {x:0,y:395,w:280,h:55}, {x:340,y:395,w:340,h:55}, {x:740,y:395,w:410,h:55},
      {x:1220,y:395,w:510,h:55}, {x:1800,y:395,w:400,h:55}, {x:2280,y:395,w:820,h:55},
      {x:160,y:305,w:100,h:14}, {x:310,y:210,w:85,h:14},
      {x:510,y:275,w:115,h:14}, {x:710,y:155,w:80,h:14},
      {x:980,y:265,w:140,h:14}, {x:1190,y:180,w:95,h:14},
      {x:1460,y:300,w:120,h:14}, {x:1650,y:125,w:85,h:14},
      {x:1920,y:255,w:125,h:14}, {x:2160,y:195,w:100,h:14}, {x:2410,y:285,w:95,h:14}
    ],
    rings: [[120,225],[185,120],[280,305],[390,155],[500,225],[610,290],[750,95],[880,255],[1020,165],[1170,295],[1310,135],[1480,245],[1620,85],[1770,310],[1930,175],[2100,255],[2260,130],[2440,290],[2600,200],[520,80],[1450,65],[1980,110],[2720,150]],
    secrets: [[470,60],[1290,55],[2200,75],[710,40],[2550,50]],
    enemies: [{x:260,y:374,vx:2.3},{x:490,y:374,vx:-2.0},{x:860,y:374,vx:1.7},{x:1140,y:374,vx:-2.5},{x:1510,y:374,vx:1.9},{x:2030,y:374,vx:-1.8},{x:2440,y:374,vx:2.1}],
    powerups: [{x:660,y:145,type:'speed'},{x:1580,y:105,type:'flight'},{x:2350,y:220,type:'speed'},{x:1020,y:100,type:'magnet'}],
    loops: [{x:860,y:310,r:60},{x:1600,y:260,r:50}],
    hasBoss: true
  }
];

let images = {};
function loadImages() {
  const toLoad = {
    bgGreen: '/assets/green-hills-procedural-bg.jpg',
    bgDesert: '/assets/desert-procedural-bg.jpg',
    bgWater: '/assets/aqua-procedural-bg.jpg',
    bgCosmic: '/assets/cosmic-procedural-bg.jpg',
    layerGreen: '/assets/sidescroller-layer2.jpg',
    layerDesert: '/assets/desert-layer.png',
    layerWater: '/assets/water-layer.png',
    layerCosmic: '/assets/cosmic-layer.png',
    starRing: '/assets/star-ring.png',
    secretRing: '/assets/secret-ring.png',
    playerSheet: '/assets/joshway-spritesheet.png',
    playerOld: '/assets/joshway-running.png',
    enemy: '/assets/enemy-sheet.png',
    bossImg: '/assets/boss-sprite.png',
    powerImg: '/assets/powerups.png',
    ui: '/assets/ui-elements.png'
  };
  Object.keys(toLoad).forEach(k => {
    const img = new Image();
    img.src = toLoad[k];
    images[k] = img;
  });
}

let audioCtx;
function initAudio() {
  try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){}
}

function playSFX(freq, dur, type='square', vol=0.25, ramp=0.08) {
  if (!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  const f = audioCtx.createBiquadFilter();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = vol;
  f.type = 'lowpass';
  f.frequency.value = type === 'sine' ? 2200 : 1650;
  o.connect(f); f.connect(g); g.connect(audioCtx.destination);
  o.start();
  g.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
  setTimeout(() => { try { o.stop(); } catch(e){} }, dur * 1000 + 40);
  // Add subtle noise burst for punch on some sfx
  if (type === 'sawtooth' && vol > 0.2) {
    const n = audioCtx.createBufferSource();
    const noiseBuf = audioCtx.createBuffer(1, audioCtx.sampleRate * dur * 0.6, audioCtx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i=0; i<data.length; i++) data[i] = Math.random()*2-1;
    n.buffer = noiseBuf;
    const ng = audioCtx.createGain(); ng.gain.value = vol * 0.18;
    const nf = audioCtx.createBiquadFilter(); nf.type='bandpass'; nf.frequency.value=1200;
    n.connect(nf); nf.connect(ng); ng.connect(audioCtx.destination);
    n.start();
    ng.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + dur*0.5);
  }
}

let musicTimer = null;
let musicNote = 0;
let musicBeat = 0;
function startMusicForLevel(lvl) {
  if (musicTimer) clearTimeout(musicTimer);
  if (!audioCtx) return;
  musicNote = 0; musicBeat = 0;
  function tick() {
    if (gameState !== 'playing') return;
    const levelThemes = [
      // GREEN HILLS: upbeat major chiptune
      { lead: [659, 784, 880, 988, 880, 784, 659, 784], bass: [330, 392, 440], tempo: 105, vol: 0.09 },
      // DESERT DUNES: mysterious minor
      { lead: [523, 587, 659, 698, 659, 523, 494, 523], bass: [262, 294, 330], tempo: 125, vol: 0.1 },
      // AQUA RUINS: flowing aquatic
      { lead: [784, 880, 988, 1046, 1175, 1046, 880, 784], bass: [392, 440, 523], tempo: 98, vol: 0.08 },
      // COSMIC REALM: epic spacey
      { lead: [440, 523, 659, 880, 1046, 880, 659, 523], bass: [220, 262, 330, 392], tempo: 135, vol: 0.1 }
    ];
    const th = levelThemes[lvl % 4];
    const leadNote = th.lead[musicNote % th.lead.length];
    const bassNote = th.bass[musicBeat % th.bass.length];

    // Lead melody (richer)
    playSFX(leadNote, 0.085, 'sawtooth', th.vol * 0.9);
    // Bass layer for depth
    if (musicBeat % 2 === 0) playSFX(bassNote, 0.22, 'triangle', 0.065);
    // Hi-hat / perc chiptune
    if (musicBeat % 2 === 1) playSFX(1800 + (musicBeat%4)*80, 0.035, 'square', 0.035);
    // occasional arpeggio flourish
    if (musicNote % 5 === 0) {
      setTimeout(() => { if (gameState==='playing') playSFX(leadNote * 1.5, 0.04, 'sine', 0.04); }, 45);
    }

    musicNote++;
    musicBeat++;
    musicTimer = setTimeout(tick, th.tempo);
  }
  tick();
}

function stopMusic() {
  if (musicTimer) { clearTimeout(musicTimer); musicTimer = null; }
}

function createParticle(x, y, vx, vy, life, color, size=4) {
  particles.push({x, y, vx, vy, life, color, size});
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx; p.y += p.vy;
    p.vy += 0.18;
    p.vx *= 0.985; // slight drag for nicer trails
    p.life -= 1;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function spawnRingBurst(x, y, n=7, col='#facc15') {
  for (let i = 0; i < n; i++) {
    createParticle(x, y, (Math.random()-0.5)*5.5, (Math.random()-0.6)*4.5-2.5, 22 + Math.random()*12, col, 5);
  }
}

function resetLevel(lvlIdx) {
  currentLevel = lvlIdx;
  const L = levelData[lvlIdx];
  worldWidth = L.worldWidth;
  goalX = L.goalX;

  player.x = 110;
  player.y = 260;
  player.vx = 3.5;
  player.vy = 0;
  player.onGround = false;
  player.spin = false;
  player.facing = 1;
  player.frame = 0;
  player.animTimer = 0;

  rings = 0;
  if (currentLevel === 0 || gameState !== 'playing') score = 0;
  time = 0;
  collectedThisLevel = 0;
  secretsFound = 0;
  powerupType = null;
  powerupTimer = 0;

  platforms = JSON.parse(JSON.stringify(L.platforms));
  collectibles = [];
  powerUps = [];
  enemies = [];
  loops = JSON.parse(JSON.stringify(L.loops || []));
  particles = [];
  hazards = [];
  boss = null;

  // Add procedural themed hazards per world (spikes, quicksand pits, etc) - non-lethal enemies are the walking ones
  if (currentLevel === 0) { // green hills spikes
    hazards.push({x:650,y:365,w:38,h:18,type:'spike'},{x:1320,y:295,w:28,h:16,type:'spike'},{x:2090,y:165,w:30,h:16,type:'spike'});
  } else if (currentLevel === 1) { // desert - sand pits (slow/hurt)
    hazards.push({x:780,y:375,w:70,h:20,type:'quicksand'},{x:1680,y:375,w:55,h:20,type:'quicksand'});
  } else if (currentLevel === 2) { // aqua
    hazards.push({x:920,y:370,w:42,h:18,type:'spike'},{x:1810,y:180,w:36,h:14,type:'spike'});
  } else if (currentLevel === 3) { // cosmic energy orbs
    hazards.push({x:980,y:280,w:32,h:16,type:'energy'},{x:1750,y:230,w:44,h:14,type:'energy'});
  }

  // Spawn normal rings
  L.rings.forEach(([rx, ry]) => collectibles.push({x: rx, y: ry, r: 13, collected: false, isSecret: false}));

  // Secrets
  L.secrets.forEach(([rx, ry]) => collectibles.push({x: rx, y: ry, r: 14, collected: false, isSecret: true}));

  // Powerups
  L.powerups.forEach(p => powerUps.push({x: p.x, y: p.y, type: p.type, collected: false}));

  // Enemies
  L.enemies.forEach(e => enemies.push({x: e.x, y: e.y, w: 26, h: 26, vx: e.vx, alive: true}));

  // Boss on cosmic
  if (L.hasBoss) {
    boss = { x: goalX - 280, y: 210, w: 84, h: 70, vx: 1.2, hp: 4, phase: 0, timer: 0, alive: true };
  }

  cameraX = 0;

  document.getElementById('rings').textContent = '000';
  document.getElementById('score').textContent = String(score).padStart(6, '0');
  document.getElementById('time').textContent = '00';
  document.getElementById('levelName').textContent = L.name;

  powerHud.style.display = 'none';

  // initial particles sparkle
  for (let i = 0; i < 18; i++) createParticle(player.x + 20, player.y + 20, Math.random()*1.5-1, -1.5-Math.random()*2, 26, '#facc15');
}

function handleInput() {
  const accel = player.onGround ? 0.55 : 0.36;
  const maxRun = powerupType === 'speed' ? 15.5 : 12.5;

  if ((keys['ArrowLeft'] || keys['KeyA']) && player.vx > -maxRun) {
    player.vx -= accel;
    player.facing = -1;
  }
  if ((keys['ArrowRight'] || keys['KeyD']) && player.vx < maxRun) {
    player.vx += accel;
    player.facing = 1;
  }

  // Jump
  if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && player.onGround) {
    let jump = -14.2;
    if (player.vx > 7) jump = -14.8; // speed jump bonus
    player.vy = jump;
    player.onGround = false;
    playSFX(760, 0.095, 'sine', 0.35);
    for (let i=0; i<4; i++) createParticle(player.x + 16, player.y + player.height, (Math.random()-0.5)*1.5, 1.8, 9, '#ddd');
  }

  // Spin / spin-dash charge
  if (keys['ArrowDown'] || keys['KeyS']) {
    player.spin = true;
    if (player.onGround && Math.abs(player.vx) > 1.5) {
      player.vx *= 0.985;
    }
    // Spin dash charge: hold down + press space or jump to launch
    if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && player.onGround && Math.abs(player.vx) < 5) {
      player.vx = player.facing * 11.5;
      player.vy = -2;
      player.onGround = false;
      playSFX(520, 0.08, 'square', 0.4);
      for (let i=0; i<6; i++) createParticle(player.x+16, player.y+38, player.facing*(0.5+Math.random()*3), -0.6, 11, '#facc15');
    }
  } else {
    player.spin = false;
  }

  // Emergency brake / quick turn
  if ((keys['ArrowLeft'] || keys['KeyA']) && player.vx > 0.5) player.vx *= 0.86;
  if ((keys['ArrowRight'] || keys['KeyD']) && player.vx < -0.5) player.vx *= 0.86;
}

function updatePhysics() {
  const L = levelData[currentLevel];
  const grav = (powerupType === 'flight') ? 0.12 : 0.68;
  const friction = player.onGround ? 0.90 : 0.975;

  // gravity + flight assist + cape glide
  player.vy += grav;
  const isGlide = (keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && !player.onGround && player.vy > 0.5;
  if (powerupType === 'flight' && (keys['Space'] || keys['ArrowUp'] || keys['KeyW'])) {
    player.vy = Math.max(player.vy, -6.5);
    if (Math.random() < 0.4) createParticle(player.x + 18, player.y + 36, (Math.random()-0.5)*1, 1.6, 8, '#bae6fd');
  } else if (isGlide) {
    // Joshway cape glide for gorgeous control
    player.vy *= 0.92;
    player.vy = Math.min(player.vy, 3.2);
    if (Math.random() < 0.6) createParticle(player.x + 10 + player.facing*4, player.y + 8, player.facing * -0.8, 1.2, 11, '#f87171', 2);
  }

  player.x += player.vx;
  player.y += player.vy;

  player.vx *= friction;
  if (Math.abs(player.vx) < 0.06) player.vx = 0;

  // Clamp
  if (player.vx > 15.5) player.vx = 15.5;
  if (player.vx < -12) player.vx = -12;
}

function handleCollisions() {
  const L = levelData[currentLevel];
  player.onGround = false;

  // Platform collisions (improved)
  for (let p of platforms) {
    const px = p.x, py = p.y, pw = p.w, ph = p.h;
    if (player.x + player.width > px && player.x < px + pw &&
        player.y + player.height > py && player.y < py + ph) {

      // top landing
      if (player.vy >= 0 && (player.y + player.height - player.vy) <= py + 6) {
        player.y = py - player.height;
        player.vy = 0;
        player.onGround = true;
        if (player.spin && Math.abs(player.vx) > 3) {
          player.vx *= 0.72; // spin friction
        }
        if (Math.abs(player.vy) > 1 || Math.abs(player.vx) > 4) { // landing puff
          for (let i=0; i<3; i++) createParticle(player.x + 8 + Math.random()*20, player.y + player.height, (Math.random()-0.5)*1.2, 0.8, 7, '#ddd', 2);
        }
      }
      // bottom hit
      else if (player.vy < 0 && (player.y - player.vy) >= py + ph - 4) {
        player.y = py + ph;
        player.vy = 1.5;
      }
      // sides
      else if (player.vx > 0) {
        player.x = px - player.width;
        player.vx = Math.min(player.vx * -0.4, -1.2);
      } else if (player.vx < 0) {
        player.x = px + pw;
        player.vx = Math.max(player.vx * -0.4, 1.2);
      }
    }
  }

  // Hazards (spikes lose rings, quicksand slow, energy zap)
  hazards.forEach(h => {
    if (player.x + player.width > h.x && player.x < h.x + h.w &&
        player.y + player.height > h.y && player.y < h.y + h.h) {
      if (h.type === 'quicksand') {
        player.vx *= 0.6;
        player.vy *= 0.7;
        if (Math.random() < 0.2) createParticle(player.x + 17, player.y + player.height - 2, (Math.random()-0.5)*1, 0.5, 4, '#854d0e', 3);
      } else {
        // spike or energy hazard - hurt if not spinning fast
        if (!(player.spin && Math.abs(player.vx) > 4)) {
          if (rings > 0) {
            const lost = Math.min(2, rings);
            rings -= lost;
            spawnRingBurst(player.x + 16, player.y + 12, lost);
          } else {
            player.vy = -6; player.vx = -player.facing * 3;
          }
          playSFX(210, 0.1, 'sawtooth', 0.25);
        }
      }
    }
  });

  // Bounds
  if (player.x < 8) { player.x = 8; player.vx = Math.max(player.vx, 0.8); }
  const rightLimit = worldWidth - player.width - 12;
  if (player.x > rightLimit) {
    player.x = rightLimit;
    if (!player.onGround) player.vx *= 0.6;
  }
  if (player.y > 440) {
    // fall damage
    player.y = 280;
    player.vy = -7;
    if (rings > 0) {
      rings = Math.max(0, rings - 3);
      spawnRingBurst(player.x + 12, player.y + 10, 5);
      playSFX(260, 0.3, 'sawtooth', 0.3);
    } else {
      triggerDeath();
    }
  }

  // Loop de loops - momentum fun!
  for (let lp of loops) {
    const dx = (player.x + 17) - lp.x;
    const dy = (player.y + 22) - lp.y;
    const dist = Math.hypot(dx, dy);
    if (dist < lp.r + 22 && dist > 12 && Math.abs(player.vx) > 4.2) {
      const ang = Math.atan2(dy, dx);
      const targetR = lp.r + (player.spin ? -5 : 7);
      // snap to circular path
      player.x = lp.x + Math.cos(ang) * targetR - 17;
      player.y = lp.y + Math.sin(ang) * targetR - 22;
      // apply tangential velocity
      const tangent = player.vx * 0.96 + (player.facing * 0.7);
      player.vx = Math.cos(ang + Math.PI/2) * tangent * 1.08;
      player.vy = Math.sin(ang + Math.PI/2) * tangent * 1.08;
      if (Math.random() < 0.5) createParticle(lp.x, lp.y, 0, 0, 4, '#fef08c', 3);
      break;
    }
  }
}

function handleCollectibles() {
  const L = levelData[currentLevel];
  collectibles.forEach(c => {
    if (c.collected) return;
    const dx = player.x + 17 - c.x;
    const dy = player.y + 22 - c.y;
    if (Math.hypot(dx, dy) < (c.r + 15)) {
      c.collected = true;
      rings++;
      collectedThisLevel++;
      let pts = c.isSecret ? 450 : 120;
      if (powerupType === 'magnet') pts = Math.floor(pts * 1.35);
      score += pts;
      if (c.isSecret) secretsFound++;
      const pitch = (c.isSecret ? 1480 : 1180) + (rings % 8) * 55; // nice ascending combo pitch
      playSFX(pitch, 0.13, 'sine', c.isSecret ? 0.7 : 0.52);
      spawnRingBurst(c.x, c.y, c.isSecret ? 11 : 6, c.isSecret ? '#fde047' : L.ringColor);
      if (rings % 5 === 0) {
        score += 80;
        playSFX(1720, 0.1, 'sine', 0.4);
      }
    }
  });

  // Magnet rings attraction - gorgeous effect
  if (powerupType === 'magnet') {
    collectibles.forEach(c => {
      if (c.collected) return;
      const dx = (player.x + 17) - c.x;
      const dy = (player.y + 22) - c.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 220 && dist > 6) {
        const pull = 0.85 + (220 - dist) * 0.004;
        c.x += dx / dist * pull;
        c.y += dy / dist * pull;
        if (Math.random() < 0.35) createParticle(c.x, c.y, (dx/dist)*-1.5, (dy/dist)*-1.5 - 0.5, 6, '#a78bfa', 2);
      }
    });
  }

  // Power-ups
  powerUps.forEach(pu => {
    if (pu.collected) return;
    if (Math.hypot(player.x + 17 - pu.x, player.y + 22 - pu.y) < 28) {
      pu.collected = true;
      powerupType = pu.type;
      powerupTimer = (pu.type === 'speed' ? 420 : pu.type === 'magnet' ? 520 : 360);
      playSFX(920, 0.22, 'sine', 0.6);
      const col = pu.type === 'speed' ? '#f87171' : pu.type === 'magnet' ? '#a78bfa' : '#bae6fd';
      spawnRingBurst(pu.x, pu.y, 9, col);
      powerHud.style.display = 'block';
      powerHud.textContent = (pu.type === 'speed' ? '⚡ SPEED BOOST' : pu.type === 'magnet' ? '🧲 RING MAGNET' : '✈️ FLIGHT / CAPE');
    }
  });
}

function handleEnemiesAndBoss() {
  const L = levelData[currentLevel];
  // Regular enemies
  enemies.forEach(e => {
    if (!e.alive) return;
    e.x += e.vx;
    if (e.x < 40 || e.x > worldWidth - 70) e.vx *= -1;

    const hit = (Math.abs(player.x + 17 - (e.x + 13)) < 27 && Math.abs(player.y + 20 - (e.y + 12)) < 29);
    if (hit) {
      if ((player.spin || player.vy > 3) && player.y + 20 < e.y + 6) {
        // stomp
        e.alive = false;
        score += 420;
        playSFX(420, 0.18, 'square', 0.4);
        spawnRingBurst(e.x + 13, e.y + 8, 7, '#f87171');
        player.vy = -9.5;
      } else {
        // hurt player
        if (rings > 0) {
          const lost = Math.min(3, rings);
          rings -= lost;
          spawnRingBurst(player.x + 16, player.y + 18, lost + 1);
        }
        player.vx = player.facing * -6;
        player.vy = -3;
        playSFX(280, 0.25, 'sawtooth', 0.32);
      }
    }
  });

  // BOSS - enhanced epic patterns for final boss
  if (boss && boss.alive) {
    boss.timer++;
    boss.x += boss.vx;
    if (boss.x < goalX - 520 || boss.x > goalX + 80) boss.vx *= -1;

    // phase transitions
    if (boss.hp < 3 && boss.phase === 0) boss.phase = 1;
    if (boss.hp < 2 && boss.phase === 1) boss.phase = 2;

    // attack pattern - multi-phase
    const distToPlayer = Math.abs(boss.x - player.x);
    if (boss.timer % (boss.phase === 2 ? 28 : 48) === 0 && distToPlayer < 420) {
      const dir = boss.x < player.x ? 1 : -1;
      const numProj = boss.phase === 2 ? 5 : 3;
      for (let i=0; i<numProj; i++) {
        const spread = (i - Math.floor(numProj/2)) * 0.8;
        createParticle(boss.x + 42, boss.y + 38, dir * (6.5 + i*0.4) + spread, (Math.random()-0.5)*4 -1 + spread*0.3, 42 + boss.phase*4, '#c084fc', 5);
      }
      playSFX(380, 0.1, 'square', 0.28);
    }
    // swoop / charge attack in phase 2+
    if (boss.phase >= 1 && boss.timer % 82 === 0 && distToPlayer < 340) {
      boss.vx = (player.x > boss.x ? 4.2 : -4.2);
      boss.vy = player.y < boss.y ? -3.5 : 2.2;
      playSFX(280, 0.18, 'sawtooth', 0.35);
      for (let i=0;i<6;i++) createParticle(boss.x+20, boss.y+30, (Math.random()-0.5)*4, -2, 14, '#e0f2fe', 4);
    }
    // hover bob + vertical
    boss.y += boss.vy || 0;
    if (boss.phase > 0 && boss.timer % (boss.phase>1 ? 55 : 95) === 0) {
      boss.vy = (boss.y > 190 ? -3.2 : 2.5);
    }
    // clamp boss
    boss.y = Math.max(120, Math.min(boss.y, 260));

    // Boss collision improved with spin cape
    if (Math.abs(player.x + 17 - (boss.x + 42)) < 52 && Math.abs(player.y + 22 - (boss.y + 35)) < 48) {
      if ((player.spin || player.vy > 2) && player.y < boss.y + 20) {
        boss.hp--;
        score += 950;
        player.vy = -11;
        spawnRingBurst(boss.x + 42, boss.y + 30, 14, '#e0f2fe');
        playSFX(210, 0.35, 'sawtooth', 0.5);
        if (boss.hp <= 0) {
          boss.alive = false;
          for (let i=0;i<32;i++) createParticle(boss.x + 30 + Math.random()*40, boss.y + 20 + Math.random()*30, (Math.random()-0.5)*7, (Math.random()-0.5)*7-2, 32, '#c084fc', 3 + Math.random()*2);
          score += 5200;
          playSFX(650, 0.7, 'sine', 0.6);
        }
      } else {
        // hit by boss
        if (rings > 0) { rings = Math.max(0, rings - 4); spawnRingBurst(player.x+16, player.y+18, 6); }
        player.vx = -player.facing * 8.5;
        player.vy = -5.5;
        playSFX(190, 0.35, 'sawtooth', 0.4);
      }
    }
    // reset vy if needed
    if (Math.abs(boss.vy) > 0) boss.vy *= 0.96;
  }
}

function updatePowerups() {
  if (powerupTimer > 0) {
    powerupTimer--;
    if (powerupTimer <= 0) {
      powerupType = null;
      powerHud.style.display = 'none';
      playSFX(440, 0.12, 'sine', 0.3);
    } else if (powerupTimer % 28 === 0) {
      if (powerupType === 'speed') {
        createParticle(player.x + (player.facing > 0 ? -4 : 34), player.y + 38, player.facing * -3.5, 0.4, 7, '#f87171', 3);
      } else if (powerupType === 'magnet') {
        createParticle(player.x + 17, player.y + 10, (Math.random()-0.5)*3, -1, 5, '#a78bfa', 2);
      }
    }
  }
}

function updateCamera() {
  const target = player.x - 280;
  cameraX = cameraX * 0.84 + target * 0.16;
  cameraX = Math.max(0, Math.min(cameraX, worldWidth - 800));
}

function checkWinCondition() {
  const L = levelData[currentLevel];
  const reachedGoal = (player.x + player.width > goalX - 12);

  if (reachedGoal) {
    let bonus = Math.max(0, Math.floor(4200 - time * 38));
    if (secretsFound >= 2) bonus += 1200;
    const totalRingsInLevel = L.rings.length + L.secrets.length;
    const ringBonus = rings * 140;
    let perfectBonus = 0;
    if (collectedThisLevel >= totalRingsInLevel - 1) {
      perfectBonus = 1800;
      bonus += perfectBonus;
    }
    score += bonus + ringBonus;

    gameState = 'complete';
    stopMusic();

    // show overlay
    document.getElementById('completeOverlay').classList.add('active');
    document.getElementById('completeStats').innerHTML =
      `RINGS: ${rings} &nbsp;|&nbsp; SECRETS: ${secretsFound} &nbsp;|&nbsp; TIME: ${Math.floor(time)}s &nbsp;|&nbsp; BONUS: ${bonus}`;
    const msgEl = document.getElementById('completeMsg');
    let extra = perfectBonus > 0 ? ' ★ PERFECT CLEAR! ★' : '';
    if (currentLevel === 3) {
      msgEl.innerHTML = '★ ALL WORLDS CLEARED! YOU ARE A LEGEND! ★' + extra;
      saveHighScore(score);
    } else {
      msgEl.innerHTML = `WORLD CLEARED! Next: ${levelData[currentLevel + 1].name}` + extra;
    }
    playSFX(1040, 0.6, 'sine', 0.35);
    // confetti particles on win
    for (let i=0; i<26; i++) {
      createParticle(goalX - 50 + Math.random()*90, 210 + Math.random()*120, (Math.random()-0.5)*3.5, -1.5 - Math.random()*1.5, 30, ['#facc15','#4ade80','#67e8f9','#c084fc'][i%4], 3);
    }
  }
}

function triggerDeath() {
  stopMusic();
  gameState = 'over';
  document.getElementById('gameOverOverlay').classList.add('active');
  document.getElementById('finalScore').innerHTML = `FINAL SCORE: ${score}<br>RINGS: ${rings}`;
  saveHighScore(score);
}

function saveHighScore(newScore) {
  try {
    let hs = JSON.parse(localStorage.getItem('joshwayHighScores') || '[]');
    hs.push({ score: newScore, date: new Date().toISOString().slice(0,10) });
    hs.sort((a,b) => b.score - a.score);
    hs = hs.slice(0, 8);
    localStorage.setItem('joshwayHighScores', JSON.stringify(hs));
  } catch(e) {}
}

function update() {
  if (gameState !== 'playing') return;

  time += 1/60;

  handleInput();
  updatePhysics();
  handleCollisions();
  handleCollectibles();
  handleEnemiesAndBoss();
  updatePowerups();

  // enemy collision handled inside handleEnemiesAndBoss

  // Camera
  updateCamera();

  // Particles
  updateParticles();

  // Anim update
  player.animTimer++;
  if (player.animTimer % (player.onGround && Math.abs(player.vx) > 1.5 ? 3 : 7) === 0) {
    player.frame = (player.frame + 1) % 4;
  }

  // HUD
  const ringEl = document.getElementById('rings');
  ringEl.textContent = String(rings).padStart(3,'0');
  document.getElementById('score').textContent = String(Math.floor(score)).padStart(6,'0');
  document.getElementById('time').textContent = String(Math.floor(time)).padStart(2,'0');

  // Win?
  checkWinCondition();

  // Speed boost effect particles + dust trail polish
  if (Math.abs(player.vx) > 9 && player.onGround && Math.random() < 0.6) {
    createParticle(player.x + (player.facing>0 ? 4 : 28), player.y + 38, player.facing * -1.6, 1.3, 6, '#fef08c', 2);
  }
  if (player.onGround && Math.abs(player.vx) > 2.5 && Math.random() < 0.45) {
    createParticle(player.x + 8 + Math.random()*18, player.y + player.height - 1, player.facing * -1.8 - (Math.random()-0.5), 0.6, 5, '#ddd', 2);
  }
  // Magnet aura particles
  if (powerupType === 'magnet' && Math.random() < 0.7) {
    createParticle(player.x + 17 + (Math.random()-0.5)*36, player.y + 12 + Math.random()*22, (Math.random()-0.5)*0.8, -0.8, 7, '#a78bfa', 2);
  }
  // Ambient world particles for polish (bubbles in aqua, stars in cosmic, petals in green)
  if (Math.random() < 0.08) {
    if (currentLevel === 2) createParticle(50 + Math.random()*(worldWidth-100), 80 + Math.random()*140, (Math.random()-0.5)*0.6, 0.8, 18, '#67e8f9', 2);
    else if (currentLevel === 3) createParticle(30 + Math.random()*(worldWidth-60), 20 + Math.random()*160, (Math.random()-0.5)*0.4, 0.1, 32, '#c084fc', 1);
    else if (currentLevel === 0 && Math.random()<0.5) createParticle(80 + Math.random()*(worldWidth-160), 140 + Math.random()*80, -0.3, 0.3, 26, '#86efac', 2);
  }
}

function draw() {
  const L = levelData[currentLevel];
  ctx.save();
  ctx.translate(-Math.floor(cameraX), 0);

  // Sky / base fill per theme - tuned for gorgeous new parallax bgs
  const skyColors = ['#1e3a8a', '#451a03', '#164e63', '#312e81'];
  ctx.fillStyle = skyColors[currentLevel] || '#112';
  ctx.fillRect(cameraX, 0, 800, 450);

  // Background image parallax + extra gorgeous procedural layers
  let bgKey = ['bgGreen','bgDesert','bgWater','bgCosmic'][currentLevel];
  const bg = images[bgKey];
  if (bg && bg.complete) {
    const px = cameraX * 0.22;
    ctx.drawImage(bg, px % 800 - 800, 0, 800, 450);
    ctx.drawImage(bg, px % 800 , 0, 800, 450);
    ctx.drawImage(bg, px % 800 + 800, 0, 800, 450);
  }

  // Extra procedural far parallax details (clouds, dunes, stars, etc) - stunning visuals
  const farX = cameraX * 0.12;
  ctx.globalAlpha = 0.55;
  if (currentLevel === 0) { // green hills clouds & hills
    ctx.fillStyle = '#4ade80';
    for (let i=0; i<5; i++) {
      const cx = ((farX + i*320) % 1600) - 200; ctx.beginPath(); ctx.ellipse(cx+80, 80 + (i%2)*30, 90, 38, 0, 0, Math.PI*2); ctx.fill();
    }
  } else if (currentLevel === 1) { // desert dunes far
    ctx.fillStyle = '#c2410f';
    for (let i=0;i<4;i++) { const dx = ((farX + i*420) % 1700)-150; ctx.beginPath(); ctx.moveTo(dx,190); ctx.quadraticCurveTo(dx+110,110,dx+220,190); ctx.fill(); }
  } else if (currentLevel === 2) { // aqua mist
    ctx.fillStyle = '#67e8f9';
    for (let i=0;i<6;i++) { const ax = ((farX + i*260)%1400)-100; ctx.fillRect(ax, 70 + Math.sin(i)*15, 140, 35); }
  } else if (currentLevel === 3) { // cosmic nebulae/stars
    ctx.fillStyle = '#c084fc';
    for (let i=0; i<18; i++) {
      const sx = ((farX * 1.2 + i*97) % 900) + (i%3)*40; const sy = 40 + (i*23 % 140);
      ctx.fillRect(sx % (worldWidth*0.7), sy, 2, 2);
      if (i%4===0) ctx.fillRect(sx% (worldWidth*0.7)+1, sy+3,1,1);
    }
  }
  ctx.globalAlpha = 1;

  // Mid layer parallax
  let layerKey = ['layerGreen','layerDesert','layerWater','layerCosmic'][currentLevel];
  const layer = images[layerKey];
  if (layer && layer.complete) {
    const lx = cameraX * 0.48;
    ctx.globalAlpha = 0.88;
    ctx.drawImage(layer, lx % 800 - 800, 12, 800, 410);
    ctx.drawImage(layer, lx % 800, 12, 800, 410);
    ctx.drawImage(layer, lx % 800 + 800, 12, 800, 410);
    ctx.globalAlpha = 1;
  }

  // Additional mid procedural elements for depth - living world feel
  const midX = cameraX * 0.65;
  ctx.globalAlpha = 0.75;
  if (currentLevel === 0) {
    ctx.fillStyle = '#22c55e'; // trees/grass tufts
    for (let i=0; i<7; i++) {
      const tx = ((midX + i*310) % 2200) ; ctx.fillRect(tx, 320, 8, 60); ctx.fillRect(tx-6, 340, 22, 14);
    }
  } else if (currentLevel === 1) {
    ctx.fillStyle = '#a16207'; // desert rocks
    for (let i=0;i<5;i++) { const rx=((midX+i*380)%2500); ctx.beginPath(); ctx.arc(rx+18, 350, 17, 0, Math.PI*2); ctx.fill(); }
  } else if (currentLevel === 2) {
    ctx.fillStyle = '#0e7490'; ctx.globalAlpha=0.5; // water reeds
    for (let i=0;i<8;i++) { const wx = ((midX + i*270)%2600); ctx.fillRect(wx, 310, 3, 70); }
    ctx.globalAlpha = 0.75;
  } else if (currentLevel === 3) {
    ctx.fillStyle = '#e0f2fe';
    for (let i=0;i<12;i++) { const px=((midX*0.8 + i*170)%2900); ctx.fillRect(px, 60+(i%5)*25, 1, 1+ (i%3)); }
  }
  ctx.globalAlpha = 1;

  // Draw platforms themed + props
  const platCols = ['#166534', '#854d0e', '#164e63', '#581c87'];
  ctx.fillStyle = platCols[currentLevel];
  platforms.forEach(p => {
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = '#fff3';
    ctx.fillRect(p.x, p.y, p.w, 4);
    ctx.fillStyle = platCols[currentLevel];
    // simple theme decorations on platforms
    if (currentLevel === 0) { // grass tufts
      ctx.fillStyle = '#4ade80'; ctx.fillRect(p.x + 22, p.y - 3, 7, 5);
    } else if (currentLevel === 1) { // desert rocks
      ctx.fillStyle = '#a16207'; ctx.fillRect(p.x + p.w - 26, p.y + 3, 14, 7);
    }
  });

  // Draw hazards - gorgeous themed visuals
  hazards.forEach(h => {
    if (h.type === 'spike') {
      ctx.fillStyle = currentLevel === 0 ? '#166534' : '#334155';
      ctx.beginPath();
      ctx.moveTo(h.x, h.y + h.h);
      ctx.lineTo(h.x + h.w/2, h.y);
      ctx.lineTo(h.x + h.w, h.y + h.h);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f87171'; ctx.fillRect(h.x+3, h.y+h.h-4, h.w-6, 3);
    } else if (h.type === 'quicksand') {
      ctx.fillStyle = '#713f12';
      ctx.fillRect(h.x, h.y, h.w, h.h);
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(h.x+4, h.y+4, h.w-8, 6);
      for (let i=0; i<3; i++) ctx.fillRect(h.x + 8 + i*18, h.y + 8, 12, 4);
    } else if (h.type === 'energy') {
      ctx.fillStyle = '#581c87';
      ctx.fillRect(h.x, h.y, h.w, h.h);
      ctx.strokeStyle = '#c026ff'; ctx.lineWidth = 2;
      ctx.strokeRect(h.x+2, h.y+2, h.w-4, h.h-4);
      ctx.lineWidth = 1;
    }
  });
  ctx.fillStyle = platCols[currentLevel];

  // Draw loops (gorgeous ring visuals)
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 7;
  loops.forEach(lp => {
    ctx.beginPath();
    ctx.arc(lp.x, lp.y, lp.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#fef08c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(lp.x, lp.y, lp.r - 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 7;
  });

  // Extra foreground procedural props per world for depth & beauty
  ctx.globalAlpha = 0.9;
  if (currentLevel === 0) { // bushes flowers in hills
    ctx.fillStyle = '#15803d';
    for (let i=0; i<4; i++) {
      const fx = 420 + i * 520; ctx.fillRect(fx, 368, 28, 14); ctx.fillStyle='#4ade80'; ctx.fillRect(fx+6, 360, 4, 8);
    }
  } else if (currentLevel === 1) {
    ctx.fillStyle = '#78350f'; // desert pillars
    for (let i=0; i<3; i++) { const dx=680+i*680; ctx.fillRect(dx, 280, 16, 115); }
  } else if (currentLevel === 2) {
    ctx.fillStyle = '#164e63'; ctx.globalAlpha=0.65;
    for (let i=0; i<5; i++) { const bx = 310 + i*490; ctx.beginPath(); ctx.ellipse(bx, 410, 22, 8, 0, 0, Math.PI*2); ctx.fill(); } // bubbles base
  }
  ctx.globalAlpha = 1;

  // Collectibles - star rings
  const ringImg = images.starRing;
  const secretImg = images.secretRing;
  collectibles.forEach(c => {
    if (!c.collected) {
      const img = c.isSecret && secretImg && secretImg.complete ? secretImg : ringImg;
      if (img && img.complete) {
        const bob = Math.sin(Date.now()/160 + c.x) * 2.5;
        ctx.drawImage(img, c.x - c.r, c.y - c.r + bob, c.r*2, c.r*2);
      } else {
        ctx.fillStyle = c.isSecret ? '#fde047' : L.ringColor;
        ctx.beginPath(); ctx.arc(c.x, c.y + Math.sin(Date.now()/170)*2, c.r, 0, Math.PI*2); ctx.fill();
      }
    }
  });

  // Power-up orbs
  powerUps.forEach(pu => {
    if (pu.collected) return;
    const puImg = images.powerImg;
    if (puImg && puImg.complete && pu.type !== 'magnet') {
      const sx = pu.type === 'speed' ? 0 : 48;
      ctx.drawImage(puImg, sx, 0, 46, 46, pu.x - 22, pu.y - 22, 44, 44);
    } else {
      ctx.fillStyle = pu.type === 'speed' ? '#ef4444' : (pu.type === 'magnet' ? '#7c3aed' : '#38bdf8');
      ctx.fillRect(pu.x - 14, pu.y - 14, 28, 28);
      if (pu.type === 'magnet') {
        ctx.strokeStyle = '#fff'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(pu.x, pu.y, 9, 0, Math.PI*2); ctx.stroke(); ctx.lineWidth=1;
      }
    }
  });

  // Enemies
  const enImg = images.enemy;
  enemies.forEach(e => {
    if (!e.alive) return;
    if (enImg && enImg.complete) {
      ctx.drawImage(enImg, e.x, e.y, e.w, e.h);
    } else {
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(e.x, e.y, e.w, e.h);
    }
  });

  // Boss - enhanced gorgeous visuals with phase effects
  if (boss && boss.alive) {
    const bImg = images.bossImg;
    ctx.save();
    if (boss.phase > 0) {
      ctx.shadowColor = '#c026ff';
      ctx.shadowBlur = 8 + boss.phase * 3;
    }
    if (bImg && bImg.complete) {
      ctx.drawImage(bImg, boss.x, boss.y, boss.w, boss.h);
    } else {
      ctx.fillStyle = '#6b21a8';
      ctx.fillRect(boss.x, boss.y, boss.w, boss.h);
      ctx.fillStyle = '#f0abfc';
      ctx.fillRect(boss.x + 18, boss.y + 15, 48, 22);
    }
    ctx.restore();
    // pulsing aura in higher phases
    if (boss.phase >= 1) {
      ctx.globalAlpha = 0.3 + Math.sin(boss.timer * 0.1) * 0.15;
      ctx.fillStyle = '#c026ff';
      ctx.fillRect(boss.x - 6, boss.y - 4, boss.w + 12, boss.h + 8);
      ctx.globalAlpha = 1;
    }
    // hp bar
    ctx.fillStyle = '#111';
    ctx.fillRect(boss.x + 4, boss.y - 14, boss.w - 8, 8);
    ctx.fillStyle = '#c026ff';
    ctx.fillRect(boss.x + 5, boss.y - 13, (boss.w - 10) * (boss.hp / 4), 6);
    if (boss.phase === 2) {
      ctx.fillStyle = '#fff'; ctx.fillRect(boss.x + 5, boss.y - 13, (boss.w - 10) * (boss.hp / 4) * 0.3, 2);
    }
  }

  // Goal / finish - beautiful checkpoint with glow
  ctx.fillStyle = '#eab308';
  ctx.fillRect(goalX - 8, 180, 18, 200);
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 6; i++) ctx.fillRect(goalX - 6, 186 + i * 32, 14, 14);
  // flag flutter
  ctx.fillStyle = '#facc15';
  ctx.fillRect(goalX + 8, 175 + Math.sin(Date.now()/180)*4, 36, 22);
  ctx.fillStyle = '#000';
  ctx.fillRect(goalX + 12, 182 + Math.sin(Date.now()/180)*4, 8, 8);

  // Player using spritesheet or fallback - Joshway hero + procedural cape polish & effects
  let pImg = images.playerSheet;
  let useOld = false;
  if (!pImg || !pImg.complete) {
    pImg = images.playerOld;
    useOld = true;
  }
  ctx.save();
  if (pImg && pImg.complete) {
    if (useOld) {
      // original running sheet: 4 horizontal frames ~64px each
      const frameW = 64;
      const sx = Math.min(3, player.frame) * frameW;
      ctx.translate(player.x + 17, player.y + 22);
      if (player.facing < 0) ctx.scale(-1, 1);
      ctx.drawImage(pImg, sx, 0, frameW, 48, -17, -24, 34, 48);
    } else {
      const frameW = 64;
      const sx = (player.frame % 4) * frameW;
      const sy = player.spin ? 32 : (player.onGround ? 0 : 16);
      ctx.translate(player.x + 17, player.y + 22);
      if (player.facing < 0) ctx.scale(-1, 1);
      ctx.drawImage(pImg, sx, sy, frameW, 44, -17, -22, 34, 44);
    }
  } else {
    // fallback cute rect art
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = '#c026ff';
    ctx.fillRect(player.x + 6, player.y + 3, 22, 7);
    if (player.spin) {
      ctx.fillStyle = '#facc15';
      ctx.fillRect(player.x - 3, player.y + 8, player.width + 8, 5);
    }
  }
  ctx.restore();

  // Procedural cape trail / glow when gliding or powered - stunning
  if (!player.onGround && (powerupType === 'flight' || (Math.abs(player.vy) < 2 && player.vy > 0) || powerupType === 'magnet')) {
    ctx.save();
    ctx.translate(player.x + 17, player.y + 28);
    if (player.facing < 0) ctx.scale(-1, 1);
    ctx.globalAlpha = 0.6 + Math.sin(Date.now()/180) * 0.25;
    ctx.fillStyle = powerupType === 'flight' ? '#bae6fd' : powerupType === 'magnet' ? '#c4b5fd' : '#f87171';
    ctx.beginPath();
    ctx.moveTo(-6, 0);
    ctx.quadraticCurveTo(-14, 18, -3, 26);
    ctx.lineTo(5, 26);
    ctx.quadraticCurveTo(16, 16, 6, 0);
    ctx.fill();
    ctx.restore();
  }
  if (player.spin && Math.abs(player.vx) > 5) {
    // spin dash ring aura
    ctx.strokeStyle = 'rgba(250,204,21,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x + 17, player.y + 22, 26 + Math.sin(player.animTimer*0.5)*2, 0, Math.PI*2);
    ctx.stroke();
  }

  // Particles in world space
  particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(0.2, p.life / 26);
    ctx.fillRect(p.x, p.y, p.size || 4, p.size || 4);
  });
  ctx.globalAlpha = 1.0;

  ctx.restore(); // end camera

  // On screen speed lines when fast
  if (Math.abs(player.vx) > 7.5 && gameState === 'playing') {
    ctx.strokeStyle = 'rgba(254,249,140,0.5)';
    ctx.lineWidth = 1;
    for (let i=0; i<5; i++) {
      const ly = 80 + i * 68;
      ctx.beginPath();
      ctx.moveTo(40, ly);
      ctx.lineTo(190, ly + (player.vx > 0 ? 6 : -6));
      ctx.stroke();
    }
  }
}

function gameLoop() {
  if (gameState === 'playing') {
    update();
  }
  draw();
  requestAnimationFrame(gameLoop);
}

function initControls() {
  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') e.preventDefault();

    if (gameState === 'playing') {
      if (e.code === 'KeyR') {
        resetLevel(currentLevel);
        startMusicForLevel(currentLevel);
      }
    }
    if (gameState === 'complete' && (e.code === 'Space' || e.code === 'Enter')) {
      nextLevel();
    }
    if (gameState === 'over' && e.code === 'Space') {
      restartFromOver();
    }
    if (e.code === 'Escape' && gameState === 'playing') {
      gameState = 'title';
      document.getElementById('titleOverlay').classList.add('active');
      stopMusic();
    }
  });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });

  // Touch support - polished responsive: left/right zones + center jump + swipe down spin
  let touchStartX = 0, touchStartY=0;
  canvas.addEventListener('touchstart', (e) => {
    if (gameState !== 'playing') {
      // allow tapping overlays? but main handled
      return;
    }
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    const tx = touchStartX;
    const rect = canvas.getBoundingClientRect();
    const relX = tx - rect.left;
    if (relX < 220) { keys['ArrowLeft'] = true; keys['ArrowRight'] = false; }
    else if (relX > 580) { keys['ArrowRight'] = true; keys['ArrowLeft'] = false; }
    else { keys['Space'] = true; }
    e.preventDefault();
  });
  canvas.addEventListener('touchmove', (e) => {
    if (gameState !== 'playing') return;
    const tx = e.touches[0].clientX;
    const ty = e.touches[0].clientY;
    const rect = canvas.getBoundingClientRect();
    const relX = tx - rect.left;
    if (relX < 220) { keys['ArrowLeft'] = true; keys['ArrowRight'] = false; }
    else if (relX > 580) { keys['ArrowRight'] = true; keys['ArrowLeft'] = false; }
    if (ty - touchStartY > 35) { keys['ArrowDown'] = true; keys['Space'] = false; } // swipe down spin
    e.preventDefault();
  });
  canvas.addEventListener('touchend', () => {
    keys['ArrowLeft'] = keys['ArrowRight'] = keys['Space'] = keys['ArrowDown'] = false;
  });
}

function startGameFromTitle() {
  document.getElementById('titleOverlay').classList.remove('active');
  gameState = 'playing';
  currentLevel = 0;
  score = 0;
  resetLevel(0);
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  startMusicForLevel(0);
}
window.startGameFromTitle = startGameFromTitle;

function startLevel(lvl) {
  document.getElementById('titleOverlay').classList.remove('active');
  gameState = 'playing';
  currentLevel = lvl;
  if (lvl === 0) score = 0;
  resetLevel(lvl);
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  startMusicForLevel(lvl);
}
window.startLevel = startLevel;

function startGameFromStory() {
  hideStory();
  document.getElementById('titleOverlay').classList.remove('active');
  gameState = 'playing';
  currentLevel = 0;
  score = 0;
  resetLevel(0);
  startMusicForLevel(0);
}
window.startGameFromStory = startGameFromStory;

function showStory() {
  document.getElementById('titleOverlay').classList.remove('active');
  document.getElementById('storyOverlay').classList.add('active');
}
window.showStory = showStory;

function hideStory() {
  document.getElementById('storyOverlay').classList.remove('active');
  document.getElementById('titleOverlay').classList.add('active');
}
window.hideStory = hideStory;

function showHighScores() {
  document.getElementById('titleOverlay').classList.remove('active');
  const list = document.getElementById('highscoreList');
  let hs = [];
  try { hs = JSON.parse(localStorage.getItem('joshwayHighScores') || '[]'); } catch(e){}
  if (!hs.length) list.innerHTML = '<p style="opacity:0.7">No high scores yet. Be the first legend!</p>';
  else list.innerHTML = hs.map((h,i) => `${i+1}. <b>${h.score}</b> pts — ${h.date}`).join('<br>');
  document.getElementById('highScoresOverlay').classList.add('active');
}
window.showHighScores = showHighScores;

function hideHighScores() {
  document.getElementById('highScoresOverlay').classList.remove('active');
  document.getElementById('titleOverlay').classList.add('active');
}
window.hideHighScores = hideHighScores;

function nextLevel() {
  document.getElementById('completeOverlay').classList.remove('active');
  currentLevel++;
  if (currentLevel >= levelData.length) {
    // full game win
    gameState = 'over';
    document.getElementById('gameOverOverlay').classList.add('active');
    document.getElementById('finalScore').innerHTML = `★ VICTORY! FINAL SCORE: ${score} ★<br>ALL STAR RINGS RECOVERED!`;
    return;
  }
  gameState = 'playing';
  resetLevel(currentLevel);
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  startMusicForLevel(currentLevel);
}
window.nextLevel = nextLevel;

function restartCurrentLevel() {
  document.getElementById('completeOverlay').classList.remove('active');
  gameState = 'playing';
  resetLevel(currentLevel);
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  startMusicForLevel(currentLevel);
}
window.restartCurrentLevel = restartCurrentLevel;

function restartFromOver() {
  document.getElementById('gameOverOverlay').classList.remove('active');
  gameState = 'playing';
  currentLevel = 0;
  score = 0;
  resetLevel(0);
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  startMusicForLevel(0);
}
window.restartFromOver = restartFromOver;

function backToTitle() {
  document.getElementById('gameOverOverlay').classList.remove('active');
  document.getElementById('completeOverlay').classList.remove('active');
  document.getElementById('titleOverlay').classList.add('active');
  gameState = 'title';
  stopMusic();
}
window.backToTitle = backToTitle;

function init() {
  loadImages();
  initAudio();
  initControls();

  // Hide all overlays initially handled in html
  document.getElementById('powerHud').style.display = 'none';

  // Start with title visible
  gameState = 'title';

  // Boot on first level assets but don't start
  resetLevel(0);
  // but state title so draw happens with overlays

  gameLoop();

  // Easter egg: click canvas title to give speed
  canvas.addEventListener('click', () => {
    if (gameState === 'playing' && Math.abs(player.vx) < 3) player.vx = 8;
  });

  console.log('%c[JOSHWAY SPEED] Full production build ready. Gorgeous Sonic-like experience loaded!', 'color:#facc15');
}

init();
