import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';
import StepIndicator from '../components/StepIndicator';

const ONBOARDING_STEPS = ['날짜 설정', '타임라인', '예산 설정', '배경 선택'];
const TOTAL_STEPS = 4;

export default function BackgroundImageScreen({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isOnboarding, setIsOnboarding] = useState(false);

  useEffect(() => {
    checkIfOnboarding();
  }, []);

  const checkIfOnboarding = async () => {
    try {
      const onboardingProgress = await AsyncStorage.getItem('onboarding-progress');
      if (onboardingProgress) {
        const progress = JSON.parse(onboardingProgress);
        if (progress.step >= 3) {
          setIsOnboarding(true);
        }
      }
    } catch (error) {
      console.error('온보딩 상태 확인 실패:', error);
    }
  };

  const pickImage = async () => {
    // 권한 요청
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
      return;
    }

    // 이미지 선택
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const completeOnboarding = async () => {
    // 온보딩 완료 표시
    await AsyncStorage.removeItem('onboarding-progress');
  };

  const handleConfirm = async () => {
    if (!selectedImage) {
      Alert.alert('알림', '배경사진을 선택해주세요.');
      return;
    }

    // 배경사진 저장
    await AsyncStorage.setItem('wedding-background-image', selectedImage);

    if (isOnboarding) {
      // 온보딩 중이면 로딩 화면으로 이동
      navigation.replace('OnboardingLoading');
    } else {
      // 온보딩 완료
      await completeOnboarding();
      // 메인 화면(탭 네비게이션)으로 이동
      navigation.replace('MainTabs');
    }
  };

  const handleSkip = async () => {
    if (isOnboarding) {
      // 온보딩 중이면 로딩 화면으로 이동
      navigation.replace('OnboardingLoading');
    } else {
      // 온보딩 완료
      await completeOnboarding();
      // 나중에 설정하기
      navigation.replace('MainTabs');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 온보딩 중일 때 스텝 인디케이터 표시 */}
      {isOnboarding && (
        <View style={styles.stepIndicatorContainer}>
          <StepIndicator
            currentStep={4}
            totalSteps={TOTAL_STEPS}
            stepLabels={ONBOARDING_STEPS}
          />
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.title}>배경사진 설정</Text>
        <Text style={styles.subtitle}>
          메인 화면에 표시할{'\n'}커플 사진을 선택해주세요
        </Text>

        {/* 사진 영역 - 터치하면 사진 선택 */}
        <TouchableOpacity
          style={styles.imagePreviewContainer}
          onPress={pickImage}
          activeOpacity={0.8}
        >
          {selectedImage ? (
            <>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              <View style={styles.imageOverlay}>
                <Text style={styles.changePhotoText}>다른 사진 선택</Text>
              </View>
            </>
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderIcon}>+</Text>
              <Text style={styles.placeholderText}>탭하여 사진 선택</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>
              {isOnboarding ? '시작하기' : '확인'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>나중에 설정하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  stepIndicatorContainer: {
    paddingTop: 10,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  imagePreviewContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 12,
  },
  changePhotoText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    textAlign: 'center',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightPink,
  },
  placeholderIcon: {
    fontSize: 60,
    marginBottom: 16,
    color: COLORS.darkPink,
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
  },
  buttonContainer: {
    gap: 12,
  },
  confirmButton: {
    backgroundColor: COLORS.darkPink,
    borderRadius: 12,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  confirmButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    textAlign: 'center',
  },
  skipButton: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  skipButtonText: {
    color: COLORS.textGray,
    fontSize: 16,
    fontFamily: 'GowunDodum_400Regular',
    textAlign: 'center',
  },
});
