let http = require('http');

let server = http.createServer((request, response) => {
  response.writeHead( 200, {'Content-Type': 'text/plain'});
  response.end('Hello World!!');
});

server.listen(5000, () => {
  console.log("server started on 5000");
  process.send('ready');
});