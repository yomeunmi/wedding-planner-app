// 카테고리 상수
const CATEGORIES = {
  WEDDING_HALL: 'wedding-hall',
  STUDIO: 'studio',
  DRESS: 'dress'
};

// 스크래핑 대상 URL들
const SCRAPE_URLS = {
  WEDDING_HALL: [
    'https://www.weddingn.co.kr/hall/list',
    'https://www.iwedding.co.kr/wedding/hall'
    // 실제 스크래핑할 URL들을 추가하세요
  ],
  STUDIO: [
    'https://www.weddingn.co.kr/studio/list',
    'https://www.iwedding.co.kr/wedding/studio'
    // 실제 스크래핑할 URL들을 추가하세요
  ],
  DRESS: [
    'https://www.weddingn.co.kr/dress/list',
    'https://www.iwedding.co.kr/wedding/dress'
    // 실제 스크래핑할 URL들을 추가하세요
  ]
};

// DynamoDB 테이블명
const TABLE_NAME = process.env.DYNAMODB_TABLE;

module.exports = {
  CATEGORIES,
  SCRAPE_URLS,
  TABLE_NAME
};
