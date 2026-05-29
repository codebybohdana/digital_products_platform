const express = require('express');
const db = require('../db/pool');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT c.id, c.product_id, p.title, p.price, p.category, p.cover_path,
              u.name AS author_name
       FROM cart_items c
       JOIN products p ON c.product_id = p.id
       JOIN users u ON p.author_id = u.id
       WHERE c.user_id = $1 AND p.is_active = true
       ORDER BY c.added_at DESC`,
      [req.user.id]
    );
    return res.json({ items: rows });
  } catch (err) {
    next(err);
  }
});

router.post('/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;

    const { rows: products } = await db.query(
      'SELECT id, author_id FROM products WHERE id = $1 AND is_active = true',
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (products[0].author_id === req.user.id) {
      return res.status(400).json({ error: 'You cannot add your own product to cart' });
    }

    await db.query(
      'INSERT INTO cart_items (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, productId]
    );

    return res.status(201).json({ message: 'Added to cart' });
  } catch (err) {
    next(err);
  }
});

// Declare DELETE / before DELETE /:productId to avoid route collision
router.delete('/', async (req, res, next) => {
  try {
    await db.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
    return res.json({ message: 'Cart cleared' });
  } catch (err) {
    next(err);
  }
});

router.delete('/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    await db.query(
      'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [req.user.id, productId]
    );
    return res.json({ message: 'Removed from cart' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
