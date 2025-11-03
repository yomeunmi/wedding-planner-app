import AsyncStorage from '@react-native-async-storage/async-storage';

// 웨딩 준비 타임라인 계산 및 관리
export class WeddingTimeline {
  constructor() {
    this.weddingDate = null;
    this.startDate = null;
    this.timeline = [];
  }

  // 날짜 설정
  setDates(weddingDate, startDate) {
    this.weddingDate = new Date(weddingDate);
    this.startDate = new Date(startDate);
    this.calculateTimeline();
  }

  // 타임라인 계산
  calculateTimeline() {
    this.timeline = [];
    const totalDays = this.getDaysBetween(this.startDate, this.weddingDate);

    // 웨딩홀 투어일 계산: 준비 시작일로부터 7일 뒤 주말
    const getNextWeekend = (startDate) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + 7); // 7일 뒤

      const dayOfWeek = date.getDay(); // 0(일) ~ 6(토)

      // 이미 토요일(6) 또는 일요일(0)이면 그대로 사용
      if (dayOfWeek === 6 || dayOfWeek === 0) {
        return date;
      }

      // 월~금요일이면 다음 토요일로
      const daysUntilSaturday = 6 - dayOfWeek;
      date.setDate(date.getDate() + daysUntilSaturday);
      return date;
    };

    const weddingHallTourDate = getNextWeekend(this.startDate);

    // 각 항목별 권장 시기
    const milestones = [
      {
        id: 'wedding-hall-tour',
        title: '웨딩홀 투어',
        icon: '🏛️',
        description: '여러 웨딩홀을 방문하여 비교해보세요. 주말에 실제 예식이 진행되는 모습을 보면 더 좋습니다.',
        customDate: weddingHallTourDate,
        category: 'wedding-halls',
        tips: [
          '최소 3~4곳의 웨딩홀을 방문하여 비교해보세요',
          '주말 예식 현장을 직접 보면 분위기를 파악하기 좋습니다',
          '식사 메뉴와 품질을 꼭 시식해보세요',
          '계약은 서두르지 말고 충분히 비교 후 결정하세요',
          '하객 규모를 미리 예상하여 홀 크기를 선택하세요'
        ]
      },
      {
        id: 'studio',
        title: '스튜디오 촬영',
        icon: '📸',
        description: '웨딩 스튜디오에서 본식 전 촬영을 진행합니다. 계절과 날씨를 고려하여 야외 촬영 장소를 선택하세요.',
        daysBeforeWedding: Math.min(totalDays - 60, 120),
        category: 'studios',
        tips: [
          '포트폴리오를 꼼꼼히 확인하고 본인의 스타일과 맞는지 체크하세요',
          '패키지 구성과 추가 비용을 상세히 확인하세요',
          '원하는 촬영 컨셉과 장소를 미리 상담하세요',
          '보정 범위와 앨범 제작 기간을 확인하세요',
          '우천 시 대처 방안을 미리 협의하세요'
        ]
      },
      {
        id: 'dress-tour',
        title: '드레스 투어',
        icon: '👗',
        description: '웨딩드레스와 턱시도를 선택합니다. 여러 곳을 방문하여 다양한 스타일을 착용해보세요.',
        daysBeforeWedding: Math.min(totalDays - 90, 90),
        category: 'dress',
        tips: [
          '최소 5벌 이상 입어보고 비교하세요',
          '사진으로 남겨서 나중에 다시 비교해보세요',
          '체형에 맞는 드레스 라인을 전문가와 상담하세요',
          '수선 비용과 기간을 확인하세요',
          '액세서리와 소품 포함 여부를 확인하세요'
        ]
      },
      {
        id: 'dress-fitting',
        title: '본식 드레스 가봉',
        icon: '✂️',
        description: '결혼식 한 달 전, 마지막 드레스 피팅입니다. 이 시기까지 목표 체중을 유지하는 것이 중요합니다.',
        daysBeforeWedding: 30,
        category: 'dress',
        tips: [
          '가봉일 2주 전부터는 체중 변화가 없도록 유지하세요',
          '건강한 다이어트: 하루 1,200~1,500kcal 균형잡힌 식단',
          '주 3~4회 유산소 운동 (걷기, 수영, 필라테스)',
          '충분한 수면과 스트레스 관리가 중요합니다',
          '극단적인 다이어트는 피부와 건강에 해로우니 주의하세요',
          '드레스 라인이 예쁘게 나오도록 자세 교정 운동도 도움이 됩니다',
          '가봉 시 실제 착용할 속옷을 꼭 챙겨가세요'
        ]
      },
      {
        id: 'makeup',
        title: '메이크업 예약',
        icon: '💄',
        description: '본식 당일 메이크업과 헤어를 담당할 샵을 예약합니다. 리허설을 통해 원하는 스타일을 미리 확인하세요.',
        daysBeforeWedding: Math.min(totalDays - 120, 60),
        category: 'makeup',
        tips: [
          '포트폴리오에서 본인이 원하는 스타일을 찾아보세요',
          '리허설 메이크업을 꼭 받아보세요',
          '예식 시간을 고려하여 메이크업 시간을 예약하세요',
          '동행 메이크업(어머니, 들러리 등) 서비스를 확인하세요',
          '피부 관리 스케줄도 함께 상담하세요'
        ]
      }
    ];

    // 각 마일스톤의 날짜 계산
    milestones.forEach(milestone => {
      let itemDate;

      // 커스텀 날짜가 있으면 사용
      if (milestone.customDate) {
        itemDate = new Date(milestone.customDate);
      } else {
        // 결혼식 기준으로 역산
        itemDate = new Date(this.weddingDate);
        itemDate.setDate(itemDate.getDate() - milestone.daysBeforeWedding);
      }

      // 시작일보다 이른 경우 시작일로 조정
      if (itemDate < this.startDate) {
        itemDate.setTime(this.startDate.getTime());
      }

      this.timeline.push({
        ...milestone,
        date: itemDate,
        completed: false
      });
    });

    // 날짜순으로 정렬
    this.timeline.sort((a, b) => a.date - b.date);
  }

  // 두 날짜 사이의 일수 계산
  getDaysBetween(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((date2 - date1) / oneDay));
  }

  // D-Day 계산
  getDDay() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const wedding = new Date(this.weddingDate);
    wedding.setHours(0, 0, 0, 0);
    const days = Math.ceil((wedding - today) / (1000 * 60 * 60 * 24));
    return days;
  }

  // 준비 기간 계산 (주 단위)
  getPrepPeriod() {
    const days = this.getDaysBetween(this.startDate, this.weddingDate);
    const weeks = Math.floor(days / 7);
    return `${weeks}주`;
  }

  // 완료된 항목 수 계산
  getCompletedCount() {
    return this.timeline.filter(item => item.completed).length;
  }

  // 항목 완료 상태 토글
  async toggleCompleted(itemId) {
    const item = this.timeline.find(i => i.id === itemId);
    if (item) {
      item.completed = !item.completed;
      await this.saveCompletionStatus();
      return item.completed;
    }
    return false;
  }

  // 완료 상태 저장
  async saveCompletionStatus() {
    const completionStatus = {};
    this.timeline.forEach(item => {
      completionStatus[item.id] = item.completed;
    });
    await AsyncStorage.setItem('wedding-timeline-completion', JSON.stringify(completionStatus));
  }

  // 완료 상태 불러오기
  async loadCompletionStatus() {
    const saved = await AsyncStorage.getItem('wedding-timeline-completion');
    if (saved) {
      const completionStatus = JSON.parse(saved);
      this.timeline.forEach(item => {
        if (completionStatus[item.id] !== undefined) {
          item.completed = completionStatus[item.id];
        }
      });
    }
  }

  // 타임라인 저장
  async save() {
    const data = {
      weddingDate: this.weddingDate.toISOString(),
      startDate: this.startDate.toISOString(),
      timeline: this.timeline
    };
    await AsyncStorage.setItem('wedding-timeline-data', JSON.stringify(data));
  }

  // 타임라인 불러오기
  async load() {
    const saved = await AsyncStorage.getItem('wedding-timeline-data');
    if (saved) {
      const data = JSON.parse(saved);
      this.weddingDate = new Date(data.weddingDate);
      this.startDate = new Date(data.startDate);
      this.timeline = data.timeline.map(item => ({
        ...item,
        date: new Date(item.date)
      }));
      // 완료 상태 복원
      await this.loadCompletionStatus();
      return true;
    }
    return false;
  }

  // 저장된 데이터가 있는지 확인
  async hasSavedData() {
    const data = await AsyncStorage.getItem('wedding-timeline-data');
    return data !== null;
  }

  // 날짜 포맷팅
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    const weekday = weekdays[date.getDay()];
    return `${year}.${month}.${day} (${weekday})`;
  }

  // 항목 ID로 상세 정보 가져오기
  getItemById(itemId) {
    return this.timeline.find(item => item.id === itemId);
  }

  // 날짜 업데이트
  async updateItemDate(itemId, newDate) {
    const item = this.timeline.find(i => i.id === itemId);
    if (item) {
      item.date = new Date(newDate);
      await this.save();
      return true;
    }
    return false;
  }
}
