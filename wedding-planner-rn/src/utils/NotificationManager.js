// 알림 기능 비활성화 버전 - Android 크래시 방지
// expo-notifications 플러그인이 비활성화되어 있어 모든 메서드는 안전하게 아무것도 하지 않음

export class NotificationManager {
  constructor() {
    this.notificationIds = {};
    this.initialized = false;
  }

  // 초기화 메서드 - 아무것도 하지 않음
  async initialize() {
    this.initialized = true;
    return true;
  }

  // 알림 권한 요청 - 항상 false 반환
  async requestPermissions() {
    console.log('알림 기능이 비활성화되어 있습니다.');
    return false;
  }

  // 타임라인 항목에 대한 알림 스케줄링 - 아무것도 하지 않음
  async scheduleTimelineNotifications(timelineItems) {
    return 0;
  }

  // 개별 알림 스케줄링 - 아무것도 하지 않음
  async scheduleNotification(title, body, triggerDate, data = {}) {
    return null;
  }

  // 모든 알림 취소 - 아무것도 하지 않음
  async cancelAllNotifications() {
    return;
  }

  // 특정 항목의 알림 취소 - 아무것도 하지 않음
  async cancelItemNotifications(itemId) {
    return;
  }

  // 스케줄링된 알림 목록 조회 - 빈 배열 반환
  async getScheduledNotifications() {
    return [];
  }

  // 테스트용 즉시 알림 - 아무것도 하지 않음
  async sendTestNotification() {
    console.log('알림 기능이 비활성화되어 있습니다.');
    return;
  }
}

export default new NotificationManager();
