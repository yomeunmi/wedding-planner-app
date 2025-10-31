# 내 손안에 웨딩플래너 🎊

서버리스 환경에서 동작하는 웨딩 정보 스크래핑 및 제공 서비스입니다.

## 🎯 처음 시작하시나요?

**Java/Spring 개발자이신가요?** Node.js와 Serverless가 처음이시라면 먼저 이 가이드를 읽어보세요!

👉 **[Java/Spring 개발자를 위한 시작 가이드](./GETTING_STARTED.md)** 👈

이 가이드에서는 다음 내용을 다룹니다:
- Node.js 설치 및 환경 설정
- 프로젝트 다운로드 및 실행 방법
- Spring과 Serverless 개념 비교
- 로컬 개발 및 AWS 배포 방법

**npm install 오류가 발생하나요?**

🔧 **[문제 해결 가이드](./TROUBLESHOOTING.md)** - EACCES 권한 오류, ERESOLVE 충돌 등 해결 방법

## 📋 프로젝트 개요

이 프로젝트는 AWS Lambda와 DynamoDB를 사용하여 웨딩 관련 정보(웨딩홀, 스튜디오, 드레스샵)를 웹에서 스크래핑하고 API로 제공하는 서버리스 애플리케이션입니다.

## 🏗️ 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                     AWS Lambda Functions                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  스크래핑 함수들  │  │   검색 API 함수  │                │
│  │                  │  │                  │                │
│  │ • 웨딩홀         │  │ • GET /wedding-  │                │
│  │ • 스튜디오       │  │   halls          │                │
│  │ • 드레스샵       │  │ • GET /studios   │                │
│  │                  │  │ • GET /dress     │                │
│  │ (매일 자동 실행) │  │                  │                │
│  └──────────────────┘  └──────────────────┘                │
│           │                      │                           │
│           └──────────┬───────────┘                           │
└──────────────────────┼───────────────────────────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  DynamoDB Table │
              │                 │
              │  웨딩 정보 저장  │
              └─────────────────┘
```

## 🚀 시작하기

### 사전 요구사항

- Node.js 18.x 이상
- AWS CLI 설정
- AWS 계정 및 적절한 권한

### 설치

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 수정하여 필요한 환경 변수 설정
```

### 배포

```bash
# 개발 환경 배포
npm run deploy:dev

# 프로덕션 환경 배포
npm run deploy:prod
```

### 로컬 개발

```bash
# Serverless Offline으로 로컬 실행
npm run offline
```

## 📁 프로젝트 구조

```
.
├── src/
│   ├── handlers/              # Lambda 핸들러
│   │   ├── weddingHalls.js   # 웨딩홀 스크래핑
│   │   ├── studios.js        # 스튜디오 스크래핑
│   │   ├── dress.js          # 드레스샵 스크래핑
│   │   └── search.js         # 검색 API
│   ├── scrapers/             # 스크래핑 로직
│   │   ├── base.js           # 기본 스크래퍼 클래스
│   │   ├── weddingHallScraper.js
│   │   ├── studioScraper.js
│   │   └── dressScraper.js
│   ├── utils/                # 유틸리티
│   │   ├── dynamodb.js       # DynamoDB 헬퍼
│   │   └── response.js       # API 응답 헬퍼
│   └── config/               # 설정
│       └── constants.js      # 상수 정의
├── serverless.yml            # Serverless 설정
├── package.json              # 패키지 설정
└── .env.example              # 환경 변수 예시
```

## 🔧 주요 기능

### 1. 자동 스크래핑
- 매일 자동으로 웨딩 관련 웹사이트에서 최신 정보 수집
- 웨딩홀, 스튜디오, 드레스샵 정보 크롤링
- DynamoDB에 자동 저장

### 2. RESTful API
- `GET /api/wedding-halls` - 웨딩홀 목록 조회
- `GET /api/studios` - 스튜디오 목록 조회
- `GET /api/dress` - 드레스샵 목록 조회

### 3. 쿼리 파라미터
- `limit` - 반환할 항목 수 (기본값: 50)

예시:
```bash
GET /api/wedding-halls?limit=20
```

## 🛠️ 커스터마이징

### 스크래핑 대상 URL 추가

`src/config/constants.js` 파일에서 스크래핑할 URL을 추가할 수 있습니다:

```javascript
const SCRAPE_URLS = {
  WEDDING_HALL: [
    'https://example.com/wedding-halls',
    // 추가 URL들...
  ],
  // ...
};
```

### 스크래퍼 로직 수정

각 스크래퍼 파일(`src/scrapers/*.js`)에서 실제 웹사이트의 HTML 구조에 맞게 셀렉터를 수정해야 합니다:

```javascript
// src/scrapers/weddingHallScraper.js
$('.actual-class-name').each((index, element) => {
  const name = $(element).find('.actual-name-selector').text().trim();
  // ...
});
```

## 📊 DynamoDB 스키마

```
{
  "pk": "wedding-hall#timestamp#index",  // Partition Key
  "sk": "venue-name",                    // Sort Key
  "category": "wedding-hall",            // GSI
  "name": "웨딩홀 이름",
  "location": "서울 강남구",
  "capacity": "200명",
  "price": "500만원",
  "imageUrl": "https://...",
  "detailUrl": "https://...",
  "source": "https://...",
  "scrapedAt": "2025-10-31T12:00:00Z",
  "createdAt": "2025-10-31T12:00:00Z",
  "updatedAt": "2025-10-31T12:00:00Z"
}
```

## 🔐 보안 고려사항

1. **Rate Limiting**: 웹사이트의 이용 약관을 확인하고 적절한 딜레이 추가
2. **User-Agent**: 적절한 User-Agent 설정
3. **권한 관리**: AWS IAM 역할을 최소 권한으로 설정
4. **환경 변수**: 민감한 정보는 환경 변수나 AWS Secrets Manager 사용

## 📝 TODO

- [ ] 실제 웹사이트 구조에 맞게 스크래퍼 셀렉터 수정
- [ ] 에러 핸들링 및 재시도 로직 추가
- [ ] 중복 데이터 처리 로직 구현
- [ ] 테스트 코드 작성
- [ ] API 페이지네이션 구현
- [ ] 검색 필터링 기능 추가 (지역, 가격대 등)
- [ ] CloudWatch 알람 설정
- [ ] API Gateway 사용량 계획 설정

## 📄 라이선스

MIT

## 👥 기여

이슈와 풀 리퀘스트를 환영합니다!
