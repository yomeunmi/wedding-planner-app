// 로컬 개발 환경 감지
const isOffline = process.env.IS_OFFLINE || process.env.NODE_ENV === 'development';

/**
 * 메이크업 정보 스크래핑 Lambda 핸들러
 */
module.exports.scrape = async (event) => {
  console.log('Makeup scraping handler called');

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
    const MakeupScraper = require('../scrapers/makeupScraper');
    const { batchWrite } = require('../utils/dynamodb');
    const { SCRAPE_URLS } = require('../config/constants');

    console.log('Starting makeup scraping...');
    const allMakeupShops = [];

    // 모든 URL에서 스크래핑
    for (const url of SCRAPE_URLS.MAKEUP) {
      const scraper = new MakeupScraper(url);
      const makeupShops = await scraper.scrape();
      allMakeupShops.push(...makeupShops);
    }

    // DynamoDB에 일괄 저장
    if (allMakeupShops.length > 0) {
      await batchWrite(allMakeupShops);
      console.log(`Successfully saved ${allMakeupShops.length} makeup shops to database`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Makeup scraping completed',
        count: allMakeupShops.length
      })
    };
  } catch (error) {
    console.error('Makeup scraping failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Makeup scraping failed',
        error: error.message
      })
    };
  }
};
