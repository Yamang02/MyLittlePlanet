// 게임 헬퍼 함수들
class GameHelpers {
  // 시간을 분:초 형식으로 변환
  static formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  // 두 점 사이의 각도 계산
  static getAngleBetweenPoints(x1, y1, x2, y2) {
    return Phaser.Math.Angle.Between(x1, y1, x2, y2);
  }
  
  // 두 점 사이의 거리 계산
  static getDistanceBetweenPoints(x1, y1, x2, y2) {
    return Phaser.Math.Distance.Between(x1, y1, x2, y2);
  }
  
  // 랜덤 정수 생성 (min, max 포함)
  static randomInt(min, max) {
    return Phaser.Math.Between(min, max);
  }
  
  // 랜덤 부동소수점 생성
  static randomFloat(min, max) {
    return Phaser.Math.FloatBetween(min, max);
  }
  
  // 배열에서 랜덤 요소 선택
  static randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  // 값이 범위 내에 있는지 확인
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  
  // 선형 보간
  static lerp(start, end, factor) {
    return start + (end - start) * factor;
  }
  
  // 색상 값을 16진수 문자열로 변환
  static colorToHex(color) {
    return '#' + color.toString(16).padStart(6, '0');
  }
  
  // 16진수 문자열을 색상 값으로 변환
  static hexToColor(hex) {
    return parseInt(hex.replace('#', ''), 16);
  }
  
  // 로컬 스토리지에 저장
  static saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('저장 실패:', error);
      return false;
    }
  }
  
  // 로컬 스토리지에서 로드
  static loadFromStorage(key, defaultValue = null) {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.error('로드 실패:', error);
      return defaultValue;
    }
  }
  
  // 쿨다운 체크
  static isCooldownReady(lastTime, cooldown) {
    return Date.now() - lastTime >= cooldown;
  }
  
  // 타이밍 윈도우 체크 (패링 등에 사용)
  static isInTimingWindow(startTime, window) {
    const elapsed = Date.now() - startTime;
    return elapsed >= 0 && elapsed <= window;
  }
}

// ES6 모듈로 export
export { GameHelpers }; 