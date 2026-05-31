const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authService = require('../services/authService');
const { logger } = require('../utils/logger');  // ← ADD THIS LINE

/**
 * POST /api/auth/forgot-password
 * User enters email, sends reset link
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required'
      });
    }

    const result = await authService.requestPasswordReset(email);

    res.json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/reset-password
 * User enters new password with reset token
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Token and password required'
      });
    }

    const result = await authService.resetPassword(resetToken, newPassword);

    res.json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    const status = error.status || 500;
    res.status(status).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;