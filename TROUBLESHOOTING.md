# 문제 해결 가이드 (Troubleshooting)

## npm 설치 오류 해결

### 1️⃣ EACCES 권한 오류 (macOS/Linux)

**오류 메시지:**
```
npm error code EACCES
npm error syscall mkdir
npm error path /Users/xxx/.npm/_cacache/...
npm error errno EACCES
npm error permission denied, mkdir '...'
```

**원인:**
- npm 캐시 디렉토리에 잘못된 권한이 설정됨
- sudo로 npm을 실행한 적이 있어서 발생

**해결 방법:**

#### 방법 1: npm 캐시 정리 및 권한 수정 (권장)

```bash
# IntelliJ 터미널에서 실행 (sudo 비밀번호 입력 필요)

# 1. npm 캐시 정리
sudo npm cache clean --force

# 2. npm 캐시 디렉토리 소유권 변경
sudo chown -R $(whoami) ~/.npm

# 3. 재설치
npm install
```

#### 방법 2: 캐시 디렉토리 삭제 후 재생성

```bash
# 1. 캐시 디렉토리 삭제
sudo rm -rf ~/.npm

# 2. 재설치 (캐시 자동 재생성)
npm install
```

#### 방법 3: 권한 문제 우회 (임시 방법)

```bash
# --force 옵션으로 설치
npm install --force --legacy-peer-deps
```

### 2️⃣ ERESOLVE 의존성 충돌 오류

**오류 메시지:**
```
npm error code ERESOLVE
npm error ERESOLVE unable to resolve dependency tree
```

**해결 방법:**

```bash
# 프로젝트에 .npmrc 파일이 있는지 확인
cat .npmrc

# .npmrc가 없다면 생성
echo "legacy-peer-deps=true" > .npmrc

# 재설치
npm install
```

### 3️⃣ 네트워크 오류

**오류 메시지:**
```
npm error network request failed
npm error ETIMEDOUT
```

**해결 방법:**

```bash
# npm 레지스트리 확인
npm config get registry

# 기본 레지스트리로 설정
npm config set registry https://registry.npmjs.org/

# 재시도
npm install
```

### 4️⃣ Node 버전 호환성 문제

**증상:**
- 설치는 되지만 실행 시 오류
- "node: --openssl-legacy-provider is not allowed" 오류

**해결 방법:**

```bash
# Node.js 버전 확인 (18.x 권장)
node --version

# Node.js 18.x가 아니라면 업데이트
# macOS (Homebrew)
brew install node@18
brew link --overwrite node@18

# 또는 공식 사이트에서 다운로드
# https://nodejs.org/ko/
```

---

## macOS 사용자를 위한 완전한 해결책

### 문제가 반복된다면: npm 글로벌 디렉토리 변경 (권장)

sudo 없이 npm을 사용하도록 설정하면 권한 문제가 완전히 해결됩니다.

```bash
# 1. npm 글로벌 디렉토리 생성
mkdir ~/.npm-global

# 2. npm이 새 디렉토리를 사용하도록 설정
npm config set prefix '~/.npm-global'

# 3. 환경 변수 추가 (zsh 사용 시)
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

# bash 사용 시
# echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bash_profile
# source ~/.bash_profile

# 4. 기존 캐시 정리
rm -rf ~/.npm
npm cache clean --force

# 5. 프로젝트로 돌아가서 재설치
cd /path/to/yomeunmi
npm install
```

---

## IntelliJ 사용자를 위한 팁

### IntelliJ 터미널에서 sudo 사용하기

```bash
# IntelliJ 터미널에서 sudo 명령 실행 시 비밀번호 입력
sudo npm cache clean --force
# [비밀번호 입력]

sudo chown -R $(whoami) ~/.npm
# [비밀번호 입력]
```

### IntelliJ가 아닌 macOS 터미널에서 실행

1. **Spotlight 검색** (⌘ + Space)
2. "터미널" 또는 "Terminal" 입력
3. 터미널에서 프로젝트 디렉토리로 이동:
   ```bash
   cd ~/path/to/yomeunmi
   ```
4. 위의 해결 방법 실행

---

## 빠른 해결 체크리스트 ✅

**EACCES 권한 오류 발생 시:**

```bash
# 1단계: 캐시 정리 (비밀번호 입력 필요)
sudo npm cache clean --force

# 2단계: 소유권 변경
sudo chown -R $(whoami) ~/.npm

# 3단계: 재설치
npm install

# 만약 여전히 안된다면
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# 최후의 수단
sudo rm -rf ~/.npm
npm install --force
```

---

## 설치 성공 확인

설치가 성공하면 다음과 같은 메시지가 표시됩니다:

```
added 523 packages, and audited 524 packages in 25s

52 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

**설치 성공 후:**

```bash
# 로컬 서버 실행
npm run offline

# 브라우저에서 테스트
# http://localhost:3000/dev/api/wedding-halls
```

---

## 여전히 문제가 해결되지 않나요?

다음 정보와 함께 문의해주세요:

1. **Node.js 버전:**
   ```bash
   node --version
   ```

2. **npm 버전:**
   ```bash
   npm --version
   ```

3. **운영체제:**
   ```bash
   sw_vers  # macOS
   ```

4. **전체 오류 로그:**
   ```bash
   cat /Users/yeom/.npm/_logs/[최신-로그-파일].log
   ```

---

## 참고 자료

- [npm 공식 문서 - 권한 오류 해결](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)
- [Node.js 공식 다운로드](https://nodejs.org/ko/)
- [npm GitHub Issues](https://github.com/npm/cli/issues)
