const http = require('http');
const WebSocket = require('ws');

const server = http.createServer((req, res) => { 
  res.writeHead(200, { 'Content-Type': 'text/plain' }); 
  res.end('y-websocket server running'); 
});

const wss = new WebSocket.Server({ server });

// Store active connections by room
const rooms = new Map();

wss.on('connection', (ws, req) => {
  const url = req.url;
  
  if (!rooms.has(url)) {
    rooms.set(url, new Set());
  }
  
  const room = rooms.get(url);
  room.add(ws);
  
  console.log('Client connected to room:', url, 'Total connections:', room.size);
  
  // Send welcome message
  ws.send(JSON.stringify({
    type: 'connected',
    room: url,
    connections: room.size
  }));
  
  // Broadcast to other clients in the room
  room.forEach(client => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'user_joined',
        room: url,
        connections: room.size
      }));
    }
  });
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      // Broadcast message to all clients in the room
      room.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            ...data,
            timestamp: Date.now()
          }));
        }
      });
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  });
  
  ws.on('close', () => {
    room.delete(ws);
    console.log('Client disconnected from room:', url, 'Total connections:', room.size);
    
    // Broadcast user left message
    room.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'user_left',
          room: url,
          connections: room.size
        }));
      }
    });
    
    // Clean up empty rooms
    if (room.size === 0) {
      rooms.delete(url);
    }
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const port = process.env.PORT || 1234;
server.listen(port, () => {
  console.log(`WebSocket server running on port ${port}`);
  console.log('Available endpoints:');
  console.log(`- HTTP: http://localhost:${port}`);
  console.log(`- WebSocket: ws://localhost:${port}`);
});