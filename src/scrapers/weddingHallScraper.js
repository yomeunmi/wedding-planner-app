const BaseScraper = require('./base');
const { CATEGORIES } = require('../config/constants');

/**
 * 웨딩홀 스크래퍼
 */
class WeddingHallScraper extends BaseScraper {
  constructor(url) {
    super(url);
  }

  /**
   * 웨딩홀 정보 스크래핑
   */
  async scrape() {
    try {
      const html = await this.fetchHTML();
      const $ = this.parseHTML(html);
      const halls = [];

      // TODO: 실제 웹사이트 구조에 맞게 셀렉터 수정 필요
      // 예시 구조입니다
      $('.hall-item').each((index, element) => {
        const name = $(element).find('.hall-name').text().trim();
        const location = $(element).find('.hall-location').text().trim();
        const capacity = $(element).find('.hall-capacity').text().trim();
        const price = $(element).find('.hall-price').text().trim();
        const imageUrl = $(element).find('.hall-image img').attr('src');
        const detailUrl = $(element).find('a').attr('href');

        if (name) {
          halls.push(this.cleanData({
            pk: `${CATEGORIES.WEDDING_HALL}#${Date.now()}#${index}`,
            sk: name,
            category: CATEGORIES.WEDDING_HALL,
            name,
            location,
            capacity,
            price,
            imageUrl,
            detailUrl,
            source: this.url
          }));
        }
      });

      console.log(`Scraped ${halls.length} wedding halls from ${this.url}`);
      return halls;
    } catch (error) {
      console.error('Wedding hall scraping error:', error);
      return [];
    }
  }
}

module.exports = WeddingHallScraper;
