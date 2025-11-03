# Kakao API 통합 테스트 가이드

이 가이드는 Kakao Local API를 사용한 지역 기반 웨딩 정보 검색 기능을 테스트하는 방법을 설명합니다.

## 1. 준비 사항

### 1.1 Kakao API 키 설정

1. `KAKAO_API_SETUP.md` 파일을 참고하여 Kakao REST API 키를 발급받으세요.
2. `.env` 파일을 열고 발급받은 API 키를 입력하세요:

```bash
KAKAO_API_KEY=your_actual_api_key_here
```

### 1.2 의존성 설치

```bash
npm install
```

## 2. 로컬 테스트

### 2.1 서버 시작

```bash
npm run offline
```

서버가 `http://localhost:3000`에서 실행됩니다.

## 3. API 엔드포인트 테스트

### 3.1 웨딩홀 검색

**요청:**
```bash
curl "http://localhost:3000/api/wedding-halls?region=강남&limit=10"
```

**응답 예시:**
```json
{
  "success": true,
  "data": {
    "category": "wedding-halls",
    "region": "강남",
    "count": 10,
    "items": [
      {
        "pk": "wedding-hall#123456#0",
        "sk": "더컨벤션 웨딩홀",
        "category": "wedding-hall",
        "name": "더컨벤션 웨딩홀",
        "location": "서울 강남구 역삼동",
        "address": "서울 강남구 테헤란로 123",
        "phone": "02-1234-5678",
        "roadAddress": "서울 강남구 테헤란로 123",
        "categoryName": "예식장",
        "placeUrl": "http://place.map.kakao.com/12345",
        "distance": "50",
        "source": "kakao-local-api",
        "scrapedAt": "2025-11-03T10:30:00.000Z"
      }
    ]
  }
}
```

### 3.2 스튜디오 검색

**요청:**
```bash
curl "http://localhost:3000/api/studios?region=홍대&limit=15"
```

**매개변수:**
- `region` (필수): 검색할 지역명 (예: 강남, 홍대, 신촌)
- `limit` (선택): 반환할 최대 결과 수 (기본값: 15)

### 3.3 드레스샵 검색

**요청:**
```bash
curl "http://localhost:3000/api/dress?region=명동&limit=10"
```

### 3.4 메이크업샵 검색

**요청:**
```bash
curl "http://localhost:3000/api/makeup?region=청담&limit=10"
```

## 4. 오프라인 모드 (Mock 데이터)

API 키가 없거나 로컬에서만 테스트하고 싶을 때는 오프라인 모드를 사용할 수 있습니다.

오프라인 모드에서는 Kakao API를 호출하지 않고 미리 준비된 모의 데이터를 반환합니다.

**요청 (region 파라미터 없어도 됨):**
```bash
curl "http://localhost:3000/api/wedding-halls"
```

**응답:**
```json
{
  "success": true,
  "data": {
    "category": "wedding-halls",
    "count": 2,
    "items": [...],
    "isOffline": true,
    "message": "로컬 개발 환경입니다. 모의 데이터를 반환합니다."
  }
}
```

## 5. 에러 처리

### 5.1 region 파라미터 누락

**요청:**
```bash
curl "http://localhost:3000/api/wedding-halls"
```

**응답 (온라인 모드):**
```json
{
  "success": false,
  "error": "region 파라미터가 필요합니다. 예: ?region=강남"
}
```
**HTTP 상태 코드:** 400

### 5.2 API 키 누락 또는 잘못된 키

**응답:**
```json
{
  "success": false,
  "error": "Failed to fetch wedding halls"
}
```
**HTTP 상태 코드:** 500

**해결 방법:**
- `.env` 파일에 올바른 `KAKAO_API_KEY`가 설정되어 있는지 확인
- 서버를 재시작 (`npm run offline`)

## 6. 브라우저 테스트

웹 브라우저에서 직접 테스트할 수도 있습니다:

```
http://localhost:3000/api/wedding-halls?region=강남
http://localhost:3000/api/studios?region=홍대
http://localhost:3000/api/dress?region=명동
http://localhost:3000/api/makeup?region=청담
```

## 7. 다양한 지역 검색 예시

```bash
# 서울 주요 지역
curl "http://localhost:3000/api/wedding-halls?region=강남"
curl "http://localhost:3000/api/wedding-halls?region=홍대"
curl "http://localhost:3000/api/wedding-halls?region=여의도"
curl "http://localhost:3000/api/wedding-halls?region=잠실"

# 기타 도시
curl "http://localhost:3000/api/wedding-halls?region=부산"
curl "http://localhost:3000/api/wedding-halls?region=대구"
curl "http://localhost:3000/api/wedding-halls?region=인천"
```

## 8. Postman으로 테스트

Postman을 사용하여 API를 테스트할 수도 있습니다:

1. Postman 실행
2. 새 GET 요청 생성
3. URL 입력: `http://localhost:3000/api/wedding-halls`
4. Query Params 추가:
   - Key: `region`, Value: `강남`
   - Key: `limit`, Value: `10`
5. Send 버튼 클릭

## 9. 주의사항

- **API 할당량:** Kakao API는 하루 300,000건의 무료 요청을 제공합니다.
- **검색어:** `region` 파라미터는 한글 지역명을 사용합니다 (예: 강남, 홍대, 명동).
- **결과 품질:** Kakao Local API는 실제 장소 데이터를 기반으로 하므로, 검색 키워드에 따라 결과가 다를 수 있습니다.
- **중복 제거:** 같은 장소가 여러 키워드로 검색될 수 있으므로, 자동으로 중복을 제거합니다.

## 10. AWS Lambda 배포 후 테스트

AWS에 배포한 후에는 API Gateway URL을 사용합니다:

```bash
# 배포
npm run deploy

# 배포 완료 후 출력되는 URL 사용
curl "https://your-api-gateway-url.amazonaws.com/dev/api/wedding-halls?region=강남"
```

## 11. 문제 해결

### API 응답이 없음
- `.env` 파일이 올바르게 설정되었는지 확인
- 서버를 재시작 (`Ctrl+C` 후 `npm run offline`)
- API 키가 유효한지 Kakao Developers 콘솔에서 확인

### 검색 결과가 비어있음
- `region` 파라미터를 더 일반적인 지역명으로 변경 (예: "강남구" → "강남")
- 다른 카테고리로 테스트해보기
- Kakao Map에서 해당 지역에 실제 업체가 존재하는지 확인

### CORS 에러 (브라우저)
- 이미 CORS가 활성화되어 있으므로, 브라우저 캐시를 삭제하고 다시 시도

## 12. 개발 팁

### 로그 확인
서버 콘솔에서 실시간 로그를 확인할 수 있습니다:
- API 요청 정보
- Kakao API 응답
- 에러 메시지

### 디버깅
`src/services/kakaoLocalApi.js` 파일의 `searchPlaces` 메서드에서 Kakao API 응답을 확인할 수 있습니다.
