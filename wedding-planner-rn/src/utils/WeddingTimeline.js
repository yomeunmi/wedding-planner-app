import AsyncStorage from '@react-native-async-storage/async-storage';
import NotificationManager from './NotificationManager';

// 웨딩 준비 타임라인 계산 및 관리
export class WeddingTimeline {
  constructor() {
    this.weddingDate = null;
    this.startDate = null;
    this.timeline = [];
    this.notificationManager = NotificationManager;
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
    const totalMonths = totalDays / 30; // 대략적인 개월 수

    // 권장 개월 수 기반 스케줄링 함수
    // minM: 최소 권장 시점, maxM: 최대 권장 시점 (결혼식 기준)
    // monthsLeft > maxM → 미래 예정 (maxM에 스케줄)
    // minM ≤ monthsLeft ≤ maxM → 현재 할 일
    // monthsLeft < minM → 지연 → ASAP 스케줄링
    const calculateScheduleDate = (minM, maxM, priorityOffset = 0) => {
      // 결혼식까지 남은 개월 수가 권장 범위보다 많으면 maxM 시점에 스케줄
      // 권장 범위 내이면 중간 시점에 스케줄
      // 이미 지연되었으면 시작일 + 약간의 오프셋

      const targetMonths = maxM; // 권장 시작 시점
      const targetDays = Math.round(targetMonths * 30);

      let scheduledDate = new Date(this.weddingDate);
      scheduledDate.setDate(scheduledDate.getDate() - targetDays);

      // 시작일보다 이른 경우, 시작일 기준으로 순차 배치
      if (scheduledDate < this.startDate) {
        scheduledDate = new Date(this.startDate);
        // 우선순위에 따라 며칠씩 오프셋 추가 (일정 분산)
        scheduledDate.setDate(scheduledDate.getDate() + priorityOffset * 3);
      }

      return scheduledDate;
    };

    // 주말 찾기 함수 (투어용)
    const getNextWeekend = (date) => {
      const result = new Date(date);
      const dayOfWeek = result.getDay();
      if (dayOfWeek === 6 || dayOfWeek === 0) return result;
      const daysUntilSaturday = 6 - dayOfWeek;
      result.setDate(result.getDate() + daysUntilSaturday);
      return result;
    };

    // 각 항목별 권장 시기 (minM, maxM 기반)
    const milestones = [
      {
        id: 'wedding-hall-tour',
        title: '웨딩홀 투어',
        icon: '♥',
        description: '여러 웨딩홀을 방문하여 비교해보세요. 주말에 실제 예식이 진행되는 모습을 보면 더 좋습니다.',
        minM: 10, maxM: 12, priority: 1,
        category: 'wedding-halls',
        isWeekend: true,
        tips: [
          '최소 3~4곳의 웨딩홀을 방문하여 비교해보세요.',
          '주말 예식 현장을 직접 보면 분위기를 파악하기 좋습니다.',
          '식사 메뉴와 품질을 꼭 시식해보세요.',
          '계약은 서두르지 말고 충분히 비교 후 결정하세요.',
          '하객 규모를 미리 예상하여 홀 크기를 선택하세요.',
          '계약금과 잔금 일정을 확인하세요.',
          '취소 시 환불 규정을 꼼꼼히 확인하세요.',
          '식사 메뉴와 단가를 확정하세요.',
          '예식 시간과 홀 사용 시간을 확인하세요.',
          '부가 서비스(주차, 폐백실 등)를 확인하세요.'
        ]
      },
      {
        id: 'new-home',
        title: '신혼집 준비',
        icon: '⌂',
        description: '신혼집 계약과 가전, 가구, 생활용품 등 혼수를 준비합니다.',
        minM: 8, maxM: 12, priority: 2,
        category: 'home',
        tips: [
          '전세/월세/자가 계약 및 입주 날짜 확인.',
          '도배, 장판, 청소 일정 잡기.',
          '가전: TV, 냉장고, 세탁기, 건조기, 에어컨 등.',
          '가구: 침대, 매트리스, 소파, 식탁, 책상 등.',
          '생활: 침구, 수건, 주방용품 (냄비, 그릇, 수저 등).',
          '혼수 비용 분담 (신랑·신부·양가) 미리 합의.',
          '인터넷, TV, 전기·가스·수도 명의 변경.',
          '주소 이전 신고 (전입신고) 준비.'
        ]
      },
      {
        id: 'dress-shop-selection',
        title: '드레스샵 선택',
        icon: '◇',
        description: '웨딩드레스샵을 알아보고 스타일과 예산을 비교합니다. SNS와 후기를 참고하여 선택하세요.',
        minM: 7, maxM: 9, priority: 3,
        category: 'dress',
        tips: [
          'SNS나 인스타그램에서 드레스샵 포트폴리오 검색.',
          '패키지 구성과 가격대 미리 확인하기.',
          '체형에 맞는 드레스 라인을 전문가와 상담하세요.',
          '수선 비용과 기간을 확인하세요.',
          '액세서리와 소품(티아라, 귀걸이, 목걸이) 포함 여부 확인.',
          '대여 기간과 추가 대여 시 비용 확인.'
        ]
      },
      {
        id: 'honeymoon',
        title: '신혼여행 예약',
        icon: '✈',
        description: '신혼여행 행선지와 일정을 결정하고 항공권과 숙소를 예약합니다.',
        minM: 6, maxM: 10, priority: 4,
        category: 'honeymoon',
        tips: [
          '나라/도시, 여행 기간, 예산을 먼저 결정하세요.',
          '여권 유효기간 확인 (6개월 이상 남아야 함).',
          '항공권과 호텔(리조트) 예약은 미리 할수록 저렴.',
          '비자 필요 여부 확인하고 신청하세요.',
          '해외여행자 보험 가입 필수.',
          '환전할 통화와 금액, 해외 결제용 카드 준비.',
          '수영복, 어댑터, 기내용 가방 등 준비물 체크.',
          '직장에 연차 신청 미리 하기.'
        ]
      },
      {
        id: 'dress-tour',
        title: '드레스샵 투어',
        icon: '◆',
        description: '웨딩드레스와 턱시도를 선택합니다. 여러 곳을 방문하여 다양한 스타일을 착용해보세요.',
        minM: 6, maxM: 8, priority: 5,
        category: 'dress',
        isWeekend: true,
        tips: [
          '최소 5벌 이상 입어보고 비교하세요.',
          '사진으로 남겨서 나중에 다시 비교해보세요.',
          '웨딩슈즈 2켤레(본식용/촬영용 굽 높이 다르게).',
          '드레스용 속옷(브라, 보정속옷, 누브라) 미리 준비.',
          '드레스와 조화를 이루는 쥬얼리 톤 선택.',
          '신부님 어머니나 친구와 함께 가면 좋습니다.'
        ]
      },
      {
        id: 'wedding-studio-booking',
        title: '본식 스냅 계약',
        icon: '⦾',
        description: '웨딩 스튜디오를 선택하고 촬영 일정을 예약합니다. 포트폴리오와 패키지를 비교하여 선택하세요.',
        minM: 5, maxM: 8, priority: 6,
        category: 'studios',
        tips: [
          '포트폴리오를 꼼꼼히 확인하고 본인의 스타일과 맞는지 체크하세요.',
          '패키지 구성과 추가 비용을 상세히 확인하세요.',
          '원하는 촬영 컨셉과 장소를 미리 상담하세요.',
          '보정 범위와 앨범 제작 기간을 확인하세요.',
          '본식 스냅 사진 작가 섭외 (원본/보정컷 개수 확인).',
          '우천 시 대처 방안을 미리 협의하세요.'
        ]
      },
      {
        id: 'groom-suit',
        title: '신랑 예복 맞춤',
        icon: '◈',
        description: '신랑의 예복을 준비합니다. 턱시도, 예복, 한복 등 원하는 스타일을 선택하고 맞춤 제작합니다.',
        minM: 5, maxM: 7, priority: 7,
        category: 'dress',
        tips: [
          '신부 드레스와 조화를 이루는 색상과 스타일을 선택하세요.',
          '체형에 맞는 핏과 디자인을 전문가와 상담하세요.',
          '턱시도, 정장, 한복 등 여러 옵션을 비교해보세요.',
          '구두, 벨트, 타이/보우타이, 커프스 버튼 준비.',
          '양말 색상과 길이 확인 (앉았을 때 피부 안 보이게).',
          '최소 2회 이상 피팅을 받아 완벽한 핏을 만드세요.',
          '헤어 스타일링(커트, 파마) 시기와 본식 전 마지막 커트 일정 계획.'
        ]
      },
      {
        id: 'makeup',
        title: '메이크업샵 예약',
        icon: '✿',
        description: '본식 당일 메이크업과 헤어를 담당할 샵을 예약합니다. 포트폴리오를 확인하고 리허설을 통해 스타일을 미리 확인하세요.',
        minM: 4, maxM: 7, priority: 8,
        category: 'makeup',
        tips: [
          '포트폴리오에서 본인이 원하는 스타일을 찾아보세요.',
          '리허설 메이크업을 꼭 받아보세요.',
          '예식 시간을 고려하여 메이크업 시간을 예약하세요.',
          '동행 메이크업(어머니, 들러리 등) 서비스를 확인하세요.',
          '피부 관리 패키지 시작 시점과 마지막 관리일(D-1~3일) 계획.',
          '네일아트는 본식 2~3일 전에 예약하세요.',
          '헤어 컬러나 펌은 리허설과 본식을 고려해서 시기 조정.',
          '왁싱, 속눈썹 연장, 반영구 메이크업 필요 여부 결정.',
          '혼주 헤어/메이크업 샵도 함께 예약하세요.'
        ]
      },
      {
        id: 'wedding-photo-day',
        title: '웨딩촬영날',
        icon: '⦿',
        description: '웨딩 스튜디오에서 본식 전 촬영을 진행합니다. 계절과 날씨를 고려하여 야외 촬영 장소를 선택하세요.',
        minM: 3, maxM: 5, priority: 9,
        category: 'studios',
        isWeekend: true,
        tips: [
          '촬영 전날 충분한 휴식과 수면을 취하세요.',
          '헤어와 메이크업은 스튜디오에서 진행.',
          '편한 신발과 여분의 스타킹을 준비하세요.',
          '촬영 당일 컨디션 관리가 중요합니다.',
          '식전 영상과 포토 슬라이드용 사진 미리 모으기.',
          '포토테이블 액자와 웰컴보드 디자인 준비하기.'
        ]
      },
      {
        id: 'wedding-gifts',
        title: '예물 및 예단',
        icon: '◇',
        description: '양가에서 주고받을 예물과 예단을 준비합니다.',
        minM: 3, maxM: 5, priority: 10,
        category: 'gifts',
        tips: [
          '커플링, 예물 반지/시계/목걸이 범위 결정.',
          '예물 샵 여러 곳 방문해서 견적 비교.',
          '예단 할지 여부 양가와 논의 (간소화 트렌드).',
          '예단 할 경우: 예단비 액수, 예단함, 보자기 준비.',
          '예단 내용: 이불, 반상기 등 또는 현금으로 대체.',
          '상견례 때 미리 논의하면 좋습니다.',
          '실사용할지 상징용인지 결정하세요.'
        ]
      },
      {
        id: 'invitation-card',
        title: '청첩장 제작·발송',
        icon: '✉',
        description: '결혼식 초대장을 제작하고 발송합니다. 모바일 청첩장과 종이 청첩장을 함께 준비하세요.',
        minM: 1.5, maxM: 2, priority: 11,
        category: 'invitation',
        tips: [
          '양가 부모님께 하객 명단과 연락처 먼저 받기.',
          '하객 리스트를 엑셀이나 노션으로 관리하세요.',
          '결혼식 최소 4~6주 전에는 발송을 완료하세요.',
          '모바일 청첩장과 종이 청첩장 디자인을 통일하세요.',
          '예식 장소 약도, 교통편, 주차 안내를 명확히 표기.',
          '식사 여부, 셔틀버스 운행 등 중요 정보 기재.',
          '답례품 종류(수건, 쿠키, 텀블러 등) 결정.',
          '좌석 배치: 양가 상석, 친척석, 친구석 구역 나누기.'
        ]
      },
      {
        id: 'wedding-ceremony',
        title: '예식 진행 준비',
        icon: '◉',
        description: '예식 당일 진행을 위한 주례, 사회자, 축가, 식순 등을 준비합니다.',
        minM: 1, maxM: 2, priority: 12,
        category: 'ceremony',
        tips: [
          '주례 있을지 없을지 결정 (주례 없으면 사회자+영상으로 구성).',
          '주례 있을 경우: 섭외할 분 미리 연락, 사례 준비.',
          '사회자 섭외 (친구/지인 또는 프로 사회자).',
          '사회 대본 초안 작성 후 식장 코디네이터와 조율.',
          '축가할 친구나 연주팀 섭외, 곡 선정.',
          '입장곡/퇴장곡/케이크 커팅 등 타이밍별 BGM 리스트.',
          '포토 슬라이드/식전 영상 재생 여부 결정.',
          '폐백 여부 결정, 부케 전달 이벤트 계획.'
        ]
      },
      {
        id: 'parents-hanbok',
        title: '혼주 한복',
        icon: '✾',
        description: '양가 부모님의 한복을 준비합니다. 예식 분위기와 조화를 이루는 색상과 디자인을 선택하세요.',
        minM: 1, maxM: 2, priority: 13,
        category: 'hanbok',
        tips: [
          '부모님 체형과 취향을 고려하여 선택하세요.',
          '신랑신부 의상과 조화를 이루는 색상을 선택하세요.',
          '대여와 구매 중 예산에 맞는 옵션을 선택하세요.',
          '예식 2주 전에는 최종 피팅을 완료하세요.',
          '혼주 한복은 격식과 품위를 갖춘 디자인이 좋습니다.',
          '혼주 신발, 가방, 액세서리도 함께 준비하세요.'
        ]
      },
      {
        id: 'dress-fitting-3',
        title: '본식 가봉',
        icon: '✦',
        description: '결혼식 직전, 마지막 드레스 피팅입니다. 모든 것이 완벽한지 최종 확인합니다.',
        minM: 0.5, maxM: 1, priority: 14,
        category: 'dress',
        tips: [
          '가봉일 2주 전부터는 체중 변화가 없도록 유지하세요.',
          '건강한 다이어트: 하루 1,200~1,500kcal 균형잡힌 식단.',
          '주 3~4회 유산소 운동 (걷기, 수영, 필라테스).',
          '충분한 수면과 스트레스 관리가 중요합니다.',
          '극단적인 다이어트는 피부와 건강에 해로우니 주의하세요.',
          '드레스 라인이 예쁘게 나오도록 자세 교정 운동도 도움이 됩니다.',
          '가봉 시 실제 착용할 속옷을 꼭 챙겨가세요.'
        ]
      },
      {
        id: 'wedding-day',
        title: '결혼식 당일!',
        icon: '💒',
        description: '드디어 결혼식 당일입니다! 모든 준비를 마치고 행복한 하루를 맞이하세요.',
        customDate: this.weddingDate,
        category: 'wedding',
        tips: [
          '전날 충분한 휴식과 수면을 취하세요.',
          '예식 최소 2~3시간 전 도착하여 헤어/메이크업 시작.',
          '반지, 축의금 봉투, 부케, 답례품 등 필수 아이템 체크.',
          '양가 부모님, 들러리, 친구들과 최종 확인.',
          '사진 촬영과 식사 시간을 여유있게 계획하세요.',
          '감사한 마음으로 모든 순간을 즐기세요!'
        ]
      }
    ];

    // 각 마일스톤의 날짜 계산
    milestones.forEach(milestone => {
      let itemDate;

      // 커스텀 날짜가 있으면 사용
      if (milestone.customDate) {
        itemDate = new Date(milestone.customDate);
      } else if (milestone.minM !== undefined && milestone.maxM !== undefined) {
        // 권장 개월 수 기반 스케줄링
        itemDate = calculateScheduleDate(milestone.minM, milestone.maxM, milestone.priority || 0);

        // 주말로 조정이 필요한 경우
        if (milestone.isWeekend) {
          itemDate = getNextWeekend(itemDate);
        }
      } else {
        // 기존 방식 (호환성)
        itemDate = new Date(this.weddingDate);
        if (milestone.daysBeforeWedding) {
          itemDate.setDate(itemDate.getDate() - milestone.daysBeforeWedding);
        }
      }

      // 시작일보다 이른 경우 시작일 기준으로 조정
      if (itemDate < this.startDate) {
        itemDate = new Date(this.startDate);
        // 우선순위에 따라 오프셋 추가
        if (milestone.priority) {
          itemDate.setDate(itemDate.getDate() + (milestone.priority - 1) * 3);
        }
        // 주말 조정
        if (milestone.isWeekend) {
          itemDate = getNextWeekend(itemDate);
        }
      }

      // 결혼식 날짜보다 늦으면 안됨
      if (itemDate > this.weddingDate && !milestone.customDate) {
        itemDate = new Date(this.weddingDate);
        itemDate.setDate(itemDate.getDate() - 7); // 최소 1주일 전
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

  // 타임라인 저장 (알림 스케줄링은 별도로 호출해야 함)
  async save() {
    const data = {
      weddingDate: this.weddingDate.toISOString(),
      startDate: this.startDate.toISOString(),
      timeline: this.timeline
    };
    await AsyncStorage.setItem('wedding-timeline-data', JSON.stringify(data));

    // 알림 스케줄링은 사용자가 "이 일정대로 갈께요" 버튼 클릭 시에만 수행
    // scheduleNotifications()는 TimelineConfirmScreen에서 직접 호출
  }

  // 타임라인 불러오기
  async load() {
    const saved = await AsyncStorage.getItem('wedding-timeline-data');
    if (saved) {
      const data = JSON.parse(saved);
      this.weddingDate = new Date(data.weddingDate);
      this.startDate = new Date(data.startDate);

      // 타임라인을 다시 계산하여 최신 아이콘과 내용을 적용
      this.calculateTimeline();

      // 저장된 날짜 복원
      this.timeline = this.timeline.map(item => {
        const savedItem = data.timeline.find(saved => saved.id === item.id);
        if (savedItem) {
          return {
            ...item,
            date: new Date(savedItem.date)
          };
        }
        return item;
      });

      // 날짜순으로 재정렬
      this.sortTimelineByDate();

      // 완료 상태 복원
      await this.loadCompletionStatus();

      // 앱 로드 시에는 알림을 자동 스케줄링하지 않음
      // 알림은 사용자가 "이 일정대로 갈께요" 버튼을 클릭한 후에만 스케줄링됨

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

  // 날짜 업데이트 및 순서 자동 조정
  async updateItemDate(itemId, newDate) {
    const item = this.timeline.find(i => i.id === itemId);
    if (item) {
      item.date = new Date(newDate);
      // 날짜순으로 재정렬
      this.sortTimelineByDate();
      await this.save();
      return true;
    }
    return false;
  }

  // 타임라인 날짜순 정렬
  sortTimelineByDate() {
    this.timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  // 알림 권한 요청 및 초기화
  async initializeNotifications() {
    const hasPermission = await this.notificationManager.requestPermissions();
    if (hasPermission) {
      await this.scheduleNotifications();
    }
    return hasPermission;
  }

  // 타임라인 알림 스케줄링
  async scheduleNotifications() {
    try {
      const count = await this.notificationManager.scheduleTimelineNotifications(this.timeline);
      console.log(`${count}개의 알림이 스케줄링되었습니다.`);
      return count;
    } catch (error) {
      console.error('알림 스케줄링 오류:', error);
      return 0;
    }
  }

  // 모든 알림 취소
  async cancelAllNotifications() {
    await this.notificationManager.cancelAllNotifications();
  }

  // 특정 항목의 알림 취소
  async cancelItemNotifications(itemId) {
    await this.notificationManager.cancelItemNotifications(itemId);
  }

  // 스케줄링된 알림 조회
  async getScheduledNotifications() {
    return await this.notificationManager.getScheduledNotifications();
  }

  // 테스트 알림 전송
  async sendTestNotification() {
    await this.notificationManager.sendTestNotification();
  }
}
