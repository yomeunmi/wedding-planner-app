// 웨딩 플래너 앱 메인 로직

class WeddingPlannerApp {
    constructor() {
        this.timeline = new WeddingTimeline();
        this.currentScreen = 'date-input-screen';
        this.previousScreen = 'date-input-screen';
        this.currentDetailItem = null;
        this.apiBaseUrl = window.location.hostname === 'localhost'
            ? 'http://localhost:3000'
            : ''; // 프로덕션에서는 API Gateway URL로 변경

        this.init();
    }

    init() {
        this.setupEventListeners();

        // 저장된 데이터가 있으면 타임라인 화면으로 이동
        if (this.timeline.hasSavedData()) {
            this.timeline.load();
            this.showScreen('timeline-screen');
            this.renderTimeline();
        } else {
            this.setMinDates();
        }
    }

    setupEventListeners() {
        // 날짜 입력 폼
        const dateForm = document.getElementById('date-form');
        if (dateForm) {
            dateForm.addEventListener('submit', (e) => this.handleDateSubmit(e));
        }

        // 뒤로가기 버튼들
        const backToInput = document.getElementById('back-to-input');
        if (backToInput) {
            backToInput.addEventListener('click', () => {
                if (confirm('입력한 정보가 초기화됩니다. 처음으로 돌아가시겠습니까?')) {
                    localStorage.clear();
                    this.showScreen('date-input-screen');
                    this.setMinDates();
                }
            });
        }

        const backToTimeline = document.getElementById('back-to-timeline');
        if (backToTimeline) {
            backToTimeline.addEventListener('click', () => {
                this.showScreen('timeline-screen');
                this.renderTimeline();
            });
        }

        // 일정 저장 버튼
        const saveTimeline = document.getElementById('save-timeline');
        if (saveTimeline) {
            saveTimeline.addEventListener('click', () => {
                this.timeline.save();
                this.showToast('일정이 저장되었습니다! 📋');
            });
        }

        // 완료 표시 버튼
        const markCompleted = document.getElementById('mark-completed');
        if (markCompleted) {
            markCompleted.addEventListener('click', () => this.toggleItemCompleted());
        }

        // 더 많은 장소 보기 버튼
        const searchMore = document.getElementById('search-more');
        if (searchMore) {
            searchMore.addEventListener('click', () => this.searchMorePlaces());
        }

        // 마이페이지 버튼
        const mypageBtn = document.getElementById('mypage-btn');
        if (mypageBtn) {
            mypageBtn.addEventListener('click', () => this.showMyPage());
        }

        // 마이페이지 뒤로가기
        const backFromMypage = document.getElementById('back-from-mypage');
        if (backFromMypage) {
            backFromMypage.addEventListener('click', () => {
                this.showScreen(this.previousScreen);
            });
        }

        // 닉네임 수정 버튼
        const editNicknameBtn = document.getElementById('edit-nickname-btn');
        if (editNicknameBtn) {
            editNicknameBtn.addEventListener('click', () => this.toggleNicknameEdit(true));
        }

        // 닉네임 저장 버튼
        const saveNicknameBtn = document.getElementById('save-nickname-btn');
        if (saveNicknameBtn) {
            saveNicknameBtn.addEventListener('click', () => this.saveNickname());
        }

        // 닉네임 취소 버튼
        const cancelNicknameBtn = document.getElementById('cancel-nickname-btn');
        if (cancelNicknameBtn) {
            cancelNicknameBtn.addEventListener('click', () => this.toggleNicknameEdit(false));
        }

        // 닉네임 입력 엔터키
        const nicknameInput = document.getElementById('nickname-input');
        if (nicknameInput) {
            nicknameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.saveNickname();
                }
            });
        }

        // 일정 보러가기 버튼
        const goToTimeline = document.getElementById('go-to-timeline');
        if (goToTimeline) {
            goToTimeline.addEventListener('click', () => {
                if (this.timeline.hasSavedData()) {
                    this.showScreen('timeline-screen');
                    this.renderTimeline();
                } else {
                    this.showToast('먼저 결혼 준비 일정을 만들어주세요!');
                    this.showScreen('date-input-screen');
                }
            });
        }

        // 데이터 초기화 버튼
        const resetData = document.getElementById('reset-data');
        if (resetData) {
            resetData.addEventListener('click', () => {
                if (confirm('모든 데이터가 삭제됩니다. 정말 초기화하시겠습니까?')) {
                    localStorage.clear();
                    this.showToast('데이터가 초기화되었습니다');
                    this.showScreen('date-input-screen');
                    this.setMinDates();
                    location.reload();
                }
            });
        }
    }

    setMinDates() {
        const today = new Date().toISOString().split('T')[0];
        const weddingDateInput = document.getElementById('wedding-date');
        const startDateInput = document.getElementById('start-date');

        if (weddingDateInput) {
            weddingDateInput.min = today;
        }
        if (startDateInput) {
            startDateInput.min = today;
            startDateInput.value = today;
        }

        // 결혼식 날짜 변경 시 준비 시작일 제한
        if (weddingDateInput) {
            weddingDateInput.addEventListener('change', (e) => {
                if (startDateInput) {
                    startDateInput.max = e.target.value;
                }
            });
        }
    }

    handleDateSubmit(e) {
        e.preventDefault();

        const weddingDate = document.getElementById('wedding-date').value;
        const startDate = document.getElementById('start-date').value;

        if (!weddingDate || !startDate) {
            this.showToast('모든 날짜를 입력해주세요');
            return;
        }

        if (new Date(startDate) > new Date(weddingDate)) {
            this.showToast('준비 시작일은 결혼식 날짜보다 이전이어야 합니다');
            return;
        }

        // 타임라인 계산
        this.timeline.setDates(weddingDate, startDate);
        this.timeline.save();

        // 타임라인 화면으로 전환
        this.showScreen('timeline-screen');
        this.renderTimeline();
    }

    showScreen(screenId) {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => screen.classList.remove('active'));

        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');

            // 마이페이지로 이동할 때는 현재 화면을 previousScreen에 저장
            if (screenId === 'mypage-screen') {
                this.previousScreen = this.currentScreen;
            }

            this.currentScreen = screenId;
        }
    }

    renderTimeline() {
        // 날짜 범위 표시
        const dateRangeDisplay = document.getElementById('date-range-display');
        if (dateRangeDisplay) {
            dateRangeDisplay.textContent = `${this.timeline.formatDate(this.timeline.startDate)} ~ ${this.timeline.formatDate(this.timeline.weddingDate)}`;
        }

        // D-Day 표시
        const dDayCount = document.getElementById('d-day-count');
        if (dDayCount) {
            const dDay = this.timeline.getDDay();
            dDayCount.textContent = dDay > 0 ? `D-${dDay}` : dDay === 0 ? 'D-Day!' : `D+${Math.abs(dDay)}`;
        }

        // 준비 기간 표시
        const prepPeriod = document.getElementById('prep-period');
        if (prepPeriod) {
            prepPeriod.textContent = this.timeline.getPrepPeriod();
        }

        // 완료 항목 표시
        this.updateCompletedCount();

        // 타임라인 리스트 렌더링
        const timelineList = document.getElementById('timeline-list');
        if (timelineList) {
            timelineList.innerHTML = '';

            this.timeline.timeline.forEach(item => {
                const itemElement = this.createTimelineItem(item);
                timelineList.appendChild(itemElement);
            });
        }
    }

    createTimelineItem(item) {
        const div = document.createElement('div');
        div.className = `timeline-item ${item.completed ? 'completed' : ''}`;

        // 날짜를 ISO 형식으로 변환 (YYYY-MM-DD)
        const dateISO = item.date.toISOString().split('T')[0];

        div.innerHTML = `
            <div class="timeline-icon">${item.icon}</div>
            <div class="timeline-content">
                <div class="timeline-title">
                    ${item.title}
                    ${item.completed ? '<span style="margin-left: 10px; color: var(--dark-pink);">✓ 완료</span>' : ''}
                </div>
                <div class="timeline-date-wrapper">
                    <div class="timeline-date-display">
                        <span class="timeline-date">${this.timeline.formatDate(item.date)}</span>
                        <button class="btn-edit-date" data-item-id="${item.id}">✏️ 수정</button>
                    </div>
                    <div class="timeline-date-edit" data-item-id="${item.id}">
                        <input type="date" class="date-edit-input" value="${dateISO}" data-item-id="${item.id}">
                        <button class="btn-save-date" data-item-id="${item.id}">저장</button>
                        <button class="btn-cancel-date" data-item-id="${item.id}">취소</button>
                    </div>
                </div>
                <div class="timeline-desc">${item.description}</div>
            </div>
            <div class="timeline-status" onclick="event.stopPropagation();">
                <span style="font-size: 1.5em;">${item.completed ? '✓' : '→'}</span>
            </div>
        `;

        // 날짜 편집 버튼 이벤트
        const editBtn = div.querySelector('.btn-edit-date');
        if (editBtn) {
            editBtn.onclick = (e) => {
                e.stopPropagation();
                this.toggleDateEdit(item.id, true);
            };
        }

        // 날짜 저장 버튼 이벤트
        const saveBtn = div.querySelector('.btn-save-date');
        if (saveBtn) {
            saveBtn.onclick = (e) => {
                e.stopPropagation();
                this.saveDateEdit(item.id);
            };
        }

        // 날짜 취소 버튼 이벤트
        const cancelBtn = div.querySelector('.btn-cancel-date');
        if (cancelBtn) {
            cancelBtn.onclick = (e) => {
                e.stopPropagation();
                this.toggleDateEdit(item.id, false);
            };
        }

        // 타임라인 아이템 클릭 이벤트 (상세보기)
        div.addEventListener('click', (e) => {
            // 버튼이나 입력창 클릭이 아닐 때만 상세보기
            if (!e.target.classList.contains('btn-edit-date') &&
                !e.target.classList.contains('btn-save-date') &&
                !e.target.classList.contains('btn-cancel-date') &&
                !e.target.classList.contains('date-edit-input')) {
                this.showItemDetail(item.id);
            }
        });

        return div;
    }

    showItemDetail(itemId) {
        const item = this.timeline.getItemById(itemId);
        if (!item) return;

        this.currentDetailItem = item;

        // 제목 설정
        const detailTitle = document.getElementById('detail-title');
        if (detailTitle) {
            detailTitle.textContent = `${item.icon} ${item.title}`;
        }

        // 날짜 설정
        const detailDate = document.getElementById('detail-date');
        if (detailDate) {
            detailDate.textContent = `권장 일정: ${this.timeline.formatDate(item.date)}`;
        }

        // 설명 설정
        const detailDescription = document.getElementById('detail-description');
        if (detailDescription) {
            detailDescription.textContent = item.description;
        }

        // 팁 렌더링
        const detailTips = document.getElementById('detail-tips');
        if (detailTips) {
            detailTips.innerHTML = '';
            item.tips.forEach(tip => {
                const li = document.createElement('li');
                li.textContent = tip;
                detailTips.appendChild(li);
            });
        }

        // 완료 버튼 상태 업데이트
        const markCompleted = document.getElementById('mark-completed');
        if (markCompleted) {
            markCompleted.textContent = item.completed ? '완료 취소' : '완료 표시';
        }

        // 장소 로딩
        this.loadPlaces(item.category);

        // 상세 화면으로 전환
        this.showScreen('detail-screen');
    }

    async loadPlaces(category) {
        const detailPlaces = document.getElementById('detail-places');
        if (!detailPlaces) return;

        // 로딩 표시
        detailPlaces.innerHTML = '<div class="loading"></div>';

        try {
            // API 호출
            const endpoint = `${this.apiBaseUrl}/api/${category}`;
            const response = await fetch(endpoint);

            if (!response.ok) {
                throw new Error('데이터를 불러올 수 없습니다');
            }

            const data = await response.json();

            // 장소 카드 렌더링
            detailPlaces.innerHTML = '';

            if (data.items && data.items.length > 0) {
                data.items.slice(0, 6).forEach(place => {
                    const placeCard = this.createPlaceCard(place);
                    detailPlaces.appendChild(placeCard);
                });
            } else {
                detailPlaces.innerHTML = '<p style="text-align: center; color: var(--text-gray);">추천 장소를 준비 중입니다.</p>';
            }
        } catch (error) {
            console.error('Error loading places:', error);

            // 에러 시 샘플 데이터 표시
            detailPlaces.innerHTML = '';
            const samplePlaces = this.getSamplePlaces(category);
            samplePlaces.forEach(place => {
                const placeCard = this.createPlaceCard(place);
                detailPlaces.appendChild(placeCard);
            });
        }
    }

    createPlaceCard(place) {
        const div = document.createElement('div');
        div.className = 'place-card';

        const name = place.name || place.place_name || '장소명';
        const address = place.address || place.address_name || place.road_address_name || '주소 정보 없음';
        const phone = place.phone || place.phone_number || '전화번호 정보 없음';

        div.innerHTML = `
            <div class="place-name">${name}</div>
            <div class="place-address">📍 ${address}</div>
            <div class="place-phone">📞 ${phone}</div>
        `;

        return div;
    }

    getSamplePlaces(category) {
        const samples = {
            'wedding-halls': [
                { name: '그랜드 웨딩홀', address: '서울시 강남구 테헤란로 123', phone: '02-1234-5678' },
                { name: '로맨틱 가든', address: '서울시 서초구 서초대로 456', phone: '02-2345-6789' },
                { name: '엘레강스 홀', address: '서울시 송파구 올림픽로 789', phone: '02-3456-7890' }
            ],
            'studios': [
                { name: '로맨틱 스튜디오', address: '서울시 강남구 논현로 234', phone: '02-4567-8901' },
                { name: '드림 포토', address: '서울시 강남구 강남대로 567', phone: '02-5678-9012' },
                { name: '퓨어 스튜디오', address: '서울시 서초구 반포대로 890', phone: '02-6789-0123' }
            ],
            'dress': [
                { name: '웨딩드레스 부티크', address: '서울시 강남구 선릉로 345', phone: '02-7890-1234' },
                { name: '로즈 드레스', address: '서울시 강남구 역삼로 678', phone: '02-8901-2345' },
                { name: '엘레강스 드레스', address: '서울시 서초구 서초중앙로 901', phone: '02-9012-3456' }
            ],
            'makeup': [
                { name: '뷰티살롱 로즈', address: '서울시 강남구 테헤란로 456', phone: '02-1111-2222' },
                { name: '메이크업 스튜디오', address: '서울시 강남구 강남대로 789', phone: '02-2222-3333' },
                { name: '브라이덜 뷰티', address: '서울시 서초구 서초대로 012', phone: '02-3333-4444' }
            ]
        };

        return samples[category] || [];
    }

    toggleItemCompleted() {
        if (!this.currentDetailItem) return;

        const completed = this.timeline.toggleCompleted(this.currentDetailItem.id);

        // 버튼 텍스트 업데이트
        const markCompleted = document.getElementById('mark-completed');
        if (markCompleted) {
            markCompleted.textContent = completed ? '완료 취소' : '완료 표시';
        }

        // 완료 상태에 따라 메시지 표시
        if (completed) {
            this.showToast(`${this.currentDetailItem.title} 완료! 🎉`);
        } else {
            this.showToast(`${this.currentDetailItem.title} 완료 취소`);
        }

        // 완료 카운트 업데이트
        this.updateCompletedCount();
    }

    updateCompletedCount() {
        const completedCount = document.getElementById('completed-count');
        if (completedCount) {
            const completed = this.timeline.getCompletedCount();
            const total = this.timeline.timeline.length;
            completedCount.textContent = `${completed}/${total}`;
        }
    }

    searchMorePlaces() {
        if (!this.currentDetailItem) return;

        // 실제로는 더 많은 장소를 보여주는 페이지로 이동
        // 여기서는 간단히 토스트 메시지만 표시
        this.showToast('더 많은 장소를 검색 중입니다... 🔍');

        // API 재호출
        this.loadPlaces(this.currentDetailItem.category);
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.textContent = message;
            toast.classList.add('show');

            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    // 날짜 편집 관련 메서드들

    toggleDateEdit(itemId, show) {
        const displayElement = document.querySelector(`.timeline-date-display`);
        const editElements = document.querySelectorAll(`.timeline-date-edit`);

        editElements.forEach(el => {
            const elItemId = el.getAttribute('data-item-id');
            if (elItemId === itemId) {
                el.style.display = show ? 'flex' : 'none';
                const displaySibling = el.previousElementSibling;
                if (displaySibling) {
                    displaySibling.style.display = show ? 'none' : 'flex';
                }
            }
        });
    }

    saveDateEdit(itemId) {
        const input = document.querySelector(`.date-edit-input[data-item-id="${itemId}"]`);
        if (!input) return;

        const newDate = input.value;
        if (!newDate) {
            this.showToast('날짜를 선택해주세요');
            return;
        }

        // 타임라인에서 해당 항목 찾기
        const item = this.timeline.getItemById(itemId);
        if (!item) return;

        // 날짜 업데이트
        item.date = new Date(newDate);

        // 저장
        this.timeline.save();

        // UI 업데이트
        this.renderTimeline();

        this.showToast(`${item.title} 일정이 ${this.timeline.formatDate(item.date)}로 변경되었습니다! 📅`);
    }

    // 마이페이지 관련 메서드들

    showMyPage() {
        this.renderMyPage();
        this.showScreen('mypage-screen');
    }

    renderMyPage() {
        // 닉네임 로드
        this.loadNickname();

        // 웨딩 정보 렌더링
        if (this.timeline.hasSavedData()) {
            this.timeline.load();
            this.renderWeddingInfo();
            this.renderMypageChecklist();
        } else {
            this.showNoTimeline();
        }
    }

    loadNickname() {
        const nickname = localStorage.getItem('wedding-nickname') || '';
        const nicknameDisplay = document.getElementById('current-nickname');

        if (nicknameDisplay) {
            if (nickname) {
                nicknameDisplay.textContent = nickname;
            } else {
                nicknameDisplay.textContent = '닉네임을 설정해주세요';
            }
        }
    }

    toggleNicknameEdit(show) {
        const nicknameDisplay = document.getElementById('nickname-display');
        const nicknameEdit = document.getElementById('nickname-edit');
        const nicknameInput = document.getElementById('nickname-input');

        if (show) {
            if (nicknameDisplay) nicknameDisplay.style.display = 'none';
            if (nicknameEdit) nicknameEdit.style.display = 'flex';

            // 현재 닉네임을 입력창에 설정
            const currentNickname = localStorage.getItem('wedding-nickname') || '';
            if (nicknameInput) {
                nicknameInput.value = currentNickname;
                nicknameInput.focus();
            }
        } else {
            if (nicknameDisplay) nicknameDisplay.style.display = 'flex';
            if (nicknameEdit) nicknameEdit.style.display = 'none';
        }
    }

    saveNickname() {
        const nicknameInput = document.getElementById('nickname-input');
        if (!nicknameInput) return;

        const nickname = nicknameInput.value.trim();

        if (!nickname) {
            this.showToast('닉네임을 입력해주세요');
            return;
        }

        if (nickname.length > 20) {
            this.showToast('닉네임은 20자 이하로 입력해주세요');
            return;
        }

        // 닉네임 저장
        localStorage.setItem('wedding-nickname', nickname);

        // 화면 업데이트
        this.loadNickname();
        this.toggleNicknameEdit(false);

        this.showToast('닉네임이 저장되었습니다! 👤');
    }

    showNoTimeline() {
        const noTimelineMessage = document.getElementById('no-timeline-message');
        const timelineInfo = document.getElementById('timeline-info');
        const mypageChecklist = document.getElementById('mypage-checklist');

        if (noTimelineMessage) noTimelineMessage.style.display = 'block';
        if (timelineInfo) timelineInfo.style.display = 'none';
        if (mypageChecklist) mypageChecklist.innerHTML = '<p style="text-align: center; color: var(--text-gray);">저장된 일정이 없습니다.</p>';
    }

    renderWeddingInfo() {
        const noTimelineMessage = document.getElementById('no-timeline-message');
        const timelineInfo = document.getElementById('timeline-info');

        if (noTimelineMessage) noTimelineMessage.style.display = 'none';
        if (timelineInfo) timelineInfo.style.display = 'block';

        // 결혼식 날짜
        const mypageWeddingDate = document.getElementById('mypage-wedding-date');
        if (mypageWeddingDate) {
            mypageWeddingDate.textContent = this.timeline.formatDate(this.timeline.weddingDate);
        }

        // 준비 시작일
        const mypageStartDate = document.getElementById('mypage-start-date');
        if (mypageStartDate) {
            mypageStartDate.textContent = this.timeline.formatDate(this.timeline.startDate);
        }

        // D-Day
        const mypageDday = document.getElementById('mypage-dday');
        if (mypageDday) {
            const dDay = this.timeline.getDDay();
            mypageDday.textContent = dDay > 0 ? `D-${dDay}` : dDay === 0 ? 'D-Day!' : `D+${Math.abs(dDay)}`;
        }

        // 진행률
        const mypageProgress = document.getElementById('mypage-progress');
        if (mypageProgress) {
            const completed = this.timeline.getCompletedCount();
            const total = this.timeline.timeline.length;
            const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
            mypageProgress.textContent = `${percentage}% (${completed}/${total})`;
        }
    }

    renderMypageChecklist() {
        const mypageChecklist = document.getElementById('mypage-checklist');
        if (!mypageChecklist) return;

        mypageChecklist.innerHTML = '';

        if (!this.timeline.timeline || this.timeline.timeline.length === 0) {
            mypageChecklist.innerHTML = '<p style="text-align: center; color: var(--text-gray);">저장된 일정이 없습니다.</p>';
            return;
        }

        this.timeline.timeline.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = `mypage-checklist-item ${item.completed ? 'completed' : ''}`;

            itemDiv.innerHTML = `
                <div class="checklist-item-info">
                    <div class="checklist-item-title">
                        ${item.icon} ${item.title}
                        ${item.completed ? '<span style="margin-left: 8px; color: var(--dark-pink); font-size: 0.9em;">✓ 완료</span>' : ''}
                    </div>
                    <div class="checklist-item-date">${this.timeline.formatDate(item.date)}</div>
                </div>
                <div class="checklist-item-status" style="font-size: 1.8em; color: ${item.completed ? 'var(--dark-pink)' : 'var(--text-light)'};">
                    ${item.completed ? '✓' : '◯'}
                </div>
            `;

            mypageChecklist.appendChild(itemDiv);
        });
    }
}

// DOM 로드 완료 후 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    new WeddingPlannerApp();
});
