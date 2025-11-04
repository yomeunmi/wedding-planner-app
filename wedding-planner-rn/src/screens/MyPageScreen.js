import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';

export default function MyPageScreen({ navigation, timeline }) {
  const [nickname, setNickname] = useState('');
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [tempNickname, setTempNickname] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // 화면이 포커스될 때마다 데이터 다시 로드
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    // 닉네임 로드
    const savedNickname = await AsyncStorage.getItem('wedding-nickname');
    setNickname(savedNickname || '');
    setTempNickname(savedNickname || '');

    // 타임라인 로드
    await timeline.load();
    setItems([...timeline.timeline]);
  };

  const handleSaveNickname = async () => {
    if (tempNickname.trim()) {
      await AsyncStorage.setItem('wedding-nickname', tempNickname.trim());
      setNickname(tempNickname.trim());
      setIsEditingNickname(false);
      Alert.alert('알림', '닉네임이 저장되었습니다.');
    } else {
      Alert.alert('오류', '닉네임을 입력해주세요.');
    }
  };

  const handleCancelEdit = () => {
    setTempNickname(nickname);
    setIsEditingNickname(false);
  };

  const completedCount = items.filter(item => item.completed).length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>👤 마이페이지</Text>
        </View>

        {/* 닉네임 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>닉네임</Text>
          {!isEditingNickname ? (
            <View style={styles.nicknameDisplay}>
              <Text style={styles.nicknameText}>
                {nickname || '닉네임을 설정해주세요'}
              </Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditingNickname(true)}
              >
                <Text style={styles.editButtonText}>✏️ 수정</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.nicknameEdit}>
              <TextInput
                style={styles.nicknameInput}
                value={tempNickname}
                onChangeText={setTempNickname}
                placeholder="닉네임 입력"
                autoFocus
              />
              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveNickname}
                >
                  <Text style={styles.saveButtonText}>저장</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelEdit}
                >
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* 웨딩 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>웨딩 정보</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>결혼식 날짜</Text>
            <Text style={styles.infoValue}>
              {timeline.weddingDate && timeline.formatDate(timeline.weddingDate)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>준비 기간</Text>
            <Text style={styles.infoValue}>{timeline.getPrepPeriod()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>D-Day</Text>
            <Text style={[styles.infoValue, styles.dDayValue]}>
              {timeline.getDDay() > 0
                ? `D-${timeline.getDDay()}`
                : timeline.getDDay() === 0
                ? 'D-Day!'
                : `D+${Math.abs(timeline.getDDay())}`}
            </Text>
          </View>
        </View>

        {/* 체크리스트 */}
        <View style={styles.section}>
          <View style={styles.checklistHeader}>
            <Text style={styles.sectionTitle}>준비 체크리스트</Text>
            <Text style={styles.completedSummary}>
              {completedCount}/{items.length} 완료
            </Text>
          </View>
          {items.map((item) => (
            <View
              key={item.id}
              style={[
                styles.checklistItem,
                item.completed && styles.completedChecklistItem,
              ]}
            >
              <View style={styles.checklistInfo}>
                <View style={styles.checklistTitleRow}>
                  <Text
                    style={[
                      styles.checklistTitle,
                      item.completed && styles.completedText,
                    ]}
                  >
                    {item.icon} {item.title}
                  </Text>
                  {item.completed && (
                    <Text style={styles.checklistCompleted}>✓ 완료</Text>
                  )}
                </View>
                <Text style={styles.checklistDate}>
                  {timeline.formatDate(item.date)}
                </Text>
              </View>
              <Text
                style={[
                  styles.checklistStatus,
                  item.completed && styles.checklistStatusCompleted,
                ]}
              >
                {item.completed ? '✓' : '◯'}
              </Text>
            </View>
          ))}
        </View>

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
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'PoorStory_400Regular',
    color: COLORS.darkPink,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'PoorStory_400Regular',
    color: COLORS.textDark,
    marginBottom: 16,
  },
  nicknameDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nicknameText: {
    fontSize: 16,
    fontFamily: 'PoorStory_400Regular',
    color: COLORS.textDark,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: 'PoorStory_400Regular',
    color: COLORS.darkPink,
    fontWeight: '600',
  },
  nicknameEdit: {
    gap: 12,
  },
  nicknameInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'PoorStory_400Regular',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.darkPink,
    borderRadius: 8,
    padding: 12,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'PoorStory_400Regular',
    textAlign: 'center',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.darkPink,
    borderRadius: 8,
    padding: 12,
  },
  cancelButtonText: {
    color: COLORS.darkPink,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'PoorStory_400Regular',
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 15,
    fontFamily: 'PoorStory_400Regular',
    color: COLORS.textGray,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'PoorStory_400Regular',
    color: COLORS.textDark,
  },
  dDayValue: {
    color: COLORS.darkPink,
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  completedSummary: {
    fontSize: 14,
    fontFamily: 'PoorStory_400Regular',
    color: COLORS.darkPink,
    fontWeight: '600',
  },
  checklistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  completedChecklistItem: {
    opacity: 0.6,
  },
  checklistInfo: {
    flex: 1,
  },
  checklistTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  checklistTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'PoorStory_400Regular',
    color: COLORS.textDark,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.textGray,
  },
  checklistCompleted: {
    fontSize: 13,
    fontFamily: 'PoorStory_400Regular',
    color: COLORS.darkPink,
    marginLeft: 8,
  },
  checklistDate: {
    fontSize: 13,
    fontFamily: 'PoorStory_400Regular',
    color: COLORS.textGray,
  },
  checklistStatus: {
    fontSize: 24,
    color: COLORS.textLight,
  },
  checklistStatusCompleted: {
    color: COLORS.darkPink,
  },
  backButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.darkPink,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  backButtonText: {
    color: COLORS.darkPink,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'PoorStory_400Regular',
    textAlign: 'center',
  },
});
