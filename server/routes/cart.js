const express = require('express');
const { models } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const items = await models.CartItem.findAll({
      where: { userId: req.user.id },
      include: [{ model: models.Product }],
      order: [['id', 'ASC']],
    });
    res.json(items);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ error: 'Failed to fetch cart items' });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { productId, quantity, size, color } = req.body;
    
    console.log('🛒 CART POST REQUEST RECEIVED:');
    console.log('   User ID:', req.user.id);
    console.log('   Product ID:', productId);
    console.log('   Quantity:', quantity);
    console.log('   Size:', size);
    console.log('   Color:', color);
    
    if (!productId || !quantity || quantity < 1) {
      console.error('❌ Invalid payload:', { productId, quantity });
      return res.status(400).json({ error: 'Invalid payload' });
    }
    
    const product = await models.Product.findByPk(productId);
    if (!product) {
      console.error('❌ Product not found:', productId);
      return res.status(404).json({ error: 'Product not found' });
    }
    
    console.log('✅ Product found:', product.name);
    
    // Check if item already exists with same variants
    const existingItem = await models.CartItem.findOne({
      where: { 
        userId: req.user.id, 
        productId, 
        size: size || null, 
        color: color || null 
      }
    });
    
    if (existingItem) {
      console.log('🔄 Updating existing cart item:', existingItem.id);
      // Update existing item quantity
      await existingItem.update({ quantity: existingItem.quantity + quantity });
      console.log('✅ Cart item updated successfully');
      res.status(200).json(existingItem);
    } else {
      console.log('➕ Creating new cart item');
      // Create new cart item
      const newItem = await models.CartItem.create({
        userId: req.user.id,
        productId,
        quantity,
        size: size || null,
        color: color || null
      });
      console.log('✅ Cart item created successfully:', newItem.id);
      res.status(201).json(newItem);
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Send more detailed error information
    let errorMessage = 'Failed to add to cart';
    let statusCode = 500;
    
    if (error.name === 'SequelizeValidationError') {
      console.error('❌ Validation errors:', error.errors);
      errorMessage = `Validation error: ${error.errors.map(e => `${e.path}: ${e.message}`).join(', ')}`;
      statusCode = 400;
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      errorMessage = `Database constraint error: ${error.message}`;
      statusCode = 400;
    } else if (error.name === 'SequelizeForeignKeyConstraintError') {
      errorMessage = `Foreign key error: Product may not exist`;
      statusCode = 400;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: error.message,
      type: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.put('/:productId', authenticate, async (req, res) => {
  try {
    const { quantity, size, color } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ error: 'Invalid quantity' });
    const item = await models.CartItem.findOne({ 
      where: { 
        userId: req.user.id, 
        productId: req.params.productId,
        size: size || null,
        color: color || null
      } 
    });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update({ quantity });
    res.json(item);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

router.delete('/:productId', authenticate, async (req, res) => {
  try {
    const { size, color } = req.query;
    const item = await models.CartItem.findOne({ 
      where: { 
        userId: req.user.id, 
        productId: req.params.productId,
        size: size || null,
        color: color || null
      } 
    });
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

router.post('/merge', authenticate, async (req, res) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    
    console.log('🔗 CART MERGE REQUEST:');
    console.log('   User ID:', req.user.id);
    console.log('   Items to merge:', items);
    console.log('   Items count:', items.length);
    
    for (const i of items) {
      if (!i.productId || !i.quantity || i.quantity < 1) {
        console.log('   ⏭️ Skipping invalid item:', i);
        continue;
      }
      
      console.log(`   🔄 Processing item: Product ID ${i.productId}, Quantity ${i.quantity}`);
      
      // Check if product exists
      const product = await models.Product.findByPk(i.productId);
      if (!product) {
        console.log(`   ❌ Product ${i.productId} not found, skipping`);
        continue;
      }
      
      // Check if item already exists
      const existingItem = await models.CartItem.findOne({
        where: { 
          userId: req.user.id, 
          productId: i.productId, 
          size: i.size || null, 
          color: i.color || null 
        }
      });
      
      if (existingItem) {
        console.log(`   📝 Updating existing cart item ID ${existingItem.id}`);
        // Update existing item quantity
        await existingItem.update({ quantity: existingItem.quantity + i.quantity });
        console.log(`   ✅ Updated quantity to ${existingItem.quantity + i.quantity}`);
      } else {
        console.log(`   ➕ Creating new cart item`);
        // Create new cart item
        await models.CartItem.create({
          userId: req.user.id,
          productId: i.productId,
          quantity: i.quantity,
          size: i.size || null,
          color: i.color || null
        });
        console.log(`   ✅ Created cart item successfully`);
      }
    }
    
    const merged = await models.CartItem.findAll({ where: { userId: req.user.id }, include: [{ model: models.Product }] });
    console.log(`   ✅ Cart merge complete. Final cart has ${merged.length} items`);
    res.json(merged);
  } catch (error) {
    console.error('Error merging cart:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    
    // Send detailed error information
    let errorMessage = 'Failed to merge cart';
    let statusCode = 500;
    
    if (error.name === 'SequelizeValidationError') {
      console.error('❌ Validation errors:', error.errors);
      errorMessage = `Validation error: ${error.errors.map(e => `${e.path}: ${e.message}`).join(', ')}`;
      statusCode = 400;
    } else if (error.name === 'SequelizeUniqueConstraintError') {
      errorMessage = `Database constraint error: ${error.message}`;
      statusCode = 400;
    } else if (error.name === 'SequelizeForeignKeyConstraintError') {
      errorMessage = `Foreign key error: Product may not exist`;
      statusCode = 400;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(statusCode).json({ 
      error: errorMessage,
      details: error.message,
      type: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
