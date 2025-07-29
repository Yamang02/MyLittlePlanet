class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }
  
  create() {
    const { width, height } = this.cameras.main;
    
    // 게임 시작 시간 기록
    window.KingsPlanetGame.gameState.gameStartTime = Date.now();
    
    // 배경 생성
    this.createBackground();
    
    // 캐릭터 생성
    this.createCharacters();
    
    // UI 생성
    this.createUI();
    
    // 입력 시스템 설정
    this.setupInput();
    
    // 물리 시스템 설정
    this.setupPhysics();
    
    // 게임 루프 변수들
    this.lastAttackTime = 0;
    this.attackCooldown = 2000; // 2초
    
    // 말풍선 그룹
    this.speechBubbles = this.physics.add.group();
    
    // 패링 관련 변수들
    this.isParrying = false;
    this.parryStartTime = 0;
    
    console.log('GameScene 생성 완료');
  }
  
  createBackground() {
    const { width, height } = this.cameras.main;
    
    // 왕의 행성 배경 (그라데이션)
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x8e44ad, 0x9b59b6, 0x2c3e50, 0x34495e);
    bg.fillRect(0, 0, width, height);
    
    // 별들 (우주 배경)
    for (let i = 0; i < 30; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height * 0.3),
        Phaser.Math.Between(1, 2),
        0xf1c40f,
        0.7
      );
      
      // 별 깜빡임
      this.tweens.add({
        targets: star,
        alpha: { from: 0.3, to: 1 },
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1
      });
    }
    
    // 왕좌 (우측에 배치)
    const throne = this.add.rectangle(width * 0.85, height * 0.7, 80, 100, 0x8e44ad);
    throne.setStrokeStyle(3, 0x9b59b6);
    
    // 바닥 (격투 스테이지)
    const floor = this.add.rectangle(width/2, height * 0.9, width, 40, 0x34495e);
    floor.setStrokeStyle(2, 0x95a5a6);
  }
  
  createCharacters() {
    const { width, height } = this.cameras.main;
    
    // 어린왕자 (좌측에 배치)
    this.littlePrince = this.physics.add.sprite(width * 0.2, height * 0.7, 'littlePrince');
    this.littlePrince.setCollideWorldBounds(true);
    this.littlePrince.setTint(0x3498db); // 파란색 계열
    this.littlePrince.setScale(3); // 크기 확대
    
    // 왕 (우측 왕좌 근처에 배치)
    this.king = this.physics.add.sprite(width * 0.75, height * 0.7, 'king');
    this.king.setTint(0xe74c3c); // 빨간색 계열
    this.king.setScale(4); // 더 큰 크기
    
    // 캐릭터 애니메이션 설정 (기본적인 것만)
    this.createBasicAnimations();
  }
  
  createBasicAnimations() {
    // 실제 스프라이트 시트가 없으므로 간단한 효과만
    // 어린왕자 기본 상태
    this.littlePrince.setData('state', 'idle');
    
    // 왕 기본 상태
    this.king.setData('state', 'idle');
    
    // 간단한 상하 움직임으로 생동감 표현
    this.tweens.add({
      targets: this.littlePrince,
      y: this.littlePrince.y - 5,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    this.tweens.add({
      targets: this.king,
      y: this.king.y - 3,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  
  createUI() {
    const { width, height } = this.cameras.main;
    
    // 어린왕자 체력 (좌상단)
    this.princeHealthIcons = [];
    for (let i = 0; i < 3; i++) {
      const heart = this.add.circle(50 + (i * 40), 50, 15, 0xe74c3c);
      heart.setStrokeStyle(2, 0xffffff);
      this.princeHealthIcons.push(heart);
    }
    
    // 어린왕자 체력 라벨
    this.add.text(50, 20, '어린왕자', {
      fontSize: '16px',
      fill: '#ecf0f1',
      fontFamily: 'Arial'
    });
    
    // 왕 체력바 (우상단)
    this.add.text(width - 250, 20, '왕', {
      fontSize: '16px',
      fill: '#ecf0f1',
      fontFamily: 'Arial'
    });
    
    this.kingHealthBg = this.add.rectangle(width - 150, 50, 200, 20, 0x2c3e50);
    this.kingHealthBg.setStrokeStyle(2, 0x95a5a6);
    
    this.kingHealthBar = this.add.rectangle(width - 250, 50, 200, 16, 0xe74c3c);
    this.kingHealthBar.setOrigin(0, 0.5);
    
    // 콤보 카운터 (상단 중앙)
    this.comboText = this.add.text(width/2, 30, 'COMBO: 0', {
      fontSize: '24px',
      fill: '#f1c40f',
      fontFamily: 'Arial',
      stroke: '#2c3e50',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    // 페이즈 표시 (상단 중앙 아래)
    this.phaseText = this.add.text(width/2, 60, 'Phase 1: 권위적인 왕', {
      fontSize: '18px',
      fill: '#ecf0f1',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // 조작법 안내 (하단)
    this.add.text(width/2, height - 30, '← → : 이동   SPACE : 회피   Z : 패링', {
      fontSize: '16px',
      fill: '#bdc3c7',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }
  
  setupInput() {
    // 키보드 입력
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    
    // 키 입력 상태 추적
    this.isDodging = false;
    this.dodgeCooldown = 0;
  }
  
  setupPhysics() {
    // 어린왕자와 말풍선 충돌
    this.physics.add.overlap(this.littlePrince, this.speechBubbles, 
      this.onBubbleHitPrince, null, this);
  }
  
  update() {
    // 플레이어 이동 처리
    this.updatePlayerMovement();
    
    // 입력 처리
    this.handleInput();
    
    // 왕 AI 업데이트
    this.updateKingBehavior();
    
    // 말풍선 업데이트
    this.updateSpeechBubbles();
    
    // UI 업데이트
    this.updateUI();
    
    // 페이즈 전환 체크
    this.checkPhaseTransition();
    
    // 게임 종료 조건 체크
    this.checkGameEnd();
  }
  
  updatePlayerMovement() {
    // 좌우 이동
    if (this.cursors.left.isDown) {
      this.littlePrince.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.littlePrince.setVelocityX(200);
    } else {
      this.littlePrince.setVelocityX(0);
    }
    
    // Y축 고정 (2D 격투 게임)
    this.littlePrince.setVelocityY(0);
  }
  
  handleInput() {
    // 회피 (스페이스바)
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && !this.isDodging) {
      this.performDodge();
    }
    
    // 패링 (Z키)
    if (Phaser.Input.Keyboard.JustDown(this.zKey)) {
      this.performParry();
    }
    
    // 회피 쿨다운 감소
    if (this.dodgeCooldown > 0) {
      this.dodgeCooldown -= this.game.loop.delta;
    }
  }
  
  performDodge() {
    this.isDodging = true;
    this.dodgeCooldown = 1000; // 1초 쿨다운
    
    // 시각적 효과 (반투명)
    this.littlePrince.setAlpha(0.5);
    
    // 0.3초 동안 무적
    this.time.delayedCall(300, () => {
      this.isDodging = false;
      this.littlePrince.setAlpha(1);
    });
    
    // 효과음 (콘솔 로그로 대체)
    console.log('회피!');
  }
  
  performParry() {
    this.isParrying = true;
    this.parryStartTime = Date.now();
    
    // 패링 시각 효과
    this.littlePrince.setTint(0xf1c40f);
    
    // 패링 지속 시간
    this.time.delayedCall(200, () => {
      this.isParrying = false;
      this.littlePrince.setTint(0x3498db);
    });
    
    console.log('패링 시도!');
  }
  
  updateKingBehavior() {
    const currentTime = Date.now();
    const gameState = window.KingsPlanetGame.gameState;
    
    // 공격 쿨다운 체크
    if (currentTime - this.lastAttackTime > this.attackCooldown) {
      this.kingAttack();
      this.lastAttackTime = currentTime;
      
      // 페이즈별 공격 간격 조정
      switch (gameState.currentPhase) {
        case 1:
          this.attackCooldown = Phaser.Math.Between(2000, 3000);
          break;
        case 2:
          this.attackCooldown = Phaser.Math.Between(1000, 1500);
          break;
        case 3:
          this.attackCooldown = Phaser.Math.Between(3000, 4000);
          break;
      }
    }
  }
  
  kingAttack() {
    const gameState = window.KingsPlanetGame.gameState;
    
    // 페이즈별 공격 패턴
    switch (gameState.currentPhase) {
      case 1:
        this.createSpeechBubble('앉아라!', 'command');
        break;
      case 2:
        this.createMultipleBubbles(['엎드려라!', '네가 감히!'], 'rage');
        break;
      case 3:
        this.createSpeechBubble('부탁하마...', 'plea');
        break;
    }
  }
  
  createSpeechBubble(text, type) {
    const bubble = this.physics.add.sprite(this.king.x, this.king.y - 50, 'speechBubbles');
    
    // 타입별 시각적 차이
    switch (type) {
      case 'command':
        bubble.setTint(0xff6b6b);
        bubble.setScale(1.2);
        break;
      case 'rage':
        bubble.setTint(0xff0000);
        bubble.setScale(1.5);
        break;
      case 'plea':
        bubble.setTint(0x95a5a6);
        bubble.setScale(0.8);
        bubble.setAlpha(0.7);
        break;
    }
    
    // 텍스트 추가
    const bubbleText = this.add.text(bubble.x, bubble.y, text, {
      fontSize: '12px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);
    
    bubble.bubbleText = bubbleText;
    
    // 어린왕자를 향해 이동
    const angleToPlayer = Phaser.Math.Angle.Between(
      bubble.x, bubble.y, this.littlePrince.x, this.littlePrince.y
    );
    
    const speed = type === 'rage' ? 300 : type === 'plea' ? 150 : 200;
    bubble.setVelocity(
      Math.cos(angleToPlayer) * speed,
      Math.sin(angleToPlayer) * speed
    );
    
    // 말풍선 그룹에 추가
    this.speechBubbles.add(bubble);
    
    // 자동 소멸
    this.time.delayedCall(4000, () => {
      if (bubble.active) {
        if (bubble.bubbleText) bubble.bubbleText.destroy();
        bubble.destroy();
      }
    });
  }
  
  createMultipleBubbles(textArray, type) {
    textArray.forEach((text, index) => {
      this.time.delayedCall(index * 300, () => {
        this.createSpeechBubble(text, type);
      });
    });
  }
  
  updateSpeechBubbles() {
    // 말풍선들의 텍스트를 말풍선과 함께 이동
    this.speechBubbles.children.entries.forEach(bubble => {
      if (bubble.bubbleText) {
        bubble.bubbleText.x = bubble.x;
        bubble.bubbleText.y = bubble.y;
      }
    });
  }
  
  onBubbleHitPrince(prince, bubble) {
    // 반사된 말풍선은 무시
    if (bubble.isReflected) return;
    
    // 회피 중이면 무시
    if (this.isDodging) return;
    
    // 패링 체크
    if (this.isParrying) {
      const timeSinceParry = Date.now() - this.parryStartTime;
      if (timeSinceParry <= window.KingsPlanetGame.gameState.parryWindow) {
        this.onParrySuccess(bubble);
        return;
      }
    }
    
    // 데미지 처리
    this.damagePrince();
    
    // 말풍선 제거
    if (bubble.bubbleText) bubble.bubbleText.destroy();
    bubble.destroy();
  }
  
  onParrySuccess(bubble) {
    const gameState = window.KingsPlanetGame.gameState;
    
    // 콤보 증가
    gameState.currentCombo++;
    
    // 말풍선을 왕에게 반사
    bubble.isReflected = true;
    bubble.setTint(0xf1c40f);
    
    const angleToKing = Phaser.Math.Angle.Between(
      bubble.x, bubble.y, this.king.x, this.king.y
    );
    
    bubble.setVelocity(
      Math.cos(angleToKing) * 400,
      Math.sin(angleToKing) * 400
    );
    
    // 왕에게 데미지
    this.time.delayedCall(200, () => {
      this.damageKing(10);
      if (bubble.bubbleText) bubble.bubbleText.destroy();
      bubble.destroy();
    });
    
    // 시각적 피드백
    this.showText(this.littlePrince.x, this.littlePrince.y - 40, 'PERFECT!', 0xf1c40f);
    
    console.log(`패링 성공! 콤보: ${gameState.currentCombo}`);
  }
  
  damagePrince() {
    const gameState = window.KingsPlanetGame.gameState;
    gameState.playerHealth--;
    gameState.currentCombo = 0; // 콤보 리셋
    
    // UI 업데이트
    this.updatePrinceHealthUI();
    
    // 피격 효과
    this.littlePrince.setTint(0xff0000);
    this.time.delayedCall(300, () => {
      this.littlePrince.setTint(0x3498db);
    });
    
    this.showText(this.littlePrince.x, this.littlePrince.y - 30, 'HIT!', 0xff0000);
    
    console.log(`어린왕자 피격! 남은 체력: ${gameState.playerHealth}`);
  }
  
  damageKing(damage) {
    const gameState = window.KingsPlanetGame.gameState;
    gameState.kingHealth -= damage;
    
    // 왕 체력바 업데이트
    this.updateKingHealthUI();
    
    // 피격 효과
    this.king.setTint(0xffffff);
    this.time.delayedCall(200, () => {
      this.king.setTint(0xe74c3c);
    });
    
    this.showText(this.king.x, this.king.y - 50, `-${damage}`, 0xffff00);
    
    console.log(`왕 피격! 남은 체력: ${gameState.kingHealth}`);
  }
  
  showText(x, y, text, color) {
    const textObj = this.add.text(x, y, text, {
      fontSize: '16px',
      fill: Phaser.Display.Color.IntegerToColor(color).rgba,
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    
    // 텍스트 애니메이션
    this.tweens.add({
      targets: textObj,
      y: y - 30,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => textObj.destroy()
    });
  }
  
  updateUI() {
    const gameState = window.KingsPlanetGame.gameState;
    
    // 콤보 텍스트 업데이트
    this.comboText.setText(`COMBO: ${gameState.currentCombo}`);
    
    // 콤보에 따른 색상 변화
    if (gameState.currentCombo >= 10) {
      this.comboText.setTint(0xff0000);
    } else if (gameState.currentCombo >= 5) {
      this.comboText.setTint(0xffaa00);
    } else {
      this.comboText.setTint(0xf1c40f);
    }
  }
  
  updatePrinceHealthUI() {
    const gameState = window.KingsPlanetGame.gameState;
    
    this.princeHealthIcons.forEach((heart, index) => {
      heart.setVisible(index < gameState.playerHealth);
    });
  }
  
  updateKingHealthUI() {
    const gameState = window.KingsPlanetGame.gameState;
    const healthPercent = gameState.kingHealth / 100;
    
    // 체력바 너비 조절
    this.kingHealthBar.width = 200 * healthPercent;
    
    // 페이즈별 색상 변화
    if (healthPercent > 0.6) {
      this.kingHealthBar.setTint(0xe74c3c);
    } else if (healthPercent > 0.2) {
      this.kingHealthBar.setTint(0xff8c00);
    } else {
      this.kingHealthBar.setTint(0x95a5a6);
    }
  }
  
  checkPhaseTransition() {
    const gameState = window.KingsPlanetGame.gameState;
    const healthPercent = gameState.kingHealth / 100;
    
    // 페이즈 2 전환 (60% 이하)
    if (gameState.currentPhase === 1 && healthPercent <= 0.6) {
      this.transitionToPhase2();
    }
    // 페이즈 3 전환 (20% 이하)
    else if (gameState.currentPhase === 2 && healthPercent <= 0.2) {
      this.transitionToPhase3();
    }
  }
  
  transitionToPhase2() {
    const gameState = window.KingsPlanetGame.gameState;
    gameState.currentPhase = 2;
    
    this.phaseText.setText('Phase 2: 분노하는 왕');
    this.phaseText.setTint(0xff6b6b);
    
    // 왕의 색상 변화
    this.king.setTint(0xff0000);
    
    console.log('Phase 2로 전환!');
  }
  
  transitionToPhase3() {
    const gameState = window.KingsPlanetGame.gameState;
    gameState.currentPhase = 3;
    
    this.phaseText.setText('Phase 3: 무력한 왕');
    this.phaseText.setTint(0x95a5a6);
    
    // 왕의 색상 변화
    this.king.setTint(0x95a5a6);
    
    console.log('Phase 3로 전환!');
  }
  
  checkGameEnd() {
    const gameState = window.KingsPlanetGame.gameState;
    
    // 승리 조건
    if (gameState.kingHealth <= 0) {
      window.KingsPlanetGame.utils.completeGame(true);
      this.scene.start('VictoryScene');
    }
    // 패배 조건
    else if (gameState.playerHealth <= 0) {
      window.KingsPlanetGame.utils.completeGame(false);
      this.scene.start('GameOverScene');
    }
  }
}

// 전역 스코프에서 접근 가능하도록 설정
window.GameScene = GameScene;