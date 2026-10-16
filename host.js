const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];

  // Route root to 2010.html or index.html
  if (reqPath === '/' || reqPath === '') {
    reqPath = fs.existsSync(path.join(__dirname, '2010.html')) ? '/2010.html' : '/index.html';
  }

  let filePath = path.join(__dirname, reqPath);

  // Fallback aliases for common file names
  if (!fs.existsSync(filePath)) {
    if (reqPath === '/style.css' && fs.existsSync(path.join(__dirname, '2010style.css'))) {
      filePath = path.join(__dirname, '2010style.css');
    } else if (reqPath === '/script.js' && fs.existsSync(path.join(__dirname, 'setting.js'))) {
      filePath = path.join(__dirname, 'setting.js');
    } else if (reqPath === '/index.html' && fs.existsSync(path.join(__dirname, '2010.html'))) {
      filePath = path.join(__dirname, '2010.html');
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const isText = contentType.startsWith('text/') || contentType.includes('javascript') || contentType.includes('json');

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found: ' + reqPath);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Server Error: ' + err.code);
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});