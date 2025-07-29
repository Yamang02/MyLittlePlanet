// 글로벌 게임 객체를 즉시 정의
window.KingsPlanetGame = {
  // 게임 상태
  gameState: {
    playerHealth: 3,
    kingHealth: 100,
    currentPhase: 1,
    currentCombo: 0,
    gameStartTime: null,
    totalPlayTime: 0,
    parryWindow: 300  // 패링 성공 윈도우 (ms)
  },
  
  // 사용자 설정
  settings: {
    bgmVolume: 70,
    sfxVolume: 80,
    fullscreen: false
  },
  
  // 게임 기록
  records: {
    bestTime: null,
    maxCombo: 0,
    totalPlays: 0,
    victories: 0
  },
  
  // 유틸리티 함수들
  utils: {
    // LocalStorage에 저장
    saveToStorage() {
      localStorage.setItem('kingsPlanetGame', JSON.stringify({
        settings: window.KingsPlanetGame.settings,
        records: window.KingsPlanetGame.records
      }));
    },
    
    // LocalStorage에서 로드
    loadFromStorage() {
      const saved = localStorage.getItem('kingsPlanetGame');
      if (saved) {
        const data = JSON.parse(saved);
        Object.assign(window.KingsPlanetGame.settings, data.settings || {});
        Object.assign(window.KingsPlanetGame.records, data.records || {});
      }
    },
    
    // 게임 상태 초기화
    resetGameState() {
      window.KingsPlanetGame.gameState = {
        playerHealth: 3,
        kingHealth: 100,
        currentPhase: 1,
        currentCombo: 0,
        gameStartTime: Date.now(),
        totalPlayTime: 0,
        parryWindow: 300
      };
    },
    
    // 게임 완료 처리
    completeGame(victory = true) {
      const gameState = window.KingsPlanetGame.gameState;
      const records = window.KingsPlanetGame.records;
      
      // 플레이 시간 계산
      const playTime = Date.now() - gameState.gameStartTime;
      gameState.totalPlayTime = Math.floor(playTime / 1000);
      
      // 기록 업데이트
      records.totalPlays++;
      if (victory) {
        records.victories++;
        
        // 최고 시간 업데이트
        if (!records.bestTime || gameState.totalPlayTime < records.bestTime) {
          records.bestTime = gameState.totalPlayTime;
        }
      }
      
      // 최대 콤보 업데이트
      if (gameState.currentCombo > records.maxCombo) {
        records.maxCombo = gameState.currentCombo;
      }
      
      // 저장
      this.saveToStorage();
    },
    
    // 시간을 분:초 형식으로 변환
    formatTime(seconds) {
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