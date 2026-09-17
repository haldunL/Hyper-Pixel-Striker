// Common helper functions, palettes, and rendering primitives for 16-bit fighters
import { FighterState } from '../../types/game';

// 16-BIT SNES COLOR PALETTES
export const SF_PALETTES = {
  kasumi: {
    ink: '#0b0c10',
    skinDark: '#8a4325',
    skinShadow: '#ba6b44',
    skinMid: '#e89e78',
    skinHi: '#ffdfcc',
    skinBlush: '#f43f5e',
    hairInk: '#020617',
    hairDark: '#0f172a',
    hairMid: '#1e293b',
    hairHi: '#38bdf8',
    blouseShadow: '#475569',
    blouseMid: '#94a3b8',
    blouseBase: '#e2e8f0',
    blouseHi: '#ffffff',
    navyDark: '#020617',
    navyShadow: '#0f172a',
    navyMid: '#1e3a8a',
    navyHi: '#3b82f6',
    ribbonShadow: '#7f1d1d',
    ribbonMid: '#dc2626',
    ribbonHi: '#f87171',
    sockShadow: '#05070c',
    sockMid: '#0f172a',
    shoeShadow: '#261212',
    shoeMid: '#4a2424',
    shoeHi: '#7c3a3a',
    ki: '#ec4899',
    kiMid: '#f472b6',
  },
  roxie: {
    ink: '#09090b',
    skinDark: '#7c2d12',
    skinShadow: '#ab5d3e',
    skinMid: '#dc8d69',
    skinHi: '#ffdfcc',
    hairDark: '#450a0a',
    hairShadow: '#991b1b',
    hairMid: '#dc2626',
    hairHi: '#f87171',
    topDark: '#090d16',
    topShadow: '#1e293b',
    topMid: '#334155',
    topHi: '#64748b',
    pantsInk: '#09090b',
    pantsDark: '#18181b',
    pantsMid: '#27272a',
    pantsHi: '#3f3f46',
    stripeShadow: '#9f1239',
    stripeMid: '#f43f5e',
    stripeHi: '#fda4af',
    wrapShadow: '#831843',
    wrapMid: '#ec4899',
    wrapHi: '#fbcfe8',
    bootShadow: '#09090b',
    bootMid: '#18181b',
    bootHi: '#3f3f46',
    ki: '#ec4899',
    kiMid: '#f472b6',
  },
  kenzo: {
    ink: '#0a0a0c',
    skinDark: '#5e2308',
    skinShadow: '#8c4826',
    skinMid: '#bf6b3d',
    skinHi: '#f5a478',
    giShadow: '#57534e',
    giFold: '#78716c',
    giMid: '#e7e5e4',
    giHi: '#ffffff',
    beltDark: '#09090b',
    beltMid: '#18181b',
    beltGold: '#eab308',
    beltGoldHi: '#fef08a',
    bandanaShadow: '#7f1d1d',
    bandanaMid: '#dc2626',
    bandanaHi: '#f87171',
    wrapShadow: '#7f1d1d',
    wrapMid: '#dc2626',
    wrapHi: '#fca5a5',
    hairDark: '#050505',
    hairMid: '#1a1a1a',
    ki: '#059669',
    kiMid: '#10b981',
  },
  marcus: {
    ink: '#050508',
    skinDark: '#261205',
    skinShadow: '#4a240c',
    skinMid: '#7c3f18',
    skinHi: '#ad5a24',
    skinSheen: '#d67c42',
    hairDark: '#050505',
    hairMid: '#171717',
    gloveShadow: '#7f1d1d',
    gloveMid: '#dc2626',
    gloveHi: '#ef4444',
    gloveSheen: '#fca5a5',
    trunksShadow: '#064e3b',
    trunksMid: '#059669',
    trunksHi: '#10b981',
    trunksGold: '#eab308',
    beltBorder: '#713f12',
    beltMid: '#ca8a04',
    beltHi: '#eab308',
    beltGoldHi: '#fef08a',
    bootShadow: '#09090b',
    bootMid: '#1e293b',
    bootHi: '#334155',
    ki: '#d97706',
    kiMid: '#fbbf24',
  },
  raizen: {
    ink: '#030008',
    skinDark: '#3b2042',
    skinShadow: '#582d61',
    skinMid: '#865d91',
    skinHi: '#cbb6d4',
    hairDark: '#334155',
    hairMid: '#94a3b8',
    hairHi: '#f8fafc',
    eyes: '#ef4444',
    giShadow: '#090514',
    giMid: '#1e1138',
    giHi: '#3b1c6e',
    trimCrimson: '#dc2626',
    trimGold: '#fbbf24',
    beltDark: '#090514',
    beltMid: '#7c3aed',
    beltHi: '#a78bfa',
    armorDark: '#0f172a',
    armorMid: '#1e293b',
    armorHi: '#475569',
    ki: '#8b5cf6',
    kiMid: '#c084fc',
    kiCore: '#f43f5e',
  },
};

// Draw filled polygon with crisp ink outline
export function drawPoly(
  ctx: CanvasRenderingContext2D,
  pts: [number, number][],
  fillColor: string,
  strokeColor: string = '#0a0a0f',
  strokeWidth: number = 2
) {
  if (pts.length < 3) return;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) {
    ctx.lineTo(pts[i][0], pts[i][1]);
  }
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  if (strokeWidth > 0 && strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineJoin = 'round';
    ctx.stroke();
  }
  ctx.restore();
}

// Draw stylized motion swoosh arc
export function drawMotionArc(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
  color: string,
  width: number = 8
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, endAngle);
  ctx.stroke();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = Math.max(2, width - 4);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, startAngle, endAngle);
  ctx.stroke();
  ctx.restore();
}

// Draw block barrier when actively guarding
export function drawBlockShield(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  isCrouch: boolean,
  animTimer: number
) {
  ctx.save();
  const shieldX = 36;
  const shieldY = isCrouch ? -48 : -75;
  const pulse = Math.sin(animTimer * 20) * 4;

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.9)';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  const r = 36 + pulse;
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const px = shieldX + Math.cos(a) * (r * 0.75);
    const py = shieldY + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();

  ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(shieldX - 14, shieldY);
  ctx.lineTo(shieldX + 14, shieldY);
  ctx.moveTo(shieldX, shieldY - 18);
  ctx.lineTo(shieldX, shieldY + 18);
  ctx.stroke();
  ctx.restore();
}

// Human Face Drawer: almond eyes with white sclera, colored iris, pupil, highlight, nose and mouth
export function drawHumanFace(
  ctx: CanvasRenderingContext2D,
  fx: number,
  fy: number,
  irisColor: string,
  state: string,
  isFemale: boolean,
  blushColor?: string
) {
  // 1. Nose
  ctx.strokeStyle = '#3a1a0d';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(fx + 6, fy + 4);
  ctx.lineTo(fx + 8, fy + 8);
  ctx.lineTo(fx + 5, fy + 9);
  ctx.stroke();

  // 2. Eyes
  if (state === 'hit' || state === 'knockdown') {
    // Wincing clenched shut eyes '>'
    ctx.strokeStyle = '#180a05';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + 5, fy + 3);
    ctx.lineTo(fx, fy + 6);
    ctx.stroke();
  } else {
    // Eyebrow: angled determined fighter brow
    ctx.strokeStyle = '#0f0703';
    ctx.lineWidth = isFemale ? 1.8 : 2.8;
    ctx.beginPath();
    ctx.moveTo(fx - 4, fy - 3);
    ctx.lineTo(fx + 2, fy - 5);
    ctx.lineTo(fx + 7, fy - 3);
    ctx.stroke();

    // Eye Sclera (White of the eye)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(fx + 2, fy + 1, 5, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e0c04';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Iris
    ctx.fillStyle = irisColor;
    ctx.beginPath();
    ctx.arc(fx + 3, fy + 1, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#050201';
    ctx.beginPath();
    ctx.arc(fx + 3.2, fy + 1, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Specular Shine
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(fx + 2, fy - 0.5, 1.2, 1.2);
  }

  // 3. Mouth
  if (state === 'attack' || state === 'special') {
    // Open shouting mouth (battle yell / kiai)
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.ellipse(fx + 3, fy + 14, 3.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#180a05';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // Upper teeth flash
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(fx + 1, fy + 12, 4, 1.5);
  } else if (state === 'hit') {
    // Grimacing grit
    ctx.strokeStyle = '#180a05';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fx - 1, fy + 14);
    ctx.lineTo(fx + 6, fy + 13);
    ctx.stroke();
  } else {
    // Natural determined mouth line
    ctx.strokeStyle = '#3a1a0d';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(fx, fy + 13);
    ctx.lineTo(fx + 5, fy + 13);
    ctx.stroke();
    // Lower lip shadow
    ctx.strokeStyle = '#8a4325';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(fx + 1, fy + 15);
    ctx.lineTo(fx + 4, fy + 15);
    ctx.stroke();
  }

  // 4. Subtle Cheek Blush for female fighters
  if (isFemale && blushColor) {
    ctx.fillStyle = blushColor;
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(fx - 1, fy + 6, 4, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
}

// Ear with inner shadow
export function drawHumanEar(ctx: CanvasRenderingContext2D, ex: number, ey: number, skinMid: string, skinShadow: string) {
  ctx.fillStyle = skinMid;
  ctx.strokeStyle = '#180a05';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(ex, ey, 3.5, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = skinShadow;
  ctx.beginPath();
  ctx.arc(ex + 0.5, ey, 2, 0, Math.PI * 2);
  ctx.fill();
}

// Ki Energy Flare Burst Helper
export function drawKiBurst(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, radius: number = 24) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const r1 = radius * 0.4;
    const r2 = radius * (i % 2 === 0 ? 1.2 : 0.8);
    ctx.moveTo(x + Math.cos(a) * r1, y + Math.sin(a) * r1);
    ctx.lineTo(x + Math.cos(a) * r2, y + Math.sin(a) * r2);
  }
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
