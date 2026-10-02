export const registerLocationSocket = (io) => {
  io.on('connection', (socket) => {
    socket.on('join-request-room', (requestId) => {
      if (requestId) {
        socket.join(`service-request:${requestId}`);
      }
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
};

export default registerLocationSocket;
