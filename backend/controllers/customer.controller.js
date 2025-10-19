const db = require('../config/database');

const getAllCustomers = async (req, res) => {
  try {
    const { search, status } = req.query;
    const tenantId = req.tenantId || req.query.tenantId;
    
    let query = `
      SELECT c.*,
             COUNT(DISTINCT l.id) as loan_count,
             COALESCE(SUM(l.outstanding_balance), 0) as total_outstanding
      FROM customers c
      LEFT JOIN loans l ON c.id = l.customer_id AND l.status = 'active'
      WHERE c.tenant_id = $1
    `;
    
    const params = [tenantId];
    
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (c.first_name ILIKE $${params.length} OR c.last_name ILIKE $${params.length} 
                      OR c.email ILIKE $${params.length} OR c.phone ILIKE $${params.length})`;
    }
    
    if (status) {
      params.push(status);
      query += ` AND c.status = $${params.length}`;
    }
    
    query += ` GROUP BY c.id ORDER BY c.created_at DESC`;
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      customers: result.rows,
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || req.query.tenantId;
    
    const result = await db.query(
      `SELECT c.*,
              COUNT(DISTINCT l.id) as loan_count,
              COALESCE(SUM(CASE WHEN l.status = 'active' THEN l.outstanding_balance ELSE 0 END), 0) as total_outstanding
       FROM customers c
       LEFT JOIN loans l ON c.id = l.customer_id
       WHERE c.id = $1 AND c.tenant_id = $2
       GROUP BY c.id`,
      [id, tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Get customer loans
    const loansResult = await db.query(
      `SELECT l.*, lp.name as product_name
       FROM loans l
       LEFT JOIN loan_products lp ON l.loan_product_id = lp.id
       WHERE l.customer_id = $1 AND l.tenant_id = $2
       ORDER BY l.created_at DESC`,
      [id, tenantId]
    );
    
    res.json({
      success: true,
      customer: {
        ...result.rows[0],
        loans: loansResult.rows,
      },
    });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
};

const createCustomer = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, address, idNumber } = req.body;
    const tenantId = req.tenantId || req.body.tenantId;
    
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'First name and last name required' });
    }
    
    const result = await db.query(
      `INSERT INTO customers (tenant_id, first_name, last_name, email, phone, address, id_number, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [tenantId, firstName, lastName, email, phone, address, idNumber, req.user.id]
    );
    
    res.status(201).json({
      success: true,
      customer: result.rows[0],
      message: 'Customer created successfully',
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, address, idNumber, status } = req.body;
    const tenantId = req.tenantId || req.body.tenantId;
    
    const result = await db.query(
      `UPDATE customers 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           address = COALESCE($5, address),
           id_number = COALESCE($6, id_number),
           status = COALESCE($7, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 AND tenant_id = $9
       RETURNING *`,
      [firstName, lastName, email, phone, address, idNumber, status, id, tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json({
      success: true,
      customer: result.rows[0],
      message: 'Customer updated successfully',
    });
  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const tenantId = req.tenantId || req.query.tenantId;
    
    // Check if customer has active loans
    const loanCheck = await db.query(
      `SELECT COUNT(*) as count FROM loans 
       WHERE customer_id = $1 AND status = 'active'`,
      [id]
    );
    
    if (parseInt(loanCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete customer with active loans' 
      });
    }
    
    const result = await db.query(
      'DELETE FROM customers WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, tenantId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
};

// Get customers summary/statistics
const getCustomersSummary = async (req, res) => {
  try {
    const tenantId = req.tenantId || req.query.tenantId;
    
    const result = await db.query(
      `SELECT 
        COUNT(DISTINCT c.id) as total_customers,
        COUNT(DISTINCT CASE WHEN c.status = 'active' THEN c.id END) as active_customers,
        COUNT(DISTINCT CASE WHEN c.status = 'inactive' THEN c.id END) as inactive_customers,
        COUNT(DISTINCT l.id) as total_loans,
        COUNT(DISTINCT CASE WHEN l.status = 'active' THEN l.id END) as active_loans,
        COALESCE(SUM(CASE WHEN l.status = 'active' THEN l.outstanding_balance ELSE 0 END), 0) as total_outstanding
       FROM customers c
       LEFT JOIN loans l ON c.id = l.customer_id
       WHERE c.tenant_id = $1`,
      [tenantId]
    );
    
    res.json({
      success: true,
      summary: result.rows[0],
    });
  } catch (error) {
    console.error('Get customers summary error:', error);
    res.status(500).json({ error: 'Failed to fetch customers summary' });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomersSummary,
};
