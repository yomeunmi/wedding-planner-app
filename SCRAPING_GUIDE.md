# 웨딩 정보 스크래핑 사이트 추천 및 분석

## 🎯 추천 웨딩 정보 사이트

### 1. 웨딩앤 (https://www.weddingn.co.kr) ⭐ 가장 추천
- **카테고리**: 웨딩홀, 스튜디오, 드레스, 메이크업, 예물, 허니문 등
- **장점**:
  - 한국 최대 웨딩 정보 플랫폼
  - 상세한 정보와 리뷰
  - 지역별, 가격대별 필터링
- **URL 구조**:
  - 웨딩홀: `https://www.weddingn.co.kr/hall/list`
  - 스튜디오: `https://www.weddingn.co.kr/studio/list`
  - 드레스: `https://www.weddingn.co.kr/dress/list`
  - 메이크업: `https://www.weddingn.co.kr/makeup/list`

### 2. 아이웨딩 (https://www.iwedding.co.kr)
- **카테고리**: 웨딩홀, 스튜디오, 드레스, 예물 등
- **장점**:
  - 오래된 플랫폼으로 신뢰도 높음
  - 비교 기능 제공
- **URL 구조**:
  - 웨딩홀: `https://www.iwedding.co.kr/wedding/hall`
  - 스튜디오: `https://www.iwedding.co.kr/wedding/studio`

### 3. 비드바이코리아 (https://www.bidbykorea.com)
- **카테고리**: 웨딩홀, 스튜디오, 드레스
- **장점**:
  - 견적 비교 시스템
  - 할인 정보 제공

## ⚠️ 중요 유의사항

### 법적 고려사항
1. **robots.txt 확인**: 스크래핑 전 사이트의 robots.txt 확인 필수
2. **이용약관**: 각 사이트의 이용약관에서 데이터 수집 가능 여부 확인
3. **개인정보보호법**: 개인정보는 수집하지 않기
4. **저작권**: 이미지 등 저작물 사용 시 저작권 주의

### 기술적 고려사항
1. **Rate Limiting**: 요청 간 딜레이 설정 (1-2초 권장)
2. **User-Agent**: 적절한 User-Agent 헤더 사용
3. **에러 처리**: 429, 403 등 차단 응답 처리
4. **동적 콘텐츠**: JavaScript로 로딩되는 경우 Puppeteer 필요

## 📋 일반적인 웨딩 사이트 HTML 구조

### 웨딩홀 목록 페이지 구조 예시

```html
<!-- 일반적인 구조 -->
<div class="list-container">
  <div class="item-card">
    <div class="item-image">
      <img src="image-url.jpg" alt="웨딩홀명">
    </div>
    <div class="item-info">
      <h3 class="item-name">웨딩홀 이름</h3>
      <p class="item-location">서울 강남구</p>
      <p class="item-capacity">200명</p>
      <p class="item-price">500만원~</p>
      <div class="item-rating">
        <span class="star">★★★★☆</span>
        <span class="review-count">(120)</span>
      </div>
    </div>
    <a href="/hall/detail/123" class="item-link">자세히 보기</a>
  </div>
</div>
```

### 실제 CSS 선택자 예시 (웨딩앤 스타일)

```javascript
// 웨딩앤 구조 (추정)
{
  itemCard: '.product_list li',
  name: '.product_name',
  location: '.product_location',
  image: '.product_image img',
  price: '.product_price',
  rating: '.product_rating',
  link: 'a.product_link'
}
```

## 🛠️ 대안: 공개 API 사용

스크래핑 대신 공개 API를 사용하는 것이 더 안전합니다:

### 추천 공개 API
1. **카카오 로컬 API**
   - 장소 검색으로 웨딩홀, 스튜디오 정보 수집 가능
   - https://developers.kakao.com/docs/latest/ko/local/dev-guide

2. **네이버 검색 API**
   - 블로그, 카페에서 웨딩 정보 수집
   - https://developers.naver.com/docs/serviceapi/search/

3. **Google Places API**
   - 웨딩홀, 스튜디오 정보 및 리뷰
   - https://developers.google.com/maps/documentation/places/web-service

## 📝 권장 개발 방식

### 단계별 접근

**1단계: 공개 API 사용 (권장)**
```javascript
// 카카오 로컬 API 예시
const axios = require('axios');

async function searchWeddingHalls(query, location) {
  const response = await axios.get('https://dapi.kakao.com/v2/local/search/keyword.json', {
    headers: {
      'Authorization': 'KakaoAK YOUR_API_KEY'
    },
    params: {
      query: `${location} 웨딩홀`,
      size: 15
    }
  });
  return response.data.documents;
}
```

**2단계: 웹 스크래핑 (조심스럽게)**
- 사이트 정책 확인 후
- Rate limiting 적용
- 에러 처리 철저히

**3단계: 직접 데이터 구축**
- 소수의 검증된 데이터로 시작
- 사용자 리뷰와 피드백으로 확장

## 🔍 로컬 테스트용 HTML 파일

실제 스크래핑 테스트를 위한 로컬 HTML 파일을 생성하여 테스트하는 것을 권장합니다.

---

**다음 단계 선택:**

1. **공개 API 사용**: 카카오/네이버 API로 안전하게 데이터 수집
2. **웹 스크래핑**: 특정 사이트 분석 후 조심스럽게 구현
3. **하이브리드**: API + 크롤링 조합

어떤 방식으로 진행하시겠습니까?
