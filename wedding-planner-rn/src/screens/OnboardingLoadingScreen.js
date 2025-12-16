import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { COLORS } from '../constants/colors';

const { width, height } = Dimensions.get('window');

const LOADING_MESSAGES = [
  { text: '웨딩 타임라인을 만들고 있어요 ✨', emoji: '📅' },
  { text: '예산 계획을 세우고 있어요 💰', emoji: '💵' },
  { text: '행복한 결혼 준비를 응원해요 💕', emoji: '💒' },
];

export default function OnboardingLoadingScreen({ navigation, route }) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const { onComplete, loadingType = 'timeline' } = route?.params || {};

  useEffect(() => {
    // 메시지 페이드인 애니메이션
    const animateMessage = () => {
      // 페이드인 + 스케일 업
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();

      // 1.5초 후 페이드아웃
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // 다음 메시지로 이동
          if (currentMessageIndex < LOADING_MESSAGES.length - 1) {
            setCurrentMessageIndex(prev => prev + 1);
          }
        });
      }, 1500);
    };

    animateMessage();
  }, [currentMessageIndex]);

  // 프로그레스 바 애니메이션
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 5000, // 전체 로딩 시간
      useNativeDriver: false,
    }).start();

    // 5초 후 다음 화면으로 이동
    const timer = setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        // 예산 설정 화면으로 이동
        navigation.replace('BudgetSetup');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const currentMessage = LOADING_MESSAGES[currentMessageIndex];

  return (
    <View style={styles.container}>
      {/* 배경 하트 파티클 */}
      <View style={styles.particlesContainer}>
        {[...Array(6)].map((_, i) => (
          <FloatingHeart key={i} delay={i * 300} />
        ))}
      </View>

      {/* 메인 아이콘 */}
      <Animated.View
        style={[
          styles.iconContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.mainEmoji}>{currentMessage.emoji}</Text>
      </Animated.View>

      {/* 메시지 텍스트 */}
      <Animated.View
        style={[
          styles.messageContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.messageText}>{currentMessage.text}</Text>
      </Animated.View>

      {/* 프로그레스 바 */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          잠시만 기다려주세요...
        </Text>
      </View>

      {/* 하단 브랜딩 */}
      <View style={styles.brandingContainer}>
        <Text style={styles.brandingText}>♥ 웨딩플래너</Text>
      </View>
    </View>
  );
}

// 플로팅 하트 컴포넌트
const FloatingHeart = ({ delay }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const randomX = useRef(Math.random() * width).current;

  useEffect(() => {
    const startAnimation = () => {
      floatAnim.setValue(0);
      opacityAnim.setValue(0);

      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(floatAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0.6,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.delay(2000),
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start(() => {
        startAnimation();
      });
    };

    startAnimation();
  }, []);

  return (
    <Animated.Text
      style={[
        styles.floatingHeart,
        {
          left: randomX,
          opacity: opacityAnim,
          transform: [
            {
              translateY: floatAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [height, -100],
              }),
            },
          ],
        },
      ]}
    >
      ♥
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particlesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  floatingHeart: {
    position: 'absolute',
    fontSize: 20,
    color: COLORS.lightPink,
  },
  iconContainer: {
    marginBottom: 30,
  },
  mainEmoji: {
    fontSize: 80,
  },
  messageContainer: {
    paddingHorizontal: 40,
    marginBottom: 60,
  },
  messageText: {
    fontSize: 20,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 30,
  },
  progressContainer: {
    width: width - 80,
    alignItems: 'center',
  },
  progressBackground: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.darkPink,
    borderRadius: 3,
  },
  progressText: {
    marginTop: 12,
    fontSize: 13,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
  },
  brandingContainer: {
    position: 'absolute',
    bottom: 50,
  },
  brandingText: {
    fontSize: 16,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
  },
});
