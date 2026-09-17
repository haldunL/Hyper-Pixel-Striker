// 16-Bit Kasumi Kurogane Sprite & Animation Set
import { FighterState } from '../../types/game';
import { SF_PALETTES, drawPoly, drawMotionArc, drawHumanFace, drawHumanEar, drawBlockShield, drawKiBurst } from './common';

export function renderKasumiSprite(ctx: CanvasRenderingContext2D, f: FighterState, animTimer: number) {
  const p = SF_PALETTES.kasumi;
  const state = f.state;
  const atk = f.currentAttack || '';
  const isCrouch = f.isCrouching || state === 'crouch';
  const isAir = !f.isGrounded;
  const isBlock = state === 'block';
  const isHit = state === 'hit';

  const idleBob = state === 'idle' ? Math.sin(animTimer * 7) * 3.5 : 0;
  const walkStride = state === 'walk' ? Math.sin(animTimer * 14) * 11 : 0;
  const crouchY = isCrouch ? 36 : 0;

  // --- 1. KNOCKDOWN STATE ---
  if (state === 'knockdown') {
    drawPoly(ctx, [[-65, -12], [-25, -28], [-15, -18], [-55, -4]], p.hairDark, p.hairInk);
    drawPoly(ctx, [[-28, -26], [-6, -26], [-4, -10], [-26, -10]], p.skinMid, p.ink);
    drawHumanFace(ctx, -16, -22, '#451a03', state, true, p.skinBlush);
    drawPoly(ctx, [[-6, -24], [28, -24], [26, -6], [-4, -6]], p.blouseBase, p.ink);
    drawPoly(ctx, [[26, -24], [48, -22], [46, -4], [26, -6]], p.navyMid, p.ink);
    drawPoly(ctx, [[46, -20], [78, -16], [76, -4], [46, -4]], p.sockMid, p.ink);
    drawPoly(ctx, [[76, -18], [94, -14], [92, -2], [76, -2]], p.shoeMid, p.ink);
    return;
  }

  // --- 2. HIT STUN STATE (Reeling back, staggered) ---
  if (isHit) {
    // Hair blown forward/up
    drawPoly(ctx, [[-30, -118], [-54, -135], [-48, -105], [-24, -100]], p.hairDark, p.hairInk);
    // Skirt tilted back
    drawPoly(ctx, [[-26, -62], [8, -66], [12, -42], [-28, -38]], p.navyMid, p.ink);
    // Staggered legs
    drawPoly(ctx, [[-24, -38], [-10, -38], [-18, -4], [-30, -4]], p.sockMid, p.ink);
    drawPoly(ctx, [[0, -42], [14, -42], [12, -4], [0, -4]], p.sockMid, p.ink);
    drawPoly(ctx, [[-32, -4], [-14, -4], [-12, 0], [-34, 0]], p.shoeMid, p.ink);
    drawPoly(ctx, [[-2, -4], [16, -4], [18, 0], [0, 0]], p.shoeMid, p.ink);
    // Reeling Torso arched back
    drawPoly(ctx, [[-22, -104], [6, -108], [4, -66], [-24, -64]], p.blouseBase, p.ink);
    // Head rocked back
    drawPoly(ctx, [[-20, -132], [2, -134], [6, -112], [-16, -110]], p.skinMid, p.ink);
    drawHumanFace(ctx, -5, -126, '#451a03', state, true, p.skinBlush);
    // Arms thrown outward in shock
    drawPoly(ctx, [[-20, -102], [-46, -118], [-42, -128], [-16, -112]], p.skinMid, p.ink);
    drawPoly(ctx, [[4, -104], [26, -120], [30, -112], [8, -96]], p.skinMid, p.ink);
    return;
  }

  // --- 3. BACK PONYTAIL & RIBBON ---
  const hairSway = state === 'walk' ? -walkStride * 0.8 : Math.cos(animTimer * 6) * 6;
  drawPoly(
    ctx,
    [
      [-22, -125 + crouchY + idleBob],
      [-38 + hairSway, -112 + crouchY + idleBob],
      [-46 + hairSway * 1.3, -80 + crouchY + idleBob],
      [-36 + hairSway * 1.1, -45 + crouchY + idleBob],
      [-24 + hairSway, -52 + crouchY + idleBob],
      [-28 + hairSway * 0.8, -95 + crouchY + idleBob],
      [-16, -118 + crouchY + idleBob],
    ],
    p.hairDark,
    p.hairInk,
    2
  );
  drawPoly(
    ctx,
    [
      [-26, -128 + crouchY + idleBob],
      [-34, -124 + crouchY + idleBob],
      [-42 + hairSway * 0.5, -114 + crouchY + idleBob],
      [-36 + hairSway * 0.5, -110 + crouchY + idleBob],
      [-24, -120 + crouchY + idleBob],
    ],
    p.ribbonMid,
    p.ribbonShadow,
    1.5
  );

  // --- 4. LEGS & LOWER BODY (All Normal & Special Variants) ---
  if (atk === 'kasumi_antiair') {
    // RISING MOON KICK (Towering vertical spiral crescent kick)
    drawPoly(ctx, [[-16, -72], [18, -72], [22, -50], [-14, -50]], p.navyMid, p.ink);
    drawPoly(ctx, [[4, -72], [18, -72], [17, -145], [5, -145]], p.skinMid, p.ink);
    drawPoly(ctx, [[5, -145], [17, -145], [16, -178], [4, -178]], p.sockMid, p.ink);
    drawPoly(ctx, [[3, -178], [18, -178], [19, -196], [2, -192]], p.shoeMid, p.ink);
    drawPoly(ctx, [[-16, -50], [-2, -50], [-14, -18], [-26, -22]], p.sockMid, p.ink);
    drawMotionArc(ctx, 10, -105, 105, -Math.PI * 0.95, 0.25, p.ki, 14);
  } else if (atk === 'kasumi_lunge') {
    // SHADOW LUNGE KICK (Aerodynamic flying dropkick forward)
    drawPoly(ctx, [[-30, -56], [10, -56], [10, -36], [-30, -36]], p.navyMid, p.ink);
    // Extended kick leg pointing forward horizontally
    drawPoly(ctx, [[10, -54], [62, -54], [62, -38], [10, -38]], p.skinMid, p.ink);
    drawPoly(ctx, [[62, -54], [96, -54], [96, -38], [62, -38]], p.sockMid, p.ink);
    drawPoly(ctx, [[96, -56], [118, -56], [116, -36], [94, -36]], p.shoeMid, p.ink);
    // Tucked trailing back leg
    drawPoly(ctx, [[-30, -42], [-14, -42], [-42, -26], [-54, -32]], p.sockMid, p.ink);
    drawMotionArc(ctx, 40, -46, 80, -0.3, 0.3, '#ffffff', 8);
    drawKiBurst(ctx, 114, -46, p.ki, 22);
  } else if (isAir) {
    if (atk === 'air_hk') {
      // Flying Side Kick
      drawPoly(ctx, [[-20, -70], [16, -70], [18, -48], [-18, -48]], p.navyMid, p.ink);
      drawPoly(ctx, [[14, -66], [54, -66], [54, -52], [14, -50]], p.skinMid, p.ink);
      drawPoly(ctx, [[54, -66], [88, -66], [88, -52], [54, -52]], p.sockMid, p.ink);
      drawPoly(ctx, [[88, -68], [108, -68], [106, -50], [86, -50]], p.shoeMid, p.ink);
      drawPoly(ctx, [[-20, -48], [-6, -48], [-28, -26], [-38, -32]], p.sockMid, p.ink);
      drawMotionArc(ctx, 35, -60, 82, -0.4, 0.4, '#ffffff', 8);
    } else if (atk === 'air_lk') {
      // Mid-Air Snap Kick
      drawPoly(ctx, [[-18, -70], [16, -70], [18, -48], [-16, -48]], p.navyMid, p.ink);
      drawPoly(ctx, [[10, -58], [48, -58], [48, -46], [10, -46]], p.skinMid, p.ink);
      drawPoly(ctx, [[48, -58], [74, -58], [74, -46], [48, -46]], p.sockMid, p.ink);
      drawPoly(ctx, [[74, -60], [92, -60], [90, -44], [72, -44]], p.shoeMid, p.ink);
      drawPoly(ctx, [[-16, -48], [-2, -48], [-10, -18], [-22, -18]], p.sockMid, p.ink);
    } else {
      // Jumping neutral
      drawPoly(ctx, [[-16, -70], [16, -70], [20, -50], [-14, -50]], p.navyMid, p.ink);
      drawPoly(ctx, [[-12, -50], [0, -50], [-8, -20], [-18, -20]], p.sockMid, p.ink);
      drawPoly(ctx, [[2, -50], [14, -50], [18, -15], [8, -15]], p.sockMid, p.ink);
      drawPoly(ctx, [[-20, -20], [-6, -20], [-8, -4], [-22, -4]], p.shoeMid, p.ink);
      drawPoly(ctx, [[6, -15], [20, -15], [22, 2], [8, 2]], p.shoeMid, p.ink);
    }
  } else if (isCrouch) {
    if (atk === 'crouch_hk') {
      // Sweeping Trip Kick
      drawPoly(ctx, [[-20, -42], [18, -42], [16, -24], [-18, -24]], p.navyMid, p.ink);
      drawPoly(ctx, [[12, -24], [58, -24], [58, -10], [12, -10]], p.skinMid, p.ink);
      drawPoly(ctx, [[58, -24], [90, -24], [90, -10], [58, -10]], p.sockMid, p.ink);
      drawPoly(ctx, [[90, -26], [112, -26], [110, -8], [88, -8]], p.shoeMid, p.ink);
      drawMotionArc(ctx, 35, -14, 82, 0, Math.PI * 0.45, '#ffffff', 8);
    } else if (atk === 'crouch_lk') {
      // Crouching Low Shin Kick
      drawPoly(ctx, [[-18, -44], [18, -44], [20, -22], [-20, -22]], p.navyMid, p.ink);
      drawPoly(ctx, [[8, -20], [46, -20], [46, -8], [8, -8]], p.skinMid, p.ink);
      drawPoly(ctx, [[46, -20], [70, -20], [70, -8], [46, -8]], p.sockMid, p.ink);
      drawPoly(ctx, [[70, -22], [88, -22], [86, -6], [68, -6]], p.shoeMid, p.ink);
      drawPoly(ctx, [[-18, -22], [0, -22], [-4, -2], [-20, -2]], p.sockMid, p.ink);
    } else {
      // Crouching base
      drawPoly(ctx, [[-18, -46], [18, -46], [22, -24], [-20, -24]], p.navyMid, p.ink);
      drawPoly(ctx, [[-18, -24], [16, -24], [14, -2], [-16, -2]], p.sockMid, p.ink);
      drawPoly(ctx, [[-20, -4], [18, -4], [18, 0], [-20, 0]], p.shoeMid, p.ink);
    }
  } else {
    // Standing or Walking
    drawPoly(ctx, [[-18, -74 + idleBob], [16, -74 + idleBob], [22, -48 + idleBob], [-22, -48 + idleBob]], p.navyMid, p.ink, 2);
    if (atk === 'hk') {
      // High Roundhouse / Crescent Kick
      drawPoly(ctx, [[-12, -48 + idleBob], [2, -48 + idleBob], [0, -6 + idleBob], [-14, -6 + idleBob]], p.sockMid, p.ink);
      drawPoly(ctx, [[-16, -6 + idleBob], [4, -6 + idleBob], [4, 0 + idleBob], [-16, 0 + idleBob]], p.shoeMid, p.ink);
      drawPoly(ctx, [[10, -72 + idleBob], [52, -100 + idleBob], [50, -86 + idleBob], [8, -58 + idleBob]], p.skinMid, p.ink);
      drawPoly(ctx, [[52, -100 + idleBob], [86, -118 + idleBob], [84, -104 + idleBob], [50, -86 + idleBob]], p.sockMid, p.ink);
      drawPoly(ctx, [[86, -118 + idleBob], [106, -130 + idleBob], [102, -116 + idleBob], [84, -104 + idleBob]], p.shoeMid, p.ink);
      drawMotionArc(ctx, 25, -80, 88, -Math.PI * 0.45, 0.25, '#ffffff', 10);
    } else if (atk === 'lk') {
      // Sharp Mid Front Kick
      drawPoly(ctx, [[-12, -48 + idleBob], [2, -48 + idleBob], [0, -6 + idleBob], [-14, -6 + idleBob]], p.sockMid, p.ink);
      drawPoly(ctx, [[-16, -6 + idleBob], [4, -6 + idleBob], [4, 0 + idleBob], [-16, 0 + idleBob]], p.shoeMid, p.ink);
      drawPoly(ctx, [[8, -58 + idleBob], [44, -58 + idleBob], [44, -46 + idleBob], [8, -46 + idleBob]], p.skinMid, p.ink);
      drawPoly(ctx, [[44, -58 + idleBob], [70, -58 + idleBob], [70, -46 + idleBob], [44, -46 + idleBob]], p.sockMid, p.ink);
      drawPoly(ctx, [[70, -60 + idleBob], [88, -60 + idleBob], [88, -44 + idleBob], [70, -44 + idleBob]], p.shoeMid, p.ink);
    } else {
      // Natural walking or standing legs
      const l1X = -12 - walkStride;
      const l2X = 5 + walkStride;
      drawPoly(ctx, [[l1X - 6, -48 + crouchY + idleBob], [l1X + 6, -48 + crouchY + idleBob], [l1X + 5, -34 + crouchY + idleBob], [l1X - 5, -34 + crouchY + idleBob]], p.skinMid, p.ink);
      drawPoly(ctx, [[l2X - 5, -48 + crouchY + idleBob], [l2X + 6, -48 + crouchY + idleBob], [l2X + 6, -34 + crouchY + idleBob], [l2X - 5, -34 + crouchY + idleBob]], p.skinMid, p.ink);
      drawPoly(ctx, [[l1X - 5, -34 + crouchY + idleBob], [l1X + 5, -34 + crouchY + idleBob], [l1X + 6, -18 + crouchY + idleBob], [l1X + 4, -6 + crouchY + idleBob], [l1X - 4, -6 + crouchY + idleBob], [l1X - 6, -18 + crouchY + idleBob]], p.sockMid, p.ink);
      drawPoly(ctx, [[l2X - 5, -34 + crouchY + idleBob], [l2X + 6, -34 + crouchY + idleBob], [l2X + 7, -18 + crouchY + idleBob], [l2X + 5, -6 + crouchY + idleBob], [l2X - 4, -6 + crouchY + idleBob], [l2X - 6, -18 + crouchY + idleBob]], p.sockMid, p.ink);
      drawPoly(ctx, [[l1X - 7, -6 + crouchY + idleBob], [l1X + 9, -6 + crouchY + idleBob], [l1X + 11, 0 + crouchY + idleBob], [l1X - 8, 0 + crouchY + idleBob]], p.shoeMid, p.ink);
      drawPoly(ctx, [[l2X - 7, -6 + crouchY + idleBob], [l2X + 9, -6 + crouchY + idleBob], [l2X + 11, 0 + crouchY + idleBob], [l2X - 8, 0 + crouchY + idleBob]], p.shoeMid, p.ink);
    }
  }

  // --- 5. TORSO: SAILOR BLOUSE & COLLAR ---
  const forwardLean = atk === 'kasumi_fireball' || atk === 'hp' ? 14 : 0;
  drawPoly(
    ctx,
    [
      [-14 + forwardLean, -110 + crouchY + idleBob],
      [14 + forwardLean, -110 + crouchY + idleBob],
      [13, -74 + crouchY + idleBob],
      [-13, -74 + crouchY + idleBob],
    ],
    p.blouseBase,
    p.ink,
    2
  );
  // Collar
  drawPoly(
    ctx,
    [
      [-17 + forwardLean, -114 + crouchY + idleBob],
      [17 + forwardLean, -114 + crouchY + idleBob],
      [12 + forwardLean, -98 + crouchY + idleBob],
      [-12 + forwardLean, -98 + crouchY + idleBob],
    ],
    p.navyMid,
    p.ink,
    1.5
  );
  // Ribbon
  drawPoly(
    ctx,
    [
      [-4 + forwardLean, -104 + crouchY + idleBob],
      [4 + forwardLean, -104 + crouchY + idleBob],
      [7 + forwardLean, -84 + crouchY + idleBob],
      [-6 + forwardLean, -84 + crouchY + idleBob],
    ],
    p.ribbonMid,
    p.ribbonShadow,
    1.5
  );

  // --- 6. HEAD & FACE ---
  drawPoly(
    ctx,
    [
      [-12 + forwardLean, -138 + crouchY + idleBob],
      [12 + forwardLean, -138 + crouchY + idleBob],
      [14 + forwardLean, -126 + crouchY + idleBob],
      [8 + forwardLean, -112 + crouchY + idleBob],
      [-4 + forwardLean, -112 + crouchY + idleBob],
      [-10 + forwardLean, -126 + crouchY + idleBob],
    ],
    p.skinMid,
    p.ink,
    2
  );
  drawHumanEar(ctx, -10 + forwardLean, -124 + crouchY + idleBob, p.skinMid, p.skinShadow);
  drawHumanFace(ctx, 3 + forwardLean, -128 + crouchY + idleBob, '#451a03', state, true, p.skinBlush);
  // Bangs
  drawPoly(
    ctx,
    [
      [-14 + forwardLean, -142 + crouchY + idleBob],
      [15 + forwardLean, -142 + crouchY + idleBob],
      [14 + forwardLean, -130 + crouchY + idleBob],
      [8 + forwardLean, -122 + crouchY + idleBob],
      [2 + forwardLean, -128 + crouchY + idleBob],
      [-4 + forwardLean, -121 + crouchY + idleBob],
      [-10 + forwardLean, -128 + crouchY + idleBob],
      [-14 + forwardLean, -132 + crouchY + idleBob],
    ],
    p.hairDark,
    p.hairInk,
    2
  );

  // --- 7. ARMS & ATTACKS ---
  if (isBlock) {
    drawPoly(ctx, [[2, -108 + crouchY + idleBob], [18, -108 + crouchY + idleBob], [22, -126 + crouchY + idleBob], [10, -126 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[-4, -104 + crouchY + idleBob], [14, -104 + crouchY + idleBob], [18, -122 + crouchY + idleBob], [4, -122 + crouchY + idleBob]], p.skinMid, p.ink);
    drawBlockShield(ctx, 0, 0, isCrouch, animTimer);
  } else if (atk === 'kasumi_fireball') {
    // CRIMSON FLARE FIREBALL CAST (Both palms thrust forward with swirling ki glow)
    drawPoly(ctx, [[-8 + forwardLean, -106 + crouchY + idleBob], [44, -106 + crouchY + idleBob], [44, -94 + crouchY + idleBob], [-8 + forwardLean, -94 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[-4 + forwardLean, -98 + crouchY + idleBob], [48, -98 + crouchY + idleBob], [48, -88 + crouchY + idleBob], [-4 + forwardLean, -88 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[44, -110 + crouchY + idleBob], [58, -110 + crouchY + idleBob], [56, -84 + crouchY + idleBob], [42, -84 + crouchY + idleBob]], p.skinMid, p.ink);
    drawKiBurst(ctx, 62, -96 + crouchY + idleBob, p.ki, 32);
  } else if (atk === 'hp' || atk === 'crouch_hp') {
    // Heavy Cross Punch
    drawPoly(ctx, [[10 + forwardLean, -106 + crouchY + idleBob], [56 + forwardLean, -106 + crouchY + idleBob], [56 + forwardLean, -94 + crouchY + idleBob], [10 + forwardLean, -94 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[56 + forwardLean, -108 + crouchY + idleBob], [70 + forwardLean, -108 + crouchY + idleBob], [70 + forwardLean, -92 + crouchY + idleBob], [56 + forwardLean, -92 + crouchY + idleBob]], p.skinMid, p.ink);
    drawMotionArc(ctx, 32 + forwardLean, -100 + crouchY + idleBob, 50, -0.3, 0.3, '#ffffff', 8);
  } else if (atk === 'lp' || atk === 'crouch_lp') {
    // Fast Jab
    drawPoly(ctx, [[8, -104 + crouchY + idleBob], [44, -104 + crouchY + idleBob], [44, -94 + crouchY + idleBob], [8, -94 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[44, -106 + crouchY + idleBob], [56, -106 + crouchY + idleBob], [56, -92 + crouchY + idleBob], [44, -92 + crouchY + idleBob]], p.skinMid, p.ink);
  } else if (isAir && (atk === 'air_lp' || atk === 'air_hp')) {
    // Airborne Knuckle Strike
    drawPoly(ctx, [[10, -100], [48, -80], [44, -70], [8, -90]], p.skinMid, p.ink);
    drawPoly(ctx, [[48, -82], [62, -72], [58, -62], [44, -72]], p.skinMid, p.ink);
    drawMotionArc(ctx, 30, -85, 45, -0.5, 0.4, '#ffffff', 6);
  } else {
    // Combat Stance Arms
    drawPoly(ctx, [[-16, -106 + crouchY + idleBob], [-8, -106 + crouchY + idleBob], [-2, -88 + crouchY + idleBob], [-10, -88 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[8, -108 + crouchY + idleBob], [16, -108 + crouchY + idleBob], [22, -90 + crouchY + idleBob], [14, -90 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[14, -92 + crouchY + idleBob], [24, -92 + crouchY + idleBob], [22, -82 + crouchY + idleBob], [12, -82 + crouchY + idleBob]], p.skinMid, p.ink);
  }
}
