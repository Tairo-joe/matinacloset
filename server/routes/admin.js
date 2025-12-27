const express = require('express');
const multer = require('multer');
const path = require('path');
const { models, sequelize } = require('../models');
const { authenticate, isAdmin } = require('../middleware/auth');
const { fn, col, literal, Op } = require('sequelize');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname || '') || '.jpg';
    cb(null, `${unique}${ext}`);
  },
});
const upload = multer({ storage });

router.use(authenticate, isAdmin);

// POST /api/admin/upload
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({ url });
});

// GET /api/admin/overview
router.get('/overview', async (req, res) => {
  try {
    console.log('🔄 Admin overview request received');
    
    // Get basic counts - test each one individually
    console.log('📊 Getting user count...');
    const users = await models.User.count();
    console.log('✅ Users:', users);
    
    console.log('📊 Getting product count...');
    const products = await models.Product.count();
    console.log('✅ Products:', products);
    
    console.log('📊 Getting order count...');
    const orders = await models.Order.count();
    console.log('✅ Orders:', orders);
    
    console.log('📊 Getting revenue...');
    const revenue = await models.Order.sum('totalPrice');
    console.log('✅ Revenue:', revenue);
    
    console.log('📊 Getting shipped orders...');
    const shippedOrders = await models.Order.count({
      where: { status: ['shipped', 'delivered'] }
    });
    console.log('✅ Shipped orders:', shippedOrders);
    
    console.log('📊 Getting pending orders...');
    const pendingOrders = await models.Order.count({
      where: { status: 'pending' }
    });
    console.log('✅ Pending orders:', pendingOrders);
    
    console.log('📊 Getting active products...');
    const activeProducts = await models.Product.count({
      where: { stock: { [Op.gt]: 0 } }
    });
    console.log('✅ Active products:', activeProducts);
    
    console.log('📊 Getting review stats...');
    const reviewStats = await models.Review.findAll({
      attributes: [
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalReviews'],
        [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']
      ],
      raw: true
    });
    console.log('✅ Review stats:', reviewStats);

    res.json({
      totals: { users, products, orders, revenue: Number(revenue || 0) },
      realStats: {
        avgOrderValue: orders > 0 ? Number(revenue || 0) / orders : 0,
        shippedOrders,
        pendingOrders,
        activeProducts,
        totalReviews: Number(reviewStats[0]?.totalReviews || 0),
        avgRating: Number(reviewStats[0]?.avgRating || 0)
      },
      topProducts: [], // Skip top products for now to isolate the issue
    });
    
    console.log('✅ Admin overview response sent');
  } catch (e) {
    console.error('❌ Admin overview error:', e);
    console.error('❌ Error stack:', e.stack);
    res.status(500).json({ error: 'Failed to fetch overview', details: e.message });
  }
});

// GET /api/admin/orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await models.Order.findAll({
      include: [{ model: models.User, attributes: ['id', 'name', 'email'] }, { model: models.OrderItem, include: [{ model: models.Product }] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/admin/categories
router.get('/categories', async (req, res) => {
  try {
    const rows = await models.Product.findAll({ attributes: ['category', [fn('COUNT', col('id')), 'count']], group: ['category'], order: [[fn('COUNT', col('id')), 'DESC']] });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/admin/categories/rename { old, next }
router.post('/categories/rename', async (req, res) => {
  const { old, next } = req.body;
  if (!old || !next) return res.status(400).json({ error: 'Invalid payload' });
  try {
    const [affected] = await models.Product.update({ category: next }, { where: { category: old } });
    res.json({ success: true, affected });
  } catch (e) {
    res.status(400).json({ error: 'Failed to rename category' });
  }
});

module.exports = router;
