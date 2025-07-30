export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }
  
  preload() {
    const { width, height } = this.cameras.main;
    
    // 로딩 화면 배경
    this.add.rectangle(width/2, height/2, width, height, 0x2c3e50);
    
    // 로딩 텍스트
    this.add.text(width/2, height/2 - 100, '어린왕자 - 왕의 행성', {
      fontSize: '32px',
      fill: '#ecf0f1',
      fontFamily: 'Arial'
    }).setOrigin(0.5);
    
    this.add.text(width/2, height/2 - 50, '로딩 중...', {
      fontSize: '18px',
      fill: '#bdc3c7'
    }).setOrigin(0.5);
    
    // 로딩바 배경
    const loadingBarBg = this.add.rectangle(width/2, height/2 + 50, 400, 20, 0x34495e);
    const loadingBar = this.add.rectangle(width/2 - 200, height/2 + 50, 0, 16, 0x3498db);
    loadingBar.setOrigin(0, 0.5);
    
    // 로딩 진행률 표시
    this.load.on('progress', (value) => {
      loadingBar.width = 400 * value;
    });
    
    // 임시 에셋들 로드
    this.loadTempAssets();
    
    // 로딩 완료 후 메인 메뉴로 이동
    this.load.on('complete', () => {
      this.time.delayedCall(500, () => {
        this.scene.start('MainMenuScene');
      });
    });
    
    // 로딩 실패 시 처리
    this.load.on('loaderror', (file) => {
      // 로딩 실패 시 무시하고 계속 진행
    });
    
    // 3초 후 강제로 메인 메뉴로 이동 (안전장치)
    this.time.delayedCall(3000, () => {
      this.scene.start('MainMenuScene');
    });
  }
  
  loadTempAssets() {
    // 더미 이미지 (1x1 픽셀 투명 이미지)
    const dummyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    // 임시 캐릭터 스프라이트
    this.load.image('littlePrince', dummyImage);
    this.load.image('king', dummyImage);
    
    // 임시 UI 에셋들
    this.load.image('heart', dummyImage);
    this.load.image('speechBubbles', dummyImage);
    this.load.image('background', dummyImage);
  }
  
  create() {
  }
}

