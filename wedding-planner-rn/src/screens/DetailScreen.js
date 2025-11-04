import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../constants/colors';

export default function DetailScreen({ route, navigation, timeline }) {
  const { item } = route.params;
  const [currentItem, setCurrentItem] = useState(item);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date(item.date));

  const handleToggleCompleted = async () => {
    const completed = await timeline.toggleCompleted(currentItem.id);
    setCurrentItem({ ...currentItem, completed });
    Alert.alert('알림', completed ? `${currentItem.title} 완료! 🎉` : `${currentItem.title} 완료 취소`);
  };

  const handleDateChange = async (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setTempDate(selectedDate);
      await timeline.updateItemDate(currentItem.id, selectedDate);
      setCurrentItem({ ...currentItem, date: selectedDate });
      Alert.alert('알림', '날짜가 변경되었습니다.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* 아이콘 */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{currentItem.icon}</Text>
        </View>

        {/* 제목 */}
        <Text style={styles.title}>{currentItem.title}</Text>

        {/* 날짜 */}
        <View style={styles.dateSection}>
          <Text style={styles.dateLabel}>권장 일정</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateText}>{timeline.formatDate(currentItem.date)}</Text>
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={tempDate}
              mode="date"
              onChange={handleDateChange}
            />
          )}
        </View>

        {/* 설명 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>설명</Text>
          <Text style={styles.description}>{currentItem.description}</Text>
        </View>

        {/* 팁 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 준비 팁</Text>
          {currentItem.tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* 완료 버튼 */}
        <TouchableOpacity
          style={[
            styles.completedButton,
            currentItem.completed && styles.completedButtonActive,
          ]}
          onPress={handleToggleCompleted}
        >
          <Text style={styles.completedButtonText}>
            {currentItem.completed ? '✓ 완료 취소' : '완료 표시'}
          </Text>
        </TouchableOpacity>

        {/* 뒤로가기 버튼 */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← 타임라인으로 돌아가기</Text>
        </TouchableOpacity>
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
    paddingTop: 60,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.lightPink,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.darkPink,
    textAlign: 'center',
    marginBottom: 24,
  },
  dateSection: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  dateLabel: {
    fontSize: 14,
    color: COLORS.textGray,
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.darkPink,
    borderRadius: 8,
    padding: 12,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  editIcon: {
    fontSize: 16,
  },
  saveDateButton: {
    backgroundColor: COLORS.darkPink,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  saveDateText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: COLORS.textDark,
    lineHeight: 24,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingRight: 8,
  },
  tipBullet: {
    fontSize: 16,
    color: COLORS.darkPink,
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 22,
  },
  completedButton: {
    backgroundColor: COLORS.darkPink,
    borderRadius: 12,
    padding: 18,
    marginTop: 8,
    marginBottom: 16,
  },
  completedButtonActive: {
    backgroundColor: COLORS.textGray,
  },
  completedButtonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.darkPink,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  backButtonText: {
    color: COLORS.darkPink,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
