import http from 'node:http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

sqlite3.verbose();
const db = new sqlite3.Database('./quiz.db');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const server = http.createServer((req, res) => {
  if (req.url === '/') {
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, 'utf8', (err, html) => {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    });
  } else if (req.url === '/quiz') {
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        const quiz = JSON.parse(body);

        const { question, answer } = quiz;

        if (question && answer) {
          db.run('INSERT INTO quiz (question, answer) VALUES (?, ?)', [question, answer], function (err) {
            if (err) {
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              res.end('Failed to add quiz');
              console.error(err);
            } else {
              console.log(this);
              res.writeHead(201, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ id: this.lastID }));
            }
          });
        } else {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Invalid quiz data');
        }
      });
    }
  } else if (req.url === '/quizzes') {
    if (req.method === 'GET') {
      db.all('SELECT * FROM quiz', (err, rows) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          console.error(err);
          return;
        }
        if (rows.length > 0) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(rows));
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('No quizzes found');
        }
      });
    }
  } else if (req.url.startsWith('/quiz/')) {
    const quizId = parseInt(req.url.split('/')[2]);
    if (req.method == 'GET') {
      if (quizId === -1) {
        db.get('SELECT * FROM quiz ORDER BY id DESC LIMIT 1', (err, row) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            console.error(err);
            return;
          }
          if (row) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(row));
          } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Quiz not found');
          }
        });
      }
      else if (quizId){
        db.get('SELECT * FROM quiz WHERE id = ?', [quizId], (err, row) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
            console.error(err);
            return;
          }
          if (row) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(row));
          } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Quiz not found');
          }
        });
      }
      else {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid quizId');
      }
    }
  }
});

const port = 8000;
server.listen(port, () => console.log(`Server is running at http://localhost:${port}`));
