import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../constants/colors';

export default function DateInputScreen({ navigation, timeline }) {
  const [weddingDate, setWeddingDate] = useState(new Date());
  const [startDate, setStartDate] = useState(new Date());
  const [showWeddingPicker, setShowWeddingPicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const handleWeddingDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || weddingDate;
    setShowWeddingPicker(false);
    setWeddingDate(currentDate);
  };

  const handleStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartPicker(false);
    setStartDate(currentDate);
  };

  const handleCreateTimeline = async () => {
    if (startDate >= weddingDate) {
      Alert.alert('오류', '결혼식 날짜는 준비 시작일보다 이후여야 합니다.');
      return;
    }

    timeline.setDates(weddingDate, startDate);
    await timeline.save();

    // 알림 권한 요청 및 초기화
    await timeline.initializeNotifications();

    // 타임라인 확인 화면으로 이동
    navigation.replace('TimelineConfirm');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>웨딩 플래너</Text>
        <Text style={styles.subtitle}>결혼 준비 일정 설정</Text>

        <View style={styles.form}>
          {/* 준비 시작일 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>준비 시작일</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.dateText}>{formatDate(startDate)}</Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                onChange={handleStartDateChange}
              />
            )}
          </View>

          {/* 결혼식 날짜 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>결혼식 날짜</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowWeddingPicker(true)}
            >
              <Text style={styles.dateText}>{formatDate(weddingDate)}</Text>
            </TouchableOpacity>
            {showWeddingPicker && (
              <DateTimePicker
                value={weddingDate}
                mode="date"
                onChange={handleWeddingDateChange}
              />
            )}
          </View>

          {/* 일정 만들기 버튼 */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleCreateTimeline}
          >
            <Text style={styles.submitButtonText}>일정 만들기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 준비를 시작하는 날짜와 결혼식 날짜를 입력하면,{'\n'}
            맞춤형 웨딩 준비 일정을 자동으로 만들어드립니다!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    textAlign: 'center',
    marginTop: 80,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  dateButton: {
    borderWidth: 2,
    borderColor: COLORS.darkPink,
    borderRadius: 8,
    padding: 16,
    backgroundColor: COLORS.white,
  },
  dateText: {
    fontSize: 18,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: COLORS.darkPink,
    borderRadius: 8,
    padding: 18,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: COLORS.lightPink,
    borderRadius: 12,
    padding: 20,
    marginTop: 24,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    lineHeight: 24,
  },
});
