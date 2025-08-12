const http = require('http');
const WebSocket = require('ws');
const { WebsocketProvider } = require('y-websocket');

const server = http.createServer((req, res) => { 
  res.writeHead(200); 
  res.end('y-websocket server running'); 
});

const wss = new WebSocket.Server({ server });

// Store active providers
const providers = new Map();

wss.on('connection', (conn, req) => {
  const url = req.url;
  
  if (!providers.has(url)) {
    // Create a new provider for this room
    const provider = new WebsocketProvider(
      wss,
      url,
      'live-blog-room',
      { WebSocketPolyfill: WebSocket }
    );
    providers.set(url, provider);
  }
  
  console.log('Client connected to room:', url);
});

const port = 1234;
server.listen(port, () => console.log('y-websocket server running on port', port));