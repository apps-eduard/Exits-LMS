const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./config/database');
const logger = require('./utils/logger');
const httpLogger = require('./middleware/httpLogger');
const { auditLoggerMiddleware } = require('./middleware/audit-logger');

// Import routes
const authRoutes = require('./routes/auth.routes');
const tenantRoutes = require('./routes/tenant.routes');
const customerRoutes = require('./routes/customer.routes');
const userRoutes = require('./routes/user.routes');
const settingsRoutes = require('./routes/settings.routes');
const roleRoutes = require('./routes/role.routes');
const menuRoutes = require('./routes/menu.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => {
    // Skip rate limiting for health checks
    if (req.path === '/health') return true;
    return false;
  }
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Logging
app.use(httpLogger);

// Audit Logger Middleware - logs all API actions
app.use(auditLoggerMiddleware);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/menus', menuRoutes);

// Direct permissions endpoint
const authMiddleware = require('./middleware/auth.middleware');
const roleController = require('./controllers/role.controller');
app.get('/api/permissions', authMiddleware, roleController.getAllPermissions);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Global error caught', {
    message: err.message,
    status: err.status || 500,
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
const startServer = async () => {
  try {
    logger.section('Server Startup');

    // Test database connection
    await db.query('SELECT NOW()');
    logger.success('Database connected successfully', {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
    });

    app.listen(PORT, () => {
      logger.success('Express server started', {
        port: PORT,
        environment: process.env.NODE_ENV,
        apiUrl: `http://localhost:${PORT}/api`,
        corsOrigin: process.env.FRONTEND_URL || 'http://localhost:4200',
      });
      logger.section('Ready for requests');
    });
  } catch (error) {
    logger.error('Failed to start server', {
      message: error.message,
      code: error.code,
    });
    process.exit(1);
  }
};

startServer();

module.exports = app;
