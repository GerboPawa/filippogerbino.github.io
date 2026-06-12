/* ============================================
   COMPOSER PORTFOLIO — script.js
   ============================================ */

// ─── NAV SCROLL ───────────────────────────────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ─── HAMBURGER (MOBILE) ────────────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
  const open = navLinks.dataset.open === '1';
  navLinks.dataset.open = open ? '0' : '1';
  Object.assign(navLinks.style, {
    display:        open ? 'none' : 'flex',
    position:       'fixed',
    top:            '70px',
    left:           '0',
    right:          '0',
    flexDirection:  'column',
    background:     'rgba(10,10,15,0.97)',
    padding:        '2rem',
    borderBottom:   '1px solid rgba(201,168,76,0.15)',
    gap:            '1.5rem',
    backdropFilter: 'blur(20px)',
    zIndex:         '99',
  });
});

// ─── SCORE CANVAS (HERO BACKGROUND) ──────────────────────────────────────────
const scoreCanvas = document.getElementById('scoreCanvas');
const sCtx        = scoreCanvas.getContext('2d');

function resizeScoreCanvas() {
  scoreCanvas.width  = window.innerWidth;
  scoreCanvas.height = window.innerHeight;
}
resizeScoreCanvas();
window.addEventListener('resize', resizeScoreCanvas);

const STAFF_LINES  = 5;
const LINE_SPACING = 14;
const STAFF_GAP    = 100;

function drawScore() {
  sCtx.clearRect(0, 0, scoreCanvas.width, scoreCanvas.height);
  sCtx.strokeStyle = 'rgba(201, 168, 76, 0.5)';
  sCtx.lineWidth   = 0.7;

  const numStaves = Math.ceil(scoreCanvas.height / (STAFF_LINES * LINE_SPACING + STAFF_GAP)) + 1;
  const t         = Date.now() * 0.00012;

  for (let s = 0; s < numStaves; s++) {
    const yBase = s * (STAFF_LINES * LINE_SPACING + STAFF_GAP) + 60;

    for (let l = 0; l < STAFF_LINES; l++) {
      const y = yBase + l * LINE_SPACING;
      sCtx.beginPath();
      sCtx.moveTo(0, y);
      sCtx.lineTo(scoreCanvas.width, y);
      sCtx.stroke();
    }

    const barWidth = 90;
    const numBars  = Math.ceil(scoreCanvas.width / barWidth) + 1;
    for (let b = 0; b < numBars; b++) {
      const x = b * barWidth;
      sCtx.beginPath();
      sCtx.moveTo(x, yBase);
      sCtx.lineTo(x, yBase + (STAFF_LINES - 1) * LINE_SPACING);
      sCtx.stroke();
    }

    sCtx.save();
    sCtx.font      = '38px serif';
    sCtx.fillStyle = 'rgba(201, 168, 76, 0.55)';
    sCtx.fillText('𝄞', 6, yBase + (STAFF_LINES - 1) * LINE_SPACING + 4);
    sCtx.restore();

    const notePositions = [0, 1, 2, 3, 4, 5, 6, 7];
    const noteSymbols   = ['♩', '♪', '♫', '𝅗𝅥', '𝅘𝅥𝅮'];
    const numNotes      = 6 + s % 4;

    for (let n = 0; n < numNotes; n++) {
      const noteX = 50 + n * (barWidth * 1.1) + ((s * 17 + n * 13) % 40);
      if (noteX > scoreCanvas.width - 20) continue;
      const pitch = notePositions[(s * 3 + n * 5) % notePositions.length];
      const noteY = yBase + (STAFF_LINES - 1) * LINE_SPACING - pitch * (LINE_SPACING / 2) + 6;
      const wave  = Math.sin(t + n * 0.9 + s * 1.5) * 1.5;
      sCtx.save();
      sCtx.font      = '14px serif';
      sCtx.fillStyle = `rgba(201, 168, 76, ${0.4 + Math.sin(t + n + s) * 0.15})`;
      sCtx.fillText(noteSymbols[n % noteSymbols.length], noteX, noteY + wave);
      sCtx.restore();
    }
  }
  requestAnimationFrame(drawScore);
}
drawScore();

// ─── SCROLL REVEAL ────────────────────────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const pipelineObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.pipeline-step').forEach((step, i) => {
        setTimeout(() => step.classList.add('visible'), i * 120);
      });
      pipelineObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.2 });

const pipelineCard = document.querySelector('.pipeline-card');
if (pipelineCard) pipelineObserver.observe(pipelineCard);

// ─── CTA FLOATING NOTES ───────────────────────────────────────────────────────
const ctaNotes   = document.getElementById('ctaNotes');
const NOTE_CHARS = ['♩', '♪', '♫', '♬', '𝄞', '𝅗𝅥'];

function spawnNote() {
  const el  = document.createElement('span');
  el.textContent = NOTE_CHARS[Math.floor(Math.random() * NOTE_CHARS.length)];
  const dur = 4 + Math.random() * 4;
  const del = Math.random() * 2;
  Object.assign(el.style, {
    position:    'absolute',
    left:        (Math.random() * 100) + '%',
    bottom:      '0',
    fontSize:    (1 + Math.random() * 1.5) + 'rem',
    color:       'rgba(201, 168, 76, 0.3)',
    animation:   `floatNote ${dur}s ${del}s ease-in both`,
    '--r':       ((Math.random() - 0.5) * 40) + 'deg',
    pointerEvents: 'none',
  });
  ctaNotes.appendChild(el);
  setTimeout(() => el.remove(), (dur + del) * 1000 + 500);
}
setInterval(spawnNote, 600);


// ═══════════════════════════════════════════════════════════════════════════════
//  WAVEFORM ENGINE
//  Each track gets its own unique pseudo-random shape, pre-generated once and
//  cached. On every animation frame we only redraw bars — no overlay div needed.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Seeded PRNG (mulberry32) ──────────────────────────────────────────────────
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ── Multi-octave noise for each track ────────────────────────────────────────
function generateWaveData(trackIndex, numBars) {
  const rand = mulberry32(trackIndex * 9973 + 1234);

  // Build random "control points" at low frequency, then interpolate + add harmonics
  const cp1Count = Math.floor(numBars / 12);
  const cp2Count = Math.floor(numBars / 5);
  const cp3Count = Math.floor(numBars / 2);

  const cp1 = Array.from({ length: cp1Count + 2 }, () => 0.15 + rand() * 0.85);
  const cp2 = Array.from({ length: cp2Count + 2 }, () => rand() * 0.5);
  const cp3 = Array.from({ length: cp3Count + 2 }, () => rand() * 0.25);

  function lerp(arr, t) {
    const scaled = t * (arr.length - 1);
    const i      = Math.floor(scaled);
    const f      = scaled - i;
    return (arr[i] ?? 0) * (1 - f) + (arr[Math.min(i + 1, arr.length - 1)] ?? 0) * f;
  }

  // Silence envelope: fade edges slightly for realism
  function envelope(i, total) {
    const x = i / total;
    const edgeFade = Math.min(x / 0.03, 1) * Math.min((1 - x) / 0.03, 1);
    return edgeFade;
  }

  const data = new Float32Array(numBars);
  for (let i = 0; i < numBars; i++) {
    const t   = i / numBars;
    const v   = lerp(cp1, t) * 0.6 + lerp(cp2, t) * 0.25 + lerp(cp3, t) * 0.15;
    data[i]   = Math.max(0.04, Math.min(1, v * envelope(i, numBars)));
  }
  return data;
}

// ── Draw waveform from cached data ────────────────────────────────────────────
// Colors
const COLOR_PLAYED   = '#C9A84C';
const COLOR_UNPLAYED = 'rgba(139,155,180,0.28)';
const COLOR_PLAYED_DIM = 'rgba(201,168,76,0.45)'; // paused state

function renderWaveform(canvas, waveData, progress, isPlaying) {
  const dpr = window.devicePixelRatio || 1;
  const W   = canvas.clientWidth;
  const H   = canvas.clientHeight;

  if (W === 0 || H === 0) return;

  // Only resize backing store when dimensions change
  if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
  }

  const ctx  = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const BAR_W   = 2.5;
  const GAP     = 1.5;
  const STEP    = BAR_W + GAP;
  const numBars = waveData.length;
  const totalW  = numBars * STEP - GAP;
  const offsetX = (W - totalW) / 2;

  const playedColor = isPlaying ? COLOR_PLAYED : COLOR_PLAYED_DIM;

  for (let i = 0; i < numBars; i++) {
    const x       = offsetX + i * STEP;
    const barH    = Math.max(2, waveData[i] * (H - 4));
    const y       = (H - barH) / 2;
    const pct     = i / numBars;
    const played  = pct < progress;

    ctx.fillStyle = played ? playedColor : COLOR_UNPLAYED;
    ctx.beginPath();
    ctx.roundRect(x, y, BAR_W, barH, 1.5);
    ctx.fill();

    // Playhead: glowing bar at current position
    if (progress > 0 && Math.abs(pct - progress) < (1 / numBars) * 1.5) {
      ctx.fillStyle = 'rgba(255, 220, 120, 0.9)';
      ctx.beginPath();
      ctx.roundRect(x, 0, BAR_W, H, 1.5);
      ctx.fill();
    }
  }
}

// ── Per-track state store ─────────────────────────────────────────────────────
const trackStates = new Map(); // element → { waveData, progress, isPlaying }

function initTrackWaveform(item, trackIndex) {
  const canvas  = item.querySelector('.waveform-canvas');

  // Wait for layout to be ready
  requestAnimationFrame(() => {
    const W    = canvas.clientWidth || 300;
    const STEP = 4;
    const num  = Math.floor(W / STEP);

    const waveData = generateWaveData(trackIndex, num);
    trackStates.set(item, { waveData, progress: 0, isPlaying: false });
    renderWaveform(canvas, waveData, 0, false);
  });
}

// Initialise all tracks
document.querySelectorAll('.track-item').forEach((item, i) => {
  initTrackWaveform(item, i);
});

// Re-init on resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    document.querySelectorAll('.track-item').forEach((item, i) => {
      initTrackWaveform(item, i);
    });
  }, 150);
});


// ═══════════════════════════════════════════════════════════════════════════════
//  AUDIO PLAYER
// ═══════════════════════════════════════════════════════════════════════════════
const audio       = document.getElementById('globalAudio');
let   currentItem = null;
let   rafId       = null;

function formatTime(s) {
  if (!isFinite(s) || isNaN(s)) return '—:——';
  const m   = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

// ── Animate progress on every frame ──────────────────────────────────────────
function tick() {
  if (!currentItem || !audio.duration) {
    rafId = requestAnimationFrame(tick);
    return;
  }

  const progress = audio.currentTime / audio.duration;
  const state    = trackStates.get(currentItem);
  if (state) {
    state.progress  = progress;
    state.isPlaying = !audio.paused;
    const canvas = currentItem.querySelector('.waveform-canvas');
    renderWaveform(canvas, state.waveData, progress, !audio.paused);
  }

  currentItem.querySelector('.current-time').textContent = formatTime(audio.currentTime);
  currentItem.querySelector('.duration').textContent     = formatTime(audio.duration);

  rafId = requestAnimationFrame(tick);
}
rafId = requestAnimationFrame(tick); // start loop immediately

// ── UI helpers ────────────────────────────────────────────────────────────────
function setPlaying(item, playing) {
  item.querySelector('.icon-play').classList.toggle('hidden', playing);
  item.querySelector('.icon-pause').classList.toggle('hidden', !playing);
  item.classList.toggle('active', playing);
}

function resetItem(item) {
  setPlaying(item, false);
  const state = trackStates.get(item);
  if (state) {
    state.progress  = 0;
    state.isPlaying = false;
    renderWaveform(item.querySelector('.waveform-canvas'), state.waveData, 0, false);
  }
  item.querySelector('.current-time').textContent = '0:00';
}

// ── Seek via waveform click ───────────────────────────────────────────────────
function seekFromClick(item, clientX) {
  if (!audio.duration) return;
  const wf   = item.querySelector('.track-waveform');
  const rect = wf.getBoundingClientRect();
  const pct  = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  audio.currentTime = pct * audio.duration;
}

// ── Wire up each track ────────────────────────────────────────────────────────
document.querySelectorAll('.track-item').forEach(item => {
  const src = item.dataset.src;

  // Waveform: seek on click / drag
  const waveEl = item.querySelector('.track-waveform');

  let dragging = false;

  waveEl.addEventListener('mousedown', e => {
    e.stopPropagation();
    if (currentItem === item) {
      dragging = true;
      seekFromClick(item, e.clientX);
    }
  });

  window.addEventListener('mousemove', e => {
    if (dragging && currentItem === item) seekFromClick(item, e.clientX);
  });

  window.addEventListener('mouseup', () => { dragging = false; });

  // Touch seek
  waveEl.addEventListener('touchstart', e => {
    e.stopPropagation();
    if (currentItem === item) seekFromClick(item, e.touches[0].clientX);
  }, { passive: true });

  // Play / pause via row click (excluding waveform — handled above)
  item.addEventListener('click', e => {
    if (waveEl.contains(e.target)) return; // handled by waveform listeners

    if (currentItem === item) {
      // toggle
      if (audio.paused) {
        audio.play();
        setPlaying(item, true);
      } else {
        audio.pause();
        setPlaying(item, false);
      }
    } else {
      // switch to new track
      if (currentItem) resetItem(currentItem);
      currentItem = item;
      audio.src = src;
      audio.play().catch(err => console.info('Audio:', err));
      setPlaying(item, true);
    }
  });
});

// ── Global audio events ───────────────────────────────────────────────────────
audio.addEventListener('ended', () => {
  if (currentItem) resetItem(currentItem);
  currentItem = null;
});

audio.addEventListener('loadedmetadata', () => {
  if (currentItem) {
    currentItem.querySelector('.duration').textContent = formatTime(audio.duration);
  }
});
