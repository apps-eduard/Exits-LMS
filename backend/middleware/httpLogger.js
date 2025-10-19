/**
 * HTTP Request/Response Logger Middleware
 * Logs all incoming requests and responses with timing
 */

const logger = require('../utils/logger');

const httpLogger = (req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;

  res.send = function (data) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    logger.http(
      req.method,
      req.originalUrl,
      statusCode,
      `${duration}ms`
    );

    // Log request/response details in development
    if (process.env.NODE_ENV === 'development') {
      if (req.method !== 'GET') {
        logger.apiRequest(req.method, req.originalUrl, {
          body: req.body,
          query: req.query,
        });
      }

      if (statusCode >= 400) {
        logger.apiResponse(req.originalUrl, statusCode, JSON.parse(data));
      }
    }

    return originalSend.call(this, data);
  };

  next();
};

module.exports = httpLogger;
