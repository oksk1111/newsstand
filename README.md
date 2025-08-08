# 📰 Newsstand - 개인 맞춤형 뉴스 요약 앱

> **빠르고 스마트한 뉴스 소비를 위한 크로스 플랫폼 모바일 앱**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-green.svg)
![React Native](https://img.shields.io/badge/React%20Native-0.72-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)

## 🚀 프로젝트 개요

Newsstand는 다양한 뉴스 소스에서 수집한 정보를 AI로 요약하여 1-2줄의 간결한 형태로 제공하는 개인 맞춤형 뉴스 앱입니다. 비로그인/로그인 모드를 지원하며, 향상된 UI/UX로 최고의 사용자 경험을 제공합니다.

### ✨ 주요 특징

- 🤖 **AI 기반 뉴스 요약**: OpenAI를 활용한 1-2줄 스마트 요약
- 👤 **개인화**: 사용자 관심사와 읽기 패턴 기반 추천
- 🔄 **실시간 업데이트**: 30분마다 자동 뉴스 수집 및 업데이트
- 📱 **크로스 플랫폼**: iOS, Android, Web 지원
- 🎨 **모던 UI/UX**: 직관적인 디자인과 부드러운 애니메이션
- 🔍 **스마트 검색**: 실시간 검색 제안과 고급 필터링
- 🌐 **다국어 지원**: 영어, 한국어 등 6개 언어 지원
- 🔐 **프라이버시 중심**: 비로그인 모드와 최소한의 데이터 수집

### 🎯 최신 업데이트 (2025.08.08)

#### ✨ UI/UX 대폭 개선
- **향상된 컴포넌트 시스템**: 재사용 가능한 고품질 UI 컴포넌트
- **LoadingSpinner**: 오버레이 지원, 커스텀 텍스트, 부드러운 애니메이션
- **ErrorDisplay**: 재시도 기능, 사용자 친화적 에러 처리
- **Toast 알림**: 4가지 타입(success/error/warning/info), 자동 숨김
- **NewsCard**: 카테고리 칩, 감정 분석, 관련도 점수, 태그 시스템
- **SearchComponent**: 실시간 검색 제안, 고급 필터링, 최근/인기 검색어

#### 🚀 사용자 경험 향상
- **폼 검증 시스템**: 실시간 입력 검증 및 사용자 피드백
- **애니메이션 효과**: 페이드인, 슬라이드 등 자연스러운 전환
- **개선된 로딩 상태**: 시각적 피드백과 진행 상황 표시
- **향상된 에러 처리**: 사용자 친화적 오류 메시지와 복구 옵션

## 🏗️ 기술 스택

### Frontend (Mobile)
- **React Native** + **Expo** - 크로스 플랫폼 개발
- **TypeScript** - 타입 안정성
- **React Navigation** - 내비게이션
- **React Query** - 서버 상태 관리
- **React Native Paper** - UI 컴포넌트
- **React Hook Form** - 폼 관리

### Backend (API)
- **Node.js** + **Express** - 서버 프레임워크
- **MongoDB** + **Mongoose** - 데이터베이스
- **JWT** - 인증
- **OpenAI API** - AI 기반 요약
- **News API** - 뉴스 데이터 소스
- **Node-cron** - 스케줄링

### 인프라 & 보안
- **Helmet** - 보안 헤더
- **Rate Limiting** - API 요청 제한
- **CORS** - 교차 출처 요청 관리
- **bcryptjs** - 패스워드 암호화
- **Express Validator** - 입력 검증

## 📁 프로젝트 구조

```
newsstand/
├── backend/                    # Node.js API 서버
│   ├── src/
│   │   ├── config/            # 데이터베이스 설정
│   │   ├── middleware/        # 인증, 에러 핸들링
│   │   ├── models/           # MongoDB 스키마
│   │   ├── routes/           # API 라우트
│   │   ├── services/         # 비즈니스 로직
│   │   └── index.js          # 서버 진입점
│   ├── tests/                # 테스트
│   └── package.json
├── src/                      # React Native 앱 (메인)
│   ├── components/           # 재사용 가능한 UI 컴포넌트
│   │   ├── LoadingSpinner.tsx    # 로딩 스피너 컴포넌트
│   │   ├── ErrorDisplay.tsx     # 에러 표시 컴포넌트
│   │   ├── Toast.tsx            # 토스트 알림 컴포넌트
│   │   ├── NewsCard.tsx         # 뉴스 카드 컴포넌트
│   │   ├── SearchComponent.tsx  # 검색 컴포넌트
│   │   └── index.ts             # 컴포넌트 내보내기
│   ├── contexts/             # React Context
│   ├── navigation/           # 내비게이션 설정
│   ├── screens/              # 화면 컴포넌트
│   │   ├── HomeScreen.tsx        # 개선된 홈 화면
│   │   ├── LoginScreen.tsx       # 개선된 로그인 화면
│   │   ├── NewsDetailScreen.tsx  # 뉴스 상세 화면
│   │   └── ProfileScreen.tsx     # 프로필 화면
│   ├── services/             # API 클라이언트
│   ├── types/                # TypeScript 타입
│   └── utils/                # 유틸리티 함수
├── mobile/                   # 이전 버전 (호환성)
├── assets/                   # 이미지, 폰트 등
├── App.tsx                   # 앱 진입점
└── mcp.json                  # MCP 서버 설정
```

## 🛠️ 설치 및 실행

### 사전 요구사항

- Node.js 18+
- MongoDB
- Expo CLI
- OpenAI API Key
- News API Key

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/newsstand.git
cd newsstand
```

### 2. 백엔드 설정

```bash
cd backend
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 API 키와 MongoDB URI 설정

# 개발 서버 실행
npm run dev
```

### 2. 모바일 앱 설정

```bash
# 프로젝트 루트에서
npm install

# Expo 개발 서버 실행
npm start

# 웹에서 실행
npm run web

# iOS 시뮬레이터에서 실행 (macOS만)
npm run ios

# Android 에뮬레이터에서 실행
npm run android
```

### 3. 실행 확인

- **백엔드**: http://localhost:3000
- **모바일 앱 (웹)**: http://localhost:8081
- **Health Check**: http://localhost:3000/health

## 🔧 환경 변수 설정

### Backend (.env)

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/newsstand
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
NEWS_API_KEY=your-news-api-key
OPENAI_API_KEY=your-openai-api-key
CORS_ORIGIN=http://localhost:3001,http://localhost:19006
```

## 📱 주요 기능

### 1. 뉴스 피드
- AI 요약된 뉴스 기사 목록
- 카테고리별 필터링 (기술, 비즈니스, 스포츠 등)
- 최신순/인기순 정렬
- 무한 스크롤

### 2. 개인화 추천
- 사용자 읽기 패턴 분석
- 관심사 기반 맞춤 뉴스
- 상호작용 기반 관련도 점수

### 3. 사용자 관리
- 게스트 모드 (비로그인)
- 소셜/이메일 로그인
- 게스트 → 회원 전환
- 설정 및 선호도 관리

### 4. 홈 위젯 (계획)
- iOS/Android 홈 화면 위젯
- 주요 뉴스 미리보기
- 원터치 앱 실행

## 🧪 테스트

### 백엔드 테스트

```bash
cd backend
npm test                    # 전체 테스트 실행
npm run test:watch         # 감시 모드
```

### 프론트엔드 테스트

```bash
cd mobile
npm test                   # Jest 테스트 실행
```

## 🚀 배포

### 백엔드 배포 (예: Railway)

```bash
# Railway CLI 설치 및 로그인
npm install -g @railway/cli
railway login

# 프로젝트 배포
railway deploy
```

### 모바일 앱 배포

```bash
# EAS 빌드 설정
npm install -g @expo/cli
eas build:configure

# iOS 빌드
eas build --platform ios

# Android 빌드
eas build --platform android
```

## 🔐 보안 고려사항

- **입력 검증**: Express Validator를 통한 모든 입력 검증
- **인증**: JWT 기반 안전한 인증 시스템
- **비밀번호**: bcrypt를 통한 해시 암호화
- **API 보안**: Helmet을 통한 보안 헤더 설정
- **Rate Limiting**: DDoS 공격 방지를 위한 요청 제한
- **CORS**: 안전한 교차 출처 요청 관리

## 🔄 API 문서

### 주요 엔드포인트

```
GET    /api/news                    # 뉴스 피드
GET    /api/news/personalized      # 개인화 뉴스
GET    /api/news/:id               # 뉴스 상세
POST   /api/news/:id/interact      # 사용자 상호작용

POST   /api/auth/register          # 회원가입
POST   /api/auth/login             # 로그인
POST   /api/auth/guest             # 게스트 세션 생성
GET    /api/auth/me                # 현재 사용자 정보

GET    /api/user/preferences       # 사용자 설정
PUT    /api/user/preferences       # 설정 업데이트
GET    /api/user/stats             # 사용자 통계
```

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 로드맵

- [x] **v1.0**: 기본 뉴스 피드 및 요약 기능
- [x] **v1.1**: UI/UX 컴포넌트 시스템 구축
- [x] **v1.2**: 향상된 사용자 인터페이스 및 애니메이션
- [ ] **v1.3**: 홈 화면 위젯 구현
- [ ] **v1.4**: 소셜 로그인 (Google, Apple)
- [ ] **v1.5**: 오프라인 읽기 기능
- [ ] **v1.6**: 음성 요약 기능
- [ ] **v2.0**: 웹 대시보드 및 관리자 기능

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 👥 팀

- **개발자**: Newsstand Team
- **이메일**: contact@newsstand.app
- **GitHub**: [@newsstand-team](https://github.com/newsstand-team)

## 🙏 감사의 말

- [News API](https://newsapi.org/) - 뉴스 데이터 제공
- [OpenAI](https://openai.com/) - AI 요약 기능
- [Expo](https://expo.dev/) - 크로스 플랫폼 개발 도구
- [React Native Paper](https://reactnativepaper.com/) - UI 컴포넌트

---

**Newsstand**로 더 스마트하고 효율적인 뉴스 소비를 경험해보세요! 🚀
