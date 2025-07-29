class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }
  
  create() {
    const { width, height } = this.cameras.main;
    
    // 암전 배경
    this.createDarkBackground();
    
    // 어린왕자 스포트라이트
    this.createSpotlight();
    
    // 게임오버 연출
    this.createGameOverSequence();
  }
  
  createDarkBackground() {
    const { width, height } = this.cameras.main;
    
    // 완전한 검은 배경
    this.add.rectangle(width/2, height/2, width, height, 0x000000);
  }
  
  createSpotlight() {
    const { width, height } = this.cameras.main;
    
    // 스포트라이트 원 (어린왕자 주변)
    const spotlight = this.add.circle(width * 0.3, height * 0.7, 120, 0xffffff, 0.1);
    
    // 어린왕자 (쓰러진 모습)
    const prince = this.add.circle(width * 0.3, height * 0.7, 20, 0x3498db);
    
    // 쓰러지는 애니메이션
    this.tweens.add({
      targets: prince,
      rotation: Math.PI / 2,
      scaleX: 1,
      scaleY: 0.7,
      duration: 1000,
      ease: 'Power2.easeOut'
    });
    
    // 스포트라이트 깜빡임
    this.tweens.add({
      targets: spotlight,
      alpha: { from: 0.1, to: 0.3 },
      duration: 2000,
      yoyo: true,
      repeat: -1
    });
  }
  
  createGameOverSequence() {
    const { width, height } = this.cameras.main;
    
    // 1초 후 게임오버 텍스트
    this.time.delayedCall(1000, () => {
      const gameOverText = this.add.text(width/2, height * 0.3, 'GAME OVER', {
        fontSize: '48px',
        fill: '#e74c3c',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5).setAlpha(0);
      
      // 게임오버 텍스트 페이드인
      this.tweens.add({
        targets: gameOverText,
        alpha: 1,
        duration: 1000,
        ease: 'Power2'
      });
    });
    
    // 2초 후 왕의 메시지
    this.time.delayedCall(2000, () => {
      this.add.text(width/2, height * 0.45, '이제 영원히 날 섬겨라', {
        fontSize: '24px',
        fill: '#8e44ad',
        fontFamily: 'Arial',
        fontStyle: 'italic'
      }).setOrigin(0.5).setAlpha(0);
      
      this.tweens.add({
        targets: this.children.getByName || this.children.list[this.children.list.length - 1],
        alpha: 1,
        duration: 1500
      });
    });
    
    // 3초 후 Continue 옵션
    this.time.delayedCall(3000, () => {
      this.createContinueButton();
    });
  }
  
  createContinueButton() {
    const { width, height } = this.cameras.main;
    
    // Continue 버튼
    const continueButton = this.add.text(width/2, height * 0.65, 'Continue', {
      fontSize: '28px',
      fill: '#f1c40f',
      backgroundColor: '#2c3e50',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.continue())
      .on('pointerover', () => {
        continueButton.setScale(1.1);
      })
      .on('pointerout', () => {
        continueButton.setScale(1);
      });
    
    // 메인 메뉴 버튼
    const menuButton = this.add.text(width/2, height * 0.8, '메인 메뉴', {
      fontSize: '20px',
      fill: '#95a5a6',
      backgroundColor: '#2c3e50',
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
    
    // 버튼 펄스 효과
    this.tweens.add({
      targets: continueButton,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  
  continue() {
    console.log('Continue - 이벤트 컷신으로 이동');
    this.scene.start('KingEventCutscene');
  }
  
  goToMenu() {
    console.log('메인 메뉴로 이동');
    this.scene.start('MainMenuScene');
  }
}

// 전역 스코프에서 접근 가능하도록 설정
window.GameOverScene = GameOverScene;