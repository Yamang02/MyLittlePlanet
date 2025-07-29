// 전역 변수로 접근
const GAME_CONSTANTS = window.GAME_CONSTANTS;
const GAME_STATES = window.GAME_STATES;
const PHASES = window.PHASES;
const GameHelpers = window.GameHelpers;

class GameStateManager {
  constructor() {
    this.reset();
  }
  
  // 게임 상태 초기화
  reset() {
    this.state = {
      playerHealth: GAME_CONSTANTS.PLAYER.HEALTH,
      kingHealth: GAME_CONSTANTS.KING.MAX_HEALTH,
      currentPhase: PHASES.PHASE_1,
      currentCombo: 0,
      gameStartTime: Date.now(),
      totalPlayTime: 0,
      gameState: GAME_STATES.PLAYING,
      lastAttackTime: 0,
      attackCooldown: GAME_CONSTANTS.ATTACK.PHASE_1_COOLDOWN.MIN
    };
  }
  
  // 게임 상태 가져오기
  getState() {
    return this.state;
  }
  
  // 플레이어 체력 관리
  damagePlayer() {
    this.state.playerHealth = Math.max(0, this.state.playerHealth - 1);
    this.state.currentCombo = 0;
    return this.state.playerHealth;
  }
  
  healPlayer() {
    this.state.playerHealth = Math.min(GAME_CONSTANTS.PLAYER.HEALTH, this.state.playerHealth + 1);
    return this.state.playerHealth;
  }
  
  // 왕 체력 관리
  damageKing(damage) {
    this.state.kingHealth = Math.max(0, this.state.kingHealth - damage);
    return this.state.kingHealth;
  }
  
  // 콤보 관리
  addCombo() {
    this.state.currentCombo++;
    return this.state.currentCombo;
  }
  
  resetCombo() {
    this.state.currentCombo = 0;
  }
  
  // 페이즈 관리
  getCurrentPhase() {
    return this.state.currentPhase;
  }
  
  setPhase(phase) {
    this.state.currentPhase = phase;
    this.updateAttackCooldown();
  }
  
  // 페이즈 전환 체크
  checkPhaseTransition() {
    const healthPercent = this.state.kingHealth / GAME_CONSTANTS.KING.MAX_HEALTH;
    
    if (this.state.currentPhase === PHASES.PHASE_1 && 
        healthPercent <= GAME_CONSTANTS.KING.PHASE_1_THRESHOLD / 100) {
      this.setPhase(PHASES.PHASE_2);
      return PHASES.PHASE_2;
    }
    
    if (this.state.currentPhase === PHASES.PHASE_2 && 
        healthPercent <= GAME_CONSTANTS.KING.PHASE_2_THRESHOLD / 100) {
      this.setPhase(PHASES.PHASE_3);
      return PHASES.PHASE_3;
    }
    
    return null;
  }
  
  // 공격 쿨다운 업데이트
  updateAttackCooldown() {
    const cooldownConfig = this.getAttackCooldownConfig();
    this.state.attackCooldown = GameHelpers.randomInt(cooldownConfig.MIN, cooldownConfig.MAX);
  }
  
  getAttackCooldownConfig() {
    switch (this.state.currentPhase) {
      case PHASES.PHASE_1:
        return GAME_CONSTANTS.ATTACK.PHASE_1_COOLDOWN;
      case PHASES.PHASE_2:
        return GAME_CONSTANTS.ATTACK.PHASE_2_COOLDOWN;
      case PHASES.PHASE_3:
        return GAME_CONSTANTS.ATTACK.PHASE_3_COOLDOWN;
      default:
        return GAME_CONSTANTS.ATTACK.PHASE_1_COOLDOWN;
    }
  }
  
  // 게임 상태 변경
  setGameState(newState) {
    this.state.gameState = newState;
  }
  
  // 게임 완료 처리
  completeGame(victory = true) {
    this.state.totalPlayTime = Math.floor((Date.now() - this.state.gameStartTime) / 1000);
    this.state.gameState = victory ? GAME_STATES.VICTORY : GAME_STATES.GAME_OVER;
  }
  
  // 게임 종료 체크
  isGameOver() {
    return this.state.playerHealth <= 0;
  }
  
  isVictory() {
    return this.state.kingHealth <= 0;
  }
  
  // 공격 가능 여부 체크
  canAttack(currentTime) {
    return currentTime - this.state.lastAttackTime >= this.state.attackCooldown;
  }
  
  // 공격 실행
  performAttack(currentTime) {
    this.state.lastAttackTime = currentTime;
    this.updateAttackCooldown();
  }
}

// 전역 변수로 노출
window.GameStateManager = GameStateManager; 