// 게임 상수 정의
const GAME_CONSTANTS = {
  // 화면 설정
  SCREEN: {
    WIDTH: 800,
    HEIGHT: 600,
    FLOOR_Y: 480  // 화면 높이의 80%
  },
  
  // 플레이어 설정
  PLAYER: {
    HEALTH: 3,
    MOVE_SPEED: 200,
    JUMP_VELOCITY: -400,
    JUMP_COOLDOWN: 200,
    DODGE_COOLDOWN: 1000,
    DODGE_DURATION: 300,
    PARRY_DURATION: 200
  },
  
  // 왕 설정
  KING: {
    MAX_HEALTH: 100,
    PHASE_1_THRESHOLD: 60,  // 60% 이하에서 페이즈 2
    PHASE_2_THRESHOLD: 20   // 20% 이하에서 페이즈 3
  },
  
  // 말풍선 설정
  SPEECH_BUBBLE: {
    PARRY_WINDOW: 300,  // 패링 성공 윈도우 (ms)
    LIFETIME: 4000,     // 자동 소멸 시간 (ms)
    PHASE_1_SPEED: 200,
    PHASE_2_SPEED: 300,
    PHASE_3_SPEED: 150
  },
  
  // 공격 설정
  ATTACK: {
    PHASE_1_COOLDOWN: { MIN: 2000, MAX: 3000 },
    PHASE_2_COOLDOWN: { MIN: 1000, MAX: 1500 },
    PHASE_3_COOLDOWN: { MIN: 3000, MAX: 4000 }
  },
  
  // 색상
  COLORS: {
    PLAYER: 0x3498db,
    KING: 0xe74c3c,
    KING_PHASE_2: 0xff0000,
    KING_PHASE_3: 0x95a5a6,
    PARRY: 0xf1c40f,
    DAMAGE: 0xff0000,
    HEALTH_BAR_BG: 0x2c3e50,
    HEALTH_BAR_BORDER: 0x95a5a6,
    COMBO_TEXT: 0xf1c40f,
    CONTROLS_TEXT: 0xbdc3c7
  },
  
  // 말풍선 타입별 설정
  BUBBLE_TYPES: {
    command: {
      tint: 0xff6b6b,
      scale: 1.2,
      speed: 200
    },
    rage: {
      tint: 0xff0000,
      scale: 1.5,
      speed: 300
    },
    plea: {
      tint: 0x95a5a6,
      scale: 0.8,
      speed: 150
    }
  }
};

// 입력 키 코드
const INPUT_KEYS = {
  LEFT: Phaser.Input.Keyboard.KeyCodes.LEFT,
  RIGHT: Phaser.Input.Keyboard.KeyCodes.RIGHT,
  SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
  X: Phaser.Input.Keyboard.KeyCodes.X,
  Z: Phaser.Input.Keyboard.KeyCodes.Z
};

// 게임 상태
const GAME_STATES = {
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameOver',
  VICTORY: 'victory'
};

// 페이즈
const PHASES = {
  PHASE_1: 1,
  PHASE_2: 2,
  PHASE_3: 3
};

// 전역 변수로 노출
window.GAME_CONSTANTS = GAME_CONSTANTS;
window.INPUT_KEYS = INPUT_KEYS;
window.GAME_STATES = GAME_STATES;
window.PHASES = PHASES; 