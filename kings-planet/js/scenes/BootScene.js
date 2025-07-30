export default class BootScene extends Phaser.Scene {
  constructor(dependencies = {}) {
    super({ key: 'BootScene' });
    
    // 의존성 주입
    this.gameStateManager = dependencies.gameStateManager;
  }
  
  preload() {
    // 로딩 화면 표시
    const { width, height } = this.cameras.main;
    
    // 배경
    this.add.rectangle(width/2, height/2, width, height, 0x2c3e50);
    
    // 로딩 텍스트
    this.add.text(width/2, height/2, '게임 로딩 중...', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
  }
  
  create() {
    // 게임 상태 초기화
    if (this.gameStateManager) {
      this.gameStateManager.reset();
    }
    
    // 1초 후 PreloadScene으로 이동
    this.time.delayedCall(1000, () => {
      this.scene.start('PreloadScene');
    });
  }
}

