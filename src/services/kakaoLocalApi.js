const axios = require('axios');

/**
 * 카카오 로컬 API 서비스
 */
class KakaoLocalApi {
  constructor() {
    this.apiKey = process.env.KAKAO_API_KEY;
    this.baseUrl = 'https://dapi.kakao.com/v2/local/search/keyword.json';

    if (!this.apiKey) {
      console.warn('⚠️  KAKAO_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.');
    }
  }

  /**
   * 키워드로 장소 검색
   * @param {string} query - 검색 키워드 (예: "강남 웨딩홀")
   * @param {object} options - 추가 옵션
   * @returns {Promise<Array>} 검색 결과 배열
   */
  async searchPlaces(query, options = {}) {
    const {
      size = 15,        // 한 번에 가져올 결과 수 (최대 15)
      page = 1,         // 페이지 번호
      category = null   // 카테고리 필터 (선택사항)
    } = options;

    try {
      const response = await axios.get(this.baseUrl, {
        headers: {
          Authorization: `KakaoAK ${this.apiKey}`
        },
        params: {
          query,
          size,
          page,
          ...(category && { category_group_code: category })
        },
        timeout: 10000
      });

      return response.data.documents;
    } catch (error) {
      if (error.response) {
        console.error(`❌ 카카오 API 오류: ${error.response.status}`, error.response.data);
        if (error.response.status === 401) {
          throw new Error('카카오 API 키가 유효하지 않습니다. KAKAO_API_KEY를 확인하세요.');
        }
      } else {
        console.error('❌ 네트워크 오류:', error.message);
      }
      throw error;
    }
  }

  /**
   * 웨딩홀 검색
   * @param {string} region - 지역 (예: "강남", "서울 강남구")
   * @param {number} limit - 최대 결과 수
   */
  async searchWeddingHalls(region, limit = 15) {
    const keywords = ['웨딩홀', '예식장', '결혼식장'];
    const results = [];

    for (const keyword of keywords) {
      const query = region ? `${region} ${keyword}` : keyword;
      try {
        const places = await this.searchPlaces(query, { size: Math.min(limit, 15) });
        results.push(...places);

        // 충분한 결과를 얻었으면 중단
        if (results.length >= limit) break;
      } catch (error) {
        console.error(`검색 실패 (${query}):`, error.message);
      }
    }

    return this.removeDuplicates(results).slice(0, limit);
  }

  /**
   * 스튜디오 검색
   */
  async searchStudios(region, limit = 15) {
    const keywords = ['웨딩스튜디오', '스튜디오촬영', '본식촬영'];
    const results = [];

    for (const keyword of keywords) {
      const query = region ? `${region} ${keyword}` : keyword;
      try {
        const places = await this.searchPlaces(query, { size: Math.min(limit, 15) });
        results.push(...places);

        if (results.length >= limit) break;
      } catch (error) {
        console.error(`검색 실패 (${query}):`, error.message);
      }
    }

    return this.removeDuplicates(results).slice(0, limit);
  }

  /**
   * 드레스샵 검색
   */
  async searchDressShops(region, limit = 15) {
    const keywords = ['웨딩드레스', '드레스샵', '웨딩드레스대여'];
    const results = [];

    for (const keyword of keywords) {
      const query = region ? `${region} ${keyword}` : keyword;
      try {
        const places = await this.searchPlaces(query, { size: Math.min(limit, 15) });
        results.push(...places);

        if (results.length >= limit) break;
      } catch (error) {
        console.error(`검색 실패 (${query}):`, error.message);
      }
    }

    return this.removeDuplicates(results).slice(0, limit);
  }

  /**
   * 메이크업샵 검색
   */
  async searchMakeupShops(region, limit = 15) {
    const keywords = ['웨딩메이크업', '신부메이크업', '브라이덜메이크업'];
    const results = [];

    for (const keyword of keywords) {
      const query = region ? `${region} ${keyword}` : keyword;
      try {
        const places = await this.searchPlaces(query, { size: Math.min(limit, 15) });
        results.push(...places);

        if (results.length >= limit) break;
      } catch (error) {
        console.error(`검색 실패 (${query}):`, error.message);
      }
    }

    return this.removeDuplicates(results).slice(0, limit);
  }

  /**
   * 중복 제거 (ID 기준)
   */
  removeDuplicates(places) {
    const seen = new Set();
    return places.filter(place => {
      const id = place.id;
      if (seen.has(id)) {
        return false;
      }
      seen.add(id);
      return true;
    });
  }

  /**
   * 카카오 API 응답을 우리 형식으로 변환
   */
  transformToOurFormat(kakaoPlace, category) {
    return {
      pk: `${category}#kakao#${kakaoPlace.id}`,
      sk: kakaoPlace.place_name,
      category,
      id: kakaoPlace.id,
      name: kakaoPlace.place_name,
      location: kakaoPlace.address_name,
      roadAddress: kakaoPlace.road_address_name || kakaoPlace.address_name,
      phone: kakaoPlace.phone || 'N/A',
      categoryName: kakaoPlace.category_name,
      latitude: parseFloat(kakaoPlace.y),
      longitude: parseFloat(kakaoPlace.x),
      placeUrl: kakaoPlace.place_url,
      source: 'kakao_local_api',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

module.exports = KakaoLocalApi;
