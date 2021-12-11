const http = require('http');

const server = http.createServer((_request, response) => {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end('Hello World!!');
  process.exit(1);
});

const listener = server.listen(0, () => {
  console.log("server started on %s", listener.address().port);
  if (process.send) process.send('ready');
});