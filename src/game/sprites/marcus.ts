// 16-Bit Marcus "Iron" Vance Sprite & Animation Set
import { FighterState } from '../../types/game';
import { SF_PALETTES, drawPoly, drawMotionArc, drawHumanFace, drawHumanEar, drawBlockShield, drawKiBurst } from './common';

export function renderMarcusSprite(ctx: CanvasRenderingContext2D, f: FighterState, animTimer: number) {
  const p = SF_PALETTES.marcus;
  const state = f.state;
  const isAttacking = state === 'attack' || state === 'special';
  const atk = isAttacking ? (f.currentAttack || '') : '';
  const isCrouch = f.isCrouching || state === 'crouch';
  const isAir = !f.isGrounded;
  const isBlock = state === 'block';
  const isHit = state === 'hit';

  const idleBob = state === 'idle' ? Math.sin(animTimer * 7) * 3.5 : 0;
  const walkStride = state === 'walk' ? Math.sin(animTimer * 13) * 10 : 0;
  const crouchY = isCrouch ? 34 : 0;

  // --- 1. KNOCKDOWN ---
  if (state === 'knockdown') {
    drawPoly(ctx, [[-65, -12], [-25, -28], [-15, -18], [-55, -4]], p.hairDark, p.hairMid);
    drawPoly(ctx, [[-28, -26], [-4, -26], [-2, -8], [-26, -8]], p.skinMid, p.ink);
    drawHumanFace(ctx, -14, -22, '#4a240c', state, false);
    drawPoly(ctx, [[-4, -26], [32, -26], [30, -6], [-2, -6]], p.skinMid, p.ink);
    drawPoly(ctx, [[30, -24], [72, -22], [70, -4], [30, -4]], p.trunksMid, p.ink);
    drawPoly(ctx, [[70, -20], [96, -16], [94, -2], [70, -2]], p.bootMid, p.ink);
    return;
  }

  // --- 2. HIT STUN ---
  if (isHit) {
    drawPoly(ctx, [[-24, -68], [12, -70], [14, -24], [-26, -22]], p.trunksMid, p.ink);
    drawPoly(ctx, [[-28, -22], [-10, -22], [-12, 0], [-30, 0]], p.bootMid, p.ink);
    drawPoly(ctx, [[0, -24], [18, -24], [20, 0], [2, 0]], p.bootMid, p.ink);
    // Torso jolted back
    drawPoly(ctx, [[-24, -112], [10, -116], [8, -70], [-26, -68]], p.skinMid, p.ink);
    drawPoly(ctx, [[-20, -140], [6, -142], [10, -118], [-16, -116]], p.skinMid, p.ink);
    drawHumanFace(ctx, -2, -134, '#4a240c', state, false);
    // Gloves blown apart
    drawPoly(ctx, [[-24, -110], [-52, -124], [-48, -136], [-20, -120]], p.gloveMid, p.ink);
    drawPoly(ctx, [[8, -112], [36, -128], [40, -118], [14, -102]], p.gloveMid, p.ink);
    return;
  }

  // --- 3. LEGS & SATIN BOXING TRUNKS ---
  if (isAir) {
    drawPoly(ctx, [[-22, -68], [22, -68], [24, -44], [-20, -44]], p.trunksMid, p.ink);
    drawPoly(ctx, [[-16, -44], [0, -44], [-8, -16], [-22, -16]], p.skinMid, p.ink);
    drawPoly(ctx, [[4, -44], [20, -44], [24, -12], [8, -12]], p.skinMid, p.ink);
    drawPoly(ctx, [[-24, -16], [-6, -16], [-8, 0], [-26, 0]], p.bootMid, p.ink);
    drawPoly(ctx, [[6, -12], [24, -12], [26, 4], [8, 4]], p.bootMid, p.ink);
  } else if (isCrouch) {
    drawPoly(ctx, [[-24, -44], [22, -44], [26, -20], [-26, -20]], p.trunksMid, p.ink);
    drawPoly(ctx, [[-26, -20], [20, -20], [18, 0], [-24, 0]], p.trunksMid, p.ink);
    drawPoly(ctx, [[-26, -4], [22, -4], [22, 0], [-26, 0]], p.bootMid, p.ink);
  } else {
    const l1X = -15 - walkStride;
    const l2X = 11 + walkStride;
    drawPoly(ctx, [[l1X - 9, -68 + crouchY + idleBob], [l1X + 9, -68 + crouchY + idleBob], [l1X + 11, -34 + crouchY + idleBob], [l1X - 9, -34 + crouchY + idleBob]], p.trunksMid, p.ink);
    drawPoly(ctx, [[l2X - 9, -68 + crouchY + idleBob], [l2X + 10, -68 + crouchY + idleBob], [l2X + 11, -34 + crouchY + idleBob], [l2X - 9, -34 + crouchY + idleBob]], p.trunksMid, p.ink);
    drawPoly(ctx, [[l1X - 8, -34 + crouchY + idleBob], [l1X + 9, -34 + crouchY + idleBob], [l1X + 8, -20 + crouchY + idleBob], [l1X - 8, -20 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[l2X - 8, -34 + crouchY + idleBob], [l2X + 9, -34 + crouchY + idleBob], [l2X + 8, -20 + crouchY + idleBob], [l2X - 8, -20 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[l1X - 9, -20 + crouchY + idleBob], [l1X + 10, -20 + crouchY + idleBob], [l1X + 12, 0 + crouchY + idleBob], [l1X - 10, 0 + crouchY + idleBob]], p.bootMid, p.ink);
    drawPoly(ctx, [[l2X - 9, -20 + crouchY + idleBob], [l2X + 10, -20 + crouchY + idleBob], [l2X + 12, 0 + crouchY + idleBob], [l2X - 10, 0 + crouchY + idleBob]], p.bootMid, p.ink);
  }

  // --- 4. TORSO: HEAVYWEIGHT PECTORALS, ABS & CHAMPIONSHIP BELT ---
  const forwardLean = atk === 'marcus_lunge' || atk === 'hp' ? 16 : (atk === 'marcus_rush' ? Math.sin(animTimer * 20) * 8 : 0);
  drawPoly(
    ctx,
    [
      [-20 + forwardLean, -116 + crouchY + idleBob],
      [20 + forwardLean, -116 + crouchY + idleBob],
      [17, -68 + crouchY + idleBob],
      [-17, -68 + crouchY + idleBob],
    ],
    p.skinMid,
    p.ink,
    2
  );
  // Pectoral cleavage & 8-pack cuts
  ctx.strokeStyle = p.skinShadow;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(0 + forwardLean, -114 + crouchY + idleBob); ctx.lineTo(0, -70 + crouchY + idleBob);
  ctx.moveTo(-16 + forwardLean, -98 + crouchY + idleBob); ctx.lineTo(-1 + forwardLean, -98 + crouchY + idleBob);
  ctx.moveTo(1 + forwardLean, -98 + crouchY + idleBob); ctx.lineTo(16 + forwardLean, -98 + crouchY + idleBob);
  ctx.moveTo(-10, -88 + crouchY + idleBob); ctx.lineTo(10, -88 + crouchY + idleBob);
  ctx.moveTo(-9, -78 + crouchY + idleBob); ctx.lineTo(9, -78 + crouchY + idleBob);
  ctx.stroke();

  // World Champion Gold Belt
  drawPoly(
    ctx,
    [
      [-18, -72 + crouchY + idleBob],
      [18, -72 + crouchY + idleBob],
      [17, -60 + crouchY + idleBob],
      [-17, -60 + crouchY + idleBob],
    ],
    p.beltMid,
    p.beltBorder,
    2
  );
  ctx.fillStyle = p.beltGoldHi;
  ctx.beginPath();
  ctx.arc(0, -66 + crouchY + idleBob, 6, 0, Math.PI * 2);
  ctx.fill();

  // --- 5. HEAD & FACE ---
  drawPoly(
    ctx,
    [
      [-14 + forwardLean, -142 + crouchY + idleBob],
      [14 + forwardLean, -142 + crouchY + idleBob],
      [16 + forwardLean, -128 + crouchY + idleBob],
      [11 + forwardLean, -114 + crouchY + idleBob],
      [-4 + forwardLean, -114 + crouchY + idleBob],
      [-12 + forwardLean, -128 + crouchY + idleBob],
    ],
    p.skinMid,
    p.ink,
    2
  );
  drawHumanEar(ctx, -12 + forwardLean, -126 + crouchY + idleBob, p.skinMid, p.skinShadow);
  drawHumanFace(ctx, 4 + forwardLean, -130 + crouchY + idleBob, '#4a240c', state, false);

  // Fade Haircut
  drawPoly(
    ctx,
    [
      [-15 + forwardLean, -144 + crouchY + idleBob],
      [15 + forwardLean, -144 + crouchY + idleBob],
      [16 + forwardLean, -136 + crouchY + idleBob],
      [-14 + forwardLean, -136 + crouchY + idleBob],
    ],
    p.hairDark,
    p.ink,
    1.5
  );

  // --- 6. ARMS, GLOVES & SPECIAL MOVES ---
  if (isBlock) {
    // Tight peek-a-boo defense
    drawPoly(ctx, [[-2, -110 + crouchY + idleBob], [18, -110 + crouchY + idleBob], [22, -130 + crouchY + idleBob], [6, -130 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[14, -136 + crouchY + idleBob], [28, -136 + crouchY + idleBob], [26, -118 + crouchY + idleBob], [12, -118 + crouchY + idleBob]], p.gloveMid, p.ink);
    drawBlockShield(ctx, 0, 0, isCrouch, animTimer);
  } else if (atk === 'marcus_uppercut') {
    // SKYBREAKER UPPERCUT (Rising vertical uppercut)
    drawPoly(ctx, [[10, -110 + crouchY + idleBob], [28, -110 + crouchY + idleBob], [30, -160 + crouchY + idleBob], [12, -160 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[8, -178 + crouchY + idleBob], [34, -178 + crouchY + idleBob], [32, -155 + crouchY + idleBob], [6, -155 + crouchY + idleBob]], p.gloveMid, p.ink);
    drawMotionArc(ctx, 20, -145, 65, -Math.PI * 0.8, 0.1, '#ffffff', 12);
    drawKiBurst(ctx, 20, -175 + crouchY + idleBob, p.ki, 32);
  } else if (atk === 'marcus_lunge') {
    // TITAN HEAVY STRAIGHT (Piston straight power punch)
    drawPoly(ctx, [[12 + forwardLean, -108 + crouchY + idleBob], [68 + forwardLean, -108 + crouchY + idleBob], [68 + forwardLean, -92 + crouchY + idleBob], [12 + forwardLean, -92 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[66 + forwardLean, -112 + crouchY + idleBob], [88 + forwardLean, -112 + crouchY + idleBob], [88 + forwardLean, -88 + crouchY + idleBob], [66 + forwardLean, -88 + crouchY + idleBob]], p.gloveMid, p.ink);
    drawMotionArc(ctx, 40 + forwardLean, -100 + crouchY + idleBob, 60, -0.3, 0.3, '#ffffff', 10);
    drawKiBurst(ctx, 88 + forwardLean, -100 + crouchY + idleBob, p.ki, 30);
  } else if (atk === 'marcus_rush') {
    // DEMPSEY RUSH & HOOK (Alternating rolling hooks)
    const roll = Math.floor(animTimer * 24) % 2;
    if (roll === 0) {
      // Left hook swing
      drawPoly(ctx, [[-10, -108 + crouchY + idleBob], [45, -118 + crouchY + idleBob], [42, -104 + crouchY + idleBob], [-10, -96 + crouchY + idleBob]], p.skinMid, p.ink);
      drawPoly(ctx, [[42, -122 + crouchY + idleBob], [64, -122 + crouchY + idleBob], [62, -100 + crouchY + idleBob], [40, -100 + crouchY + idleBob]], p.gloveMid, p.ink);
      drawMotionArc(ctx, 25, -110 + crouchY + idleBob, 50, -0.6, 0.2, '#ffffff', 10);
    } else {
      // Right liver blow swing
      drawPoly(ctx, [[10, -106 + crouchY + idleBob], [55, -92 + crouchY + idleBob], [52, -78 + crouchY + idleBob], [10, -92 + crouchY + idleBob]], p.skinMid, p.ink);
      drawPoly(ctx, [[50, -96 + crouchY + idleBob], [72, -96 + crouchY + idleBob], [70, -74 + crouchY + idleBob], [48, -74 + crouchY + idleBob]], p.gloveMid, p.ink);
      drawMotionArc(ctx, 30, -85 + crouchY + idleBob, 50, -0.2, 0.5, '#ffffff', 10);
    }
  } else if (atk === 'hp' || atk === 'crouch_hp') {
    // Heavy Hook / Overhand Right
    drawPoly(ctx, [[10 + forwardLean, -108 + crouchY + idleBob], [58 + forwardLean, -108 + crouchY + idleBob], [58 + forwardLean, -94 + crouchY + idleBob], [10 + forwardLean, -94 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[56 + forwardLean, -112 + crouchY + idleBob], [78 + forwardLean, -112 + crouchY + idleBob], [78 + forwardLean, -90 + crouchY + idleBob], [56 + forwardLean, -90 + crouchY + idleBob]], p.gloveMid, p.ink);
    drawMotionArc(ctx, 34 + forwardLean, -101 + crouchY + idleBob, 52, -0.3, 0.3, '#ffffff', 10);
  } else if (atk === 'lp' || atk === 'crouch_lp') {
    // Stinging Jab
    drawPoly(ctx, [[12, -106 + crouchY + idleBob], [50, -106 + crouchY + idleBob], [50, -94 + crouchY + idleBob], [12, -94 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[48, -110 + crouchY + idleBob], [66, -110 + crouchY + idleBob], [66, -90 + crouchY + idleBob], [48, -90 + crouchY + idleBob]], p.gloveMid, p.ink);
  } else if (isAir) {
    // Diving Heavy Knuckle Hammer
    drawPoly(ctx, [[12, -100], [52, -80], [48, -68], [10, -88]], p.skinMid, p.ink);
    drawPoly(ctx, [[48, -84], [68, -84], [66, -64], [46, -64]], p.gloveMid, p.ink);
    drawMotionArc(ctx, 32, -82, 50, -0.4, 0.4, '#ffffff', 8);
  } else {
    // Heavyweight Peek-a-boo Guard
    drawPoly(ctx, [[-18, -112 + crouchY + idleBob], [-8, -112 + crouchY + idleBob], [-4, -90 + crouchY + idleBob], [-14, -90 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[12, -112 + crouchY + idleBob], [24, -112 + crouchY + idleBob], [30, -92 + crouchY + idleBob], [18, -92 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[16, -96 + crouchY + idleBob], [30, -96 + crouchY + idleBob], [28, -80 + crouchY + idleBob], [14, -80 + crouchY + idleBob]], p.gloveMid, p.ink);
    ctx.fillStyle = p.gloveHi;
    ctx.fillRect(18, -94 + crouchY + idleBob, 8, 4);
  }
}
