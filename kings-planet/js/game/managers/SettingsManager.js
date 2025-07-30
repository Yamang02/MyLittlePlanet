import { GameHelpers } from '../../utils/Helpers.js';

export class SettingsManager {
  constructor() {
    this.settings = {
      bgmVolume: 70,
      sfxVolume: 80,
      fullscreen: false,
      controls: {
        left: 'LEFT',
        right: 'RIGHT',
        jump: 'SPACE',
        dodge: 'X',
        parry: 'Z'
      }
    };
    
    this.loadSettings();
  }
  
  // 설정 로드
  loadSettings() {
    const saved = GameHelpers.loadFromStorage('kingsPlanetSettings', this.settings);
    if (saved) {
      this.settings = { ...this.settings, ...saved };
    }
  }
  
  // 설정 저장
  saveSettings() {
    GameHelpers.saveToStorage('kingsPlanetSettings', this.settings);
  }
  
  // 설정 가져오기
  getSettings() {
    return this.settings;
  }
  
  // 특정 설정 가져오기
  getSetting(key) {
    return this.settings[key];
  }
  
  // 설정 변경
  setSetting(key, value) {
    this.settings[key] = value;
    this.saveSettings();
  }
  
  // BGM 볼륨 설정
  setBGMVolume(volume) {
    this.settings.bgmVolume = GameHelpers.clamp(volume, 0, 100);
    this.saveSettings();
  }
  
  // 효과음 볼륨 설정
  setSFXVolume(volume) {
    this.settings.sfxVolume = GameHelpers.clamp(volume, 0, 100);
    this.saveSettings();
  }
  
  // 풀스크린 토글
  toggleFullscreen() {
    this.settings.fullscreen = !this.settings.fullscreen;
    this.saveSettings();
    return this.settings.fullscreen;
  }
  
  // 조작키 변경
  setControl(action, key) {
    this.settings.controls[action] = key;
    this.saveSettings();
  }
  
  // 조작키 가져오기
  getControl(action) {
    return this.settings.controls[action];
  }
  
  // 모든 조작키 가져오기
  getControls() {
    return this.settings.controls;
  }
  
  // 설정 초기화
  resetSettings() {
    this.settings = {
      bgmVolume: 70,
      sfxVolume: 80,
      fullscreen: false,
      controls: {
        left: 'LEFT',
        right: 'RIGHT',
        jump: 'SPACE',
        dodge: 'X',
        parry: 'Z'
      }
    };
    this.saveSettings();
  }
}

// ES6 모듈 export만 사용 (전역변수 제거) 