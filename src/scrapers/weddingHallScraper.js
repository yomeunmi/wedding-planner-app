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

      // 테스트 HTML 구조에 맞춘 셀렉터
      $('.product-item').each((index, element) => {
        const $elem = $(element);

        const name = this.cleanText($elem.find('.product-name').text());
        const location = this.cleanText($elem.find('.product-location').text());
        const capacity = this.cleanText($elem.find('.product-capacity').text());
        const price = this.cleanText($elem.find('.product-price').text());
        const rating = this.cleanText($elem.find('.star-rating').text());
        const reviewCount = this.cleanText($elem.find('.review-count').text());
        const description = this.cleanText($elem.find('.product-desc').text());
        const imageUrl = $elem.find('.product-image img').attr('src');
        const detailUrl = $elem.find('.product-link').attr('href');

        if (name) {
          halls.push(this.cleanData({
            pk: `${CATEGORIES.WEDDING_HALL}#${Date.now()}#${index}`,
            sk: name,
            category: CATEGORIES.WEDDING_HALL,
            name,
            location,
            capacity,
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

      console.log(`✅ Scraped ${halls.length} wedding halls from ${this.url}`);
      return halls;
    } catch (error) {
      console.error('❌ Wedding hall scraping error:', error);
      return [];
    }
  }
}

module.exports = WeddingHallScraper;
