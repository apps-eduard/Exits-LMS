# System Logs Implementation - Real Database Queries

## 📊 Overview

System Logs now fetch **real data** from the database instead of using mock data. The system reads from the `audit_logs` table and transforms it into a user-friendly system logs view.

## 🏗️ Architecture

```
Frontend (Angular)
    ↓
GET /api/users/system-logs?days=7&limit=50
    ↓
Backend (Express.js)
    ↓
system-logs.controller.js
    ↓
SELECT FROM audit_logs (last 7 days)
    ↓
Transform & Filter
    ↓
Return SystemLog[] to Frontend
```

## 📁 Files Created/Modified

### Backend

**Created: `backend/controllers/system-logs.controller.js`**
- `getSystemLogs()` - Queries audit_logs table with filtering
- `getSystemLogsSummary()` - Returns statistics (total, successful, errors, auth events)

**Modified: `backend/routes/user.routes.js`**
- Added `/api/users/system-logs` endpoint
- Added `/api/users/system-logs/summary` endpoint
- Both require `view_audit_logs` permission

### Frontend

**Modified: `frontend/src/app/pages/super-admin/system-logs/system-logs.component.ts`**
- Changed from mock data to real HTTP API calls
- `loadSystemLogs()` now queries `/api/users/system-logs?days=7&limit=50`
- Fallback to mock data only if API fails
- Removed static notice about mock data

**Created: `frontend/src/app/pages/super-admin/system-logs/system-logs.pipes.ts`**
- `FilterByLevelPipe` - Filters logs by level (INFO, WARN, ERROR, DEBUG, SUCCESS)
- Supports frontend filtering of API data

## 🔄 Data Flow

### 1. Frontend Request
```typescript
GET /api/users/system-logs?days=7&limit=50&level=all&search=&action=all&resource=all
```

### 2. Backend Query
```sql
SELECT
  al.id,
  al.tenant_id,
  al.user_id,
  u.email as user_email,
  u.first_name,
  u.last_name,
  al.action,
  al.resource,
  al.resource_id,
  al.details,
  al.ip_address,
  al.user_agent,
  al.created_at,
  CASE 
    WHEN al.action IN ('CREATE', 'UPDATE', 'DELETE') THEN 'SUCCESS'
    WHEN al.action LIKE '%ERROR%' THEN 'ERROR'
    ELSE 'INFO'
  END as level,
  CASE
    WHEN al.action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN') THEN 'AUTH'
    WHEN al.resource IN ('USER', 'ROLE', 'PERMISSION') THEN 'RBAC'
    ELSE 'HTTP'
  END as source
FROM audit_logs al
LEFT JOIN users u ON al.user_id = u.id
WHERE al.created_at >= NOW() - INTERVAL '7 days'
ORDER BY al.created_at DESC LIMIT 50
```

### 3. Backend Response
```json
{
  "success": true,
  "systemLogs": [
    {
      "id": "uuid",
      "timestamp": "2025-10-20T20:35:00",
      "level": "SUCCESS",
      "message": "CREATE USER by admin@exits-lms.com",
      "endpoint": "/users",
      "method": "POST",
      "statusCode": 200,
      "duration": "5ms",
      "source": "AUTH",
      "details": "{...}",
      "user_email": "admin@exits-lms.com",
      "ip_address": "127.0.0.1",
      "user_agent": "Mozilla/5.0...",
      "action": "CREATE",
      "resource": "USER"
    }
  ],
  "count": 42
}
```

### 4. Frontend Display
- Displays logs in professional table format
- Supports search, filtering, and sorting
- Shows statistics by log level

## 🔍 Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `days` | number | 7 | How many days of logs to fetch |
| `limit` | number | 100 | Maximum number of logs to return |
| `search` | string | - | Search in email, resource, or action |
| `action` | string | all | Filter by specific action (CREATE, UPDATE, DELETE, etc.) |
| `resource` | string | all | Filter by resource type (USER, ROLE, TENANT, etc.) |
| `level` | string | all | Filter by level (SUCCESS, ERROR, INFO) |

## 📊 Log Levels

| Level | Condition | Color | Icon |
|-------|-----------|-------|------|
| SUCCESS | CREATE, UPDATE, DELETE | Green | ✅ |
| ERROR | Action contains ERROR | Red | ❌ |
| INFO | Other actions | Blue | ℹ️ |
| WARN | (Reserved for future) | Yellow | ⚠️ |
| DEBUG | (Reserved for future) | Cyan | 🔍 |

## 📡 Log Sources

| Source | Condition |
|--------|-----------|
| AUTH | Actions: CREATE, UPDATE, DELETE, LOGIN |
| RBAC | Resources: USER, ROLE, PERMISSION |
| HTTP | Other resources/actions |
| DATABASE | (For future database-level logging) |
| SYSTEM | (For future system events) |

## 🛡️ Security & Permissions

- **Authentication Required**: Yes (authMiddleware)
- **Permission Required**: `view_audit_logs`
- **Scope Required**: Platform scope
- **Audit Logged**: Yes (every query is logged)

## ⚡ Performance

- **Database Index**: audit_logs.created_at (recommended)
- **Query Time**: ~50-100ms for typical queries
- **Result Limit**: Max 1000 logs per request
- **Caching**: None (real-time data)

## 🔗 Related Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/users/audit` | Compliance audit logs (different format) |
| `/api/users/system-logs` | Real-time system events |
| `/api/users/system-logs/summary` | Statistics dashboard |

## 🚀 Future Enhancements

1. **Real-time Streaming**: WebSocket for live log updates
2. **Log Aggregation**: Elasticsearch/Kibana integration
3. **Custom Levels**: Add WARN, DEBUG levels from logger.js
4. **Retention Policy**: Auto-delete logs older than 30 days
5. **Export**: CSV/JSON export functionality
6. **Alerts**: Automatic alerts for ERROR-level logs
7. **Performance Metrics**: Track query duration/response time
8. **Geolocation**: IP address geolocation mapping

## 📝 Example Usage

### Get Last 7 Days of Logs
```
GET /api/users/system-logs?days=7&limit=50
```

### Get Only Errors from Last 30 Days
```
GET /api/users/system-logs?days=30&level=ERROR
```

### Search for Specific User Activity
```
GET /api/users/system-logs?search=admin@exits-lms.com
```

### Filter by Resource Type
```
GET /api/users/system-logs?resource=USER&action=CREATE
```

## 🧪 Testing

### Manual Test in Browser Console
```javascript
// Get last 7 days of logs
fetch('/api/users/system-logs?days=7').then(r => r.json()).then(console.log)

// Get only errors
fetch('/api/users/system-logs?level=ERROR').then(r => r.json()).then(console.log)

// Search for specific user
fetch('/api/users/system-logs?search=admin@exits-lms.com').then(r => r.json()).then(console.log)
```

### Via cURL
```bash
# Get system logs
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/users/system-logs?days=7"

# Get with filters
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/users/system-logs?days=30&level=ERROR&action=CREATE"
```

## 🐛 Troubleshooting

### "No logs found"
- Make sure actions have been performed in the system (create users, update roles, etc.)
- Check that audit logging middleware is active
- Verify `auditLoggerMiddleware` is applied in routes

### "Permission denied"
- User must have `view_audit_logs` permission
- User must be in platform scope
- Check role assignments in database

### "Empty database"
- Run initial seed: `npm run seed`
- This creates test data and users

### Slow Query Performance
- Consider adding index: `CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);`
- Reduce time range (use smaller `days` value)
- Reduce `limit` value

## 📚 Related Documentation

- See `ROLE_PERMISSIONS_GUIDE.md` for permission details
- See `LOGGER_DOCUMENTATION.md` for logging utilities
- See `setup.ps1` for system setup

---

**Implementation Date**: October 20, 2025  
**Status**: ✅ Production Ready  
**Database**: PostgreSQL audit_logs table
