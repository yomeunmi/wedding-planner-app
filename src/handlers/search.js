const { getItemsByCategory } = require('../utils/dynamodb');
const { success, error } = require('../utils/response');
const { CATEGORIES } = require('../config/constants');
const KakaoLocalApi = require('../services/kakaoLocalApi');

// 로컬 개발 환경 감지
const isOffline = process.env.IS_OFFLINE || process.env.NODE_ENV === 'development';

// Kakao API 인스턴스 생성
const kakaoApi = new KakaoLocalApi();

// 로컬 개발용 모의 데이터
const mockWeddingHalls = [
  {
    pk: 'wedding-hall#1',
    sk: '더컨벤션 웨딩홀',
    category: 'wedding-hall',
    name: '더컨벤션 웨딩홀',
    location: '서울 강남구',
    capacity: '200명',
    price: '500만원~',
    imageUrl: 'https://example.com/image1.jpg',
    description: '강남역 인근의 모던한 웨딩홀입니다.',
    createdAt: new Date().toISOString()
  },
  {
    pk: 'wedding-hall#2',
    sk: '그랜드 볼룸',
    category: 'wedding-hall',
    name: '그랜드 볼룸',
    location: '서울 종로구',
    capacity: '300명',
    price: '800만원~',
    imageUrl: 'https://example.com/image2.jpg',
    description: '전통과 현대가 어우러진 웨딩홀입니다.',
    createdAt: new Date().toISOString()
  }
];

const mockStudios = [
  {
    pk: 'studio#1',
    sk: '로맨틱 스튜디오',
    category: 'studio',
    name: '로맨틱 스튜디오',
    location: '서울 성동구',
    style: '스냅, 본식',
    price: '150만원~',
    imageUrl: 'https://example.com/studio1.jpg',
    description: '감성적인 사진을 전문으로 하는 스튜디오입니다.',
    createdAt: new Date().toISOString()
  },
  {
    pk: 'studio#2',
    sk: '블루스카이 스튜디오',
    category: 'studio',
    name: '블루스카이 스튜디오',
    location: '서울 마포구',
    style: '야외, 스냅',
    price: '200만원~',
    imageUrl: 'https://example.com/studio2.jpg',
    description: '자연광을 활용한 아름다운 사진을 연출합니다.',
    createdAt: new Date().toISOString()
  }
];

const mockDressShops = [
  {
    pk: 'dress#1',
    sk: '엘레강스 드레스',
    category: 'dress',
    name: '엘레강스 드레스',
    location: '서울 강남구',
    brand: '베라왕, 프로노비아스',
    price: '300만원~',
    imageUrl: 'https://example.com/dress1.jpg',
    description: '해외 유명 브랜드 드레스를 취급합니다.',
    createdAt: new Date().toISOString()
  },
  {
    pk: 'dress#2',
    sk: '로맨스 브라이덜',
    category: 'dress',
    name: '로맨스 브라이덜',
    location: '서울 용산구',
    brand: '국내 디자이너 브랜드',
    price: '200만원~',
    imageUrl: 'https://example.com/dress2.jpg',
    description: '맞춤 제작 및 대여 서비스를 제공합니다.',
    createdAt: new Date().toISOString()
  }
];

const mockMakeupShops = [
  {
    pk: 'makeup#1',
    sk: '뷰티살롱 에스테',
    category: 'makeup',
    name: '뷰티살롱 에스테',
    location: '서울 강남구 청담동',
    specialty: '본식 메이크업, 피부관리',
    price: '본식: 50만원~, 리허설: 30만원~',
    imageUrl: 'https://example.com/makeup1.jpg',
    description: '고급스럽고 화사한 웨딩 메이크업 전문입니다.',
    createdAt: new Date().toISOString()
  },
  {
    pk: 'makeup#2',
    sk: '나츄럴 뷰티 살롱',
    category: 'makeup',
    name: '나츄럴 뷰티 살롱',
    location: '서울 강남구 논현동',
    specialty: '자연스러운 메이크업, 헤어',
    price: '본식: 45만원~, 리허설: 25만원~',
    imageUrl: 'https://example.com/makeup2.jpg',
    description: '자연스러운 본연의 아름다움을 살려드립니다.',
    createdAt: new Date().toISOString()
  }
];

/**
 * 웨딩홀 검색 API
 */
module.exports.weddingHalls = async (event) => {
  try {
    const { region, limit = 15 } = event.queryStringParameters || {};

    // 로컬 환경에서는 모의 데이터 반환
    if (isOffline) {
      console.log('🔧 Running in offline mode - returning mock data');
      return success({
        category: 'wedding-halls',
        count: mockWeddingHalls.length,
        items: mockWeddingHalls.slice(0, parseInt(limit)),
        isOffline: true,
        message: '로컬 개발 환경입니다. 모의 데이터를 반환합니다.'
      });
    }

    // region 파라미터가 없으면 에러 반환
    if (!region) {
      return error('region 파라미터가 필요합니다. 예: ?region=강남', 400);
    }

    // Kakao Local API로 웨딩홀 검색
    const items = await kakaoApi.searchWeddingHalls(region, parseInt(limit));

    return success({
      category: 'wedding-halls',
      region,
      count: items.length,
      items
    });
  } catch (err) {
    console.error('Error fetching wedding halls:', err);
    return error('Failed to fetch wedding halls');
  }
};

/**
 * 스튜디오 검색 API
 */
module.exports.studios = async (event) => {
  try {
    const { region, limit = 15 } = event.queryStringParameters || {};

    // 로컬 환경에서는 모의 데이터 반환
    if (isOffline) {
      console.log('🔧 Running in offline mode - returning mock data');
      return success({
        category: 'studios',
        count: mockStudios.length,
        items: mockStudios.slice(0, parseInt(limit)),
        isOffline: true,
        message: '로컬 개발 환경입니다. 모의 데이터를 반환합니다.'
      });
    }

    // region 파라미터가 없으면 에러 반환
    if (!region) {
      return error('region 파라미터가 필요합니다. 예: ?region=강남', 400);
    }

    // Kakao Local API로 스튜디오 검색
    const items = await kakaoApi.searchStudios(region, parseInt(limit));

    return success({
      category: 'studios',
      region,
      count: items.length,
      items
    });
  } catch (err) {
    console.error('Error fetching studios:', err);
    return error('Failed to fetch studios');
  }
};

/**
 * 드레스샵 검색 API
 */
module.exports.dress = async (event) => {
  try {
    const { region, limit = 15 } = event.queryStringParameters || {};

    // 로컬 환경에서는 모의 데이터 반환
    if (isOffline) {
      console.log('🔧 Running in offline mode - returning mock data');
      return success({
        category: 'dress-shops',
        count: mockDressShops.length,
        items: mockDressShops.slice(0, parseInt(limit)),
        isOffline: true,
        message: '로컬 개발 환경입니다. 모의 데이터를 반환합니다.'
      });
    }

    // region 파라미터가 없으면 에러 반환
    if (!region) {
      return error('region 파라미터가 필요합니다. 예: ?region=강남', 400);
    }

    // Kakao Local API로 드레스샵 검색
    const items = await kakaoApi.searchDressShops(region, parseInt(limit));

    return success({
      category: 'dress-shops',
      region,
      count: items.length,
      items
    });
  } catch (err) {
    console.error('Error fetching dress shops:', err);
    return error('Failed to fetch dress shops');
  }
};

/**
 * 메이크업 검색 API
 */
module.exports.makeup = async (event) => {
  try {
    const { region, limit = 15 } = event.queryStringParameters || {};

    // 로컬 환경에서는 모의 데이터 반환
    if (isOffline) {
      console.log('🔧 Running in offline mode - returning mock data');
      return success({
        category: 'makeup-shops',
        count: mockMakeupShops.length,
        items: mockMakeupShops.slice(0, parseInt(limit)),
        isOffline: true,
        message: '로컬 개발 환경입니다. 모의 데이터를 반환합니다.'
      });
    }

    // region 파라미터가 없으면 에러 반환
    if (!region) {
      return error('region 파라미터가 필요합니다. 예: ?region=강남', 400);
    }

    // Kakao Local API로 메이크업샵 검색
    const items = await kakaoApi.searchMakeupShops(region, parseInt(limit));

    return success({
      category: 'makeup-shops',
      region,
      count: items.length,
      items
    });
  } catch (err) {
    console.error('Error fetching makeup shops:', err);
    return error('Failed to fetch makeup shops');
  }
};
