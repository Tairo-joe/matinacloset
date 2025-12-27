const express = require('express');
const { sequelize, models } = require('./server/models');

const app = express();
app.use(express.json());

// Mock auth middleware for testing
app.use((req, res, next) => {
  req.user = { id: 1, role: 'admin' };
  next();
});

app.post('/api/products', async (req, res) => {
  try {
    console.log('🔍 Request body received:', JSON.stringify(req.body, null, 2));
    
    const { name, category, price, imageURL, description, stock, sizes, colors } = req.body;
    
    // Parse sizes and colors if they come as strings
    const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes || [];
    const parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors || [];
    
    console.log('📊 Parsed sizes:', parsedSizes, 'type:', typeof parsedSizes);
    console.log('📊 Parsed colors:', parsedColors, 'type:', typeof parsedColors);
    
    const product = await models.Product.create({ 
      name, 
      category, 
      price, 
      imageURL, 
      description, 
      stock,
      sizes: parsedSizes,
      colors: parsedColors
    });
    
    console.log('✅ Product created in database:', {
      id: product.id,
      name: product.name,
      sizes: product.sizes,
      colors: product.colors
    });
    
    res.status(201).json(product);
  } catch (e) {
    console.error('❌ Error:', e.message);
    res.status(400).json({ error: 'Failed to create product', details: e.message });
  }
});

async function start() {
  try {
    await sequelize.authenticate();
    console.log('📊 Database connected');
    
    app.listen(4002, () => {
      console.log('🚀 Debug server running on port 4002');
      
      // Test the product creation
      setTimeout(async () => {
        try {
          const testProduct = {
            name: 'Debug Test Product',
            category: 'Clothing',
            price: 29.99,
            imageURL: 'https://example.com/image.jpg',
            description: 'Test product',
            stock: 100,
            sizes: ['S', 'M', 'L'],
            colors: ['Red', 'Blue']
          };
          
          console.log('🧪 Testing product creation...');
          const response = await fetch('http://localhost:4002/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testProduct)
          });
          
          const result = await response.json();
          console.log('📥 Response:', response.ok ? 'SUCCESS' : 'FAILED', result);
          
          process.exit(0);
        } catch (error) {
          console.error('❌ Test failed:', error.message);
          process.exit(1);
        }
      }, 1000);
    });
  } catch (error) {
    console.error('❌ Start failed:', error.message);
    process.exit(1);
  }
}

start();
