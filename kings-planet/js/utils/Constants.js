// 게임 상수 정의
export const GAME_CONSTANTS = {
  SCREEN: {
    WIDTH: 800,
    HEIGHT: 600,
    FLOOR_Y: 550
  },
  PLAYER: {
    HEALTH: 3,
    MOVE_SPEED: 200,
    JUMP_VELOCITY: -400,
    JUMP_COOLDOWN: 500,
    DODGE_COOLDOWN: 1000,
    DODGE_DURATION: 300,
    PARRY_DURATION: 200
  },
  KING: {
    MAX_HEALTH: 100,
    PHASE_1_THRESHOLD: 70,
    PHASE_2_THRESHOLD: 30
  },
  ATTACK: {
    PHASE_1_COOLDOWN: { MIN: 2000, MAX: 3000 },
    PHASE_2_COOLDOWN: { MIN: 1500, MAX: 2500 },
    PHASE_3_COOLDOWN: { MIN: 1000, MAX: 2000 }
  },
  SPEECH_BUBBLE: {
    LIFETIME: 5000
  }
};

// 색상 정의
export const COLORS = {
  PLAYER: 0x3498db,
  KING: 0xe74c3c,
  KING_PHASE_2: 0xf39c12,
  KING_PHASE_3: 0x9b59b6,
  PARRY: 0xf1c40f,
  DAMAGE: 0xff0000
};

// 게임 페이즈 정의
export const PHASES = {
  PHASE_1: 'phase1',
  PHASE_2: 'phase2',
  PHASE_3: 'phase3'
};

// 말풍선 타입 정의
export const BUBBLE_TYPES = {
  command: {
    tint: 0xe74c3c,
    scale: 1.0,
    speed: 150
  },
  rage: {
    tint: 0xf39c12,
    scale: 1.2,
    speed: 200
  },
  plea: {
    tint: 0x9b59b6,
    scale: 0.8,
    speed: 100
  }
}; 