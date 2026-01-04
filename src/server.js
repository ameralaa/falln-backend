require('dotenv').config();

const http = require('http');
const express = require('express');
const { Server } = require('socket.io'); 

const app = require('./app');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// make io available in app
app.set('io', io);

// socket auth
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('Unauthorized'));
  }

  try {
    const jwt = require('jsonwebtoken');
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    socket.userId = payload.userId;
    next();
  } catch (err) {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', (socket) => {
  console.log('🔌 Socket connected:', socket.userId);

  socket.on('conversation:join', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
  });

  socket.on('message:delivered', async ({ messageIds }) => {
    const service = require('./modules/messages/messages.service');
    await service.markDelivered(messageIds, socket.userId);
  });
  socket.on('typing', ({ conversationId }) => {
  socket.to(`conversation_${conversationId}`).emit('typing', {
    userId: socket.userId
  });
});


  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected:', socket.userId);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
