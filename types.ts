export enum UpgradeType {
  CLICK = 'CLICK',
  AUTO = 'AUTO'
}

export interface UpgradeConfig {
  id: string;
  name: string;
  type: UpgradeType;
  baseCost: number;
  basePower: number; // For CLICK: power per click, For AUTO: power per second
  description: string;
  icon: string;
  costMultiplier: number;
}

export interface GameState {
  stardust: number;
  lifetimeStardust: number;
  clickCount: number;
  upgrades: Record<string, number>; // Maps upgrade ID to count/level
  startTime: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
}