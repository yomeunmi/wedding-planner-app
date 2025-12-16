import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';
import StepIndicator from '../components/StepIndicator';

const ONBOARDING_STEPS = ['날짜 설정', '타임라인', '예산 설정', '배경 선택'];
const TOTAL_STEPS = 4;

export default function TimelineConfirmScreen({ navigation, timeline }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadTimeline();
    saveProgress();
  }, []);

  const loadTimeline = () => {
    setItems([...timeline.timeline]);
  };

  const saveProgress = async () => {
    try {
      const progress = {
        step: 2,
        data: {
          weddingDate: timeline.weddingDate?.toISOString(),
          startDate: timeline.startDate?.toISOString(),
        },
      };
      await AsyncStorage.setItem('onboarding-progress', JSON.stringify(progress));
    } catch (error) {
      console.error('진행 상태 저장 실패:', error);
    }
  };

  const handleConfirm = async () => {
    try {
      // 알림 권한 요청 및 스케줄링
      const notificationsEnabled = await AsyncStorage.getItem('notifications-enabled');
      if (notificationsEnabled !== 'false') {
        const hasPermission = await timeline.initializeNotifications();
        if (hasPermission) {
          console.log('알림이 성공적으로 스케줄링되었습니다.');
        }
      }
    } catch (error) {
      console.log('알림 스케줄링 오류:', error);
    }

    // 진행 상태 저장 후 로딩 화면으로 이동
    await AsyncStorage.setItem('onboarding-progress', JSON.stringify({ step: 3 }));

    // 로딩 화면으로 이동 후 예산 설정으로
    navigation.replace('OnboardingLoading');
  };

  const renderItem = ({ item }) => (
    <View style={styles.timelineItem}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDate}>{timeline.formatDate(item.date)}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 스텝 인디케이터 */}
      <View style={styles.stepIndicatorContainer}>
        <StepIndicator
          currentStep={2}
          totalSteps={TOTAL_STEPS}
          stepLabels={ONBOARDING_STEPS}
        />
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>타임라인이 생성되었습니다!</Text>
        <Text style={styles.subtitle}>
          아래 일정을 확인하고 다음 단계로 이동하세요
        </Text>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>다음: 예산 설정하기 💰</Text>
        </TouchableOpacity>
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
    backgroundColor: COLORS.white,
  },
  header: {
    padding: 24,
    paddingTop: 10,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  timelineItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.lightPink,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  confirmButton: {
    backgroundColor: COLORS.darkPink,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
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
  },
});
