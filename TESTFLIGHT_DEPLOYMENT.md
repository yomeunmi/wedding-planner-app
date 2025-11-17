# TestFlight 배포 가이드

React Native (Expo) 앱을 TestFlight로 배포하는 완전 초보자 가이드입니다.

## 🎯 TestFlight란?

- Apple의 공식 베타 테스트 플랫폼
- **최대 10,000명**의 테스터에게 앱 배포 가능
- **무료!** (Apple Developer Program 불필요)
- 실제 기기에서 앱 테스트 가능
- App Store 정식 출시 전 피드백 수집에 최적

## 💰 비용

- **EAS Build 무료 플랜**: 무료 (제한적)
  - 월 1회 빌드 무료
  - 추가 빌드 필요시 유료 플랜 ($29/월)
- **Apple Developer Program**: **불필요!** (나중에 정식 출시할 때만 필요)

---

## 📋 목차

1. [사전 준비](#1-사전-준비)
2. [EAS 설정](#2-eas-설정)
3. [앱 빌드](#3-앱-빌드)
4. [TestFlight에 업로드](#4-testflight에-업로드)
5. [테스터 초대](#5-테스터-초대)
6. [테스터가 앱 설치하는 방법](#6-테스터가-앱-설치하는-방법)

---

## 1. 사전 준비

### 필요한 것들
- ✅ Mac 컴퓨터 (있음)
- ✅ Apple ID (이미 있을 것)
- ✅ 인터넷 연결
- ✅ 약간의 인내심 😊

### Apple ID 2단계 인증 활성화

TestFlight를 사용하려면 Apple ID에 2단계 인증이 필요합니다.

**이미 활성화되어 있는지 확인:**
1. https://appleid.apple.com 접속
2. Apple ID로 로그인
3. "보안" 섹션 확인
4. "이중 인증" 또는 "2단계 인증"이 켜져 있어야 함

**활성화 방법 (아직 안 했다면):**
1. iPhone 설정 → [본인 이름] → 암호 및 보안
2. "이중 인증 켜기"
3. 안내에 따라 설정

---

## 2. EAS 설정

### 2.1 EAS CLI 설치

터미널을 열고 (Cmd + Space → "Terminal"):

```bash
# EAS CLI 설치
npm install -g eas-cli

# 버전 확인
eas --version
```

### 2.2 EAS 계정 생성 및 로그인

```bash
# 계정이 없다면 회원가입
eas register

# 또는 이미 있다면 로그인
eas login
```

**입력 정보:**
- 이메일
- 비밀번호
- 사용자 이름

### 2.3 프로젝트로 이동

```bash
cd /Users/yeom/Documents/Project/wedding-planner-app/wedding-planner-rn
```

### 2.4 EAS Build 설정

```bash
eas build:configure
```

**질문이 나오면:**
- `Would you like to automatically create an EAS project?` → **Yes** (y)

이 명령어는 `eas.json` 파일을 생성합니다 (이미 있을 수도 있음).

---

## 3. 앱 빌드

### 3.1 첫 번째 빌드 시작

```bash
# iOS 빌드 시작
eas build --platform ios --profile preview
```

**`--profile preview`를 사용하는 이유:**
- TestFlight용 빌드
- App Store 정식 출시용보다 설정이 간단

### 3.2 빌드 과정 중 질문들

#### 질문 1: Apple ID 입력
```
✔ What is your Apple ID? › your-email@example.com
```
→ Apple ID (이메일) 입력

#### 질문 2: Apple ID 비밀번호
```
✔ What is your Apple ID password? ›
```
→ Apple ID 비밀번호 입력
→ 2단계 인증 코드 입력 (SMS 또는 iPhone으로 받음)

#### 질문 3: App-specific password 생성 필요

**App-specific password 생성 방법:**

1. https://appleid.apple.com 접속
2. "로그인 및 보안" → "앱 전용 암호"
3. "암호 생성" 클릭
4. 레이블: "EAS Build" 입력
5. 생성된 암호 복사 (xxxx-xxxx-xxxx-xxxx 형식)
6. 터미널에 붙여넣기

**중요:** 이 암호는 한 번만 표시되므로 안전한 곳에 저장하세요!

#### 질문 4: Generate credentials?
```
✔ Generate a new Apple Distribution Certificate? › Yes
✔ Generate a new Apple Provisioning Profile? › Yes
```
→ 둘 다 **Yes**

### 3.3 빌드 진행

- 빌드가 Expo 클라우드에서 진행됩니다
- **약 10-20분 소요**
- 진행 상황 확인:
  - 터미널에서 실시간 로그 확인
  - 또는 웹 대시보드: https://expo.dev

### 3.4 빌드 완료

빌드가 완료되면:
```
✔ Build finished

Build URL: https://expo.dev/accounts/[username]/projects/wedding-planner/builds/[build-id]
```

축하합니다! 🎉 이제 `.ipa` 파일이 생성되었습니다.

---

## 4. TestFlight에 업로드

### 방법 1: EAS Submit 사용 (가장 쉬움) ✅

빌드가 완료된 직후:

```bash
# 빌드와 동시에 제출
eas build --platform ios --profile preview --auto-submit
```

또는 이미 빌드한 경우:

```bash
# 제출만 따로 하기
eas submit --platform ios
```

**질문이 나오면:**
- `Select a build` → 가장 최근 빌드 선택 (Enter)
- `ASC API Key` 또는 `Apple ID` 선택 → **Apple ID** 선택 (더 쉬움)
- Apple ID 및 App-specific password 입력

### 방법 2: Transporter 앱 사용 (수동)

Mac App Store에서 "Transporter" 앱을 다운로드:

1. **Transporter 앱 설치**
   - Mac App Store → "Transporter" 검색 → 설치

2. **빌드 파일 다운로드**
   - EAS 대시보드에서 `.ipa` 파일 다운로드

3. **Transporter로 업로드**
   - Transporter 앱 실행
   - Apple ID로 로그인
   - `.ipa` 파일을 드래그 앤 드롭
   - "Deliver" 클릭

### 업로드 완료

업로드가 완료되면 (5-10분 소요):
- 이메일로 알림 수신
- App Store Connect에서 확인 가능

---

## 5. 테스터 초대

### 5.1 App Store Connect 접속

```
https://appstoreconnect.apple.com
```

Apple ID로 로그인

### 5.2 앱 확인

1. **"My Apps" 클릭**
2. **앱 선택** (웨딩플래너)
   - 만약 앱이 없다면:
     - "+" → "New App" 클릭
     - Bundle ID: `com.yomeunmi.weddingplanner` 선택
     - 앱 이름: "웨딩플래너"
     - 생성

### 5.3 TestFlight 탭으로 이동

1. **"TestFlight" 탭 클릭**
2. 업로드한 빌드가 나타날 때까지 대기 (10-30분)
   - 상태: "Processing" → "Ready to Test"

### 5.4 테스터 그룹 생성

빌드가 "Ready to Test" 상태가 되면:

1. **왼쪽 사이드바에서 "Internal Testing" 또는 "External Testing" 선택**

**Internal Testing (내부 테스팅):**
- 최대 100명
- 즉시 테스트 시작 가능
- App Store 심사 불필요
- 팀 멤버만 (Apple Developer Program 멤버)

**External Testing (외부 테스팅) - 추천 ✅:**
- 최대 10,000명
- 누구나 초대 가능
- 첫 빌드만 간단한 심사 필요 (1-2일)
- 친구, 가족 모두 초대 가능

2. **"External Testing" 선택**

3. **테스터 그룹 생성**
   - 왼쪽 사이드바에서 "App Store Connect Users" 아래의 "+" 클릭
   - 그룹 이름: "Friends & Family" 또는 원하는 이름
   - "Create" 클릭

4. **빌드 추가**
   - 그룹 선택 → "Builds" 섹션
   - "+" 클릭 → 최신 빌드 선택

5. **테스트 정보 입력** (첫 빌드만)
   - **What to Test**: 테스터에게 알릴 내용
     ```
     웨딩플래너 앱 첫 번째 베타 버전입니다.

     테스트 사항:
     - 날짜 입력 기능
     - 타임라인 생성 및 확인
     - 체크리스트 완료 표시
     - 마이페이지 닉네임 설정

     피드백 부탁드립니다!
     ```

   - **Beta App Description**: 앱 설명
     ```
     결혼 준비를 체계적으로 관리할 수 있는 웨딩플래너 앱입니다.
     ```

   - **Feedback Email**: 피드백 받을 이메일

   - **Marketing URL**: (선택사항)

   - **Privacy Policy URL**: (선택사항, 나중에 추가 가능)

6. **"Submit for Review" 클릭**
   - External Testing의 경우 첫 빌드만 간단한 심사 필요
   - 보통 1-2일 소요
   - 승인되면 이메일로 알림

### 5.5 테스터 초대하기

심사 승인 후 (또는 Internal Testing의 경우 즉시):

1. **테스터 그룹 선택**
2. **"Testers" 섹션에서 "+" 클릭**
3. **"Add New Testers" 선택**
4. **테스터 정보 입력:**
   - First Name: 이름
   - Last Name: 성
   - Email: 테스터의 이메일

   예:
   ```
   First Name: 민수
   Last Name: 김
   Email: minsu@example.com
   ```

5. **"Add" 클릭**

6. **여러 명 추가:**
   - 계속해서 "+" 클릭하여 추가
   - 또는 CSV 파일로 일괄 추가 가능

### 5.6 초대 이메일 발송

테스터를 추가하면:
- 자동으로 초대 이메일 발송
- 테스터가 이메일을 받음
- "View in TestFlight" 링크 포함

---

## 6. 테스터가 앱 설치하는 방법

테스터에게 다음 단계를 안내하세요:

### 6.1 TestFlight 앱 설치

1. **App Store에서 "TestFlight" 앱 다운로드**
   - 무료 앱
   - Apple 공식 앱

### 6.2 초대 수락

1. **이메일 확인**
   - 제목: "You're invited to test 웨딩플래너"

2. **"View in TestFlight" 또는 "Start Testing" 클릭**
   - TestFlight 앱이 자동으로 열림

3. **"Accept" 클릭**
   - 약관 동의

### 6.3 앱 설치

1. **TestFlight 앱에서 "웨딩플래너" 선택**

2. **"Install" 클릭**
   - 앱이 다운로드 및 설치됨

3. **홈 화면에서 앱 실행**
   - 일반 앱처럼 사용 가능
   - 아이콘에 주황색 점 표시 (베타 앱 표시)

### 6.4 피드백 제공

1. **TestFlight 앱 열기**
2. **"웨딩플래너" 선택**
3. **"Send Feedback" 클릭**
4. **피드백 작성 및 전송**
   - 스크린샷 첨부 가능

---

## 7. 업데이트 배포

앱을 수정한 후 새 버전을 배포하는 방법:

### 7.1 버전 번호 증가

`wedding-planner-rn/app.json` 수정:

```json
{
  "expo": {
    "version": "1.0.1",  // 1.0.0 → 1.0.1
    "ios": {
      "buildNumber": "2"  // "1.0.0" → "2" 또는 "1.0.1"
    }
  }
}
```

### 7.2 다시 빌드

```bash
cd wedding-planner-rn
eas build --platform ios --profile preview --auto-submit
```

### 7.3 TestFlight에서 새 빌드 추가

1. **App Store Connect → TestFlight**
2. **새 빌드가 "Ready to Test"가 될 때까지 대기**
3. **테스터 그룹에 새 빌드 추가**
   - 그룹 선택 → "Builds" → "+" → 새 빌드 선택
4. **"What to Test" 업데이트**
   ```
   버전 1.0.1 업데이트 내용:
   - 폰트를 Poor Story로 변경
   - 화면 상단 여유 공간 추가
   - 날짜 입력 순서 변경
   ```

### 7.4 자동 알림

- 기존 테스터에게 자동으로 알림 발송
- TestFlight 앱에서 "Update" 버튼 표시
- 테스터가 클릭하면 새 버전 설치

---

## 8. 문제 해결

### 문제 1: 빌드 실패
```
Error: Build failed
```

**해결:**
1. 에러 메시지 확인
2. `package.json` 의존성 확인
3. 다시 시도:
   ```bash
   eas build --platform ios --profile preview --clear-cache
   ```

### 문제 2: App-specific password 오류
```
Error: Invalid app-specific password
```

**해결:**
1. https://appleid.apple.com 재방문
2. 새로운 App-specific password 생성
3. 다시 시도

### 문제 3: Bundle ID 충돌
```
Error: Bundle identifier is not available
```

**해결:**
1. `app.json`의 `bundleIdentifier` 변경
   ```json
   "bundleIdentifier": "com.yomeunmi.weddingplanner2"
   ```
2. 다시 빌드

### 문제 4: 빌드가 TestFlight에 안 나타남
```
빌드가 App Store Connect에 안 보임
```

**해결:**
- 30분-1시간 대기 (처리 시간)
- 이메일 확인 (업로드 성공/실패 알림)
- 처리 중이면 "Processing" 상태로 표시됨

### 문제 5: 테스터가 앱을 못 받음
```
초대 이메일을 받지 못함
```

**해결:**
1. 스팸 메일함 확인
2. App Store Connect에서 초대 재발송
3. 테스터의 이메일 주소 확인

---

## 9. TestFlight vs App Store 비교

| 항목 | TestFlight | App Store |
|------|-----------|-----------|
| 비용 | 무료 | $99/년 |
| 테스터 수 | 최대 10,000명 | 무제한 |
| 설치 방법 | TestFlight 앱 필요 | App Store에서 직접 |
| 테스트 기간 | 90일 (갱신 가능) | 영구 |
| 심사 | 간단 (1-2일) | 엄격 (3-7일) |
| 피드백 | 쉬움 | 리뷰로만 가능 |
| 업데이트 | 빠름 | 심사 필요 |

---

## 10. 다음 단계

### TestFlight 테스트 후:

1. **피드백 수집**
   - 친구, 가족에게 의견 받기
   - 버그 찾기
   - UI/UX 개선

2. **업데이트 반복**
   - 문제 수정
   - 기능 추가
   - 새 버전 배포

3. **준비가 되면 App Store 정식 출시**
   - Apple Developer Program 가입 ($99/년)
   - APP_STORE_DEPLOYMENT.md 가이드 참고

---

## 11. 유용한 명령어 모음

```bash
# EAS 로그인
eas login

# 빌드 상태 확인
eas build:list

# 빌드 + TestFlight 제출
eas build --platform ios --profile preview --auto-submit

# 특정 빌드 제출
eas submit --platform ios --latest

# 빌드 로그 확인
eas build:view [build-id]

# 캐시 클리어 후 빌드
eas build --platform ios --profile preview --clear-cache
```

---

## 12. 체크리스트

TestFlight 배포 전 확인:

- [ ] Apple ID 준비
- [ ] 2단계 인증 활성화
- [ ] EAS CLI 설치
- [ ] EAS 계정 생성
- [ ] App-specific password 생성
- [ ] `app.json` bundleIdentifier 확인
- [ ] 빌드 성공
- [ ] TestFlight 업로드 완료
- [ ] 테스터 초대
- [ ] 테스터가 앱 설치 확인

---

## 13. 예상 일정

| 단계 | 소요 시간 |
|------|----------|
| EAS 설정 | 30분 |
| 첫 빌드 (삽질 포함) | 1-2시간 |
| TestFlight 업로드 | 10-30분 |
| 외부 테스팅 심사 (선택) | 1-2일 |
| 테스터 초대 | 10분 |
| **총** | **2-3시간 (심사 제외)** |

---

## 도움이 필요하면

- Expo Discord: https://chat.expo.dev
- Expo 문서: https://docs.expo.dev/build/introduction/
- 또는 저에게 질문하세요!

화이팅! 🚀
