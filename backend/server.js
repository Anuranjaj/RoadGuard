import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import app from './src/app.js';
import connectDB, { isDbAvailable } from './src/config/db.js';
import { seedServiceCategories } from './src/controllers/serviceController.js';

dotenv.config();

async function startServer() {
  try {
    await connectDB();
    if (await isDbAvailable()) {
      await seedServiceCategories();
    }
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
      },
    });

    app.set('io', io);

    io.on('connection', (socket) => {
      socket.on('join-request-room', (requestId) => {
        if (requestId) socket.join(`service-request:${requestId}`);
      });

      socket.on('partner:location:update', ({ requestId, latitude, longitude, timestamp }) => {
        if (!requestId || !latitude || !longitude) return;
        io.to(`service-request:${requestId}`).emit('partner:location:update', {
          requestId,
          latitude,
          longitude,
          timestamp: timestamp || Date.now(),
        });
      });
    });

    const port = process.env.PORT || 5000;
    server.listen(port, () => {
      console.log(`RoadGuard API running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

startServer();
