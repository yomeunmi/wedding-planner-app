const BaseScraper = require('./base');
const { CATEGORIES } = require('../config/constants');

/**
 * 드레스샵 스크래퍼
 */
class DressScraper extends BaseScraper {
  constructor(url) {
    super(url);
  }

  /**
   * 드레스샵 정보 스크래핑
   */
  async scrape() {
    try {
      const html = await this.fetchHTML();
      const $ = this.parseHTML(html);
      const dressShops = [];

      // TODO: 실제 웹사이트 구조에 맞게 셀렉터 수정 필요
      // 예시 구조입니다
      $('.dress-item').each((index, element) => {
        const name = $(element).find('.dress-name').text().trim();
        const location = $(element).find('.dress-location').text().trim();
        const brand = $(element).find('.dress-brand').text().trim();
        const price = $(element).find('.dress-price').text().trim();
        const imageUrl = $(element).find('.dress-image img').attr('src');
        const detailUrl = $(element).find('a').attr('href');

        if (name) {
          dressShops.push(this.cleanData({
            pk: `${CATEGORIES.DRESS}#${Date.now()}#${index}`,
            sk: name,
            category: CATEGORIES.DRESS,
            name,
            location,
            brand,
            price,
            imageUrl,
            detailUrl,
            source: this.url
          }));
        }
      });

      console.log(`Scraped ${dressShops.length} dress shops from ${this.url}`);
      return dressShops;
    } catch (error) {
      console.error('Dress shop scraping error:', error);
      return [];
    }
  }
}

module.exports = DressScraper;
