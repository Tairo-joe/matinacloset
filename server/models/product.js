module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    imageURL: { type: DataTypes.STRING, allowNull: false },
    images: { type: DataTypes.JSON, defaultValue: [] }, // Multiple images array
    description: { type: DataTypes.TEXT, allowNull: false },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    sizes: { type: DataTypes.JSON, defaultValue: [] },
    colors: { type: DataTypes.JSON, defaultValue: [] },
    gender: { type: DataTypes.ENUM('men', 'women', 'boys', 'girls'), allowNull: false, defaultValue: 'men' },
  }, { timestamps: true });

  return Product;
};
