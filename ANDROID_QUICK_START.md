# 🤖 Android 앱 빌드 빠른 시작 가이드

Apple Developer 승인을 기다리는 동안 Android 앱을 먼저 빌드해봅시다!

## ⚡ 빠른 시작 (3단계)

### 1️⃣ Expo 계정 생성 및 로그인

**Expo 계정이 없다면:**
```bash
eas register
```
- 이메일 입력
- 비밀번호 설정
- 이메일 인증

**이미 있다면:**
```bash
eas login
```

### 2️⃣ 프로젝트 이동
```bash
cd wedding-planner-rn
```

### 3️⃣ Android 빌드 시작!
```bash
eas build --platform android --profile production
```

## 📱 빌드 진행 과정

### 빌드 시작 시 질문들

#### Q: "Would you like to automatically create an EAS project for @username/wedding-planner?"
**A**: `y` (Yes) 입력

#### Q: "Generate a new Android Keystore?"
**A**: `y` (Yes) 입력
- Keystore는 앱 서명용 인증서
- EAS가 안전하게 보관
- 첫 빌드에만 필요

### 빌드 진행
```
✔ Build credentials
✔ Project archived
✔ Uploading to EAS Build
✔ Queued
✔ Building...
```

**예상 소요 시간**: 5-15분

### 빌드 완료
```
✔ Build finished
```

빌드 URL과 APK 다운로드 링크를 받게 됩니다!

## 📥 빌드 결과물

### APK 다운로드
- 빌드 완료 후 터미널에 다운로드 링크 표시
- 또는 https://expo.dev/accounts/[your-username]/projects/wedding-planner/builds 에서 확인

### APK 테스트
```bash
# 다운로드 받은 APK를 Android 기기에 직접 설치
adb install wedding-planner.apk
```

또는:
- APK 파일을 이메일로 보내기
- Android 기기에서 다운로드
- "알 수 없는 출처" 허용 후 설치

## 🏪 Google Play Store 출시 준비

### 1단계: Google Play Console 가입

```
https://play.google.com/console
```

1. **Google 계정으로 로그인**
2. **"계정 만들기"** 클릭
3. **개발자 계정 유형 선택**
   - 개인 또는 조직
   - 개인 추천
4. **기본 정보 입력**
   - 개발자 이름
   - 이메일
   - 국가: 대한민국
5. **결제**
   - $25 USD (약 33,000원) - 일회성!
   - 신용카드/체크카드
6. **승인**
   - 즉시 또는 몇 분 내 승인

### 2단계: 앱 등록

#### Play Console에서:
1. **"앱 만들기"** 클릭
2. **앱 세부정보**
   - 앱 이름: 웨딩플래너
   - 기본 언어: 한국어(대한민국)
   - 앱 또는 게임: 앱
   - 무료 또는 유료: 무료
3. **선언**
   - 개인정보처리방침 준수 체크
   - 콘텐츠 가이드라인 준수 체크
4. **"앱 만들기"** 클릭

### 3단계: 필수 정보 작성

#### 앱 콘텐츠
1. **앱 액세스 권한**
   - "모든 기능 제한 없이 사용 가능" 선택

2. **광고**
   - "아니요, 앱에 광고가 없습니다" 선택

3. **콘텐츠 등급**
   - 설문조사 작성
   - 대부분 "아니요" 선택 (결혼 관련 앱)

4. **타겟층 및 콘텐츠**
   - 연령층: 18세 이상
   - 아동 대상: 아니요

5. **개인정보처리방침**
   - URL 입력 (필수!)
   - 예: https://yourname.github.io/privacy-policy

#### 스토어 설정 - 메인 스토어 등록정보

**앱 이름**
```
웨딩플래너
```

**짧은 설명** (80자 이내)
```
결혼 준비를 체계적으로! 자동 일정 생성과 체크리스트로 스트레스 없이 준비하세요.
```

**전체 설명** (4000자 이내)
```
🎉 웨딩플래너 - 결혼 준비를 체계적으로!

결혼식 날짜와 준비 시작일을 입력하면 자동으로 맞춤형 준비 일정을 생성해드립니다.

주요 기능:
✓ 자동 일정 생성 - D-Day에 맞춰 최적의 일정 제공
✓ 체크리스트 관리 - 놓치기 쉬운 준비사항 체크
✓ 준비 팁 제공 - 각 단계별 유용한 팁
✓ D-Day 카운터 - 남은 날짜를 한눈에
✓ 웨딩홀/드레스샵 투어 관리
✓ 사진 스크랩 기능
✓ 오프라인에서도 사용 가능

결혼 준비, 이제 스트레스 없이 체계적으로 관리하세요!

【 주요 기능 】
📅 맞춤형 일정 생성
결혼식까지 남은 기간에 따라 최적의 준비 일정을 자동으로 생성합니다.

✅ 체크리스트
각 준비 단계별 해야 할 일들을 체크리스트로 관리하세요.

🏛️ 웨딩홀 투어 관리
- 투어 일정 기록
- 사진 스크랩
- 상세 정보 메모

👗 드레스샵 투어 관리
- 드레스 사진 저장
- 가격 비교
- 선택 관리

📸 스크랩 기능
마음에 드는 웨딩홀, 드레스 사진을 저장하고 관리하세요.

💝 오프라인 지원
인터넷 연결 없이도 모든 기능 사용 가능!

【 이런 분들께 추천 】
• 결혼 준비를 처음 시작하시는 분
• 체계적인 일정 관리가 필요하신 분
• 놓치는 준비사항 없이 완벽하게 준비하고 싶으신 분
• 웨딩홀/드레스샵 비교가 필요하신 분

결혼 준비, 웨딩플래너와 함께 시작하세요! 🎊
```

**앱 아이콘**
- 512 x 512 PNG
- 현재 있는 icon.png를 512x512로 리사이즈
- https://www.iloveimg.com/resize-image 에서 변환 가능

**스크린샷** (최소 2장, 권장 4-8장)
- 16:9 비율
- 최소: 320 x 569 pixels
- 최대: 3840 x 2160 pixels
- 권장: 1080 x 1920 pixels (세로)

필요한 화면:
1. 날짜 입력 화면
2. 타임라인 화면
3. 상세 정보 화면
4. 마이페이지

**Feature Graphic** (필수)
- 1024 x 500 pixels
- 스토어 상단에 표시되는 배너 이미지
- 온라인 도구로 간단히 제작 가능:
  - Canva: https://www.canva.com
  - 또는 단순히 앱 아이콘 + 텍스트

### 4단계: AAB 빌드 및 업로드

#### AAB (Android App Bundle) 빌드

**eas.json 수정:**
```bash
cd wedding-planner-rn
```

wedding-planner-rn/eas.json 파일에서:
```json
"production": {
  "android": {
    "buildType": "aab"  // "apk"를 "aab"로 변경
  }
}
```

**AAB 빌드:**
```bash
eas build --platform android --profile production
```

#### Play Console에 업로드

**방법 1: 수동 업로드**
1. Play Console → 프로덕션 → 새 출시 만들기
2. AAB 파일 업로드 (드래그 앤 드롭)
3. 출시 노트 작성
4. 저장

**방법 2: EAS Submit (자동)**
```bash
eas submit --platform android
```

### 5단계: 심사 제출

1. **모든 필수 항목 완료** (✓ 표시 확인)
2. **국가/지역 선택** (대한민국 또는 전체)
3. **출시 검토** 클릭
4. **프로덕션으로 출시 시작** 클릭

## ⏱️ 예상 타임라인

| 단계 | 소요 시간 |
|------|----------|
| Expo 계정 생성 | 5분 |
| Android 빌드 (APK) | 5-15분 |
| Google Play Console 가입 | 10분 |
| 앱 정보 작성 | 1-2시간 |
| AAB 빌드 | 5-15분 |
| 업로드 및 제출 | 30분 |
| **심사 대기** | **1-7일** |

## 🎨 스크린샷 촬영 방법

### Android 에뮬레이터 사용

```bash
cd wedding-planner-rn
npm start
# 'a'를 눌러 Android 에뮬레이터 실행
```

**촬영:**
- 에뮬레이터에서 원하는 화면 이동
- Cmd + S (Mac) 또는 Ctrl + S (Windows)

**리사이즈:**
- https://www.iloveimg.com/resize-image
- 1080 x 1920 pixels로 조정

## 💡 팁

### 빠른 승인을 위해:
1. ✅ 정확한 앱 설명 작성
2. ✅ 고품질 스크린샷 (최소 4장)
3. ✅ 개인정보처리방침 URL 제공
4. ✅ 콘텐츠 등급 정확히 설정

### 첫 출시 시:
- 내부 테스트 트랙 사용 권장
- 소수 사용자로 테스트 후 프로덕션 출시

## 📋 체크리스트

빌드 전:
- [ ] Expo 계정 생성/로그인
- [ ] wedding-planner-rn 폴더로 이동

빌드:
- [ ] `eas build --platform android` 실행
- [ ] APK 다운로드 및 테스트

Play Store 준비:
- [ ] Google Play Console 가입 ($25)
- [ ] 앱 등록
- [ ] 앱 설명 작성
- [ ] 스크린샷 준비 (최소 2장)
- [ ] 앱 아이콘 512x512 준비
- [ ] Feature Graphic 1024x500 준비
- [ ] 개인정보처리방침 URL 준비

AAB 빌드 및 제출:
- [ ] eas.json에서 buildType을 "aab"로 변경
- [ ] AAB 빌드 실행
- [ ] Play Console에 업로드
- [ ] 심사 제출

## ❓ 자주 묻는 질문

### Q: APK와 AAB의 차이는?
**A**:
- APK: 직접 설치 가능, 테스트용
- AAB: Play Store 전용, 최적화됨, 출시 권장

### Q: 빌드가 실패하면?
**A**:
```bash
# 캐시 삭제 후 재시도
eas build --platform android --clear-cache
```

### Q: 첫 심사는 얼마나 걸리나요?
**A**: 보통 3-7일, 업데이트는 1-2일

## 🎯 지금 바로 시작!

```bash
# 1. Expo 로그인
eas login

# 2. 프로젝트 이동
cd wedding-planner-rn

# 3. Android 빌드!
eas build --platform android --profile production
```

화이팅! 🚀
