const express = require('express');
const { models, sequelize } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:4000';

// Enable Paystack if key is provided
const paystackEnabled = PAYSTACK_SECRET_KEY && PAYSTACK_SECRET_KEY !== '' && !PAYSTACK_SECRET_KEY.includes('your_key');

if (!paystackEnabled) {
  console.log('Paystack is disabled - payment cannot proceed');
} else {
  console.log('Paystack is enabled with test key');
}

router.get('/mine', authenticate, async (req, res) => {
  const orders = await models.Order.findAll({
    where: { userId: req.user.id },
    include: [{ model: models.OrderItem, include: [{ model: models.Product }] }],
    order: [['createdAt', 'DESC']],
  });
  res.json(orders);
});

router.get('/:id', authenticate, async (req, res) => {
  const order = await models.Order.findOne({
    where: { id: req.params.id, userId: req.user.id },
    include: [{ model: models.OrderItem, include: [{ model: models.Product }] }],
  });
  if (!order) return res.status(404).json({ error: 'Not found' });
  res.json(order);
});

router.post('/checkout', authenticate, async (req, res) => {
  // Create an order from the user's cart and initiate Paystack checkout
  if (!paystackEnabled) {
    return res.status(500).json({ error: 'Paystack is not configured. Please set PAYSTACK_SECRET_KEY in your .env file' });
  }
  
  const t = await sequelize.transaction();
  try {
    console.log('Checkout request body:', req.body);
    
    const customer = {
      name: req.body?.name,
      email: req.body?.email,
      address: req.body?.address,
      city: req.body?.city,
      country: req.body?.country,
      zip: req.body?.zip,
    };
    
    console.log('Customer data:', customer);
    console.log('User ID:', req.user.id);
    
    const cartItems = await models.CartItem.findAll({ where: { userId: req.user.id }, include: [{ model: models.Product }], transaction: t, lock: t.LOCK.UPDATE });
    console.log('Cart items from DB:', cartItems);
    
    if (!cartItems.length) {
      await t.rollback();
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let total = 0;
    const paymentMethod = req.body?.paymentMethod || 'visa';
    console.log('Payment method:', paymentMethod);
    
    const order = await models.Order.create({ 
      userId: req.user.id, 
      totalPrice: 0, 
      status: 'paid', // Changed from 'pending' to 'paid' for immediate confirmation
      customer, 
      paymentMethod: paymentMethod
    }, { transaction: t });

    for (const ci of cartItems) {
      const p = ci.Product;
      const qty = Math.min(ci.quantity, p.stock);
      if (qty <= 0) continue;
      total += Number(p.price) * qty;
      await models.OrderItem.create({ orderId: order.id, productId: p.id, quantity: qty, price: p.price }, { transaction: t });
    }

    if (total <= 0) {
      await t.rollback();
      return res.status(400).json({ error: 'No available items to checkout' });
    }

    await order.update({ totalPrice: total.toFixed(2) }, { transaction: t });
    console.log('Order created with total:', total);

    // Paystack integration only - no fallback
    const https = require('https');
    const querystring = require('querystring');
    
    // Validate required fields
    if (!customer.email) {
      await t.rollback();
      return res.status(400).json({ error: 'Email is required for Paystack payment' });
    }
    
    if (total <= 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Total amount must be greater than 0' });
    }
    
    const paystackData = {
      email: customer.email,
      amount: Math.round(total * 100), // Convert to pesewas (GHS cents)
      currency: 'GHS', // Ghanaian Cedi
      callback_url: `${CLIENT_URL}/checkout-success.html?orderId=${order.id}`,
      metadata: {
        orderId: order.id,
        userId: req.user.id,
        custom_fields: [
          {
            display_name: "Customer Name",
            variable_name: "customer_name",
            value: customer.name || 'Customer'
          },
          {
            display_name: "Payment Method",
            variable_name: "payment_method",
            value: paymentMethod
          }
        ]
      }
    };

    // Create Paystack transaction
    console.log('Creating Paystack transaction with data:', paystackData);
    
    const paystackResponse = await new Promise((resolve, reject) => {
      const postData = JSON.stringify(paystackData);
      const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: '/transaction/initialize',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      console.log('Paystack API request options:', options);
      console.log('Paystack API request data:', postData);

      const req = https.request(options, (res) => {
        let data = '';
        console.log('Paystack response status:', res.statusCode);
        console.log('Paystack response headers:', res.headers);
        
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const parsedData = JSON.parse(data);
            console.log('Paystack response data:', parsedData);
            resolve(parsedData);
          } catch (e) {
            console.error('Failed to parse Paystack response:', e);
            console.error('Raw response:', data);
            reject(e);
          }
        });
      });

      req.on('error', (error) => {
        console.error('Paystack request error:', error);
        reject(error);
      });
      
      req.write(postData);
      req.end();
    });

    if (!paystackResponse.status || paystackResponse.status !== true) {
      console.error('Paystack initialization failed:', paystackResponse);
      console.error('Error details:', paystackResponse.message || 'Unknown error');
      await t.rollback();
      return res.status(500).json({ 
        error: 'Paystack payment failed', 
        details: paystackResponse.message || 'Unknown Paystack error',
        debug: {
          requestData: paystackData,
          responseData: paystackResponse
        }
      });
    }

    await order.update({ paymentRef: paystackResponse.data.reference }, { transaction: t });
    await t.commit();

    const redirectUrl = paystackResponse.data.authorization_url;
    console.log('Redirecting to Paystack URL:', redirectUrl);
    console.log('Order ID:', order.id);
    
    res.json({ url: redirectUrl, orderId: order.id });
  } catch (e) {
    console.error('Checkout error:', e);
    try { await t.rollback(); } catch(_) {}
    res.status(500).json({ error: e.message || 'Failed to start checkout' });
  }
});

// Paystack webhook handler
async function paystackWebhookHandler(req, res) {
  if (!paystackEnabled) return res.status(200).send();
  
  const signature = req.headers['x-paystack-signature'];
  const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;
  
  // Verify webhook signature (security)
  if (webhookSecret && signature) {
    // TODO: Implement signature verification using crypto
    // const hash = crypto.createHmac('sha512', webhookSecret).update(JSON.stringify(req.body)).digest('hex');
    // if (hash !== signature) {
    //   return res.status(401).send('Invalid signature');
    // }
  }
  
  const event = req.body;
  console.log('Paystack webhook event:', event);
  
  try {
    if (event.event === 'charge.success') {
      const orderId = event.data.metadata.orderId;
      const reference = event.data.reference;
      
      await models.Order.update(
        { status: 'paid', paymentRef: reference },
        { where: { id: orderId } }
      );
      
      console.log(`Order ${orderId} marked as paid via Paystack webhook`);
    } else if (event.event === 'charge.failed') {
      const orderId = event.data.metadata.orderId;
      
      await models.Order.update(
        { status: 'failed' },
        { where: { id: orderId } }
      );
      
      console.log(`Order ${orderId} marked as failed via Paystack webhook`);
    }
    
    res.status(200).send();
  } catch (error) {
    console.error('Paystack webhook error:', error);
    res.status(500).send('Webhook processing failed');
  }
}

// Stripe webhook handler
async function stripeWebhookHandler(req, res) {
  if (!stripe) return res.status(200).send();
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error('Missing STRIPE_WEBHOOK_SECRET');
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (!orderId) return res.status(200).send();

      const order = await models.Order.findByPk(orderId);
      if (!order) return res.status(200).send();

      await order.update({ status: 'paid' });
      // Clear cart of user
      if (session.metadata?.userId) {
        await models.CartItem.destroy({ where: { userId: Number(session.metadata.userId) } });
      }
    }
  } catch (e) {
    console.error('Webhook handling error', e);
  }
  res.status(200).send();
}

// Test webhook endpoint (for development)
router.get('/webhook/test', (req, res) => {
  res.json({
    message: 'Webhook endpoint is ready',
    paystack: {
      url: '/webhook/paystack',
      method: 'POST',
      events: ['charge.success', 'charge.failed']
    },
    stripe: {
      url: '/webhook/stripe', 
      method: 'POST',
      events: ['payment_intent.succeeded', 'payment_intent.payment_failed']
    }
  });
});

module.exports = router;
module.exports.paystackWebhookHandler = paystackWebhookHandler;
module.exports.stripeWebhookHandler = stripeWebhookHandler;
