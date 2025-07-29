class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene' });
  }
  
  create() {
    const { width, height } = this.cameras.main;
    
    // 배경 (별이 빛나는 우주)
    this.createStarryBackground();
    
    // 승리 메시지
    this.createVictoryMessage();
    
    // 점수 표시
    this.showScore();
    
    // 메뉴 버튼들
    this.createButtons();
  }
  
  createStarryBackground() {
    const { width, height } = this.cameras.main;
    
    // 어두운 배경
    this.add.rectangle(width/2, height/2, width, height, 0x0c1445);
    
    // 많은 별들
    for (let i = 0; i < 100; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 3),
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 1)
      );
      
      // 별 깜빡임
      this.tweens.add({
        targets: star,
        alpha: { from: 0.3, to: 1 },
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1
      });
    }
  }
  
  createVictoryMessage() {
    const { width, height } = this.cameras.main;
    
    // 승리 텍스트
    this.add.text(width/2, height * 0.2, '승리!', {
      fontSize: '64px',
      fill: '#f1c40f',
      fontFamily: 'Arial',
      stroke: '#2c3e50',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // 스토리 텍스트
    this.add.text(width/2, height * 0.35, '왕은 자신의 외로움을 깨달았습니다', {
      fontSize: '20px',
      fill: '#ecf0f1',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);
    
    this.add.text(width/2, height * 0.4, '"진정한 왕은 명령하지 않아요"', {
      fontSize: '18px',
      fill: '#3498db',
      fontFamily: 'Arial',
      fontStyle: 'italic'
    }).setOrigin(0.5);
  }
  
  showScore() {
    const { width, height } = this.cameras.main;
    const gameState = window.KingsPlanetGame.gameState;
    const records = window.KingsPlanetGame.records;
    
    // 점수 패널
    const scorePanel = this.add.rectangle(width/2, height * 0.6, 400, 200, 0x2c3e50, 0.9);
    scorePanel.setStrokeStyle(2, 0x3498db);
    
    // 클리어 시간
    const timeText = window.KingsPlanetGame.utils.formatTime(gameState.totalPlayTime);
    this.add.text(width/2, height * 0.52, `클리어 시간: ${timeText}`, {
      fontSize: '18px',
      fill: '#f1c40f'
    }).setOrigin(0.5);
    
    // 최대 콤보
    this.add.text(width/2, height * 0.57, `최대 콤보: ${gameState.currentCombo}`, {
      fontSize: '18px',
      fill: '#e74c3c'
    }).setOrigin(0.5);
    
    // 신기록 체크
    if (records.bestTime === gameState.totalPlayTime) {
      this.add.text(width/2, height * 0.62, '🏆 NEW RECORD! 🏆', {
        fontSize: '20px',
        fill: '#f1c40f'
      }).setOrigin(0.5);
    }
    
    // 총 승리 횟수
    this.add.text(width/2, height * 0.67, `총 승리: ${records.victories}번`, {
      fontSize: '16px',
      fill: '#95a5a6'
    }).setOrigin(0.5);
  }
  
  createButtons() {
    const { width, height } = this.cameras.main;
    
    // 다시 하기 버튼
    const retryButton = this.add.text(width/2, height * 0.8, '다시 하기', {
      fontSize: '24px',
      fill: '#e74c3c',
      backgroundColor: '#34495e',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.retry())
      .on('pointerover', () => {
        retryButton.setScale(1.1);
      })
      .on('pointerout', () => {
        retryButton.setScale(1);
      });
    
    // 메인 메뉴 버튼
    const menuButton = this.add.text(width/2, height * 0.9, '메인 메뉴', {
      fontSize: '20px',
      fill: '#3498db',
      backgroundColor: '#34495e',
      padding: { x: 15, y: 8 }
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.goToMenu())
      .on('pointerover', () => {
        menuButton.setScale(1.1);
      })
      .on('pointerout', () => {
        menuButton.setScale(1);
      });
  }
  
  retry() {
    console.log('게임 재시작');
    window.KingsPlanetGame.utils.resetGameState();
    this.scene.start('GameScene');
  }
  
  goToMenu() {
    console.log('메인 메뉴로 이동');
    this.scene.start('MainMenuScene');
  }
}

// 전역 스코프에서 접근 가능하도록 설정
window.VictoryScene = VictoryScene;