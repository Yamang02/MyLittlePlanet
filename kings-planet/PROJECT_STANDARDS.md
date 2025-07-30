# Kings Planet - 프로젝트 개발 표준

## 🎯 핵심 원칙

**모든 AI 에이전트는 이 표준을 엄격히 준수해야 합니다.**

## 📦 ES6 모듈 시스템 (MANDATORY)

### ✅ 올바른 방식
```javascript
// ✅ 올바른 import
import { GAME_CONSTANTS, COLORS, PHASES } from '../../utils/Constants.js';
import { King } from '../game/entities/King.js';

// ✅ 올바른 export
export class King {
  constructor() {
    // ...
  }
}

export const GAME_CONSTANTS = {
  // ...
};
```

### ❌ 금지된 방식
```javascript
// ❌ 전역 window 객체 사용 금지
window.King = class King { ... }
window.GAME_CONSTANTS = { ... }

// ❌ 전역 스크립트 태그 방식 금지
<script src="file.js"></script>

// ❌ import/export 없이 클래스 정의 금지
class King { ... } // export 없음
```

## 🏗️ 파일 구조 표준

### 1. 모든 JavaScript 파일은 ES6 모듈로 작성
- `export` 키워드 필수
- `import` 문법 사용
- 파일 확장자 `.js` 명시

### 2. 의존성 관리
```javascript
// ✅ 명시적 의존성
import { DependencyClass } from './path/to/DependencyClass.js';

// ❌ 암시적 의존성 금지
// window.DependencyClass 사용 금지
```

### 3. 클래스 정의
```javascript
// ✅ 올바른 클래스 export
export class MyClass {
  constructor() {
    // ...
  }
}

// ❌ 잘못된 방식
class MyClass { ... } // export 없음
window.MyClass = class MyClass { ... } // 전역 노출 금지
```

## 🔧 HTML 모듈 설정

### 필수 설정
```html
<!-- ✅ ES6 모듈 활성화 -->
<script type="module" src="js/game.js"></script>

<!-- ❌ 일반 스크립트 태그 금지 -->
<script src="js/game.js"></script>
```

## 📋 AI 에이전트 체크리스트

### 코드 생성 시 필수 확인사항
1. **모든 클래스에 `export` 키워드 추가**
2. **모든 의존성에 `import` 문법 사용**
3. **파일 경로에 `.js` 확장자 명시**
4. **전역 `window` 객체 사용 금지**
5. **HTML에서 `type="module"` 설정 확인**

### 리팩토링 시 주의사항
1. **기존 전역 객체를 ES6 모듈로 변환**
2. **import/export 문법 일관성 유지**
3. **의존성 그래프 확인**
4. **모듈 로딩 순서 검증**

## 🚨 오류 방지 가이드

### 자주 발생하는 오류
1. **"King is not defined"** → `export class King` 확인
2. **"Cannot use import statement"** → `type="module"` 확인
3. **"Module not found"** → 파일 경로와 `.js` 확장자 확인

### 해결 방법
1. **클래스 정의 확인**: `export class` 사용
2. **import 문법 확인**: 올바른 경로와 확장자
3. **HTML 설정 확인**: `type="module"` 추가
4. **의존성 순서 확인**: import 순서 검증

## 📚 참고 자료

- [ES6 Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [JavaScript Modules](https://javascript.info/modules)
- [Phaser ES6 Modules](https://photonstorm.github.io/phaser3-docs/Phaser.Loader.LoaderPlugin.html#addFile)

---

**⚠️ 중요**: 이 표준을 위반하면 모듈 로딩 오류가 발생하여 토큰이 낭비됩니다. 모든 AI 에이전트는 이 문서를 참조하여 일관된 ES6 모듈 시스템을 유지해야 합니다. 