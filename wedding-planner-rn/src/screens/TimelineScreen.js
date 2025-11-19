import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';

export default function TimelineScreen({ navigation, timeline }) {
  const [items, setItems] = useState([]);
  const [dDay, setDDay] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [nickname, setNickname] = useState('');
  const [showOnlyPending, setShowOnlyPending] = useState(false);

  useEffect(() => {
    loadTimeline();
  }, []);

  useEffect(() => {
    // 화면이 포커스될 때마다 타임라인 다시 로드
    const unsubscribe = navigation.addListener('focus', () => {
      loadTimeline();
    });
    return unsubscribe;
  }, [navigation]);

  const loadTimeline = async () => {
    await timeline.load();
    setItems([...timeline.timeline]);
    setDDay(timeline.getDDay());
    setCompletedCount(timeline.getCompletedCount());

    // 닉네임 로드
    const savedNickname = await AsyncStorage.getItem('wedding-nickname');
    setNickname(savedNickname || '');
  };

  const handleItemPress = (item) => {
    navigation.navigate('Detail', { item });
  };

  const handleMyPagePress = () => {
    navigation.navigate('MyPage');
  };

  const handleResetData = () => {
    Alert.alert(
      '데이터 초기화',
      '모든 데이터가 삭제됩니다. 정말 초기화하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '초기화',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.navigate('DateInput');
          },
        },
      ]
    );
  };

  // 필터링된 아이템 목록
  const filteredItems = showOnlyPending ? items.filter(item => !item.completed) : items;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.timelineItem, item.completed && styles.completedItem]}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.timelineIcon}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>
      <View style={styles.timelineContent}>
        <View style={styles.titleRow}>
          <Text style={[styles.timelineTitle, item.completed && styles.completedText]}>
            {item.title}
          </Text>
          {item.completed && (
            <Text style={styles.checkMark}>✓ 완료</Text>
          )}
        </View>
        <Text style={styles.timelineDate}>{timeline.formatDate(item.date)}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.myButtonContainer}>
          <TouchableOpacity style={styles.myPageButtonBox} onPress={handleMyPagePress}>
            <Text style={styles.myPageButton}>My</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>
            {nickname ? `${nickname}의 결혼 준비 타임라인` : '결혼 준비 타임라인'}
          </Text>
        </View>
        <View style={styles.dateRange}>
          <Text style={styles.dateRangeText}>
            {timeline.formatDate(timeline.startDate)} ~ {timeline.formatDate(timeline.weddingDate)}
          </Text>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.dDayLabel}>D-Day</Text>
            <Text style={styles.dDayValue}>
              {dDay > 0 ? `D-${dDay}` : dDay === 0 ? 'D-Day!' : `D+${Math.abs(dDay)}`}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.completedLabel}>완료</Text>
            <Text style={styles.completedValue}>
              {completedCount}/{items.length}
            </Text>
          </View>
        </View>
      </View>

      {/* 필터 버튼 */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, showOnlyPending && styles.filterButtonActive]}
          onPress={() => setShowOnlyPending(!showOnlyPending)}
        >
          <Text style={[styles.filterButtonText, showOnlyPending && styles.filterButtonTextActive]}>
            {showOnlyPending ? '전체 보기' : '해야할 것만 보기'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 타임라인 목록 */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />

      {/* 하단 버튼 */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.resetButton} onPress={handleResetData}>
          <Text style={styles.resetButtonText}>데이터 초기화</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: 100,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  myButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  headerTop: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
  },
  myPageButtonBox: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.darkPink,
  },
  myPageButton: {
    fontSize: 12,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    fontWeight: '600',
  },
  dateRange: {
    marginBottom: 16,
  },
  dateRangeText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.darkPink,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  dDayLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.white,
    marginBottom: 4,
  },
  dDayValue: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.white,
  },
  completedLabel: {
    fontSize: 12,
    fontFamily: 'GowunDodum_400Regular',
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  completedValue: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.white,
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
  completedItem: {
    // 완료된 항목도 동일한 스타일 유지
  },
  timelineIcon: {
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
  timelineContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
  },
  completedText: {
    // 완료된 항목도 동일한 텍스트 스타일 유지
  },
  checkMark: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    fontWeight: 'bold',
    color: COLORS.darkPink,
    marginLeft: 8,
  },
  timelineDate: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    fontWeight: 'bold',
    color: COLORS.textGray,
  },
  arrow: {
    fontSize: 24,
    color: COLORS.textLight,
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  resetButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.darkPink,
    borderRadius: 8,
    padding: 14,
  },
  resetButtonText: {
    color: COLORS.darkPink,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'GowunDodum_400Regular',
    textAlign: 'center',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 8,
    backgroundColor: COLORS.background,
  },
  filterButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.darkPink,
    borderRadius: 8,
    padding: 8,
  },
  filterButtonActive: {
    backgroundColor: COLORS.darkPink,
  },
  filterButtonText: {
    color: COLORS.darkPink,
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    fontWeight: '600',
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: COLORS.white,
  },
});
