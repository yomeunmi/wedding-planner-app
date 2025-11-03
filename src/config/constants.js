const path = require('path');

// 카테고리 상수
const CATEGORIES = {
  WEDDING_HALL: 'wedding-hall',
  STUDIO: 'studio',
  DRESS: 'dress',
  MAKEUP: 'makeup'
};

// 로컬 개발 환경 감지
const isOffline = process.env.IS_OFFLINE || process.env.NODE_ENV === 'development';

// 스크래핑 대상 URL들
const SCRAPE_URLS = {
  WEDDING_HALL: isOffline
    ? [path.join(__dirname, '../../test/mock-html/wedding-halls.html')]
    : [
        'https://www.weddingn.co.kr/hall/list',
        'https://www.iwedding.co.kr/wedding/hall'
      ],
  STUDIO: isOffline
    ? [path.join(__dirname, '../../test/mock-html/studios.html')]
    : [
        'https://www.weddingn.co.kr/studio/list',
        'https://www.iwedding.co.kr/wedding/studio'
      ],
  DRESS: isOffline
    ? [path.join(__dirname, '../../test/mock-html/dress.html')]
    : [
        'https://www.weddingn.co.kr/dress/list',
        'https://www.iwedding.co.kr/wedding/dress'
      ],
  MAKEUP: isOffline
    ? [path.join(__dirname, '../../test/mock-html/makeup.html')]
    : [
        'https://www.weddingn.co.kr/makeup/list',
        'https://www.iwedding.co.kr/wedding/makeup'
      ]
};

// DynamoDB 테이블명
const TABLE_NAME = process.env.DYNAMODB_TABLE;

module.exports = {
  CATEGORIES,
  SCRAPE_URLS,
  TABLE_NAME,
  isOffline
};
