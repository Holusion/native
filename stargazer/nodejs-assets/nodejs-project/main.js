const http = require('http');

const rn_bridge = require('rn-bridge');

// Echo every message received from react-native.
rn_bridge.channel.on('message', (msg) => {
  rn_bridge.channel.send(msg);
} );

// Inform react-native node is initialized.
rn_bridge.channel.send("Node was initialized.");

const port = 8080;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.write('Hello World');
  res.end();
}).listen(port);