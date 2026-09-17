// 16-Bit Kenzo Takahashi Sprite & Animation Set
import { FighterState } from '../../types/game';
import { SF_PALETTES, drawPoly, drawMotionArc, drawHumanFace, drawHumanEar, drawBlockShield, drawKiBurst } from './common';

export function renderKenzoSprite(ctx: CanvasRenderingContext2D, f: FighterState, animTimer: number) {
  const p = SF_PALETTES.kenzo;
  const state = f.state;
  const atk = f.currentAttack || '';
  const isCrouch = f.isCrouching || state === 'crouch';
  const isAir = !f.isGrounded;
  const isBlock = state === 'block';
  const isHit = state === 'hit';

  const idleBob = state === 'idle' ? Math.sin(animTimer * 6.5) * 3 : 0;
  const walkStride = state === 'walk' ? Math.sin(animTimer * 14) * 12 : 0;
  const crouchY = isCrouch ? 36 : 0;

  // --- 1. KNOCKDOWN ---
  if (state === 'knockdown') {
    drawPoly(ctx, [[-60, -8], [-25, -24], [-15, -14], [-50, -2]], p.hairDark, p.hairMid);
    drawPoly(ctx, [[-26, -24], [-4, -24], [-2, -8], [-24, -8]], p.skinMid, p.ink);
    drawHumanFace(ctx, -14, -20, '#10b981', state, false);
    drawPoly(ctx, [[-4, -22], [30, -22], [28, -6], [-2, -6]], p.giMid, p.ink);
    drawPoly(ctx, [[30, -22], [70, -20], [68, -4], [30, -4]], p.giMid, p.ink);
    drawPoly(ctx, [[70, -18], [94, -14], [92, -2], [70, -2]], p.skinMid, p.ink);
    return;
  }

  // --- 2. HIT STUN ---
  if (isHit) {
    drawPoly(ctx, [[-28, -114], [-48, -132], [-44, -102], [-22, -100]], p.bandanaMid, p.bandanaShadow);
    drawPoly(ctx, [[-22, -66], [10, -68], [12, -22], [-24, -20]], p.giMid, p.ink);
    drawPoly(ctx, [[-26, -20], [-10, -20], [-12, 0], [-28, 0]], p.skinMid, p.ink);
    drawPoly(ctx, [[0, -22], [16, -22], [18, 0], [2, 0]], p.skinMid, p.ink);
    drawPoly(ctx, [[-20, -106], [6, -110], [4, -68], [-22, -66]], p.giMid, p.ink);
    drawPoly(ctx, [[-18, -134], [4, -136], [8, -114], [-14, -112]], p.skinMid, p.ink);
    drawHumanFace(ctx, -4, -128, '#10b981', state, false);
    drawPoly(ctx, [[-20, -104], [-44, -120], [-40, -130], [-16, -114]], p.skinMid, p.ink);
    drawPoly(ctx, [[6, -106], [28, -122], [32, -114], [10, -98]], p.skinMid, p.ink);
    return;
  }

  // --- 3. FLOWING RED HACHIMAKI (HEADBAND) TAILS ---
  const bandWave = Math.sin(animTimer * 12) * 8;
  drawPoly(
    ctx,
    [
      [-14, -134 + crouchY + idleBob],
      [-36 + bandWave, -128 + crouchY + idleBob],
      [-52 + bandWave * 1.4, -114 + crouchY + idleBob],
      [-42 + bandWave * 1.2, -108 + crouchY + idleBob],
      [-26 + bandWave * 0.8, -118 + crouchY + idleBob],
      [-14, -124 + crouchY + idleBob],
    ],
    p.bandanaMid,
    p.bandanaShadow,
    2
  );

  // --- 4. LEGS & LOWER BODY (All Normal & Special Variants) ---
  if (atk === 'kenzo_antiair') {
    // DRAGON RISING STRIKE (Shoryuken vertical soaring uppercut)
    drawPoly(ctx, [[-18, -70], [18, -70], [20, -48], [-16, -48]], p.giMid, p.ink);
    // Tucked back leg, trailing front leg
    drawPoly(ctx, [[-16, -48], [4, -48], [0, -16], [-20, -18]], p.giMid, p.ink);
    drawPoly(ctx, [[6, -48], [24, -48], [26, -12], [8, -12]], p.giMid, p.ink);
    drawPoly(ctx, [[-18, -18], [-4, -18], [-4, -4], [-18, -4]], p.skinMid, p.ink);
    drawPoly(ctx, [[8, -12], [26, -12], [26, 2], [8, 2]], p.skinMid, p.ink);
  } else if (atk === 'kenzo_hurricane') {
    // TATSUMAKI SENPUUKYAKU (Horizontal helicopter spinning kick)
    const spinFrame = Math.floor(animTimer * 20) % 2;
    drawPoly(ctx, [[-24, -58], [24, -58], [24, -38], [-24, -38]], p.giMid, p.ink);
    if (spinFrame === 0) {
      drawPoly(ctx, [[24, -56], [74, -56], [74, -38], [24, -38]], p.giMid, p.ink);
      drawPoly(ctx, [[74, -54], [94, -54], [94, -40], [74, -40]], p.skinMid, p.ink);
      drawPoly(ctx, [[-24, -56], [-68, -56], [-68, -38], [-24, -38]], p.giMid, p.ink);
      drawPoly(ctx, [[-68, -54], [-88, -54], [-88, -40], [-68, -40]], p.skinMid, p.ink);
    } else {
      drawPoly(ctx, [[20, -56], [68, -66], [68, -48], [20, -38]], p.giMid, p.ink);
      drawPoly(ctx, [[68, -64], [88, -64], [88, -50], [68, -50]], p.skinMid, p.ink);
      drawPoly(ctx, [[-20, -56], [-64, -46], [-64, -28], [-20, -38]], p.giMid, p.ink);
      drawPoly(ctx, [[-64, -44], [-84, -44], [-84, -30], [-64, -30]], p.skinMid, p.ink);
    }
    drawMotionArc(ctx, 0, -48, 92, -Math.PI * 0.9, Math.PI * 0.9, p.ki, 12);
  } else if (isAir) {
    if (atk === 'air_hk') {
      // Flying Side Kick
      drawPoly(ctx, [[-20, -70], [18, -70], [20, -48], [-18, -48]], p.giMid, p.ink);
      drawPoly(ctx, [[14, -64], [64, -64], [64, -46], [14, -46]], p.giMid, p.ink);
      drawPoly(ctx, [[64, -62], [92, -62], [92, -48], [64, -48]], p.skinMid, p.ink);
      drawPoly(ctx, [[-20, -48], [-4, -48], [-22, -22], [-34, -26]], p.giMid, p.ink);
      drawMotionArc(ctx, 36, -55, 80, -0.4, 0.3, '#ffffff', 8);
    } else if (atk === 'air_lk') {
      // Air Snap Kick
      drawPoly(ctx, [[-18, -70], [18, -70], [20, -48], [-18, -48]], p.giMid, p.ink);
      drawPoly(ctx, [[10, -56], [48, -56], [48, -44], [10, -44]], p.giMid, p.ink);
      drawPoly(ctx, [[48, -54], [72, -54], [70, -44], [46, -44]], p.skinMid, p.ink);
      drawPoly(ctx, [[-18, -48], [-2, -48], [-8, -18], [-20, -18]], p.giMid, p.ink);
    } else {
      // Air neutral
      drawPoly(ctx, [[-20, -70], [20, -70], [22, -48], [-18, -48]], p.giMid, p.ink);
      drawPoly(ctx, [[-16, -48], [0, -48], [-8, -18], [-22, -18]], p.giMid, p.ink);
      drawPoly(ctx, [[4, -48], [18, -48], [22, -14], [8, -14]], p.giMid, p.ink);
      drawPoly(ctx, [[-22, -18], [-6, -18], [-8, -2], [-24, -2]], p.skinMid, p.ink);
      drawPoly(ctx, [[6, -14], [22, -14], [24, 2], [8, 2]], p.skinMid, p.ink);
    }
  } else if (isCrouch) {
    if (atk === 'crouch_hk') {
      // Low Roundhouse Sweep
      drawPoly(ctx, [[-22, -42], [18, -42], [16, -24], [-20, -24]], p.giMid, p.ink);
      drawPoly(ctx, [[12, -24], [64, -24], [64, -8], [12, -8]], p.giMid, p.ink);
      drawPoly(ctx, [[64, -22], [96, -22], [94, -6], [62, -6]], p.skinMid, p.ink);
      drawMotionArc(ctx, 38, -15, 84, 0, Math.PI * 0.45, '#ffffff', 8);
    } else if (atk === 'crouch_lk') {
      // Low Toe Kick
      drawPoly(ctx, [[-20, -44], [18, -44], [20, -22], [-20, -22]], p.giMid, p.ink);
      drawPoly(ctx, [[8, -22], [52, -22], [52, -10], [8, -10]], p.giMid, p.ink);
      drawPoly(ctx, [[52, -20], [76, -20], [74, -8], [50, -8]], p.skinMid, p.ink);
    } else {
      drawPoly(ctx, [[-22, -44], [18, -44], [22, -22], [-22, -22]], p.giMid, p.ink);
      drawPoly(ctx, [[-20, -22], [18, -22], [16, -2], [-18, -2]], p.giMid, p.ink);
      drawPoly(ctx, [[-22, -4], [18, -4], [18, 0], [-22, 0]], p.skinMid, p.ink);
    }
  } else {
    // Standing or Walking
    if (atk === 'hk') {
      // High Side Kick with full extension
      drawPoly(ctx, [[-14, -48 + idleBob], [2, -48 + idleBob], [0, -6 + idleBob], [-16, -6 + idleBob]], p.giMid, p.ink);
      drawPoly(ctx, [[-18, -6 + idleBob], [4, -6 + idleBob], [4, 0 + idleBob], [-18, 0 + idleBob]], p.skinMid, p.ink);
      drawPoly(ctx, [[10, -70 + idleBob], [58, -98 + idleBob], [56, -84 + idleBob], [8, -56 + idleBob]], p.giMid, p.ink);
      drawPoly(ctx, [[58, -98 + idleBob], [96, -118 + idleBob], [94, -104 + idleBob], [56, -84 + idleBob]], p.skinMid, p.ink);
      drawMotionArc(ctx, 28, -78, 90, -Math.PI * 0.45, 0.25, '#ffffff', 10);
    } else if (atk === 'lk') {
      // Sharp Mid Front Kick
      drawPoly(ctx, [[-14, -48 + idleBob], [2, -48 + idleBob], [0, -6 + idleBob], [-16, -6 + idleBob]], p.giMid, p.ink);
      drawPoly(ctx, [[-18, -6 + idleBob], [4, -6 + idleBob], [4, 0 + idleBob], [-18, 0 + idleBob]], p.skinMid, p.ink);
      drawPoly(ctx, [[8, -58 + idleBob], [52, -58 + idleBob], [52, -44 + idleBob], [8, -44 + idleBob]], p.giMid, p.ink);
      drawPoly(ctx, [[52, -58 + idleBob], [78, -58 + idleBob], [78, -44 + idleBob], [52, -44 + idleBob]], p.skinMid, p.ink);
    } else {
      const l1X = -14 - walkStride;
      const l2X = 8 + walkStride;
      drawPoly(ctx, [[l1X - 8, -68 + crouchY + idleBob], [l1X + 8, -68 + crouchY + idleBob], [l1X + 9, -20 + crouchY + idleBob], [l1X - 8, -20 + crouchY + idleBob]], p.giMid, p.ink);
      drawPoly(ctx, [[l2X - 8, -68 + crouchY + idleBob], [l2X + 9, -68 + crouchY + idleBob], [l2X + 10, -20 + crouchY + idleBob], [l2X - 8, -20 + crouchY + idleBob]], p.giMid, p.ink);
      drawPoly(ctx, [[l1X - 8, -20 + crouchY + idleBob], [l1X + 9, -20 + crouchY + idleBob], [l1X + 10, 0 + crouchY + idleBob], [l1X - 9, 0 + crouchY + idleBob]], p.skinMid, p.ink);
      drawPoly(ctx, [[l2X - 8, -20 + crouchY + idleBob], [l2X + 9, -20 + crouchY + idleBob], [l2X + 10, 0 + crouchY + idleBob], [l2X - 9, 0 + crouchY + idleBob]], p.skinMid, p.ink);
    }
  }

  // --- 5. TORSO: KARATE GI (OPEN CHEST SHOWING MUSCLES & BLACK BELT) ---
  const forwardLean = atk === 'kenzo_fireball' || atk === 'hp' ? 12 : 0;
  drawPoly(
    ctx,
    [
      [-16 + forwardLean, -114 + crouchY + idleBob],
      [16 + forwardLean, -114 + crouchY + idleBob],
      [14, -68 + crouchY + idleBob],
      [-14, -68 + crouchY + idleBob],
    ],
    p.giMid,
    p.ink,
    2
  );
  // Muscular chest exposed in V-neck gi
  drawPoly(
    ctx,
    [
      [-6 + forwardLean, -114 + crouchY + idleBob],
      [6 + forwardLean, -114 + crouchY + idleBob],
      [0 + forwardLean, -90 + crouchY + idleBob],
    ],
    p.skinMid,
    p.skinShadow,
    1.5
  );

  // Black Belt (Obi with fluttering ties)
  drawPoly(
    ctx,
    [
      [-15, -72 + crouchY + idleBob],
      [15, -72 + crouchY + idleBob],
      [14, -62 + crouchY + idleBob],
      [-14, -62 + crouchY + idleBob],
    ],
    p.beltMid,
    p.ink,
    2
  );
  drawPoly(
    ctx,
    [
      [2, -62 + crouchY + idleBob],
      [10, -62 + crouchY + idleBob],
      [12, -42 + crouchY + idleBob],
      [4, -42 + crouchY + idleBob],
    ],
    p.beltMid,
    p.ink,
    1.5
  );

  // --- 6. HEAD, FACE & HACHIMAKI ---
  drawPoly(
    ctx,
    [
      [-12 + forwardLean, -140 + crouchY + idleBob],
      [12 + forwardLean, -140 + crouchY + idleBob],
      [14 + forwardLean, -128 + crouchY + idleBob],
      [8 + forwardLean, -114 + crouchY + idleBob],
      [-4 + forwardLean, -114 + crouchY + idleBob],
      [-10 + forwardLean, -128 + crouchY + idleBob],
    ],
    p.skinMid,
    p.ink,
    2
  );
  drawHumanEar(ctx, -10 + forwardLean, -126 + crouchY + idleBob, p.skinMid, p.skinShadow);
  drawHumanFace(ctx, 3 + forwardLean, -130 + crouchY + idleBob, '#10b981', state, false);

  // Red Hachimaki Headband on Forehead
  drawPoly(
    ctx,
    [
      [-13 + forwardLean, -140 + crouchY + idleBob],
      [13 + forwardLean, -140 + crouchY + idleBob],
      [14 + forwardLean, -132 + crouchY + idleBob],
      [-12 + forwardLean, -132 + crouchY + idleBob],
    ],
    p.bandanaMid,
    p.bandanaShadow,
    1.5
  );

  // Spiky Black Hair
  drawPoly(
    ctx,
    [
      [-14 + forwardLean, -144 + crouchY + idleBob],
      [14 + forwardLean, -144 + crouchY + idleBob],
      [16 + forwardLean, -138 + crouchY + idleBob],
      [-14 + forwardLean, -138 + crouchY + idleBob],
    ],
    p.hairDark,
    p.ink,
    2
  );

  // --- 7. ARMS & PUNCH / SPECIAL ATTACKS ---
  if (isBlock) {
    // Cross-arm karate guard
    drawPoly(ctx, [[-2, -108 + crouchY + idleBob], [18, -108 + crouchY + idleBob], [22, -128 + crouchY + idleBob], [6, -128 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[14, -128 + crouchY + idleBob], [24, -128 + crouchY + idleBob], [22, -118 + crouchY + idleBob], [12, -118 + crouchY + idleBob]], p.wrapMid, p.ink);
    drawBlockShield(ctx, 0, 0, isCrouch, animTimer);
  } else if (atk === 'kenzo_antiair') {
    // SHORYUKEN (Fist raised soaring skyward)
    drawPoly(ctx, [[6, -112 + crouchY + idleBob], [24, -112 + crouchY + idleBob], [24, -164 + crouchY + idleBob], [8, -164 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[6, -164 + crouchY + idleBob], [26, -164 + crouchY + idleBob], [26, -182 + crouchY + idleBob], [6, -182 + crouchY + idleBob]], p.wrapMid, p.ink);
    drawMotionArc(ctx, 16, -145, 60, -Math.PI * 0.8, 0.2, p.ki, 12);
    drawKiBurst(ctx, 16, -180 + crouchY + idleBob, p.ki, 28);
  } else if (atk === 'kenzo_fireball') {
    // HADOUKEN PALMS FORWARD BLAST
    drawPoly(ctx, [[-6 + forwardLean, -108 + crouchY + idleBob], [48, -108 + crouchY + idleBob], [48, -96 + crouchY + idleBob], [-6 + forwardLean, -96 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[-2 + forwardLean, -100 + crouchY + idleBob], [52, -100 + crouchY + idleBob], [52, -90 + crouchY + idleBob], [-2 + forwardLean, -90 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[48, -112 + crouchY + idleBob], [62, -112 + crouchY + idleBob], [60, -86 + crouchY + idleBob], [46, -86 + crouchY + idleBob]], p.wrapMid, p.ink);
    drawKiBurst(ctx, 66, -98 + crouchY + idleBob, p.ki, 34);
  } else if (atk === 'hp' || atk === 'crouch_hp') {
    // Seiken Zuki (Solar plexus lunging straight punch)
    drawPoly(ctx, [[10 + forwardLean, -106 + crouchY + idleBob], [58 + forwardLean, -106 + crouchY + idleBob], [58 + forwardLean, -94 + crouchY + idleBob], [10 + forwardLean, -94 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[58 + forwardLean, -108 + crouchY + idleBob], [72 + forwardLean, -108 + crouchY + idleBob], [72 + forwardLean, -92 + crouchY + idleBob], [58 + forwardLean, -92 + crouchY + idleBob]], p.wrapMid, p.ink);
    drawMotionArc(ctx, 32 + forwardLean, -100 + crouchY + idleBob, 50, -0.3, 0.3, '#ffffff', 8);
  } else if (atk === 'lp' || atk === 'crouch_lp') {
    // Fast Karate Jab
    drawPoly(ctx, [[10, -104 + crouchY + idleBob], [46, -104 + crouchY + idleBob], [46, -94 + crouchY + idleBob], [10, -94 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[46, -106 + crouchY + idleBob], [58, -106 + crouchY + idleBob], [58, -92 + crouchY + idleBob], [46, -92 + crouchY + idleBob]], p.wrapMid, p.ink);
  } else if (isAir && (atk === 'air_lp' || atk === 'air_hp')) {
    // Flying Knife-Hand Chop
    drawPoly(ctx, [[10, -100], [50, -82], [46, -72], [8, -90]], p.skinMid, p.ink);
    drawPoly(ctx, [[50, -84], [64, -74], [60, -64], [46, -74]], p.wrapMid, p.ink);
    drawMotionArc(ctx, 32, -84, 48, -0.4, 0.3, '#ffffff', 6);
  } else {
    // Traditional Ryu karate guard
    drawPoly(ctx, [[-16, -108 + crouchY + idleBob], [-6, -108 + crouchY + idleBob], [-2, -88 + crouchY + idleBob], [-12, -88 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[8, -108 + crouchY + idleBob], [18, -108 + crouchY + idleBob], [24, -90 + crouchY + idleBob], [14, -90 + crouchY + idleBob]], p.skinMid, p.ink);
    drawPoly(ctx, [[14, -92 + crouchY + idleBob], [24, -92 + crouchY + idleBob], [22, -82 + crouchY + idleBob], [12, -82 + crouchY + idleBob]], p.wrapMid, p.ink);
  }
}
