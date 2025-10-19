# Backend Logger Documentation

## Overview

The new logger provides professional, color-coded, structured logging for development and production environments.

## Logger Methods

### 1. **logger.success(message, data?)**
✅ Success logs in green
```javascript
logger.success('Database connected successfully', {
  host: 'localhost',
  database: 'exits_lms',
});
```

### 2. **logger.error(message, data?)**
❌ Error logs in red
```javascript
logger.error('Failed to fetch users', {
  message: error.message,
  code: error.code,
  userId: req.params.id,
});
```

### 3. **logger.warn(message, data?)**
⚠️ Warning logs in yellow
```javascript
logger.warn('User not found', { userId: id });
logger.warn('Rate limit approaching', { remaining: 5 });
```

### 4. **logger.info(message, data?)**
ℹ️ Info logs in blue
```javascript
logger.info('Processing user request', {
  userId: '123',
  action: 'update',
});
```

### 5. **logger.debug(message, data?)**
🔍 Debug logs in cyan (development only)
```javascript
logger.debug('Database query', {
  query: 'SELECT * FROM users WHERE id = $1',
  params: [123],
});
```

### 6. **logger.trace(functionName, event, data?)**
Trace function entry/exit (development only)
```javascript
logger.trace('getUserById', 'ENTER', { userId: '123' });
// ... function logic ...
logger.trace('getUserById', 'EXIT', { success: true });
```

### 7. **logger.http(method, path, statusCode, duration)**
HTTP request/response logging
```javascript
logger.http('POST', '/api/users', 201, '45ms');
logger.http('GET', '/api/customers/123', 200, '12ms');
```

### 8. **logger.db(query, status, duration?)**
Database query logging (development only)
```javascript
logger.db('SELECT * FROM users LIMIT 10', 'completed', 234);
logger.db('INSERT INTO users ...', 'error', 1500);
```

### 9. **logger.section(title)**
Section separator for readability
```javascript
logger.section('Server Startup');
logger.section('User Management Routes');
```

### 10. **logger.apiResponse(endpoint, statusCode, data?)**
API response logging
```javascript
logger.apiResponse('createUser', 201, {
  id: '123',
  email: 'user@example.com',
});
```

### 11. **logger.apiRequest(method, path, data?)**
API request logging
```javascript
logger.apiRequest('POST', '/api/users', {
  body: { email: 'user@example.com' },
  query: {},
});
```

## Usage Examples

### In Controllers

```javascript
const logger = require('../utils/logger');

const getUserById = async (req, res) => {
  try {
    logger.trace('getUserById', 'ENTER', { userId: req.params.id });
    
    const result = await db.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      logger.warn('User not found', { userId: req.params.id });
      return res.status(404).json({ error: 'User not found' });
    }
    
    logger.success('User fetched successfully', {
      userId: result.rows[0].id,
      email: result.rows[0].email,
    });
    
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    logger.error('Failed to fetch user', {
      message: error.message,
      userId: req.params.id,
    });
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};
```

### In Middleware

```javascript
const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(req.method, req.originalUrl, res.statusCode, `${duration}ms`);
  });
  
  next();
};
```

### In Routes

```javascript
const logger = require('../utils/logger');

router.post('/users', async (req, res) => {
  try {
    logger.apiRequest('POST', '/api/users', req.body);
    
    const result = await createUser(req.body);
    
    logger.apiResponse('createUser', 201, result);
    res.status(201).json({ success: true, user: result });
  } catch (error) {
    logger.error('Failed to create user', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});
```

## Output Examples

### Success
```
[14:32:45.123] ✅ User fetched successfully
   {
     "userId": "8e311f34-39b1-406a-ac8d-69a0bff4a85f",
     "email": "user@example.com",
     "role": "user"
   }
```

### Error
```
[14:32:46.456] ❌ Failed to fetch user
   {
     "message": "query error: no rows returned",
     "userId": "invalid-id",
     "code": "EQUERY"
   }
```

### HTTP
```
[14:32:47.789] POST   /api/users/123/edit           201 45ms
```

### Database
```
[14:32:48.012] 🔗 [completed] 234ms
   SELECT * FROM users WHERE tenant_id = $1 LIMIT 10
```

## Environment Variables

- **NODE_ENV**: Set to `development` to enable debug, trace, and database logs
- **NODE_ENV**: Set to `production` to show only success, error, warn, and info logs

## Best Practices

1. **Always log entry/exit** for important functions in development:
   ```javascript
   logger.trace('functionName', 'ENTER', { params });
   // ... logic ...
   logger.trace('functionName', 'EXIT', { result });
   ```

2. **Log errors with context**:
   ```javascript
   logger.error('Operation failed', {
     message: error.message,
     userId: userId,
     action: 'update',
     code: error.code,
   });
   ```

3. **Log success with important data**:
   ```javascript
   logger.success('User created', {
     userId: user.id,
     email: user.email,
     role: user.role_name,
   });
   ```

4. **Use sections for clarity**:
   ```javascript
   logger.section('User Authentication');
   // ... auth logic ...
   logger.section('User Creation');
   // ... creation logic ...
   ```

5. **Log API responses**:
   ```javascript
   logger.apiResponse('getUsers', 200, {
     count: results.length,
     limit: query.limit,
   });
   ```

## Color Reference

- 🟢 **Green**: Success, ✅
- 🔴 **Red**: Error, ❌
- 🟡 **Yellow**: Warning, ⚠️
- 🔵 **Blue**: Info, ℹ️
- 🔷 **Cyan**: Debug, 🔍
- ⚪ **Dim**: Trace, HTTP timing

## Performance

- Minimal overhead in production (only success, error, warn, info)
- Debug, trace, and database logs disabled in production
- JSON serialization for complex objects only when needed
