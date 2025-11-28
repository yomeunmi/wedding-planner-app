import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  RefreshControl,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../constants/colors';

export default function NotificationScreen({ timeline }) {
  const navigation = useNavigation();
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [allNotifications, setAllNotifications] = useState([]);
  const [readNotificationIds, setReadNotificationIds] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // 기존 잘못된 알림 히스토리 정리 (미래 알림 제거)
    cleanupNotificationHistory();
    loadNotificationSettings();
    loadAllNotifications();
    loadReadNotificationIds();
  }, []);

  const cleanupNotificationHistory = async () => {
    try {
      const existing = await AsyncStorage.getItem('notification-history');
      if (existing) {
        const history = JSON.parse(existing);
        const now = new Date();
        // 과거 알림만 유지
        const cleanedHistory = history.filter(n => new Date(n.date) <= now);
        await AsyncStorage.setItem('notification-history', JSON.stringify(cleanedHistory));
      }
    } catch (error) {
      console.error('알림 히스토리 정리 오류:', error);
    }
  };

  const loadNotificationSettings = async () => {
    const enabled = await AsyncStorage.getItem('notifications-enabled');
    setNotificationEnabled(enabled !== 'false');
  };

  const loadAllNotifications = async () => {
    try {
      // 기존 히스토리만 로드 (실제로 도착한 알림만 표시)
      const existing = await AsyncStorage.getItem('notification-history');
      let history = existing ? JSON.parse(existing) : [];

      // 현재 시간 기준으로 미래 알림은 제외 (아직 도착하지 않은 알림)
      const now = new Date();
      history = history.filter(notification => {
        const notificationDate = new Date(notification.date);
        return notificationDate <= now;
      });

      // 날짜순 정렬 (최신순)
      history.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAllNotifications(history);
    } catch (error) {
      console.error('알림 로드 오류:', error);
    }
  };

  const loadReadNotificationIds = async () => {
    try {
      const readIds = await AsyncStorage.getItem('read-notification-ids');
      if (readIds) {
        setReadNotificationIds(JSON.parse(readIds));
      }
    } catch (error) {
      console.error('읽은 알림 ID 로드 오류:', error);
    }
  };

  const getNotificationTriggerDate = (notification) => {
    if (!notification.trigger) return null;

    const trigger = notification.trigger;

    if (trigger instanceof Date) return trigger;
    if (trigger.date !== undefined) return new Date(trigger.date);
    if (trigger.value !== undefined) return new Date(trigger.value);
    if (typeof trigger === 'number') return new Date(trigger);
    if (trigger.seconds !== undefined) {
      const futureDate = new Date();
      futureDate.setSeconds(futureDate.getSeconds() + trigger.seconds);
      return futureDate;
    }

    return null;
  };

  const markAsRead = async (notificationId) => {
    try {
      if (!readNotificationIds.includes(notificationId)) {
        const newReadIds = [...readNotificationIds, notificationId];
        setReadNotificationIds(newReadIds);
        await AsyncStorage.setItem('read-notification-ids', JSON.stringify(newReadIds));
      }
    } catch (error) {
      console.error('읽음 처리 오류:', error);
    }
  };

  const handleNotificationPress = async (notification) => {
    // 읽음 처리
    await markAsRead(notification.id);

    // 타임라인 상세화면으로 이동
    if (notification.itemId) {
      const item = timeline.getItemById(notification.itemId);
      if (item) {
        // Date 객체를 ISO 문자열로 변환하여 직렬화 문제 방지
        const serializedItem = {
          ...item,
          date: item.date instanceof Date ? item.date.toISOString() : item.date,
        };
        navigation.navigate('Detail', { item: serializedItem });
      } else {
        Alert.alert('알림', '해당 일정을 찾을 수 없습니다.');
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllNotifications();
    await loadReadNotificationIds();
    setRefreshing(false);
  };

  const toggleNotifications = async (value) => {
    setNotificationEnabled(value);
    await AsyncStorage.setItem('notifications-enabled', value.toString());

    if (value) {
      const hasPermission = await timeline.initializeNotifications();
      if (!hasPermission) {
        Alert.alert(
          '알림 권한 필요',
          '알림을 사용하려면 설정에서 알림 권한을 허용해주세요.',
          [{ text: '확인' }]
        );
        setNotificationEnabled(false);
        await AsyncStorage.setItem('notifications-enabled', 'false');
      } else {
        await loadAllNotifications();
        Alert.alert('알림 활성화', '알림이 활성화되었습니다.', [{ text: '확인' }]);
      }
    } else {
      await timeline.cancelAllNotifications();
      Alert.alert('알림 비활성화', '모든 알림이 취소되었습니다.', [{ text: '확인' }]);
    }
  };

  const sendTestNotification = async () => {
    await timeline.sendTestNotification();
    Alert.alert('테스트 알림', '테스트 알림이 전송되었습니다!', [{ text: '확인' }]);
  };

  const formatNotificationDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMs < 0) {
      // 미래 알림
      const futureDays = Math.ceil(Math.abs(diffMs) / 86400000);
      if (futureDays === 0) return '오늘 예정';
      if (futureDays === 1) return '내일 예정';
      return `${futureDays}일 후 예정`;
    }

    if (diffMins < 1) return '방금 전';
    if (diffMins < 60) return `${diffMins}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const getUnreadCount = () => {
    return allNotifications.filter(n => !readNotificationIds.includes(n.id)).length;
  };

  const unreadCount = getUnreadCount();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>알림</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* 알림 활성화/비활성화 */}
      <View style={styles.section}>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>알림 받기</Text>
            <Text style={styles.settingDescription}>
              타임라인 일정 알림을 받습니다
            </Text>
          </View>
          <Switch
            value={notificationEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#767577', true: COLORS.lightPink }}
            thumbColor={notificationEnabled ? COLORS.darkPink : '#f4f3f4'}
          />
        </View>
      </View>

      {/* 테스트 알림 */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.testButton}
          onPress={sendTestNotification}
        >
          <Text style={styles.testButtonText}>테스트 알림 보내기</Text>
        </TouchableOpacity>
      </View>

      {/* 받은 알림 목록 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          받은 알림 ({allNotifications.length}개)
        </Text>
        {allNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>
              알림이 없습니다
            </Text>
            <Text style={styles.emptySubText}>
              타임라인 일정에 따라 알림이 도착합니다
            </Text>
          </View>
        ) : (
          allNotifications.map((notification, index) => {
            const isRead = readNotificationIds.includes(notification.id);
            const isFuture = new Date(notification.date) > new Date();
            return (
              <TouchableOpacity
                key={notification.id || index}
                style={[
                  styles.notificationItem,
                  !isRead && styles.notificationItemUnread,
                  isFuture && styles.notificationItemFuture,
                ]}
                onPress={() => handleNotificationPress(notification)}
                activeOpacity={0.7}
              >
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text style={[
                      styles.notificationTitle,
                      !isRead && styles.notificationTitleUnread
                    ]}>
                      {notification.title}
                    </Text>
                    {!isRead && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notificationBody} numberOfLines={2}>
                    {notification.body}
                  </Text>
                  <View style={styles.notificationFooter}>
                    <Text style={styles.notificationDate}>
                      {formatNotificationDate(notification.date)}
                    </Text>
                    {notification.itemId && (
                      <Text style={styles.tapHint}>탭하여 상세보기</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* 알림 안내 */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 각 타임라인 항목마다 D-7, D-3, D-Day에 알림을 받게 됩니다.{'\n'}
          {'\n'}
          알림을 탭하면 해당 일정의 상세 정보를 볼 수 있습니다.
        </Text>
      </View>
    </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
  },
  badge: {
    backgroundColor: COLORS.darkPink,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  settingItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
  },
  testButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.darkPink,
    borderRadius: 12,
    padding: 14,
  },
  testButtonText: {
    color: COLORS.darkPink,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'GowunDodum_400Regular',
    textAlign: 'center',
  },
  notificationItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  notificationItemUnread: {
    backgroundColor: COLORS.lightPink,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.darkPink,
  },
  notificationItemFuture: {
    opacity: 0.7,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    flex: 1,
  },
  notificationTitleUnread: {
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.darkPink,
    marginLeft: 8,
  },
  notificationBody: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationDate: {
    fontSize: 12,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textLight,
  },
  tapHint: {
    fontSize: 11,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
  },
  emptyContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
  },
  infoBox: {
    margin: 20,
    backgroundColor: COLORS.lightPink,
    borderRadius: 12,
    padding: 20,
  },
  infoText: {
    fontSize: 14,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    lineHeight: 22,
  },
});
