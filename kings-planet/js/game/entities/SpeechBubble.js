import { GAME_CONSTANTS, COLORS, BUBBLE_TYPES } from '../../utils/Constants.js';
import { GameHelpers } from '../../utils/Helpers.js';

export class SpeechBubble {
  constructor(scene, x, y, text, type, targetX, targetY) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.text = text;
    this.type = type;
    this.targetX = targetX;
    this.targetY = targetY;
    
    // 설정 가져오기
    const config = BUBBLE_TYPES[type] || BUBBLE_TYPES.command;
    
    // 시각적 말풍선
    this.visualBubble = scene.add.sprite(x, y, 'speechBubbles');
    this.visualBubble.setTint(config.tint);
    this.visualBubble.setScale(config.scale);
    
    // 텍스트
    this.bubbleText = scene.add.text(x, y, text, {
      fontSize: '12px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // 물리 객체 (충돌 감지용)
    this.physicsBubble = scene.physics.add.sprite(x, y, 'speechBubbles');
    this.physicsBubble.setVisible(false);
    this.physicsBubble.setScale(config.scale);
    
    // 속성 설정
    this.speed = config.speed;
    this.isReflected = false;
    this.isDestroyed = false;
    
    // 어린왕자 방향으로 이동
    this.setVelocity();
    
    // 자동 소멸 타이머
    this.lifetimeTimer = scene.time.delayedCall(GAME_CONSTANTS.SPEECH_BUBBLE.LIFETIME, () => {
      this.destroy();
    });
  }
  
  // 속도 설정
  setVelocity() {
    const angle = GameHelpers.getAngleBetweenPoints(
      this.x, this.y, this.targetX, this.targetY
    );
    
    this.physicsBubble.setVelocity(
      Math.cos(angle) * this.speed,
      Math.sin(angle) * this.speed
    );
  }
  
  // 업데이트
  update() {
    if (this.isDestroyed) return;
    
    // 시각적 요소들을 물리 객체 위치에 맞춤
    this.visualBubble.x = this.physicsBubble.x;
    this.visualBubble.y = this.physicsBubble.y;
    this.bubbleText.x = this.physicsBubble.x;
    this.bubbleText.y = this.physicsBubble.y;
  }
  
  // 패링 성공 처리 (왕에게 반사)
  reflect(targetX, targetY) {
    if (this.isReflected) return;
    
    this.isReflected = true;
    this.physicsBubble.setTint(COLORS.PARRY);
    
    // 왕에게 되돌아가는 속도
    const reflectSpeed = 400;
    const angle = GameHelpers.getAngleBetweenPoints(
      this.physicsBubble.x, this.physicsBubble.y, targetX, targetY
    );
    
    this.physicsBubble.setVelocity(
      Math.cos(angle) * reflectSpeed,
      Math.sin(angle) * reflectSpeed
    );
    
    // 반사 효과
    this.visualBubble.setTint(COLORS.PARRY);
    this.bubbleText.setColor('#f1c40f');
  }
  
  // 충돌 처리
  onCollision(collider) {
    if (this.isDestroyed) return;
    
    // 패링 중인지 확인
    if (collider.isParrying && collider.isParrying()) {
      this.reflect(this.targetX, this.targetY);
      return 'parry';
    }
    
    // 일반 피격
    if (collider.takeDamage) {
      collider.takeDamage();
      this.destroy();
      return 'hit';
    }
    
    return 'none';
  }
  
  // 물리 객체 가져오기
  getPhysicsSprite() {
    return this.physicsBubble;
  }
  
  // 위치 가져오기
  getPosition() {
    return { x: this.physicsBubble.x, y: this.physicsBubble.y };
  }
  
  // 반사 상태 확인
  isReflected() {
    return this.isReflected;
  }
  
  // 파괴 상태 확인
  isDestroyed() {
    return this.isDestroyed;
  }
  
  // 파괴
  destroy() {
    if (this.isDestroyed) return;
    
    this.isDestroyed = true;
    
    // 타이머 취소
    if (this.lifetimeTimer) {
      this.lifetimeTimer.destroy();
    }
    
    // 스프라이트들 파괴
    if (this.visualBubble) {
      this.visualBubble.destroy();
    }
    
    if (this.bubbleText) {
      this.bubbleText.destroy();
    }
    
    if (this.physicsBubble) {
      this.physicsBubble.destroy();
    }
  }
  
  // 충돌 그룹에 추가
  addToCollisionGroup(group) {
    group.add(this.physicsBubble);
  }
  
  // 충돌 콜백 설정
  setCollisionCallback(callback) {
    this.physicsBubble.on('collision', callback);
  }
} 