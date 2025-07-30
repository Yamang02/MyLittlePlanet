export default class MainMenuScene extends Phaser.Scene {
  constructor(dependencies = {}) {
    super({ key: 'MainMenuScene' });
    
    // 의존성 주입
    this.gameStateManager = dependencies.gameStateManager;
    this.recordsManager = dependencies.recordsManager;
    this.settingsManager = dependencies.settingsManager;
  }
  
  create() {
    const { width, height } = this.cameras.main;
    
    // 배경 (왕의 행성 분위기)
    this.createBackground();
    
    // 타이틀
    this.createTitle();
    
    // 메뉴 버튼들
    this.createMenuButtons();
    
    // 기록 표시 (의존성이 있을 때만)
    if (this.recordsManager) {
      this.showRecords();
    }
    
    // 입력 설정
    this.setupInput();
  }
  
  createBackground() {
    const { width, height } = this.cameras.main;
    
    // 그라데이션 배경 (우주 분위기)
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x2c3e50, 0x2c3e50, 0x34495e, 0x34495e);
    bg.fillRect(0, 0, width, height);
    
    // 별들 (랜덤 배치)
    for (let i = 0; i < 50; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 2),
        0xf1c40f
      );
      
      // 별 깜빡임 효과
      this.tweens.add({
        targets: star,
        alpha: { from: 0.3, to: 1 },
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
    
    // 왕좌 실루엣 (배경에)
    const throne = this.add.rectangle(width * 0.8, height * 0.7, 60, 80, 0x8e44ad);
    throne.setAlpha(0.3);
  }
  
  createTitle() {
    const { width, height } = this.cameras.main;
    
    // 메인 타이틀
    this.add.text(width/2, height * 0.2, '어린왕자', {
      fontSize: '48px',
      fill: '#f1c40f',
      fontFamily: 'Arial',
      stroke: '#2c3e50',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // 서브 타이틀
    this.add.text(width/2, height * 0.28, '왕의 행성', {
      fontSize: '24px',
      fill: '#ecf0f1',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // 버전 정보
    this.add.text(width - 10, height - 10, 'v1.0 - Phaser3 학습용', {
      fontSize: '12px',
      fill: '#7f8c8d'
    }).setOrigin(1);
  }
  
  createMenuButtons() {
    const { width, height } = this.cameras.main;
    
    // 게임 시작 버튼
    const startButton = this.add.text(width/2, height * 0.5, '게임 시작', {
      fontSize: '32px',
      fill: '#e74c3c',
      fontFamily: 'Arial',
      backgroundColor: '#34495e',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.startGame())
      .on('pointerover', () => this.onButtonHover(startButton))
      .on('pointerout', () => this.onButtonOut(startButton));
    
    // 설정 버튼
    const settingsButton = this.add.text(width/2, height * 0.6, '설정', {
      fontSize: '24px',
      fill: '#3498db',
      fontFamily: 'Arial',
      backgroundColor: '#34495e',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.openSettings())
      .on('pointerover', () => this.onButtonHover(settingsButton))
      .on('pointerout', () => this.onButtonOut(settingsButton));
    
    // 기록 초기화 버튼
    const resetButton = this.add.text(width/2, height * 0.7, '기록 초기화', {
      fontSize: '18px',
      fill: '#95a5a6',
      fontFamily: 'Arial',
      backgroundColor: '#34495e',
      padding: { x: 12, y: 6 }
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.resetRecords())
      .on('pointerover', () => this.onButtonHover(resetButton))
      .on('pointerout', () => this.onButtonOut(resetButton));
    
    // 버튼들 저장 (나중에 애니메이션용)
    this.menuButtons = [startButton, settingsButton, resetButton];
  }
  
  showRecords() {
    const { width, height } = this.cameras.main;
    const records = this.recordsManager.getRecords();
    
    // 기록 패널 배경
    const recordPanel = this.add.rectangle(width * 0.15, height * 0.6, 200, 150, 0x2c3e50);
    recordPanel.setStrokeStyle(2, 0x34495e);
    recordPanel.setAlpha(0.9);
    
    // 기록 제목
    this.add.text(width * 0.15, height * 0.52, '최고 기록', {
      fontSize: '18px',
      fill: '#f1c40f',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // 최고 시간
    const bestTimeText = records.bestTime 
      ? this.formatTime(records.bestTime)
      : '없음';
    this.add.text(width * 0.15, height * 0.58, `최단 시간: ${bestTimeText}`, {
      fontSize: '14px',
      fill: '#ecf0f1',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // 최대 콤보
    this.add.text(width * 0.15, height * 0.62, `최대 콤보: ${records.maxCombo}`, {
      fontSize: '14px',
      fill: '#ecf0f1',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // 총 플레이/승리 횟수
    this.add.text(width * 0.15, height * 0.66, `플레이: ${records.totalPlays}번`, {
      fontSize: '14px',
      fill: '#ecf0f1',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    this.add.text(width * 0.15, height * 0.70, `승리: ${records.victories}번`, {
      fontSize: '14px',
      fill: '#ecf0f1',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }
  
  setupInput() {
    // 키보드 입력
    this.input.keyboard.on('keydown-ENTER', () => {
      this.startGame();
    });
    
    this.input.keyboard.on('keydown-ESC', () => {
      // 전체화면 토글
      if (this.scale.isFullscreen) {
        this.scale.stopFullscreen();
      } else {
        this.scale.startFullscreen();
      }
    });
  }
  
  // 버튼 호버 효과
  onButtonHover(button) {
    this.tweens.add({
      targets: button,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 200,
      ease: 'Power2'
    });
  }
  
  onButtonOut(button) {
    this.tweens.add({
      targets: button,
      scaleX: 1,
      scaleY: 1,
      duration: 200,
      ease: 'Power2'
    });
  }
  
  startGame() {
    // 화면 전환 효과
    this.cameras.main.fadeOut(1000);
    
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene');
    });
  }
  
  openSettings() {
    // 설정 화면 (간단한 모달 형태)
    this.showSettingsModal();
  }
  
  showSettingsModal() {
    const { width, height } = this.cameras.main;
    
    // 모달 배경 (반투명)
    const modalBg = this.add.rectangle(width/2, height/2, width, height, 0x000000, 0.7)
      .setInteractive();
    
    // 설정 패널
    const settingsPanel = this.add.rectangle(width/2, height/2, 400, 300, 0x2c3e50);
    settingsPanel.setStrokeStyle(3, 0x3498db);
    
    // 설정 제목
    this.add.text(width/2, height/2 - 120, '설정', {
      fontSize: '24px',
      fill: '#f1c40f',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    // BGM 볼륨
    this.add.text(width/2 - 150, height/2 - 60, 'BGM 볼륨:', {
      fontSize: '16px',
      fill: '#ecf0f1'
    });
    
    const settings = this.settingsManager ? this.settingsManager.getSettings() : { bgmVolume: 50, sfxVolume: 50 };
    const bgmText = this.add.text(width/2 + 100, height/2 - 60, `${settings.bgmVolume}%`, {
      fontSize: '16px',
      fill: '#3498db'
    });
    
    // 효과음 볼륨
    this.add.text(width/2 - 150, height/2 - 20, '효과음 볼륨:', {
      fontSize: '16px',
      fill: '#ecf0f1'
    });
    
    const sfxText = this.add.text(width/2 + 100, height/2 - 20, `${settings.sfxVolume}%`, {
      fontSize: '16px',
      fill: '#3498db'
    });
    
    // 닫기 버튼
    const closeButton = this.add.text(width/2, height/2 + 80, '닫기', {
      fontSize: '18px',
      fill: '#e74c3c',
      backgroundColor: '#34495e',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        modalBg.destroy();
        settingsPanel.destroy();
        closeButton.destroy();
        bgmText.destroy();
        sfxText.destroy();
      });
    
    // 이벤트 그룹으로 관리
    this.settingsModal = [modalBg, settingsPanel, closeButton, bgmText, sfxText];
  }
  
  resetRecords() {
    // 확인 대화상자 (간단한 구현)
    if (confirm('정말로 모든 기록을 초기화하시겠습니까?')) {
      if (this.recordsManager) {
        this.recordsManager.resetRecords();
      }
      
      // 화면 새로고침
      this.scene.restart();
    }
  }

  // 시간 포맷팅 유틸리티 (의존성 없이)
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}

