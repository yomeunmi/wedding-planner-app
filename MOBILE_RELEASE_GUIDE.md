# 📱 모바일 앱 출시 가이드 (iOS & Android)

현재 main 브랜치 버전으로 iOS와 Android 앱을 출시하는 단계별 가이드입니다.

## 📊 현재 상태
- ✅ Expo SDK 54.0.0
- ✅ React Native 0.81.5
- ✅ 앱 아이콘 준비 완료
- ✅ app.json 설정 완료
- ✅ eas.json 생성 완료

## 🚀 빠른 시작 (5단계)

### 1️⃣ EAS CLI 설치
```bash
npm install -g eas-cli
```

### 2️⃣ Expo 로그인
```bash
eas login
```
- Expo 계정이 없으면: `eas register`로 회원가입

### 3️⃣ 프로젝트 설정
```bash
cd wedding-planner-rn
eas build:configure
```

### 4️⃣ 빌드 실행

**iOS 빌드:**
```bash
eas build --platform ios --profile production
```

**Android 빌드:**
```bash
eas build --platform android --profile production
```

**동시에 빌드:**
```bash
eas build --platform all --profile production
```

### 5️⃣ 스토어 제출
```bash
# iOS
eas submit --platform ios

# Android
eas submit --platform android
```

---

## 📱 iOS 출시 상세 가이드

### 사전 준비

1. **Apple Developer Program 가입** ($99/년)
   - https://developer.apple.com/programs/
   - 개인(Individual) 또는 회사(Organization) 선택
   - 승인까지 1-2일 소요

2. **Bundle Identifier 확인**
   - 현재: `com.yomeunmi.weddingplanner`
   - 변경이 필요하면 `app.json`에서 수정

### 빌드 단계

```bash
cd wedding-planner-rn

# 1. iOS 프로덕션 빌드
eas build --platform ios --profile production

# 질문이 나오면:
# - Generate a new Apple Distribution Certificate? → Yes
# - Generate a new Apple Provisioning Profile? → Yes
```

**예상 소요 시간:** 10-20분

### App Store Connect 설정

1. **App Store Connect 접속**
   - https://appstoreconnect.apple.com

2. **새 앱 생성**
   - "My Apps" → "+" → "New App"
   - 이름: 웨딩플래너
   - Bundle ID: com.yomeunmi.weddingplanner
   - SKU: wedding-planner-001

3. **앱 정보 작성**
   - 설명, 키워드, 스크린샷 추가
   - 개인정보처리방침 URL (필수)
   - 지원 URL

4. **스크린샷 준비** (필수)
   - 6.5" Display (iPhone 14 Pro Max): 1290 x 2796 pixels
   - 최소 3장, 최대 10장

   **촬영 방법:**
   ```bash
   npm start
   # 'i'를 눌러 iOS 시뮬레이터 실행
   # iPhone 14 Pro Max 선택
   # Cmd + S로 스크린샷 저장
   ```

### 제출

**방법 1: EAS Submit (자동)**
```bash
eas submit --platform ios
```

**방법 2: 수동 업로드**
- Xcode의 Transporter 앱 사용
- .ipa 파일 드래그 앤 드롭

---

## 🤖 Android 출시 상세 가이드

### 사전 준비

1. **Google Play Console 계정** ($25 일회성)
   - https://play.google.com/console
   - 신용카드로 결제
   - 승인 즉시

2. **패키지명 확인**
   - 현재: `com.yomeunmi.weddingplanner`
   - 변경이 필요하면 `app.json`에서 수정

### 빌드 단계

```bash
cd wedding-planner-rn

# 1. Android 프로덕션 빌드 (APK)
eas build --platform android --profile production

# 또는 AAB 형식 (Play Store 권장):
# eas.json에서 buildType을 "aab"로 변경 후
eas build --platform android --profile production
```

**예상 소요 시간:** 5-15분

### Play Store Console 설정

1. **Play Console 접속**
   - https://play.google.com/console

2. **새 앱 만들기**
   - "앱 만들기" 클릭
   - 이름: 웨딩플래너
   - 언어: 한국어
   - 유형: 앱

3. **앱 정보 작성**
   - 짧은 설명 (80자)
   - 자세한 설명 (4000자)
   - 앱 아이콘: 512x512 PNG
   - 스크린샷: 최소 2장

4. **콘텐츠 등급**
   - 설문조사 작성
   - 결혼 관련 앱이므로 대부분 "아니오"

5. **개인정보처리방침**
   - URL 입력 (필수)

### 제출

**방법 1: EAS Submit (자동)**
```bash
# 먼저 서비스 계정 키 생성 필요
eas submit --platform android
```

**방법 2: 수동 업로드**
- Play Console → 프로덕션 → 새 출시 만들기
- APK/AAB 파일 업로드

---

## 🔧 필수 설정 체크리스트

### app.json 확인
```json
{
  "expo": {
    "name": "웨딩플래너",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yomeunmi.weddingplanner",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.yomeunmi.weddingplanner",
      "versionCode": 1
    }
  }
}
```

### 버전 관리
- `version`: 사용자에게 보이는 버전 (1.0.0, 1.0.1 등)
- `buildNumber` (iOS): 내부 빌드 번호
- `versionCode` (Android): 내부 버전 코드 (정수)

---

## 📄 필수 문서

### 1. 개인정보처리방침
```markdown
# 개인정보처리방침

웨딩플래너 앱은 사용자의 개인정보를 수집하지 않습니다.

## 수집하는 정보
없음. 모든 데이터는 사용자의 기기에 로컬로 저장됩니다.

## 데이터 저장
- 앱 데이터는 사용자의 기기에만 저장됩니다.
- 서버로 전송되지 않습니다.

## 연락처
문의사항: your-email@example.com

최종 업데이트: 2025년 11월
```

**호스팅 방법:**
- GitHub Pages
- Notion (공개 페이지)
- 개인 블로그

### 2. 앱 설명 템플릿

**짧은 설명 (80자):**
```
결혼 준비를 체계적으로! 자동 일정 생성과 체크리스트로 스트레스 없이 준비하세요.
```

**자세한 설명:**
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
```

---

## 🎨 스크린샷 가이드

### 필요한 스크린샷
1. 메인 화면 (날짜 입력)
2. 타임라인 화면
3. 상세 정보 화면
4. 마이페이지
5. 체크리스트 화면

### iOS 스크린샷 크기
- 6.5" Display: 1290 x 2796 pixels
- 5.5" Display: 1242 x 2208 pixels (선택)

### Android 스크린샷 크기
- 16:9 비율
- 최소: 320 x 569 pixels
- 최대: 3840 x 2160 pixels

---

## 🔄 업데이트 배포

### 버전 업데이트
```json
// app.json
{
  "expo": {
    "version": "1.0.1",  // 증가
    "ios": {
      "buildNumber": "2"  // 증가
    },
    "android": {
      "versionCode": 2  // 증가
    }
  }
}
```

### 빌드 및 제출
```bash
# 다시 빌드
eas build --platform all --profile production

# 자동 제출
eas build --platform all --profile production --auto-submit
```

---

## 💰 예상 비용

| 항목 | 비용 | 주기 |
|------|------|------|
| Apple Developer Program | $99 | 연간 |
| Google Play Console | $25 | 일회성 |
| EAS Build (무료 플랜) | $0 | - |
| **총** | **$124** | 첫 해 |

**참고:** EAS Build 무료 플랜은 월 30회 빌드 제공

---

## ⏱️ 예상 일정

| 단계 | 소요 시간 |
|------|----------|
| Apple Developer Program 승인 | 1-2일 |
| Google Play Console 승인 | 즉시 |
| 앱 설정 및 문서 준비 | 2-4시간 |
| 첫 빌드 (iOS + Android) | 1-2일 |
| App Store 심사 | 1-3일 |
| Play Store 심사 | 1-7일 |
| **총** | **약 1-2주** |

---

## 🐛 문제 해결

### 빌드 실패
```bash
# 의존성 문제
cd wedding-planner-rn
rm -rf node_modules
npm install

# 캐시 문제
eas build --platform ios --clear-cache
```

### 인증서 문제
```bash
# 인증서 재생성
eas credentials
```

### 버전 충돌
- buildNumber (iOS)와 versionCode (Android)를 증가시키세요.

---

## 📚 유용한 리소스

- **Expo 문서**: https://docs.expo.dev
- **EAS Build**: https://docs.expo.dev/build/introduction/
- **EAS Submit**: https://docs.expo.dev/submit/introduction/
- **Apple Developer**: https://developer.apple.com
- **App Store Connect**: https://appstoreconnect.apple.com
- **Google Play Console**: https://play.google.com/console

---

## 🎯 다음 단계

1. [ ] EAS CLI 설치
2. [ ] Expo 계정 생성/로그인
3. [ ] Apple Developer Program 가입 (iOS)
4. [ ] Google Play Console 가입 (Android)
5. [ ] 개인정보처리방침 페이지 생성
6. [ ] 스크린샷 준비
7. [ ] iOS 빌드
8. [ ] Android 빌드
9. [ ] App Store 제출
10. [ ] Play Store 제출

---

## 💬 도움이 필요하면

- Expo Discord: https://chat.expo.dev
- Stack Overflow: `expo` 태그
- 또는 저에게 질문하세요!

화이팅! 🚀
