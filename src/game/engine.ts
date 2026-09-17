// 2D Fighting Game Physics, State Machine & Input Detection Engine
import {
  CharacterId,
  StageId,
  GameMode,
  GameState,
  CpuDifficulty,
  FighterState,
  InputState,
  Projectile,
  HitParticle,
  Direction,
  AttackType,
} from '../types/game';
import { CHARACTERS } from '../data/characters';
import { audio } from '../audio/retroAudio';

export interface GameEventCallbacks {
  onHit?: (fighterIndex: number, damage: number, isHeavy: boolean, isBlocked: boolean) => void;
  onSpecial?: (fighterIndex: number, moveName: string) => void;
  onKnockdown?: (fighterIndex: number) => void;
  onRoundOver?: (winnerIndex: number | -1) => void;
  onMatchOver?: (winnerIndex: number) => void;
  onAnnounce?: (text: 'round1' | 'round2' | 'finalround' | 'fight' | 'ko' | 'youwin') => void;
}

export class FightingEngine {
  public mode: GameMode = 'versus';
  public stage: StageId = 'park';
  public state: GameState = 'select';
  public cpuDifficulty: CpuDifficulty = 'normal';

  public fighters: FighterState[] = [];
  public projectiles: Projectile[] = [];
  public particles: HitParticle[] = [];

  public roundTimer: number = 99;
  public currentRound: number = 1;
  public roundOverTimer: number = 0;
  public roundIntroTimer: number = 0;
  public matchWinner: number | null = null;

  public arenaWidth: number = 800;
  public arenaHeight: number = 450;
  public groundY: number = 380;

  public shakeX: number = 0;
  public shakeY: number = 0;
  public shakeDuration: number = 0;
  public hitStopFrames: number = 0;

  // Training mode options
  public dummyState: 'stand' | 'crouch' | 'jump' | 'block' | 'cpu' = 'cpu';
  public infiniteHealth: boolean = false;
  public showHitboxes: boolean = false;

  private callbacks: GameEventCallbacks = {};
  private nextProjectileId: number = 1;
  private frameCount: number = 0;

  // CPU AI balanced reaction state
  private cpuBlockDecision: boolean = false;
  private cpuReactionTimer: number = 0;
  private cpuTargetAttackId: string | null = null;

  constructor(callbacks: GameEventCallbacks = {}) {
    this.callbacks = callbacks;
  }

  public initMatch(
    p1Char: CharacterId,
    p2Char: CharacterId,
    stage: StageId,
    mode: GameMode,
    difficulty: CpuDifficulty = 'normal'
  ) {
    this.mode = mode;
    this.stage = stage;
    this.cpuDifficulty = difficulty;
    this.currentRound = 1;
    this.matchWinner = null;
    this.roundTimer = 99;
    this.projectiles = [];
    this.particles = [];
    this.cpuBlockDecision = false;
    this.cpuReactionTimer = 0;
    this.cpuTargetAttackId = null;

    this.fighters = [
      this.createFighter(0, p1Char, 240, true),
      this.createFighter(1, p2Char, 560, false),
    ];

    this.startRound(1);
  }

  public startRound(roundNumber: number) {
    this.currentRound = roundNumber;
    this.roundTimer = 99;
    this.state = 'countdown';
    this.roundIntroTimer = 100; // ~1.6 seconds of round intro
    this.projectiles = [];
    this.particles = [];

    // Reset fighter positions
    this.fighters[0].x = 240;
    this.fighters[0].y = this.groundY;
    this.fighters[0].vx = 0;
    this.fighters[0].vy = 0;
    this.fighters[0].health = 100;
    this.fighters[0].displayHealth = 100;
    this.fighters[0].state = 'idle';
    this.fighters[0].facingRight = true;
    this.fighters[0].isGrounded = true;
    this.fighters[0].isCrouching = false;
    this.fighters[0].isBlocking = false;
    this.fighters[0].currentAttack = null;
    this.fighters[0].attackFrame = 0;
    this.fighters[0].attackDuration = 0;
    this.fighters[0].hitstun = 0;
    this.fighters[0].blockstun = 0;

    this.fighters[1].x = 560;
    this.fighters[1].y = this.groundY;
    this.fighters[1].vx = 0;
    this.fighters[1].vy = 0;
    this.fighters[1].health = 100;
    this.fighters[1].displayHealth = 100;
    this.fighters[1].state = 'idle';
    this.fighters[1].facingRight = false;
    this.fighters[1].isGrounded = true;
    this.fighters[1].isCrouching = false;
    this.fighters[1].isBlocking = false;
    this.fighters[1].currentAttack = null;
    this.fighters[1].attackFrame = 0;
    this.fighters[1].attackDuration = 0;
    this.fighters[1].hitstun = 0;
    this.fighters[1].blockstun = 0;

    audio.startStageMusic(this.stage);

    if (roundNumber === 1) {
      audio.playAnnouncer('round1');
      this.callbacks.onAnnounce?.('round1');
    } else if (roundNumber === 2) {
      audio.playAnnouncer('round2');
      this.callbacks.onAnnounce?.('round2');
    } else {
      audio.playAnnouncer('finalround');
      this.callbacks.onAnnounce?.('finalround');
    }
  }

  private createFighter(playerIndex: 0 | 1, charId: CharacterId, x: number, facingRight: boolean): FighterState {
    return {
      playerIndex,
      charId,
      x,
      y: this.groundY,
      vx: 0,
      vy: 0,
      facingRight,
      health: 100,
      displayHealth: 100,
      isGrounded: true,
      isCrouching: false,
      isBlocking: false,
      state: 'idle',
      currentAttack: null,
      attackFrame: 0,
      attackDuration: 0,
      hitConnected: false,
      hitstun: 0,
      blockstun: 0,
      knockdownTimer: 0,
      roundsWon: 0,
      comboCount: 0,
      comboDamage: 0,
      recentInputs: [],
      chargeBackTimer: 0,
    };
  }

  public update(p1Input?: InputState, p2Input?: InputState | null) {
    this.frameCount++;

    // Hitstop freeze
    if (this.hitStopFrames > 0) {
      this.hitStopFrames--;
      return;
    }

    // Screen Shake decay
    if (this.shakeDuration > 0) {
      this.shakeDuration--;
      this.shakeX = (Math.random() - 0.5) * this.shakeDuration * 1.5;
      this.shakeY = (Math.random() - 0.5) * this.shakeDuration * 1.5;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }

    // Countdown / Round Intro State
    if (this.state === 'countdown') {
      this.roundIntroTimer--;
      if (this.roundIntroTimer === 30) {
        audio.playAnnouncer('fight');
        this.callbacks.onAnnounce?.('fight');
      }
      if (this.roundIntroTimer <= 0) {
        this.state = 'fighting';
      }
      return;
    }

    // Round Over / Match Over transitions
    if (this.state === 'round_over') {
      this.roundOverTimer--;
      if (this.roundOverTimer <= 0) {
        this.checkMatchProgression();
      }
      this.updateFighterPhysics(this.fighters[0]);
      this.updateFighterPhysics(this.fighters[1]);
      this.updateParticles();
      return;
    }

    if (this.state !== 'fighting') return;

    // Timer countdown (every 60 frames ~ 1 second)
    if (this.frameCount % 60 === 0 && this.roundTimer > 0 && this.mode !== 'training') {
      this.roundTimer--;
      if (this.roundTimer <= 0) {
        this.handleTimeOver();
        return;
      }
    }

    const defaultInput: InputState = {
      up: false,
      down: false,
      left: false,
      right: false,
      lp: false,
      hp: false,
      lk: false,
      hk: false,
    };
    const effectiveP1Input = p1Input || defaultInput;

    // Resolve Player 2 input (Local 2P, Dummy, or CPU AI)
    const effectiveP2Input = this.resolveP2Input(p2Input ?? null);

    // 1. Process Fighter Inputs & Intent
    this.processFighterInput(this.fighters[0], effectiveP1Input, this.fighters[1]);
    this.processFighterInput(this.fighters[1], effectiveP2Input, this.fighters[0]);

    // 2. Update Fighter Physics & Timers
    this.updateFighterPhysics(this.fighters[0]);
    this.updateFighterPhysics(this.fighters[1]);

    // 3. Keep fighters within screen bounds & pushbox collision
    this.resolveFighterCollisions();

    // 4. Update Projectiles & Check Hits
    this.updateProjectiles();

    // 5. Update Hitbox Attacks between fighters
    this.checkMeleeHits(this.fighters[0], this.fighters[1]);
    this.checkMeleeHits(this.fighters[1], this.fighters[0]);

    // 6. Update Particles
    this.updateParticles();

    // 7. Check K.O. conditions
    this.checkKo();
  }

  // --- INPUT & MOVE BUFFER PARSER ---
  private processFighterInput(f: FighterState, input: InputState, opp: FighterState) {
    // If fighter is in hitstun, knockdown, or active blockstun, cannot act
    if (f.state === 'hit' || f.state === 'knockdown') return;
    if (f.state === 'block' && f.blockstun > 0) {
      f.isBlocking = true;
      return;
    }

    // Buffer input
    const dir: Direction = this.getDirectionFromInput(input);
    const attack: AttackType | null = input.hp ? 'HP' : input.lp ? 'LP' : input.hk ? 'HK' : input.lk ? 'LK' : null;

    f.recentInputs.push({ dir, attack, frame: this.frameCount });
    if (f.recentInputs.length > 25) {
      f.recentInputs.shift();
    }

    // Charge back timer (for Back-Forward moves)
    const isBack = f.facingRight ? input.left : input.right;
    if (isBack) {
      f.chargeBackTimer = Math.min(60, f.chargeBackTimer + 1);
    } else {
      f.chargeBackTimer = Math.max(0, f.chargeBackTimer - 1);
    }

    // Face opponent if grounded and not attacking
    if (f.isGrounded && f.state !== 'attack' && f.state !== 'special') {
      f.facingRight = f.x < opp.x;
    }

    // Check if opponent is currently attacking or projectile incoming and player is holding back -> Blocking
    const oppIsAttacking = (opp.state === 'attack' || opp.state === 'special') && opp.attackFrame < opp.attackDuration;
    const hasIncomingProjectile = this.projectiles.some(
      (p) => p.active && p.ownerIndex === opp.playerIndex && Math.abs(p.x - f.x) < 260
    );
    const inDanger = oppIsAttacking || hasIncomingProjectile;

    // Active guard only when holding back against an active threat without attempting an attack or jump
    const wantsToAttackOrJump = attack !== null || input.up;
    if (f.isGrounded && isBack && inDanger && !wantsToAttackOrJump && f.state !== 'attack' && f.state !== 'special') {
      f.isBlocking = true;
      f.state = 'block';
      f.isCrouching = input.down;
      f.vx = 0;
      return;
    } else {
      f.isBlocking = false;
      if (f.state === 'block' && f.blockstun <= 0) {
        f.state = input.down ? 'crouch' : 'idle';
      }
    }

    // If currently performing an attack or special, advance frame or finish
    if (f.state === 'attack' || f.state === 'special') {
      f.attackFrame++;
      if (f.attackFrame >= f.attackDuration) {
        f.state = f.isGrounded ? (f.isCrouching ? 'crouch' : 'idle') : 'jump';
        f.currentAttack = null;
        f.hitConnected = false;
      }
      return;
    }

    // Check SPECIAL MOVE EXECUTIONS FIRST
    if (attack) {
      const specialExecuted = this.checkSpecialMoves(f, attack);
      if (specialExecuted) return;

      // Otherwise normal attack
      this.executeNormalAttack(f, attack);
      return;
    }

    // Ground movement & Jumps (tuned dynamically by character speed stat)
    if (f.isGrounded) {
      const char = CHARACTERS[f.charId];
      const speedStat = char?.stats.speed ?? 7;
      const walkSpeed = 2.5 + speedStat * 0.22; // Roxie: 4.48, Kasumi: 4.26, Kenzo: 4.04, Marcus: 3.82
      const jumpVy = -14.0 - speedStat * 0.08;  // Light characters have nimble jump arcs
      const jumpVx = 3.6 + speedStat * 0.1;

      if (input.up) {
        // Jump
        f.vy = jumpVy;
        f.isGrounded = false;
        f.state = 'jump';
        if (input.left) f.vx = -jumpVx;
        else if (input.right) f.vx = jumpVx;
        else f.vx = 0;
        this.spawnDust(f.x, f.y);
      } else if (input.down) {
        // Crouch
        f.isCrouching = true;
        f.state = 'crouch';
        f.vx = 0;
      } else {
        f.isCrouching = false;
        if (input.left) {
          f.vx = -walkSpeed;
          f.state = 'walk';
        } else if (input.right) {
          f.vx = walkSpeed;
          f.state = 'walk';
        } else {
          f.vx = 0;
          f.state = 'idle';
        }
      }
    }
  }

  private getDirectionFromInput(input?: InputState | null): Direction {
    if (!input) return 'neutral';
    if (input.up && input.left) return 'up_left';
    if (input.up && input.right) return 'up_right';
    if (input.down && input.left) return 'down_left';
    if (input.down && input.right) return 'down_right';
    if (input.up) return 'up';
    if (input.down) return 'down';
    if (input.left) return 'left';
    if (input.right) return 'right';
    return 'neutral';
  }

  // --- SPECIAL MOVES DETECTOR ---
  private checkSpecialMoves(f: FighterState, attack: AttackType): boolean {
    const isPunch = attack === 'LP' || attack === 'HP';
    const isKick = attack === 'LK' || attack === 'HK';
    const char = CHARACTERS[f.charId];
    if (!char) return false;

    // Check input history buffer (last 20 frames)
    const history = f.recentInputs;
    const hasDown = history.some((h) => h.dir === 'down' || h.dir === 'down_left' || h.dir === 'down_right');
    const hasForward = history.some((h) => (f.facingRight ? h.dir === 'right' : h.dir === 'left'));
    const hasBack = history.some((h) => (f.facingRight ? h.dir === 'left' : h.dir === 'right'));

    // 1. QCF: Down -> Forward + Attack
    if (hasDown && hasForward) {
      if (f.charId === 'kasumi' && isPunch) {
        // Kasumi: Red Energy Ball (16% DMG)
        this.triggerSpecial(f, 'kasumi_fireball', 22, 'Crimson Flare');
        this.spawnProjectile(f, 'red', 16, false);
        audio.playFireballCast('red');
        return true;
      }
      if (f.charId === 'roxie' && isKick) {
        // Roxie: Fast Spinning Kick Flurry (21% DMG, multi-hit knockdown)
        this.triggerSpecial(f, 'roxie_flurry', 36, 'Hyakuretsu Spin Flurry');
        f.vx = f.facingRight ? 5.8 : -5.8;
        audio.playSpecialVoice('Spin');
        return true;
      }
      if (f.charId === 'kenzo' && isPunch) {
        // Kenzo: Green Energy Ball (17% DMG)
        this.triggerSpecial(f, 'kenzo_fireball', 24, 'Emerald Dragon Blast');
        this.spawnProjectile(f, 'green', 17, false);
        audio.playFireballCast('green');
        return true;
      }
      if (f.charId === 'marcus' && isPunch) {
        // Marcus: Dempsey Roll & Hook Combo (22% DMG)
        this.triggerSpecial(f, 'marcus_rush', 32, 'Dempsey Rush & Hook');
        f.vx = f.facingRight ? 7.2 : -7.2;
        audio.playSpecialVoice('Dempsey');
        return true;
      }
      if (f.charId === 'raizen' && isPunch) {
        // Raizen (Final Boss): Void Eclipse Flare (22% DMG, knockdown)
        this.triggerSpecial(f, 'raizen_void_flare', 25, 'Void Eclipse Flare');
        this.spawnProjectile(f, 'purple', 22, true);
        audio.playFireballCast('red');
        return true;
      }
    }

    // 2. QCB: Down -> Back + Attack
    if (hasDown && hasBack) {
      if (f.charId === 'kasumi' && isKick) {
        // Kasumi: Anti-Air Counter Kick (18% DMG)
        this.triggerSpecial(f, 'kasumi_antiair', 28, 'Rising Moon Kick');
        f.vy = -12;
        f.vx = f.facingRight ? 3 : -3;
        f.isGrounded = false;
        audio.playSpecialVoice('Moon');
        return true;
      }
      if (f.charId === 'roxie' && isKick) {
        // Roxie: Forward Lunge Kick (17% DMG)
        this.triggerSpecial(f, 'roxie_lunge', 24, 'Cobra Thrust Kick');
        f.vx = f.facingRight ? 8.5 : -8.5;
        audio.playSpecialVoice('Cobra');
        return true;
      }
      if (f.charId === 'kenzo' && isPunch) {
        // Kenzo: Anti-Air Rising Punch (19% DMG)
        this.triggerSpecial(f, 'kenzo_antiair', 28, 'Dragon Rising Strike');
        f.vy = -13;
        f.vx = f.facingRight ? 3.5 : -3.5;
        f.isGrounded = false;
        audio.playSpecialVoice('Dragon');
        return true;
      }
      if (f.charId === 'marcus' && isPunch) {
        // Marcus: Forward Lunge Punch (24% DMG)
        this.triggerSpecial(f, 'marcus_lunge', 25, 'Titan Heavy Straight');
        f.vx = f.facingRight ? 8 : -8;
        audio.playSpecialVoice('Titan');
        return true;
      }
      if (f.charId === 'raizen' && isKick) {
        // Raizen (Final Boss): Shadow Warp Strike (24% DMG)
        this.triggerSpecial(f, 'raizen_shadow_teleport', 28, 'Shadow Warp Strike');
        const opp = this.fighters[f.playerIndex === 0 ? 1 : 0];
        this.spawnHitSparks(f.x, f.y - 60, true);
        f.x = Math.max(70, Math.min(this.arenaWidth - 70, opp.x + (opp.facingRight ? -45 : 45)));
        f.y = this.groundY - 130;
        f.vy = 8;
        f.isGrounded = false;
        audio.playSpecialVoice('Spin');
        this.spawnHitSparks(f.x, f.y - 60, true);
        return true;
      }
    }

    // 3. Back-Forward (Charge / Motion) + Attack
    if (hasBack && hasForward) {
      if (f.charId === 'kasumi' && isKick) {
        // Kasumi: Forward Lunge Kick (17% DMG)
        this.triggerSpecial(f, 'kasumi_lunge', 24, 'Shadow Lunge Kick');
        f.vx = f.facingRight ? 8 : -8;
        audio.playSpecialVoice('Shadow');
        return true;
      }
      if (f.charId === 'roxie' && isKick) {
        // Roxie: Somersault Flash Kick (19% DMG)
        this.triggerSpecial(f, 'roxie_somersault', 26, 'Somersault Flash Kick');
        f.vy = -11.5;
        f.vx = f.facingRight ? 2.5 : -2.5;
        f.isGrounded = false;
        audio.playSpecialVoice('Somersault');
        return true;
      }
      if (f.charId === 'kenzo' && isKick) {
        // Kenzo: Spinning Lunge Kick (17% DMG)
        this.triggerSpecial(f, 'kenzo_hurricane', 28, 'Hurricane Spiral Kick');
        f.vy = -4;
        f.vx = f.facingRight ? 6.5 : -6.5;
        f.isGrounded = false;
        audio.playSpecialVoice('Hurricane');
        return true;
      }
      if (f.charId === 'marcus' && isPunch) {
        // Marcus: Skybreaker Uppercut (22% normal, 32% vs air!)
        this.triggerSpecial(f, 'marcus_uppercut', 26, 'Skybreaker Uppercut');
        f.vy = -11;
        f.vx = f.facingRight ? 3.5 : -3.5;
        f.isGrounded = false;
        audio.playSpecialVoice('Uppercut');
        return true;
      }
      if (f.charId === 'raizen' && isPunch) {
        // Raizen (Final Boss): Abyssal Chaos Pillar (25% DMG)
        this.triggerSpecial(f, 'raizen_chaos_pillar', 32, 'Abyssal Chaos Pillar');
        const opp = this.fighters[f.playerIndex === 0 ? 1 : 0];
        this.spawnDust(opp.x, this.groundY);
        this.spawnHitSparks(opp.x, this.groundY - 50, true);
        audio.playFireballCast('green');
        return true;
      }
    }

    return false;
  }

  private triggerSpecial(f: FighterState, moveId: string, duration: number, moveName: string) {
    f.state = 'special';
    f.currentAttack = moveId;
    f.attackFrame = 0;
    f.attackDuration = duration;
    f.hitConnected = false;
    this.callbacks.onSpecial?.(f.playerIndex, moveName);
  }

  private executeNormalAttack(f: FighterState, attack: AttackType) {
    const isHeavy = attack === 'HP' || attack === 'HK';
    f.state = 'attack';

    if (!f.isGrounded) {
      // Air attack
      if (f.charId === 'marcus' && (attack === 'LK' || attack === 'HK')) {
        f.currentAttack = 'air_lp'; // Marcus cannot kick
      } else {
        f.currentAttack = isHeavy ? (attack === 'HP' ? 'air_hp' : 'air_hk') : (attack === 'LP' ? 'air_lp' : 'air_lk');
      }
      f.attackDuration = isHeavy ? 20 : 13;
    } else if (f.isCrouching) {
      // Crouch attack
      if (f.charId === 'marcus' && (attack === 'LK' || attack === 'HK')) {
        f.currentAttack = 'crouch_lp'; // Marcus cannot kick
      } else {
        f.currentAttack = isHeavy ? (attack === 'HP' ? 'crouch_hp' : 'crouch_hk') : (attack === 'LP' ? 'crouch_lp' : 'crouch_lk');
      }
      f.attackDuration = isHeavy ? 18 : 12;
    } else {
      // Ground standing attack
      if (f.charId === 'marcus' && (attack === 'LK' || attack === 'HK')) {
        f.currentAttack = 'lp'; // Marcus cannot kick
      } else {
        f.currentAttack = attack.toLowerCase();
      }
      f.attackDuration = isHeavy ? 18 : 12;
    }

    f.attackFrame = 0;
    f.hitConnected = false;
    audio.playWhiff();
  }

  // --- PROJECTILES ---
  private spawnProjectile(f: FighterState, color: 'red' | 'green' | 'purple', damage: number, causesKnockdown: boolean) {
    const speed = 7.5;
    this.projectiles.push({
      id: this.nextProjectileId++,
      ownerIndex: f.playerIndex,
      x: f.x + (f.facingRight ? 58 : -58),
      y: f.y - 88,
      vx: f.facingRight ? speed : -speed,
      radius: 24,
      color,
      damage,
      causesKnockdown,
      active: true,
      frame: 0,
    });
  }

  private updateProjectiles() {
    this.projectiles.forEach((p) => {
      if (!p.active) return;
      p.x += p.vx;
      p.frame++;

      const pColor = p.color === 'purple' ? '#a855f7' : p.color === 'red' ? '#ef4444' : '#10b981';

      // Screen boundary despawn
      if (p.x < 10 || p.x > this.arenaWidth - 10) {
        p.active = false;
        this.spawnExplosionParticles(p.x, p.y, pColor);
        return;
      }

      // Check collision with opposing fighter
      const target = this.fighters[p.ownerIndex === 0 ? 1 : 0];
      const targetTop = target.isCrouching ? target.y - 75 : target.y - 140;
      const targetBottom = target.y;
      const targetLeft = target.x - 36;
      const targetRight = target.x + 36;

      if (p.x > targetLeft && p.x < targetRight && p.y > targetTop && p.y < targetBottom) {
        p.active = false;
        // Projectiles knock down opponents caught jumping in the air, but push back grounded targets
        const targetKnockdown = p.causesKnockdown || !target.isGrounded;
        this.applyHit(target, p.damage, true, targetKnockdown, p.x, p.y, true);
        audio.playFireballExplosion();
        this.spawnExplosionParticles(p.x, p.y, pColor);
      }
    });

    // Remove inactive projectiles
    this.projectiles = this.projectiles.filter((p) => p.active);
  }

  // --- HIT DETECTION & DAMAGE RESOLUTION ---
  private checkMeleeHits(attacker: FighterState, defender: FighterState) {
    if (attacker.hitConnected || (attacker.state !== 'attack' && attacker.state !== 'special')) return;
    if (defender.state === 'knockdown') return;

    // Active attack frames (e.g. frame 3 through 12)
    const activeWindowStart = Math.floor(attacker.attackDuration * 0.18);
    const activeWindowEnd = Math.floor(attacker.attackDuration * 0.72);
    if (attacker.attackFrame < activeWindowStart || attacker.attackFrame > activeWindowEnd) return;

    // Calculate attack hitbox rect
    const reach = this.getAttackReach(attacker);
    const hitX = attacker.x + (attacker.facingRight ? reach * 0.5 : -reach * 0.5);
    const isAir = !attacker.isGrounded;
    const isCrouch = attacker.isCrouching;
    let hitY = attacker.y - 100;
    if (isCrouch) hitY = attacker.y - 50;
    if (isAir) hitY = attacker.y - 70;
    if (attacker.currentAttack === 'crouch_hk') hitY = attacker.y - 18; // low sweep

    // Defender hurtbox (scaled for 16-bit SNES larger sprites)
    const defLeft = defender.x - 38;
    const defRight = defender.x + 38;
    const defTop = defender.isCrouching ? defender.y - 75 : defender.y - 145;
    const defBottom = defender.y;

    // AABB intersection
    const attackHalfW = reach * 0.55;
    const attackLeft = hitX - attackHalfW;
    const attackRight = hitX + attackHalfW;
    const attackTop = hitY - 38;
    const attackBottom = hitY + 38;

    const collides =
      attackRight > defLeft &&
      attackLeft < defRight &&
      attackBottom > defTop &&
      attackTop < defBottom;

    if (collides) {
      attacker.hitConnected = true;
      const isSpecial = attacker.state === 'special';
      const { damage, causesKnockdown, isHeavy } = this.calculateAttackDamage(attacker, defender);
      this.applyHit(defender, damage, isHeavy, causesKnockdown, hitX, hitY, isSpecial);
    }
  }

  private getAttackReach(f: FighterState): number {
    if (f.state === 'special') {
      if (f.currentAttack?.includes('lunge') || f.currentAttack?.includes('rush')) return 98;
      if (f.currentAttack?.includes('antiair') || f.currentAttack?.includes('somersault') || f.currentAttack?.includes('uppercut')) return 88;
      if (f.currentAttack?.includes('teleport') || f.currentAttack?.includes('pillar')) return 110;
      return 82;
    }
    const atk = f.currentAttack || '';
    if (atk === 'crouch_hk') return 94; // sweeping trip
    if (atk === 'air_hk' || atk === 'air_hp') return 84;
    if (atk === 'air_lk' || atk === 'air_lp') return 60;
    if (atk === 'hp' || atk === 'hk') return 86;
    if (atk === 'crouch_hp') return 78;
    if (atk === 'crouch_lp' || atk === 'crouch_lk') return 56;
    return 58;
  }

  private calculateAttackDamage(
    attacker: FighterState,
    defender: FighterState
  ): { damage: number; causesKnockdown: boolean; isHeavy: boolean } {
    const char = CHARACTERS[attacker.charId];
    const attack = attacker.currentAttack || '';

    // 1. Specials have designated calibrated percentages
    if (attacker.state === 'special' && attack) {
      const spec = char.moves.find((m) => m.id === attack);
      if (spec) {
        let dmg = spec.damagePercent;
        // Marcus special rule: Uppercut deals bonus damage if opponent caught in air!
        if (spec.id === 'marcus_uppercut' && !defender.isGrounded) {
          dmg = spec.airBonusDamagePercent || 25;
        }
        // Anti-airs knock down airborne targets
        const causesKnockdown = spec.causesKnockdown || (!defender.isGrounded && spec.isAntiAir);
        return {
          damage: dmg,
          causesKnockdown: Boolean(causesKnockdown),
          isHeavy: true,
        };
      }
    }

    // 2. Normal attacks tuned by fighter archetype
    let isHeavy = attack.includes('hp') || attack.includes('hk');
    let baseDmg = isHeavy ? 11 : 5;

    // Crouch HK sweep or heavy hit on jumping target causes knockdown
    let causesKnockdown = attack === 'crouch_hk' || (isHeavy && !defender.isGrounded);

    // Fine-tuned archetype normal damages
    if (attacker.charId === 'kasumi') {
      // Balanced all-rounder: consistent, reliable damage
      if (attack.includes('p')) {
        baseDmg = isHeavy ? 11 : 5;
      } else {
        baseDmg = isHeavy ? 12 : 6;
      }
    } else if (attacker.charId === 'roxie') {
      // Kick Specialist: Weak short punches, long lethal kicks
      if (attack.includes('p')) {
        baseDmg = isHeavy ? 6 : 3;
      } else {
        baseDmg = isHeavy ? 13 : 7;
      }
    } else if (attacker.charId === 'kenzo') {
      // Disciplined Martial Artist: High impact karate strikes
      if (attack.includes('p')) {
        baseDmg = isHeavy ? 12 : 6;
      } else {
        baseDmg = isHeavy ? 12 : 6;
      }
    } else if (attacker.charId === 'marcus') {
      // Pure Heavyweight Boxer: Crushing punches, kick buttons act as short body checks
      if (attack.includes('k')) {
        baseDmg = isHeavy ? 7 : 4; // Body shots
        isHeavy = false;
        causesKnockdown = false;
      } else {
        baseDmg = isHeavy ? 14 : 7; // Power boxing hooks
      }
    } else if (attacker.charId === 'raizen') {
      // Final Boss: Formidable martial arts strikes with dark energy
      baseDmg = isHeavy ? 14 : 7;
    }

    return {
      damage: baseDmg,
      causesKnockdown,
      isHeavy,
    };
  }

  private applyHit(
    target: FighterState,
    rawDamage: number,
    isHeavy: boolean,
    causesKnockdown: boolean,
    hitX: number,
    hitY: number,
    isSpecial: boolean = false
  ) {
    const isBlocked = target.isBlocking;
    const attacker = this.fighters[target.playerIndex === 0 ? 1 : 0];

    // Character defense stat integration (7 is baseline 1.0)
    // Roxie (def 6) -> 1.05x (+5% incoming damage)
    // Kasumi (def 7) -> 1.00x (baseline)
    // Kenzo (def 8) -> 0.95x (-5% incoming damage)
    // Marcus (def 9) -> 0.90x (-10% incoming damage)
    const targetDef = CHARACTERS[target.charId]?.stats.defense ?? 7;
    const defenseMultiplier = 1.0 - (targetDef - 7) * 0.05;

    // Combo Damage Scaling (Proration) to prevent runaway one-touch kills:
    // 1st hit: 100%, 2nd hit: 85%, 3rd hit: 72%, 4th+ hit: 60%
    let comboMultiplier = 1.0;
    if (attacker.comboCount === 1) comboMultiplier = 0.85;
    else if (attacker.comboCount === 2) comboMultiplier = 0.72;
    else if (attacker.comboCount >= 3) comboMultiplier = 0.60;

    let finalDamage = Math.max(1, Math.round(rawDamage * defenseMultiplier * comboMultiplier));

    if (isBlocked) {
      if (isSpecial) {
        // SPECIAL ATTACKS DEAL CHIP DAMAGE ON BLOCK (approx 18% of move damage, min 1)
        finalDamage = Math.max(1, Math.round(rawDamage * 0.18 * defenseMultiplier));
        if (this.infiniteHealth) finalDamage = 0;
        target.health = Math.max(0, target.health - finalDamage);
        target.blockstun = isHeavy ? 18 : 12;
        target.state = 'block';
        target.vx = target.facingRight ? -4 : 4; // pushback
        audio.playHit(isHeavy, true);
        this.spawnBlockParticles(hitX, hitY, true);
      } else {
        // NORMAL ATTACKS DEAL 0 CHIP DAMAGE ON BLOCK (Clean Guard)
        finalDamage = 0;
        target.blockstun = isHeavy ? 14 : 9;
        target.state = 'block';
        target.vx = target.facingRight ? (isHeavy ? -3.5 : -2) : (isHeavy ? 3.5 : 2);
        audio.playHit(isHeavy, true);
        this.spawnBlockParticles(hitX, hitY, false);
      }
    } else {
      // True Hit
      if (this.infiniteHealth) {
        finalDamage = 0;
      }
      target.health = Math.max(0, target.health - finalDamage);
      target.hitstun = isHeavy ? 24 : 14;
      target.vx = target.facingRight ? (isHeavy ? -6 : -3.5) : (isHeavy ? 6 : 3.5);
      target.currentAttack = null;
      target.attackFrame = 0;
      target.attackDuration = 0;
      target.hitConnected = false;

      if (causesKnockdown || target.health <= 0) {
        target.state = 'knockdown';
        target.knockdownTimer = 45;
        target.vy = -7;
        this.callbacks.onKnockdown?.(target.playerIndex);
      } else {
        target.state = 'hit';
      }

      // Combo counter on attacker
      attacker.comboCount++;
      attacker.comboDamage += finalDamage;

      // Screen shake & hitstop on heavy hits
      if (isHeavy) {
        this.shakeDuration = 8;
        this.hitStopFrames = 5;
      }
      audio.playHit(isHeavy, false);
      this.spawnHitSparks(hitX, hitY, isHeavy);
    }

    this.callbacks.onHit?.(target.playerIndex, finalDamage, isHeavy, isBlocked);
  }

  // --- PHYSICS & COLLISION ---
  private updateFighterPhysics(f: FighterState) {
    // Smooth health trail
    if (f.displayHealth > f.health) {
      f.displayHealth = Math.max(f.health, f.displayHealth - 0.4);
    }

    // Apply gravity
    if (!f.isGrounded) {
      f.vy += 0.75; // gravity
      f.y += f.vy;
      f.x += f.vx;

      // Landing
      if (f.y >= this.groundY) {
        f.y = this.groundY;
        f.vy = 0;
        f.vx = 0;
        f.isGrounded = true;
        this.spawnDust(f.x, f.y);
        if (f.state === 'jump') {
          f.state = 'idle';
        }
      }
    } else {
      // Ground friction
      f.x += f.vx;
      f.vx *= 0.82;
      if (Math.abs(f.vx) < 0.1) f.vx = 0;
    }

    // Hitstun and Blockstun countdown
    if (f.hitstun > 0) {
      f.hitstun--;
      if (f.hitstun <= 0 && f.state === 'hit') {
        f.state = 'idle';
        f.currentAttack = null;
      }
    }
    if (f.blockstun > 0) {
      f.blockstun--;
      if (f.blockstun <= 0) {
        f.blockstun = 0;
        f.isBlocking = false;
        f.currentAttack = null;
        if (f.state === 'block') {
          f.state = f.isCrouching ? 'crouch' : 'idle';
        }
      }
    }

    // Knockdown getup timer
    if (f.state === 'knockdown') {
      if (f.knockdownTimer > 0) {
        f.knockdownTimer--;
      } else if (f.health > 0) {
        f.state = 'idle';
        f.currentAttack = null;
      }
    }

    // Reset combo counter if not actively hitting
    if (f.state === 'idle' || f.state === 'walk') {
      f.comboCount = 0;
      f.comboDamage = 0;
      if (f.state === 'idle' && f.attackFrame === 0) {
        f.currentAttack = null;
      }
    }
  }

  private resolveFighterCollisions() {
    const f1 = this.fighters[0];
    const f2 = this.fighters[1];

    // Screen boundaries
    const margin = 40;
    f1.x = Math.max(margin, Math.min(this.arenaWidth - margin, f1.x));
    f2.x = Math.max(margin, Math.min(this.arenaWidth - margin, f2.x));

    // Pushbox collision so fighters don't phase through each other
    const minDist = 44;
    const dx = f2.x - f1.x;
    if (Math.abs(dx) < minDist) {
      const overlap = (minDist - Math.abs(dx)) / 2;
      if (dx > 0) {
        f1.x -= overlap;
        f2.x += overlap;
      } else {
        f1.x += overlap;
        f2.x -= overlap;
      }
    }
  }

  // --- K.O. AND MATCH FLOW ---
  private checkKo() {
    const f1 = this.fighters[0];
    const f2 = this.fighters[1];

    if (f1.health <= 0 || f2.health <= 0) {
      this.state = 'round_over';
      this.roundOverTimer = 120; // 2 seconds post K.O.
      this.shakeDuration = 12;
      this.hitStopFrames = 10;
      audio.playAnnouncer('ko');
      this.callbacks.onAnnounce?.('ko');

      if (f1.health > 0) {
        f1.roundsWon++;
        f1.state = 'win';
        f2.state = 'knockdown';
      } else if (f2.health > 0) {
        f2.roundsWon++;
        f2.state = 'win';
        f1.state = 'knockdown';
      } else {
        // Double K.O.
        f1.state = 'knockdown';
        f2.state = 'knockdown';
      }

      this.callbacks.onRoundOver?.(f1.health > 0 ? 0 : f2.health > 0 ? 1 : -1);
    }
  }

  private handleTimeOver() {
    this.state = 'round_over';
    this.roundOverTimer = 120;
    const f1 = this.fighters[0];
    const f2 = this.fighters[1];

    if (f1.health > f2.health) {
      f1.roundsWon++;
      f1.state = 'win';
      this.callbacks.onRoundOver?.(0);
    } else if (f2.health > f1.health) {
      f2.roundsWon++;
      f2.state = 'win';
      this.callbacks.onRoundOver?.(1);
    } else {
      this.callbacks.onRoundOver?.(-1);
    }
  }

  private checkMatchProgression() {
    const f1 = this.fighters[0];
    const f2 = this.fighters[1];

    // Best 2 out of 3
    if (f1.roundsWon >= 2) {
      this.matchWinner = 0;
      this.state = 'match_over';
      audio.playAnnouncer('youwin');
      this.callbacks.onAnnounce?.('youwin');
      this.callbacks.onMatchOver?.(0);
    } else if (f2.roundsWon >= 2) {
      this.matchWinner = 1;
      this.state = 'match_over';
      this.callbacks.onMatchOver?.(1);
    } else {
      // Next Round
      this.startRound(this.currentRound + 1);
    }
  }

  // --- CPU ARTIFICIAL INTELLIGENCE ---
  private resolveP2Input(p2Input: InputState | null): InputState {
    if (this.mode === 'pvp' && p2Input) {
      return p2Input;
    }

    if (this.mode === 'training') {
      return {
        up: this.dummyState === 'jump',
        down: this.dummyState === 'crouch',
        left: this.dummyState === 'block',
        right: false,
        lp: false,
        hp: false,
        lk: false,
        hk: false,
      };
    }

    // CPU AI System
    const cpu = this.fighters[1];
    const player = this.fighters[0];
    const dist = Math.abs(cpu.x - player.x);
    const cpuInput: InputState = {
      up: false,
      down: false,
      left: false,
      right: false,
      lp: false,
      hp: false,
      lk: false,
      hk: false,
    };

    // Reaction speed & aggressiveness based on difficulty
    const isBoss = cpu.charId === 'raizen';
    const baseAggro = this.cpuDifficulty === 'easy' ? 0.04 : this.cpuDifficulty === 'normal' ? 0.08 : this.cpuDifficulty === 'hard' ? 0.13 : 0.18;
    const attackProb = isBoss ? baseAggro * 1.35 : baseAggro;

    // Check if player initiated a new attack or projectile
    const playerAttacking = player.state === 'attack' || player.state === 'special';
    const incomingProj = this.projectiles.find((p) => p.active && p.ownerIndex === 0 && Math.abs(p.x - cpu.x) < 220);

    if (playerAttacking || incomingProj) {
      const currentAtkKey = incomingProj ? `proj_${incomingProj.id}` : player.currentAttack || 'atk';

      // If this is a new attack, decide ONCE whether to block and calculate reaction delay
      if (this.cpuTargetAttackId !== currentAtkKey) {
        this.cpuTargetAttackId = currentAtkKey;

        // Base block probability per difficulty:
        let blockChance = this.cpuDifficulty === 'easy' ? 0.22 : this.cpuDifficulty === 'normal' ? 0.45 : this.cpuDifficulty === 'hard' ? 0.68 : 0.82;
        if (isBoss) blockChance = Math.min(0.9, blockChance + 0.12); // Boss is more disciplined

        let reactDelay = this.cpuDifficulty === 'easy' ? 9 : this.cpuDifficulty === 'normal' ? 5 : this.cpuDifficulty === 'hard' ? 3 : 2;
        if (isBoss) reactDelay = Math.max(1, reactDelay - 1);

        // Jump-in attacks and sweeps reduce block chance (mixup advantage for player!)
        if (!player.isGrounded || player.isCrouching) {
          blockChance = Math.max(0.1, blockChance - 0.15);
        }

        this.cpuBlockDecision = Math.random() < blockChance;
        this.cpuReactionTimer = reactDelay;
      }

      // Decrement reaction delay timer
      if (this.cpuReactionTimer > 0) {
        this.cpuReactionTimer--;
      }

      // Can CPU physically block? Must be grounded and not attacking / recovering
      const canBlock = cpu.isGrounded && cpu.state !== 'attack' && cpu.state !== 'special' && cpu.state !== 'hit' && cpu.state !== 'knockdown';

      if (canBlock && this.cpuReactionTimer === 0 && this.cpuBlockDecision) {
        // Hold back to block
        if (cpu.facingRight) cpuInput.left = true;
        else cpuInput.right = true;

        // Low guard if player is crouching or sweeping
        if (player.isCrouching || player.currentAttack?.includes('crouch')) {
          cpuInput.down = true;
        }
        return cpuInput;
      }
    } else {
      // Player is not attacking -> reset CPU block decision
      this.cpuTargetAttackId = null;
      this.cpuBlockDecision = false;
      this.cpuReactionTimer = 0;
    }

    // Distance management & Special Attack Behavior
    if (dist > 200) {
      // Long distance
      if (isBoss && Math.random() < 0.06) {
        // Boss uses Void Eclipse Flare or Shadow Teleport
        if (Math.random() < 0.6) {
          // QCF + P (Void Flare)
          cpuInput.down = true;
          if (cpu.facingRight) cpuInput.right = true;
          else cpuInput.left = true;
          cpuInput.hp = true;
        } else {
          // QCB + K (Shadow Warp Strike)
          cpuInput.down = true;
          if (cpu.facingRight) cpuInput.left = true;
          else cpuInput.right = true;
          cpuInput.hk = true;
        }
      } else if (Math.random() < 0.04) {
        // Standard fighter special
        cpuInput.down = true;
        if (cpu.facingRight) cpuInput.right = true;
        else cpuInput.left = true;
        cpuInput.hp = true;
      } else if (Math.random() < 0.03 && !player.isGrounded) {
        // Jump counter
        cpuInput.up = true;
      } else {
        // Close in
        if (cpu.x < player.x) cpuInput.right = true;
        else cpuInput.left = true;
      }
    } else if (dist < 85) {
      // In strike range
      if (Math.random() < attackProb) {
        const rand = Math.random();
        if (isBoss && rand < 0.35) {
          // Boss uses Chaos Pillar or Heavy Strike
          if (Math.random() < 0.5) {
            // Charge B, F + P (Chaos Pillar)
            cpuInput.down = true;
            if (cpu.facingRight) cpuInput.right = true;
            else cpuInput.left = true;
            cpuInput.hp = true;
          } else {
            cpuInput.hp = true;
          }
        } else if (rand < 0.35) {
          cpuInput.lp = true;
        } else if (rand < 0.65) {
          cpuInput.hp = true;
        } else if (rand < 0.85) {
          cpuInput.lk = true;
        } else {
          // Close special move
          cpuInput.down = true;
          if (cpu.facingRight) cpuInput.right = true;
          else cpuInput.left = true;
          cpuInput.hp = true;
        }
      } else if (Math.random() < 0.04) {
        // Backstep
        if (cpu.facingRight) cpuInput.left = true;
        else cpuInput.right = true;
      }
    } else {
      // Mid range
      if (isBoss && Math.random() < 0.07) {
        cpuInput.hk = true;
      } else if (Math.random() < 0.05) {
        cpuInput.hp = true;
      } else {
        if (cpu.x < player.x) cpuInput.right = true;
        else cpuInput.left = true;
      }
    }

    return cpuInput;
  }

  // --- PARTICLES GENERATOR ---
  private spawnHitSparks(x: number, y: number, isHeavy: boolean) {
    // 1. Primary Capcom 16-bit Comic Starburst
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      color: '#facc15',
      size: isHeavy ? 36 : 24,
      life: isHeavy ? 10 : 7,
      maxLife: isHeavy ? 10 : 7,
    });

    // 2. Flying pixel fragments & sparks
    const count = isHeavy ? 16 : 8;
    const colors = ['#fef08a', '#f97316', '#ef4444', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * (isHeavy ? 8 : 4.5);
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: isHeavy ? 5 : 4,
        life: 14,
        maxLife: 14,
      });
    }
  }

  private spawnBlockParticles(x: number, y: number, isChip: boolean = false) {
    const colors = isChip ? ['#f59e0b', '#ef4444', '#fef08a'] : ['#38bdf8', '#06b6d4', '#e0f2fe'];
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: isChip ? 4 : 3,
        life: 12,
        maxLife: 12,
      });
    }

    // Floating text particle for instant feedback
    this.particles.push({
      x,
      y: y - 10,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -1.2,
      color: isChip ? '#f59e0b' : '#38bdf8',
      size: 14,
      life: 20,
      maxLife: 20,
      text: isChip ? 'CHIP!' : 'BLOCK',
    });
  }

  private spawnExplosionParticles(x: number, y: number, color: string) {
    // Giant explosion starburst
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      color: '#facc15',
      size: 42,
      life: 12,
      maxLife: 12,
    });

    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 7;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: i % 2 === 0 ? color : '#ffffff',
        size: 5 + Math.random() * 4,
        life: 18,
        maxLife: 18,
      });
    }
  }

  private spawnDust(x: number, y: number) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y - 2,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 1.5,
        color: '#94a3b8',
        size: 4,
        life: 12,
        maxLife: 12,
      });
    }
  }

  private updateParticles() {
    this.particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
    });
    this.particles = this.particles.filter((p) => p.life > 0);
  }
}
