const express = require('express');
const { register, login, logout } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * POST /api/auth/register
 * Public route - anyone can register
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Public route - anyone can login
 */
router.post('/login', login);

/**
 * POST /api/auth/logout
 * Protected route - only authenticated users can logout
 * authMiddleware checks if user is logged in
 */
router.post('/logout', authMiddleware, logout);

module.exports = router;