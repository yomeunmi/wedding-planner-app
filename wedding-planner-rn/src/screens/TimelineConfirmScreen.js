import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';
import StepIndicator from '../components/StepIndicator';

const ONBOARDING_STEPS = ['날짜 설정', '타임라인', '예산 설정', '배경 선택'];
const TOTAL_STEPS = 4;

export default function TimelineConfirmScreen({ navigation, timeline }) {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [originalDate, setOriginalDate] = useState(null);

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

    await AsyncStorage.setItem('onboarding-progress', JSON.stringify({ step: 3 }));
    navigation.replace('OnboardingLoading');
  };

  // 날짜 편집 시작
  const startEditDate = (item) => {
    setEditingItem(item);
    setOriginalDate(new Date(item.date));
    setTempDate(new Date(item.date));
    setShowDatePicker(true);
  };

  // 날짜 변경 처리 (Android)
  const handleDateChangeAndroid = async (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      setEditingItem(null);
      return;
    }

    if (event.type === 'set' && selectedDate && editingItem) {
      setShowDatePicker(false);

      // 날짜가 실제로 변경되었는지 확인
      const oldDate = originalDate;
      const newDate = selectedDate;

      if (oldDate.toDateString() !== newDate.toDateString()) {
        await timeline.updateItemDate(editingItem.id, selectedDate);
        // 정렬된 타임라인으로 상태 업데이트
        setItems([...timeline.timeline].map(item => ({ ...item })));
        Alert.alert('완료', '날짜가 변경되었습니다.');
      }

      setEditingItem(null);
      setOriginalDate(null);
    }
  };

  // 날짜 변경 처리 (iOS - 임시 날짜만 업데이트)
  const handleDateChangeIOS = (event, selectedDate) => {
    if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  // iOS 날짜 선택 확인
  const confirmDateChangeIOS = async () => {
    if (editingItem && originalDate) {
      // 날짜가 실제로 변경되었는지 확인
      if (originalDate.toDateString() !== tempDate.toDateString()) {
        await timeline.updateItemDate(editingItem.id, tempDate);
        // 정렬된 타임라인으로 상태 업데이트
        setItems([...timeline.timeline].map(item => ({ ...item })));
        Alert.alert('완료', '날짜가 변경되었습니다.');
      }
    }
    setShowDatePicker(false);
    setEditingItem(null);
    setOriginalDate(null);
  };

  // iOS 날짜 선택 취소
  const cancelDateChangeIOS = () => {
    setShowDatePicker(false);
    setEditingItem(null);
    setOriginalDate(null);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.timelineItem}
      onPress={() => startEditDate(item)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <View style={styles.dateRow}>
          <Text style={styles.itemDate}>{timeline.formatDate(item.date)}</Text>
          <Text style={styles.editHint}>탭하여 수정</Text>
        </View>
      </View>
    </TouchableOpacity>
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
          각 항목을 탭하여 날짜를 조정할 수 있어요
        </Text>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        extraData={items}
      />

      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmButtonText}>다음</Text>
        </TouchableOpacity>
      </View>

      {/* Android 날짜 선택 피커 */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleDateChangeAndroid}
        />
      )}

      {/* iOS 날짜 선택 모달 */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
          onRequestClose={cancelDateChangeIOS}
        >
          <View style={styles.iosPickerOverlay}>
            <View style={styles.iosPickerContainer}>
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity onPress={cancelDateChangeIOS}>
                  <Text style={styles.iosPickerCancel}>취소</Text>
                </TouchableOpacity>
                <Text style={styles.iosPickerTitle}>날짜 선택</Text>
                <TouchableOpacity onPress={confirmDateChangeIOS}>
                  <Text style={styles.iosPickerConfirm}>확인</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChangeIOS}
                style={styles.iosPicker}
              />
            </View>
          </View>
        </Modal>
      )}
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemDate: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
  },
  editHint: {
    fontSize: 11,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
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
  // iOS 피커 스타일
  iosPickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  iosPickerContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iosPickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
  },
  iosPickerCancel: {
    fontSize: 16,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
  },
  iosPickerConfirm: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
  },
  iosPicker: {
    height: 200,
  },
});
