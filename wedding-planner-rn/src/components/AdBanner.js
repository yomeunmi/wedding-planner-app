import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { AD_UNIT_IDS, AD_CONFIG } from '../config/adConfig';

const AdBanner = ({
  size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER,
  style,
  containerStyle,
  onAdLoaded,
  onAdFailedToLoad,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleAdLoaded = () => {
    setIsLoaded(true);
    setHasError(false);
    onAdLoaded?.();
  };

  const handleAdFailedToLoad = (error) => {
    console.log('Banner ad failed to load:', error);
    setHasError(true);
    setIsLoaded(false);
    onAdFailedToLoad?.(error);
  };

  // 광고 로드 실패 시 아무것도 표시하지 않음
  if (hasError) {
    return null;
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <BannerAd
        unitId={AD_UNIT_IDS.BANNER}
        size={size}
        requestOptions={{
          requestNonPersonalizedAdsOnly: AD_CONFIG.banner.requestNonPersonalizedAdsOnly,
          keywords: AD_CONFIG.banner.keywords,
        }}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={handleAdFailedToLoad}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});

export default AdBanner;
