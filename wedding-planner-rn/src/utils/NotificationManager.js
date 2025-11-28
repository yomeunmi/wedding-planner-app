import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class NotificationManager {
  constructor() {
    this.notificationIds = {};
    this.initialized = false;
  }

  // 초기화 메서드 - 앱 시작 후 호출
  async initialize() {
    if (this.initialized) return;

    try {
      // 알림 설정: 앱이 foreground일 때도 알림 표시
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });
      this.initialized = true;
    } catch (error) {
      console.log('Notification handler setup failed:', error);
    }
  }

  // 알림 권한 요청
  async requestPermissions() {
    try {
      await this.initialize();

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('알림 권한이 거부되었습니다.');
        return false;
      }

      // Android의 경우 채널 설정
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('wedding-timeline', {
          name: '웨딩 타임라인 알림',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6B9D',
          sound: 'default',
        });
      }

      return true;
    } catch (error) {
      console.error('알림 권한 요청 중 오류:', error);
      return false;
    }
  }

  // 오늘 날짜 문자열 (중복 방지용)
  getTodayString() {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  }

  // 타임라인 항목에 대한 알림 스케줄링
  async scheduleTimelineNotifications(timelineItems) {
    try {
      // 기존 스케줄된 알림 취소 (히스토리는 유지)
      await Notifications.cancelAllScheduledNotificationsAsync();

      const now = new Date();
      now.setHours(0, 0, 0, 0); // 오늘 자정 기준
      const scheduledNotifications = [];
      const immediateNotifications = []; // 즉시 보낼 알림 목록

      // 오늘 이미 보낸 즉시 알림 체크
      const todayString = this.getTodayString();
      const sentTodayKey = `sent-immediate-notifications-${todayString}`;
      const sentTodayData = await AsyncStorage.getItem(sentTodayKey);
      const sentToday = sentTodayData ? JSON.parse(sentTodayData) : [];

      for (const item of timelineItems) {
        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);

        // 이미 지난 날짜는 스케줄링하지 않음
        if (itemDate < now) {
          continue;
        }

        // 일정까지 남은 일수 계산
        const daysUntil = Math.ceil((itemDate - now) / (1000 * 60 * 60 * 24));

        // === 즉시 알림: 현재 7일 이내 또는 3일 이내 일정 (중복 방지) ===
        const immediateKey7 = `${item.id}-immediate-7-${daysUntil}`;
        const immediateKey3 = `${item.id}-immediate-3-${daysUntil}`;
        const immediateKeyDday = `${item.id}-immediate-dday`;

        // 7일 이내 일정 (3일 초과 ~ 7일 이하)
        if (daysUntil > 0 && daysUntil <= 7 && daysUntil > 3 && !sentToday.includes(immediateKey7)) {
          immediateNotifications.push({
            key: immediateKey7,
            title: `${item.title} ${daysUntil}일 전`,
            body: `${item.title}까지 ${daysUntil}일 남았습니다. 준비를 시작하세요!`,
            data: { itemId: item.id, type: 'immediate-7' }
          });
        }

        // 3일 이내 일정 (1일 이상 ~ 3일 이하)
        if (daysUntil > 0 && daysUntil <= 3 && !sentToday.includes(immediateKey3)) {
          immediateNotifications.push({
            key: immediateKey3,
            title: `${item.title} ${daysUntil}일 전`,
            body: `${item.title}까지 ${daysUntil}일 남았습니다. 서두르세요!`,
            data: { itemId: item.id, type: 'immediate-3' }
          });
        }

        // 오늘이 D-Day인 경우
        if (daysUntil === 0 && !sentToday.includes(immediateKeyDday)) {
          immediateNotifications.push({
            key: immediateKeyDday,
            title: `오늘은 ${item.title} 날!`,
            body: `${item.title} 일정을 확인하세요. ${item.icon || ''}`,
            data: { itemId: item.id, type: 'immediate-dday' }
          });
        }

        // === 미래 알림 스케줄링 ===

        // 1. D-7일 알림 (7일보다 더 남은 경우에만)
        if (daysUntil > 7) {
          const sevenDaysBefore = new Date(itemDate);
          sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);
          sevenDaysBefore.setHours(10, 0, 0, 0); // 오전 10시

          const id = await this.scheduleNotification(
            `${item.title} 일주일 전`,
            `${item.title}까지 7일 남았습니다. 준비를 시작하세요!`,
            sevenDaysBefore,
            { itemId: item.id, type: 'd-7' }
          );
          if (id) scheduledNotifications.push({ itemId: item.id, type: 'd-7', notificationId: id });
        }

        // 2. D-3일 알림 (3일보다 더 남은 경우에만)
        if (daysUntil > 3) {
          const threeDaysBefore = new Date(itemDate);
          threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
          threeDaysBefore.setHours(10, 0, 0, 0); // 오전 10시

          const id = await this.scheduleNotification(
            `${item.title} 3일 전`,
            `${item.title}까지 3일 남았습니다. 잊지 마세요!`,
            threeDaysBefore,
            { itemId: item.id, type: 'd-3' }
          );
          if (id) scheduledNotifications.push({ itemId: item.id, type: 'd-3', notificationId: id });
        }

        // 3. D-Day 알림 (아직 당일이 아닌 경우)
        if (daysUntil > 0) {
          const dDayTime = new Date(itemDate);
          dDayTime.setHours(9, 0, 0, 0); // 오전 9시

          const id = await this.scheduleNotification(
            `오늘은 ${item.title} 날!`,
            `${item.title} 일정을 확인하세요. 행복한 하루 되세요! ${item.icon || ''}`,
            dDayTime,
            { itemId: item.id, type: 'd-day' }
          );
          if (id) scheduledNotifications.push({ itemId: item.id, type: 'd-day', notificationId: id });
        }
      }

      // 즉시 알림 보내기 (3초 간격으로)
      const newSentKeys = [...sentToday];
      for (let i = 0; i < immediateNotifications.length; i++) {
        const notification = immediateNotifications[i];
        const delaySeconds = (i + 1) * 3;

        const id = await this.scheduleNotification(
          notification.title,
          notification.body,
          { seconds: delaySeconds },
          notification.data
        );
        if (id) {
          scheduledNotifications.push({
            itemId: notification.data.itemId,
            type: notification.data.type,
            notificationId: id
          });
          newSentKeys.push(notification.key);
        }
      }

      // 오늘 보낸 즉시 알림 키 저장 (중복 방지용)
      await AsyncStorage.setItem(sentTodayKey, JSON.stringify(newSentKeys));

      // 스케줄링된 알림 ID 저장
      await AsyncStorage.setItem(
        'scheduled-notifications',
        JSON.stringify(scheduledNotifications)
      );

      console.log(`${scheduledNotifications.length}개의 알림이 스케줄링되었습니다. (즉시: ${immediateNotifications.length}개)`);
      return scheduledNotifications.length;
    } catch (error) {
      console.error('알림 스케줄링 중 오류:', error);
      return 0;
    }
  }

  // 개별 알림 스케줄링
  async scheduleNotification(title, body, triggerDate, data = {}) {
    try {
      const trigger = triggerDate;

      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          ...(Platform.OS === 'android' && {
            channelId: 'wedding-timeline',
          }),
        },
        trigger,
      });

      return id;
    } catch (error) {
      console.error('알림 스케줄링 오류:', error);
      return null;
    }
  }

  // 모든 알림 취소
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.removeItem('scheduled-notifications');
      console.log('모든 알림이 취소되었습니다.');
    } catch (error) {
      console.error('알림 취소 중 오류:', error);
    }
  }

  // 특정 항목의 알림 취소
  async cancelItemNotifications(itemId) {
    try {
      const saved = await AsyncStorage.getItem('scheduled-notifications');
      if (!saved) return;

      const scheduledNotifications = JSON.parse(saved);
      const itemNotifications = scheduledNotifications.filter(n => n.itemId === itemId);

      for (const notification of itemNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.notificationId);
      }

      // 저장된 목록에서 제거
      const remaining = scheduledNotifications.filter(n => n.itemId !== itemId);
      await AsyncStorage.setItem('scheduled-notifications', JSON.stringify(remaining));

      console.log(`${itemId} 항목의 알림이 취소되었습니다.`);
    } catch (error) {
      console.error('항목 알림 취소 중 오류:', error);
    }
  }

  // 스케줄링된 알림 목록 조회
  async getScheduledNotifications() {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      return scheduled;
    } catch (error) {
      console.error('스케줄링된 알림 조회 오류:', error);
      return [];
    }
  }

  // 테스트용 즉시 알림
  async sendTestNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '웨딩 플래너 알림 테스트',
          body: '알림이 정상적으로 작동합니다! 🎉',
          data: { test: true },
        },
        trigger: null, // 즉시 전송
      });
    } catch (error) {
      console.error('테스트 알림 전송 오류:', error);
    }
  }
}

export default new NotificationManager();
