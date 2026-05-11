const { expect } = require('chai');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const authMiddleware = require('../middleware/authMiddleware');

// Load environment variables to get the actual JWT_SECRET
dotenv.config();

/**
 * Test suite for Auth Middleware
 */
describe('Auth Middleware', () => {
  // Use the actual JWT_SECRET from .env (not a test secret)
  const JWT_SECRET = process.env.JWT_SECRET;
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      path: '/api/test'
    };
    mockRes = {
      status: function() { return this; },
      json: function() { return this; }
    };
    mockNext = function() {};
  });

  // ... rest of tests stay the same ...


  // ===== VALID TOKEN TESTS =====
  describe('Valid Token', () => {
    it('should pass through with valid token', (done) => {
      // Arrange - Create a valid token
      const token = jwt.sign(
        { userId: '123', email: 'test@gmail.com', username: 'test' },
        JWT_SECRET
      );
      mockReq.headers.authorization = `Bearer ${token}`;

      // Override next to verify it was called
      mockNext = function(err) {
        // Assert
        expect(err).to.be.undefined;
        expect(mockReq.user).to.exist;
        expect(mockReq.user.userId).to.equal('123');
        expect(mockReq.user.email).to.equal('test@gmail.com');
        done();
      };

      // Act
      authMiddleware(mockReq, mockRes, mockNext);
    });
  });

  // ===== MISSING TOKEN TESTS =====
  describe('Missing Token', () => {
    it('should return 401 when no token provided', (done) => {
      // Arrange - No authorization header
      mockReq.headers = {};

      // Override next to verify error
      mockNext = function(err) {
        // Assert
        expect(err).to.exist;
        expect(err.message).to.include('No token provided');
        expect(err.status).to.equal(401);
        done();
      };

      // Act
      authMiddleware(mockReq, mockRes, mockNext);
    });

    it('should return 401 when authorization header is empty', (done) => {
      // Arrange
      mockReq.headers.authorization = '';

      // Override next
      mockNext = function(err) {
        // Assert
        expect(err).to.exist;
        expect(err.status).to.equal(401);
        done();
      };

      // Act
      authMiddleware(mockReq, mockRes, mockNext);
    });

    it('should return 401 when header format is invalid', (done) => {
      // Arrange - Missing "Bearer" prefix
      mockReq.headers.authorization = 'InvalidToken123';

      // Override next
      mockNext = function(err) {
        // Assert
        expect(err).to.exist;
        expect(err.status).to.equal(401);
        done();
      };

      // Act
      authMiddleware(mockReq, mockRes, mockNext);
    });
  });

  // ===== INVALID TOKEN TESTS =====
  // ===== INVALID TOKEN TESTS =====
  describe('Invalid Token', () => {
    it('should return 401 with invalid token signature', (done) => {
      // Arrange - Token signed with different secret
      const invalidToken = jwt.sign(
        { userId: '123', email: 'test@gmail.com' },
        'different_secret'
      );
      mockReq.headers.authorization = `Bearer ${invalidToken}`;

      // Override next
      mockNext = function(err) {
        // Assert
        expect(err).to.exist;
        expect(err.status).to.equal(401);
        done();
      };

      // Act
      authMiddleware(mockReq, mockRes, mockNext);
    });

    it('should return 401 with expired token', (done) => {
      // Arrange - Create token that expired 1 second ago
      const expiredToken = jwt.sign(
        { userId: '123', email: 'test@gmail.com' },
        JWT_SECRET,
        { expiresIn: '-1s' }
      );
      mockReq.headers.authorization = `Bearer ${expiredToken}`;

      // Override next
      mockNext = function(err) {
        // Assert
        expect(err).to.exist;
        expect(err.status).to.equal(401);
        // Just check it's an error, don't check exact message
        done();
      };

      // Act
      authMiddleware(mockReq, mockRes, mockNext);
    });

    it('should return 401 with malformed token', (done) => {
      // Arrange - Not a valid JWT
      mockReq.headers.authorization = 'Bearer notavalidtoken';

      // Override next
      mockNext = function(err) {
        // Assert
        expect(err).to.exist;
        expect(err.status).to.equal(401);
        done();
      };

      // Act
      authMiddleware(mockReq, mockRes, mockNext);
    });
  });

  // ===== TOKEN PAYLOAD TESTS =====
  describe('Token Payload', () => {
    it('should attach correct user info to req.user', (done) => {
      // Arrange
      const token = jwt.sign(
        {
          userId: 'user123',
          email: 'ahmed@gmail.com',
          username: 'ahmed'
        },
        JWT_SECRET
      );
      mockReq.headers.authorization = `Bearer ${token}`;

      // Override next
      mockNext = function(err) {
        // Assert - should NOT have error
        expect(err).to.be.undefined;
        expect(mockReq.user).to.exist;
        expect(mockReq.user.userId).to.equal('user123');
        expect(mockReq.user.email).to.equal('ahmed@gmail.com');
        expect(mockReq.user.username).to.equal('ahmed');
        done();
      };

      // Act
      authMiddleware(mockReq, mockRes, mockNext);
    });
  });
});