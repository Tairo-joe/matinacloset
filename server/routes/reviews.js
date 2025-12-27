const express = require('express');
const { body, validationResult } = require('express-validator');
const { models } = require('../models');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/reviews/:productId
router.post('/:productId', authenticate, body('rating').isInt({ min: 1, max: 5 }), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { rating, comment } = req.body;
  const productId = Number(req.params.productId);
  try {
    const [review, created] = await models.Review.findOrCreate({
      where: { userId: req.user.id, productId },
      defaults: { rating, comment },
    });
    if (!created) await review.update({ rating, comment });
    res.status(created ? 201 : 200).json(review);
  } catch (e) {
    res.status(400).json({ error: 'Failed to submit review' });
  }
});

module.exports = router;
