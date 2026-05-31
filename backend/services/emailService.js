const nodemailer = require('nodemailer');
const { logger } = require('../utils/logger');

/**
 * Email service for sending reset password emails
 */

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use Gmail (easiest for testing)
  auth: {
    user: process.env.EMAIL_USER,     // Your Gmail address
    pass: process.env.EMAIL_PASSWORD   // Your Gmail password (or app password)
  }
});

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Reset Your Password</h2>
        <p>You requested a password reset. Click the link below:</p>
        <a href="${resetLink}" style="background-color: #ffffff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
        <p>Or copy this link: ${resetLink}</p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, ignore this email.</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    logger.info(`Password reset email sent to: ${email}`);
  } catch (error) {
    logger.error(`Failed to send reset email: ${error.message}`);
    throw error;
  }
};

module.exports = {
  sendPasswordResetEmail
};