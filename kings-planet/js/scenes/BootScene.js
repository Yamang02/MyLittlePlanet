class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }
  
  preload() {
    console.log('BootScene preload() 호출됨');
    
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
    
    // 에셋 로딩 없이 바로 완료 처리
    console.log('BootScene preload() 완료');
  }
  
  create() {
    console.log('BootScene create() 호출됨');
    
    // 게임 상태 초기화 (안전장치 추가)
    if (window.KingsPlanetGame && window.KingsPlanetGame.utils) {
      window.KingsPlanetGame.utils.resetGameState();
    } else {
      console.warn('KingsPlanetGame 객체가 아직 초기화되지 않았습니다.');
    }
    
    // 1초 후 PreloadScene으로 이동
    this.time.delayedCall(1000, () => {
      console.log('PreloadScene으로 전환 시도...');
      this.scene.start('PreloadScene');
    });
  }
}

// 전역 스코프에서 접근 가능하도록 설정
window.BootScene = BootScene;