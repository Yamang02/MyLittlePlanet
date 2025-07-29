import { INPUT_KEYS } from '../../utils/Constants.js';

export class InputSystem {
  constructor(scene) {
    this.scene = scene;
    this.keys = {};
    this.justPressed = {};
    this.justReleased = {};
    
    this.setupKeys();
  }
  
  // 키 설정
  setupKeys() {
    // 기본 키들
    this.keys.left = this.scene.input.keyboard.addKey(INPUT_KEYS.LEFT);
    this.keys.right = this.scene.input.keyboard.addKey(INPUT_KEYS.RIGHT);
    this.keys.space = this.scene.input.keyboard.addKey(INPUT_KEYS.SPACE);
    this.keys.x = this.scene.input.keyboard.addKey(INPUT_KEYS.X);
    this.keys.z = this.scene.input.keyboard.addKey(INPUT_KEYS.Z);
    
    // 추가 키들
    this.keys.escape = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.keys.enter = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.keys.p = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
  }
  
  // 업데이트
  update() {
    // JustPressed 상태 업데이트
    for (const [keyName, key] of Object.entries(this.keys)) {
      if (Phaser.Input.Keyboard.JustDown(key)) {
        this.justPressed[keyName] = true;
      } else {
        this.justPressed[keyName] = false;
      }
      
      if (Phaser.Input.Keyboard.JustUp(key)) {
        this.justReleased[keyName] = true;
      } else {
        this.justReleased[keyName] = false;
      }
    }
  }
  
  // 키가 눌려있는지 확인
  isKeyDown(keyName) {
    return this.keys[keyName] && this.keys[keyName].isDown;
  }
  
  // 키가 방금 눌렸는지 확인
  isKeyJustPressed(keyName) {
    return this.justPressed[keyName] || false;
  }
  
  // 키가 방금 떼졌는지 확인
  isKeyJustReleased(keyName) {
    return this.justReleased[keyName] || false;
  }
  
  // 이동 입력 확인
  getMovementInput() {
    let horizontal = 0;
    
    if (this.isKeyDown('left')) {
      horizontal -= 1;
    }
    if (this.isKeyDown('right')) {
      horizontal += 1;
    }
    
    return { horizontal };
  }
  
  // 점프 입력 확인
  isJumpPressed() {
    return this.isKeyJustPressed('space');
  }
  
  // 회피 입력 확인
  isDodgePressed() {
    return this.isKeyJustPressed('x');
  }
  
  // 패링 입력 확인
  isParryPressed() {
    return this.isKeyJustPressed('z');
  }
  
  // 일시정지 입력 확인
  isPausePressed() {
    return this.isKeyJustPressed('escape') || this.isKeyJustPressed('p');
  }
  
  // 확인 입력 확인
  isConfirmPressed() {
    return this.isKeyJustPressed('enter') || this.isKeyJustPressed('space');
  }
  
  // 모든 키 상태 가져오기
  getKeyStates() {
    const states = {};
    for (const [keyName, key] of Object.entries(this.keys)) {
      states[keyName] = {
        isDown: key.isDown,
        isUp: key.isUp,
        justPressed: this.justPressed[keyName] || false,
        justReleased: this.justReleased[keyName] || false
      };
    }
    return states;
  }
  
  // 키 리맵핑
  remapKey(action, newKeyCode) {
    if (this.keys[action]) {
      this.keys[action].destroy();
    }
    
    this.keys[action] = this.scene.input.keyboard.addKey(newKeyCode);
  }
  
  // 키 비활성화
  disableKey(keyName) {
    if (this.keys[keyName]) {
      this.keys[keyName].enabled = false;
    }
  }
  
  // 키 활성화
  enableKey(keyName) {
    if (this.keys[keyName]) {
      this.keys[keyName].enabled = true;
    }
  }
  
  // 모든 키 비활성화
  disableAllKeys() {
    for (const key of Object.values(this.keys)) {
      key.enabled = false;
    }
  }
  
  // 모든 키 활성화
  enableAllKeys() {
    for (const key of Object.values(this.keys)) {
      key.enabled = true;
    }
  }
  
  // 파괴
  destroy() {
    for (const key of Object.values(this.keys)) {
      if (key && key.destroy) {
        key.destroy();
      }
    }
    this.keys = {};
    this.justPressed = {};
    this.justReleased = {};
  }
} 