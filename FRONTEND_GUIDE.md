# 웨딩 플래너 프론트엔드 가이드

## 개요

웨딩 플래너 앱은 결혼 준비를 돕는 웹 애플리케이션입니다. 사용자가 결혼식 날짜와 준비 시작 날짜를 입력하면, 자동으로 웨딩홀, 스튜디오, 드레스, 메이크업 예약 등의 최적 일정을 계산하여 추천해줍니다.

## 주요 기능

### 1. 날짜 입력 화면
- 결혼식 예정일 입력
- 준비 시작 예정일 입력
- 인디핑크 테마의 깔끔한 디자인

### 2. 추천 일정 타임라인
- D-Day 카운터
- 준비 기간 표시
- 완료 항목 진행률
- 4가지 주요 준비 항목:
  - 🏛️ 웨딩홀 계약
  - 📸 스튜디오 촬영
  - 👗 드레스 투어
  - 💄 메이크업 예약

### 3. 상세 정보 화면
- 각 항목의 상세 설명
- 준비 팁 제공
- 추천 장소 목록 (백엔드 API 연동)
- 완료 체크 기능

## 기술 스택

- **HTML5**: 시맨틱 마크업
- **CSS3**:
  - CSS 변수를 활용한 인디핑크 테마
  - Flexbox & Grid 레이아웃
  - 반응형 디자인
  - 부드러운 애니메이션 효과
- **JavaScript (ES6+)**:
  - 모듈 패턴
  - 클래스 기반 설계
  - LocalStorage를 활용한 데이터 저장
  - Fetch API를 통한 백엔드 연동

## 파일 구조

```
public/
├── index.html          # 메인 HTML 파일
├── css/
│   └── styles.css      # 스타일시트 (인디핑크 테마)
└── js/
    ├── timeline.js     # 타임라인 계산 로직
    └── app.js          # 메인 앱 로직
```

## 화면 구성

### 1. 날짜 입력 화면 (`#date-input-screen`)
```javascript
// 사용자 입력
- 결혼식 예정일: <input type="date">
- 준비 시작 예정일: <input type="date">

// 유효성 검사
- 준비 시작일 ≤ 결혼식 날짜
- 날짜 형식 검증
```

### 2. 타임라인 화면 (`#timeline-screen`)
```javascript
// 요약 정보
- D-Day 카운터
- 준비 기간 (주 단위)
- 완료 항목 수

// 타임라인 아이템
각 항목마다:
- 아이콘
- 제목
- 권장 날짜
- 간단한 설명
- 완료 상태
```

### 3. 상세 화면 (`#detail-screen`)
```javascript
// 상세 정보
- 권장 일정
- 상세 설명
- 준비 팁 목록
- 추천 장소 카드
- 완료 표시 버튼
- 더 많은 장소 보기 버튼
```

## 타임라인 계산 로직

### WeddingTimeline 클래스

```javascript
class WeddingTimeline {
  // 주요 메서드
  setDates(weddingDate, startDate)  // 날짜 설정 및 타임라인 계산
  calculateTimeline()                // 일정 자동 계산
  getDaysBetween(date1, date2)      // 일수 계산
  getDDay()                         // D-Day 계산
  toggleCompleted(itemId)           // 완료 상태 토글
  save() / load()                   // LocalStorage 저장/로드
}
```

### 일정 계산 규칙

각 준비 항목은 결혼식 날짜를 기준으로 역순으로 계산됩니다:

1. **웨딩홀 계약**: 결혼식 6개월 전 (또는 준비 시작 1개월 후)
2. **스튜디오 촬영**: 결혼식 4개월 전 (또는 준비 시작 2개월 후)
3. **드레스 투어**: 결혼식 3개월 전 (또는 준비 시작 3개월 후)
4. **메이크업 예약**: 결혼식 2개월 전 (또는 준비 시작 4개월 후)

※ 준비 기간이 짧은 경우 자동으로 조정됩니다.

## 백엔드 API 연동

### API 엔드포인트

```javascript
// 개발 환경
const apiBaseUrl = 'http://localhost:3000';

// 프로덕션 환경
const apiBaseUrl = ''; // API Gateway URL

// 카테고리별 검색 API
GET /api/wedding-halls   // 웨딩홀 목록
GET /api/studios         // 스튜디오 목록
GET /api/dress           // 드레스샵 목록
GET /api/makeup          // 메이크업샵 목록
```

### API 응답 형식

```json
{
  "items": [
    {
      "name": "장소명",
      "address": "주소",
      "phone": "전화번호"
    }
  ]
}
```

## 데이터 저장

### LocalStorage 활용

```javascript
// 저장되는 데이터
1. wedding-timeline-data
   - weddingDate: 결혼식 날짜
   - startDate: 준비 시작 날짜
   - timeline: 타임라인 배열

2. wedding-timeline-completion
   - {itemId: completed} 형태의 완료 상태 맵
```

## 디자인 시스템

### 인디핑크 테마 색상

```css
--primary-pink: #FFB6C1;    /* 메인 핑크 */
--light-pink: #FFE4E1;      /* 라이트 핑크 */
--dark-pink: #FF69B4;       /* 다크 핑크 */
--accent-pink: #FFC0CB;     /* 액센트 핑크 */
--bg-white: #FFFFFF;        /* 배경 화이트 */
--bg-cream: #FFF8F0;        /* 배경 크림 */
```

### 주요 컴포넌트

1. **카드 (`.card`)**: 메인 컨텐츠 컨테이너
2. **버튼 (`.btn-primary`, `.btn-secondary`)**: 액션 버튼
3. **타임라인 아이템 (`.timeline-item`)**: 일정 항목
4. **장소 카드 (`.place-card`)**: 추천 장소 표시

## 로컬 개발

### 1. 파일 서버 실행

```bash
# Python 3
python -m http.server 8000

# 또는 Node.js
npx http-server public -p 8000
```

### 2. 백엔드 서버 실행

```bash
# Serverless Offline 모드
npm run offline
```

### 3. 브라우저 접속

```
http://localhost:8000
```

## AWS Lambda 배포

### serverless.yml 설정

```yaml
functions:
  # 정적 파일 서빙
  serveStatic:
    handler: src/handlers/frontend.serveStatic
    events:
      - http:
          path: /css/{file}
          method: get
      - http:
          path: /js/{file}
          method: get

  # SPA 라우팅
  serveSPA:
    handler: src/handlers/frontend.serveSPA
    events:
      - http:
          path: /
          method: get
      - http:
          path: /{proxy+}
          method: get
```

### 배포 명령어

```bash
# 개발 환경 배포
npm run deploy:dev

# 프로덕션 배포
npm run deploy:prod
```

## 사용자 흐름

```
1. 앱 접속
   ↓
2. 날짜 입력 화면
   - 결혼식 날짜 입력
   - 준비 시작 날짜 입력
   ↓
3. 일정 추천받기 버튼 클릭
   ↓
4. 타임라인 화면
   - D-Day 확인
   - 추천 일정 확인
   - 각 항목 클릭
   ↓
5. 상세 정보 화면
   - 준비 팁 확인
   - 추천 장소 확인
   - 완료 체크
   ↓
6. 뒤로가기로 타임라인 복귀
   ↓
7. 일정 저장하기
```

## 반응형 디자인

### 브레이크포인트

- **데스크톱**: > 768px
- **모바일**: ≤ 768px

### 모바일 최적화

- 카드 패딩 축소
- 버튼 위치 조정
- 그리드 레이아웃을 단일 컬럼으로 변경
- 폰트 크기 조정

## 브라우저 호환성

- Chrome (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge (최신 버전)

## 향후 개선 사항

- [ ] 사용자 계정 시스템 (로그인/회원가입)
- [ ] 일정 공유 기능
- [ ] 예산 관리 기능
- [ ] 체크리스트 커스터마이징
- [ ] 푸시 알림 (일정 리마인더)
- [ ] 지역별 추천 장소 필터링
- [ ] 리뷰 및 평점 시스템
- [ ] 소셜 미디어 공유

## 문의 및 지원

프로젝트에 대한 문의사항이나 버그 리포트는 GitHub Issues를 통해 제출해주세요.
