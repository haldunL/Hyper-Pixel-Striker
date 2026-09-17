export type CharacterId = 'kasumi' | 'roxie' | 'kenzo' | 'marcus' | 'raizen';
export type StageId = 'park' | 'alley' | 'gym' | 'ring' | 'throne';
export type GameMode = 'arcade' | 'versus' | 'pvp' | 'training';
export type GameState = 'select' | 'countdown' | 'fighting' | 'round_over' | 'match_over';
export type CpuDifficulty = 'easy' | 'normal' | 'hard' | 'ultra';

export type AttackType = 'LP' | 'HP' | 'LK' | 'HK';
export type Direction = 'neutral' | 'up' | 'down' | 'left' | 'right' | 'up_left' | 'up_right' | 'down_left' | 'down_right';

export interface SpecialMoveDef {
  id: string;
  name: string;
  command: string; // e.g., "D, DF, F + P"
  motionType: 'qcf_p' | 'qcf_k' | 'qcb_p' | 'qcb_k' | 'bf_p' | 'bf_k';
  damagePercent: number; // e.g., 18 = 18%
  airBonusDamagePercent?: number; // e.g., Marcus 32% vs air
  description: string;
  isAntiAir?: boolean;
  isProjectile?: boolean;
  projectileColor?: 'red' | 'green' | 'purple';
  causesKnockdown?: boolean;
}

export interface CharacterDef {
  id: CharacterId;
  name: string;
  title: string;
  gender: 'female' | 'male';
  description: string;
  bio: string;
  themeColor: string;
  secondaryColor: string;
  specialKicks: boolean; // false for Marcus (boxer)
  moves: SpecialMoveDef[];
  stats: {
    speed: number;
    punchPower: number;
    kickPower: number;
    defense: number;
  };
}

export interface StageDef {
  id: StageId;
  name: string;
  turkishName: string;
  description: string;
  accentColor: string;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  lp: boolean; // Light Punch
  hp: boolean; // Heavy Punch
  lk: boolean; // Light Kick
  hk: boolean; // Heavy Kick
}

export interface Projectile {
  id: number;
  ownerIndex: 0 | 1;
  x: number;
  y: number;
  vx: number;
  radius: number;
  color: 'red' | 'green' | 'purple';
  damage: number;
  causesKnockdown: boolean;
  active: boolean;
  frame: number;
}

export interface HitParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  text?: string;
}

export interface FighterState {
  playerIndex: 0 | 1;
  charId: CharacterId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facingRight: boolean;
  health: number; // max 100
  displayHealth: number; // for smooth chip damage trail
  isGrounded: boolean;
  isCrouching: boolean;
  isBlocking: boolean;
  state: 'idle' | 'walk' | 'jump' | 'crouch' | 'attack' | 'special' | 'hit' | 'block' | 'knockdown' | 'getup' | 'win' | 'lose';
  currentAttack: string | null;
  attackFrame: number;
  attackDuration: number;
  hitConnected: boolean;
  hitstun: number;
  blockstun: number;
  knockdownTimer: number;
  roundsWon: number;
  comboCount: number;
  comboDamage: number;
  recentInputs: { dir: Direction; attack: AttackType | null; frame: number }[];
  chargeBackTimer: number;
}
