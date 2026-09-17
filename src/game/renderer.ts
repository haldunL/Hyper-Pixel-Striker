// 16-Bit SNES Capcom-Style Pixel Art Canvas Renderer for Hyper Pixel Striker
import { FighterState, Projectile, HitParticle, StageId } from '../types/game';
import {
  renderKasumiSprite,
  renderRoxieSprite,
  renderKenzoSprite,
  renderMarcusSprite,
  renderRaizenSprite,
} from './fighterSprites';

export class PixelRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number = 800;
  private height: number = 450;
  private groundY: number = 380;
  private animTimer: number = 0;

  constructor(ctx: CanvasRenderingContext2D, width: number = 800, height: number = 450) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.groundY = 380;
  }

  public getCanvas(): HTMLCanvasElement {
    return this.ctx.canvas;
  }

  public setDimensions(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.groundY = Math.floor(h * 0.84);
  }

  public render(
    stageId: StageId,
    fighters: FighterState[],
    projectiles: Projectile[],
    particles: HitParticle[],
    shakeX: number = 0,
    shakeY: number = 0
  ) {
    this.animTimer += 0.05;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Apply screen shake
    if (shakeX !== 0 || shakeY !== 0) {
      ctx.translate(shakeX, shakeY);
    }

    // 1. Draw 16-Bit SNES Stage Backdrop
    this.drawStage(stageId);

    // 2. Draw Floor Reflections (for polished Dojo) & Fighter Shadows
    if (stageId === 'gym') {
      this.drawFloorReflections(fighters);
    }

    fighters.forEach((f) => {
      this.drawShadow(f);
    });

    // 3. Draw Projectiles (Street Fighter Plasma Hadoukens)
    this.drawProjectiles(projectiles);

    // 4. Draw Fighters (Large SNES 16-Bit Sprites)
    fighters.forEach((f) => {
      this.drawFighter(f);
    });

    // 5. Draw Particles (Capcom Hit Sparks, Smoke & Popups)
    this.drawParticles(particles);

    // 6. Draw Stage Foreground FX (Sakura Petals or Ring Ropes)
    this.drawStageForeground(stageId);

    ctx.restore();
  }

  // =========================================================================
  // 16-BIT SNES STREET FIGHTER STAGES (Authentic Capcom CPS-1 Backdrops)
  // =========================================================================
  private drawStage(stageId: StageId) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const gY = this.groundY;

    if (stageId === 'park') {
      // 1. SUZAKU ROOFTOP / TEMPLE (Japan - Ryu's Classic Setting)
      // Sunset gradient: deep purple -> blood crimson -> twilight orange
      const skyGrad = ctx.createLinearGradient(0, 0, 0, gY);
      skyGrad.addColorStop(0, '#1e1b4b');
      skyGrad.addColorStop(0.35, '#581c87');
      skyGrad.addColorStop(0.65, '#991b1b');
      skyGrad.addColorStop(0.9, '#d97706');
      skyGrad.addColorStop(1, '#f59e0b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, gY);

      // Giant Luminous Full Moon
      const moonX = w * 0.72;
      const moonY = 85;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 48, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef9c3';
      ctx.beginPath();
      ctx.arc(moonX - 4, moonY - 4, 44, 0, Math.PI * 2);
      ctx.fill();
      // Moon Craters
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(moonX + 14, moonY - 10, 10, 0, Math.PI * 2);
      ctx.arc(moonX - 12, moonY + 16, 14, 0, Math.PI * 2);
      ctx.arc(moonX + 18, moonY + 14, 8, 0, Math.PI * 2);
      ctx.fill();

      // Distant Silhouette of Mount Fuji
      ctx.fillStyle = '#180a2a';
      ctx.beginPath();
      ctx.moveTo(moonX - 160, gY - 60);
      ctx.lineTo(moonX - 70, gY - 180);
      ctx.lineTo(moonX, gY - 180);
      ctx.lineTo(moonX + 90, gY - 60);
      ctx.closePath();
      ctx.fill();
      // Snowcap
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.moveTo(moonX - 85, gY - 155);
      ctx.lineTo(moonX - 70, gY - 180);
      ctx.lineTo(moonX, gY - 180);
      ctx.lineTo(moonX + 22, gY - 155);
      ctx.closePath();
      ctx.fill();

      // Traditional Pagoda Roof Tiles in midground
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, gY - 70, w, 40);
      // Curved Japanese Teal Eaves
      ctx.fillStyle = '#0d9488';
      for (let tx = 0; tx < w; tx += 28) {
        ctx.fillRect(tx, gY - 74, 24, 8);
        ctx.fillRect(tx + 4, gY - 66, 16, 4);
      }
      // Golden Dragon Roof Ornaments (Shachihoko)
      ctx.fillStyle = '#eab308';
      ctx.fillRect(40, gY - 96, 16, 26);
      ctx.fillRect(w - 60, gY - 96, 16, 26);

      // Wooden Temple Balcony Posts & Lanterns
      ctx.fillStyle = '#451a03';
      for (let bx = 50; bx < w; bx += 180) {
        ctx.fillRect(bx, gY - 60, 16, 60);
        // Hanging Red Paper Lantern
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(bx + 8, gY - 35, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(bx + 4, gY - 38, 8, 7);
      }

      // Wooden Rooftop Walkway Floor
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, gY, w, h - gY);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(0, gY, w, 6);
      // Floor planks
      ctx.fillStyle = '#451a03';
      for (let px = 0; px < w; px += 45) {
        ctx.fillRect(px, gY, 3, h - gY);
      }
    } else if (stageId === 'alley') {
      // 2. METRO CITY NEON ALLEY (Gritty 90s Arcade Street)
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, w, gY);

      // Brick Wall Facade
      ctx.fillStyle = '#451a1a';
      ctx.fillRect(0, 0, w, gY);
      ctx.fillStyle = '#2d1010';
      for (let by = 0; by < gY; by += 16) {
        const offset = (by / 16) % 2 === 0 ? 0 : 20;
        for (let bx = offset; bx < w; bx += 40) {
          ctx.fillRect(bx, by, 38, 14);
        }
      }

      // Fire Escape Metal Stairs & Platforms
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(40, 80, 160, 12);
      ctx.fillRect(40, 190, 160, 12);
      ctx.fillRect(w - 200, 110, 150, 12);
      ctx.fillRect(w - 200, 220, 150, 12);
      // Railings
      ctx.fillRect(40, 60, 160, 4);
      ctx.fillRect(w - 200, 90, 150, 4);

      // Glowing Neon Signs (Animated Flickers)
      const flicker1 = Math.sin(this.animTimer * 12) > 0.1 ? '#f43f5e' : '#881337';
      const flicker2 = Math.cos(this.animTimer * 10) > 0.0 ? '#38bdf8' : '#0369a1';
      const flicker3 = Math.sin(this.animTimer * 15) > -0.2 ? '#facc15' : '#854d0e';

      // Neon Sign 1: "DRAGON BAR"
      ctx.fillStyle = '#050508';
      ctx.fillRect(60, 30, 120, 40);
      ctx.strokeStyle = flicker1;
      ctx.lineWidth = 3;
      ctx.strokeRect(60, 30, 120, 40);
      ctx.fillStyle = flicker1;
      ctx.font = 'bold 16px "Courier New", monospace, sans-serif';
      ctx.fillText('DRAGON', 75, 56);

      // Neon Sign 2: "ARCADE 1994"
      ctx.fillStyle = '#050508';
      ctx.fillRect(w - 180, 45, 130, 46);
      ctx.strokeStyle = flicker2;
      ctx.lineWidth = 3;
      ctx.strokeRect(w - 180, 45, 130, 46);
      ctx.fillStyle = flicker2;
      ctx.font = 'bold 15px "Courier New", monospace, sans-serif';
      ctx.fillText('ARCADE', w - 165, 74);

      // Neon Sign 3: "NOODLES"
      ctx.fillStyle = '#050508';
      ctx.fillRect(w / 2 - 50, 80, 100, 32);
      ctx.strokeStyle = flicker3;
      ctx.lineWidth = 2;
      ctx.strokeRect(w / 2 - 50, 80, 100, 32);
      ctx.fillStyle = flicker3;
      ctx.font = 'bold 12px "Courier New", monospace, sans-serif';
      ctx.fillText('SUSHI / BAR', w / 2 - 42, 101);

      // Wet Asphalt Street Floor with Neon Puddle Reflections
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, gY, w, h - gY);
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(0, gY, w, 5);

      // Neon Puddle Reflections
      ctx.fillStyle = 'rgba(244, 63, 94, 0.18)';
      ctx.fillRect(80, gY + 15, 140, 25);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.fillRect(w - 220, gY + 18, 160, 24);

      // Steaming Manhole Cover with Animated Rising Pixel Smoke
      ctx.fillStyle = '#374151';
      ctx.beginPath();
      ctx.ellipse(w / 2, gY + 30, 44, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1f2937';
      ctx.beginPath();
      ctx.ellipse(w / 2, gY + 30, 38, 11, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rising steam
      ctx.fillStyle = 'rgba(226, 232, 240, 0.28)';
      for (let s = 0; s < 5; s++) {
        const steamY = gY + 10 - ((this.animTimer * 30 + s * 25) % 90);
        const steamX = w / 2 + Math.sin(steamY * 0.08) * 16;
        const steamR = 12 + s * 4;
        ctx.beginPath();
        ctx.arc(steamX, steamY, steamR, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (stageId === 'ring') {
      // 3. LAS VEGAS WORLD BOXING CHAMPIONSHIP ARENA
      // Dark packed arena with cheering crowd in bleachers
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, w, gY);

      // Cheering Crowd Silhouettes
      ctx.fillStyle = '#0f172a';
      for (let cy = 80; cy < gY - 60; cy += 22) {
        for (let cx = 0; cx < w; cx += 18) {
          const headBob = Math.sin(this.animTimer * 10 + cx + cy) * 3;
          ctx.beginPath();
          ctx.arc(cx + 8, cy + headBob, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Animated Camera Flashbulbs Popping in Crowd!
      for (let f = 0; f < 8; f++) {
        const flashSeed = Math.floor(this.animTimer * 14 + f * 17);
        if (flashSeed % 5 === 0) {
          const fx = ((f * 137 + flashSeed * 91) % (w - 60)) + 30;
          const fy = ((f * 83 + flashSeed * 47) % (gY - 140)) + 60;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(fx, fy, 8, 0, Math.PI * 2);
          ctx.fill();
          // Cross flare
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(fx - 14, fy);
          ctx.lineTo(fx + 14, fy);
          ctx.moveTo(fx, fy - 14);
          ctx.lineTo(fx, fy + 14);
          ctx.stroke();
        }
      }

      // Overhead Steel Lighting Trusses
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 20, w, 18);
      ctx.fillStyle = '#64748b';
      for (let lx = 30; lx < w; lx += 90) {
        ctx.fillRect(lx, 26, 40, 18);
        // Angled floodlight beam down to canvas
        ctx.fillStyle = 'rgba(254, 240, 138, 0.07)';
        ctx.beginPath();
        ctx.moveTo(lx + 20, 44);
        ctx.lineTo(lx - 60, gY);
        ctx.lineTo(lx + 100, gY);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#64748b';
      }

      // Championship Banner: "HYPER BATTLE CHAMPIONSHIP"
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(w / 2 - 170, 48, 340, 30);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.strokeRect(w / 2 - 170, 48, 340, 30);
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 14px "Courier New", monospace, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★ WBA WORLD FIGHT CHAMPIONSHIP ★', w / 2, 68);
      ctx.textAlign = 'start';

      // Ring Canvas Mat Floor
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, gY, w, h - gY);
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(0, gY, w, 6);

      // Mat Center Circle
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(w / 2, gY + 36, 120, 26, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (stageId === 'gym') {
      // 4. GRAND MASTER'S DOJO (Japan Martial Arts Temple)
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, w, gY);

      // Shoji Paper Screens & Wooden Grid
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(0, 40, w, gY - 40);
      ctx.fillStyle = '#451a03';
      for (let sx = 0; sx < w; sx += 36) {
        ctx.fillRect(sx, 40, 4, gY - 40);
      }
      for (let sy = 40; sy < gY; sy += 36) {
        ctx.fillRect(0, sy, w, 4);
      }

      // Giant Golden Folding Screen with Soaring Tiger & Dragon Painting
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(w / 2 - 180, 60, 360, 160);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(w / 2 - 174, 66, 348, 148);
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 4;
      ctx.strokeRect(w / 2 - 180, 60, 360, 160);

      // Calligraphy Hanging Banners: "風林火山" (Furinkazan) & "闘魂" (Fighting Spirit)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(80, 50, 40, 140);
      ctx.fillRect(w - 120, 50, 40, 140);
      ctx.fillStyle = '#050508';
      ctx.fillRect(94, 70, 12, 100);
      ctx.fillRect(w - 106, 70, 12, 100);

      // Polished Hardwood Pine Floor
      ctx.fillStyle = '#78350f';
      ctx.fillRect(0, gY, w, h - gY);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(0, gY, w, 6);
      ctx.fillStyle = '#451a03';
      for (let px = 0; px < w; px += 50) {
        ctx.fillRect(px, gY, 3, h - gY);
      }
    } else if (stageId === 'throne') {
      // 5. SHADOW CITADEL THRONE ROOM (Final Boss - Lord Raizen's Dark Sanctuary)
      // Ominous twilight sky with Eclipse Moon
      const skyGrad = ctx.createLinearGradient(0, 0, 0, gY);
      skyGrad.addColorStop(0, '#030008');
      skyGrad.addColorStop(0.4, '#150624');
      skyGrad.addColorStop(0.75, '#3b0764');
      skyGrad.addColorStop(1, '#4c0519');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, gY);

      // Giant Blood Red Eclipse Moon
      const moonX = w / 2;
      const moonY = 85;
      const moonRad = 58;
      // Outer blood glow
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, 95);
      moonGlow.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
      moonGlow.addColorStop(0.6, 'rgba(185, 28, 28, 0.4)');
      moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = moonGlow;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 95, 0, Math.PI * 2);
      ctx.fill();

      // Moon body
      ctx.fillStyle = '#b91c1c';
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRad, 0, Math.PI * 2);
      ctx.fill();

      // Dark Eclipse Core
      ctx.fillStyle = '#0f051d';
      ctx.beginPath();
      ctx.arc(moonX + 6, moonY - 4, moonRad - 8, 0, Math.PI * 2);
      ctx.fill();

      // Jagged mountain peaks & gothic castle parapets in background
      ctx.fillStyle = '#0a0314';
      ctx.beginPath();
      ctx.moveTo(0, gY - 40);
      ctx.lineTo(80, gY - 140);
      ctx.lineTo(160, gY - 70);
      ctx.lineTo(240, gY - 170);
      ctx.lineTo(320, gY - 90);
      ctx.lineTo(400, gY - 180);
      ctx.lineTo(480, gY - 100);
      ctx.lineTo(560, gY - 165);
      ctx.lineTo(640, gY - 80);
      ctx.lineTo(720, gY - 150);
      ctx.lineTo(w, gY - 60);
      ctx.lineTo(w, gY);
      ctx.lineTo(0, gY);
      ctx.closePath();
      ctx.fill();

      // Imperial Dragon Banners hanging on pillars
      ctx.fillStyle = '#450a0a';
      ctx.fillRect(70, 40, 48, 160);
      ctx.fillRect(w - 118, 40, 48, 160);
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 22px monospace';
      ctx.fillText('闇', 83, 105);
      ctx.fillText('覇', w - 105, 105);

      // Massive Obsidian Columns with Dragon Reliefs
      ctx.fillStyle = '#110c1d';
      ctx.fillRect(50, 20, 88, gY - 20);
      ctx.fillRect(w - 138, 20, 88, gY - 20);
      ctx.strokeStyle = '#2e1065';
      ctx.lineWidth = 3;
      ctx.strokeRect(50, 20, 88, gY - 20);
      ctx.strokeRect(w - 138, 20, 88, gY - 20);

      // Flickering Violet Braziers / Torches
      const flickerPurple = Math.sin(this.animTimer * 20) * 4;
      const bLeftX = 94;
      const bRightX = w - 94;
      const bY = 90;

      // Iron Brazier Bowls
      ctx.fillStyle = '#374151';
      ctx.fillRect(bLeftX - 16, bY, 32, 12);
      ctx.fillRect(bRightX - 16, bY, 32, 12);

      // Violet Flame Aura
      ctx.fillStyle = 'rgba(168, 85, 247, 0.7)';
      ctx.beginPath();
      ctx.arc(bLeftX, bY - 8 + flickerPurple, 18, 0, Math.PI * 2);
      ctx.arc(bRightX, bY - 8 - flickerPurple, 18, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(bLeftX, bY - 12 + flickerPurple, 8, 0, Math.PI * 2);
      ctx.arc(bRightX, bY - 12 - flickerPurple, 8, 0, Math.PI * 2);
      ctx.fill();

      // Stone Throne in Center Background
      const throneX = w / 2 - 50;
      ctx.fillStyle = '#180d2b';
      ctx.fillRect(throneX, gY - 120, 100, 120);
      ctx.fillStyle = '#2e1065';
      ctx.fillRect(throneX + 15, gY - 160, 70, 60);
      // Crimson Velvet Cushion
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(throneX + 20, gY - 70, 60, 20);

      // Dark Obsidian Polished Floor
      ctx.fillStyle = '#090514';
      ctx.fillRect(0, gY, w, h - gY);
      ctx.fillStyle = '#7c3aed';
      ctx.fillRect(0, gY, w, 4);

      // Glowing Runic Floor Glyphs
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.25)';
      ctx.lineWidth = 2;
      for (let rx = 60; rx < w; rx += 140) {
        ctx.strokeRect(rx, gY + 12, 80, 26);
      }
    }
  }

  // Polished Dojo Floor Mirror Reflection
  private drawFloorReflections(fighters: FighterState[]) {
    const ctx = this.ctx;
    const gY = this.groundY;
    ctx.save();
    ctx.globalAlpha = 0.16;
    fighters.forEach((f) => {
      ctx.save();
      ctx.translate(f.x, gY);
      ctx.scale(f.facingRight ? 1 : -1, -0.6);
      switch (f.charId) {
        case 'kasumi':
          renderKasumiSprite(ctx, f, this.animTimer);
          break;
        case 'roxie':
          renderRoxieSprite(ctx, f, this.animTimer);
          break;
        case 'kenzo':
          renderKenzoSprite(ctx, f, this.animTimer);
          break;
        case 'marcus':
          renderMarcusSprite(ctx, f, this.animTimer);
          break;
        case 'raizen':
          renderRaizenSprite(ctx, f, this.animTimer);
          break;
      }
      ctx.restore();
    });
    ctx.restore();
  }

  // Foreground Overlay Details (Sakura Petals or Ring Ropes)
  private drawStageForeground(stageId: StageId) {
    const ctx = this.ctx;
    const w = this.width;
    const gY = this.groundY;

    if (stageId === 'park') {
      // Drifting Pink Sakura Blossom Petals
      ctx.fillStyle = '#f472b6';
      for (let p = 0; p < 18; p++) {
        const petX = (this.animTimer * 40 + p * 62) % (w + 40);
        const petY = ((this.animTimer * 25 + p * 43) % (gY + 50)) + Math.sin(this.animTimer * 4 + p) * 14;
        ctx.beginPath();
        ctx.ellipse(petX, petY, 6, 3, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (stageId === 'ring') {
      // Heavy 3-Strand Boxing Ring Ropes Across Bottom Stage
      const ropeY1 = gY - 40;
      const ropeY2 = gY - 70;
      const ropeY3 = gY - 100;

      // Elastic sag bounce
      const sag = Math.sin(this.animTimer * 12) * 2;

      ctx.lineWidth = 5;
      // Red top rope
      ctx.strokeStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(0, ropeY3 + sag);
      ctx.lineTo(w, ropeY3 + sag);
      ctx.stroke();

      // White middle rope
      ctx.strokeStyle = '#f8fafc';
      ctx.beginPath();
      ctx.moveTo(0, ropeY2 + sag);
      ctx.lineTo(w, ropeY2 + sag);
      ctx.stroke();

      // Blue bottom rope
      ctx.strokeStyle = '#2563eb';
      ctx.beginPath();
      ctx.moveTo(0, ropeY1 + sag);
      ctx.lineTo(w, ropeY1 + sag);
      ctx.stroke();

      // Corner Turnbuckle Pads
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(0, ropeY3 - 10, 20, 80);
      ctx.fillRect(w - 20, ropeY3 - 10, 20, 80);
    } else if (stageId === 'throne') {
      // Floating Shadow Motes & Violet Embers rising from floor
      ctx.fillStyle = '#a855f7';
      for (let p = 0; p < 22; p++) {
        const mx = (p * 37 + this.animTimer * 20) % w;
        const my = gY - ((p * 29 + this.animTimer * 50) % (gY - 40));
        const rad = 2 + (p % 3);
        ctx.beginPath();
        ctx.arc(mx, my, rad, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Large Ground Shadow for Chunky 16-Bit Fighters
  private drawShadow(f: FighterState) {
    const ctx = this.ctx;
    const gY = this.groundY;
    const heightAboveGround = Math.max(0, gY - f.y);
    const scale = Math.max(0.3, 1 - heightAboveGround / 300);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(f.x, gY, 46 * scale, 13 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw Fighter Sprite with 16-Bit Scale & Hit Flash
  private drawFighter(f: FighterState) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(f.x, f.y);

    // Facing direction
    if (!f.facingRight) {
      ctx.scale(-1, 1);
    }

    // Capcom 16-Bit Hit Flash (flashes white/bright on damage)
    if (f.state === 'hit' && f.hitstun % 4 < 2) {
      ctx.filter = 'brightness(2.4) contrast(1.4)';
    }

    switch (f.charId) {
      case 'kasumi':
        renderKasumiSprite(ctx, f, this.animTimer);
        break;
      case 'roxie':
        renderRoxieSprite(ctx, f, this.animTimer);
        break;
      case 'kenzo':
        renderKenzoSprite(ctx, f, this.animTimer);
        break;
      case 'marcus':
        renderMarcusSprite(ctx, f, this.animTimer);
        break;
      case 'raizen':
        renderRaizenSprite(ctx, f, this.animTimer);
        break;
    }

    ctx.restore();
  }

  // =========================================================================
  // STREET FIGHTER II HADOUKEN / FIREBALLS (Authentic Plasma Spheres)
  // =========================================================================
  private drawProjectiles(projectiles: Projectile[]) {
    const ctx = this.ctx;
    projectiles.forEach((p) => {
      if (!p.active) return;
      ctx.save();
      ctx.translate(p.x, p.y);

      const isPurple = p.color === 'purple';
      const isRed = p.color === 'red';
      const auraColor = isPurple ? '#6d28d9' : isRed ? '#dc2626' : '#059669';
      const midColor = isPurple ? '#a855f7' : isRed ? '#f87171' : '#10b981';
      const coreColor = isPurple ? '#f43f5e' : isRed ? '#fef08a' : '#a7f3d0';
      const dir = p.vx > 0 ? -1 : 1;

      // 1. Trailing Flaming Plasma Tails
      for (let t = 1; t <= 5; t++) {
        const tx = dir * (24 + t * 9);
        const wave = Math.sin(this.animTimer * 25 + t) * (10 - t);
        const tr = Math.max(4, 22 - t * 3.5);

        ctx.fillStyle = auraColor;
        ctx.beginPath();
        ctx.arc(tx, wave, tr, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = midColor;
        ctx.beginPath();
        ctx.arc(tx, wave, tr * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Outer Plasma Aura Sphere
      ctx.fillStyle = auraColor;
      ctx.beginPath();
      ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fill();

      // 3. Bright Ki Energy Mid
      ctx.fillStyle = midColor;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();

      // 4. White-Hot Core Flash
      ctx.fillStyle = coreColor;
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();

      // Whirling Energy Sparks
      for (let s = 0; s < 4; s++) {
        const sa = this.animTimer * 16 + (s * Math.PI) / 2;
        const sx = Math.cos(sa) * 28;
        const sy = Math.sin(sa) * 16;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx - 2, sy - 2, 5, 5);
      }

      ctx.restore();
    });
  }

  // =========================================================================
  // CAPCOM 16-BIT HIT SPARKS & ACTION EXPLOSIONS
  // =========================================================================
  private drawParticles(particles: HitParticle[]) {
    const ctx = this.ctx;
    particles.forEach((pt) => {
      const alpha = pt.life / pt.maxLife;

      if (pt.text) {
        // Arcade text notifications (BLOCK, CHIP!, REVERSAL)
        ctx.save();
        ctx.globalAlpha = Math.min(1, alpha * 1.4);
        ctx.font = 'bold 13px "Courier New", monospace, sans-serif';
        ctx.textAlign = 'center';
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(pt.text, pt.x, pt.y);
        ctx.fillStyle = pt.color;
        ctx.fillText(pt.text, pt.x, pt.y);
        ctx.restore();
      } else if (pt.size >= 16) {
        // LARGE CAPCOM HIT STARBURST!
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(pt.x, pt.y);

        // Layer 1: Multi-pointed golden-yellow jagged star
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        const numPoints = 10;
        const outerR = pt.size * 1.2;
        const innerR = pt.size * 0.45;
        for (let i = 0; i < numPoints * 2; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const angle = (i * Math.PI) / numPoints;
          const px = Math.cos(angle) * r;
          const py = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        // Layer 2: Orange blast core
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(0, 0, pt.size * 0.65, 0, Math.PI * 2);
        ctx.fill();

        // Layer 3: Blinding White Core
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, pt.size * 0.35, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else {
        // Flying square pixel chunks / sparks
        ctx.save();
        ctx.fillStyle = pt.color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
        ctx.restore();
      }
    });
    ctx.globalAlpha = 1.0;
  }
}
