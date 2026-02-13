import { useRef, useEffect, useCallback, useState } from 'react';
import confetti from 'canvas-confetti';
import { config } from '../../config/config';
import {
  sfxFlap, sfxCollectHeart, sfxPillarPass, sfxDie,
  sfxBossShoot, sfxBossExplode, sfxBossFreeze, sfxLevelComplete, sfxVictory,
  sfxCountdownTick, sfxCountdownGo,
} from '../utils/gameFeedback';

interface CupidGameProps {
  onBack: () => void;
}

// ─── Game types ──────────────────────────────────────────────────────

type GameScreen = 'countdown' | 'playing' | 'levelComplete' | 'gameOver' | 'bossFreeze' | 'bossExplode' | 'victory';

interface Player {
  x: number;
  y: number;
  vy: number;
  width: number;
  height: number;
}

interface Pillar {
  x: number;
  gapY: number;
  gapSize: number;
  width: number;
  passed: boolean;
  /** Sine-wave offset phase for level 2 moving pillars */
  phase: number;
}

interface Heart {
  x: number;
  y: number;
  collected: boolean;
}

interface Projectile {
  x: number;
  y: number;
  vx: number;
}

interface Boss {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  phase: number;
  /** Time since boss appeared (frames) */
  timer: number;
  /** Frames until next projectile */
  shootCooldown: number;
}

// ─── Level configs ───────────────────────────────────────────────────

interface LevelConfig {
  pillarCount: number;
  gapSize: number;
  speed: number;
  heartCount: number;
  movingPillars: boolean;
  /** Sine wave amplitude for moving pillars (px per frame) */
  pillarWaveAmplitude: number;
  hasBoss: boolean;
}

const LEVELS: LevelConfig[] = [
  { pillarCount: 6, gapSize: 240, speed: 1.2, heartCount: 4, movingPillars: false, pillarWaveAmplitude: 0, hasBoss: false },
  { pillarCount: 8, gapSize: 220, speed: 1.4, heartCount: 6, movingPillars: true, pillarWaveAmplitude: 0.4, hasBoss: false },
  { pillarCount: 10, gapSize: 205, speed: 1.6, heartCount: 7, movingPillars: true, pillarWaveAmplitude: 0.6, hasBoss: true },
];

// ─── Constants ───────────────────────────────────────────────────────

const GRAVITY = 0.20;
const FLAP_STRENGTH = -5;
const PILLAR_WIDTH = 52;
const PILLAR_SPACING = 250;
const PLAYER_SIZE = 32;
const HEART_SIZE = 24;
const BOSS_SIZE = 48;
const PROJECTILE_SIZE = 20;
const BOSS_SHOOT_INTERVAL = 90; // frames (~1.5 seconds at 60fps)
const BOSS_ADVANCE_SPEED = 0.4; // px per frame the player advances toward boss
const FRAME_MS = 1000 / 110; // physics step duration — targets 110 ticks/sec on all devices

// ─── Emoji sprite cache (pre-renders for consistent mobile display) ─

const emojiCache = new Map<string, HTMLCanvasElement>();

function getEmojiSprite(emoji: string, size: number): HTMLCanvasElement {
  const key = `${emoji}_${size}`;
  const cached = emojiCache.get(key);
  if (cached) return cached;

  const scale = 2; // render at 2x for crisp display
  const canvas = document.createElement('canvas');
  canvas.width = size * scale;
  canvas.height = size * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.font = `${size * scale * 0.75}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, canvas.width / 2, canvas.height / 2);

  emojiCache.set(key, canvas);
  return canvas;
}

/** Draw a cached emoji sprite centered at (cx, cy). */
function drawEmoji(ctx: CanvasRenderingContext2D, emoji: string, size: number, cx: number, cy: number): void {
  const sprite = getEmojiSprite(emoji, size);
  ctx.drawImage(sprite, cx - size / 2, cy - size / 2, size, size);
}

// ─── Helpers ─────────────────────────────────────────────────────────

function isDark(): boolean {
  return document.documentElement.classList.contains('dark');
}

function generatePillars(levelCfg: LevelConfig, canvasHeight: number): Pillar[] {
  const pillars: Pillar[] = [];
  const startX = 500;
  for (let i = 0; i < levelCfg.pillarCount; i++) {
    const minGapY = levelCfg.gapSize / 2 + 50;
    const maxGapY = canvasHeight - levelCfg.gapSize / 2 - 50;
    const gapY = minGapY + Math.random() * (maxGapY - minGapY);
    pillars.push({
      x: startX + i * PILLAR_SPACING,
      gapY,
      gapSize: levelCfg.gapSize,
      width: PILLAR_WIDTH,
      passed: false,
      phase: Math.random() * Math.PI * 2,
    });
  }
  return pillars;
}

function generateHearts(pillars: Pillar[], count: number): Heart[] {
  // Randomly select which pillars get hearts
  const indices = pillars.map((_, i) => i);
  // Shuffle (Fisher-Yates)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j]!, indices[i]!];
  }
  const selected = indices.slice(0, Math.min(count, pillars.length)).sort((a, b) => a - b);

  return selected.map(idx => {
    const p = pillars[idx]!;
    return {
      x: p.x + p.width / 2,
      y: p.gapY,
      collected: false,
    };
  });
}

// ─── Victory fireworks ───────────────────────────────────────────────

function triggerVictoryFireworks(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const duration = 4000;
  const end = Date.now() + duration;
  const colors = ['#ff1744', '#ff5252', '#ff6e40', '#ff9100', '#ffc400', '#e040fb', '#7c4dff'];

  const frame = () => {
    const timeLeft = end - Date.now();
    if (timeLeft <= 0) return;

    // Firework bursts from random positions
    confetti({
      particleCount: 40,
      startVelocity: 30,
      spread: 360,
      origin: { x: Math.random(), y: Math.random() * 0.4 },
      colors,
      gravity: 0.7,
      scalar: 1.3,
      ticks: 80,
      zIndex: 9999,
    });

    // Side cannons
    confetti({
      particleCount: 20,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
      zIndex: 9999,
    });
    confetti({
      particleCount: 20,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
      zIndex: 9999,
    });

    setTimeout(frame, 250);
  };

  frame();
}

// ─── Component ───────────────────────────────────────────────────────

export function CupidGame({ onBack }: CupidGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Game state in refs to avoid re-renders during game loop
  const screenRef = useRef<GameScreen>('countdown');
  const levelRef = useRef(0);
  const scoreRef = useRef(0);
  const bestScoreRef = useRef(0);
  const levelStartScoreRef = useRef(0);
  const countdownRef = useRef(3);
  const countdownTimerRef = useRef(0);
  const hasFlappedRef = useRef(false);
  const diedDuringBossRef = useRef(false);
  const explodeTimerRef = useRef(0);
  const explodePosRef = useRef({ x: 0, y: 0 });

  const playerRef = useRef<Player>({ x: 80, y: 200, vy: 0, width: PLAYER_SIZE, height: PLAYER_SIZE });
  const pillarsRef = useRef<Pillar[]>([]);
  const heartsRef = useRef<Heart[]>([]);
  const bossRef = useRef<Boss | null>(null);
  const projectilesRef = useRef<Projectile[]>([]);
  const frameRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);

  // React state for overlay screens only
  const [screen, setScreen] = useState<GameScreen>('countdown');
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [countdown, setCountdown] = useState(3);

  const canvasSizeRef = useRef({ w: 400, h: 500 });

  // ─── Resize canvas ──────────────────────────────────────────────

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const w = Math.min(rect.width, 700);
    const h = Math.min(rect.height - 60, 600);
    canvas.width = w;
    canvas.height = h;
    canvasSizeRef.current = { w, h };
  }, []);

  // ─── Drawing helpers ────────────────────────────────────────────

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const dark = isDark();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    if (dark) {
      grad.addColorStop(0, '#1e1b4b');
      grad.addColorStop(1, '#0f172a');
    } else {
      grad.addColorStop(0, '#fecdd3');
      grad.addColorStop(0.5, '#ffe4e6');
      grad.addColorStop(1, '#fff1f2');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Floating emoji clouds
    ctx.globalAlpha = 0.15;
    const t = frameRef.current * 0.01;
    drawEmoji(ctx, '☁️', 20, (w * 0.1 + Math.sin(t) * 20) % w, 60);
    drawEmoji(ctx, '✨', 20, (w * 0.5 + Math.sin(t + 1) * 30) % w, 40);
    drawEmoji(ctx, '☁️', 20, (w * 0.8 + Math.sin(t + 2) * 25) % w, 80);
    ctx.globalAlpha = 1;
  }, []);

  const drawPillar = useCallback((ctx: CanvasRenderingContext2D, x: number, gapY: number, gapSize: number, width: number, h: number) => {
    const dark = isDark();
    const topH = gapY - gapSize / 2;
    const bottomY = gapY + gapSize / 2;
    const radius = 8;

    // Top pillar
    const topGrad = ctx.createLinearGradient(x, 0, x + width, 0);
    if (dark) {
      topGrad.addColorStop(0, '#831843');
      topGrad.addColorStop(1, '#9d174d');
    } else {
      topGrad.addColorStop(0, '#f43f5e');
      topGrad.addColorStop(1, '#fb7185');
    }
    ctx.fillStyle = topGrad;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + width, 0);
    ctx.lineTo(x + width, topH - radius);
    ctx.quadraticCurveTo(x + width, topH, x + width - radius, topH);
    ctx.lineTo(x + radius, topH);
    ctx.quadraticCurveTo(x, topH, x, topH - radius);
    ctx.closePath();
    ctx.fill();

    // Bottom pillar
    const botGrad = ctx.createLinearGradient(x, bottomY, x + width, h);
    if (dark) {
      botGrad.addColorStop(0, '#9d174d');
      botGrad.addColorStop(1, '#831843');
    } else {
      botGrad.addColorStop(0, '#fb7185');
      botGrad.addColorStop(1, '#f43f5e');
    }
    ctx.fillStyle = botGrad;
    ctx.beginPath();
    ctx.moveTo(x + radius, bottomY);
    ctx.lineTo(x + width - radius, bottomY);
    ctx.quadraticCurveTo(x + width, bottomY, x + width, bottomY + radius);
    ctx.lineTo(x + width, h);
    ctx.lineTo(x, h);
    ctx.lineTo(x, bottomY + radius);
    ctx.quadraticCurveTo(x, bottomY, x + radius, bottomY);
    ctx.closePath();
    ctx.fill();
  }, []);

  /** Draw the full game scene (background, pillars, hearts, boss, player, HUD) */
  const drawScene = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const lvl = levelRef.current;
    const player = playerRef.current;
    const pillars = pillarsRef.current;
    const hearts = heartsRef.current;
    const boss = bossRef.current;

    drawBackground(ctx, w, h);

    // Pillars
    for (const p of pillars) {
      if (p.x + p.width < 0 || p.x > w) continue;
      drawPillar(ctx, p.x, p.gapY, p.gapSize, p.width, h);
    }

    // Hearts
    for (const heart of hearts) {
      if (heart.collected || heart.x < -HEART_SIZE || heart.x > w + HEART_SIZE) continue;
      drawEmoji(ctx, '💖', HEART_SIZE, heart.x, heart.y);
    }

    // Projectiles
    for (const proj of projectilesRef.current) {
      drawEmoji(ctx, '💔', PROJECTILE_SIZE, proj.x, proj.y);
    }

    // Boss
    if (boss) {
      drawEmoji(ctx, '😈', BOSS_SIZE, boss.x, boss.y);

      // Boss HP bar — full when far, depletes as player approaches
      const player = playerRef.current;
      const totalDist = boss.x - BOSS_SIZE / 2 - 80;
      const currentDist = boss.x - BOSS_SIZE / 2 - (player.x + player.width);
      const remaining = Math.max(0, Math.min(1, currentDist / totalDist));
      const barW = 80;
      const barH = 8;
      const barX = boss.x - barW / 2;
      const barY = boss.y - BOSS_SIZE / 2 - 16;
      ctx.fillStyle = '#4b5563';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = remaining > 0.5 ? '#22c55e' : remaining > 0.25 ? '#eab308' : '#ef4444';
      ctx.fillRect(barX, barY, barW * remaining, barH);
      ctx.strokeStyle = isDark() ? '#e5e7eb' : '#1f2937';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, barH);

      // Boss name
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillStyle = isDark() ? '#fda4af' : '#881337';
      ctx.textAlign = 'center';
      ctx.fillText(config.game.bossName, boss.x, barY - 8);
    }

    // Player (cupid emoji)
    drawEmoji(ctx, '💘', PLAYER_SIZE, player.x + player.width / 2, player.y + player.height / 2);

    // HUD
    const dark = isDark();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillStyle = dark ? '#fecdd3' : '#881337';
    ctx.fillText(`${config.game.scoreLabel}: ${scoreRef.current}`, 12, 12);
    ctx.textAlign = 'right';
    ctx.fillText(`${config.game.levelLabel} ${lvl + 1}`, w - 12, 12);
  }, [drawBackground, drawPillar]);

  // ─── Init level ─────────────────────────────────────────────────

  const initLevel = useCallback((lvl: number, resetScore: boolean, bossRespawn?: boolean) => {
    const cfg = LEVELS[lvl]!;
    const { w, h } = canvasSizeRef.current;
    playerRef.current = { x: 80, y: h * 0.4, vy: 0, width: PLAYER_SIZE, height: PLAYER_SIZE };
    projectilesRef.current = [];
    frameRef.current = 0;
    hasFlappedRef.current = false;
    diedDuringBossRef.current = false;
    screenRef.current = 'countdown';
    countdownRef.current = 3;
    countdownTimerRef.current = 0;

    if (bossRespawn && cfg.hasBoss) {
      // Skip pillars — go straight to boss fight
      pillarsRef.current = pillarsRef.current.map(p => ({ ...p, passed: true, x: -100 }));
      heartsRef.current = [];
      bossRef.current = {
        x: w - 80,
        y: h / 2,
        health: 1,
        maxHealth: 1,
        phase: 0,
        timer: 0,
        shootCooldown: BOSS_SHOOT_INTERVAL,
      };
    } else {
      pillarsRef.current = generatePillars(cfg, h);
      heartsRef.current = generateHearts(pillarsRef.current, cfg.heartCount);
      bossRef.current = null;
    }

    if (resetScore) {
      scoreRef.current = levelStartScoreRef.current;
      setScore(scoreRef.current);
    } else {
      levelStartScoreRef.current = scoreRef.current;
    }
    setScreen('countdown');
    setCountdown(3);
  }, []);

  // ─── Flap ───────────────────────────────────────────────────────

  const flap = useCallback(() => {
    if (screenRef.current === 'playing') {
      hasFlappedRef.current = true;
      playerRef.current.vy = FLAP_STRENGTH;
      sfxFlap();
    }
  }, []);

  // ─── Input handlers ─────────────────────────────────────────────

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        flap();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [flap]);

  // ─── Game loop ──────────────────────────────────────────────────

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── Delta-time scaling ──
    // Physics runs once per rendered frame, scaled by dt so speed is
    // identical on every device. FRAME_MS = 1000/110 (110fps target).
    // On 60fps: dt≈0.75. On slow mobile (30fps): dt≈1.5.
    const now = performance.now();
    const elapsed = Math.min(now - lastTimeRef.current, 100); // cap to avoid spiral
    lastTimeRef.current = now;
    const dt = Math.min(elapsed / FRAME_MS, 6); // float ratio, no rounding

    const { w, h } = canvasSizeRef.current;
    const currentScreen = screenRef.current;
    const lvl = levelRef.current;
    const cfg = LEVELS[lvl]!;

    // ── Countdown ──
    // Draw the frozen scene with countdown overlay
    if (currentScreen === 'countdown') {
      drawScene(ctx, w, h);

      // Semi-transparent overlay
      ctx.fillStyle = isDark() ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 241, 242, 0.5)';
      ctx.fillRect(0, 0, w, h);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Level name
      const dark = isDark();
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.fillStyle = dark ? '#fda4af' : '#881337';
      ctx.fillText(`${config.game.levelLabel} ${lvl + 1}: ${config.game.levelNames[lvl]}`, w / 2, h / 2 - 50);

      // Countdown number
      ctx.font = 'bold 72px system-ui, sans-serif';
      ctx.fillStyle = dark ? '#fecdd3' : '#e11d48';
      ctx.fillText(String(countdownRef.current), w / 2, h / 2 + 20);

      // Advance countdown timer by dt
      countdownTimerRef.current += dt;
      if (countdownTimerRef.current >= 60) {
        countdownTimerRef.current = 0;
        countdownRef.current--;
        setCountdown(countdownRef.current);
        if (countdownRef.current <= 0) {
          sfxCountdownGo();
          screenRef.current = 'playing';
          setScreen('playing');
        } else {
          sfxCountdownTick();
        }
      }

      rafRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    // ── Playing ──
    if (currentScreen === 'playing') {
      const player = playerRef.current;

      // Run physics once per frame, scaled by dt for smooth rendering
      frameRef.current += dt;

      if (hasFlappedRef.current) {
        // Gravity with exact semi-implicit Euler integration over dt steps:
        // Δy = v₀·dt + G·dt·(dt+1)/2 matches running dt discrete steps exactly.
        const vy_old = player.vy;
        player.vy += GRAVITY * dt;
        player.y += vy_old * dt + GRAVITY * dt * (dt + 1) / 2;

        // Move pillars
        const pillars = pillarsRef.current;
        for (const p of pillars) {
          p.x -= cfg.speed * dt;
          if (cfg.movingPillars) {
            p.gapY += Math.sin(frameRef.current * 0.03 + p.phase) * cfg.pillarWaveAmplitude * dt;
          }
        }

        // Move hearts with pillars
        const hearts = heartsRef.current;
        for (const heart of hearts) {
          heart.x -= cfg.speed * dt;
        }

        // Check pillar passing
        for (const p of pillars) {
          if (!p.passed && p.x + p.width < player.x) {
            p.passed = true;
            scoreRef.current += 1;
            setScore(scoreRef.current);
            sfxPillarPass();
          }
        }

        // Heart collection
        for (const heart of hearts) {
          if (heart.collected) continue;
          const dx = player.x + player.width / 2 - heart.x;
          const dy = player.y + player.height / 2 - heart.y;
          if (Math.sqrt(dx * dx + dy * dy) < (player.width / 2 + HEART_SIZE / 2)) {
            heart.collected = true;
            scoreRef.current += 3;
            setScore(scoreRef.current);
            sfxCollectHeart();
          }
        }

        // Collision with pillars
        for (const p of pillars) {
          if (
            player.x + player.width > p.x &&
            player.x < p.x + p.width
          ) {
            const topH = p.gapY - p.gapSize / 2;
            const bottomY = p.gapY + p.gapSize / 2;
            if (player.y < topH || player.y + player.height > bottomY) {
              sfxDie();
              if (scoreRef.current > bestScoreRef.current) {
                bestScoreRef.current = scoreRef.current;
                setBestScore(bestScoreRef.current);
              }
              screenRef.current = 'gameOver';
              setScreen('gameOver');
              rafRef.current = requestAnimationFrame(gameLoop);
              return;
            }
          }
        }

        // Ceiling clamp — hard boundary, not death
        if (player.y < 0) {
          player.y = 0;
          player.vy = 0;
        }

        // Floor death — only when fully off-screen below
        if (player.y + player.height > h + PLAYER_SIZE) {
          sfxDie();
          if (bossRef.current) {
            diedDuringBossRef.current = true;
          }
          if (scoreRef.current > bestScoreRef.current) {
            bestScoreRef.current = scoreRef.current;
            setBestScore(bestScoreRef.current);
          }
          screenRef.current = 'gameOver';
          setScreen('gameOver');
          rafRef.current = requestAnimationFrame(gameLoop);
          return;
        }

        // ── Boss logic (level 3) ──
        const boss = bossRef.current;
        const allPillarsPassed = pillars.every(p => p.passed);

        if (cfg.hasBoss && allPillarsPassed && !boss) {
          bossRef.current = {
            x: w - 80,
            y: h / 2,
            health: 1,
            maxHealth: 1,
            phase: 0,
            timer: 0,
            shootCooldown: BOSS_SHOOT_INTERVAL,
          };
        }

        if (boss) {
          boss.timer += dt;
          boss.phase += 0.04 * dt;
          boss.y = h / 2 + Math.sin(boss.phase) * (h * 0.35);

          // Player advances toward boss
          player.x += BOSS_ADVANCE_SPEED * dt;

          // Shoot frequency decreases as player gets closer
          const totalDist = boss.x - BOSS_SIZE / 2 - 80;
          const currentDist = boss.x - BOSS_SIZE / 2 - (player.x + player.width);
          const closeness = 1 - Math.max(0, Math.min(1, currentDist / totalDist));
          const adjustedInterval = BOSS_SHOOT_INTERVAL * (1 + closeness * 2);

          boss.shootCooldown -= dt;
          if (boss.shootCooldown <= 0) {
            boss.shootCooldown = adjustedInterval;
            sfxBossShoot();
            projectilesRef.current.push({
              x: boss.x,
              y: boss.y + BOSS_SIZE / 2,
              vx: -(cfg.speed + 2),
            });
          }

          const projectiles = projectilesRef.current;
          for (const proj of projectiles) {
            proj.x += proj.vx * dt;
          }
          projectilesRef.current = projectiles.filter(p => p.x > -PROJECTILE_SIZE);

          for (const proj of projectilesRef.current) {
            const dx = player.x + player.width / 2 - (proj.x + PROJECTILE_SIZE / 2);
            const dy = player.y + player.height / 2 - (proj.y + PROJECTILE_SIZE / 2);
            if (Math.sqrt(dx * dx + dy * dy) < (player.width / 2 + PROJECTILE_SIZE / 2) * 0.8) {
              sfxDie();
              if (scoreRef.current > bestScoreRef.current) {
                bestScoreRef.current = scoreRef.current;
                setBestScore(bestScoreRef.current);
              }
              diedDuringBossRef.current = true;
              screenRef.current = 'gameOver';
              setScreen('gameOver');
              rafRef.current = requestAnimationFrame(gameLoop);
              return;
            }
          }

          // Player reaches boss — freeze before explosion!
          const playerRight = player.x + player.width;
          const bossLeft = boss.x - BOSS_SIZE / 2;
          if (playerRight >= bossLeft) {
            if (scoreRef.current > bestScoreRef.current) {
              bestScoreRef.current = scoreRef.current;
              setBestScore(bestScoreRef.current);
            }
            explodePosRef.current = { x: boss.x, y: boss.y };
            explodeTimerRef.current = 0;
            sfxBossFreeze();
            screenRef.current = 'bossFreeze';
            setScreen('bossFreeze');
            rafRef.current = requestAnimationFrame(gameLoop);
            return;
          }
        }

        // Level complete (no boss level)
        if (!cfg.hasBoss && allPillarsPassed) {
          sfxLevelComplete();
          screenRef.current = 'levelComplete';
          setScreen('levelComplete');
          rafRef.current = requestAnimationFrame(gameLoop);
          return;
        }
      } else {
        // Before first tap: gentle bob, no scrolling
        player.y += Math.sin(frameRef.current * 0.05) * 0.3;
      }

      // Draw the scene (once per render frame)
      drawScene(ctx, w, h);

      // "Tap to start" hint before first flap
      if (!hasFlappedRef.current) {
        const dark = isDark();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 18px system-ui, sans-serif';
        ctx.fillStyle = dark ? '#fda4af' : '#881337';
        ctx.globalAlpha = 0.6 + Math.sin(frameRef.current * 0.08) * 0.4;
        ctx.fillText('Tap / Space to start!', w / 2, h - 40);
        ctx.globalAlpha = 1;
      }
    }

    // ── Boss freeze (pre-explosion) — still pause then trembling ──
    if (currentScreen === 'bossFreeze') {
      explodeTimerRef.current += dt;
      const t = explodeTimerRef.current;
      const stillDuration = 120;   // ~2s of true freeze (everything stops)
      const trembleDuration = 180; // ~3s of boss trembling
      const totalFreeze = stillDuration + trembleDuration; // ~5s total

      // Draw frozen scene
      drawScene(ctx, w, h);

      // Darkening overlay — builds slowly during still, faster during tremble
      const dark = isDark();
      const overlayAlpha = t < stillDuration
        ? 0.1 + (t / stillDuration) * 0.15
        : 0.25 + ((t - stillDuration) / trembleDuration) * 0.15;
      ctx.fillStyle = dark
        ? `rgba(15, 23, 42, ${overlayAlpha})`
        : `rgba(255, 241, 242, ${overlayAlpha})`;
      ctx.fillRect(0, 0, w, h);

      // Draw player
      const player = playerRef.current;
      drawEmoji(ctx, '💘', PLAYER_SIZE, player.x + player.width / 2, player.y + player.height / 2);

      const { x: bx, y: by } = explodePosRef.current;

      if (t <= stillDuration) {
        // ── Still phase: boss frozen in place, slight pulse ──
        const pulse = 1 + Math.sin(t * 0.15) * 0.03;
        const s = BOSS_SIZE * pulse;
        drawEmoji(ctx, '😈', s, bx, by);
      } else {
        // ── Tremble phase: boss shakes with increasing intensity ──
        const trembleT = t - stillDuration;
        const progress = trembleT / trembleDuration;
        const intensity = progress * 12; // shake gets stronger
        const shakeX = bx + (Math.random() - 0.5) * intensity;
        const shakeY = by + (Math.random() - 0.5) * intensity;

        // Boss flashes with increasing frequency
        ctx.globalAlpha = 0.6 + Math.sin(trembleT * (0.3 + progress * 0.8)) * 0.4;
        const sizeFlicker = 1 + Math.sin(trembleT * 0.4) * progress * 0.15;
        drawEmoji(ctx, '😈', BOSS_SIZE * sizeFlicker, shakeX, shakeY);
        ctx.globalAlpha = 1;

        // Pulsing warning glow — grows during tremble
        const glowRadius = 35 + progress * 25 + Math.sin(trembleT * 0.4) * 15;
        const glowAlpha = 0.1 + progress * 0.35;
        ctx.beginPath();
        ctx.arc(bx, by, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(239, 68, 68, ${glowAlpha})`;
        ctx.fill();

        // Inner glow ring
        if (progress > 0.4) {
          const innerAlpha = (progress - 0.4) * 0.5;
          ctx.beginPath();
          ctx.arc(bx, by, glowRadius * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(251, 191, 36, ${innerAlpha})`;
          ctx.fill();
        }
      }

      // HUD
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.fillStyle = dark ? '#fecdd3' : '#881337';
      ctx.fillText(`${config.game.scoreLabel}: ${scoreRef.current}`, 12, 12);
      ctx.textAlign = 'right';
      ctx.fillText(`${config.game.levelLabel} ${levelRef.current + 1}`, w - 12, 12);

      // Transition to explosion
      if (t >= totalFreeze) {
        explodeTimerRef.current = 0;
        sfxBossExplode();
        screenRef.current = 'bossExplode';
        setScreen('bossExplode');
      }

      rafRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    // ── Boss explosion animation ──
    if (currentScreen === 'bossExplode') {
      explodeTimerRef.current += dt;
      const t = explodeTimerRef.current;
      const { x: bx, y: by } = explodePosRef.current;
      const duration = 180; // ~3 seconds

      drawBackground(ctx, w, h);

      // Draw player standing victorious
      const player = playerRef.current;
      drawEmoji(ctx, '💘', PLAYER_SIZE, player.x + player.width / 2, player.y + player.height / 2);

      // Expanding shockwave rings — more rings, bigger, thicker
      const ringCount = 5;
      for (let i = 0; i < ringCount; i++) {
        const delay = i * 15;
        const ringT = t - delay;
        if (ringT <= 0) continue;
        const radius = ringT * 4;
        const alpha = Math.max(0, 1 - ringT / 55);
        ctx.beginPath();
        ctx.arc(bx, by, radius, 0, Math.PI * 2);
        const r = i % 2 === 0 ? 239 : 251;
        const g = i % 2 === 0 ? 68 : 146;
        const b = i % 2 === 0 ? 68 : 243;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.lineWidth = 4 - i * 0.5;
        ctx.stroke();
      }

      // Boss shrinks, spins, and fades
      if (t < 60) {
        const scale = Math.max(0, 1 - t / 60);
        const rotation = t * 0.2;
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(rotation);
        ctx.globalAlpha = scale;
        const s = BOSS_SIZE * (scale + 0.2);
        const sprite = getEmojiSprite('😈', BOSS_SIZE);
        ctx.drawImage(sprite, -s / 2, -s / 2, s, s);
        ctx.restore();
        ctx.globalAlpha = 1;
      }

      // First wave — burst emojis flying outward (more of them, larger)
      const bursts = ['💥', '✨', '💫', '⭐', '💥', '✨', '🔥', '💥', '⭐', '✨'];
      for (let i = 0; i < bursts.length; i++) {
        const angle = (i / bursts.length) * Math.PI * 2 + t * 0.015;
        const dist = t * 3;
        const alpha = Math.max(0, 1 - t / duration);
        const ex = bx + Math.cos(angle) * dist;
        const ey = by + Math.sin(angle) * dist;
        ctx.globalAlpha = alpha;
        drawEmoji(ctx, bursts[i]!, 28, ex, ey);
      }

      // Second wave — delayed inner burst
      if (t > 25) {
        const wave2 = ['💖', '💝', '💗', '💘', '💞', '💓'];
        for (let i = 0; i < wave2.length; i++) {
          const angle = (i / wave2.length) * Math.PI * 2 + Math.PI / 6;
          const dist = (t - 25) * 2.2;
          const alpha = Math.max(0, 1 - (t - 25) / (duration - 25));
          const ex = bx + Math.cos(angle) * dist;
          const ey = by + Math.sin(angle) * dist;
          ctx.globalAlpha = alpha;
          drawEmoji(ctx, wave2[i]!, 22, ex, ey);
        }
      }
      ctx.globalAlpha = 1;

      // Screen flash — bigger and with a secondary pulse
      if (t < 12) {
        ctx.fillStyle = `rgba(255, 255, 255, ${0.7 * (1 - t / 12)})`;
        ctx.fillRect(0, 0, w, h);
      } else if (t > 25 && t < 35) {
        // Secondary pulse flash
        const flashT = (t - 25) / 10;
        ctx.fillStyle = `rgba(251, 146, 243, ${0.3 * (1 - flashT)})`;
        ctx.fillRect(0, 0, w, h);
      }

      // HUD
      const dark = isDark();
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.fillStyle = dark ? '#fecdd3' : '#881337';
      ctx.fillText(`${config.game.scoreLabel}: ${scoreRef.current}`, 12, 12);
      ctx.textAlign = 'right';
      ctx.fillText(`${config.game.levelLabel} ${levelRef.current + 1}`, w - 12, 12);

      // Transition to victory
      if (t >= duration) {
        sfxVictory();
        screenRef.current = 'victory';
        setScreen('victory');
        triggerVictoryFireworks();
      }

      rafRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    // ── Static screens (gameOver / levelComplete / victory) ──
    if (currentScreen === 'gameOver' || currentScreen === 'levelComplete' || currentScreen === 'victory') {
      drawScene(ctx, w, h);
      ctx.fillStyle = isDark() ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 241, 242, 0.6)';
      ctx.fillRect(0, 0, w, h);
    }

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [drawScene]);

  // ─── Start / stop loop (mount-only) ─────────────────────────────

  useEffect(() => {
    resizeCanvas();
    lastTimeRef.current = performance.now();
    levelStartScoreRef.current = 0;
    scoreRef.current = 0;
    setScore(0);
    initLevel(0, false);
    rafRef.current = requestAnimationFrame(gameLoop);

    const handleResize = () => resizeCanvas();
    window.addEventListener('resize', handleResize);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Actions ────────────────────────────────────────────────────

  const handleNextLevel = () => {
    const next = levelRef.current + 1;
    if (next >= LEVELS.length) {
      if (scoreRef.current > bestScoreRef.current) {
        bestScoreRef.current = scoreRef.current;
        setBestScore(bestScoreRef.current);
      }
      screenRef.current = 'victory';
      setScreen('victory');
      triggerVictoryFireworks();
      return;
    }
    levelRef.current = next;
    setLevel(next);
    initLevel(next, false); // keep score between levels
  };

  const handleRetry = () => {
    const bossRetry = diedDuringBossRef.current;
    initLevel(levelRef.current, true, bossRetry);
  };

  const handleCanvasInteraction = () => {
    flap();
  };

  // ─── Render ─────────────────────────────────────────────────────

  const dark = isDark();
  const overlayBg = dark ? 'bg-slate-900/80' : 'bg-white/80';
  const textPrimary = dark ? 'text-rose-100' : 'text-rose-900';
  const textSecondary = dark ? 'text-rose-300' : 'text-rose-700';

  return (
    <div
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950 px-4 py-4 transition-colors duration-500"
    >
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-[700px] mb-3">
        <button
          type="button"
          onClick={onBack}
          className={`text-sm font-medium ${textSecondary} hover:underline`}
        >
          &larr; {config.game.backToQuiz}
        </button>
        <div className={`text-sm font-bold ${textPrimary}`}>
          {config.game.scoreLabel}: {score}
          {bestScore > 0 && <span className={`ml-2 ${textSecondary} font-normal`}>Best: {bestScore}</span>}
          &nbsp;|&nbsp; {config.game.levelLabel} {level + 1}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative w-full max-w-[700px]">
        <canvas
          ref={canvasRef}
          className="rounded-2xl shadow-2xl border border-white/40 dark:border-white/10 w-full cursor-pointer"
          onClick={handleCanvasInteraction}
          onTouchStart={(e) => {
            e.preventDefault();
            flap();
          }}
        />

        {/* Overlay screens rendered on top of canvas */}
        {screen === 'levelComplete' && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl ${overlayBg} backdrop-blur-sm`}>
            <div className="text-5xl mb-4">🎉</div>
            <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>
              {config.game.levelNames[level]} Complete!
            </h2>
            <p className={`text-lg ${textSecondary} mb-6`}>
              {config.game.scoreLabel}: {score}
            </p>
            <button
              type="button"
              onClick={handleNextLevel}
              className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
            >
              Next Level &rarr;
            </button>
          </div>
        )}

        {screen === 'gameOver' && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl ${overlayBg} backdrop-blur-sm`}>
            <div className="text-5xl mb-4">💔</div>
            <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>
              {config.game.gameOver}
            </h2>
            <p className={`text-lg ${textSecondary} mb-1`}>
              {config.game.scoreLabel}: {score}
            </p>
            {bestScore > 0 && (
              <p className={`text-sm ${textSecondary} mb-6`}>
                Best: {bestScore}
              </p>
            )}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleRetry}
                className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {config.game.tryAgain}
              </button>
              <button
                type="button"
                onClick={onBack}
                className="px-6 py-3 bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 text-rose-700 dark:text-rose-300 font-bold rounded-full shadow-lg border border-rose-200 dark:border-white/10 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {config.game.backToQuiz}
              </button>
            </div>
          </div>
        )}

        {screen === 'victory' && (
          <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl ${overlayBg} backdrop-blur-sm`}>
            <div className="text-5xl mb-4">🏆</div>
            <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>
              {config.game.victory}
            </h2>
            <p className={`text-lg ${textSecondary} mb-1`}>
              {config.game.victoryMessage}
            </p>
            <p className={`text-lg font-bold ${textPrimary} mb-6`}>
              {config.game.scoreLabel}: {score}
            </p>
            <button
              type="button"
              onClick={onBack}
              className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
            >
              {config.game.backToQuiz}
            </button>
          </div>
        )}
      </div>

      {/* Mobile tap hint */}
      {screen === 'playing' && (
        <p className={`mt-3 text-xs ${textSecondary} animate-pulse`}>
          Tap / Space / &uarr; to flap
        </p>
      )}
    </div>
  );
}
