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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants/colors';

export default function NotificationScreen({ timeline }) {
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [scheduledNotifications, setScheduledNotifications] = useState([]);
  const [receivedNotifications, setReceivedNotifications] = useState([]);
  const [readNotificationIds, setReadNotificationIds] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotificationSettings();
    loadScheduledNotifications();
    loadReceivedNotifications();
    loadReadNotificationIds();
  }, []);

  const loadNotificationSettings = async () => {
    const enabled = await AsyncStorage.getItem('notifications-enabled');
    setNotificationEnabled(enabled !== 'false');
  };

  const loadScheduledNotifications = async () => {
    try {
      const notifications = await timeline.getScheduledNotifications();
      setScheduledNotifications(notifications || []);

      // 스케줄된 알림 정보를 히스토리에 저장
      await saveNotificationHistory(notifications || []);
    } catch (error) {
      console.error('알림 로드 오류:', error);
    }
  };

  const saveNotificationHistory = async (notifications) => {
    try {
      const existing = await AsyncStorage.getItem('notification-history');
      const history = existing ? JSON.parse(existing) : [];

      for (const notification of notifications) {
        const id = notification.identifier;
        if (id && !history.find(h => h.id === id)) {
          const triggerDate = getNotificationTriggerDate(notification);
          history.push({
            id,
            title: notification.content?.title || '알림',
            body: notification.content?.body || '',
            date: triggerDate ? triggerDate.toISOString() : null,
            createdAt: new Date().toISOString(),
          });
        }
      }

      await AsyncStorage.setItem('notification-history', JSON.stringify(history));
    } catch (error) {
      console.error('알림 히스토리 저장 오류:', error);
    }
  };

  const loadReceivedNotifications = async () => {
    try {
      const history = await AsyncStorage.getItem('notification-history');
      if (history) {
        const parsed = JSON.parse(history);
        const now = new Date();
        // 시간이 지난 알림만 "받은 알림"으로 표시
        const received = parsed.filter(n => {
          if (!n.date) return false;
          return new Date(n.date) <= now;
        });
        setReceivedNotifications(received);
      }
    } catch (error) {
      console.error('받은 알림 로드 오류:', error);
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

  const markAsRead = async (notificationId) => {
    try {
      const newReadIds = [...readNotificationIds, notificationId];
      setReadNotificationIds(newReadIds);
      await AsyncStorage.setItem('read-notification-ids', JSON.stringify(newReadIds));
    } catch (error) {
      console.error('읽음 처리 오류:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadScheduledNotifications();
    await loadReceivedNotifications();
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
        await loadScheduledNotifications();
        Alert.alert('알림 활성화', '알림이 활성화되었습니다.', [{ text: '확인' }]);
      }
    } else {
      await timeline.cancelAllNotifications();
      setScheduledNotifications([]);
      Alert.alert('알림 비활성화', '모든 알림이 취소되었습니다.', [{ text: '확인' }]);
    }
  };

  const sendTestNotification = async () => {
    await timeline.sendTestNotification();
    Alert.alert('테스트 알림', '테스트 알림이 전송되었습니다!', [{ text: '확인' }]);
  };

  const getNotificationTriggerDate = (notification) => {
    if (!notification.trigger) return null;

    const trigger = notification.trigger;

    if (trigger instanceof Date) {
      return trigger;
    }

    if (trigger.date !== undefined) {
      return new Date(trigger.date);
    }

    if (trigger.value !== undefined) {
      return new Date(trigger.value);
    }

    if (typeof trigger === 'number') {
      return new Date(trigger);
    }

    // seconds 형식의 trigger 처리
    if (trigger.seconds !== undefined) {
      const futureDate = new Date();
      futureDate.setSeconds(futureDate.getSeconds() + trigger.seconds);
      return futureDate;
    }

    return null;
  };

  const formatNotificationDate = (dateString) => {
    if (!dateString) return '알 수 없음';

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    return `${year}.${month}.${day} ${hour}:${minute}`;
  };

  const formatScheduledNotificationDate = (notification) => {
    const date = getNotificationTriggerDate(notification);
    if (!date) return '알 수 없음';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');

    return `${year}.${month}.${day} ${hour}:${minute}`;
  };

  const getNotificationStats = () => {
    const now = new Date();
    const upcoming = scheduledNotifications.filter(n => {
      const triggerDate = getNotificationTriggerDate(n);
      if (!triggerDate) return false;
      return triggerDate > now;
    });

    return {
      upcoming: upcoming.length,
      received: receivedNotifications.length,
      unread: receivedNotifications.filter(n => !readNotificationIds.includes(n.id)).length
    };
  };

  const stats = getNotificationStats();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>알림 설정</Text>
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

      {/* 알림 통계 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>알림 현황</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.upcoming}</Text>
            <Text style={styles.statLabel}>예정된 알림</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.received}</Text>
            <Text style={styles.statLabel}>받은 알림</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.unread}</Text>
            <Text style={styles.statLabel}>안읽은 알림</Text>
          </View>
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
          받은 알림 ({stats.received}개)
        </Text>
        {receivedNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>
              받은 알림이 없습니다
            </Text>
          </View>
        ) : (
          receivedNotifications
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((notification, index) => {
              const isRead = readNotificationIds.includes(notification.id);
              return (
                <TouchableOpacity
                  key={notification.id || index}
                  style={[
                    styles.notificationItem,
                    !isRead && styles.notificationItemUnread
                  ]}
                  onPress={() => !isRead && markAsRead(notification.id)}
                >
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <Text style={styles.notificationTitle}>
                        {notification.title}
                      </Text>
                      {!isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notificationBody}>
                      {notification.body}
                    </Text>
                    <Text style={styles.notificationDate}>
                      {formatNotificationDate(notification.date)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
        )}
      </View>

      {/* 예정된 알림 목록 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          예정된 알림 ({stats.upcoming}개)
        </Text>
        {stats.upcoming === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>
              예정된 알림이 없습니다
            </Text>
          </View>
        ) : (
          scheduledNotifications
            .filter(n => {
              const triggerDate = getNotificationTriggerDate(n);
              if (!triggerDate) return false;
              return triggerDate > new Date();
            })
            .sort((a, b) => {
              const dateA = getNotificationTriggerDate(a) || new Date(0);
              const dateB = getNotificationTriggerDate(b) || new Date(0);
              return dateA - dateB;
            })
            .map((notification, index) => (
              <View key={notification.identifier || index} style={styles.notificationItem}>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>
                    {notification.content?.title || '알림'}
                  </Text>
                  <Text style={styles.notificationBody}>
                    {notification.content?.body || ''}
                  </Text>
                  <Text style={styles.notificationDate}>
                    {formatScheduledNotificationDate(notification)}
                  </Text>
                </View>
              </View>
            ))
        )}
      </View>

      {/* 알림 안내 */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          💡 각 타임라인 항목마다 D-7, D-3, D-Day에 알림을 받게 됩니다.{'\n'}
          {'\n'}
          알림 권한을 허용하지 않으셨다면 설정 {'>'} 알림에서 권한을 변경해주세요.
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
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
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textGray,
  },
  testButton: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.darkPink,
    borderRadius: 12,
    padding: 16,
  },
  testButtonText: {
    color: COLORS.darkPink,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'GowunDodum_400Regular',
    textAlign: 'center',
  },
  notificationItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  notificationItemUnread: {
    backgroundColor: COLORS.lightPink,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    marginBottom: 4,
    flex: 1,
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
  },
  notificationDate: {
    fontSize: 12,
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textLight,
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
