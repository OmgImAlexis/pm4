let http = require('http');

let server = http.createServer((request, response) => {
  response.writeHead( 200, {'Content-Type': 'text/plain'});
  response.end('Hello World!!');
  process.exit(1);
});

server.listen(8000, () => {
  console.log("server started on 8000");
  process.send('ready');
});