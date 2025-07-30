import { GameStateManager } from './game/managers/GameStateManager.js';
import { SettingsManager } from './game/managers/SettingsManager.js';
import { RecordsManager } from './game/managers/RecordsManager.js';
import { DialogueManager } from './managers/DialogueManager.js';

// 게임 객체 정의
export const KingsPlanetGame = {
  // 매니저들
  managers: {
    gameState: null,
    settings: null,
    records: null,
    dialogue: null
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
  
  // 유틸리티 함수들
  utils: {
    // LocalStorage에 저장
    saveToStorage() {
      if (KingsPlanetGame.managers.settings) {
        KingsPlanetGame.managers.settings.saveSettings();
      }
      if (KingsPlanetGame.managers.records) {
        KingsPlanetGame.managers.records.saveRecords();
      }
    },
    
    // LocalStorage에서 로드
    loadFromStorage() {
      // 매니저들이 초기화된 후에 호출됨
    },
    
    // 게임 상태 초기화
    resetGameState() {
      if (KingsPlanetGame.managers.gameState) {
        KingsPlanetGame.managers.gameState.reset();
      }
    },
    
    // 게임 완료 처리
    completeGame(victory = true) {
      if (KingsPlanetGame.managers.gameState) {
        const gameState = KingsPlanetGame.managers.gameState.getState();
        KingsPlanetGame.managers.gameState.completeGame(victory);
        
        if (KingsPlanetGame.managers.records) {
          KingsPlanetGame.managers.records.recordGameCompletion(
            victory,
            gameState.totalPlayTime,
            gameState.currentCombo
          );
        }
      }
    },
    
    // 시간을 분:초 형식으로 변환
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  },
  
  // 게임 초기화 메서드
  init() {
    // 매니저들 초기화
    this.managers.gameState = new GameStateManager();
    this.managers.settings = new SettingsManager();
    this.managers.records = new RecordsManager();
    this.managers.dialogue = new DialogueManager();
    
    // 대화 데이터 로드
    this.managers.dialogue.loadDialogues();
    
    // 저장된 데이터 로드
    this.utils.loadFromStorage();
    
    // Phaser 게임 시작
    this.startPhaserGame();
  },
  
  // Phaser 게임 시작
  async startPhaserGame() {
    try {
      // Scene 클래스들 동적 import
      const [
        { default: BootScene },
        { default: PreloadScene },
        { default: MainMenuScene },
        { default: GameScene },
        { default: VictoryScene },
        { default: GameOverScene },
        { default: KingEventCutscene }
      ] = await Promise.all([
        import('./scenes/BootScene.js'),
        import('./scenes/PreloadScene.js'),
        import('./scenes/MainMenuScene.js'),
        import('./scenes/GameScene.js'),
        import('./scenes/VictoryScene.js'),
        import('./scenes/GameOverScene.js'),
        import('./scenes/KingEventCutscene.js')
      ]);
      
      // 씬에 상태 관리자 주입
      const scenesWithDependencies = [
        new BootScene({ gameStateManager: this.managers.gameState }),
        new PreloadScene(),
        new MainMenuScene({ 
          gameStateManager: this.managers.gameState,
          recordsManager: this.managers.records,
          settingsManager: this.managers.settings
        }),
        new GameScene({ 
          gameStateManager: this.managers.gameState,
          dialogueManager: this.managers.dialogue
        }),
        new VictoryScene({ 
          gameStateManager: this.managers.gameState,
          recordsManager: this.managers.records
        }),
        new GameOverScene(),
        new KingEventCutscene({ gameStateManager: this.managers.gameState })
      ];
      
      // Phaser 게임 설정
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
        scene: scenesWithDependencies
      };
      
      // Phaser 게임 인스턴스 생성
      this.phaserGame = new Phaser.Game(gameConfig);
      
      // 게임 인스턴스가 제대로 생성되었는지 확인
      if (!this.phaserGame || !this.phaserGame.scene) {
        throw new Error('Phaser 게임 인스턴스 생성 실패');
      }
      
    } catch (error) {
      console.error('Phaser 게임 시작 실패:', error);
      throw error;
    }
  }
};