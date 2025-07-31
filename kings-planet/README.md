# Kings Planet - 2D Phaser.js 게임

![Kings Planet](https://res.cloudinary.com/dw57ytzhg/image/upload/v1753921840/img4_jw4dmu.jpg)

## 🎮 게임 소개

**Kings Planet**은 Phaser.js를 활용한 2D 액션 게임입니다. 어린왕자가 말풍선을 패링하여 왕을 물리치는 전략적인 전투를 즐길 수 있습니다.

## ✨ 주요 기능

### 🛡️ 패링 시스템
- **Z키**로 말풍선을 패링하여 왕에게 반사
- 패링 성공 시 콤보 증가
- 패링된 말풍선은 초록색으로 표시

### 🏃‍♂️ 회피 시스템
- **X키**로 회피하여 공격을 피함
- 회피 시 무적 시간 제공
- 쿨다운 시스템으로 밸런스 조절

### 🔥 콤보 시스템
- 연속 패링으로 콤보 증가
- 콤보에 따른 점수 보너스
- 피격 시 콤보 리셋

### 📈 페이즈 시스템
- 왕의 체력에 따라 난이도 증가
- 페이즈별 공격 패턴 변화
- 시각적 피드백으로 페이즈 전환 표시

### 🎯 물리 엔진
- Phaser.js 물리 시스템을 활용한 정확한 충돌 처리
- 궤적 기반 말풍선 이동
- 실시간 충돌 감지

## 🎮 조작법

| 키 | 기능 |
|---|---|
| **방향키** | 좌우 이동 |
| **스페이스바** | 점프 |
| **X키** | 회피 (쿨다운 1초) |
| **Z키** | 패링 |

## 🛠️ 기술 스택

### Frontend
- **JavaScript** - 게임 로직 및 상호작용
- **Phaser.js** - 2D 게임 엔진
- **HTML5** - 게임 캔버스 및 UI
- **CSS3** - 스타일링 및 애니메이션

### Backend & 배포
- **Node.js** - 개발 서버
- **Express.js** - 정적 파일 서빙
- **GitHub Pages** - 무료 호스팅

### 개발 도구
- **Cursor** - AI 기반 코드 에디터

## 📁 프로젝트 구조

```
MyLittlePlanet/
├── kings-planet/
│   ├── js/
│   │   ├── game/
│   │   │   ├── entities/     # 게임 엔티티
│   │   │   │   ├── King.js           # 왕 엔티티
│   │   │   │   ├── Player.js         # 플레이어 엔티티
│   │   │   │   └── SpeechBubble.js   # 말풍선 엔티티
│   │   │   ├── managers/     # 게임 상태 관리
│   │   │   │   ├── GameStateManager.js
│   │   │   │   ├── RecordsManager.js
│   │   │   │   └── SettingsManager.js
│   │   │   └── systems/      # 게임 시스템
│   │   │       ├── InputSystem.js    # 입력 처리
│   │   │       └── PhysicsSystem.js  # 물리 처리
│   │   ├── scenes/          # 게임 씬들
│   │   │   ├── BootScene.js          # 부팅 씬
│   │   │   ├── MainMenuScene.js      # 메인 메뉴
│   │   │   ├── GameScene.js          # 메인 게임
│   │   │   ├── GameOverScene.js      # 게임 오버
│   │   │   └── VictoryScene.js       # 승리 씬
│   │   ├── managers/        # 대화 관리
│   │   │   └── DialogueManager.js    # 대화 시스템
│   │   └── utils/           # 유틸리티
│   │       ├── Constants.js          # 상수 정의
│   │       └── Helpers.js            # 헬퍼 함수
│   ├── data/
│   │   └── dialogues/       # 대화 데이터
│   │       └── king-dialogues.json   # 왕의 대화 패턴
│   ├── index.html           # 메인 HTML
│   └── README.md            # 프로젝트 문서
└── docs/                    # 프로젝트 문서
    ├── brief.md             # 프로젝트 개요
    ├── prd-kings-planet.md  # 제품 요구사항
    └── architecture-scenes.md # 아키텍처 문서
```

## 🚀 실행 방법

### 로컬 개발 서버 실행
```bash
# 프로젝트 디렉토리로 이동
cd kings-planet

# Python HTTP 서버 실행 (포트 8000)
python -m http.server 8000

# 또는 Node.js 서버 실행
npx http-server -p 8000
```

### 브라우저에서 접속
```
http://localhost:8000
```

## 🎯 게임 플레이

### 목표
- 왕의 말풍선 공격을 패링하여 왕에게 데미지를 줌
- 왕의 체력을 0으로 만들어 승리
- 최대한 높은 콤보를 유지

### 전략
1. **패링 타이밍**: 말풍선이 가까워졌을 때 Z키로 패링
2. **회피 활용**: 패링하기 어려운 상황에서는 X키로 회피
3. **콤보 유지**: 연속 패링으로 콤보 증가
4. **페이즈 대응**: 페이즈별 공격 패턴에 맞춰 전략 조정

## 🔧 개발 정보




---

⭐ 이 프로젝트가 마음에 드시면 스타를 눌러주세요! 