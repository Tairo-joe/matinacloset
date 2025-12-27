const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { sequelize } = require('./models');
const dotenv = require('dotenv');

// Load environment variables from root directory
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend
const clientDir = path.join(__dirname, '..', 'client');
if (!fs.existsSync(clientDir)) {
  fs.mkdirSync(clientDir, { recursive: true });
}
app.use(express.static(clientDir));

// Serve static files from root directory (for logo)
const rootDir = path.join(__dirname, '..');
app.use(express.static(rootDir));

// Serve uploaded files
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));

// Webhook routes (must be before other routes to avoid conflicts)
app.post('/webhook/paystack', require('./routes/orders').paystackWebhookHandler);
app.post('/webhook/stripe', require('./routes/orders').stripeWebhookHandler);

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(clientDir, 'index.html'));
});

// Start server
async function startServer() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected successfully');
    
    console.log('Syncing database models...');
    try {
      await sequelize.sync();
      console.log('Database models synchronized successfully');
    } catch (syncError) {
      console.error('Database sync failed:', syncError.message);
      throw syncError;
    }
    
    app.listen(PORT, () => {
      console.log(`MatinaCloset server running on http://localhost:${PORT}`);
      console.log('Environment:', process.env.NODE_ENV || 'development');
    });
  } catch (e) {
    console.error('Failed to start server:', e);
    console.error('Error details:', e.message);
    if (e.stack) console.error('Stack trace:', e.stack);
    
    setTimeout(() => {
      console.log('Exiting due to startup failure...');
      process.exit(1);
    }, 3000);
  }
}

startServer();
