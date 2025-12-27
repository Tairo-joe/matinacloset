require('dotenv').config();
const bcrypt = require('bcryptjs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL || `sqlite:${path.join(__dirname, 'server', 'data', 'matinacloset.sqlite')}`;
const sequelize = new Sequelize(databaseUrl, { logging: false });

// Define User model
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('user', 'admin'), allowNull: false, defaultValue: 'user' },
}, { timestamps: true });

async function createAdmin() {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@matinacloset.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    
    let admin = await User.findOne({ where: { email: adminEmail } });
    if (!admin) {
      const hash = await bcrypt.hash(adminPassword, 10);
      admin = await User.create({ name: 'Admin', email: adminEmail, password: hash, role: 'admin' });
      console.log('✅ Created admin user:', adminEmail);
    } else {
      console.log('ℹ️ Admin user already exists');
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createAdmin();
