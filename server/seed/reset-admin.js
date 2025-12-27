require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, models } = require('../models');

(async () => {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@matinacloset.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin123!';
    const hash = await bcrypt.hash(password, 10);

    await sequelize.authenticate();
    await sequelize.sync();

    let user = await models.User.findOne({ where: { email } });
    if (!user) {
      user = await models.User.create({ name: 'Admin', email, password: hash, role: 'admin' });
      console.log('Created admin user:', email);
    } else {
      await user.update({ name: 'Admin', password: hash, role: 'admin' });
      console.log('Updated admin password and role for:', email);
    }

    console.log('Done. You can now login with:', email);
    process.exit(0);
  } catch (e) {
    console.error('Failed to reset admin:', e);
    process.exit(1);
  }
})();
