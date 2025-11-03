const fs = require('fs');
const path = require('path');
const { buildResponse } = require('../utils/response');

// MIME 타입 매핑
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

/**
 * 정적 파일 서빙 핸들러
 */
module.exports.serveStatic = async (event) => {
  try {
    // 요청된 경로 파싱
    let requestPath = event.path || '/';

    // 루트 경로면 index.html 반환
    if (requestPath === '/' || requestPath === '') {
      requestPath = '/index.html';
    }

    // public 폴더 기준으로 파일 경로 생성
    const filePath = path.join(__dirname, '../../public', requestPath);

    // 파일 존재 여부 확인
    if (!fs.existsSync(filePath)) {
      return buildResponse(404, { message: 'File not found' });
    }

    // 파일 읽기
    const fileContent = fs.readFileSync(filePath);

    // MIME 타입 결정
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // 바이너리 파일 여부 확인
    const isBinary = ['.png', '.jpg', '.jpeg', '.gif', '.ico'].includes(ext);

    // 응답 반환
    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600'
      },
      body: isBinary ? fileContent.toString('base64') : fileContent.toString(),
      isBase64Encoded: isBinary
    };

  } catch (error) {
    console.error('Error serving static file:', error);
    return buildResponse(500, {
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * SPA 라우팅 핸들러 (모든 경로를 index.html로 라우팅)
 */
module.exports.serveSPA = async (event) => {
  try {
    // API 경로가 아닌 경우에만 index.html 반환
    if (event.path && event.path.startsWith('/api/')) {
      return buildResponse(404, { message: 'API endpoint not found' });
    }

    const indexPath = path.join(__dirname, '../../public/index.html');

    if (!fs.existsSync(indexPath)) {
      return buildResponse(404, { message: 'index.html not found' });
    }

    const indexContent = fs.readFileSync(indexPath, 'utf-8');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      },
      body: indexContent
    };

  } catch (error) {
    console.error('Error serving SPA:', error);
    return buildResponse(500, {
      message: 'Internal server error',
      error: error.message
    });
  }
};
