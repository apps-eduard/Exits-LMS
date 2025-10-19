const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const authMiddleware = require('../middleware/auth.middleware');
const tenantIsolation = require('../middleware/tenant-isolation.middleware');
const checkModuleAccess = require('../middleware/module-access.middleware');
const { checkPermission } = require('../middleware/rbac.middleware');

// All customer routes require authentication and Money-Loan module access
router.use(authMiddleware);
router.use(checkModuleAccess('money-loan'));
router.use(tenantIsolation);

// Customer CRUD operations with permission checks
router.get('/', checkPermission('view_customers'), customerController.getAllCustomers);
router.get('/:id', checkPermission('view_customers'), customerController.getCustomerById);
router.post('/', checkPermission('manage_customers'), customerController.createCustomer);
router.put('/:id', checkPermission('manage_customers'), customerController.updateCustomer);
router.delete('/:id', checkPermission('manage_customers'), customerController.deleteCustomer);

// Customer statistics and search
router.get('/stats/summary', checkPermission('view_customers'), customerController.getCustomersSummary);

module.exports = router;
