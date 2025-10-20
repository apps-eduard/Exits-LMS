const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Get audit logs with filtering
 */
const getAuditLogs = async (req, res) => {
  try {
    const { days = '30', action, resource, user, search } = req.query;
    const daysNum = parseInt(days) || 30;

    logger.trace('getAuditLogs', 'ENTER', {
      days: daysNum,
      action,
      resource,
      user,
      search,
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
        'success' as status
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.created_at >= NOW() - INTERVAL '${daysNum} days'
    `;

    const params = [];

    if (user || search) {
      const searchTerm = user || search;
      params.push(`%${searchTerm}%`);
      query += ` AND (u.email ILIKE $${params.length} OR u.first_name ILIKE $${params.length} OR u.last_name ILIKE $${params.length})`;
    }

    if (action && action !== 'all') {
      params.push(action.toUpperCase());
      query += ` AND al.action = $${params.length}`;
    }

    if (resource && resource !== 'all') {
      params.push(resource.toUpperCase());
      query += ` AND al.resource = $${params.length}`;
    }

    query += ` ORDER BY al.created_at DESC LIMIT 1000`;

    const result = await db.query(query, params);

    logger.success('Fetched audit logs', {
      count: result.rows.length,
      filters: { days: daysNum, action, resource, user }
    });

    res.json({
      success: true,
      auditLogs: result.rows || [],
      count: result.rows.length
    });
  } catch (error) {
    logger.error('getAuditLogs', 'Failed to fetch audit logs', {
      error: error.message
    });
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

module.exports = {
  getAuditLogs
};
