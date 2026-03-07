const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const initDatabase = require('./config/db-setup');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const flatRoutes = require('./routes/flatRoutes');
const houseRoutes = require('./routes/houseRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const engagementRoutes = require('./routes/engagementRoutes');
const chatRoutes = require('./routes/chatRoutes');
const supportRoutes = require('./routes/supportRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const aiBrokerRoutes = require('./routes/aiBrokerRoutes');

const app = express();

// Middleware
// Configure CORS using CORS_ORIGINS env var (comma-separated list).
// Example: CORS_ORIGINS=http://localhost:3000,https://example.com
const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map(s => s.trim()) : ['http://localhost:5173'];
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin like Postman/curl or same-origin server-to-server
    if (!origin) return callback(null, true);
    if (corsOrigins.includes('*') || corsOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(process.env.NODE_ENV === 'production' ? morgan('combined') : morgan('dev')); // Added morgan middleware
app.use(express.json({ limit: '50mb' })); // Changed limit to 50mb
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Changed limit to 50mb

// Serve uploads statically
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/flats', flatRoutes);
app.use('/api/houses', houseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/engagement', engagementRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ai-broker', aiBrokerRoutes);


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const http = require('http');
const { Server } = require('socket.io');
const chatHandler = require('./sockets/chatHandler');

// Initialize database and start server
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Socket.io initialization
const io = new Server(server, {
  cors: corsOptions
});

// B21: Add JWT authentication middleware to Socket.io
io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set');
    return next(new Error('Internal server error'));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error: Invalid token'));
    socket.userId = decoded.userId;
    next();
  });
});

io.on('connection', (socket) => {
  chatHandler(io, socket);
});

(async () => {
  try {
    // Initialize MongoDB connection
    await initDatabase();
    console.log('✓ Database initialized (MongoDB)');

    // Start server
    server.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ API endpoints available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();

module.exports = { app, server, io };
