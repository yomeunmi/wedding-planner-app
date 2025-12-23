import { Platform } from 'react-native';
import { TestIds } from 'react-native-google-mobile-ads';

// 개발/테스트 환경에서는 테스트 광고 ID 사용
// 프로덕션에서는 실제 AdMob 광고 단위 ID로 교체 필요
const IS_TEST_MODE = __DEV__;

// 테스트 광고 단위 ID (Google에서 제공하는 공식 테스트 ID)
const TEST_AD_UNITS = {
  BANNER: TestIds.BANNER,
  INTERSTITIAL: TestIds.INTERSTITIAL,
  REWARDED: TestIds.REWARDED,
};

// 프로덕션 광고 단위 ID
const PRODUCTION_AD_UNITS = {
  android: {
    BANNER: 'ca-app-pub-7269831011386790/4350883866', // Android 배너 광고 ID
    INTERSTITIAL: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Android 전면 광고 ID (추후 생성)
    REWARDED: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // Android 보상형 광고 ID (추후 생성)
  },
  ios: {
    BANNER: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // iOS 배너 광고 ID (추후 생성)
    INTERSTITIAL: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // iOS 전면 광고 ID (추후 생성)
    REWARDED: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // iOS 보상형 광고 ID (추후 생성)
  },
};

// 현재 환경에 맞는 광고 단위 ID 반환
export const getAdUnitId = (adType) => {
  if (IS_TEST_MODE) {
    return TEST_AD_UNITS[adType];
  }

  const platform = Platform.OS;
  return PRODUCTION_AD_UNITS[platform]?.[adType] || TEST_AD_UNITS[adType];
};

// 광고 설정
export const AD_CONFIG = {
  // 배너 광고 설정
  banner: {
    requestNonPersonalizedAdsOnly: false,
    keywords: ['wedding', 'marriage', 'planning', 'bride', 'groom', '결혼', '웨딩', '신부', '신랑'],
  },

  // 전면 광고 설정
  interstitial: {
    showFrequency: 3, // 3번 화면 전환마다 전면 광고 표시
    minTimeBetweenAds: 60000, // 최소 60초 간격
  },

  // 보상형 광고 설정
  rewarded: {
    rewardAmount: 1,
    rewardType: 'premium_feature',
  },
};

// 광고 단위 ID 상수
export const AD_UNIT_IDS = {
  BANNER: getAdUnitId('BANNER'),
  INTERSTITIAL: getAdUnitId('INTERSTITIAL'),
  REWARDED: getAdUnitId('REWARDED'),
};

export default {
  getAdUnitId,
  AD_CONFIG,
  AD_UNIT_IDS,
  IS_TEST_MODE,
};
