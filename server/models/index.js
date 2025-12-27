const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const databaseUrl = process.env.DATABASE_URL || `sqlite:${path.join(__dirname, '..', 'data', 'matinacloset.sqlite')}`;
const sequelize = new Sequelize(databaseUrl, { 
  logging: false,
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'data', 'matinacloset.sqlite')
});

// Models
const User = require('./user')(sequelize, DataTypes);
const Product = require('./product')(sequelize, DataTypes);
const Review = require('./review')(sequelize, DataTypes);
const Order = require('./order')(sequelize, DataTypes);
const OrderItem = require('./orderItem')(sequelize, DataTypes);
const CartItem = require('./cartItem')(sequelize, DataTypes);

// Associations
User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Review, { foreignKey: 'userId' });
Review.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Review, { foreignKey: 'productId' });
Review.belongsTo(Product, { foreignKey: 'productId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Product.hasMany(OrderItem, { foreignKey: 'productId' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

User.hasMany(CartItem, { foreignKey: 'userId' });
CartItem.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(CartItem, { foreignKey: 'productId' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });

module.exports = {
  sequelize,
  Sequelize,
  models: { User, Product, Review, Order, OrderItem, CartItem },
};
