import { GameHelpers } from '../../utils/Helpers.js';

export class RecordsManager {
  constructor() {
    this.records = {
      bestTime: null,
      maxCombo: 0,
      totalPlays: 0,
      victories: 0,
      totalPlayTime: 0,
      averagePlayTime: 0
    };
    
    this.loadRecords();
  }
  
  // 기록 로드
  loadRecords() {
    const saved = GameHelpers.loadFromStorage('kingsPlanetRecords', this.records);
    if (saved) {
      this.records = { ...this.records, ...saved };
    }
  }
  
  // 기록 저장
  saveRecords() {
    GameHelpers.saveToStorage('kingsPlanetRecords', this.records);
  }
  
  // 모든 기록 가져오기
  getRecords() {
    return this.records;
  }
  
  // 게임 완료 처리
  recordGameCompletion(victory, playTime, maxCombo) {
    this.records.totalPlays++;
    this.records.totalPlayTime += playTime;
    this.records.averagePlayTime = Math.floor(this.records.totalPlayTime / this.records.totalPlays);
    
    if (victory) {
      this.records.victories++;
      
      // 최고 시간 업데이트
      if (!this.records.bestTime || playTime < this.records.bestTime) {
        this.records.bestTime = playTime;
      }
    }
    
    // 최대 콤보 업데이트
    if (maxCombo > this.records.maxCombo) {
      this.records.maxCombo = maxCombo;
    }
    
    this.saveRecords();
  }
  
  // 최고 기록 가져오기
  getBestTime() {
    return this.records.bestTime;
  }
  
  // 최고 기록 포맷팅
  getBestTimeFormatted() {
    if (!this.records.bestTime) return '--:--';
    return GameHelpers.formatTime(this.records.bestTime);
  }
  
  // 최대 콤보 가져오기
  getMaxCombo() {
    return this.records.maxCombo;
  }
  
  // 총 플레이 횟수
  getTotalPlays() {
    return this.records.totalPlays;
  }
  
  // 승리 횟수
  getVictories() {
    return this.records.victories;
  }
  
  // 승률 계산
  getWinRate() {
    if (this.records.totalPlays === 0) return 0;
    return Math.round((this.records.victories / this.records.totalPlays) * 100);
  }
  
  // 평균 플레이 시간
  getAveragePlayTime() {
    return this.records.averagePlayTime;
  }
  
  // 평균 플레이 시간 포맷팅
  getAveragePlayTimeFormatted() {
    if (this.records.averagePlayTime === 0) return '--:--';
    return GameHelpers.formatTime(this.records.averagePlayTime);
  }
  
  // 기록 초기화
  resetRecords() {
    this.records = {
      bestTime: null,
      maxCombo: 0,
      totalPlays: 0,
      victories: 0,
      totalPlayTime: 0,
      averagePlayTime: 0
    };
    this.saveRecords();
  }
  
  // 통계 요약
  getStatsSummary() {
    return {
      totalPlays: this.records.totalPlays,
      victories: this.records.victories,
      winRate: this.getWinRate(),
      bestTime: this.getBestTimeFormatted(),
      maxCombo: this.records.maxCombo,
      averageTime: this.getAveragePlayTimeFormatted()
    };
  }
}

// ES6 모듈 export만 사용 (전역변수 제거) 