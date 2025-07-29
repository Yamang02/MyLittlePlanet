// 글로벌 게임 객체를 즉시 정의
window.KingsPlanetGame = {
  // 매니저들 (새로운 구조)
  managers: {
    gameState: null,
    settings: null,
    records: null
  },
  
  // 기존 호환성을 위한 래퍼
  get gameState() {
    return this.managers.gameState ? this.managers.gameState.getState() : null;
  },
  
  get settings() {
    return this.managers.settings ? this.managers.settings.getSettings() : {};
  },
  
  get records() {
    return this.managers.records ? this.managers.records.getRecords() : {};
  },
  
  // 유틸리티 함수들 (기존 호환성 유지)
  utils: {
    // LocalStorage에 저장
    saveToStorage() {
      if (window.KingsPlanetGame.managers.settings) {
        window.KingsPlanetGame.managers.settings.saveSettings();
      }
      if (window.KingsPlanetGame.managers.records) {
        window.KingsPlanetGame.managers.records.saveRecords();
      }
    },
    
    // LocalStorage에서 로드
    loadFromStorage() {
      // 매니저들이 초기화된 후에 호출됨
    },
    
    // 게임 상태 초기화
    resetGameState() {
      if (window.KingsPlanetGame.managers.gameState) {
        window.KingsPlanetGame.managers.gameState.reset();
      }
    },
    
    // 게임 완료 처리
    completeGame(victory = true) {
      if (window.KingsPlanetGame.managers.gameState) {
        const gameState = window.KingsPlanetGame.managers.gameState.getState();
        window.KingsPlanetGame.managers.gameState.completeGame(victory);
        
        if (window.KingsPlanetGame.managers.records) {
          window.KingsPlanetGame.managers.records.recordGameCompletion(
            victory,
            gameState.totalPlayTime,
            gameState.currentCombo
          );
        }
      }
    },
    
    // 시간을 분:초 형식으로 변환
    formatTime(seconds) {
      if (window.GameHelpers) {
        return GameHelpers.formatTime(seconds);
      }
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  }
};

// 게임 시작 함수
function startGame() {
  // 모든 필요한 클래스들이 정의되었는지 확인
  const requiredClasses = [
    'BootScene', 'PreloadScene', 'MainMenuScene', 
    'GameScene', 'VictoryScene', 'GameOverScene', 'KingEventCutscene'
  ];
  
  const missingClasses = requiredClasses.filter(className => {
    return typeof window[className] === 'undefined';
  });
  
  if (missingClasses.length > 0) {
    console.error('누락된 클래스들:', missingClasses);
    document.getElementById('error').innerHTML = `누락된 클래스들: ${missingClasses.join(', ')}`;
    document.getElementById('error').style.display = 'block';
    return;
  }
  
  // 매니저들 초기화
  if (typeof GameStateManager !== 'undefined') {
    window.KingsPlanetGame.managers.gameState = new GameStateManager();
  }
  if (typeof SettingsManager !== 'undefined') {
    window.KingsPlanetGame.managers.settings = new SettingsManager();
  }
  if (typeof RecordsManager !== 'undefined') {
    window.KingsPlanetGame.managers.records = new RecordsManager();
  }
  
  // Phaser 게임 설정 (모든 클래스가 로드된 후에 정의)
  const gameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#2c3e50',
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
      }
    },
    scene: [
      BootScene,
      PreloadScene, 
      MainMenuScene,
      GameScene,
      VictoryScene,
      GameOverScene,
      KingEventCutscene
    ]
  };
  
  // 저장된 데이터 로드
  window.KingsPlanetGame.utils.loadFromStorage();
  
  // Phaser 게임 인스턴스 생성
  window.KingsPlanetGame.phaserGame = new Phaser.Game(gameConfig);
  
  console.log('게임이 성공적으로 시작되었습니다!');
}

// 전역 함수로 노출
window.startGame = startGame;