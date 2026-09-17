// 16-Bit Lord Raizen - The Shadow Sovereign Sprite & Animation Set (Final Boss)
import { FighterState } from '../../types/game';
import {
  SF_PALETTES,
  drawPoly,
  drawMotionArc,
  drawHumanFace,
  drawHumanEar,
  drawBlockShield,
  drawKiBurst,
} from './common';

export function renderRaizenSprite(ctx: CanvasRenderingContext2D, f: FighterState, animTimer: number) {
  const p = SF_PALETTES.raizen;
  const state = f.state;
  const isAttacking = state === 'attack' || state === 'special';
  const atk = isAttacking ? (f.currentAttack || '') : '';
  const isCrouch = f.isCrouching || state === 'crouch';
  const isAir = !f.isGrounded;
  const isBlock = state === 'block';
  const isHit = state === 'hit';

  const idleBob = state === 'idle' ? Math.sin(animTimer * 6) * 3 : 0;
  const walkStride = state === 'walk' ? Math.sin(animTimer * 11) * 8 : 0;
  const crouchY = isCrouch ? 32 : 0;

  // Boss Dark Ki Aura FX (Shadow Tendrils & Violet Flames)
  if (state !== 'knockdown') {
    ctx.save();
    for (let i = 0; i < 5; i++) {
      const angle = (animTimer * 4 + i * 1.3) % (Math.PI * 2);
      const dist = 32 + Math.sin(animTimer * 8 + i) * 14;
      const auraX = Math.cos(angle) * dist * 0.7;
      const auraY = -65 + Math.sin(angle) * dist + idleBob;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(139, 92, 246, 0.4)' : 'rgba(220, 38, 38, 0.35)';
      ctx.beginPath();
      ctx.arc(auraX, auraY, 6 + (i % 3) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // --- 1. KNOCKDOWN ---
  if (state === 'knockdown') {
    drawPoly(ctx, [[-60, -14], [-25, -26], [-12, -18], [-52, -6]], p.giShadow, p.giMid);
    drawPoly(ctx, [[-26, -26], [-4, -26], [-2, -8], [-24, -8]], p.skinMid, p.ink);
    drawPoly(ctx, [[-30, -32], [-8, -32], [-4, -24], [-28, -24]], p.hairHi, p.hairDark);
    drawHumanFace(ctx, -12, -20, p.eyes, state, false);
    drawPoly(ctx, [[-4, -26], [35, -26], [32, -6], [-2, -6]], p.giMid, p.ink);
    drawPoly(ctx, [[32, -24], [74, -22], [70, -4], [30, -4]], p.giShadow, p.ink);
    drawPoly(ctx, [[70, -20], [94, -16], [92, -2], [68, -2]], p.armorDark, p.ink);
    return;
  }

  // --- 2. HIT STUN ---
  if (isHit) {
    drawPoly(ctx, [[-22, -66], [14, -68], [16, -22], [-24, -20]], p.giShadow, p.ink);
    drawPoly(ctx, [[-26, -20], [-8, -20], [-10, 0], [-28, 0]], p.armorDark, p.ink);
    drawPoly(ctx, [[2, -22], [20, -22], [22, 0], [4, 0]], p.armorDark, p.ink);
    drawPoly(ctx, [[-22, -114], [12, -118], [10, -68], [-24, -66]], p.giMid, p.ink);
    drawPoly(ctx, [[-18, -142], [8, -144], [12, -118], [-14, -116]], p.skinMid, p.ink);
    drawHumanFace(ctx, 0, -136, p.eyes, state, false);
    drawPoly(ctx, [[-20, -156], [10, -154], [12, -142], [-18, -142]], p.hairHi, p.hairDark);
    return;
  }

  // --- 3. LOWER BODY & GI PANTS ---
  if (isAir) {
    drawPoly(ctx, [[-22, -68], [22, -68], [26, -42], [-22, -42]], p.giShadow, p.ink);
    drawPoly(ctx, [[-18, -42], [2, -42], [-4, -14], [-20, -14]], p.giMid, p.ink);
    drawPoly(ctx, [[4, -42], [22, -42], [26, -10], [8, -10]], p.giMid, p.ink);
    drawPoly(ctx, [[-22, -14], [-4, -14], [-6, 0], [-24, 0]], p.armorDark, p.ink);
    drawPoly(ctx, [[6, -10], [24, -10], [26, 4], [8, 4]], p.armorDark, p.ink);
  } else if (isCrouch) {
    drawPoly(ctx, [[-24, -46], [24, -46], [28, -20], [-26, -20]], p.giShadow, p.ink);
    drawPoly(ctx, [[-26, -20], [22, -20], [20, 0], [-24, 0]], p.giMid, p.ink);
    drawPoly(ctx, [[-26, -6], [22, -6], [22, 0], [-26, 0]], p.armorDark, p.ink);
  } else {
    const l1X = -14 - walkStride;
    const l2X = 12 + walkStride;
    drawPoly(ctx, [[l1X - 10, -68 + crouchY + idleBob], [l1X + 10, -68 + crouchY + idleBob], [l1X + 12, -30 + crouchY + idleBob], [l1X - 10, -30 + crouchY + idleBob]], p.giShadow, p.ink);
    drawPoly(ctx, [[l2X - 10, -68 + crouchY + idleBob], [l2X + 10, -68 + crouchY + idleBob], [l2X + 12, -30 + crouchY + idleBob], [l2X - 10, -30 + crouchY + idleBob]], p.giShadow, p.ink);
    drawPoly(ctx, [[l1X - 9, -30 + crouchY + idleBob], [l1X + 9, -30 + crouchY + idleBob], [l1X + 11, 0 + crouchY + idleBob], [l1X - 9, 0 + crouchY + idleBob]], p.armorDark, p.armorHi);
    drawPoly(ctx, [[l2X - 9, -30 + crouchY + idleBob], [l2X + 9, -30 + crouchY + idleBob], [l2X + 11, 0 + crouchY + idleBob], [l2X - 9, 0 + crouchY + idleBob]], p.armorDark, p.armorHi);
  }

  // --- 4. TORSO & SHADOW GI WITH CRIMSON ACCENTS ---
  const forwardLean = atk === 'raizen_void_flare' ? 14 : atk === 'raizen_chaos_pillar' ? 18 : 0;
  drawPoly(
    ctx,
    [
      [-22 + forwardLean, -118 + crouchY + idleBob],
      [22 + forwardLean, -118 + crouchY + idleBob],
      [18, -68 + crouchY + idleBob],
      [-18, -68 + crouchY + idleBob],
    ],
    p.giMid,
    p.ink,
    2
  );

  // Crimson Lapel V-neck Trim & Muscular Chest
  drawPoly(
    ctx,
    [
      [-14 + forwardLean, -116 + crouchY + idleBob],
      [0 + forwardLean, -88 + crouchY + idleBob],
      [14 + forwardLean, -116 + crouchY + idleBob],
    ],
    p.skinMid,
    p.trimCrimson,
    2
  );

  // Violet/Purple Martial Arts Master Obi (Sash Belt)
  drawPoly(
    ctx,
    [
      [-20, -74 + crouchY + idleBob],
      [20, -74 + crouchY + idleBob],
      [19, -60 + crouchY + idleBob],
      [-19, -60 + crouchY + idleBob],
    ],
    p.beltMid,
    p.beltHi,
    2
  );
  // Hanging sash ribbons
  drawPoly(
    ctx,
    [
      [-8, -60 + crouchY + idleBob],
      [-2, -60 + crouchY + idleBob],
      [-4, -38 + crouchY + idleBob],
      [-10, -38 + crouchY + idleBob],
    ],
    p.beltMid,
    p.beltDark
  );

  // Spiked Dark Steel Pauldrons (Shoulder Armor)
  drawPoly(ctx, [[-28 + forwardLean, -126 + crouchY + idleBob], [-16 + forwardLean, -128 + crouchY + idleBob], [-18 + forwardLean, -110 + crouchY + idleBob], [-30 + forwardLean, -112 + crouchY + idleBob]], p.armorDark, p.trimGold, 1.5);
  drawPoly(ctx, [[16 + forwardLean, -128 + crouchY + idleBob], [28 + forwardLean, -126 + crouchY + idleBob], [30 + forwardLean, -112 + crouchY + idleBob], [18 + forwardLean, -110 + crouchY + idleBob]], p.armorDark, p.trimGold, 1.5);

  // --- 5. HEAD, HAIR & GLOWING DEMON EYES ---
  drawPoly(
    ctx,
    [
      [-13 + forwardLean, -144 + crouchY + idleBob],
      [13 + forwardLean, -144 + crouchY + idleBob],
      [15 + forwardLean, -130 + crouchY + idleBob],
      [10 + forwardLean, -116 + crouchY + idleBob],
      [-5 + forwardLean, -116 + crouchY + idleBob],
      [-11 + forwardLean, -130 + crouchY + idleBob],
    ],
    p.skinMid,
    p.ink,
    2
  );
  drawHumanEar(ctx, -11 + forwardLean, -128 + crouchY + idleBob, p.skinMid, p.skinShadow);
  drawHumanFace(ctx, 3 + forwardLean, -132 + crouchY + idleBob, p.eyes, state, false);

  // Glowing Crimson Iris aura
  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(6 + forwardLean, -133 + crouchY + idleBob, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Wild Spiked Silver Hair (Akuma / Sephiroth Style)
  drawPoly(
    ctx,
    [
      [-16 + forwardLean, -144 + crouchY + idleBob],
      [-26 + forwardLean, -158 + crouchY + idleBob],
      [-10 + forwardLean, -154 + crouchY + idleBob],
      [0 + forwardLean, -164 + crouchY + idleBob],
      [12 + forwardLean, -156 + crouchY + idleBob],
      [24 + forwardLean, -160 + crouchY + idleBob],
      [16 + forwardLean, -142 + crouchY + idleBob],
      [-14 + forwardLean, -140 + crouchY + idleBob],
    ],
    p.hairHi,
    p.hairDark,
    2
  );

  // --- 6. ARMS, STRIKES & SPECIAL ATTACKS ---
  if (isBlock) {
    // Cross-arm defensive guard with glowing void rune shield
    drawPoly(ctx, [[-4, -112 + crouchY + idleBob], [18, -112 + crouchY + idleBob], [22, -134 + crouchY + idleBob], [4, -134 + crouchY + idleBob]], p.giMid, p.ink);
    drawPoly(ctx, [[14, -138 + crouchY + idleBob], [28, -138 + crouchY + idleBob], [26, -118 + crouchY + idleBob], [12, -118 + crouchY + idleBob]], p.armorDark, p.trimCrimson);
    drawBlockShield(ctx, 0, 0, isCrouch, animTimer);
  } else if (atk === 'raizen_void_flare') {
    // VOID ECLIPSE FLARE (Dual palm dark energy blast)
    drawPoly(ctx, [[12, -112 + crouchY + idleBob], [64, -112 + crouchY + idleBob], [64, -94 + crouchY + idleBob], [12, -94 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[62, -116 + crouchY + idleBob], [82, -116 + crouchY + idleBob], [82, -90 + crouchY + idleBob], [62, -90 + crouchY + idleBob]], p.skinHi, p.trimGold);
    drawKiBurst(ctx, 84, -103 + crouchY + idleBob, p.ki, 36);
    drawMotionArc(ctx, 50, -103 + crouchY + idleBob, 60, -0.4, 0.4, p.kiMid, 12);
  } else if (atk === 'raizen_shadow_teleport') {
    // SHADOW WARP AXE KICK (Descending dark kick)
    drawPoly(ctx, [[-10, -68 + crouchY], [20, -130 + crouchY], [32, -126 + crouchY], [10, -64 + crouchY]], p.giShadow, p.ink);
    drawPoly(ctx, [[18, -136 + crouchY], [36, -136 + crouchY], [34, -120 + crouchY], [16, -120 + crouchY]], p.armorDark, p.armorHi);
    drawMotionArc(ctx, 25, -110 + crouchY, 70, -Math.PI * 0.7, 0.2, p.kiMid, 14);
    drawKiBurst(ctx, 30, -130 + crouchY, p.ki, 34);
  } else if (atk === 'raizen_chaos_pillar') {
    // ABYSSAL CHAOS PILLAR (Ground smash unleashing flame pillar)
    drawPoly(ctx, [[12, -110 + crouchY + idleBob], [44, -70 + crouchY + idleBob], [36, -60 + crouchY + idleBob], [8, -100 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[34, -64 + crouchY + idleBob], [52, -64 + crouchY + idleBob], [50, -44 + crouchY + idleBob], [32, -44 + crouchY + idleBob]], p.armorDark, p.trimGold);
    drawKiBurst(ctx, 50, -48 + crouchY + idleBob, p.ki, 40);
    drawMotionArc(ctx, 40, -50 + crouchY + idleBob, 50, 0, Math.PI * 0.6, '#ef4444', 10);
  } else if (atk === 'hp' || atk === 'crouch_hp') {
    // Dark Palm Strike
    drawPoly(ctx, [[12 + forwardLean, -110 + crouchY + idleBob], [62 + forwardLean, -110 + crouchY + idleBob], [62 + forwardLean, -96 + crouchY + idleBob], [12 + forwardLean, -96 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[60 + forwardLean, -114 + crouchY + idleBob], [78 + forwardLean, -114 + crouchY + idleBob], [78 + forwardLean, -92 + crouchY + idleBob], [60 + forwardLean, -92 + crouchY + idleBob]], p.skinHi, p.ink);
    drawMotionArc(ctx, 45 + forwardLean, -103 + crouchY + idleBob, 55, -0.3, 0.3, p.kiMid, 10);
  } else if (atk === 'lp' || atk === 'crouch_lp') {
    // Quick Shadow Jab
    drawPoly(ctx, [[12, -108 + crouchY + idleBob], [48, -108 + crouchY + idleBob], [48, -96 + crouchY + idleBob], [12, -96 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[46, -112 + crouchY + idleBob], [64, -112 + crouchY + idleBob], [64, -92 + crouchY + idleBob], [46, -92 + crouchY + idleBob]], p.skinHi, p.ink);
  } else if (atk === 'hk' || atk === 'crouch_hk') {
    // Blazing Dark Crescent Kick
    drawPoly(ctx, [[-6, -66 + crouchY], [54, -105 + crouchY], [50, -118 + crouchY], [-12, -76 + crouchY]], p.giShadow, p.ink);
    drawPoly(ctx, [[48, -122 + crouchY], [72, -114 + crouchY], [68, -98 + crouchY], [44, -106 + crouchY]], p.armorDark, p.armorHi);
    drawMotionArc(ctx, 40, -95 + crouchY, 65, -0.5, 0.4, p.ki, 12);
  } else if (atk === 'lk' || atk === 'crouch_lk') {
    // Low Sweep
    drawPoly(ctx, [[-4, -50 + crouchY], [48, -25 + crouchY], [46, -38 + crouchY], [-6, -60 + crouchY]], p.giShadow, p.ink);
    drawPoly(ctx, [[44, -38 + crouchY], [62, -26 + crouchY], [60, -16 + crouchY], [42, -26 + crouchY]], p.armorDark, p.armorHi);
  } else {
    // Imposing Overlord Stance: Folded or poised dark bracers
    drawPoly(ctx, [[-16, -114 + crouchY + idleBob], [-6, -114 + crouchY + idleBob], [-2, -88 + crouchY + idleBob], [-12, -88 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[12, -114 + crouchY + idleBob], [22, -114 + crouchY + idleBob], [26, -88 + crouchY + idleBob], [16, -88 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[14, -94 + crouchY + idleBob], [28, -94 + crouchY + idleBob], [26, -78 + crouchY + idleBob], [12, -78 + crouchY + idleBob]], p.armorDark, p.trimGold);
  }
}
