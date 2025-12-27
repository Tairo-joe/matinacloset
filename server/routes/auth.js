const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { models, Sequelize } = require('../models');
const { sendEmail } = require('../config/email');

const router = express.Router();

function signToken(user) {
  const payload = { id: user.id, role: user.role };
  const secret = process.env.JWT_SECRET || 'dev_secret';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

// Generate reset token
function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Forgot password endpoint
router.post('/forgot-password',
  body('email').isEmail(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email } = req.body;
    
    console.log('🔐 FORGOT PASSWORD REQUEST:');
    console.log('   Email:', email);
    console.log('   Time:', new Date().toISOString());
    
    try {
      const user = await models.User.findOne({ where: { email } });
      
      // Always return success to prevent email enumeration attacks
      if (!user) {
        console.log('   User not found, but returning success for security');
        return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
      }
      
      // Generate reset token
      const resetToken = generateResetToken();
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
      
      // Save reset token to user record
      await user.update({
        resetToken: resetToken,
        resetTokenExpiry: resetTokenExpiry
      });
      
      console.log('   Reset token generated for user ID:', user.id);
      
      // Create reset link
      const resetLink = `${req.protocol}://${req.get('host')}/reset-password.html?token=${resetToken}`;
      console.log('   Reset link:', resetLink);
      
      try {
        // Send real email
        await sendEmail(user.email, 'forgotPassword', [resetLink, user.name]);
        console.log('   📧 Password reset email sent successfully to:', user.email);
      } catch (emailError) {
        console.error('   ❌ Failed to send email:', emailError);
        // Still return success to user but log the error
        console.log('   ⚠️ User will see success message but email failed to send');
      }
      
      res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
      
    } catch (error) {
      console.error('   ❌ Forgot password error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Reset password endpoint
router.post('/reset-password',
  body('token').isLength({ min: 32 }),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { token, password } = req.body;
    
    console.log('🔐 RESET PASSWORD REQUEST:');
    console.log('   Token provided:', token ? 'Yes' : 'No');
    console.log('   Token:', token);
    console.log('   Time:', new Date().toISOString());
    
    try {
      // First check if the token exists at all
      const tokenUser = await models.User.findOne({ 
        where: { resetToken: token }
      });
      console.log('   User with token found:', !!tokenUser);
      if (tokenUser) {
        console.log('   Token expiry:', tokenUser.resetTokenExpiry);
        console.log('   Current time:', new Date());
        console.log('   Is token expired:', new Date() > tokenUser.resetTokenExpiry);
      }
      
      const user = await models.User.findOne({ 
        where: { 
          resetToken: token,
          resetTokenExpiry: { 
            [Sequelize.Op.gt]: new Date() 
          }
        }
      });
      
      if (!user) {
        console.log('   Invalid or expired token');
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }
      
      console.log('   Valid token found for user ID:', user.id);
      
      // Hash new password
      const hash = await bcrypt.hash(password, 10);
      
      // Update password and clear reset token
      await user.update({
        password: hash,
        resetToken: null,
        resetTokenExpiry: null
      });
      
      console.log('   ✅ Password reset successful for user ID:', user.id);
      
      res.json({ message: 'Password reset successful' });
      
    } catch (error) {
      console.error('   ❌ Reset password error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.post('/register',
  body('name').isLength({ min: 2 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    const existing = await models.User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const user = await models.User.create({ name, email, password: hash, role: 'user' });
    const token = signToken(user);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  }
);

router.post('/login',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    
    console.log('🔐 LOGIN ATTEMPT:');
    console.log('   Email:', email);
    console.log('   Password length:', password.length);
    console.log('   Time:', new Date().toISOString());
    
    const user = await models.User.findOne({ where: { email } });
    
    console.log('   User found in database:', !!user);
    if (user) {
      console.log('   User ID:', user.id);
      console.log('   User name:', user.name);
      console.log('   User role:', user.role);
      console.log('   User created:', user.createdAt);
    }
    
    if (!user) {
      console.log('   ❌ Login failed: User not found');
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    const ok = await bcrypt.compare(password, user.password);
    console.log('   Password match:', ok);
    
    if (!ok) {
      console.log('   ❌ Login failed: Password mismatch');
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user);
    console.log('   ✅ Login successful!');
    console.log('   Token generated for user ID:', user.id);
    
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  }
);

router.get('/me', async (req, res) => {
  // This endpoint expects Authorization header but tolerates absence
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.json({ user: null });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    const user = await models.User.findByPk(payload.id, { attributes: ['id', 'name', 'email', 'role'] });
    if (!user) return res.json({ user: null });
    res.json({ user });
  } catch (_e) {
    return res.json({ user: null });
  }
});

module.exports = router;
