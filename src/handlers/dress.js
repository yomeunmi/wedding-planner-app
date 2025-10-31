const DressScraper = require('../scrapers/dressScraper');
const { batchWrite } = require('../utils/dynamodb');
const { SCRAPE_URLS } = require('../config/constants');

/**
 * 드레스샵 정보 스크래핑 Lambda 핸들러
 */
module.exports.scrape = async (event) => {
  console.log('Starting dress shop scraping...');

  try {
    const allDressShops = [];

    // 모든 URL에서 스크래핑
    for (const url of SCRAPE_URLS.DRESS) {
      const scraper = new DressScraper(url);
      const dressShops = await scraper.scrape();
      allDressShops.push(...dressShops);
    }

    // DynamoDB에 일괄 저장
    if (allDressShops.length > 0) {
      await batchWrite(allDressShops);
      console.log(`Successfully saved ${allDressShops.length} dress shops to database`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Dress shop scraping completed',
        count: allDressShops.length
      })
    };
  } catch (error) {
    console.error('Dress shop scraping failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Dress shop scraping failed',
        error: error.message
      })
    };
  }
};
