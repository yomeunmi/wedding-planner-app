const BaseScraper = require('./base');
const { CATEGORIES } = require('../config/constants');

/**
 * 스튜디오 스크래퍼
 */
class StudioScraper extends BaseScraper {
  constructor(url) {
    super(url);
  }

  /**
   * 스튜디오 정보 스크래핑
   */
  async scrape() {
    try {
      const html = await this.fetchHTML();
      const $ = this.parseHTML(html);
      const studios = [];

      // TODO: 실제 웹사이트 구조에 맞게 셀렉터 수정 필요
      // 예시 구조입니다
      $('.studio-item').each((index, element) => {
        const name = $(element).find('.studio-name').text().trim();
        const location = $(element).find('.studio-location').text().trim();
        const style = $(element).find('.studio-style').text().trim();
        const price = $(element).find('.studio-price').text().trim();
        const imageUrl = $(element).find('.studio-image img').attr('src');
        const detailUrl = $(element).find('a').attr('href');

        if (name) {
          studios.push(this.cleanData({
            pk: `${CATEGORIES.STUDIO}#${Date.now()}#${index}`,
            sk: name,
            category: CATEGORIES.STUDIO,
            name,
            location,
            style,
            price,
            imageUrl,
            detailUrl,
            source: this.url
          }));
        }
      });

      console.log(`Scraped ${studios.length} studios from ${this.url}`);
      return studios;
    } catch (error) {
      console.error('Studio scraping error:', error);
      return [];
    }
  }
}

module.exports = StudioScraper;
