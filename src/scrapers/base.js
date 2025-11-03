const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

/**
 * 기본 스크래퍼 클래스
 */
class BaseScraper {
  constructor(url) {
    this.url = url;
    this.isLocalFile = this.url.includes('.html') || this.url.startsWith('/');
    this.axiosConfig = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    };
  }

  /**
   * HTML 가져오기 (URL 또는 로컬 파일)
   */
  async fetchHTML() {
    try {
      if (this.isLocalFile) {
        // 로컬 HTML 파일 읽기
        console.log(`Reading local file: ${this.url}`);
        const html = await fs.readFile(this.url, 'utf-8');
        return html;
      } else {
        // HTTP로 웹페이지 가져오기
        const response = await axios.get(this.url, this.axiosConfig);
        return response.data;
      }
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

  /**
   * 텍스트 정제 (공백 제거 등)
   */
  cleanText(text) {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
  }
}

module.exports = BaseScraper;
