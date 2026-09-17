// 16-Bit Roxie Steele Sprite & Animation Set
import { FighterState } from '../../types/game';
import { SF_PALETTES, drawPoly, drawMotionArc, drawHumanFace, drawHumanEar, drawBlockShield, drawKiBurst } from './common';

export function renderRoxieSprite(ctx: CanvasRenderingContext2D, f: FighterState, animTimer: number) {
  const p = SF_PALETTES.roxie;
  const state = f.state;
  const atk = f.currentAttack || '';
  const isCrouch = f.isCrouching || state === 'crouch';
  const isAir = !f.isGrounded;
  const isBlock = state === 'block';
  const isHit = state === 'hit';

  const idleBob = state === 'idle' ? Math.sin(animTimer * 8) * 3 : 0;
  const walkStride = state === 'walk' ? Math.sin(animTimer * 14) * 12 : 0;
  const crouchY = isCrouch ? 36 : 0;

  // --- 1. KNOCKDOWN ---
  if (state === 'knockdown') {
    drawPoly(ctx, [[-60, -10], [-25, -26], [-15, -16], [-50, -4]], p.hairShadow, p.ink);
    drawPoly(ctx, [[-26, -24], [-4, -24], [-2, -8], [-24, -8]], p.skinMid, p.ink);
    drawHumanFace(ctx, -14, -20, '#dc2626', state, true);
    drawPoly(ctx, [[-4, -22], [28, -22], [26, -6], [-2, -6]], p.topMid, p.ink);
    drawPoly(ctx, [[26, -22], [65, -20], [63, -4], [26, -4]], p.pantsMid, p.ink);
    drawPoly(ctx, [[65, -18], [90, -14], [88, -2], [65, -2]], p.bootMid, p.ink);
    return;
  }

  // --- 2. HIT STUN ---
  if (isHit) {
    drawPoly(ctx, [[-30, -114], [-52, -130], [-46, -100], [-22, -98]], p.hairShadow, p.ink);
    drawPoly(ctx, [[-22, -62], [8, -66], [10, -20], [-26, -18]], p.pantsMid, p.ink);
    drawPoly(ctx, [[-26, -18], [-12, -18], [-14, 0], [-28, 0]], p.bootMid, p.ink);
    drawPoly(ctx, [[0, -20], [14, -20], [16, 0], [2, 0]], p.bootMid, p.ink);
    // Torso knocked back
    drawPoly(ctx, [[-20, -104], [6, -108], [4, -66], [-22, -64]], p.topMid, p.ink);
    drawPoly(ctx, [[-18, -132], [4, -134], [8, -112], [-14, -110]], p.skinMid, p.ink);
    drawHumanFace(ctx, -4, -126, '#dc2626', state, true);
    drawPoly(ctx, [[-20, -102], [-44, -118], [-40, -128], [-16, -112]], p.skinMid, p.ink);
    drawPoly(ctx, [[6, -104], [28, -120], [32, -112], [10, -96]], p.wrapMid, p.ink);
    return;
  }

  // --- 3. FIERY CRIMSON PONYTAIL ---
  const hairSway = state === 'walk' ? -walkStride * 0.9 : Math.sin(animTimer * 6) * 7;
  drawPoly(
    ctx,
    [
      [-20, -124 + crouchY + idleBob],
      [-36 + hairSway, -114 + crouchY + idleBob],
      [-50 + hairSway * 1.2, -85 + crouchY + idleBob],
      [-38 + hairSway * 1.1, -55 + crouchY + idleBob],
      [-24 + hairSway, -60 + crouchY + idleBob],
      [-16, -118 + crouchY + idleBob],
    ],
    p.hairMid,
    p.hairDark,
    2
  );

  // --- 4. LEGS & COMBAT CARGO PANTS (All Kick Animations) ---
  if (atk === 'roxie_somersault') {
    // SOMERSAULT FLASH KICK (Vertical circular blade flip)
    drawPoly(ctx, [[-22, -68], [16, -68], [14, -46], [-20, -46]], p.pantsMid, p.ink);
    drawPoly(ctx, [[6, -68], [24, -68], [26, -150], [8, -150]], p.pantsMid, p.ink);
    drawPoly(ctx, [[6, -150], [26, -150], [28, -178], [4, -178]], p.bootMid, p.ink);
    drawPoly(ctx, [[-22, -46], [-6, -46], [-20, -18], [-32, -22]], p.pantsMid, p.ink);
    drawMotionArc(ctx, 12, -95, 100, -Math.PI * 0.95, 0.25, p.ki, 14);
  } else if (atk === 'roxie_lunge') {
    // COBRA THRUST KICK (Fierce horizontal flying thrust kick)
    drawPoly(ctx, [[-26, -58], [12, -58], [12, -38], [-26, -38]], p.pantsMid, p.ink);
    drawPoly(ctx, [[12, -56], [68, -56], [68, -40], [12, -40]], p.pantsMid, p.ink);
    drawPoly(ctx, [[68, -58], [98, -58], [96, -38], [68, -38]], p.bootMid, p.ink);
    drawPoly(ctx, [[-26, -44], [-10, -44], [-38, -24], [-48, -30]], p.pantsMid, p.ink);
    drawMotionArc(ctx, 45, -48, 85, -0.3, 0.3, '#ffffff', 8);
    drawKiBurst(ctx, 98, -48, p.ki, 24);
  } else if (atk === 'roxie_flurry') {
    // HYAKURETSU SPIN FLURRY (Rapid-fire machine-gun kick flurry with motion trails)
    const flicker = Math.floor(animTimer * 30) % 3;
    drawPoly(ctx, [[-20, -68], [14, -68], [14, -46], [-20, -46]], p.pantsMid, p.ink);
    drawPoly(ctx, [[-16, -46], [0, -46], [-8, -10], [-22, -10]], p.pantsMid, p.ink);
    drawPoly(ctx, [[-24, -10], [-6, -10], [-8, 0], [-26, 0]], p.bootMid, p.ink);

    if (flicker === 0) {
      // High flurry kick
      drawPoly(ctx, [[10, -66], [58, -104], [64, -92], [14, -54]], p.pantsMid, p.ink);
      drawPoly(ctx, [[58, -104], [90, -124], [94, -112], [64, -92]], p.bootMid, p.ink);
      drawMotionArc(ctx, 35, -88, 88, -0.7, 0.1, p.ki, 10);
    } else if (flicker === 1) {
      // Mid flurry kick
      drawPoly(ctx, [[10, -60], [66, -60], [66, -46], [10, -46]], p.pantsMid, p.ink);
      drawPoly(ctx, [[66, -62], [96, -62], [96, -44], [66, -44]], p.bootMid, p.ink);
      drawMotionArc(ctx, 40, -53, 85, -0.2, 0.3, p.ki, 10);
    } else {
      // Axe flurry kick
      drawPoly(ctx, [[10, -64], [52, -84], [56, -72], [12, -52]], p.pantsMid, p.ink);
      drawPoly(ctx, [[52, -84], [86, -98], [88, -86], [56, -72]], p.bootMid, p.ink);
      drawMotionArc(ctx, 35, -75, 85, -0.5, 0.2, '#ffffff', 8);
    }
  } else if (isAir) {
    if (atk === 'air_hk') {
      // Heavy Air Dropkick
      drawPoly(ctx, [[-20, -68], [16, -68], [18, -46], [-18, -46]], p.pantsMid, p.ink);
      drawPoly(ctx, [[14, -64], [64, -64], [64, -48], [14, -48]], p.pantsMid, p.ink);
      drawPoly(ctx, [[64, -66], [96, -66], [94, -46], [62, -46]], p.bootMid, p.ink);
      drawPoly(ctx, [[-20, -46], [-4, -46], [-24, -22], [-36, -26]], p.bootMid, p.ink);
      drawMotionArc(ctx, 35, -55, 80, -0.4, 0.3, '#ffffff', 8);
    } else if (atk === 'air_lk') {
      // Air Knee Strike
      drawPoly(ctx, [[-16, -68], [16, -68], [18, -46], [-16, -46]], p.pantsMid, p.ink);
      drawPoly(ctx, [[10, -56], [46, -68], [42, -54], [8, -46]], p.pantsMid, p.ink);
      drawPoly(ctx, [[46, -68], [58, -60], [52, -50], [42, -54]], p.bootMid, p.ink);
      drawPoly(ctx, [[-16, -46], [-2, -46], [-8, -18], [-20, -18]], p.bootMid, p.ink);
    } else {
      // Jumping neutral
      drawPoly(ctx, [[-18, -68], [18, -68], [20, -46], [-16, -46]], p.pantsMid, p.ink);
      drawPoly(ctx, [[-14, -46], [0, -46], [-8, -18], [-20, -18]], p.pantsMid, p.ink);
      drawPoly(ctx, [[2, -46], [16, -46], [20, -14], [8, -14]], p.pantsMid, p.ink);
      drawPoly(ctx, [[-22, -18], [-6, -18], [-8, -2], [-24, -2]], p.bootMid, p.ink);
      drawPoly(ctx, [[6, -14], [22, -14], [24, 2], [8, 2]], p.bootMid, p.ink);
    }
  } else if (isCrouch) {
    if (atk === 'crouch_hk') {
      // Crouching Breakdance Sweep
      drawPoly(ctx, [[-22, -42], [18, -42], [16, -24], [-20, -24]], p.pantsMid, p.ink);
      drawPoly(ctx, [[12, -24], [62, -24], [62, -10], [12, -10]], p.pantsMid, p.ink);
      drawPoly(ctx, [[62, -26], [94, -26], [92, -8], [60, -8]], p.bootMid, p.ink);
      drawMotionArc(ctx, 38, -16, 84, 0, Math.PI * 0.45, '#ffffff', 8);
    } else if (atk === 'crouch_lk') {
      // Crouching Low Foot Poke
      drawPoly(ctx, [[-20, -44], [18, -44], [20, -22], [-20, -22]], p.pantsMid, p.ink);
      drawPoly(ctx, [[8, -22], [50, -22], [50, -10], [8, -10]], p.pantsMid, p.ink);
      drawPoly(ctx, [[50, -24], [74, -24], [72, -8], [48, -8]], p.bootMid, p.ink);
    } else {
      drawPoly(ctx, [[-20, -44], [18, -44], [22, -22], [-22, -22]], p.pantsMid, p.ink);
      drawPoly(ctx, [[-20, -22], [16, -22], [14, -2], [-18, -2]], p.pantsMid, p.ink);
      drawPoly(ctx, [[-22, -4], [18, -4], [18, 0], [-22, 0]], p.bootMid, p.ink);
    }
  } else {
    // Standing or Walking
    if (atk === 'hk') {
      // Devastating High Roundhouse Kick
      drawPoly(ctx, [[-14, -48 + idleBob], [2, -48 + idleBob], [0, -6 + idleBob], [-16, -6 + idleBob]], p.pantsMid, p.ink);
      drawPoly(ctx, [[-18, -6 + idleBob], [4, -6 + idleBob], [4, 0 + idleBob], [-18, 0 + idleBob]], p.bootMid, p.ink);
      drawPoly(ctx, [[10, -70 + idleBob], [56, -98 + idleBob], [54, -84 + idleBob], [8, -56 + idleBob]], p.pantsMid, p.ink);
      drawPoly(ctx, [[56, -98 + idleBob], [94, -118 + idleBob], [92, -104 + idleBob], [54, -84 + idleBob]], p.bootMid, p.ink);
      drawMotionArc(ctx, 28, -78, 90, -Math.PI * 0.45, 0.25, '#ffffff', 10);
    } else if (atk === 'lk') {
      // Lightning Sharp Shin Kick / Teep
      drawPoly(ctx, [[-14, -48 + idleBob], [2, -48 + idleBob], [0, -6 + idleBob], [-16, -6 + idleBob]], p.pantsMid, p.ink);
      drawPoly(ctx, [[-18, -6 + idleBob], [4, -6 + idleBob], [4, 0 + idleBob], [-18, 0 + idleBob]], p.bootMid, p.ink);
      drawPoly(ctx, [[8, -58 + idleBob], [50, -58 + idleBob], [50, -44 + idleBob], [8, -44 + idleBob]], p.pantsMid, p.ink);
      drawPoly(ctx, [[50, -60 + idleBob], [76, -60 + idleBob], [76, -42 + idleBob], [50, -42 + idleBob]], p.bootMid, p.ink);
    } else {
      const l1X = -13 - walkStride;
      const l2X = 7 + walkStride;
      drawPoly(ctx, [[l1X - 7, -68 + crouchY + idleBob], [l1X + 7, -68 + crouchY + idleBob], [l1X + 8, -22 + crouchY + idleBob], [l1X - 7, -22 + crouchY + idleBob]], p.pantsMid, p.ink);
      drawPoly(ctx, [[l2X - 7, -68 + crouchY + idleBob], [l2X + 8, -68 + crouchY + idleBob], [l2X + 9, -22 + crouchY + idleBob], [l2X - 7, -22 + crouchY + idleBob]], p.pantsMid, p.ink);

      ctx.strokeStyle = p.stripeMid;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(l1X + 3, -66 + crouchY + idleBob); ctx.lineTo(l1X + 3, -24 + crouchY + idleBob);
      ctx.moveTo(l2X + 4, -66 + crouchY + idleBob); ctx.lineTo(l2X + 4, -24 + crouchY + idleBob);
      ctx.stroke();

      drawPoly(ctx, [[l1X - 8, -22 + crouchY + idleBob], [l1X + 9, -22 + crouchY + idleBob], [l1X + 11, 0 + crouchY + idleBob], [l1X - 9, 0 + crouchY + idleBob]], p.bootMid, p.ink);
      drawPoly(ctx, [[l2X - 8, -22 + crouchY + idleBob], [l2X + 9, -22 + crouchY + idleBob], [l2X + 11, 0 + crouchY + idleBob], [l2X - 9, 0 + crouchY + idleBob]], p.bootMid, p.ink);
    }
  }

  // --- 5. TORSO: HALTER TOP & CHISELED ABS ---
  drawPoly(
    ctx,
    [
      [-14, -112 + crouchY + idleBob],
      [14, -112 + crouchY + idleBob],
      [12, -92 + crouchY + idleBob],
      [-12, -92 + crouchY + idleBob],
    ],
    p.topMid,
    p.ink,
    2
  );
  drawPoly(
    ctx,
    [
      [-11, -92 + crouchY + idleBob],
      [11, -92 + crouchY + idleBob],
      [13, -70 + crouchY + idleBob],
      [-13, -70 + crouchY + idleBob],
    ],
    p.skinMid,
    p.ink,
    1.8
  );
  // Abs lines
  ctx.strokeStyle = p.skinShadow;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(0, -92 + crouchY + idleBob); ctx.lineTo(0, -72 + crouchY + idleBob);
  ctx.moveTo(-6, -86 + crouchY + idleBob); ctx.lineTo(6, -86 + crouchY + idleBob);
  ctx.moveTo(-6, -78 + crouchY + idleBob); ctx.lineTo(6, -78 + crouchY + idleBob);
  ctx.stroke();

  // --- 6. HEAD & FACE ---
  drawPoly(
    ctx,
    [
      [-12, -138 + crouchY + idleBob],
      [12, -138 + crouchY + idleBob],
      [14, -126 + crouchY + idleBob],
      [8, -112 + crouchY + idleBob],
      [-4, -112 + crouchY + idleBob],
      [-10, -126 + crouchY + idleBob],
    ],
    p.skinMid,
    p.ink,
    2
  );
  drawHumanEar(ctx, -10, -124 + crouchY + idleBob, p.skinMid, p.skinShadow);
  drawHumanFace(ctx, 3, -128 + crouchY + idleBob, '#dc2626', state, true);
  // Bangs
  drawPoly(
    ctx,
    [
      [-14, -142 + crouchY + idleBob],
      [15, -142 + crouchY + idleBob],
      [14, -132 + crouchY + idleBob],
      [6, -122 + crouchY + idleBob],
      [-2, -128 + crouchY + idleBob],
      [-12, -132 + crouchY + idleBob],
    ],
    p.hairMid,
    p.hairDark,
    2
  );

  // --- 7. ARMS & PUNCHES ---
  if (isBlock) {
    drawPoly(ctx, [[0, -106 + crouchY + idleBob], [18, -106 + crouchY + idleBob], [22, -126 + crouchY + idleBob], [8, -126 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[14, -126 + crouchY + idleBob], [24, -126 + crouchY + idleBob], [22, -116 + crouchY + idleBob], [12, -116 + crouchY + idleBob]], p.wrapMid, p.ink);
    drawBlockShield(ctx, 0, 0, isCrouch, animTimer);
  } else if (atk === 'hp' || atk === 'crouch_hp') {
    // Heavy Straight Right with red wrap trail
    drawPoly(ctx, [[10, -106 + crouchY + idleBob], [56, -106 + crouchY + idleBob], [56, -94 + crouchY + idleBob], [10, -94 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[56, -108 + crouchY + idleBob], [72, -108 + crouchY + idleBob], [72, -92 + crouchY + idleBob], [56, -92 + crouchY + idleBob]], p.wrapMid, p.ink);
    drawMotionArc(ctx, 32, -100 + crouchY + idleBob, 50, -0.3, 0.3, '#ffffff', 8);
  } else if (atk === 'lp' || atk === 'crouch_lp') {
    // Flick Jab
    drawPoly(ctx, [[10, -104 + crouchY + idleBob], [46, -104 + crouchY + idleBob], [46, -94 + crouchY + idleBob], [10, -94 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[46, -106 + crouchY + idleBob], [58, -106 + crouchY + idleBob], [58, -92 + crouchY + idleBob], [46, -92 + crouchY + idleBob]], p.wrapMid, p.ink);
  } else if (isAir && (atk === 'air_lp' || atk === 'air_hp')) {
    // Aerial Hook
    drawPoly(ctx, [[12, -98], [48, -82], [44, -72], [10, -88]], p.skinMid, p.ink);
    drawPoly(ctx, [[48, -84], [62, -76], [58, -66], [44, -74]], p.wrapMid, p.ink);
    drawMotionArc(ctx, 30, -84, 46, -0.4, 0.3, '#ffffff', 6);
  } else {
    // Poised Kickboxer Guard
    drawPoly(ctx, [[-14, -108 + crouchY + idleBob], [-6, -108 + crouchY + idleBob], [-2, -88 + crouchY + idleBob], [-10, -88 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[8, -108 + crouchY + idleBob], [18, -108 + crouchY + idleBob], [24, -90 + crouchY + idleBob], [14, -90 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[14, -92 + crouchY + idleBob], [24, -92 + crouchY + idleBob], [22, -82 + crouchY + idleBob], [12, -82 + crouchY + idleBob]], p.wrapMid, p.ink);
  }
}
