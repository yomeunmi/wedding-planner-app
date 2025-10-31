const StudioScraper = require('../scrapers/studioScraper');
const { batchWrite } = require('../utils/dynamodb');
const { SCRAPE_URLS } = require('../config/constants');

/**
 * 스튜디오 정보 스크래핑 Lambda 핸들러
 */
module.exports.scrape = async (event) => {
  console.log('Starting studio scraping...');

  try {
    const allStudios = [];

    // 모든 URL에서 스크래핑
    for (const url of SCRAPE_URLS.STUDIO) {
      const scraper = new StudioScraper(url);
      const studios = await scraper.scrape();
      allStudios.push(...studios);
    }

    // DynamoDB에 일괄 저장
    if (allStudios.length > 0) {
      await batchWrite(allStudios);
      console.log(`Successfully saved ${allStudios.length} studios to database`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Studio scraping completed',
        count: allStudios.length
      })
    };
  } catch (error) {
    console.error('Studio scraping failed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Studio scraping failed',
        error: error.message
      })
    };
  }
};
