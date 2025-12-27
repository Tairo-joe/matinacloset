module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    totalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled'), allowNull: false, defaultValue: 'pending' },
    paymentRef: { type: DataTypes.STRING, allowNull: true },
    paymentMethod: { type: DataTypes.ENUM('visa', 'mtn_momo', 'telecel_cash', 'airteltigo_cash', 'express'), allowNull: true },
    customer: { type: DataTypes.JSON, allowNull: true },
  }, { timestamps: true });

  return Order;
};
