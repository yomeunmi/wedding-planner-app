import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = -80;

// 스와이프 가능한 행 컴포넌트
const SwipeableRow = ({ children, onDelete, itemId, activeSwipeId, setActiveSwipeId }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const isActive = activeSwipeId === itemId;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 10;
      },
      onPanResponderGrant: () => {
        translateX.setOffset(translateX._value);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(Math.max(gestureState.dx, -100));
        } else if (gestureState.dx > 0) {
          translateX.setValue(Math.min(gestureState.dx, 0));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        translateX.flattenOffset();
        if (gestureState.dx < SWIPE_THRESHOLD) {
          // 삭제 버튼 표시
          Animated.spring(translateX, {
            toValue: -80,
            useNativeDriver: true,
          }).start();
          setActiveSwipeId(itemId);
        } else {
          // 원래 위치로
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          if (isActive) {
            setActiveSwipeId(null);
          }
        }
      },
    })
  ).current;

  // 다른 아이템이 스와이프되면 현재 아이템 닫기
  useEffect(() => {
    if (activeSwipeId && activeSwipeId !== itemId) {
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  }, [activeSwipeId]);

  const closeSwipe = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
    setActiveSwipeId(null);
  };

  return (
    <View style={styles.swipeContainer}>
      {/* 삭제 버튼 (배경) */}
      <View style={styles.deleteButtonContainer}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            closeSwipe();
            onDelete();
          }}
        >
          <Text style={styles.deleteButtonText}>삭제</Text>
        </TouchableOpacity>
      </View>

      {/* 스와이프 가능한 콘텐츠 */}
      <Animated.View
        style={[
          styles.swipeableContent,
          { transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
};

export default function TimelineScreen({ navigation, timeline }) {
  const [items, setItems] = useState([]);
  const [dDay, setDDay] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [nickname, setNickname] = useState('');
  const [showOnlyPending, setShowOnlyPending] = useState(false);
  const [activeSwipeId, setActiveSwipeId] = useState(null);
  const [deletedItemIds, setDeletedItemIds] = useState([]);

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

    // 삭제된 항목 ID 로드
    const savedDeletedIds = await AsyncStorage.getItem('timeline-deleted-items');
    const deletedIds = savedDeletedIds ? JSON.parse(savedDeletedIds) : [];
    setDeletedItemIds(deletedIds);

    // 삭제된 항목 제외하고 표시
    const filteredTimeline = timeline.timeline.filter(item => !deletedIds.includes(item.id));
    setItems([...filteredTimeline]);
    setDDay(timeline.getDDay());
    setCompletedCount(filteredTimeline.filter(item => item.completed).length);

    // 닉네임 로드
    const savedNickname = await AsyncStorage.getItem('wedding-nickname');
    setNickname(savedNickname || '');

    // 알림 권한 확인 및 초기화 (한 번만 확인)
    const notificationSetupDone = await AsyncStorage.getItem('notification-setup-done');
    if (!notificationSetupDone) {
      const hasPermission = await timeline.initializeNotifications();
      if (hasPermission) {
        await AsyncStorage.setItem('notification-setup-done', 'true');
      }
    }
  };

  const handleItemPress = (item) => {
    if (activeSwipeId) {
      setActiveSwipeId(null);
      return;
    }
    navigation.getParent()?.navigate('Detail', { item });
  };

  const handleDeleteItem = async (itemId, itemTitle) => {
    Alert.alert(
      '항목 삭제',
      `"${itemTitle}" 항목을 삭제하시겠습니까?\n삭제된 항목은 타임라인에서 숨겨집니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            const newDeletedIds = [...deletedItemIds, itemId];
            setDeletedItemIds(newDeletedIds);
            await AsyncStorage.setItem('timeline-deleted-items', JSON.stringify(newDeletedIds));

            // UI 업데이트
            const filteredItems = items.filter(item => item.id !== itemId);
            setItems(filteredItems);
            setCompletedCount(filteredItems.filter(item => item.completed).length);
          },
        },
      ]
    );
  };

  // 아이템별 D-Day 계산
  const getItemDDay = (itemDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(itemDate);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 필터링된 아이템 목록
  const filteredItems = showOnlyPending ? items.filter(item => !item.completed) : items;

  const renderItem = ({ item }) => {
    const itemDDay = getItemDDay(item.date);
    const dDayText = itemDDay > 0 ? `D-${itemDDay}` : itemDDay === 0 ? 'D-Day' : `D+${Math.abs(itemDDay)}`;

    // 결혼식 당일은 삭제 불가
    const canDelete = item.id !== 'wedding-day';

    return canDelete ? (
      <SwipeableRow
        itemId={item.id}
        onDelete={() => handleDeleteItem(item.id, item.title)}
        activeSwipeId={activeSwipeId}
        setActiveSwipeId={setActiveSwipeId}
      >
        <TouchableOpacity
          style={[styles.timelineItem, item.completed && styles.completedItem]}
          onPress={() => handleItemPress(item)}
          activeOpacity={0.7}
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
            <View style={styles.dateRow}>
              <Text style={styles.timelineDate}>{timeline.formatDate(item.date)}</Text>
              <Text style={[styles.itemDDay, itemDDay <= 0 && styles.itemDDayPast]}>{dDayText}</Text>
            </View>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </SwipeableRow>
    ) : (
      <TouchableOpacity
        style={[styles.timelineItem, item.completed && styles.completedItem]}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
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
          <View style={styles.dateRow}>
            <Text style={styles.timelineDate}>{timeline.formatDate(item.date)}</Text>
            <Text style={[styles.itemDDay, itemDDay <= 0 && styles.itemDDayPast]}>{dDayText}</Text>
          </View>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>
            {nickname ? `${nickname}의 타임라인` : '타임라인'}
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
        onScrollBeginDrag={() => setActiveSwipeId(null)}
      />
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
    paddingTop: 80,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
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
  swipeContainer: {
    marginBottom: 12,
    position: 'relative',
  },
  deleteButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF4444',
    width: 70,
    height: '90%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    fontWeight: 'bold',
  },
  swipeableContent: {
    backgroundColor: COLORS.background,
  },
  timelineItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 0,
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timelineDate: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    fontWeight: 'bold',
    color: COLORS.textGray,
  },
  itemDDay: {
    fontSize: 12,
    fontFamily: 'GowunDodum_400Regular',
    fontWeight: 'bold',
    color: COLORS.darkPink,
  },
  itemDDayPast: {
    color: COLORS.textGray,
  },
  arrow: {
    fontSize: 24,
    color: COLORS.textLight,
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
