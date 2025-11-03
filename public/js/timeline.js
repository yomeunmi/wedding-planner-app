// 웨딩 준비 타임라인 계산 및 관리

class WeddingTimeline {
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

        // 각 항목별 권장 시기 (결혼식 기준 역순으로 계산)
        const milestones = [
            {
                id: 'wedding-hall',
                title: '웨딩홀 계약',
                icon: '🏛️',
                description: '예식장을 방문하고 견적을 비교한 후 계약합니다. 인기 있는 날짜는 빨리 예약되므로 여유있게 준비하세요.',
                daysBeforeWedding: Math.min(totalDays - 30, 180), // 6개월 전 또는 준비 시작 후 1개월
                category: 'wedding-halls',
                tips: [
                    '최소 3~4곳의 웨딩홀을 방문하여 비교해보세요',
                    '주말과 주중 가격 차이를 확인하세요',
                    '식사 메뉴와 품질을 꼭 시식해보세요',
                    '계약서의 취소 및 환불 조항을 꼼꼼히 확인하세요',
                    '하객 규모를 미리 예상하여 홀 크기를 선택하세요'
                ]
            },
            {
                id: 'studio',
                title: '스튜디오 촬영',
                icon: '📸',
                description: '웨딩 스튜디오에서 본식 전 촬영을 진행합니다. 계절과 날씨를 고려하여 야외 촬영 장소를 선택하세요.',
                daysBeforeWedding: Math.min(totalDays - 60, 120), // 4개월 전 또는 준비 시작 후 2개월
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
                id: 'dress',
                title: '드레스 투어',
                icon: '👗',
                description: '웨딩드레스와 턱시도를 선택합니다. 여러 곳을 방문하여 다양한 스타일을 착용해보세요.',
                daysBeforeWedding: Math.min(totalDays - 90, 90), // 3개월 전 또는 준비 시작 후 3개월
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
                id: 'makeup',
                title: '메이크업 예약',
                icon: '💄',
                description: '본식 당일 메이크업과 헤어를 담당할 샵을 예약합니다. 리허설을 통해 원하는 스타일을 미리 확인하세요.',
                daysBeforeWedding: Math.min(totalDays - 120, 60), // 2개월 전 또는 준비 시작 후 4개월
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
            const itemDate = new Date(this.weddingDate);
            itemDate.setDate(itemDate.getDate() - milestone.daysBeforeWedding);

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

        // 로컬 스토리지에서 완료 상태 복원
        this.loadCompletionStatus();
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
    toggleCompleted(itemId) {
        const item = this.timeline.find(i => i.id === itemId);
        if (item) {
            item.completed = !item.completed;
            this.saveCompletionStatus();
            return item.completed;
        }
        return false;
    }

    // 완료 상태 저장
    saveCompletionStatus() {
        const completionStatus = {};
        this.timeline.forEach(item => {
            completionStatus[item.id] = item.completed;
        });
        localStorage.setItem('wedding-timeline-completion', JSON.stringify(completionStatus));
    }

    // 완료 상태 불러오기
    loadCompletionStatus() {
        const saved = localStorage.getItem('wedding-timeline-completion');
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
    save() {
        const data = {
            weddingDate: this.weddingDate.toISOString(),
            startDate: this.startDate.toISOString(),
            timeline: this.timeline
        };
        localStorage.setItem('wedding-timeline-data', JSON.stringify(data));
    }

    // 타임라인 불러오기
    load() {
        const saved = localStorage.getItem('wedding-timeline-data');
        if (saved) {
            const data = JSON.parse(saved);
            this.weddingDate = new Date(data.weddingDate);
            this.startDate = new Date(data.startDate);
            this.timeline = data.timeline.map(item => ({
                ...item,
                date: new Date(item.date)
            }));
            return true;
        }
        return false;
    }

    // 저장된 데이터가 있는지 확인
    hasSavedData() {
        return localStorage.getItem('wedding-timeline-data') !== null;
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
}

// 전역으로 사용할 수 있도록 내보내기
window.WeddingTimeline = WeddingTimeline;
