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

      // 테스트 HTML 구조에 맞춘 셀렉터
      $('.product-item').each((index, element) => {
        const $elem = $(element);

        const name = this.cleanText($elem.find('.product-name').text());
        const location = this.cleanText($elem.find('.product-location').text());
        const style = this.cleanText($elem.find('.product-style').text());
        const price = this.cleanText($elem.find('.product-price').text());
        const rating = this.cleanText($elem.find('.star-rating').text());
        const reviewCount = this.cleanText($elem.find('.review-count').text());
        const description = this.cleanText($elem.find('.product-desc').text());
        const imageUrl = $elem.find('.product-image img').attr('src');
        const detailUrl = $elem.find('.product-link').attr('href');

        if (name) {
          studios.push(this.cleanData({
            pk: `${CATEGORIES.STUDIO}#${Date.now()}#${index}`,
            sk: name,
            category: CATEGORIES.STUDIO,
            name,
            location,
            style,
            price,
            rating: rating ? parseFloat(rating) : null,
            reviewCount,
            description,
            imageUrl,
            detailUrl,
            source: this.url
          }));
        }
      });

      console.log(`✅ Scraped ${studios.length} studios from ${this.url}`);
      return studios;
    } catch (error) {
      console.error('❌ Studio scraping error:', error);
      return [];
    }
  }
}

module.exports = StudioScraper;
