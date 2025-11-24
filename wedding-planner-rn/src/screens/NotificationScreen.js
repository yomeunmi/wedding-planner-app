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
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotificationSettings();
    loadScheduledNotifications();
  }, []);

  const loadNotificationSettings = async () => {
    const enabled = await AsyncStorage.getItem('notifications-enabled');
    setNotificationEnabled(enabled !== 'false');
  };

  const loadScheduledNotifications = async () => {
    try {
      const notifications = await timeline.getScheduledNotifications();
      setScheduledNotifications(notifications || []);
    } catch (error) {
      console.error('알림 로드 오류:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadScheduledNotifications();
    setRefreshing(false);
  };

  const toggleNotifications = async (value) => {
    setNotificationEnabled(value);
    await AsyncStorage.setItem('notifications-enabled', value.toString());

    if (value) {
      // 알림 활성화 - 권한 요청 및 스케줄링
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
      // 알림 비활성화 - 모든 알림 취소
      await timeline.cancelAllNotifications();
      setScheduledNotifications([]);
      Alert.alert('알림 비활성화', '모든 알림이 취소되었습니다.', [{ text: '확인' }]);
    }
  };

  const sendTestNotification = async () => {
    await timeline.sendTestNotification();
    Alert.alert('테스트 알림', '테스트 알림이 전송되었습니다!', [{ text: '확인' }]);
  };

  const formatNotificationDate = (notification) => {
    if (!notification.trigger || !notification.trigger.value) {
      return '알 수 없음';
    }

    const date = new Date(notification.trigger.value);
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
      if (!n.trigger || !n.trigger.value) return false;
      return new Date(n.trigger.value) > now;
    });
    const past = scheduledNotifications.filter(n => {
      if (!n.trigger || !n.trigger.value) return false;
      return new Date(n.trigger.value) <= now;
    });

    return { upcoming: upcoming.length, past: past.length };
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
            <Text style={styles.statValue}>{scheduledNotifications.length}</Text>
            <Text style={styles.statLabel}>전체 알림</Text>
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

      {/* 예정된 알림 목록 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          예정된 알림 ({stats.upcoming}개)
        </Text>
        {scheduledNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>
              예정된 알림이 없습니다
            </Text>
          </View>
        ) : (
          scheduledNotifications
            .filter(n => {
              if (!n.trigger || !n.trigger.value) return false;
              return new Date(n.trigger.value) > new Date();
            })
            .sort((a, b) => {
              const dateA = new Date(a.trigger?.value || 0);
              const dateB = new Date(b.trigger?.value || 0);
              return dateA - dateB;
            })
            .map((notification, index) => (
              <View key={index} style={styles.notificationItem}>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>
                    {notification.content?.title || '알림'}
                  </Text>
                  <Text style={styles.notificationBody}>
                    {notification.content?.body || ''}
                  </Text>
                  <Text style={styles.notificationDate}>
                    {formatNotificationDate(notification)}
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
    paddingTop: 60,
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
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.darkPink,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
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
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'GowunDodum_400Regular',
    color: COLORS.textDark,
    marginBottom: 4,
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
