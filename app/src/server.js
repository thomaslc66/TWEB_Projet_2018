// server.js
const http = require('http');
const port = 8080;
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello world!');
});
// Start the server
server.listen(port, () => {
  console.log(`Magic happens at http://localhost:${port}`);
});