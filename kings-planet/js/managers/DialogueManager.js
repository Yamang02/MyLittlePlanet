export class DialogueManager {
  constructor() {
    this.dialogues = {};
    this.currentLanguage = 'ko';
    this.isLoaded = false;
  }

  // 대화 데이터 로드
  async loadDialogues() {
    try {
      const response = await fetch('data/dialogues/king-dialogues.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      this.dialogues = await response.json();
      this.isLoaded = true;
      console.log('대화 데이터 로드 완료');
    } catch (error) {
      console.error('대화 데이터 로드 실패:', error);
      // 폴백: 기본 대화 데이터 사용
      this.loadFallbackDialogues();
    }
  }

  // 폴백 대화 데이터 (로드 실패 시 사용)
  loadFallbackDialogues() {
    this.dialogues = {
      "king": {
        "phase1": {
          "command": [
            { "id": "sit_down", "text": "앉아라!", "type": "command", "weight": 1 },
            { "id": "stand_up", "text": "일어나라!", "type": "command", "weight": 1 },
            { "id": "come_here", "text": "이리오너라!", "type": "command", "weight": 1 }
          ]
        },
        "phase2": {
          "rage": [
            { "id": "kneel", "text": "엎드려라!", "type": "rage", "weight": 1 },
            { "id": "how_dare", "text": "네가 감히!", "type": "rage", "weight": 1 },
            { "id": "command_order", "text": "명령이다!", "type": "rage", "weight": 1 }
          ]
        },
        "phase3": {
          "plea": [
            { "id": "come_closer", "text": "가까이...오거라", "type": "plea", "weight": 1 },
            { "id": "please", "text": "부탁하마...", "type": "plea", "weight": 1 },
            { "id": "dont_leave", "text": "떠나지..말거라", "type": "plea", "weight": 1 }
          ]
        }
      }
    };
    this.isLoaded = true;
    console.log('폴백 대화 데이터 로드 완료');
  }

  // 특정 캐릭터의 대화 가져오기
  getDialogue(character, phase, type) {
    if (!this.isLoaded) {
      console.warn('대화 데이터가 로드되지 않았습니다.');
      return null;
    }

    try {
      const characterDialogues = this.dialogues[character];
      if (!characterDialogues) {
        console.warn(`캐릭터 '${character}'의 대화를 찾을 수 없습니다.`);
        return null;
      }

      const phaseDialogues = characterDialogues[phase];
      if (!phaseDialogues) {
        console.warn(`페이즈 '${phase}'의 대화를 찾을 수 없습니다.`);
        return null;
      }

      const typeDialogues = phaseDialogues[type];
      if (!typeDialogues || typeDialogues.length === 0) {
        console.warn(`타입 '${type}'의 대화를 찾을 수 없습니다.`);
        return null;
      }

      // 가중치를 고려한 랜덤 선택
      return this.selectRandomDialogue(typeDialogues);
    } catch (error) {
      console.error('대화 가져오기 중 오류:', error);
      return null;
    }
  }

  // 가중치를 고려한 랜덤 대화 선택
  selectRandomDialogue(dialogues) {
    if (!dialogues || dialogues.length === 0) return null;

    // 가중치 계산
    const totalWeight = dialogues.reduce((sum, dialogue) => sum + (dialogue.weight || 1), 0);
    let random = Math.random() * totalWeight;

    // 가중치에 따른 선택
    for (const dialogue of dialogues) {
      random -= (dialogue.weight || 1);
      if (random <= 0) {
        return dialogue;
      }
    }

    // 폴백: 첫 번째 대화 반환
    return dialogues[0];
  }

  // 언어 설정
  setLanguage(language) {
    this.currentLanguage = language;
    console.log(`언어가 ${language}로 변경되었습니다.`);
  }

  // 현재 언어 가져오기
  getCurrentLanguage() {
    return this.currentLanguage;
  }

  // 로드 상태 확인
  isDataLoaded() {
    return this.isLoaded;
  }

  // 모든 대화 데이터 가져오기 (디버깅용)
  getAllDialogues() {
    return this.dialogues;
  }
} 