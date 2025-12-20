const Tenant = require('../models/tenantModel');
const User = require('../models/userModel');
const stripeEnabled = process.env.STRIPE_ENABLED === 'true';
const stripe = stripeEnabled ? require('stripe')(process.env.STRIPE_SECRET || '') : null;

exports.createTenant = async (req, res, next) => {
    try {
        const { name, slug, adminName, adminEmail, adminPhone, adminPassword, plan } = req.body;
        if (!name || !slug || !adminName || !adminEmail || !adminPhone || !adminPassword) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // create admin user
        const admin = new User({ name: adminName, email: adminEmail, phone: adminPhone, password: adminPassword, role: 'admin' });
        await admin.save();

        // create stripe customer (optional, only if STRIPE_ENABLED=true)
        let stripeCustomerId = null;
        if (stripeEnabled && process.env.STRIPE_SECRET) {
            const customer = await stripe.customers.create({
                email: adminEmail,
                name: adminName,
                metadata: { tenant_slug: slug }
            });
            stripeCustomerId = customer.id;
        }

        const tenant = new Tenant({ name, slug, owner: admin._id, plan: plan || 'free', stripeCustomerId });
        await tenant.save();

        // attach tenant to admin (set tenantId on user)
        admin.tenantId = tenant._id;
        await admin.save();

        // respond with tenant info (do not return password)
        res.status(201).json({ tenant: { id: tenant._id, name: tenant.name, slug: tenant.slug }, admin: { id: admin._id, email: admin.email } });
    } catch (err) {
        next(err);
    }
};

exports.stripeWebhook = async (req, res, next) => {
    // If Stripe integration is disabled, return 501 Not Implemented
    if (!stripeEnabled) {
        return res.status(501).json({ message: 'Stripe integration is disabled' });
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
        if (webhookSecret && req.rawBody) {
            event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
        } else {
            // if no webhook secret configured, parse body directly (less secure)
            event = req.body;
        }
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle relevant events (subscription, invoice.payment_succeeded, etc.)
    switch (event.type) {
        case 'customer.subscription.created':
        case 'invoice.payment_succeeded':
            // TODO: find tenant by stripeCustomerId and update plan/status
            break;
        default:
            break;
    }

    res.json({ received: true });
};
