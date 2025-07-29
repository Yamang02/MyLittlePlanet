// 전역 변수로 접근
const GAME_CONSTANTS = window.GAME_CONSTANTS;
const COLORS = GAME_CONSTANTS.COLORS;

class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    
    // 스프라이트 생성
    this.sprite = scene.physics.add.sprite(x, y, 'littlePrince');
    this.sprite.setTint(COLORS.PLAYER);
    this.sprite.setScale(3);
    
    // 물리 설정
    this.sprite.body.setGravityY(1200);
    
    // 상태
    this.isJumping = false;
    this.isDodging = false;
    this.isParrying = false;
    this.jumpCooldown = 0;
    this.dodgeCooldown = 0;
    
    // 입력
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.xKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.zKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    
    // 이벤트 콜백
    this.onDamage = null;
    this.onParry = null;
  }
  
  // 업데이트
  update(time, delta) {
    this.updateCooldowns(delta);
    this.handleInput();
    this.updateMovement();
    this.updatePosition();
  }
  
  // 쿨다운 업데이트
  updateCooldowns(delta) {
    if (this.jumpCooldown > 0) this.jumpCooldown -= delta;
    if (this.dodgeCooldown > 0) this.dodgeCooldown -= delta;
  }
  
  // 입력 처리
  handleInput() {
    // 점프
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.isJumping && this.jumpCooldown <= 0) {
      this.performJump();
    }
    
    // 회피
    if (Phaser.Input.Keyboard.JustDown(this.xKey) && !this.isDodging && this.dodgeCooldown <= 0) {
      this.performDodge();
    }
    
    // 패링
    if (Phaser.Input.Keyboard.JustDown(this.zKey)) {
      this.performParry();
    }
  }
  
  // 이동 업데이트
  updateMovement() {
    // 좌우 이동
    if (this.cursors.left.isDown) {
      this.sprite.setVelocityX(-GAME_CONSTANTS.PLAYER.MOVE_SPEED);
    } else if (this.cursors.right.isDown) {
      this.sprite.setVelocityX(GAME_CONSTANTS.PLAYER.MOVE_SPEED);
    } else {
      this.sprite.setVelocityX(0);
    }
  }
  
  // 위치 업데이트 (바닥 고정)
  updatePosition() {
    if (!this.isJumping && this.sprite.y > GAME_CONSTANTS.SCREEN.FLOOR_Y) {
      this.sprite.y = GAME_CONSTANTS.SCREEN.FLOOR_Y;
      this.sprite.setVelocityY(0);
    }
  }
  
  // 점프 실행
  performJump() {
    this.isJumping = true;
    this.jumpCooldown = GAME_CONSTANTS.PLAYER.JUMP_COOLDOWN;
    this.sprite.setVelocityY(GAME_CONSTANTS.PLAYER.JUMP_VELOCITY);
    console.log('점프!');
  }
  
  // 회피 실행
  performDodge() {
    this.isDodging = true;
    this.dodgeCooldown = GAME_CONSTANTS.PLAYER.DODGE_COOLDOWN;
    
    this.sprite.setAlpha(0.5);
    this.scene.time.delayedCall(GAME_CONSTANTS.PLAYER.DODGE_DURATION, () => {
      this.isDodging = false;
      this.sprite.setAlpha(1);
    });
    
    console.log('회피!');
  }
  
  // 패링 실행
  performParry() {
    this.isParrying = true;
    
    this.sprite.setTint(COLORS.PARRY);
    this.scene.time.delayedCall(GAME_CONSTANTS.PLAYER.PARRY_DURATION, () => {
      this.isParrying = false;
      this.sprite.setTint(COLORS.PLAYER);
    });
    
    if (this.onParry) {
      this.onParry();
    }
    
    console.log('패링!');
  }
  
  // 피격 처리
  takeDamage() {
    if (this.isDodging) return false; // 회피 중이면 무시
    
    this.sprite.setTint(COLORS.DAMAGE);
    this.scene.time.delayedCall(300, () => {
      this.sprite.setTint(COLORS.PLAYER);
    });
    
    if (this.onDamage) {
      this.onDamage();
    }
    
    console.log('어린왕자 피격!');
    return true;
  }
  
  // 패링 성공 처리
  onParrySuccess() {
    // 패링 성공 시 시각적 효과
    this.sprite.setTint(COLORS.PARRY);
    this.scene.time.delayedCall(200, () => {
      this.sprite.setTint(COLORS.PLAYER);
    });
  }
  
  // 상태 확인
  isInvulnerable() {
    return this.isDodging;
  }
  
  isParrying() {
    return this.isParrying;
  }
  
  // 스프라이트 가져오기
  getSprite() {
    return this.sprite;
  }
  
  // 위치 가져오기
  getPosition() {
    return { x: this.sprite.x, y: this.sprite.y };
  }
  
  // 충돌 그룹에 추가
  addToCollisionGroup(group) {
    group.add(this.sprite);
  }
  
  // 충돌 콜백 설정
  setCollisionCallback(callback) {
    this.sprite.on('collision', callback);
  }
  
  // 이벤트 콜백 설정
  setOnDamage(callback) {
    this.onDamage = callback;
  }
  
  setOnParry(callback) {
    this.onParry = callback;
  }
  
  // 파괴
  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
    }
  }
} 