const express = require('express');
const { Op, fn, col, where, literal } = require('sequelize');
const { models, sequelize } = require('../models');
const { authenticate, isAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Test endpoint to verify server is working
router.get('/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ 
    message: 'Products API is working',
    timestamp: new Date().toISOString(),
    opAvailable: !!(Op && Op.iLike)
  });
});

// Public: get all products with optional filters
router.get('/', async (req, res) => {
  try {
    const { gender, category, search, minPrice, maxPrice, size, color } = req.query;
    console.log('Products API called with filters:', { gender, category, search, minPrice, maxPrice, size, color });
    
    // Debug: Check if Op is available
    console.log('Op object:', Op);
    console.log('Op.like available:', !!(Op && Op.like));
    console.log('Op.eq available:', !!(Op && Op.eq));
    console.log('Op.iLike available:', !!(Op && Op.iLike), '(SQLite does not support iLike)');
    console.log('Op.contains available:', !!(Op && Op.contains), '(SQLite does not support JSON contains)');
    
    const whereClause = {};
    
    // Filter by gender if specified
    if (gender) whereClause.gender = gender;
    
    // Filter by category if specified (exact match to prevent duplicates)
    if (category) {
      try {
        // Use exact match to prevent duplicates from multiple LIKE conditions
        if (Op && Op.eq) {
          whereClause.category = { [Op.eq]: category };
        } else {
          console.log('Op.eq not available, using exact match for category');
          whereClause.category = category;
        }
      } catch (error) {
        console.error('Error setting category filter:', error);
        whereClause.category = category; // Fallback to exact match
      }
    }
    
    // Search by name if specified (case-insensitive with fallback)
    if (search) {
      try {
        // Use simple LIKE for search to avoid duplicates
        if (Op && Op.like) {
          whereClause.name = { [Op.like]: `%${search}%` };
        } else if (Op && Op.substring) {
          console.log('Op.like not available, using Op.substring for name search');
          whereClause.name = { [Op.substring]: search };
        } else {
          console.log('Op operators not available, using exact match for name');
          whereClause.name = search;
        }
      } catch (error) {
        console.error('Error setting name search filter:', error);
        whereClause.name = search; // Fallback to exact match
      }
    }
    
    // Price range filters (with fallback)
    if (minPrice) {
      try {
        const minPriceNum = parseFloat(minPrice);
        if (!isNaN(minPriceNum)) {
          if (Op && Op.gte) {
            whereClause.price = { ...whereClause.price, [Op.gte]: minPriceNum };
          } else {
            console.log('Op.gte not available, using basic filter');
            whereClause.price = { ...whereClause.price, $gte: minPriceNum };
          }
        }
      } catch (error) {
        console.error('Error setting minPrice filter:', error);
      }
    }
    if (maxPrice) {
      try {
        const maxPriceNum = parseFloat(maxPrice);
        if (!isNaN(maxPriceNum)) {
          if (Op && Op.lte) {
            whereClause.price = { ...whereClause.price, [Op.lte]: maxPriceNum };
          } else {
            console.log('Op.lte not available, using basic filter');
            whereClause.price = { ...whereClause.price, $lte: maxPriceNum };
          }
        }
      } catch (error) {
        console.error('Error setting maxPrice filter:', error);
      }
    }
    
    // Size and color filters (JSON contains with fallback)
    if (size) {
      try {
        // SQLite doesn't support JSON contains, use exact match or skip
        if (Op && Op.contains) {
          whereClause.sizes = { [Op.contains]: [size] };
        } else {
          console.log('Op.contains not available (SQLite limitation), skipping size filter');
          // For SQLite, we could use a different approach but for now skip this filter
        }
      } catch (error) {
        console.error('Error setting size filter:', error);
      }
    }
    if (color) {
      try {
        // SQLite doesn't support JSON contains, use exact match or skip
        if (Op && Op.contains) {
          whereClause.colors = { [Op.contains]: [color] };
        } else {
          console.log('Op.contains not available (SQLite limitation), skipping color filter');
          // For SQLite, we could use a different approach but for now skip this filter
        }
      } catch (error) {
        console.error('Error setting color filter:', error);
      }
    }
    
    console.log('Final whereClause:', JSON.stringify(whereClause, null, 2));
    
    const products = await models.Product.findAll({
      where: whereClause,
      order: [['id', 'ASC']],
    });
    
    console.log('Found products:', products.length);
    console.log('Product details:', products.map(p => ({ id: p.id, name: p.name, category: p.category, gender: p.gender })));
    
    // Add rating info separately to avoid SQL issues
    const productsWithRatings = await Promise.all(products.map(async (product) => {
      const reviews = await models.Review.findAll({
        where: { productId: product.id },
        attributes: [[fn('AVG', col('rating')), 'avgRating'], [fn('COUNT', col('id')), 'count']],
        raw: true
      });
      
      const avgRating = reviews.length > 0 ? Number(reviews[0].avgRating || 0) : 0;
      const reviewCount = reviews.length > 0 ? Number(reviews[0].count || 0) : 0;
      
      return {
        ...product.toJSON(),
        avgRating,
        reviewCount
      };
    }));

    console.log(`Products API - returning ${productsWithRatings.length} products with ratings`);
    res.json(productsWithRatings);
  } catch (e) {
    console.error('Products API error:', e);
    console.error('Error stack:', e.stack);
    res.status(500).json({ error: 'Failed to fetch products', details: e.message });
  }
});

// GET /api/products/filters/categories (distinct)
router.get('/filters/categories', async (req, res) => {
  try {
    const rows = await models.Product.findAll({ attributes: [[fn('DISTINCT', col('category')), 'category']] });
    res.json(rows.map(r => r.get('category')));
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await models.Product.findByPk(req.params.id, {
      attributes: {
        include: [[fn('IFNULL', fn('AVG', col('Reviews.rating')), 0), 'avgRating'], [fn('COUNT', col('Reviews.id')), 'reviewCount']],
      },
      include: [{ model: models.Review, attributes: [] }],
      group: ['Product.id'],
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// GET /api/products/:id/reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const reviews = await models.Review.findAll({
      where: { productId: req.params.id },
      include: [{ model: models.User, attributes: ['id', 'name'] }],
      order: [['id', 'ASC']],
    });
    res.json(reviews);
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Admin: create product
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, category, price, imageURL, description, stock, sizes, colors, images, gender } = req.body;
    console.log('Creating product:', { name, category, price, imageURL, description, stock, sizes, colors, images, gender });
    
    // Determine gender from category if not provided
    let productGender = gender;
    if (!productGender) {
      console.log('Determining gender from category:', category);
      if (category.toLowerCase().includes('women') || category.toLowerCase().includes('girl')) {
        productGender = 'women';
      } else if (category.toLowerCase().includes('men') || category.toLowerCase().includes('boy')) {
        productGender = 'men';
      } else if (category.toLowerCase().includes('boys')) {
        productGender = 'boys';
      } else if (category.toLowerCase().includes('girls')) {
        productGender = 'girls';
      } else {
        // Check if category matches women's categories
        const womenCategories = ['dresses', 'tops & shirts', 'jackets', 'jeans', 'shorts', 'skirts', 'accessories & shoes'];
        if (womenCategories.includes(category.toLowerCase())) {
          productGender = 'women';
        } else {
          productGender = 'men'; // Default fallback
        }
      }
      console.log('Determined gender:', productGender, 'for category:', category);
    }
    
    // Parse sizes and colors if they come as strings
    const parsedSizes = typeof sizes === 'string' ? 
      (sizes.startsWith('[') ? JSON.parse(sizes) : sizes.split(',').map(s => s.trim()).filter(s => s)) : 
      sizes || [];
    const parsedColors = typeof colors === 'string' ? 
      (colors.startsWith('[') ? JSON.parse(colors) : colors.split(',').map(c => c.trim()).filter(c => c)) : 
      colors || [];
    
    // Handle images - support both old format (imageURL) and new format (images array)
    let finalImageURL = imageURL;
    let finalImages = [];
    
    if (images && Array.isArray(images)) {
      // New format: images array
      finalImages = images;
      finalImageURL = images[0] || imageURL; // Use first image as main
    } else if (imageURL) {
      // Old format: single image URL
      finalImageURL = imageURL;
      finalImages = [imageURL];
    }
    
    const product = await models.Product.create({ 
      name, 
      category, 
      price, 
      imageURL: finalImageURL, 
      description, 
      stock,
      sizes: parsedSizes,
      colors: parsedColors,
      images: finalImages, // Store images array
      gender: productGender
    });
    console.log('Product created successfully:', product.id, product.name, 'gender:', product.gender);
    
    res.status(201).json(product);
  } catch (e) {
    console.error('Failed to create product:', e);
    res.status(400).json({ error: 'Failed to create product', details: e.message });
  }
});

// Debug endpoint to check products by gender
router.get('/debug/gender/:gender', authenticate, isAdmin, async (req, res) => {
  try {
    const { gender } = req.params;
    const products = await models.Product.findAll({
      where: { gender },
      attributes: ['id', 'name', 'category', 'gender']
    });
    res.json({
      gender,
      count: products.length,
      products
    });
  } catch (e) {
    console.error('Debug endpoint error:', e);
    res.status(500).json({ error: 'Debug endpoint failed' });
  }
});

// Admin: update product
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    console.log('Updating product with ID:', req.params.id);
    const product = await models.Product.findByPk(req.params.id);
    
    if (!product) {
      console.log('Product not found with ID:', req.params.id);
      // List all available products for debugging
      const allProducts = await models.Product.findAll({
        attributes: ['id', 'name', 'category']
      });
      console.log('Available products:', allProducts.map(p => ({ id: p.id, name: p.name, category: p.category })));
      return res.status(404).json({ error: 'Not found', details: `Product with ID ${req.params.id} does not exist` });
    }
    
    console.log('Found product to update:', product.name);
    
    // Parse sizes and colors if they come as strings
    const { sizes, colors, images, imageURL, gender, ...otherFields } = req.body;
    const updateData = otherFields;
    
    if (sizes !== undefined) {
      updateData.sizes = typeof sizes === 'string' ? 
        (sizes.startsWith('[') ? JSON.parse(sizes) : sizes.split(',').map(s => s.trim()).filter(s => s)) : 
        sizes || [];
    }
    if (colors !== undefined) {
      updateData.colors = typeof colors === 'string' ? 
        (colors.startsWith('[') ? JSON.parse(colors) : colors.split(',').map(c => c.trim()).filter(c => c)) : 
        colors || [];
    }
    
    // Handle gender
    if (gender !== undefined) {
      updateData.gender = gender;
    }
    
    // Handle images - support both old format (imageURL) and new format (images array)
    if (images && Array.isArray(images)) {
      // New format: images array
      updateData.images = images;
      updateData.imageURL = images[0] || imageURL || product.imageURL; // Use first image as main
    } else if (imageURL !== undefined) {
      // Old format: single image URL
      updateData.imageURL = imageURL;
      updateData.images = [imageURL];
    }
    
    console.log('Updating product with data:', updateData);
    await product.update(updateData);
    console.log('Product updated successfully');
    
    res.json(product);
  } catch (e) {
    console.error('Failed to update product:', e);
    res.status(400).json({ error: 'Failed to update product', details: e.message });
  }
});

// Admin: delete product
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const product = await models.Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    
    // Delete related records first (foreign key constraints)
    await models.CartItem.destroy({ where: { productId: req.params.id } });
    await models.Review.destroy({ where: { productId: req.params.id } });
    await models.OrderItem.destroy({ where: { productId: req.params.id } });
    
    // Now delete the product
    await product.destroy();
    res.json({ success: true });
  } catch (e) {
    console.error('Failed to delete product:', e);
    res.status(400).json({ error: 'Failed to delete product', details: e.message });
  }
});

module.exports = router;
