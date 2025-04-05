import dotenv from 'dotenv';
import http from 'http';
import { app } from './app.js';
import connectDB from './db/db.js';
import { setupWebSocket } from './webSocket/wsServer.js';

dotenv.config({ path: './.env' });

const PORT = process.env.PORT || 5000;
const server = http.createServer(app); // manually create HTTP server

connectDB()
  .then(() => {
    setupWebSocket(server); // attach WebSocket
    server.listen(PORT, () => {
      console.log(`Server (HTTP + WebSocket) listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err);
  });
