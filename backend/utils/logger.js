/**
 * Professional Logger Utility
 * Provides structured, colored, and timestamped logging for development and production
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  // Foreground colors
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  // Background colors
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgCyan: '\x1b[46m',
};

const getTimestamp = () => {
  const now = new Date();
  return `${now.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  })}.${now.getMilliseconds().toString().padStart(3, '0')}`;
};

const logger = {
  /**
   * Success log - green checkmark with message
   * Usage: logger.success('Database connected successfully')
   */
  success: (message, data = null) => {
    const timestamp = getTimestamp();
    const prefix = `${colors.green}${colors.bright}✅${colors.reset}`;
    console.log(`[${timestamp}] ${prefix} ${colors.green}${message}${colors.reset}`);
    if (data) {
      console.log(`   ${colors.dim}${JSON.stringify(data, null, 2)}${colors.reset}`);
    }
  },

  /**
   * Error log - red X with message
   * Usage: logger.error('Failed to fetch user', { userId: '123', error: err.message })
   */
  error: (message, data = null) => {
    const timestamp = getTimestamp();
    const prefix = `${colors.red}${colors.bright}❌${colors.reset}`;
    console.error(`[${timestamp}] ${prefix} ${colors.red}${message}${colors.reset}`);
    if (data) {
      console.error(`   ${colors.dim}${JSON.stringify(data, null, 2)}${colors.reset}`);
    }
  },

  /**
   * Warning log - yellow exclamation with message
   * Usage: logger.warn('Rate limit approaching', { remaining: 5 })
   */
  warn: (message, data = null) => {
    const timestamp = getTimestamp();
    const prefix = `${colors.yellow}${colors.bright}⚠️${colors.reset}`;
    console.warn(`[${timestamp}] ${prefix} ${colors.yellow}${message}${colors.reset}`);
    if (data) {
      console.warn(`   ${colors.dim}${JSON.stringify(data, null, 2)}${colors.reset}`);
    }
  },

  /**
   * Info log - blue info circle with message
   * Usage: logger.info('Processing user request', { userId: '123', action: 'update' })
   */
  info: (message, data = null) => {
    const timestamp = getTimestamp();
    const prefix = `${colors.blue}${colors.bright}ℹ️${colors.reset}`;
    console.log(`[${timestamp}] ${prefix} ${colors.blue}${message}${colors.reset}`);
    if (data) {
      console.log(`   ${colors.dim}${JSON.stringify(data, null, 2)}${colors.reset}`);
    }
  },

  /**
   * Debug log - cyan debug symbol with message
   * Usage: logger.debug('Database query', { query: 'SELECT...', params: [1, 2, 3] })
   */
  debug: (message, data = null) => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const timestamp = getTimestamp();
    const prefix = `${colors.cyan}${colors.bright}🔍${colors.reset}`;
    console.log(`[${timestamp}] ${prefix} ${colors.cyan}${message}${colors.reset}`);
    if (data) {
      console.log(`   ${colors.dim}${JSON.stringify(data, null, 2)}${colors.reset}`);
    }
  },

  /**
   * Trace log - white trace symbol for function entry/exit
   * Usage: logger.trace('getTenantUsers', 'ENTER', { tenantId: '123' })
   */
  trace: (functionName, event = 'CALL', data = null) => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const timestamp = getTimestamp();
    const symbol = event === 'ENTER' ? '→' : event === 'EXIT' ? '←' : '·';
    const prefix = `${colors.dim}${symbol} [${functionName}]${colors.reset}`;
    console.log(`[${timestamp}] ${prefix} ${colors.dim}${event}${colors.reset}`);
    if (data) {
      console.log(`      ${colors.dim}${JSON.stringify(data, null, 2)}${colors.reset}`);
    }
  },

  /**
   * HTTP request log - for middleware
   * Usage: logger.http('POST', '/api/users', 200, '45ms')
   */
  http: (method, path, statusCode, duration) => {
    const timestamp = getTimestamp();
    const methodColor = {
      'GET': colors.blue,
      'POST': colors.green,
      'PUT': colors.yellow,
      'PATCH': colors.yellow,
      'DELETE': colors.red,
    }[method] || colors.white;
    
    const statusColor = statusCode < 300 ? colors.green : statusCode < 400 ? colors.blue : statusCode < 500 ? colors.yellow : colors.red;
    
    console.log(
      `[${timestamp}] ${methodColor}${colors.bright}${method.padEnd(6)}${colors.reset} ` +
      `${path.padEnd(30)} ${statusColor}${statusCode}${colors.reset} ${colors.dim}${duration}${colors.reset}`
    );
  },

  /**
   * Database query log
   * Usage: logger.db('SELECT * FROM users', 'completed', 234)
   */
  db: (query, status, duration = null) => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const timestamp = getTimestamp();
    const statusColor = status === 'completed' ? colors.green : status === 'error' ? colors.red : colors.yellow;
    const prefix = `${colors.magenta}${colors.bright}🔗${colors.reset}`;
    
    let message = `${prefix} [${statusColor}${status}${colors.reset}]`;
    if (duration) {
      message += ` ${colors.dim}${duration}ms${colors.reset}`;
    }
    
    console.log(`[${timestamp}] ${message}`);
    console.log(`   ${colors.dim}${query}${colors.reset}`);
  },

  /**
   * Section separator for readability
   * Usage: logger.section('Server Startup')
   */
  section: (title) => {
    const line = '═'.repeat(50);
    console.log(`\n${colors.bright}${colors.cyan}${line}${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}  ${title}${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}${line}${colors.reset}\n`);
  },

  /**
   * API Response logger
   * Usage: logger.apiResponse('createUser', 201, { id: '123', email: 'user@example.com' })
   */
  apiResponse: (endpoint, statusCode, data = null) => {
    const timestamp = getTimestamp();
    const statusColor = statusCode < 300 ? colors.green : statusCode < 400 ? colors.blue : statusCode < 500 ? colors.yellow : colors.red;
    const prefix = `${colors.white}${colors.bright}📤${colors.reset}`;
    
    console.log(`[${timestamp}] ${prefix} ${endpoint} → ${statusColor}${statusCode}${colors.reset}`);
    if (data && process.env.NODE_ENV === 'development') {
      console.log(`   ${colors.dim}${JSON.stringify(data, null, 2).split('\n').join('\n   ')}${colors.reset}`);
    }
  },

  /**
   * API Request logger
   * Usage: logger.apiRequest('POST', '/api/users', { body: {...}, headers: {...} })
   */
  apiRequest: (method, path, data = null) => {
    const timestamp = getTimestamp();
    const methodColor = {
      'GET': colors.blue,
      'POST': colors.green,
      'PUT': colors.yellow,
      'PATCH': colors.yellow,
      'DELETE': colors.red,
    }[method] || colors.white;
    
    const prefix = `${colors.white}${colors.bright}📥${colors.reset}`;
    console.log(`[${timestamp}] ${prefix} ${methodColor}${method}${colors.reset} ${path}`);
    if (data && process.env.NODE_ENV === 'development') {
      console.log(`   ${colors.dim}${JSON.stringify(data, null, 2).split('\n').join('\n   ')}${colors.reset}`);
    }
  },
};

module.exports = logger;
