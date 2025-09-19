const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(express.json());

// Create Socket.IO server with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Verify auth token if provided
  const { token } = socket.handshake.auth;
  if (token) {
    console.log('Authenticated with token:', token);
  }

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// REST API route to send events to clients
app.post('/send-event', (req, res) => {
  try {
    const { event, data } = req.body;

    // Validate required fields
    if (!event) {
      return res.status(400).json({
        error: 'Missing required field: event',
      });
    }

    // Broadcast event to all connected clients
    io.emit(event, data || {});

    console.log(`Event "${event}" sent to all clients with data:`, data);

    res.json({
      success: true,
      message: `Event "${event}" sent to ${io.engine.clientsCount} connected clients`,
      clientsCount: io.engine.clientsCount,
    });
  } catch (error) {
    console.error('Error sending event:', error);
    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

// Start server
const PORT = process.env.PORT || 8081;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
  console.log('Press "n" + Enter to send a test notification');
});

// Error handling
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});
