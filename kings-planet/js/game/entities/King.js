import { GAME_CONSTANTS, COLORS, PHASES } from '../../utils/Constants.js';

export class King {
  constructor(scene, x, y, dialogueManager) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.dialogueManager = dialogueManager;
    
    // 스프라이트 생성
    this.sprite = scene.add.sprite(x, y, 'king');
    this.sprite.setTint(COLORS.KING);
    this.sprite.setScale(4);
    
    // 상태
    this.currentPhase = PHASES.PHASE_1;
    this.isAttacking = false;
    
    // 이벤트 콜백
    this.onAttack = null;
    this.onPhaseChange = null;
  }
  
  // 업데이트
  update(time, delta) {
    // 페이즈별 행동 패턴 업데이트
    this.updateBehavior(time, delta);
  }
  
  // 페이즈별 행동 패턴
  updateBehavior(time, delta) {
    switch (this.currentPhase) {
      case PHASES.PHASE_1:
        this.updatePhase1Behavior(time, delta);
        break;
      case PHASES.PHASE_2:
        this.updatePhase2Behavior(time, delta);
        break;
      case PHASES.PHASE_3:
        this.updatePhase3Behavior(time, delta);
        break;
    }
  }
  
  // 페이즈 1 행동 (권위적인 왕)
  updatePhase1Behavior(time, delta) {
    // 왕좌에서 거의 움직이지 않음
    // 기본 공격 패턴만 수행
  }
  
  // 페이즈 2 행동 (분노하는 왕)
  updatePhase2Behavior(time, delta) {
    // 불안해하며 왕좌 주변을 움직임
    const moveRange = 50;
    const moveSpeed = 0.5;
    
    const targetX = this.x + Math.sin(time * 0.001 * moveSpeed) * moveRange;
    this.sprite.x = targetX;
  }
  
  // 페이즈 3 행동 (무력한 왕)
  updatePhase3Behavior(time, delta) {
    // 왕좌에서 내려와 어린왕자 쪽으로 다가옴
    const targetX = this.x - 1; // 천천히 왼쪽으로 이동
    this.sprite.x = Math.max(targetX, this.scene.cameras.main.width * 0.5);
  }
  
  // 공격 실행
  performAttack() {
    if (this.isAttacking) return;
    
    this.isAttacking = true;
    
    // 페이즈별 공격 패턴
    const attackPattern = this.getAttackPattern();
    
    if (this.onAttack) {
      this.onAttack(attackPattern);
    }
    
    // 공격 애니메이션
    this.sprite.setTint(0xffffff);
    this.scene.time.delayedCall(200, () => {
      this.sprite.setTint(this.getPhaseColor());
      this.isAttacking = false;
    });
  }
  
  // 페이즈별 공격 패턴 가져오기
  getAttackPattern() {
    // DialogueManager를 사용하여 대화 데이터 가져오기
    if (this.dialogueManager && this.dialogueManager.isDataLoaded()) {
      const dialogue = this.dialogueManager.getDialogue('king', this.currentPhase, this.getDialogueType());
      if (dialogue) {
        return dialogue;
      }
    }
    
    // 폴백: 기본 대화 패턴 (DialogueManager 로드 실패 시)
    const fallbackPatterns = {
      'phase1': [
        { text: '앉아라!', type: 'command' },
        { text: '일어나라!', type: 'command' },
        { text: '이리오너라!', type: 'command' }
      ],
      'phase2': [
        { text: '엎드려라!', type: 'rage' },
        { text: '네가 감히!', type: 'rage' },
        { text: '명령이다!', type: 'rage' }
      ],
      'phase3': [
        { text: '가까이...오거라', type: 'plea' },
        { text: '부탁하마...', type: 'plea' },
        { text: '떠나지..말거라', type: 'plea' }
      ]
    };
    
    const currentPatterns = fallbackPatterns[this.currentPhase] || fallbackPatterns['phase1'];
    return currentPatterns[Math.floor(Math.random() * currentPatterns.length)];
  }

  // 현재 페이즈에 따른 대화 타입 결정
  getDialogueType() {
    switch (this.currentPhase) {
      case PHASES.PHASE_1:
        return 'command';
      case PHASES.PHASE_2:
        return 'rage';
      case PHASES.PHASE_3:
        return 'plea';
      default:
        return 'command';
    }
  }
  
  // 페이즈 변경
  setPhase(phase) {
    if (this.currentPhase === phase) return;
    
    this.currentPhase = phase;
    this.sprite.setTint(this.getPhaseColor());
    
    if (this.onPhaseChange) {
      this.onPhaseChange(phase);
    }
    
    console.log(`왕 페이즈 ${phase}로 전환!`);
  }
  
  // 페이즈별 색상 가져오기
  getPhaseColor() {
    switch (this.currentPhase) {
      case PHASES.PHASE_1:
        return COLORS.KING;
      case PHASES.PHASE_2:
        return COLORS.KING_PHASE_2;
      case PHASES.PHASE_3:
        return COLORS.KING_PHASE_3;
      default:
        return COLORS.KING;
    }
  }
  
  // 피격 처리
  takeDamage() {
    this.sprite.setTint(0xffffff);
    this.scene.time.delayedCall(200, () => {
      this.sprite.setTint(this.getPhaseColor());
    });
  }
  
  // 현재 페이즈 가져오기
  getCurrentPhase() {
    return this.currentPhase;
  }
  
  // 스프라이트 가져오기
  getSprite() {
    return this.sprite;
  }
  
  // 위치 가져오기
  getPosition() {
    return { x: this.sprite.x, y: this.sprite.y };
  }
  
  // 이벤트 콜백 설정
  setOnAttack(callback) {
    this.onAttack = callback;
  }
  
  setOnPhaseChange(callback) {
    this.onPhaseChange = callback;
  }
  
  // 파괴
  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
    }
  }
} 