# App Store 배포 가이드

React Native (Expo) 앱을 App Store에 처음 배포하는 상세 가이드입니다.

## 📋 목차
1. [사전 준비](#1-사전-준비)
2. [Apple Developer Program 가입](#2-apple-developer-program-가입)
3. [앱 설정 및 준비](#3-앱-설정-및-준비)
4. [EAS (Expo Application Services) 설정](#4-eas-expo-application-services-설정)
5. [앱 빌드](#5-앱-빌드)
6. [App Store Connect 설정](#6-app-store-connect-설정)
7. [심사 제출](#7-심사-제출)
8. [문제 해결](#8-문제-해결)

---

## 1. 사전 준비

### 필요한 것들
- ✅ Mac 컴퓨터 (iOS 앱 빌드 필수)
- ✅ Apple ID
- ✅ Apple Developer Program 계정 (연 $99)
- ✅ 신용카드 (Apple Developer Program 결제용)

### 비용
- Apple Developer Program: **$99/년** (필수)
- EAS Build: 무료 플랜으로 시작 가능

---

## 2. Apple Developer Program 가입

### 단계별 가입 방법

1. **Apple Developer 웹사이트 방문**
   ```
   https://developer.apple.com/programs/
   ```

2. **"Enroll" 버튼 클릭**

3. **Apple ID로 로그인**
   - 기존 Apple ID 사용 가능
   - 없으면 새로 생성

4. **개발자 정보 입력**
   - 이름
   - 주소
   - 전화번호
   - 이메일

5. **개발자 계정 유형 선택**
   - **Individual (개인)**: 개인 개발자
   - **Organization (조직)**: 회사나 단체

   → 처음이라면 **Individual** 추천

6. **결제 정보 입력**
   - $99/년 결제
   - 신용카드 또는 체크카드

7. **승인 대기**
   - 보통 24-48시간 소요
   - 이메일로 승인 알림 수신

---

## 3. 앱 설정 및 준비

### 3.1 앱 아이콘 및 스플래시 스크린 준비

현재 프로젝트에 이미 아이콘이 있지만, 확인해봅시다:

```bash
cd wedding-planner-rn
ls -la assets/
```

**필요한 파일:**
- `icon.png` - 1024x1024 PNG (앱 아이콘)
- `splash-icon.png` - 앱 시작 화면
- `adaptive-icon.png` - Android용 (나중에 필요)

### 3.2 app.json 설정 확인

`wedding-planner-rn/app.json` 파일을 확인하고 수정합니다:

```json
{
  "expo": {
    "name": "웨딩플래너",
    "slug": "wedding-planner",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourname.weddingplanner",
      "buildNumber": "1.0.0"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourname.weddingplanner"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

**중요: bundleIdentifier 변경**
- `com.yourname.weddingplanner`를 고유한 ID로 변경
- 예: `com.yomeunmi.weddingplanner`
- 한번 정하면 변경 불가능!

---

## 4. EAS (Expo Application Services) 설정

### 4.1 EAS CLI 설치

```bash
npm install -g eas-cli
```

### 4.2 EAS 로그인

```bash
eas login
```

Expo 계정이 없다면:
```bash
eas register
```

### 4.3 프로젝트 설정

```bash
cd wedding-planner-rn
eas build:configure
```

이 명령어는 `eas.json` 파일을 생성합니다.

### 4.4 eas.json 확인 및 수정

생성된 `eas.json` 파일:

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 5. 앱 빌드

### 5.1 iOS 빌드 (첫 번째 시도)

```bash
cd wedding-planner-rn
eas build --platform ios
```

**선택사항이 나오면:**
1. `Generate a new Apple Distribution Certificate?` → Yes
2. `Generate a new Apple Provisioning Profile?` → Yes

### 5.2 빌드 진행

- EAS가 클라우드에서 앱을 빌드합니다
- 약 10-20분 소요
- 진행 상황을 웹 대시보드에서 확인 가능

### 5.3 빌드 완료

빌드가 완료되면:
- `.ipa` 파일이 생성됩니다
- 다운로드 링크를 받습니다

---

## 6. App Store Connect 설정

### 6.1 App Store Connect 접속

```
https://appstoreconnect.apple.com
```

Apple Developer 계정으로 로그인

### 6.2 새 앱 등록

1. **"My Apps" 클릭**

2. **"+" 버튼 → "New App" 클릭**

3. **앱 정보 입력:**
   - **Platform**: iOS
   - **Name**: 웨딩플래너 (또는 원하는 이름)
   - **Primary Language**: Korean
   - **Bundle ID**: app.json에서 설정한 bundleIdentifier 선택
   - **SKU**: 고유 ID (예: wedding-planner-001)
   - **User Access**: Full Access

4. **"Create" 클릭**

### 6.3 앱 정보 작성

#### App Information 탭
- **Name**: 웨딩플래너
- **Subtitle**: 결혼 준비를 쉽게 관리하세요 (최대 30자)
- **Privacy Policy URL**: 개인정보처리방침 URL (필수)
  - 없다면 GitHub Pages나 Notion으로 간단히 작성
- **Category**: Lifestyle 또는 Productivity

#### Pricing and Availability
- **Price**: Free (무료)
- **Availability**: 모든 국가 또는 한국만

#### Prepare for Submission

**스크린샷 준비 (필수):**
- 6.5" Display (iPhone 14 Pro Max) - 최소 3장, 최대 10장
  - 크기: 1290 x 2796 pixels
- 5.5" Display (iPhone 8 Plus) - 선택사항

**스크린샷 촬영 방법:**
1. 시뮬레이터에서 앱 실행:
   ```bash
   npm start
   # 'i'를 눌러 iOS 시뮬레이터 실행
   ```

2. 시뮬레이터에서:
   - Device: iPhone 14 Pro Max 선택
   - Cmd + S로 스크린샷 저장

3. 필요한 화면:
   - 날짜 입력 화면
   - 타임라인 화면
   - 상세 정보 화면
   - 마이페이지 화면

**앱 설명:**
```
🎉 웨딩플래너 - 결혼 준비를 체계적으로!

결혼식 날짜와 준비 시작일을 입력하면 자동으로 맞춤형 준비 일정을 생성해드립니다.

주요 기능:
✓ 자동 일정 생성
✓ 체크리스트 관리
✓ 준비 팁 제공
✓ D-Day 카운터
✓ 오프라인에서도 사용 가능

결혼 준비, 이제 체계적으로 관리하세요!
```

**키워드** (최대 100자):
```
웨딩,결혼,결혼준비,웨딩플래너,결혼식,체크리스트,일정관리
```

**Support URL**:
- GitHub 저장소 URL 또는 이메일

**Marketing URL** (선택):
- 웹사이트가 있다면 입력

---

## 7. 심사 제출

### 7.1 EAS Submit 사용

가장 쉬운 방법:

```bash
cd wedding-planner-rn
eas submit --platform ios
```

또는 직접 업로드:

```bash
eas build --platform ios --auto-submit
```

### 7.2 App Store Connect에서 확인

1. **App Store Connect 접속**
2. **해당 앱 선택**
3. **TestFlight 탭**에서 빌드 확인
4. 빌드가 나타나면 (10-30분 소요) **App Store 탭**으로 이동

### 7.3 버전 정보 작성

1. **"+" 버튼으로 새 버전 추가** (1.0.0)

2. **빌드 선택**
   - 업로드한 빌드 선택

3. **심사 정보 입력:**
   - **Export Compliance**: No (암호화 미사용)
   - **Content Rights**: 자신의 앱이므로 체크
   - **Advertising Identifier**: No (광고 없음)

4. **앱 심사 정보:**
   - **데모 계정**: 로그인이 필요하다면 제공 (현재는 불필요)
   - **연락처 정보**: 이메일, 전화번호
   - **Notes**: 심사자에게 전달할 메모

### 7.4 심사 제출

1. **"Submit for Review" 클릭**
2. 상태가 "Waiting for Review"로 변경
3. 심사 대기 (보통 1-3일)

---

## 8. 문제 해결

### 자주 발생하는 문제

#### 1. Bundle Identifier 오류
```
Error: Bundle identifier already exists
```

**해결:**
- `app.json`의 `bundleIdentifier`를 고유한 값으로 변경
- 예: `com.yomeunmi.weddingplanner.v2`

#### 2. 인증서 문제
```
Error: Apple Distribution Certificate not found
```

**해결:**
```bash
eas credentials
```
- 인증서 재생성

#### 3. 빌드 실패
```
Error: Build failed
```

**해결:**
- `package.json`의 의존성 확인
- Expo SDK 버전 확인
- 에러 로그 확인

#### 4. 스크린샷 크기 오류

**해결:**
- 정확한 크기로 리사이즈
- 온라인 도구: https://www.appscreenshots.com

#### 5. 개인정보처리방침 없음

**해결:**
간단한 개인정보처리방침 예시:

```markdown
# 개인정보처리방침

웨딩플래너 앱은 사용자의 개인정보를 수집하지 않습니다.

## 수집하는 정보
- 없음. 모든 데이터는 사용자의 기기에 로컬로 저장됩니다.

## 데이터 저장
- 앱 데이터는 사용자의 기기에만 저장됩니다.
- 서버로 전송되지 않습니다.

## 연락처
문의사항: your-email@example.com

최종 업데이트: 2025년 1월
```

GitHub Pages로 호스팅하거나 Notion 페이지로 만들 수 있습니다.

---

## 9. 체크리스트

배포 전 최종 확인:

- [ ] Apple Developer Program 가입 완료
- [ ] `app.json`의 bundleIdentifier 설정
- [ ] 앱 아이콘 준비 (1024x1024)
- [ ] 스크린샷 준비 (최소 3장)
- [ ] 앱 설명 작성
- [ ] 개인정보처리방침 URL 준비
- [ ] EAS CLI 설치 및 로그인
- [ ] 빌드 성공
- [ ] App Store Connect 앱 등록
- [ ] 심사 제출

---

## 10. 다음 단계

### 심사 승인 후:
1. **App Store에서 앱 확인**
2. **친구들에게 테스트 요청**
3. **피드백 수집**
4. **업데이트 준비**

### 업데이트 배포:
1. `app.json`의 `version` 증가 (1.0.0 → 1.0.1)
2. `buildNumber` 증가
3. 다시 빌드 및 제출

```bash
eas build --platform ios --auto-submit
```

---

## 11. 유용한 링크

- **Apple Developer**: https://developer.apple.com
- **App Store Connect**: https://appstoreconnect.apple.com
- **Expo 문서**: https://docs.expo.dev
- **EAS Build 문서**: https://docs.expo.dev/build/introduction/
- **EAS Submit 문서**: https://docs.expo.dev/submit/introduction/

---

## 12. 예상 일정

| 단계 | 소요 시간 |
|------|----------|
| Apple Developer Program 승인 | 1-2일 |
| 앱 설정 및 준비 | 2-4시간 |
| 첫 빌드 (삽질 포함) | 1-2일 |
| App Store Connect 설정 | 2-3시간 |
| 심사 대기 | 1-3일 |
| **총** | **약 1주일** |

---

## 도움이 필요하면

- Expo Discord: https://chat.expo.dev
- Stack Overflow: expo 태그로 질문
- 또는 저에게 질문하세요!

화이팅! 🎉
