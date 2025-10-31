# Java/Spring 개발자를 위한 시작 가이드 🚀

Java/Kotlin/Spring 개발 경험이 있으신 분들을 위한 Node.js Serverless 프로젝트 가이드입니다.

## 📚 개념 비교: Spring vs Serverless

| 개념 | Spring (Java) | Serverless (Node.js) |
|------|---------------|----------------------|
| 프레임워크 | Spring Boot | Serverless Framework |
| 런타임 | JVM (Tomcat) | AWS Lambda (Node.js) |
| 빌드 도구 | Maven/Gradle | npm/yarn |
| 패키지 관리 | pom.xml / build.gradle | package.json |
| 의존성 설치 | `mvn install` / `gradle build` | `npm install` |
| 애플리케이션 실행 | `java -jar app.jar` | `serverless offline` |
| 배포 | JAR/WAR 파일 배포 | `serverless deploy` |
| 데이터베이스 | MySQL, PostgreSQL | DynamoDB (NoSQL) |

## 🛠️ 1단계: 필수 도구 설치

### 1.1 Node.js 설치 (JDK와 유사)

**Windows:**
```bash
# Chocolatey 사용 (권장)
choco install nodejs-lts

# 또는 공식 사이트에서 다운로드
# https://nodejs.org/ko/ → LTS 버전 다운로드
```

**macOS:**
```bash
# Homebrew 사용
brew install node@18

# 또는 공식 사이트에서 다운로드
# https://nodejs.org/ko/ → LTS 버전 다운로드
```

**Linux (Ubuntu/Debian):**
```bash
# NodeSource 저장소 추가
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Node.js 설치
sudo apt-get install -y nodejs
```

**설치 확인:**
```bash
node --version    # v18.x.x 이상
npm --version     # 9.x.x 이상
```

> 💡 **비유**: Node.js는 Java의 JDK, npm은 Maven/Gradle과 유사합니다.

### 1.2 Git 설치 (이미 설치되어 있을 가능성 높음)

```bash
git --version
```

### 1.3 AWS CLI 설치 (배포 시 필요)

**Windows:**
```bash
# MSI 설치 프로그램 다운로드
# https://aws.amazon.com/ko/cli/
```

**macOS:**
```bash
brew install awscli
```

**Linux:**
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

**설치 확인:**
```bash
aws --version
```

### 1.4 IDE 추천

- **VS Code** (추천): 가볍고 Node.js 개발에 최적화
- **IntelliJ IDEA Ultimate**: Node.js 플러그인 지원
- **WebStorm**: JetBrains의 JavaScript 전용 IDE

## 📥 2단계: 프로젝트 다운로드

### 2.1 Git Clone

```bash
# 프로젝트 클론
git clone https://github.com/yomeunmi/yomeunmi.git

# 프로젝트 디렉토리로 이동
cd yomeunmi

# 개발 브랜치로 체크아웃
git checkout claude/wedding-planner-lambda-011CUesfYPrZHiYMNqmPJ5pf
```

> 💡 **Spring과 비교**: `git clone`은 Maven/Gradle 프로젝트를 받는 것과 동일합니다.

### 2.2 프로젝트 구조 확인

```bash
# 프로젝트 구조 보기
ls -la

# src 디렉토리 확인 (Spring의 src/main/java와 유사)
ls -la src/
```

**디렉토리 구조:**
```
yomeunmi/
├── src/
│   ├── handlers/        ← Spring의 @Controller, @RestController와 유사
│   ├── scrapers/        ← 비즈니스 로직 (Service 계층과 유사)
│   ├── utils/           ← 유틸리티 클래스
│   └── config/          ← Spring의 @Configuration과 유사
├── package.json         ← pom.xml 또는 build.gradle과 유사
├── serverless.yml       ← application.yml + 배포 설정
└── README.md
```

## 🔧 3단계: 의존성 설치

### 3.1 npm install (Maven의 mvn install과 유사)

```bash
# 의존성 설치 (package.json 기반)
npm install

# 또는 yarn 사용 (선택사항)
# npm install -g yarn
# yarn install
```

> 💡 **Tip**: 프로젝트에 `.npmrc` 파일이 포함되어 있어 peer dependency 경고를 자동으로 처리합니다.

**실행 결과:**
- `node_modules/` 디렉토리 생성 (Maven의 `.m2/repository`와 유사)
- `package-lock.json` 생성 (dependency lock 파일)

> ⚠️ **주의**: `node_modules/`는 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.

**만약 ERESOLVE 오류가 발생한다면:**
```bash
# 방법 1: legacy-peer-deps 옵션 사용
npm install --legacy-peer-deps

# 방법 2: force 옵션 사용
npm install --force

# 방법 3: .npmrc 파일 확인 (이미 포함되어 있음)
cat .npmrc
# legacy-peer-deps=true 가 있어야 함
```

### 3.2 설치된 패키지 확인

```bash
# 설치된 패키지 목록
npm list --depth=0

# 특정 패키지 확인
npm list axios
```

## 🏃 4단계: 로컬에서 실행하기

### 4.1 환경 변수 설정

```bash
# .env 파일 생성 (application.properties와 유사)
cp .env.example .env

# .env 파일 편집
# Windows: notepad .env
# macOS/Linux: nano .env 또는 vi .env
```

**.env 파일 내용:**
```env
AWS_REGION=ap-northeast-2
DYNAMODB_TABLE=wedding-planner-app-dev
STAGE=dev
```

### 4.2 Serverless Offline 설치 및 실행

**Serverless Framework 전역 설치:**
```bash
npm install -g serverless
```

**로컬에서 실행 (Spring Boot의 `./mvnw spring-boot:run`과 유사):**
```bash
# 로컬 서버 시작
npm run offline

# 또는
serverless offline
```

**실행 결과:**
```
Starting Offline: dev/ap-northeast-2

┌─────────────────────────────────────────────────────┐
│                                                      │
│   GET  | http://localhost:3000/api/wedding-halls    │
│   GET  | http://localhost:3000/api/studios          │
│   GET  | http://localhost:3000/api/dress            │
│                                                      │
└─────────────────────────────────────────────────────┘

Server ready: http://localhost:3000 🚀
```

> 💡 **Spring Boot와 비교**:
> - Spring Boot: `http://localhost:8080`
> - Serverless Offline: `http://localhost:3000`

### 4.3 API 테스트

**curl 사용:**
```bash
# 웨딩홀 API 테스트
curl http://localhost:3000/api/wedding-halls

# limit 파라미터 사용
curl "http://localhost:3000/api/wedding-halls?limit=10"

# 스튜디오 API 테스트
curl http://localhost:3000/api/studios

# 드레스샵 API 테스트
curl http://localhost:3000/api/dress
```

**브라우저 사용:**
- http://localhost:3000/api/wedding-halls
- http://localhost:3000/api/studios
- http://localhost:3000/api/dress

**Postman 사용:**
1. Postman 실행
2. GET 요청 생성
3. URL: `http://localhost:3000/api/wedding-halls`
4. Send 클릭

### 4.4 로그 확인

터미널에서 실시간으로 로그를 확인할 수 있습니다 (Spring Boot의 콘솔 로그와 유사).

```bash
# serverless offline 실행 시 자동으로 로그 출력
# console.log() → System.out.println()과 유사
```

## 🧪 5단계: 코드 수정 및 테스트

### 5.1 코드 수정 (Hot Reload)

**예시: 응답 메시지 수정**

`src/handlers/search.js` 파일을 열어서 수정:

```javascript
// 수정 전
return success({
  category: 'wedding-halls',
  count: items.length,
  items
});

// 수정 후
return success({
  category: 'wedding-halls',
  message: '웨딩홀 목록입니다',  // 추가
  count: items.length,
  items
});
```

**저장 후 자동 재시작:**
- Serverless Offline은 파일 변경을 감지하고 자동으로 재시작됩니다
- Spring Boot DevTools와 유사한 기능

### 5.2 스크래퍼 테스트

**개별 함수 테스트:**
```bash
# 웨딩홀 스크래핑 함수 테스트
serverless invoke local --function scrapeWeddingHalls

# 스튜디오 스크래핑 함수 테스트
serverless invoke local --function scrapeStudios

# 드레스샵 스크래핑 함수 테스트
serverless invoke local --function scrapeDress
```

> 💡 **Spring과 비교**: JUnit 테스트와 유사하지만, 실제 Lambda 함수를 로컬에서 실행합니다.

## 📦 6단계: 프로젝트 이해하기

### 6.1 파일별 역할

| 파일 | Spring 비유 | 설명 |
|------|-------------|------|
| `package.json` | `pom.xml` / `build.gradle` | 의존성 및 스크립트 정의 |
| `serverless.yml` | `application.yml` + 배포 설정 | Lambda, API Gateway, DynamoDB 설정 |
| `src/handlers/*.js` | `@RestController` | API 엔드포인트 핸들러 |
| `src/scrapers/*.js` | `@Service` | 비즈니스 로직 (스크래핑) |
| `src/utils/*.js` | 유틸리티 클래스 | 공통 기능 (DB, 응답 등) |
| `src/config/*.js` | `@Configuration` | 설정 및 상수 |

### 6.2 주요 npm 명령어

```bash
# 의존성 설치
npm install

# 패키지 추가 (예: lodash)
npm install lodash

# 개발 의존성 추가
npm install --save-dev jest

# 패키지 제거
npm uninstall lodash

# 스크립트 실행 (package.json의 scripts 섹션)
npm run deploy
npm run offline
npm test

# 전역 패키지 설치
npm install -g serverless
```

### 6.3 코드 스타일 차이

**Spring (Java):**
```java
@RestController
@RequestMapping("/api")
public class WeddingHallController {

    @Autowired
    private WeddingHallService service;

    @GetMapping("/wedding-halls")
    public ResponseEntity<List<WeddingHall>> getWeddingHalls(
        @RequestParam(defaultValue = "50") int limit
    ) {
        List<WeddingHall> halls = service.findAll(limit);
        return ResponseEntity.ok(halls);
    }
}
```

**Serverless (Node.js):**
```javascript
const { getItemsByCategory } = require('../utils/dynamodb');
const { success } = require('../utils/response');

module.exports.weddingHalls = async (event) => {
  const { limit = 50 } = event.queryStringParameters || {};

  const items = await getItemsByCategory('wedding-hall', parseInt(limit));

  return success({
    items
  });
};
```

## ☁️ 7단계: AWS 배포하기

### 7.1 AWS 계정 설정

```bash
# AWS 자격 증명 구성
aws configure

# 입력 사항:
# AWS Access Key ID: [액세스 키]
# AWS Secret Access Key: [시크릿 키]
# Default region name: ap-northeast-2
# Default output format: json
```

> 💡 AWS 액세스 키는 AWS Console > IAM > 사용자 > 보안 자격 증명에서 생성할 수 있습니다.

### 7.2 배포 실행

```bash
# 개발 환경 배포
npm run deploy:dev

# 프로덕션 환경 배포
npm run deploy:prod

# 또는 직접 명령어 실행
serverless deploy --stage dev
```

**배포 결과:**
```
Service Information
service: wedding-planner-app
stage: dev
region: ap-northeast-2
stack: wedding-planner-app-dev

endpoints:
  GET - https://xxxxx.execute-api.ap-northeast-2.amazonaws.com/dev/api/wedding-halls
  GET - https://xxxxx.execute-api.ap-northeast-2.amazonaws.com/dev/api/studios
  GET - https://xxxxx.execute-api.ap-northeast-2.amazonaws.com/dev/api/dress

functions:
  scrapeWeddingHalls: wedding-planner-app-dev-scrapeWeddingHalls
  scrapeStudios: wedding-planner-app-dev-scrapeStudios
  scrapeDress: wedding-planner-app-dev-scrapeDress
  searchWeddingHalls: wedding-planner-app-dev-searchWeddingHalls
  searchStudios: wedding-planner-app-dev-searchStudios
  searchDress: wedding-planner-app-dev-searchDress
```

### 7.3 배포된 API 테스트

```bash
# 실제 배포된 엔드포인트로 테스트
curl https://xxxxx.execute-api.ap-northeast-2.amazonaws.com/dev/api/wedding-halls
```

### 7.4 배포 제거

```bash
# 리소스 제거 (개발 환경)
serverless remove --stage dev
```

## 🐛 8단계: 문제 해결

### 8.1 자주 발생하는 오류

**1. `npm install` 실패**
```bash
# npm 캐시 정리
npm cache clean --force

# 재시도
rm -rf node_modules package-lock.json
npm install
```

**2. 권한 오류 (macOS/Linux)**
```bash
# sudo 없이 npm 전역 설치 가능하도록 설정
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

**3. serverless offline 실행 안됨**
```bash
# serverless 재설치
npm install -g serverless

# 또는 로컬 설치 사용
npx serverless offline
```

**4. AWS 배포 권한 오류**
- AWS IAM에서 Lambda, DynamoDB, CloudFormation, API Gateway 권한 확인
- AdministratorAccess 정책이 있는지 확인 (개발 환경)

### 8.2 로그 확인

```bash
# 로컬 로그는 터미널에 출력

# AWS Lambda 로그 확인
serverless logs --function searchWeddingHalls --stage dev

# 실시간 로그 스트리밍
serverless logs --function searchWeddingHalls --stage dev --tail
```

## 📚 9단계: 추가 학습 자료

### Node.js 기본
- [Node.js 공식 문서](https://nodejs.org/ko/docs/)
- [JavaScript MDN](https://developer.mozilla.org/ko/docs/Web/JavaScript)

### Serverless Framework
- [Serverless Framework 문서](https://www.serverless.com/framework/docs)
- [AWS Lambda 가이드](https://docs.aws.amazon.com/lambda/)

### DynamoDB
- [DynamoDB 개발자 가이드](https://docs.aws.amazon.com/dynamodb/)

## 🎯 요약: 빠른 시작 체크리스트

```bash
# 1. Node.js 설치 확인
node --version

# 2. 프로젝트 클론
git clone https://github.com/yomeunmi/yomeunmi.git
cd yomeunmi
git checkout claude/wedding-planner-lambda-011CUesfYPrZHiYMNqmPJ5pf

# 3. 의존성 설치
npm install

# 4. 환경 변수 설정
cp .env.example .env

# 5. 로컬 실행
npm run offline

# 6. API 테스트
curl http://localhost:3000/api/wedding-halls

# 7. AWS 배포 (선택사항)
aws configure
npm run deploy:dev
```

## 💬 도움이 필요하신가요?

- 프로젝트 README: [README_KO.md](./README_KO.md)
- GitHub Issues: 프로젝트 저장소에서 이슈 생성
- AWS 공식 문서: https://docs.aws.amazon.com/

---

Spring 개발자로서 Node.js/Serverless 프로젝트를 처음 접하시는 분들께 도움이 되길 바랍니다! 🚀
