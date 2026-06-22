// Joshway Speed - Gorgeous Sonic-like side scroller
// Beautiful world exploration, collect star rings, Joshway cape hero

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let rings = 0;
let score = 0;
let time = 0;
let gameOver = false;

const player = {
  x: 100,
  y: 300,
  vx: 4,
  vy: 0,
  width: 32,
  height: 48,
  onGround: false,
  spin: false
};

let keys = {};
let currentLevel = 0;
const levels = [
  { name: "Green Hills", bg: '/assets/sidescroller-bg.jpg', layer: '/assets/sidescroller-layer2.jpg', ringColor: '#facc15' },
  { name: "Cosmic Plains", bg: '/assets/sidescroller-bg.jpg', layer: '/assets/sidescroller-layer2.jpg', ringColor: '#3b82f6' }
];

let platforms = [
  { x: 0, y: 380, w: 800, h: 70 },
  { x: 200, y: 300, w: 150, h: 20 },
  { x: 450, y: 250, w: 120, h: 20 },
  { x: 650, y: 320, w: 100, h: 20 }
];

let collectibles = [];
let particles = [];
let enemies = [];

let bgX = 0;
let layerX = 0;

// Audio
let audioCtx;
function initAudio() { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }

function playSFX(f, d, t = 'square', v = 0.2) {
  if (!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = t; o.frequency.value = f;
  g.gain.value = v;
  o.connect(g); g.connect(audioCtx.destination);
  o.start();
  setTimeout(() => { g.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.1); o.stop(audioCtx.currentTime + 0.15); }, d * 1000);
}

let musicTimer;
function startSpeedMusic() {
  if (!audioCtx) return;
  if (musicTimer) clearTimeout(musicTimer);
  function loop() {
    if (gameOver) return;
    const notes = [523, 659, 784, 880, 784, 659];
    notes.forEach((f, i) => setTimeout(() => playSFX(f, 0.12, 'sawtooth', 0.12), i * 150));
    musicTimer = setTimeout(loop, 1100);
  }
  loop();
}

function resetLevel() {
  player.x = 80;
  player.y = 280;
  player.vx = 4;
  player.vy = 0;
  player.onGround = false;
  player.spin = false;
  rings = 0;
  score = 0;
  time = 0;
  collectibles = [];
  particles = [];
  enemies = [];
  bgX = 0;
  layerX = 0;

  // Spawn rings
  for (let i = 0; i < 8; i++) {
    collectibles.push({ x: 150 + i * 80, y: 200 + Math.sin(i) * 80, r: 12, collected: false });
  }

  // Enemies
  for (let i = 0; i < 3; i++) {
    enemies.push({ x: 300 + i * 150, y: 340, w: 24, h: 24, vx: 1.5 });
  }

  document.getElementById('rings').textContent = '000';
  document.getElementById('score').textContent = '000000';
}

function update() {
  if (gameOver) return;

  time += 1 / 60;

  // Input
  if ((keys['ArrowLeft'] || keys['KeyA']) && player.vx > -6) player.vx -= 0.4;
  if ((keys['ArrowRight'] || keys['KeyD']) && player.vx < 6) player.vx += 0.4;

  if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && player.onGround) {
    player.vy = -14;
    player.onGround = false;
    playSFX(700, 0.1, 'sine', 0.3);
  }

  if (keys['ArrowDown'] || keys['KeyS']) {
    player.spin = true;
  } else {
    player.spin = false;
  }

  // Physics
  player.vy += 0.6; // gravity
  player.x += player.vx;
  player.y += player.vy;

  // Friction
  player.vx *= 0.96;

  // Ground/platforms
  player.onGround = false;
  platforms.forEach(p => {
    if (player.x + player.width > p.x && player.x < p.x + p.w &&
        player.y + player.height > p.y && player.y + player.height - 10 < p.y + p.h && player.vy >= 0) {
      player.y = p.y - player.height;
      player.vy = 0;
      player.onGround = true;
    }
  });

  // Collect rings
  collectibles.forEach(c => {
    if (!c.collected) {
      const dx = player.x + 16 - c.x;
      const dy = player.y + 24 - c.y;
      if (Math.sqrt(dx*dx + dy*dy) < 22) {
        c.collected = true;
        rings++;
        score += 100;
        playSFX(1200, 0.15, 'sine', 0.5);
        createParticles(c.x, c.y, 8, '#facc15');
      }
    }
  });

  // Enemies
  enemies.forEach(e => {
    e.x += e.vx;
    if (e.x < 50 || e.x > 750) e.vx *= -1;

    // Hit player
    if (Math.abs(player.x - e.x) < 30 && Math.abs(player.y - e.y) < 30) {
      if (player.spin && player.vy > 0) {
        e.vx = 0; // "stomp"
        score += 300;
        playSFX(400, 0.2, 'square', 0.4);
        createParticles(e.x, e.y, 6, '#f97316');
      } else {
        // Hit, lose ring or slow
        if (rings > 0) rings--;
        player.vx = -player.vx * 0.5;
        playSFX(300, 0.3, 'sawtooth', 0.3);
      }
    }
  });

  // Bounds
  if (player.x < 20) player.x = 20;
  if (player.x > 780) player.x = 780;
  if (player.y > 400) {
    player.y = 300;
    player.vy = -8;
  }

  // Camera scroll
  bgX = (bgX - player.vx * 0.3) % 800;
  layerX = (layerX - player.vx * 0.6) % 800;

  updateParticles();
  document.getElementById('rings').textContent = String(rings).padStart(3, '0');
  document.getElementById('score').textContent = String(score).padStart(6, '0');
  document.getElementById('time').textContent = Math.floor(time);
}

function createParticles(x, y, n, col) {
  for (let i = 0; i < n; i++) {
    particles.push({ x, y, vx: (Math.random()-0.5)*5, vy: (Math.random()-0.5)*4-1, life: 15, color: col });
  }
}

function updateParticles() {
  particles = particles.filter(p => {
    p.x += p.vx; p.y += p.vy; p.vy += 0.2; p.life--;
    return p.life > 0;
  });
}

function draw() {
  ctx.fillStyle = '#1a2a44';
  ctx.fillRect(0, 0, 800, 450);

  // Parallax backgrounds
  const bg1 = new Image(); bg1.src = '/assets/sidescroller-bg.jpg';
  const bg2 = new Image(); bg2.src = '/assets/sidescroller-layer2.jpg';
  ctx.drawImage(bg1, bgX, 0, 800, 450);
  ctx.drawImage(bg1, bgX + 800, 0, 800, 450);
  ctx.globalAlpha = 0.7;
  ctx.drawImage(bg2, layerX, 50, 800, 350);
  ctx.drawImage(bg2, layerX + 800, 50, 800, 350);
  ctx.globalAlpha = 1;

  // Platforms
  ctx.fillStyle = '#228b22';
  platforms.forEach(p => ctx.fillRect(p.x, p.y, p.w, p.h));

  // Collectibles (rings)
  const ringImg = new Image(); ringImg.src = '/assets/star-ring.png';
  collectibles.forEach(c => {
    if (!c.collected) {
      ctx.drawImage(ringImg, c.x - 12, c.y - 12, 24, 24);
    }
  });

  // Enemies simple
  ctx.fillStyle = '#ef4444';
  enemies.forEach(e => {
    ctx.fillRect(e.x, e.y, e.w, e.h);
    ctx.fillStyle = '#fff';
    ctx.fillText('X', e.x + 6, e.y + 18);
  });

  // Player Joshway
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = '#f97316';
  ctx.fillRect(player.x + 4, player.y + 4, 24, 8); // cape hint
  if (player.spin) {
    ctx.fillStyle = '#facc15';
    ctx.fillRect(player.x - 4, player.y + 10, 40, 4);
  }

  // Particles
  particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.life / 15;
    ctx.fillRect(p.x, p.y, 4, 4);
  });
  ctx.globalAlpha = 1;

  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(200, 150, 400, 150);
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 32px monospace';
    ctx.fillText('LEVEL COMPLETE!', 230, 210);
    ctx.font = '18px monospace';
    ctx.fillText('Press R for next or SPACE to restart', 220, 260);
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function init() {
  initAudio();
  startSpeedMusic();

  window.addEventListener('keydown', e => { keys[e.code] = true; if (e.code === 'Space') e.preventDefault(); });
  window.addEventListener('keyup', e => keys[e.code] = false);

  resetLevel();

  // Title art overlay hint
  const titleImg = new Image();
  titleImg.onload = () => { /* could draw but main canvas game */ };

  gameLoop();

  // Simple win condition for demo
  setInterval(() => {
    if (rings >= 6 && !gameOver) {
      gameOver = true;
      // Auto advance or score bonus
      score += 2000;
    }
  }, 500);
}

init();