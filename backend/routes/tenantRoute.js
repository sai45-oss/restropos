const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenantController');

// Public onboarding: create tenant + admin
router.post('/', tenantController.createTenant);

// Stripe webhook (raw body required)
router.post('/webhook', tenantController.stripeWebhook);

module.exports = router;
