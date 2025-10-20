const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Get system logs from audit_logs table
 * System logs are filtered to show application-level events
 */
const getSystemLogs = async (req, res) => {
  try {
    const { days = '7', action, resource, level, search, limit = '100' } = req.query;
    const daysNum = parseInt(days) || 7;
    const limitNum = parseInt(limit) || 100;

    logger.trace('getSystemLogs', 'ENTER', {
      days: daysNum,
      action,
      resource,
      level,
      search,
      limit: limitNum,
      requestedBy: req.user?.id
    });

    let query = `
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
      WHERE al.created_at >= NOW() - INTERVAL '${daysNum} days'
    `;

    const params = [];

    // Search filter
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (u.email ILIKE $${params.length} OR al.resource ILIKE $${params.length} OR al.action ILIKE $${params.length})`;
    }

    // Action filter
    if (action && action !== 'all') {
      params.push(action.toUpperCase());
      query += ` AND al.action = $${params.length}`;
    }

    // Resource filter
    if (resource && resource !== 'all') {
      params.push(resource.toUpperCase());
      query += ` AND al.resource = $${params.length}`;
    }

    // Level filter
    if (level && level !== 'all') {
      if (level === 'SUCCESS') {
        query += ` AND al.action IN ('CREATE', 'UPDATE', 'DELETE')`;
      } else if (level === 'ERROR') {
        query += ` AND al.action LIKE '%ERROR%'`;
      } else if (level === 'INFO') {
        query += ` AND al.action NOT IN ('CREATE', 'UPDATE', 'DELETE') AND al.action NOT LIKE '%ERROR%'`;
      }
    }

    query += ` ORDER BY al.created_at DESC LIMIT ${limitNum}`;

    const result = await db.query(query, params);

    // Transform results to match SystemLog interface
    const transformedLogs = result.rows.map(row => ({
      id: row.id,
      timestamp: row.created_at,
      level: row.level,
      message: `${row.action} ${row.resource}${row.user_email ? ' by ' + row.user_email : ''}`,
      endpoint: row.resource_id ? `/${row.resource.toLowerCase()}/${row.resource_id}` : `/${row.resource.toLowerCase()}`,
      method: row.action === 'DELETE' ? 'DELETE' : row.action === 'CREATE' ? 'POST' : 'PUT',
      statusCode: 200,
      duration: '5ms',
      source: row.source,
      details: row.details ? (typeof row.details === 'string' ? row.details : JSON.stringify(row.details)) : null,
      user_email: row.user_email,
      ip_address: row.ip_address,
      user_agent: row.user_agent,
      action: row.action,
      resource: row.resource
    }));

    logger.success('Fetched system logs', {
      count: transformedLogs.length,
      filters: { days: daysNum, action, resource, level, search }
    });

    res.json({
      success: true,
      systemLogs: transformedLogs,
      count: transformedLogs.length
    });
  } catch (error) {
    logger.error('getSystemLogs', 'Failed to fetch system logs', {
      error: error.message
    });
    res.status(500).json({ error: 'Failed to fetch system logs' });
  }
};

/**
 * Get summary statistics about system logs
 */
const getSystemLogsSummary = async (req, res) => {
  try {
    const { days = '7' } = req.query;
    const daysNum = parseInt(days) || 7;

    const result = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN al.action IN ('CREATE', 'UPDATE', 'DELETE') THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN al.action LIKE '%ERROR%' THEN 1 ELSE 0 END) as errors,
        SUM(CASE WHEN al.action IN ('LOGIN', 'LOGIN_FAILED') THEN 1 ELSE 0 END) as auth_events
      FROM audit_logs al
      WHERE al.created_at >= NOW() - INTERVAL '${daysNum} days'
    `);

    res.json({
      success: true,
      summary: result.rows[0]
    });
  } catch (error) {
    logger.error('getSystemLogsSummary', 'Failed to fetch system logs summary', {
      error: error.message
    });
    res.status(500).json({ error: 'Failed to fetch system logs summary' });
  }
};

module.exports = {
  getSystemLogs,
  getSystemLogsSummary
};
