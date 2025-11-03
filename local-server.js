/**
 * 로컬 개발 서버
 * 프론트엔드 + 백엔드 API를 함께 제공
 */

const express = require('express');
const path = require('path');

// Lambda 핸들러 import
const searchHandlers = require('./src/handlers/search');

const app = express();
const PORT = 3000;

// CORS 설정
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// 정적 파일 제공 (프론트엔드)
app.use(express.static('public'));

// API 엔드포인트들
app.get('/api/wedding-halls', async (req, res) => {
  console.log('📍 API 호출: /api/wedding-halls');
  try {
    const event = { queryStringParameters: req.query };
    const result = await searchHandlers.weddingHalls(event);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/studios', async (req, res) => {
  console.log('📍 API 호출: /api/studios');
  try {
    const event = { queryStringParameters: req.query };
    const result = await searchHandlers.studios(event);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/dress', async (req, res) => {
  console.log('📍 API 호출: /api/dress');
  try {
    const event = { queryStringParameters: req.query };
    const result = await searchHandlers.dress(event);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/makeup', async (req, res) => {
  console.log('📍 API 호출: /api/makeup');
  try {
    const event = { queryStringParameters: req.query };
    const result = await searchHandlers.makeup(event);
    res.status(result.statusCode).json(JSON.parse(result.body));
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// SPA 라우팅 (모든 경로를 index.html로)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서버 시작
app.listen(PORT, () => {
  console.log('\n🎉 웨딩 플래너 로컬 서버 시작!\n');
  console.log(`📱 프론트엔드: http://localhost:${PORT}`);
  console.log(`🔌 백엔드 API: http://localhost:${PORT}/api/*`);
  console.log('\n사용 가능한 API:');
  console.log('  - GET /api/wedding-halls');
  console.log('  - GET /api/studios');
  console.log('  - GET /api/dress');
  console.log('  - GET /api/makeup');
  console.log('\n서버를 종료하려면 Ctrl+C를 누르세요.\n');
});
