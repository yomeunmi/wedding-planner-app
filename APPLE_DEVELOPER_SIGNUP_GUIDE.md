# 🍎 Apple Developer Program 가입 상세 가이드

iOS 앱 출시를 위한 Apple Developer Program 가입 방법입니다.

## 📋 준비물

- ✅ Apple ID (yomeunmi@naver.com)
- ✅ 신용카드 또는 체크카드
- ✅ 전화번호 (인증용)
- ✅ $99 (약 130,000원)

## 📝 가입 단계

### 1단계: Apple Developer 웹사이트 접속

```
https://developer.apple.com/programs/
```

### 2단계: Enroll 버튼 클릭

페이지 상단의 **"Enroll"** 또는 **"Join the Apple Developer Program"** 버튼을 클릭합니다.

### 3단계: Apple ID로 로그인

- **Apple ID**: yomeunmi@naver.com
- 비밀번호 입력
- 2단계 인증 (2FA) 코드 입력 (iPhone에서 받음)

### 4단계: 계정 유형 선택

두 가지 옵션:

#### Option 1: Individual (개인) - 추천
- 개인 개발자
- 본인 이름으로 앱 출시
- 간단한 절차
- **승인 시간: 24-48시간**

#### Option 2: Organization (조직)
- 회사/단체
- 사업자등록증 필요
- 복잡한 절차
- 승인 시간: 1-2주

**→ Individual로 선택하세요!**

### 5단계: 개인 정보 입력

다음 정보를 정확하게 입력하세요:

- **Full Name**: 영문 이름 (예: Yeom Eunmi)
- **Country/Region**: South Korea
- **Address**: 영문 주소
  ```
  예시:
  Street Address: 123 Gangnam-daero
  City: Seoul
  State/Province: Seoul
  Postal Code: 06000
  ```
- **Phone Number**: +82-10-XXXX-XXXX
- **Email**: yomeunmi@naver.com

### 6단계: 계약 동의

- **Apple Developer Agreement** 읽고 동의
- 체크박스 선택
- "Continue" 클릭

### 7단계: 결제 정보 입력

- **Annual Membership Fee**: $99 USD
- 신용카드/체크카드 정보 입력:
  - 카드 번호
  - 만료일
  - CVV (뒷면 3자리)
  - 카드 소유자 이름

### 8단계: 주문 확인 및 제출

- 입력한 정보 최종 확인
- **"Purchase"** 또는 **"Submit"** 클릭

### 9단계: 이메일 확인

결제 후 이메일로 다음을 받게 됩니다:

1. **즉시**: 구매 확인 이메일 (Apple)
2. **24-48시간 내**: 계정 승인 이메일

## ⏱️ 타임라인

| 시점 | 상태 |
|------|------|
| 지금 | 가입 신청 |
| 즉시 | 결제 확인 이메일 수신 |
| 몇 시간 후 | "Pending" 상태 확인 가능 |
| 24-48시간 후 | 승인 완료 이메일 수신 |
| 승인 후 | iOS 빌드 가능! |

## 🔍 승인 상태 확인 방법

### Apple Developer 계정 페이지 확인

```
https://developer.apple.com/account
```

로그인 후 확인:
- **Membership**: Active ✅ → 승인 완료!
- **Membership**: Pending ⏳ → 대기 중

## ❓ 자주 묻는 질문

### Q1: 얼마나 걸리나요?
**A**: 보통 24시간 이내, 최대 48시간

### Q2: 주말/공휴일에도 승인되나요?
**A**: 네, 하지만 영업일보다 조금 더 걸릴 수 있습니다.

### Q3: 승인이 거절될 수 있나요?
**A**: 매우 드뭅니다. 정확한 정보를 입력했다면 대부분 승인됩니다.

### Q4: 승인 전에 뭘 할 수 있나요?
**A**:
- Android 빌드 진행 (Apple 계정 불필요)
- 앱 설명, 스크린샷 준비
- 개인정보처리방침 작성

### Q5: 매년 갱신해야 하나요?
**A**: 네, $99/년 자동 갱신됩니다. 취소는 언제든 가능합니다.

## 🎯 가입 후 할 일

승인 이메일을 받으면:

### 1. 확인
```
https://developer.apple.com/account
```
- Membership 상태 확인

### 2. 인증서 준비 (EAS가 자동 처리)
```bash
cd wedding-planner-rn
eas build --platform ios --profile production
```

EAS가 자동으로:
- Distribution Certificate 생성
- Provisioning Profile 생성
- App Store Connect에 앱 등록 준비

## 💡 팁

### 빠른 승인을 위해:
1. ✅ 정확한 영문 이름 사용
2. ✅ 실제 주소 입력
3. ✅ 유효한 전화번호 입력
4. ✅ Apple ID와 동일한 이메일 사용

### 승인 대기 중:
- ⏳ Android 빌드 진행
- ⏳ Google Play Console 가입
- ⏳ 앱 스크린샷 준비
- ⏳ 앱 설명 작성

## 📧 연락처

문제가 발생하면:
- Apple Developer Support: https://developer.apple.com/support/
- 전화: 1-800-633-2152 (미국)
- 한국: 080-330-8877

## ✅ 체크리스트

가입 전:
- [ ] Apple ID 준비 (yomeunmi@naver.com)
- [ ] 신용카드 준비
- [ ] 영문 주소 준비
- [ ] $99 예산 확보

가입 중:
- [ ] Individual 선택
- [ ] 정확한 개인정보 입력
- [ ] 결제 완료
- [ ] 확인 이메일 수신

가입 후:
- [ ] 승인 이메일 대기 (24-48시간)
- [ ] developer.apple.com/account에서 상태 확인
- [ ] Membership "Active" 확인
- [ ] iOS 빌드 시작!

---

**중요**: 승인 이메일을 받을 때까지 Android 작업을 먼저 진행하세요!

화이팅! 🚀
