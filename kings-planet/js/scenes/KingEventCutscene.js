class KingEventCutscene extends Phaser.Scene {
  constructor() {
    super({ key: 'KingEventCutscene' });
  }
  
  create() {
    const { width, height } = this.cameras.main;
    
    // 망가 스타일 배경
    this.createMangaBackground();
    
    // 망가 패러디 장면 연출
    this.startMangaParody();
  }
  
  createMangaBackground() {
    const { width, height } = this.cameras.main;
    
    // 흰색 배경 (망가 스타일)
    this.add.rectangle(width/2, height/2, width, height, 0xffffff);
    
    // 집중선 효과 생성
    this.createConcentrationLines();
  }
  
  createConcentrationLines() {
    const { width, height } = this.cameras.main;
    
    // 중앙에서 사방으로 뻗어나가는 집중선들
    for (let i = 0; i < 16; i++) {
      const angle = (i * 360 / 16) * Math.PI / 180;
      const line = this.add.graphics();
      
      line.lineStyle(3, 0x000000, 1);
      line.beginPath();
      line.moveTo(width/2, height/2);
      line.lineTo(
        width/2 + Math.cos(angle) * 500,
        height/2 + Math.sin(angle) * 500
      );
      line.strokePath();
      
      // 집중선 애니메이션
      line.setAlpha(0.3);
      this.tweens.add({
        targets: line,
        alpha: { from: 0.3, to: 0.8 },
        duration: 1000,
        yoyo: true,
        repeat: -1,
        delay: i * 50
      });
    }
  }
  
  startMangaParody() {
    const { width, height } = this.cameras.main;
    
    // 망가 패러디 시퀀스
    this.time.delayedCall(500, () => {
      // "어?!" 텍스트 (망가 스타일 큰 글씨)
      const exclamation = this.add.text(width/2, height/2 - 100, '어?!', {
        fontSize: '80px',
        fill: '#000000',
        fontFamily: 'Arial Black',
        stroke: '#ffffff',
        strokeThickness: 8
      }).setOrigin(0.5).setScale(0);
      
      // 텍스트 확대 애니메이션
      this.tweens.add({
        targets: exclamation,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 300,
        ease: 'Back.easeOut'
      });
      
      // 1초 후 다음 장면
      this.time.delayedCall(1500, () => {
        this.showMangaPanel();
      });
    });
  }
  
  showMangaPanel() {
    const { width, height } = this.cameras.main;
    
    // 화면을 검게 만들고
    const blackPanel = this.add.rectangle(width/2, height/2, width, height, 0x000000);
    blackPanel.setAlpha(0);
    
    this.tweens.add({
      targets: blackPanel,
      alpha: 0.8,
      duration: 500
    });
    
    // 망가 패널 프레임
    const panelFrame = this.add.rectangle(width/2, height/2, width * 0.8, height * 0.6, 0xffffff);
    panelFrame.setStrokeStyle(8, 0x000000);
    panelFrame.setAlpha(0);
    
    this.tweens.add({
      targets: panelFrame,
      alpha: 1,
      duration: 300,
      delay: 500
    });
    
    // 캐릭터 실루엣 (어린왕자)
    this.time.delayedCall(800, () => {
      const princeSilhouette = this.add.circle(width/2 - 100, height/2, 40, 0x000000);
      
      // "아직 끝나지 않았어!" 대사
      const dialogue = this.add.text(width/2 + 50, height/2 - 50, 
        '아직\n끝나지\n않았어!', {
        fontSize: '28px',
        fill: '#000000',
        fontFamily: 'Arial Black',
        align: 'center',
        lineSpacing: 10
      }).setOrigin(0.5);
      
      // 말풍선 (간단한 타원)
      const speechBubble = this.add.ellipse(width/2 + 50, height/2 - 50, 180, 120, 0xffffff);
      speechBubble.setStrokeStyle(3, 0x000000);
      speechBubble.setDepth(-1);
      
      // 1.5초 후 화면 전환
      this.time.delayedCall(2000, () => {
        this.finishCutscene();
      });
    });
  }
  
  finishCutscene() {
    const { width, height } = this.cameras.main;
    
    // "다시!" 텍스트
    const retryText = this.add.text(width/2, height/2, '다시!', {
      fontSize: '100px',
      fill: '#ff0000',
      fontFamily: 'Arial Black',
      stroke: '#ffffff',
      strokeThickness: 10
    }).setOrigin(0.5).setScale(0);
    
    // 폭발적인 확대 효과
    this.tweens.add({
      targets: retryText,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 500,
      ease: 'Power2.easeOut'
    });
    
    // 효과음 재생 (콘솔 로그)
    console.log('효과음: 파워업!');
    
    // 1초 후 게임으로 복귀
    this.time.delayedCall(1500, () => {
      this.returnToBattle();
    });
  }
  
  returnToBattle() {
    // 화면 플래시 효과로 전환
    const flash = this.add.rectangle(
      this.cameras.main.width/2, 
      this.cameras.main.height/2, 
      this.cameras.main.width, 
      this.cameras.main.height, 
      0xffffff
    );
    
    this.tweens.add({
      targets: flash,
      alpha: { from: 0, to: 1 },
      duration: 200,
      onComplete: () => {
        // 게임 상태 초기화
        this.resetBattleState();
        
        // 게임 Scene으로 돌아가기
        this.scene.start('GameScene');
      }
    });
  }
  
  resetBattleState() {
    const gameState = window.KingsPlanetGame.gameState;
    
    // 체력 및 상태 초기화 (버프 없음)
    gameState.playerHealth = 3;
    gameState.kingHealth = 100;
    gameState.currentPhase = 1;
    gameState.currentCombo = 0;
    gameState.gameStartTime = Date.now(); // 시간 재설정
    
    // 게임 밸런스에 영향을 주는 요소는 모두 기본값으로
    gameState.parryWindow = 300;
    
    console.log('게임 상태 초기화 완료');
  }
}

// 전역 스코프에서 접근 가능하도록 설정
window.KingEventCutscene = KingEventCutscene;