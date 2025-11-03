// 로컬 개발 환경 감지
const isOffline = process.env.IS_OFFLINE || process.env.NODE_ENV === 'development';

/**
 * 웨딩홀 정보 스크래핑 Lambda 핸들러
 */
module.exports.scrape = async (event) => {
  console.log('Wedding hall scraping handler called');

  // 로컬 환경에서는 스크래핑 스킵
  if (isOffline) {
    console.log('🔧 Running in offline mode - skipping scraping');
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: '로컬 개발 환경에서는 스크래핑을 실행하지 않습니다.',
        isOffline: true,
        note: 'AWS에 배포 후 실제 스크래핑이 실행됩니다.'
      })
    };
  }

  try {
    const WeddingHallScraper = require('../scrapers/weddingHallScraper');
    const { batchWrite } = require('../utils/dynamodb');
    const { SCRAPE_URLS } = require('../config/constants');

    console.log('Starting wedding hall scraping...');
    const allHalls = [];

    // 모든 URL에서 스크래핑
    for (const url of SCRAPE_URLS.WEDDING_HALL) {
      const scraper = new WeddingHallScraper(url);
      const halls = await scraper.scrape();
      allHalls.push(...halls);
    }

    // DynamoDB에 일괄 저장
    if (allHalls.length > 0) {
      await batchWrite(allHalls);
      console.log(`Successfully saved ${allHalls.length} wedding halls to database`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Wedding hall scraping completed',
        count: allHalls.length
      })
    };
  } catch (error) {
    console.error('Wedding hall scraping failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Wedding hall scraping failed',
        error: error.message
      })
    };
  }
};
