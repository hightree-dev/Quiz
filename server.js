import http from 'node:http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, 'utf8', (err, html) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    });    
  }
});

const port = 8000;
server.listen(port, () => console.log(`Server is running at http://localhost:${port}`));
