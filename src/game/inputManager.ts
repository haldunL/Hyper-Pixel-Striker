// Keyboard, Gamepad and Touch Input Manager
import { InputState } from '../types/game';

export class InputManager {
  private keysDown: Set<string> = new Set();
  private touchState: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    lp: false,
    hp: false,
    lk: false,
    hk: false,
  };
  private connectedGamepads: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (e) => {
        this.keysDown.add(e.code);
      });
      window.addEventListener('keyup', (e) => {
        this.keysDown.delete(e.code);
      });
      window.addEventListener('blur', () => {
        this.clearInputs();
      });
      window.addEventListener('contextmenu', () => {
        this.clearInputs();
      });
      window.addEventListener('gamepadconnected', () => {
        this.updateGamepadCount();
      });
      window.addEventListener('gamepaddisconnected', () => {
        this.updateGamepadCount();
      });
    }
  }

  public clearInputs() {
    this.keysDown.clear();
    this.touchState = {
      up: false,
      down: false,
      left: false,
      right: false,
      lp: false,
      hp: false,
      lk: false,
      hk: false,
    };
  }

  private updateGamepadCount() {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
    const gps = navigator.getGamepads();
    let count = 0;
    for (let i = 0; i < gps.length; i++) {
      if (gps[i]) count++;
    }
    this.connectedGamepads = count;
  }

  public getGamepadCount(): number {
    this.updateGamepadCount();
    return this.connectedGamepads;
  }

  public setTouchInput(input: Partial<InputState>) {
    this.touchState = { ...this.touchState, ...input };
  }

  public getP1Input(): InputState {
    const keys = this.keysDown;
    const touch = this.touchState;
    const gp = this.getGamepadState(0);

    // Keyboard P1: WASD + U, I, J, K (or J, I, K, L) + Arrow keys fallback
    const up = keys.has('KeyW') || keys.has('ArrowUp') || touch.up || gp.up;
    const down = keys.has('KeyS') || keys.has('ArrowDown') || touch.down || gp.down;
    const left = keys.has('KeyA') || keys.has('ArrowLeft') || touch.left || gp.left;
    const right = keys.has('KeyD') || keys.has('ArrowRight') || touch.right || gp.right;

    // Attacks:
    // LP (Light Punch): U or J or Keypad 7 or Gamepad X
    const lp = keys.has('KeyU') || keys.has('KeyJ') || touch.lp || gp.lp;
    // HP (Heavy Punch): I or Keypad 8 or Gamepad Y
    const hp = keys.has('KeyI') || keys.has('KeyK') || touch.hp || gp.hp;
    // LK (Light Kick): J or Keypad 4 or Gamepad A
    const lk = keys.has('KeyH') || keys.has('KeyM') || touch.lk || gp.lk;
    // HK (Heavy Kick): K or L or Keypad 5 or Gamepad B
    const hk = keys.has('KeyO') || keys.has('KeyL') || touch.hk || gp.hk;

    return { up, down, left, right, lp, hp, lk, hk };
  }

  public getP2Input(): InputState {
    const keys = this.keysDown;
    const gp = this.getGamepadState(1);

    // P2 Keyboard: Arrow keys / Numpad
    const up = keys.has('ArrowUp') || keys.has('Numpad8') || gp.up;
    const down = keys.has('ArrowDown') || keys.has('Numpad2') || gp.down;
    const left = keys.has('ArrowLeft') || keys.has('Numpad4') || gp.left;
    const right = keys.has('ArrowRight') || keys.has('Numpad6') || gp.right;

    const lp = keys.has('Numpad7') || keys.has('BracketLeft') || gp.lp;
    const hp = keys.has('Numpad9') || keys.has('BracketRight') || gp.hp;
    const lk = keys.has('Numpad1') || keys.has('Semicolon') || gp.lk;
    const hk = keys.has('Numpad3') || keys.has('Quote') || gp.hk;

    return { up, down, left, right, lp, hp, lk, hk };
  }

  private getGamepadState(padIndex: number): InputState {
    const empty: InputState = { up: false, down: false, left: false, right: false, lp: false, hp: false, lk: false, hk: false };
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return empty;

    const gamepads = navigator.getGamepads();
    let pad = gamepads[padIndex];

    // Fallback: if padIndex is 0 and only 1 gamepad connected, use first available
    if (!pad && padIndex === 0) {
      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
          pad = gamepads[i];
          break;
        }
      }
    }

    if (!pad) return empty;

    const b = pad.buttons;
    const a = pad.axes;

    // D-Pad or Left Stick
    const up = (b[12]?.pressed || a[1] < -0.4);
    const down = (b[13]?.pressed || a[1] > 0.4);
    const left = (b[14]?.pressed || a[0] < -0.4);
    const right = (b[15]?.pressed || a[0] > 0.4);

    // Buttons (Standard mapping):
    // Button 2 (X / Square): Light Punch
    const lp = Boolean(b[2]?.pressed || b[4]?.pressed); // Square or LB
    // Button 3 (Y / Triangle): Heavy Punch
    const hp = Boolean(b[3]?.pressed || b[6]?.pressed); // Triangle or LT
    // Button 0 (A / Cross): Light Kick
    const lk = Boolean(b[0]?.pressed || b[5]?.pressed); // Cross or RB
    // Button 1 (B / Circle): Heavy Kick
    const hk = Boolean(b[1]?.pressed || b[7]?.pressed); // Circle or RT

    return { up, down, left, right, lp, hp, lk, hk };
  }

  public vibrate(padIndex: number = 0, durationMs: number = 60) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(Math.min(durationMs, 50));
      } catch (_) {}
    }
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return;
    const gamepads = navigator.getGamepads();
    const pad = gamepads[padIndex];
    if (pad && (pad as any).vibrationActuator) {
      try {
        (pad as any).vibrationActuator.playEffect('dual-rumble', {
          startDelay: 0,
          duration: durationMs,
          weakMagnitude: 0.7,
          strongMagnitude: 0.9,
        });
      } catch (e) {
        // ignore if not supported
      }
    }
  }
}

export const inputManager = new InputManager();
