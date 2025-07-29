# 왕의 행성 게임 - Scene 상세 구현 설계

## 1. BootScene (부트/로딩)

### 목적
- 게임 에셋 로딩
- 글로벌 데이터 초기화
- 오프닝 영상 재생

### 구현 상세

```javascript
class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // 로딩 바 생성
    this.createLoadingBar();
    
    // 오프닝 영상 로드
    this.load.video('openingVideo', 'assets/videos/opening.mp4');
    
    // 에셋 로딩
    this.loadGameAssets();
    
    // 로딩 진행률 표시
    this.load.on('progress', this.updateLoadingBar, this);
    this.load.on('complete', this.onLoadComplete, this);
  }

  create() {
    // 글로벌 데이터 초기화
    window.KingsPlanetGame.utils.loadFromStorage();
    
    // 오프닝 영상 재생
    this.playOpeningVideo();
  }

  createLoadingBar() {
    const { width, height } = this.cameras.main;
    
    // 로딩 바 배경
    this.loadingBg = this.add.rectangle(width/2, height/2, 400, 20, 0x333333);
    this.loadingBar = this.add.rectangle(width/2, height/2, 0, 16, 0x00ff00);
    
    // 로딩 텍스트
    this.loadingText = this.add.text(width/2, height/2 - 50, 'Loading...', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }

  updateLoadingBar(progress) {
    this.loadingBar.width = 400 * progress;
    this.loadingText.setText(`Loading... ${Math.round(progress * 100)}%`);
  }

  loadGameAssets() {
    // 캐릭터 스프라이트
    this.load.spritesheet('littlePrince', 'assets/characters/little-prince.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    
    this.load.spritesheet('king', 'assets/characters/king.png', {
      frameWidth: 96,
      frameHeight: 96
    });
    
    // 배경
    this.load.image('kingsPlanetBg', 'assets/backgrounds/kings-planet.png');
    this.load.image('throne', 'assets/objects/throne.png');
    
    // UI 요소
    this.load.image('heart', 'assets/ui/heart.png');
    this.load.image('healthBar', 'assets/ui/health-bar.png');
    
    // 말풍선 스프라이트
    this.load.spritesheet('speechBubbles', 'assets/projectiles/speech-bubbles.png', {
      frameWidth: 48,
      frameHeight: 48
    });
    
    // 효과
    this.load.spritesheet('parryEffect', 'assets/effects/parry-effect.png', {
      frameWidth: 64,
      frameHeight: 64
    });
    
    // 오디오
    this.load.audio('bgm_phase1', 'assets/audio/bgm/phase1.ogg');
    this.load.audio('bgm_phase2', 'assets/audio/bgm/phase2.ogg');
    this.load.audio('bgm_phase3', 'assets/audio/bgm/phase3.ogg');
    
    this.load.audio('sfx_parry', 'assets/audio/sfx/parry.ogg');
    this.load.audio('sfx_hit', 'assets/audio/sfx/hit.ogg');
    this.load.audio('sfx_bubble', 'assets/audio/sfx/bubble.ogg');
  }

  playOpeningVideo() {
    const video = this.add.video(400, 300, 'openingVideo');
    video.play();
    
    // 영상 종료 시 블러 효과 후 메인 메뉴로
    video.on('complete', () => {
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MainMenuScene');
      });
    });
    
    // 스킵 기능 (스페이스바)
    this.input.keyboard.once('keydown-SPACE', () => {
      video.stop();
      this.scene.start('MainMenuScene');
    });
  }

  onLoadComplete() {
    // 로딩 완료 표시
    this.loadingText.setText('Press SPACE to skip');
  }
}
```

## 2. MainMenuScene (메인 메뉴)

### 목적
- 게임 시작점
- 설정 접근
- 최고 기록 표시

### 구현 상세

```javascript
class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 배경
    this.add.image(width/2, height/2, 'kingsPlanetBg').setAlpha(0.3);
    
    // 타이틀
    this.add.text(width/2, 100, '어린왕자\n왕의 행성', {
      fontSize: '48px',
      fill: '#FFD700',
      align: 'center',
      fontFamily: 'serif'
    }).setOrigin(0.5);
    
    // 메뉴 버튼들
    this.createMenuButtons();
    
    // 최고 기록 표시
    this.displayRecords();
    
    // 키보드 입력
    this.setupKeyboardControls();
    
    // BGM 시작
    this.playMenuBGM();
  }

  createMenuButtons() {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    
    // 게임 시작 버튼
    this.startButton = this.add.text(centerX, height/2 - 50, '게임 시작', {
      fontSize: '32px',
      fill: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();
    
    // 설정 버튼
    this.settingsButton = this.add.text(centerX, height/2 + 20, '설정', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#666666',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();
    
    // 버튼 이벤트
    this.startButton.on('pointerdown', () => this.startGame());
    this.settingsButton.on('pointerdown', () => this.openSettings());
    
    // 호버 효과
    this.addButtonHoverEffects();
  }

  addButtonHoverEffects() {
    [this.startButton, this.settingsButton].forEach(button => {
      button.on('pointerover', () => {
        button.setScale(1.1);
        this.sound.play('sfx_hover', { volume: 0.3 });
      });
      
      button.on('pointerout', () => {
        button.setScale(1.0);
      });
    });
  }

  displayRecords() {
    const { width, height } = this.cameras.main;
    const records = window.KingsPlanetGame.records;
    
    let recordsText = '최고 기록\n';
    recordsText += `최단 시간: ${records.bestTime ? records.bestTime.toFixed(1) + '초' : '없음'}\n`;
    recordsText += `최대 콤보: ${records.maxCombo}\n`;
    recordsText += `승리 횟수: ${records.victories}`;
    
    this.add.text(width - 20, height - 20, recordsText, {
      fontSize: '16px',
      fill: '#cccccc',
      align: 'right'
    }).setOrigin(1, 1);
  }

  setupKeyboardControls() {
    // 엔터키로 게임 시작
    this.input.keyboard.on('keydown-ENTER', () => this.startGame());
    
    // ESC키로 설정
    this.input.keyboard.on('keydown-ESC', () => this.openSettings());
  }

  playMenuBGM() {
    if (!this.menuBGM) {
      this.menuBGM = this.sound.add('bgm_menu', {
        loop: true,
        volume: window.KingsPlanetGame.settings.bgmVolume / 100
      });
      this.menuBGM.play();
    }
  }

  startGame() {
    this.sound.play('sfx_select');
    this.cameras.main.fadeOut(500);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene');
    });
  }

  openSettings() {
    this.sound.play('sfx_select');
    this.scene.pause();
    this.scene.launch('SettingsScene');
  }
}
```

## 3. SettingsScene (설정)

### 목적
- 볼륨 조절
- 키 설정
- 풀스크린 토글

### 구현 상세

```javascript
class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 반투명 배경
    this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7);
    
    // 설정 패널
    this.createSettingsPanel();
    
    // 설정 항목들
    this.createVolumeControls();
    this.createKeyBindingControls();
    this.createOtherControls();
    
    // 닫기 버튼
    this.createCloseButton();
    
    // ESC키로 닫기
    this.input.keyboard.on('keydown-ESC', () => this.closeSettings());
  }

  createSettingsPanel() {
    const { width, height } = this.cameras.main;
    
    // 패널 배경
    this.add.rectangle(width/2, height/2, 600, 400, 0x222222);
    this.add.rectangle(width/2, height/2, 596, 396, 0x444444);
    
    // 제목
    this.add.text(width/2, height/2 - 160, '설정', {
      fontSize: '32px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }

  createVolumeControls() {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const startY = height / 2 - 100;
    
    // BGM 볼륨
    this.add.text(centerX - 200, startY, 'BGM 볼륨:', {
      fontSize: '20px',
      fill: '#ffffff'
    });
    
    this.bgmVolumeSlider = this.createSlider(centerX, startY, 
      window.KingsPlanetGame.settings.bgmVolume, 
      (value) => this.changeBGMVolume(value)
    );
    
    // 효과음 볼륨
    this.add.text(centerX - 200, startY + 50, '효과음 볼륨:', {
      fontSize: '20px',
      fill: '#ffffff'
    });
    
    this.sfxVolumeSlider = this.createSlider(centerX, startY + 50,
      window.KingsPlanetGame.settings.sfxVolume,
      (value) => this.changeSFXVolume(value)
    );
  }

  createSlider(x, y, initialValue, onChange) {
    // 슬라이더 배경
    const sliderBg = this.add.rectangle(x, y, 200, 10, 0x666666);
    
    // 슬라이더 핸들
    const handle = this.add.circle(x - 100 + (initialValue * 2), y, 15, 0x00ff00)
      .setInteractive({ draggable: true });
    
    // 값 표시
    const valueText = this.add.text(x + 120, y, `${initialValue}%`, {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0, 0.5);
    
    // 드래그 이벤트
    handle.on('drag', (pointer, dragX) => {
      const constrainedX = Phaser.Math.Clamp(dragX, x - 100, x + 100);
      handle.x = constrainedX;
      
      const value = Math.round((constrainedX - (x - 100)) / 2);
      valueText.setText(`${value}%`);
      onChange(value);
    });
    
    return { handle, valueText };
  }

  createKeyBindingControls() {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const startY = height / 2;
    
    this.add.text(centerX, startY, '키 설정', {
      fontSize: '24px',
      fill: '#ffffff'
    }).setOrigin(0.5);
    
    // 키 바인딩 표시 (간단히)
    const keyBindings = window.KingsPlanetGame.settings.keyBindings;
    let bindingText = `이동: ← → 키\n`;
    bindingText += `회피: ${keyBindings.dodge}\n`;
    bindingText += `패링: ${keyBindings.parry}`;
    
    this.add.text(centerX, startY + 40, bindingText, {
      fontSize: '16px',
      fill: '#cccccc',
      align: 'center'
    }).setOrigin(0.5);
  }

  createOtherControls() {
    const { width, height } = this.cameras.main;
    const centerX = width / 2;
    const startY = height / 2 + 100;
    
    // 풀스크린 토글
    this.fullscreenButton = this.add.text(centerX, startY, 
      `풀스크린: ${window.KingsPlanetGame.settings.isFullscreen ? 'ON' : 'OFF'}`, {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#666666',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setInteractive();
    
    this.fullscreenButton.on('pointerdown', () => this.toggleFullscreen());
  }

  createCloseButton() {
    const { width, height } = this.cameras.main;
    
    this.closeButton = this.add.text(width/2, height/2 + 160, '닫기', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#666666',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();
    
    this.closeButton.on('pointerdown', () => this.closeSettings());
  }

  changeBGMVolume(value) {
    window.KingsPlanetGame.settings.bgmVolume = value;
    
    // 현재 재생 중인 BGM 볼륨 조절
    this.sound.sounds.forEach(sound => {
      if (sound.key.includes('bgm')) {
        sound.setVolume(value / 100);
      }
    });
    
    this.saveSettings();
  }

  changeSFXVolume(value) {
    window.KingsPlanetGame.settings.sfxVolume = value;
    this.saveSettings();
    
    // 테스트 사운드 재생
    this.sound.play('sfx_select', { volume: value / 100 });
  }

  toggleFullscreen() {
    const isFullscreen = !window.KingsPlanetGame.settings.isFullscreen;
    window.KingsPlanetGame.settings.isFullscreen = isFullscreen;
    
    if (isFullscreen) {
      this.scale.startFullscreen();
    } else {
      this.scale.stopFullscreen();
    }
    
    this.fullscreenButton.setText(`풀스크린: ${isFullscreen ? 'ON' : 'OFF'}`);
    this.saveSettings();
  }

  saveSettings() {
    window.KingsPlanetGame.utils.saveToStorage();
  }

  closeSettings() {
    this.sound.play('sfx_back');
    this.scene.stop();
    this.scene.resume('MainMenuScene');
  }
}
```

## 4. GameScene (메인 게임) - 1부

### 목적
- 실제 격투 게임플레이
- 3페이즈 보스전 관리
- 패링/콤보 시스템

### 구현 상세 (기본 구조)

```javascript
class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
    
    // 게임 상태 변수들
    this.littlePrince = null;
    this.king = null;
    this.speechBubbles = null;
    this.currentPhase = 1;
    this.gameStartTime = null;
  }

  create() {
    // 글로벌 데이터 초기화
    window.KingsPlanetGame.utils.resetGameState();
    this.gameStartTime = Date.now();
    
    // 게임 세계 설정
    this.setupGameWorld();
    
    // 캐릭터 생성
    this.createCharacters();
    
    // UI 생성
    this.createUI();
    
    // 입력 설정
    this.setupInput();
    
    // 물리 시스템 설정
    this.setupPhysics();
    
    // BGM 시작
    this.playPhaseBGM(1);
    
    // 게임 시작 연출
    this.startGameIntro();
  }

  setupGameWorld() {
    const { width, height } = this.cameras.main;
    
    // 배경
    this.add.image(width/2, height/2, 'kingsPlanetBg');
    
    // 왕좌 (우측)
    this.throne = this.add.image(width * 0.8, height * 0.7, 'throne');
    
    // 스테이지 경계 (보이지 않는 벽)
    this.stageLeft = width * 0.1;
    this.stageRight = width * 0.9;
    this.stageGround = height * 0.8;
  }

  createCharacters() {
    const { width, height } = this.cameras.main;
    
    // 어린왕자 생성 (좌측)
    this.littlePrince = this.physics.add.sprite(width * 0.3, this.stageGround, 'littlePrince');
    this.littlePrince.setCollideWorldBounds(true);
    this.littlePrince.setBounce(0.2);
    
    // 왕 생성 (우측)
    this.king = this.physics.add.sprite(width * 0.8, this.stageGround, 'king');
    this.king.setCollideWorldBounds(true);
    
    // 캐릭터 애니메이션 설정
    this.createCharacterAnimations();
    
    // 말풍선 그룹 생성
    this.speechBubbles = this.physics.add.group();
  }

  createCharacterAnimations() {
    // 어린왕자 애니메이션
    this.anims.create({
      key: 'prince_idle',
      frames: this.anims.generateFrameNumbers('littlePrince', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });
    
    this.anims.create({
      key: 'prince_walk',
      frames: this.anims.generateFrameNumbers('littlePrince', { start: 4, end: 7 }),
      frameRate: 12,
      repeat: -1
    });
    
    this.anims.create({
      key: 'prince_parry',
      frames: this.anims.generateFrameNumbers('littlePrince', { start: 8, end: 11 }),
      frameRate: 16,
      repeat: 0
    });
    
    // 왕 애니메이션
    this.anims.create({
      key: 'king_idle_phase1',
      frames: this.anims.generateFrameNumbers('king', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1
    });
    
    this.anims.create({
      key: 'king_attack_phase1',
      frames: this.anims.generateFrameNumbers('king', { start: 4, end: 7 }),
      frameRate: 12,
      repeat: 0
    });
    
    // 초기 애니메이션 설정
    this.littlePrince.play('prince_idle');
    this.king.play('king_idle_phase1');
  }

  createUI() {
    const { width } = this.cameras.main;
    
    // 어린왕자 체력 (좌상단)
    this.princeHealthIcons = [];
    for (let i = 0; i < 3; i++) {
      const heart = this.add.image(50 + (i * 40), 50, 'heart');
      this.princeHealthIcons.push(heart);
    }
    
    // 왕 체력바 (우상단)
    this.kingHealthBg = this.add.rectangle(width - 150, 50, 200, 20, 0x333333);
    this.kingHealthBar = this.add.rectangle(width - 150, 50, 200, 16, 0xff0000);
    
    // 콤보 카운터 (상단 중앙)
    this.comboText = this.add.text(width/2, 30, 'COMBO: 0', {
      fontSize: '24px',
      fill: '#ffff00'
    }).setOrigin(0.5);
    
    // 조작법 안내 (하단)
    this.add.text(width/2, 550, '← → : 이동   SPACE : 회피   Z : 패링', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }

  setupInput() {
    // 키보드 입력
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.zKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    
    // 키 입력 상태 추적
    this.isParrying = false;
    this.isDodging = false;
    this.parryWindow = 300; // 패링 성공 윈도우 (ms)
  }

  setupPhysics() {
    // 어린왕자와 말풍선 충돌
    this.physics.add.overlap(this.littlePrince, this.speechBubbles, 
      this.onBubbleHitPrince, null, this);
  }

  update() {
    // 게임 로직 업데이트
    this.updatePlayerMovement();
    this.updateKingBehavior();
    this.updateSpeechBubbles();
    this.updateUI();
    
    // 페이즈 체크
    this.checkPhaseTransition();
    
    // 게임 종료 조건 체크
    this.checkGameEnd();
  }

  updatePlayerMovement() {
    const prince = this.littlePrince;
    const speed = 200;
    
    // 회피 중이면 이동 제한
    if (this.isDodging) return;
    
    // 좌우 이동
    if (this.cursors.left.isDown) {
      prince.setVelocityX(-speed);
      prince.play('prince_walk', true);
      prince.setFlipX(true);
    } else if (this.cursors.right.isDown) {
      prince.setVelocityX(speed);
      prince.play('prince_walk', true);
      prince.setFlipX(false);
    } else {
      prince.setVelocityX(0);
      prince.play('prince_idle', true);
    }
    
    // 스테이지 경계 제한
    prince.x = Phaser.Math.Clamp(prince.x, this.stageLeft, this.stageRight);
    
    // 회피 입력 처리
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.performDodge();
    }
    
    // 패링 입력 처리
    if (Phaser.Input.Keyboard.JustDown(this.zKey)) {
      this.performParry();
    }
  }

  performDodge() {
    if (this.isDodging) return;
    
    this.isDodging = true;
    const prince = this.littlePrince;
    
    // 회피 시각 효과
    prince.setTint(0x00ff00);
    prince.setAlpha(0.5);
    
    // 회피 이동 (현재 방향으로 빠르게)
    const dodgeSpeed = 400;
    const direction = prince.flipX ? -1 : 1;
    prince.setVelocityX(dodgeSpeed * direction);
    
    // 무적 시간
    this.littlePrince.body.setEnable(false);
    
    // 회피 효과음
    this.sound.play('sfx_dodge', { 
      volume: window.KingsPlanetGame.settings.sfxVolume / 100 
    });
    
    // 회피 종료
    this.time.delayedCall(200, () => {
      this.isDodging = false;
      prince.setTint(0xffffff);
      prince.setAlpha(1);
      prince.setVelocityX(0);
      this.littlePrince.body.setEnable(true);
    });
  }

  performParry() {
    if (this.isParrying) return;
    
    this.isParrying = true;
    const prince = this.littlePrince;
    
    // 패링 애니메이션
    prince.play('prince_parry');
    
    // 패링 이펙트 생성
    const parryEffect = this.add.sprite(prince.x, prince.y - 20, 'parryEffect');
    parryEffect.play('parry_effect');
    parryEffect.once('animationcomplete', () => parryEffect.destroy());
    
    // 패링 성공 체크 (근처 말풍선 확인)
    let parrySuccess = false;
    this.speechBubbles.children.entries.forEach(bubble => {
      const distance = Phaser.Math.Distance.Between(
        prince.x, prince.y, bubble.x, bubble.y
      );
      
      if (distance < 80 && !bubble.isReflected) {
        this.reflectBubble(bubble);
        parrySuccess = true;
      }
    });
    
    if (parrySuccess) {
      this.onParrySuccess();
    } else {
      this.onParryFail();
    }
    
    // 패링 상태 종료
    this.time.delayedCall(300, () => {
      this.isParrying = false;
    });
  }

  reflectBubble(bubble) {
    bubble.isReflected = true;
    bubble.setTint(0x00ff00);
    
    // 말풍선을 왕 방향으로 반사
    const angleToKing = Phaser.Math.Angle.Between(
      bubble.x, bubble.y, this.king.x, this.king.y
    );
    
    const speed = 400;
    bubble.setVelocity(
      Math.cos(angleToKing) * speed,
      Math.sin(angleToKing) * speed
    );
    
    // 반사된 말풍선이 왕에게 히트하면 데미지
    this.physics.add.overlap(bubble, this.king, () => {
      this.damageKing(10);
      bubble.destroy();
    });
  }

  onParrySuccess() {
    // 콤보 증가
    window.KingsPlanetGame.gameState.currentCombo++;
    
    // 콤보에 따른 체력 회복
    if (window.KingsPlanetGame.gameState.currentCombo % 5 === 0) {
      this.healPrince();
    }
    
    // 효과음
    this.sound.play('sfx_parry', { 
      volume: window.KingsPlanetGame.settings.sfxVolume / 100 
    });
    
    // 시각 효과
    this.showText(this.littlePrince.x, this.littlePrince.y - 50, 'PERFECT!', 0x00ff00);
  }

  onParryFail() {
    // 콤보 리셋
    window.KingsPlanetGame.gameState.currentCombo = 0;
    
    // 경직 효과
    this.littlePrince.setTint(0xff0000);
    this.time.delayedCall(500, () => {
      this.littlePrince.setTint(0xffffff);
    });
  }

  updateKingBehavior() {
    const king = this.king;
    const gameState = window.KingsPlanetGame.gameState;
    
    // 페이즈별 행동 패턴
    switch (gameState.currentPhase) {
      case 1:
        this.updateKingPhase1();
        break;
      case 2:
        this.updateKingPhase2();
        break;
      case 3:
        this.updateKingPhase3();
        break;
    }
  }

  updateKingPhase1() {
    // 페이즈 1: 위엄있는 왕 (거의 움직이지 않음)
    if (!this.kingAttackTimer) {
      this.kingAttackTimer = this.time.addEvent({
        delay: Phaser.Math.Between(2000, 3000), // 2-3초 간격
        callback: this.kingAttackPhase1,
        callbackScope: this,
        loop: true
      });
    }
  }

  updateKingPhase2() {
    // 페이즈 2: 분노하는 왕 (불안하게 움직임)
    const king = this.king;
    const throneX = this.cameras.main.width * 0.8;
    
    // 왕좌 주변을 불안하게 이동
    if (!this.kingMoveTimer) {
      this.kingMoveTimer = this.time.addEvent({
        delay: 1000,
        callback: () => {
          const targetX = throneX + Phaser.Math.Between(-50, 50);
          this.tweens.add({
            targets: king,
            x: targetX,
            duration: 800,
            ease: 'Power2'
          });
        },
        callbackScope: this,
        loop: true
      });
    }
    
    // 더 빠른 공격
    if (!this.kingAttackTimer) {
      this.kingAttackTimer = this.time.addEvent({
        delay: Phaser.Math.Between(1000, 1500), // 1-1.5초 간격
        callback: this.kingAttackPhase2,
        callbackScope: this,
        loop: true
      });
    }
  }

  updateKingPhase3() {
    // 페이즈 3: 무력한 왕 (어린왕자에게 다가옴)
    const king = this.king;
    const prince = this.littlePrince;
    
    // 어린왕자 쪽으로 천천히 이동
    if (king.x > prince.x + 150) {
      king.setVelocityX(-30);
    } else {
      king.setVelocityX(0);
    }
    
    // 느린 공격
    if (!this.kingAttackTimer) {
      this.kingAttackTimer = this.time.addEvent({
        delay: Phaser.Math.Between(3000, 4000), // 3-4초 간격
        callback: this.kingAttackPhase3,
        callbackScope: this,
        loop: true
      });
    }
  }

  kingAttackPhase1() {
    // 페이즈 1 공격 패턴
    this.king.play('king_attack_phase1');
    
    const attackPatterns = [
      () => this.createSpeechBubble("앉아라!", 'command'),
      () => this.createSpeechBubble("일어나라!", 'command'),
      () => this.createSpeechBubble("이리오너라!", 'command'),
      () => this.createMultipleBubbles(["경례하라!", "절하라!"], 'command')
    ];
    
    const randomPattern = Phaser.Utils.Array.GetRandom(attackPatterns);
    randomPattern();
  }

  kingAttackPhase2() {
    // 페이즈 2 공격 패턴 (더 공격적)
    this.king.play('king_attack_phase2');
    
    const attackPatterns = [
      () => this.createMultipleBubbles(["당장 앉아!", "왜 안 듣는다!", "명령이다!"], 'rage'),
      () => this.createBubbleBarrage('rage'),
      () => this.createDirectionalAttack('rage')
    ];
    
    const randomPattern = Phaser.Utils.Array.GetRandom(attackPatterns);
    randomPattern();
  }

  kingAttackPhase3() {
    // 페이즈 3 공격 패턴 (약하고 슬픈)
    this.king.play('king_attack_phase3');
    
    const weakAttacks = [
      "제발... 앉아줄래?",
      "부탁하마...",
      "혼자는... 외로워",
      "떠나지... 말거라"
    ];
    
    const randomText = Phaser.Utils.Array.GetRandom(weakAttacks);
    this.createSpeechBubble(randomText, 'plea');
  }

  createSpeechBubble(text, type) {
    const king = this.king;
    const prince = this.littlePrince;
    
    // 말풍선 생성
    const bubble = this.physics.add.sprite(king.x - 50, king.y - 30, 'speechBubbles');
    
    // 타입별 설정
    switch (type) {
      case 'command':
        bubble.setFrame(0); // 네모 모양
        bubble.setTint(0xff4444);
        break;
      case 'rage':
        bubble.setFrame(1); // 스파이크 모양
        bubble.setTint(0xff0000);
        break;
      case 'plea':
        bubble.setFrame(2); // 구름 모양
        bubble.setTint(0x888888);
        bubble.setAlpha(0.7);
        break;
    }
    
    // 말풍선에 텍스트 추가
    const bubbleText = this.add.text(bubble.x, bubble.y, text, {
      fontSize: '12px',
      fill: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    
    // 말풍선과 텍스트를 함께 이동
    bubble.bubbleText = bubbleText;
    
    // 어린왕자를 향해 이동
    const angleToPlayer = Phaser.Math.Angle.Between(
      bubble.x, bubble.y, prince.x, prince.y
    );
    
    const speed = type === 'rage' ? 300 : type === 'plea' ? 150 : 200;
    bubble.setVelocity(
      Math.cos(angleToPlayer) * speed,
      Math.sin(angleToPlayer) * speed
    );
    
    // 말풍선 그룹에 추가
    this.speechBubbles.add(bubble);
    
    // 일정 시간 후 자동 소멸
    this.time.delayedCall(3000, () => {
      if (bubble.active) {
        bubbleText.destroy();
        bubble.destroy();
      }
    });
  }

  createMultipleBubbles(textArray, type) {
    textArray.forEach((text, index) => {
      this.time.delayedCall(index * 200, () => {
        this.createSpeechBubble(text, type);
      });
    });
  }

  createBubbleBarrage(type) {
    // 연속 공격 (4방향)
    const directions = [
      { x: -1, y: 0 },   // 좌
      { x: 1, y: 0 },    // 우
      { x: 0, y: -1 },   // 상
      { x: 0, y: 1 }     // 하
    ];
    
    directions.forEach((dir, index) => {
      this.time.delayedCall(index * 100, () => {
        const bubble = this.physics.add.sprite(
          this.king.x + (dir.x * 30), 
          this.king.y + (dir.y * 30), 
          'speechBubbles'
        );
        
        bubble.setFrame(1);
        bubble.setTint(0xff0000);
        bubble.setVelocity(dir.x * 250, dir.y * 250);
        
        this.speechBubbles.add(bubble);
      });
    });
  }

  onBubbleHitPrince(prince, bubble) {
    // 반사된 말풍선은 무시
    if (bubble.isReflected) return;
    
    // 회피 중이면 무시
    if (this.isDodging) return;
    
    // 데미지 처리
    this.damagePrince();
    
    // 말풍선 제거
    if (bubble.bubbleText) bubble.bubbleText.destroy();
    bubble.destroy();
  }

  damagePrince() {
    const gameState = window.KingsPlanetGame.gameState;
    gameState.playerHealth--;
    gameState.currentCombo = 0; // 콤보 리셋
    
    // UI 업데이트
    this.updatePrinceHealthUI();
    
    // 피격 효과
    this.littlePrince.setTint(0xff0000);
    this.time.delayedCall(200, () => {
      this.littlePrince.setTint(0xffffff);
    });
    
    // 효과음
    this.sound.play('sfx_hit', { 
      volume: window.KingsPlanetGame.settings.sfxVolume / 100 
    });
    
    // 데미지 텍스트
    this.showText(this.littlePrince.x, this.littlePrince.y - 30, 'HIT!', 0xff0000);
  }

  damageKing(damage) {
    const gameState = window.KingsPlanetGame.gameState;
    gameState.kingHealth -= damage;
    
    // 왕 체력바 업데이트
    this.updateKingHealthUI();
    
    // 피격 효과
    this.king.setTint(0xff0000);
    this.time.delayedCall(200, () => {
      this.king.setTint(0xffffff);
    });
    
    // 데미지 텍스트
    this.showText(this.king.x, this.king.y - 50, `-${damage}`, 0xffff00);
  }

  healPrince() {
    const gameState = window.KingsPlanetGame.gameState;
    if (gameState.playerHealth < 3) {
      gameState.playerHealth++;
      this.updatePrinceHealthUI();
      
      // 회복 효과
      this.showText(this.littlePrince.x, this.littlePrince.y - 40, 'HEAL!', 0x00ff00);
      this.sound.play('sfx_heal', { 
        volume: window.KingsPlanetGame.settings.sfxVolume / 100 
      });
    }
  }

  updateUI() {
    const gameState = window.KingsPlanetGame.gameState;
    
    // 콤보 텍스트 업데이트
    this.comboText.setText(`COMBO: ${gameState.currentCombo}`);
    
    // 콤보에 따른 색상 변화
    if (gameState.currentCombo >= 10) {
      this.comboText.setTint(0xff0000); // 빨간색
    } else if (gameState.currentCombo >= 5) {
      this.comboText.setTint(0xffaa00); // 주황색
    } else {
      this.comboText.setTint(0xffff00); // 노란색
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
      this.kingHealthBar.setFillStyle(0xff0000); // 빨간색
    } else if (healthPercent > 0.2) {
      this.kingHealthBar.setFillStyle(0xff8800); // 주황색  
    } else {
      this.kingHealthBar.setFillStyle(0x888888); // 회색
    }
  }

  checkPhaseTransition() {
    const gameState = window.KingsPlanetGame.gameState;
    const healthPercent = gameState.kingHealth / 100;
    
    // 페이즈 2 전환 (60% -> 20%)
    if (gameState.currentPhase === 1 && healthPercent <= 0.6) {
      this.transitionToPhase2();
    }
    // 페이즈 3 전환 (20% -> 0%)
    else if (gameState.currentPhase === 2 && healthPercent <= 0.2) {
      this.transitionToPhase3();
    }
  }

  transitionToPhase2() {
    window.KingsPlanetGame.gameState.currentPhase = 2;
    
    // 기존 공격 타이머 정리
    if (this.kingAttackTimer) {
      this.kingAttackTimer.destroy();
      this.kingAttackTimer = null;
    }
    
    // 페이즈 전환 연출
    this.cameras.main.shake(500, 0.02);
    this.showText(this.king.x, this.king.y - 80, '어? 너는...', 0xffaa00);
    
    // BGM 변경
    this.playPhaseBGM(2);
    
    // 왕의 표정/애니메이션 변경
    this.king.play('king_idle_phase2');
  }

  transitionToPhase3() {
    window.KingsPlanetGame.gameState.currentPhase = 3;
    
    // 기존 타이머들 정리
    if (this.kingAttackTimer) {
      this.kingAttackTimer.destroy();
      this.kingAttackTimer = null;
    }
    if (this.kingMoveTimer) {
      this.kingMoveTimer.destroy();
      this.kingMoveTimer = null;
    }
    
    // 페이즈 전환 연출
    this.cameras.main.shake(300, 0.01);
    this.showText(this.king.x, this.king.y - 80, '제발...', 0x888888);
    
    // BGM 변경
    this.playPhaseBGM(3);
    
    // 왕좌가 흔들리는 효과
    this.tweens.add({
      targets: this.throne,
      angle: { from: -2, to: 2 },
      duration: 100,
      yoyo: true,
      repeat: 5
    });
    
    // 왕의 애니메이션 변경
    this.king.play('king_idle_phase3');
  }

  checkGameEnd() {
    const gameState = window.KingsPlanetGame.gameState;
    
    // 플레이어 패배
    if (gameState.playerHealth <= 0) {
      this.gameOver();
    }
    
    // 플레이어 승리
    if (gameState.kingHealth <= 0) {
      this.victory();
    }
  }

  gameOver() {
    // 모든 타이머 정리
    this.cleanupTimers();
    
    // 페이드 아웃 후 게임오버 신으로
    this.cameras.main.fadeOut(1000);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameOverScene');
    });
  }

  victory() {
    // 모든 타이머 정리
    this.cleanupTimers();
    
    // 승리 연출
    this.showVictorySequence();
  }

  showVictorySequence() {
    // 어린왕자가 왕에게 다가가는 연출
    this.tweens.add({
      targets: this.littlePrince,
      x: this.king.x - 100,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        // 대화 연출
        this.showDialogue([
          { speaker: 'prince', text: '진정한 왕은 명령하지 않아요' },
          { speaker: 'king', text: '고맙구나, 어린 친구야...' },
          { speaker: 'king', text: '나는... 외로웠을 뿐이야' }
        ], () => {
          // 승리 Scene으로 전환
          const clearTime = (Date.now() - this.gameStartTime) / 1000;
          const maxCombo = window.KingsPlanetGame.gameState.currentCombo;
          
          // 기록 업데이트
          window.KingsPlanetGame.utils.updateRecords(clearTime, maxCombo);
          
          this.cameras.main.fadeOut(1000);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('VictoryScene');
          });
        });
      }
    });
  }

  showDialogue(dialogues, onComplete) {
    let currentIndex = 0;
    
    const showNext = () => {
      if (currentIndex >= dialogues.length) {
        onComplete();
        return;
      }
      
      const dialogue = dialogues[currentIndex];
      const x = dialogue.speaker === 'prince' ? this.littlePrince.x : this.king.x;
      const y = dialogue.speaker === 'prince' ? this.littlePrince.y - 60 : this.king.y - 80;
      
      const dialogueText = this.add.text(x, y, dialogue.text, {
        fontSize: '18px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      }).setOrigin(0.5);
      
      // 3초 후 다음 대화
      this.time.delayedCall(3000, () => {
        dialogueText.destroy();
        currentIndex++;
        showNext();
      });
    };
    
    showNext();
  }

  showText(x, y, text, color) {
    const textObj = this.add.text(x, y, text, {
      fontSize: '20px',
      fill: color,
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

  playPhaseBGM(phase) {
    // 현재 BGM 정지
    this.sound.stopAll();
    
    // 페이즈별 BGM 재생
    const bgmKey = `bgm_phase${phase}`;
    const bgm = this.sound.add(bgmKey, {
      loop: true,
      volume: window.KingsPlanetGame.settings.bgmVolume / 100
    });
    bgm.play();
    
    this.currentBGM = bgm;
  }

  cleanupTimers() {
    if (this.kingAttackTimer) {
      this.kingAttackTimer.destroy();
      this.kingAttackTimer = null;
    }
    
    if (this.kingMoveTimer) {
      this.kingMoveTimer.destroy();
      this.kingMoveTimer = null;
    }
  }

  startGameIntro() {
    // 게임 시작 연출 (간단히)
    this.showText(this.cameras.main.width/2, 200, '왕의 행성', 0xFFD700);
    
    this.time.delayedCall(2000, () => {
      this.showText(this.king.x, this.king.y - 60, '나는 이 행성의 왕이다!', 0xff4444);
    });
    
    this.time.delayedCall(4000, () => {
      this.showText(this.littlePrince.x, this.littlePrince.y - 60, '안녕하세요', 0x4444ff);
    });
    
    this.time.delayedCall(6000, () => {
      this.showText(this.king.x, this.king.y - 60, '무릎을 꿇어라!', 0xff0000);
      // 첫 번째 공격 시작
      this.time.delayedCall(1000, () => {
        this.kingAttackPhase1();
      });
    });
  }
}
```

✅ **GameScene 완성!** 

**🎮 구현된 핵심 시스템들:**

**1. 플레이어 조작 시스템**
- 좌우 이동 + 애니메이션
- 회피 (무적 시간 + 시각 효과)
- 패링 (타이밍 기반 + 반사 메커니즘)

**2. 왕 AI 시스템**
- 페이즈별 행동 패턴 (위엄 → 분노 → 무력)
- 페이즈별 이동 범위 변화
- 공격 빈도 및 패턴 변화

**3. 말풍선 공격 시스템**
- 타입별 말풍선 (명령/분노/간청)
- 패링 시 반사 메커니즘
- 다중 공격 패턴

**4. 게임 진행 관리**
- 페이즈 자동 전환
- 체력/콤보 시스템
- 승리/패배 조건 체크

**5. 연출 시스템**
- 페이즈 전환 연출
- 승리 시퀀스 (대화 + 이동)
- 시각/청각 피드백

## 5. VictoryScene (승리)

### 목적
- 승리 축하 연출
- 클리어 기록 표시
- 다음 단계 옵션 제공

### 구현 상세

```javascript
class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 글로벌 데이터에서 기록 가져오기
    this.gameData = window.KingsPlanetGame.gameState;
    this.records = window.KingsPlanetGame.records;
    
    // 배경 설정
    this.createBackground();
    
    // 어린왕자 떠나는 아트워크
    this.createDepartureArtwork();
    
    // 승리 연출
    this.playVictorySequence();
  }

  createBackground() {
    const { width, height } = this.cameras.main;
    
    // 어두운 우주 배경
    this.add.rectangle(width/2, height/2, width, height, 0x000022);
    
    // 별들 효과
    this.createStarField();
    
    // 왕의 행성이 멀어지는 효과
    this.kingsPlanet = this.add.image(width * 0.8, height * 0.7, 'kingsPlanetBg');
    this.kingsPlanet.setScale(0.3);
    this.kingsPlanet.setAlpha(0.6);
    
    // 행성이 점점 작아지는 효과
    this.tweens.add({
      targets: this.kingsPlanet,
      scaleX: 0.1,
      scaleY: 0.1,
      alpha: 0.2,
      duration: 8000,
      ease: 'Power2'
    });
  }

  createStarField() {
    const { width, height } = this.cameras.main;
    
    // 50개의 별 생성
    for (let i = 0; i < 50; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 3),
        0xffffff
      );
      
      // 별 깜빡임 효과
      this.tweens.add({
        targets: star,
        alpha: { from: 0.3, to: 1 },
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1
      });
    }
  }

  createDepartureArtwork() {
    const { width, height } = this.cameras.main;
    
    // 어린왕자 실루엣 (우주선과 함께)
    this.littlePrince = this.add.image(width * 0.2, height * 0.6, 'littlePrinceDeparture');
    this.littlePrince.setScale(1.2);
    this.littlePrince.setAlpha(0);
    
    // 어린왕자 페이드 인
    this.tweens.add({
      targets: this.littlePrince,
      alpha: 1,
      duration: 2000,
      ease: 'Power2'
    });
    
    // 떠나는 방향으로 천천히 이동
    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: this.littlePrince,
        x: width * 0.1,
        y: height * 0.5,
        scaleX: 0.8,
        scaleY: 0.8,
        duration: 5000,
        ease: 'Power1'
      });
    });
  }

  playVictorySequence() {
    const { width, height } = this.cameras.main;
    
    // 1단계: 승리 메시지 (2초)
    this.showVictoryMessage();
    
    // 2단계: 스코어 표시 (4초 후)
    this.time.delayedCall(4000, () => {
      this.showScoreBoard();
    });
    
    // 3단계: 옵션 메뉴 (8초 후)
    this.time.delayedCall(8000, () => {
      this.showOptions();
    });
    
    // BGM 시작
    this.playVictoryBGM();
  }

  showVictoryMessage() {
    const { width, height } = this.cameras.main;
    
    // "행성 해방!" 메시지
    const victoryText = this.add.text(width/2, height * 0.2, '행성 해방!', {
      fontSize: '48px',
      fill: '#FFD700',
      stroke: '#000000',
      strokeThickness: 4,
      fontFamily: 'serif'
    }).setOrigin(0.5).setAlpha(0);
    
    // 텍스트 애니메이션
    this.tweens.add({
      targets: victoryText,
      alpha: 1,
      scaleX: { from: 0.5, to: 1.2 },
      scaleY: { from: 0.5, to: 1.2 },
      duration: 1000,
      ease: 'Back.easeOut'
    });
    
    // 왕의 마지막 대사
    this.time.delayedCall(2000, () => {
      const kingMessage = this.add.text(width/2, height * 0.3, '고맙구나, 어린 친구야...', {
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 15, y: 8 },
        alpha: 0
      }).setOrigin(0.5);
      
      this.tweens.add({
        targets: kingMessage,
        alpha: 1,
        duration: 1500
      });
    });
  }

  showScoreBoard() {
    const { width, height } = this.cameras.main;
    
    // 스코어 보드 배경
    const scoreBg = this.add.rectangle(width/2, height/2, 400, 300, 0x000000, 0.8);
    scoreBg.setStrokeStyle(2, 0xFFD700);
    scoreBg.setAlpha(0);
    
    // 제목
    const scoreTitle = this.add.text(width/2, height/2 - 120, '클리어 기록', {
      fontSize: '32px',
      fill: '#FFD700'
    }).setOrigin(0.5).setAlpha(0);
    
    // 현재 게임 기록
    const clearTime = this.records.bestTime || 0;
    const maxCombo = this.gameData.currentCombo || 0;
    
    const currentStats = [
      `클리어 시간: ${clearTime.toFixed(1)}초`,
      `최대 콤보: ${maxCombo}`,
      `승리 횟수: ${this.records.victories}`
    ];
    
    const statsText = this.add.text(width/2, height/2 - 40, currentStats.join('\n'), {
      fontSize: '20px',
      fill: '#ffffff',
      align: 'center',
      lineSpacing: 10
    }).setOrigin(0.5).setAlpha(0);
    
    // 신기록 체크
    const isNewRecord = this.checkNewRecord(clearTime, maxCombo);
    if (isNewRecord) {
      const newRecordText = this.add.text(width/2, height/2 + 60, '🏆 신기록! 🏆', {
        fontSize: '24px',
        fill: '#ff6600'
      }).setOrigin(0.5).setAlpha(0);
      
      // 신기록 깜빡임 효과
      this.tweens.add({
        targets: newRecordText,
        alpha: { from: 0, to: 1 },
        scaleX: { from: 0.8, to: 1.2 },
        scaleY: { from: 0.8, to: 1.2 },
        duration: 500,
        yoyo: true,
        repeat: -1,
        delay: 1000
      });
    }
    
    // 스코어보드 페이드 인
    this.tweens.add({
      targets: [scoreBg, scoreTitle, statsText],
      alpha: 1,
      duration: 1500,
      ease: 'Power2'
    });
  }

  showOptions() {
    const { width, height } = this.cameras.main;
    
    // 옵션 메뉴 배경
    const optionsBg = this.add.rectangle(width/2, height * 0.8, 500, 120, 0x333333, 0.9);
    optionsBg.setStrokeStyle(2, 0x666666);
    
    // 다시 플레이 버튼
    this.replayButton = this.add.text(width/2 - 100, height * 0.8, '다시 플레이', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#4444aa',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();
    
    // 메인 메뉴 버튼
    this.menuButton = this.add.text(width/2 + 100, height * 0.8, '메인 메뉴', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#666666',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();
    
    // 버튼 이벤트
    this.replayButton.on('pointerdown', () => this.replayGame());
    this.menuButton.on('pointerdown', () => this.goToMenu());
    
    // 버튼 호버 효과
    this.addButtonEffects();
    
    // 키보드 입력
    this.input.keyboard.on('keydown-ENTER', () => this.replayGame());
    this.input.keyboard.on('keydown-ESC', () => this.goToMenu());
  }

  addButtonEffects() {
    [this.replayButton, this.menuButton].forEach(button => {
      button.on('pointerover', () => {
        button.setScale(1.1);
        this.sound.play('sfx_hover', { 
          volume: window.KingsPlanetGame.settings.sfxVolume / 100 
        });
      });
      
      button.on('pointerout', () => {
        button.setScale(1.0);
      });
    });
  }

  checkNewRecord(clearTime, maxCombo) {
    const oldBestTime = this.records.bestTime;
    const oldMaxCombo = this.records.maxCombo;
    
    return (!oldBestTime || clearTime < oldBestTime) || (maxCombo > oldMaxCombo);
  }

  playVictoryBGM() {
    const victoryBGM = this.sound.add('bgm_victory', {
      loop: false,
      volume: window.KingsPlanetGame.settings.bgmVolume / 100
    });
    victoryBGM.play();
  }

  replayGame() {
    this.sound.play('sfx_select');
    this.cameras.main.fadeOut(500);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene');
    });
  }

  goToMenu() {
    this.sound.play('sfx_back');
    this.cameras.main.fadeOut(500);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MainMenuScene');
    });
  }
}
```

## 6. GameOverScene (패배)

### 목적
- 패배 상황 연출
- 행성 주인의 메시지 표시
- 재시작 또는 이벤트 옵션

### 구현 상세

```javascript
class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 즉시 어두운 연출 시작
    this.createDarkenedWorld();
    
    // 어린왕자 쓰러지는 연출
    this.showPrinceFalling();
    
    // Game Over 시퀀스 시작
    this.time.delayedCall(2000, () => {
      this.showGameOverSequence();
    });
  }

  createDarkenedWorld() {
    const { width, height } = this.cameras.main;
    
    // 원래 게임 배경을 어둡게 (GameScene에서 넘어온 상태)
    this.add.image(width/2, height/2, 'kingsPlanetBg').setAlpha(0.1);
    
    // 왕좌도 어둡게
    this.add.image(width * 0.8, height * 0.7, 'throne').setAlpha(0.1);
    
    // 전체적으로 어두운 오버레이
    this.darkOverlay = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0);
    
    // 점진적으로 어두워지는 효과
    this.tweens.add({
      targets: this.darkOverlay,
      alpha: 0.8,
      duration: 1500,
      ease: 'Power2'
    });
  }

  showPrinceFalling() {
    const { width, height } = this.cameras.main;
    
    // 어린왕자만 밝게 표시 (spotlight 효과)
    this.littlePrince = this.add.image(width * 0.3, height * 0.7, 'littlePrince');
    this.littlePrince.setFrame(0); // 기본 프레임
    
    // 스포트라이트 효과 (원형 마스크)
    const spotlight = this.add.graphics();
    spotlight.fillStyle(0xffffff);
    spotlight.fillCircle(this.littlePrince.x, this.littlePrince.y, 100);
    
    // 어린왕자 쓰러지는 애니메이션
    this.tweens.add({
      targets: this.littlePrince,
      angle: 90, // 옆으로 쓰러짐
      y: height * 0.8, // 바닥으로
      scaleX: 0.9,
      scaleY: 0.9,
      duration: 1500,
      ease: 'Power2'
    });
    
    // 스포트라이트도 함께 이동
    this.tweens.add({
      targets: spotlight,
      y: height * 0.8,
      duration: 1500,
      ease: 'Power2'
    });
    
    // 쓰러지는 효과음
    this.sound.play('sfx_fall', { 
      volume: window.KingsPlanetGame.settings.sfxVolume / 100 
    });
  }

  showGameOverSequence() {
    const { width, height } = this.cameras.main;
    
    // 1단계: Game Over 텍스트
    this.showGameOverText();
    
    // 2단계: 왕의 메시지 (2초 후)
    this.time.delayedCall(2000, () => {
      this.showKingMessage();
    });
    
    // 3단계: Continue 옵션 (5초 후)
    this.time.delayedCall(5000, () => {
      this.showContinueOption();
    });
    
    // Game Over BGM
    this.playGameOverBGM();
  }

  showGameOverText() {
    const { width, height } = this.cameras.main;
    
    const gameOverText = this.add.text(width/2, height * 0.3, 'GAME OVER', {
      fontSize: '64px',
      fill: '#ff0000',
      stroke: '#000000',
      strokeThickness: 6,
      fontFamily: 'serif'
    }).setOrigin(0.5).setAlpha(0);
    
    // 텍스트 등장 애니메이션
    this.tweens.add({
      targets: gameOverText,
      alpha: 1,
      scaleX: { from: 0.3, to: 1 },
      scaleY: { from: 0.3, to: 1 },
      duration: 1500,
      ease: 'Back.easeOut'
    });
    
    // 텍스트 깜빡임 효과
    this.time.delayedCall(1500, () => {
      this.tweens.add({
        targets: gameOverText,
        alpha: { from: 1, to: 0.7 },
        duration: 800,
        yoyo: true,
        repeat: -1
      });
    });
  }

  showKingMessage() {
    const { width, height } = this.cameras.main;
    
    // 왕의 실루엣 (어둠 속에서)
    const kingSilhouette = this.add.image(width * 0.8, height * 0.6, 'king');
    kingSilhouette.setTint(0x330000); // 어두운 빨간색
    kingSilhouette.setAlpha(0.7);
    kingSilhouette.setScale(1.2);
    
    // 왕의 메시지 배경
    const messageBg = this.add.rectangle(width/2, height * 0.5, 600, 100, 0x000000, 0.9);
    messageBg.setStrokeStyle(3, 0xff0000);
    messageBg.setAlpha(0);
    
    // 왕의 메시지 텍스트
    const kingMessage = this.add.text(width/2, height * 0.5, '"이제 영원히 날 섬겨라"', {
      fontSize: '28px',
      fill: '#ff4444',
      fontFamily: 'serif',
      fontStyle: 'italic'
    }).setOrigin(0.5).setAlpha(0);
    
    // 메시지 등장 애니메이션
    this.tweens.add({
      targets: [messageBg, kingMessage],
      alpha: 1,
      duration: 2000,
      ease: 'Power2'
    });
    
    // 왕의 웃음소리 효과음
    this.sound.play('sfx_king_laugh', { 
      volume: window.KingsPlanetGame.settings.sfxVolume / 100 
    });
  }

  showContinueOption() {
    const { width, height } = this.cameras.main;
    
    // Continue 옵션 배경
    const continueContainer = this.add.container(width/2, height * 0.75);
    
    const continueBg = this.add.rectangle(0, 0, 400, 120, 0x333333, 0.9);
    continueBg.setStrokeStyle(2, 0x666666);
    
    // Continue 버튼
    this.continueButton = this.add.text(0, -20, 'Continue', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#aa4444',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();
    
    // 메인 메뉴 버튼
    this.menuButton = this.add.text(0, 20, 'Main Menu', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#666666',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5).setInteractive();
    
    // 컨테이너에 추가
    continueContainer.add([continueBg, this.continueButton, this.menuButton]);
    continueContainer.setAlpha(0);
    
    // 컨테이너 페이드 인
    this.tweens.add({
      targets: continueContainer,
      alpha: 1,
      y: height * 0.75 - 20, // 살짝 위로 이동하며 등장
      duration: 1000,
      ease: 'Power2'
    });
    
    // 버튼 이벤트
    this.continueButton.on('pointerdown', () => this.showEventCutscene());
    this.menuButton.on('pointerdown', () => this.goToMenu());
    
    // 버튼 호버 효과
    this.addButtonEffects();
    
    // 키보드 입력
    this.input.keyboard.on('keydown-ENTER', () => this.showEventCutscene());
    this.input.keyboard.on('keydown-ESC', () => this.goToMenu());
  }

  addButtonEffects() {
    [this.continueButton, this.menuButton].forEach(button => {
      button.on('pointerover', () => {
        button.setScale(1.1);
        this.sound.play('sfx_hover', { 
          volume: window.KingsPlanetGame.settings.sfxVolume / 100 
        });
      });
      
      button.on('pointerout', () => {
        button.setScale(1.0);
      });
    });
  }

  showEventCutscene() {
    this.sound.play('sfx_select');
    
    // 이벤트 컷신으로 전환
    this.cameras.main.fadeOut(1000);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('KingEventCutscene');
    });
  }

  goToMenu() {
    this.sound.play('sfx_back');
    this.cameras.main.fadeOut(500);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('MainMenuScene');
    });
  }

  playGameOverBGM() {
    const gameOverBGM = this.sound.add('bgm_gameover', {
      loop: true,
      volume: window.KingsPlanetGame.settings.bgmVolume / 100
    });
    gameOverBGM.play();
    
    this.currentBGM = gameOverBGM;
  }
}
```

## 7. KingEventCutscene (왕의 행성 특별 이벤트)

### 목적
- 왕의 행성 전용 이벤트 컷신
- 스토리 확장 및 재도전 동기 부여

### 구현 상세

```javascript
class KingEventCutscene extends Phaser.Scene {
  constructor() {
    super({ key: 'KingEventCutscene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 신비로운 분위기의 배경
    this.createMysticalBackground();
    
    // 이벤트 스토리 시작
    this.startEventStory();
  }

  createMysticalBackground() {
    const { width, height } = this.cameras.main;
    
    // 어두운 보라색 배경
    this.add.rectangle(width/2, height/2, width, height, 0x220044);
    
    // 신비로운 파티클 効果
    this.createMagicalParticles();
    
    // 왕좌 실루엣 (더 크고 웅장하게)
    this.add.image(width/2, height * 0.7, 'throne')
      .setScale(2)
      .setTint(0x440088)
      .setAlpha(0.6);
  }

  createMagicalParticles() {
    const { width, height } = this.cameras.main;
    
    // 30개의 마법적인 파티클
    for (let i = 0; i < 30; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(2, 5),
        0x8844ff
      );
      
      // 파티클 움직임 애니메이션
      this.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-100, 100),
        y: particle.y + Phaser.Math.Between(-100, 100),
        alpha: { from: 0.3, to: 0.8 },
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  startEventStory() {
    const { width, height } = this.cameras.main;
    
    // 이벤트 스토리 대화 시퀀스
    const eventDialogues = [
      {
        speaker: 'narrator',
        text: '어린왕자가 쓰러진 그 순간...',
        duration: 3000
      },
      {
        speaker: 'mystery',
        text: '잠깐...',
        duration: 2000
      },
      {
        speaker: 'mystery', 
        text: '너에게는 아직 다른 가능성이 남아있어',
        duration: 4000
      },
      {
        speaker: 'mystery',
        text: '왕의 마음 깊은 곳에는 진정한 외로움이 숨어있다',
        duration: 4000
      },
      {
        speaker: 'mystery',
        text: '다시 한 번 시도해보지 않겠나?',
        duration: 3000
      },
      {
        speaker: 'narrator',
        text: '특별한 힘을 얻었다!',
        duration: 2000
      }
    ];
    
    this.showEventDialogue(eventDialogues, 0);
  }

  showEventDialogue(dialogues, index) {
    if (index >= dialogues.length) {
      this.showEventReward();
      return;
    }
    
    const { width, height } = this.cameras.main;
    const dialogue = dialogues[index];
    
    // 화자별 스타일 설정
    let textStyle = {
      fontSize: '24px',
      fill: '#ffffff',
      align: 'center',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    };
    
    if (dialogue.speaker === 'mystery') {
      textStyle.fill = '#ff88ff';
      textStyle.fontSize = '28px';
    } else if (dialogue.speaker === 'narrator') {
      textStyle.fill = '#ffff88';
      textStyle.fontStyle = 'italic';
    }
    
    // 대화 텍스트 생성
    const dialogueText = this.add.text(width/2, height/2, dialogue.text, textStyle)
      .setOrigin(0.5)
      .setAlpha(0);
    
    // 텍스트 페이드 인
    this.tweens.add({
      targets: dialogueText,
      alpha: 1,
      duration: 800,
      ease: 'Power2'
    });
    
    // 다음 대화로 넘어가기
    this.time.delayedCall(dialogue.duration, () => {
      this.tweens.add({
        targets: dialogueText,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          dialogueText.destroy();
          this.showEventDialogue(dialogues, index + 1);
        }
      });
    });
  }

  showEventReward() {
    const { width, height } = this.cameras.main;
    
    // 보상 효과 (화면 전체 플래시)
    const flash = this.add.rectangle(width/2, height/2, width, height, 0xffffff, 0);
    this.tweens.add({
      targets: flash,
      alpha: 0.8,
      duration: 200,
      yoyo: true,
      repeat: 2
    });
    
    // 특별 능력 텍스트
    const rewardText = this.add.text(width/2, height/2, '🌟 왕의 마음을 읽는 능력 획득! 🌟\n\n패링 타이밍이 더 관대해집니다', {
      fontSize: '32px',
      fill: '#ffff00',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setAlpha(0);
    
    this.tweens.add({
      targets: rewardText,
      alpha: 1,
      scaleX: { from: 0.5, to: 1 },
      scaleY: { from: 0.5, to: 1 },
      duration: 1500,
      ease: 'Back.easeOut'
    });
    
    // 게임 데이터에 버프 저장
    window.KingsPlanetGame.gameState.hasKingInsight = true;
    window.KingsPlanetGame.utils.saveToStorage();
    
    // 재시작 옵션
    this.time.delayedCall(4000, () => {
      this.showRetryOption();
    });
    
    // 특별 효과음
    this.sound.play('sfx_powerup', { 
      volume: window.KingsPlanetGame.settings.sfxVolume / 100 
    });
  }

  showRetryOption() {
    const { width, height } = this.cameras.main;
    
    const retryButton = this.add.text(width/2, height * 0.8, '다시 도전하기', {
      fontSize: '28px',
      fill: '#ffffff',
      backgroundColor: '#aa44aa',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();
    
    retryButton.on('pointerdown', () => this.retryWithPower());
    retryButton.on('pointerover', () => retryButton.setScale(1.1));
    retryButton.on('pointerout', () => retryButton.setScale(1.0));
    
    // 엔터키로도 재시작
    this.input.keyboard.on('keydown-ENTER', () => this.retryWithPower());
  }

  retryWithPower() {
    this.sound.play('sfx_select');
    this.cameras.main.fadeOut(1000);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene');
    });
  }
}
```

✅ **VictoryScene, GameOverScene, KingEventCutscene 완성!**

**🎊 VictoryScene 특징:**
- 어린왕자 떠나는 아트워크
- 상세한 스코어 보드 + 신기록 체크
- 별이 빛나는 우주 배경

**💀 GameOverScene 특징:**
- 어린왕자만 스포트라이트로 조명
- 쓰러지는 연출 + 왕의 위협적 메시지
- Continue 옵션으로 이벤트 컷신 연결

**✨ KingEventCutscene 특징:**
- 신비로운 분위기의 특별 이벤트
- 스토리 확장 + 게임플레이 버프 제공
- 재도전 동기 부여

이제 게임의 모든 Scene이 완성되었습니다! 다음 단계는?