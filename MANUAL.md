# 프로젝트 설명서 (Project Manual/Documentation)

## 1. 알고리즘 (Algorithm)

이 프로젝트는 **실시간 유저 활동 상태 모니터링 (Real-time User Presence)** 시스템입니다. 핵심 알고리즘은 다음과 같습니다.

### 1-1. 유저 식별 (User Identification)
- 로컬 스토리지(`localStorage`)에 저장된 `my_presence_id`를 확인합니다.
- ID가 없으면 `Math.random()`을 사용하여 고유 ID(`user_RandomString`)를 생성하고 저장합니다.
- 이를 통해 브라우저를 닫았다가 다시 열어도 동일한 유저로 인식합니다.

### 1-2. 상태 감지 및 동기화 (State Detection & Sync)
- **이벤트 리스너**: `mousemove`와 `keydown` 이벤트를 감지하여 유저의 활동을 파악합니다.
- **상태 업데이트**:
  - 활동이 감지되면 Firebase Realtime Database의 `presence/{userId}` 경로에 `{ active: true, lastChanged: timestamp, id: userId }`를 업데이트합니다.
  - 동시에 `setTimeout`을 사용하여 2초간 추가 활동이 없으면 상태를 `active: false` (정지)로 변경합니다.
- **연결 끊김 처리 (Disconnection Handling)**:
  - `onDisconnect()` 함수를 사용하여, 브라우저가 강제로 종료되거나 네트워크가 끊길 경우 서버 측에서 자동으로 해당 유저 데이터를 삭제하도록 예약합니다.
  - `beforeunload` 이벤트를 통해 정상 종료 시에도 데이터 삭제를 시도합니다.

---

## 2. 스크립트 구조 (Script Structure)

프로젝트는 Vite + Vue 3 기반으로 구성되어 있으며, 주요 파일 구조는 다음과 같습니다.

```
bit-buddy/
├── public/              # 정적 파일 (Favicon 등)
├── src/
│   ├── assets/          # 이미지, 폰트 등 자산
│   ├── components/      # (현재 비어 있음, 추후 컴포넌트 분리 시 사용)
│   ├── App.vue          # [핵심] 뷰 로직 및 UI 메인 파일
│   ├── main.ts          # Vue 인스턴스 초기화 및 마운트
│   ├── firebase.js      # Firebase 앱 초기화 및 DB 객체 export
│   └── style.css        # 전역 스타일 (옵션)
├── index.html           # 앱 진입점 (Initial Entry Point)
├── package.json         # 의존성 및 스크립트 정의
├── vite.config.ts       # Vite 번들러 설정
└── tsconfig.json        # TypeScript 설정
```

---

## 3. 핵심 모듈 (Core Modules)

### 3-1. `src/App.vue`
- **역할**: 애플리케이션의 메인 컨트롤러이자 뷰(Layout)입니다.
- **주요 기능**:
  - `userId` 생성 및 관리
  - Firebase DB 연결 및 실시간 데이터 구독 (`onValue`)
  - 사용자 활동 감지 로직 (`handleActivity`)
  - `transition-group`을 이용한 유저 리스트 UI 렌더링

### 3-2. `src/firebase.js`
- **역할**: Firebase SDK를 초기화하고 `db` (Database) 인스턴스를 내보냅니다.
- **설정**: Firebase 콘솔에서 발급받은 `firebaseConfig` 객체를 포함하고 있습니다.

### 3-3. `src/main.ts`
- **역할**: `App.vue`를 `index.html`의 `#app` 요소에 마운트(Mount)하는 진입점입니다.

---

## 4. 사용한 라이브러리 (Libraries Used)

이 프로젝트는 다음의 주요 라이브러리를 사용합니다. (`package.json` 기준)

### 4-1. 필수 의존성 (Dependencies)
- **`vue` (^3.5.25)**: 사용자 인터페이스를 구축하기 위한 프로그레시브 프레임워크입니다.
- **`firebase` (^12.9.0)**: 구글의 BaaS(Backend-as-a-Service) 플랫폼으로, Realtime Database를 사용하기 위해 추가되었습니다.

### 4-2. 개발 의존성 (DevDependencies)
- **`vite` (^7.3.1)**: 빠르고 가벼운 최신 프론트엔드 빌드 도구입니다.
- **`typescript` (~5.9.3)**: JavaScript에 타입을 부여하여 안정성을 높이는 언어입니다.
- **`@vitejs/plugin-vue` (^6.0.2)**: Vite에서 Vue 단일 파일 컴포넌트(`*.vue`)를 처리하기 위한 플러그인입니다.
