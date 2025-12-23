import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS, AD_CONFIG } from '../config/adConfig';

class AdManager {
  constructor() {
    this.interstitialAd = null;
    this.isInterstitialLoaded = false;
    this.screenViewCount = 0;
    this.lastInterstitialTime = 0;
    this.isInitialized = false;
  }

  // AdManager 초기화
  async initialize() {
    if (this.isInitialized) return;

    try {
      await this.loadInterstitialAd();
      this.isInitialized = true;
      console.log('AdManager initialized successfully');
    } catch (error) {
      console.log('AdManager initialization failed:', error);
    }
  }

  // 전면 광고 로드
  loadInterstitialAd() {
    return new Promise((resolve, reject) => {
      try {
        this.interstitialAd = InterstitialAd.createForAdRequest(AD_UNIT_IDS.INTERSTITIAL, {
          requestNonPersonalizedAdsOnly: false,
          keywords: AD_CONFIG.banner.keywords,
        });

        const unsubscribeLoaded = this.interstitialAd.addAdEventListener(
          AdEventType.LOADED,
          () => {
            this.isInterstitialLoaded = true;
            console.log('Interstitial ad loaded');
            resolve();
          }
        );

        const unsubscribeClosed = this.interstitialAd.addAdEventListener(
          AdEventType.CLOSED,
          () => {
            this.isInterstitialLoaded = false;
            // 광고 닫힌 후 새 광고 로드
            this.loadInterstitialAd();
          }
        );

        const unsubscribeError = this.interstitialAd.addAdEventListener(
          AdEventType.ERROR,
          (error) => {
            console.log('Interstitial ad error:', error);
            this.isInterstitialLoaded = false;
            reject(error);
          }
        );

        this.interstitialAd.load();

        // 리스너 정리를 위해 저장
        this._unsubscribeLoaded = unsubscribeLoaded;
        this._unsubscribeClosed = unsubscribeClosed;
        this._unsubscribeError = unsubscribeError;
      } catch (error) {
        reject(error);
      }
    });
  }

  // 화면 전환 시 호출 - 조건에 따라 전면 광고 표시
  onScreenChange() {
    this.screenViewCount++;

    const { showFrequency, minTimeBetweenAds } = AD_CONFIG.interstitial;
    const currentTime = Date.now();
    const timeSinceLastAd = currentTime - this.lastInterstitialTime;

    // 빈도 조건과 시간 간격 조건 확인
    if (
      this.screenViewCount >= showFrequency &&
      timeSinceLastAd >= minTimeBetweenAds
    ) {
      this.showInterstitialAd();
    }
  }

  // 전면 광고 표시
  async showInterstitialAd() {
    if (!this.isInterstitialLoaded || !this.interstitialAd) {
      console.log('Interstitial ad not ready');
      return false;
    }

    try {
      await this.interstitialAd.show();
      this.screenViewCount = 0;
      this.lastInterstitialTime = Date.now();
      return true;
    } catch (error) {
      console.log('Failed to show interstitial ad:', error);
      return false;
    }
  }

  // 전면 광고 강제 표시 (특정 이벤트에서)
  async forceShowInterstitialAd() {
    const currentTime = Date.now();
    const timeSinceLastAd = currentTime - this.lastInterstitialTime;

    // 최소 시간 간격 체크
    if (timeSinceLastAd < AD_CONFIG.interstitial.minTimeBetweenAds) {
      console.log('Too soon to show another interstitial ad');
      return false;
    }

    return await this.showInterstitialAd();
  }

  // 전면 광고 로드 상태 확인
  isInterstitialReady() {
    return this.isInterstitialLoaded;
  }

  // 리소스 정리
  destroy() {
    if (this._unsubscribeLoaded) this._unsubscribeLoaded();
    if (this._unsubscribeClosed) this._unsubscribeClosed();
    if (this._unsubscribeError) this._unsubscribeError();
    this.interstitialAd = null;
    this.isInterstitialLoaded = false;
    this.isInitialized = false;
  }
}

// 싱글톤 인스턴스
const adManager = new AdManager();
export default adManager;
