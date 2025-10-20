/**
 * Audit Logger Middleware
 * Automatically logs all significant user actions in the system
 */

const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Log an audit event
 * @param {Object} options - Audit logging options
 * @param {string} options.action - Action performed (create, read, update, delete, etc.)
 * @param {string} options.resource - Resource type (user, tenant, loan, customer, etc.)
 * @param {string} options.resourceId - ID of the resource affected
 * @param {Object} options.user - User performing the action { id, email, scope, roleId }
 * @param {Object} options.details - Additional details about the action
 * @param {string} options.ipAddress - IP address of the request
 * @param {string} options.userAgent - User agent string
 * @param {string} options.tenantId - Tenant ID (optional, extracted from user if not provided)
 * @returns {Promise<void>}
 */
const logAudit = async (options) => {
  try {
    const {
      action,
      resource,
      resourceId,
      user,
      details = {},
      ipAddress,
      userAgent,
      tenantId
    } = options;

    if (!action || !resource || !user?.id) {
      logger.warn('Audit', 'Missing required fields', { action, resource, userId: user?.id });
      return;
    }

    // Get tenant ID from user's scope or use provided tenantId
    const contextTenantId = tenantId || user.tenantId || null;

    await db.query(
      `INSERT INTO audit_logs (tenant_id, user_id, action, resource, resource_id, details, ip_address, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        contextTenantId,
        user.id,
        action.toUpperCase(),
        resource.toUpperCase(),
        resourceId || null,
        JSON.stringify(details),
        ipAddress || null,
        userAgent || null
      ]
    );

    logger.debug('Audit', `${action} on ${resource}`, {
      userId: user.id,
      userEmail: user.email,
      resource,
      resourceId,
      action,
      details
    });
  } catch (error) {
    logger.error('Audit', 'Failed to log audit event', {
      error: error.message,
      action: options.action,
      resource: options.resource
    });
    // Don't throw - audit logging should not break the operation
  }
};

/**
 * Middleware to inject audit logging function into requests
 */
const auditLoggerMiddleware = (req, res, next) => {
  req.auditLog = async (action, resource, resourceId = null, details = {}) => {
    await logAudit({
      action,
      resource,
      resourceId,
      user: req.user,
      details,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      tenantId: req.user?.tenantId
    });
  };

  next();
};

/**
 * Get audit logs with filtering
 * @param {Object} options - Query options
 * @param {number} options.days - Days of history to retrieve
 * @param {string} options.action - Filter by action
 * @param {string} options.resource - Filter by resource
 * @param {string} options.userId - Filter by user ID
 * @param {string} options.userEmail - Filter by user email
 * @param {string} options.tenantId - Filter by tenant ID
 * @param {number} options.limit - Limit results
 * @returns {Promise<Array>}
 */
const getAuditLogs = async (options = {}) => {
  try {
    const {
      days = 30,
      action,
      resource,
      userId,
      userEmail,
      tenantId,
      limit = 1000
    } = options;

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
        al.created_at
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.created_at >= NOW() - INTERVAL '${parseInt(days)} days'
    `;

    const params = [];

    if (tenantId) {
      params.push(tenantId);
      query += ` AND al.tenant_id = $${params.length}`;
    }

    if (action) {
      params.push(action.toUpperCase());
      query += ` AND al.action = $${params.length}`;
    }

    if (resource) {
      params.push(resource.toUpperCase());
      query += ` AND al.resource = $${params.length}`;
    }

    if (userId) {
      params.push(userId);
      query += ` AND al.user_id = $${params.length}`;
    }

    if (userEmail) {
      params.push(`%${userEmail}%`);
      query += ` AND u.email ILIKE $${params.length}`;
    }

    query += ` ORDER BY al.created_at DESC LIMIT ${limit}`;

    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    logger.error('Audit', 'Failed to fetch audit logs', { error: error.message });
    throw error;
  }
};

module.exports = {
  logAudit,
  auditLoggerMiddleware,
  getAuditLogs
};
