const axios = require('axios');
const cheerio = require('cheerio');

/**
 * 기본 스크래퍼 클래스
 */
class BaseScraper {
  constructor(url) {
    this.url = url;
    this.axiosConfig = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    };
  }

  /**
   * HTML 가져오기
   */
  async fetchHTML() {
    try {
      const response = await axios.get(this.url, this.axiosConfig);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch ${this.url}:`, error.message);
      throw error;
    }
  }

  /**
   * Cheerio로 HTML 파싱
   */
  parseHTML(html) {
    return cheerio.load(html);
  }

  /**
   * 스크래핑 실행 (하위 클래스에서 구현)
   */
  async scrape() {
    throw new Error('scrape() method must be implemented');
  }

  /**
   * 데이터 정제
   */
  cleanData(data) {
    // 기본적인 데이터 정제 로직
    return {
      ...data,
      scrapedAt: new Date().toISOString()
    };
  }
}

module.exports = BaseScraper;
