# HealthShorts AI 🏃‍♀️💡
### 개인 건강 데이터 기반 AI 코칭 숏츠 자동 생성·배포 플랫폼

---

## 프로젝트 개요

**HealthShorts AI**는 개인의 건강 데이터(수면, 수분, 운동, 기분 등)를 분석하여 매일 60초 분량의 맞춤형 건강 코칭 숏츠 스크립트를 자동 생성하는 MVP 플랫폼입니다.

---

## 🎯 해결하는 문제

| 사용자 유형 | 문제 | 솔루션 |
|------------|------|--------|
| 일반 사용자 | 작심삼일, 동기부여 저하 | 데이터 기반 개인화 코칭 메시지 |
| 헬스 코치/창작자 | 콘텐츠 제작 시간·비용 과다 | AI 자동 스크립트 생성 |
| 디지털 헬스 기업 | 개인화된 콘텐츠 제공 어려움 | 대규모 맞춤형 콘텐츠 자동화 |

---

## ✅ 구현된 기능

### 1. 온보딩 플로우 (4단계)
- 기본 정보 입력 (이름, 나이, 성별, 키, 체중)
- 건강 목표 선택 (다중 선택: 체중감량, 수면개선 등 8가지)
- 활동 수준 선택 (5단계)
- 수면/수분 목표 설정 (슬라이더)

### 2. 대시보드
- 오늘의 건강 수치 실시간 표시 (수분, 수면, 운동, 기분)
- **AI 건강 코치 메시지** — 데이터 분석 기반 맞춤 메시지
- 주간 건강 점수 차트 (Chart.js 바 차트)
- 오늘의 추천 숏츠 리스트
- 헬스 인사이트 티커

### 3. 건강 로그
- 7일 캘린더 스트립으로 날짜 선택
- 일별 건강 기록 카드 (체중, 혈압, 심박수, 수면, 수분, 운동, 기분)
- 모달 폼으로 기록 추가
- CRUD API 연동

### 4. AI 숏츠 생성 ⭐
- 7가지 카테고리 선택 (영양, 운동, 수면, 스트레스, 수분, 마인드셋, 종합)
- 4가지 톤/스타일 선택 (동기부여형, 교육형, 챌린지형, 명상형)
- 내 건강 데이터 활용 ON/OFF 토글
- 추가 요청사항 입력
- 스마트폰 목업 실시간 미리보기
- 생성 → 저장 → 라이브러리 보관

### 5. 숏츠 라이브러리
- 전체/게시됨/초안/카테고리별 필터
- 누적 조회수·좋아요 통계
- 개별 숏츠 상세 보기 (스크립트, 실천 항목)
- 게시/게시취소/삭제 기능

### 6. 건강 분석
- **건강 점수** 원형 차트 (수분/수면/운동/기분 4가지 지표)
- 체중 변화 추이 (Line Chart)
- 수분 섭취 현황 (Bar Chart)
- 수면 패턴 (Line Chart)
- 기분 & 스트레스 (Line Chart)
- AI 인사이트 자동 생성

### 7. 프로필 설정
- 모든 건강 정보 수정 가능
- BMI 자동 계산 표시
- 건강 목표 재설정

---

## 📁 파일 구조

```
/
├── index.html          # 메인 SPA (단일 페이지 앱)
├── css/
│   └── style.css       # 전체 스타일 (다크테마, 반응형)
├── js/
│   └── app.js          # 앱 로직, AI 생성, API 연동
└── README.md
```

---

## 🗄️ 데이터 모델

### `users` 테이블
| 필드 | 타입 | 설명 |
|------|------|------|
| id | text | 사용자 ID |
| name | text | 이름 |
| age | number | 나이 |
| height / weight | number | 키(cm) / 체중(kg) |
| health_goals | array | 건강 목표 목록 |
| activity_level | text | 활동 수준 |
| sleep_goal | number | 목표 수면(분) |
| water_goal | number | 목표 수분(ml) |

### `health_logs` 테이블
| 필드 | 타입 | 설명 |
|------|------|------|
| log_date | text | 기록 날짜 |
| weight | number | 체중(kg) |
| blood_pressure_sys/dia | number | 혈압(mmHg) |
| sleep_hours | number | 수면(분) |
| water_intake | number | 수분(ml) |
| exercise_minutes | number | 운동(분) |
| mood_score | number | 기분(1-10) |

### `shorts_content` 테이블
| 필드 | 타입 | 설명 |
|------|------|------|
| title | text | 숏츠 제목 |
| category | text | 카테고리 |
| script | rich_text | 스크립트 내용 |
| hook_line | text | 오프닝 훅 |
| action_items | array | 실천 항목 |
| status | text | draft/published |
| views / likes | number | 통계 |

---

## 🛠️ 기술 스택

- **Frontend**: Vanilla HTML5 + CSS3 + JavaScript (ES2022)
- **Chart**: Chart.js 4.4.0
- **Icons**: Font Awesome 6.5.0
- **Fonts**: Pretendard (한국어 최적화)
- **API**: RESTful Table API (built-in)
- **Design**: 다크 테마, 모바일 완전 반응형

---

## 🔗 주요 경로

| 경로 | 설명 |
|------|------|
| `/` | 메인 앱 (SPA) |
| `?page=dashboard` | 대시보드 |
| `?page=generate` | AI 숏츠 생성 |
| `?page=library` | 숏츠 라이브러리 |
| `?page=analytics` | 건강 분석 |

---

## 🚀 추천 다음 단계

1. **실제 AI API 연동** — GPT-4/Claude API로 더 자연스러운 스크립트 생성
2. **영상 자동 생성** — 스크립트 → TTS → 자막 → 영상 자동 조합
3. **소셜 공유 통합** — TikTok, Instagram Reels, YouTube Shorts API 연동
4. **웨어러블 연동** — Apple Health, Samsung Health, Fitbit API 연동
5. **헬스 코치 대시보드** — 다수 클라이언트 관리 기능
6. **푸시 알림** — Web Push로 일일 건강 리마인더
7. **B2B API** — 디지털 헬스 기업용 화이트라벨 솔루션
8. **분석 고도화** — 머신러닝 기반 개인화 추천

---

## 💡 MVP 핵심 가치

> "92%의 사람들이 건강 목표 달성에 실패하는 가장 큰 이유는 **지속적인 동기부여 부재**입니다."
> 
> HealthShorts AI는 **개인 데이터 기반 60초 코칭 숏츠**로 매일 행동 변화를 이끕니다.

---

*Built with ❤️ for HealthShorts AI MVP — 2026.02.26*
