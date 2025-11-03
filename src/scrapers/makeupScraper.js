const BaseScraper = require('./base');
const { CATEGORIES } = require('../config/constants');

/**
 * 메이크업 스크래퍼
 */
class MakeupScraper extends BaseScraper {
  constructor(url) {
    super(url);
  }

  /**
   * 메이크업 정보 스크래핑
   */
  async scrape() {
    try {
      const html = await this.fetchHTML();
      const $ = this.parseHTML(html);
      const makeupShops = [];

      // 테스트 HTML 구조에 맞춘 셀렉터
      $('.product-item').each((index, element) => {
        const $elem = $(element);

        const name = this.cleanText($elem.find('.product-name').text());
        const location = this.cleanText($elem.find('.product-location').text());
        const specialty = this.cleanText($elem.find('.product-specialty').text());
        const price = this.cleanText($elem.find('.product-price').text());
        const rating = this.cleanText($elem.find('.star-rating').text());
        const reviewCount = this.cleanText($elem.find('.review-count').text());
        const description = this.cleanText($elem.find('.product-desc').text());
        const imageUrl = $elem.find('.product-image img').attr('src');
        const detailUrl = $elem.find('.product-link').attr('href');

        if (name) {
          makeupShops.push(this.cleanData({
            pk: `${CATEGORIES.MAKEUP}#${Date.now()}#${index}`,
            sk: name,
            category: CATEGORIES.MAKEUP,
            name,
            location,
            specialty,
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

      console.log(`✅ Scraped ${makeupShops.length} makeup shops from ${this.url}`);
      return makeupShops;
    } catch (error) {
      console.error('❌ Makeup shop scraping error:', error);
      return [];
    }
  }
}

module.exports = MakeupScraper;
