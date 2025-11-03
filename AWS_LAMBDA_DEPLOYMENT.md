# AWS Lambda 배포 가이드 🚀

이 가이드는 Wedding Planner App을 AWS Lambda에 배포하는 방법을 설명합니다.

## 📋 사전 준비

### 1. AWS 계정 및 CLI 설정

#### AWS 계정 생성
- AWS 계정이 없다면 [aws.amazon.com](https://aws.amazon.com)에서 생성

#### AWS CLI 설치
```bash
# macOS (Homebrew 사용)
brew install awscli

# Windows (Chocolatey 사용)
choco install awscli

# Linux
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

#### AWS CLI 설정
```bash
aws configure
```

입력 정보:
- **AWS Access Key ID**: IAM 사용자의 액세스 키
- **AWS Secret Access Key**: IAM 사용자의 시크릿 키
- **Default region**: `ap-northeast-2` (서울)
- **Default output format**: `json`

### 2. IAM 권한 설정

배포하는 IAM 사용자에게 다음 권한이 필요합니다:
- `AWSLambda_FullAccess`
- `AmazonDynamoDBFullAccess`
- `AmazonAPIGatewayAdministrator`
- `IAMFullAccess` (Lambda 실행 역할 생성용)
- `CloudFormationFullAccess`
- `CloudWatchLogsFullAccess`

### 3. Node.js 18.x 설치

⚠️ **중요**: Node.js 18.x LTS 버전을 사용해야 합니다 (22.x는 호환 안됨)

```bash
# NVM을 사용하는 경우 (권장)
nvm install 18
nvm use 18

# 버전 확인
node -v  # v18.x.x 출력되어야 함
```

## 🚀 배포 단계

### Step 1: 의존성 설치

```bash
npm install
```

### Step 2: 환경 변수 설정

```bash
# .env 파일 생성
cp .env.example .env
```

`.env` 파일 수정:
```bash
# AWS 설정
AWS_REGION=ap-northeast-2
AWS_PROFILE=default

# DynamoDB 테이블명
DYNAMODB_TABLE=wedding-planner-app-dev

# 스테이지
STAGE=dev

# Kakao API 키 (선택사항 - KAKAO_API_SETUP.md 참고)
KAKAO_API_KEY=your_kakao_api_key_here
```

> 💡 **Kakao API 키**: 카카오 로컬 API를 사용하려면 [KAKAO_API_SETUP.md](./KAKAO_API_SETUP.md) 참고

### Step 3: 개발 환경 배포

```bash
npm run deploy:dev
```

배포가 완료되면 다음과 같은 정보가 출력됩니다:

```
Service Information
service: wedding-planner-app
stage: dev
region: ap-northeast-2
stack: wedding-planner-app-dev
endpoints:
  GET - https://xxxxxxxxxx.execute-api.ap-northeast-2.amazonaws.com/dev/api/wedding-halls
  GET - https://xxxxxxxxxx.execute-api.ap-northeast-2.amazonaws.com/dev/api/studios
  GET - https://xxxxxxxxxx.execute-api.ap-northeast-2.amazonaws.com/dev/api/dress
  GET - https://xxxxxxxxxx.execute-api.ap-northeast-2.amazonaws.com/dev/api/makeup
functions:
  scrapeWeddingHalls: wedding-planner-app-dev-scrapeWeddingHalls
  scrapeStudios: wedding-planner-app-dev-scrapeStudios
  scrapeDress: wedding-planner-app-dev-scrapeDress
  scrapeMakeup: wedding-planner-app-dev-scrapeMakeup
  searchWeddingHalls: wedding-planner-app-dev-searchWeddingHalls
  searchStudios: wedding-planner-app-dev-searchStudios
  searchDress: wedding-planner-app-dev-searchDress
  searchMakeup: wedding-planner-app-dev-searchMakeup
```

### Step 4: API 테스트

배포된 API 엔드포인트를 테스트합니다:

```bash
# 웨딩홀 검색
curl https://your-api-id.execute-api.ap-northeast-2.amazonaws.com/dev/api/wedding-halls

# 스튜디오 검색
curl https://your-api-id.execute-api.ap-northeast-2.amazonaws.com/dev/api/studios

# 드레스샵 검색
curl https://your-api-id.execute-api.ap-northeast-2.amazonaws.com/dev/api/dress

# 메이크업 검색
curl https://your-api-id.execute-api.ap-northeast-2.amazonaws.com/dev/api/makeup
```

## 🔄 프로덕션 배포

```bash
npm run deploy:prod
```

## 💰 비용 최적화 팁

### 1. DynamoDB 온디맨드 모드 (선택사항)

트래픽이 불규칙하다면 `serverless.yml`에서 온디맨드 모드로 변경:

```yaml
BillingMode: PAY_PER_REQUEST
# ProvisionedThroughput 섹션 제거
```

### 2. Lambda 메모리 조정

사용 패턴에 따라 `serverless.yml`에서 메모리 조정:

```yaml
provider:
  memorySize: 256  # 기본 512에서 256으로 줄이기
```

### 3. CloudWatch Logs 보존 기간 설정

```yaml
provider:
  logRetentionInDays: 7  # 7일 후 자동 삭제
```

## 📊 모니터링

### CloudWatch 대시보드
1. [AWS CloudWatch Console](https://console.aws.amazon.com/cloudwatch/) 접속
2. "Logs" → "Log groups" → `/aws/lambda/wedding-planner-app-dev-*` 확인

### Lambda 함수 모니터링
1. [AWS Lambda Console](https://console.aws.amazon.com/lambda/) 접속
2. 각 함수 클릭 → "Monitor" 탭에서 실행 통계 확인

### DynamoDB 테이블 확인
1. [AWS DynamoDB Console](https://console.aws.amazon.com/dynamodb/) 접속
2. `wedding-planner-app-dev` 테이블 클릭 → "Items" 탭에서 데이터 확인

## 🛠️ 문제 해결

### 배포 실패 시

#### 권한 오류
```
Error: User is not authorized to perform: lambda:CreateFunction
```
→ IAM 사용자에게 필요한 권한 추가

#### 리소스 제한
```
Error: Code storage limit exceeded
```
→ 사용하지 않는 Lambda 함수 삭제 또는 AWS 지원팀에 제한 증가 요청

#### Node.js 버전 오류
```
Error: Runtime nodejs22.x is not supported
```
→ Node.js 18.x 설치 및 사용: `nvm use 18`

### Lambda 실행 오류 확인

```bash
# CloudWatch Logs 확인
aws logs tail /aws/lambda/wedding-planner-app-dev-searchWeddingHalls --follow

# 특정 함수 호출
aws lambda invoke \
  --function-name wedding-planner-app-dev-searchWeddingHalls \
  --payload '{}' \
  response.json
```

## 🗑️ 리소스 삭제

배포한 모든 AWS 리소스를 삭제하려면:

```bash
# 개발 환경 삭제
serverless remove --stage dev

# 프로덕션 환경 삭제
serverless remove --stage prod
```

⚠️ **주의**: DynamoDB 테이블의 모든 데이터가 삭제됩니다!

## 📚 추가 리소스

- [Serverless Framework 문서](https://www.serverless.com/framework/docs)
- [AWS Lambda 개발자 가이드](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
- [DynamoDB 개발자 가이드](https://docs.aws.amazon.com/dynamodb/latest/developerguide/Introduction.html)
- [프로젝트 시작 가이드](./GETTING_STARTED.md)
- [문제 해결 가이드](./TROUBLESHOOTING.md)

## 🎯 다음 단계

1. ✅ AWS Lambda에 배포 완료
2. 📱 프론트엔드 애플리케이션 개발
3. 🔐 API Gateway에 인증 추가
4. 📈 CloudWatch 알림 설정
5. 🚀 CI/CD 파이프라인 구축 (GitHub Actions 등)

---

문의사항이 있으시면 Issue를 생성해주세요!
