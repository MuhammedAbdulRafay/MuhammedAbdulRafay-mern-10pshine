const { expect } = require('chai');
const { connectTestDB, disconnectTestDB, clearDatabase } = require('./setup');
const User = require('../models/user');
const { registerUser, loginUser } = require('../services/authService');

/**
 * Test suite for Auth Service
 * Tests the business logic for registration and login
 */
describe('Auth Service', () => {
  // Connect to test database before running tests
  before(async () => {
    await connectTestDB();
  });

  // Clear database before each test (start fresh)
  beforeEach(async () => {
    await clearDatabase();
  });

  // Disconnect after all tests are done
  after(async () => {
    await disconnectTestDB();
  });

  // ===== REGISTER TESTS =====
  describe('registerUser', () => {
    it('should register a new user with valid data', async () => {
      // Arrange - Set up test data
      const userData = {
        username: 'ahmed',
        email: 'ahmed@gmail.com',
        password: 'password123'
      };

      // Act - Call the function
      const result = await registerUser(userData.username, userData.email, userData.password);

      // Assert - Check the result
      expect(result).to.have.property('_id');
      expect(result.username).to.equal('ahmed');
      expect(result.email).to.equal('ahmed@gmail.com');
      expect(result).to.not.have.property('password'); // Password should not be returned
    });

    it('should fail when registering with duplicate email', async () => {
      // Arrange - Create a user first
      await registerUser('ahmed', 'ahmed@gmail.com', 'password123');

      // Act & Assert - Try to register with same email
      try {
        await registerUser('john', 'ahmed@gmail.com', 'password456');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.include('already exists');
        expect(error.status).to.equal(400);
      }
    });

    it('should fail when registering with duplicate username', async () => {
      // Arrange - Create a user first
      await registerUser('ahmed', 'ahmed@gmail.com', 'password123');

      // Act & Assert - Try to register with same username
      try {
        await registerUser('ahmed', 'john@gmail.com', 'password456');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.include('already exists');
        expect(error.status).to.equal(400);
      }
    });

    it('should fail when username is missing', async () => {
      try {
        await registerUser('', 'ahmed@gmail.com', 'password123');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.include('required');
        expect(error.status).to.equal(400);
      }
    });

    it('should fail when email is missing', async () => {
      try {
        await registerUser('ahmed', '', 'password123');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.include('required');
        expect(error.status).to.equal(400);
      }
    });

    it('should fail when password is missing', async () => {
      try {
        await registerUser('ahmed', 'ahmed@gmail.com', '');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.include('required');
        expect(error.status).to.equal(400);
      }
    });
  });

  // ===== LOGIN TESTS =====
  describe('loginUser', () => {
    beforeEach(async () => {
      // Create a user for login tests
      await registerUser('ahmed', 'ahmed@gmail.com', 'password123');
    });

    it('should login user with valid credentials', async () => {
      // Act - Call login
      const result = await loginUser('ahmed@gmail.com', 'password123');

      // Assert - Check result
      expect(result).to.have.property('user');
      expect(result).to.have.property('token');
      expect(result.user.email).to.equal('ahmed@gmail.com');
      expect(result.token).to.be.a('string');
      expect(result.token.length).to.be.greaterThan(0);
    });

    it('should fail login with wrong password', async () => {
      try {
        await loginUser('ahmed@gmail.com', 'wrongpassword');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.include('Invalid email or password');
        expect(error.status).to.equal(401);
      }
    });

    it('should fail login with non-existent email', async () => {
      try {
        await loginUser('nonexistent@gmail.com', 'password123');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.include('Invalid email or password');
        expect(error.status).to.equal(401);
      }
    });

    it('should fail login with missing email', async () => {
      try {
        await loginUser('', 'password123');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.include('required');
        expect(error.status).to.equal(400);
      }
    });

    it('should fail login with missing password', async () => {
      try {
        await loginUser('ahmed@gmail.com', '');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.message).to.include('required');
        expect(error.status).to.equal(400);
      }
    });

    it('should return valid JWT token', async () => {
      // Act
      const result = await loginUser('ahmed@gmail.com', 'password123');

      // Assert - Token should be a valid JWT (3 parts separated by dots)
      const tokenParts = result.token.split('.');
      expect(tokenParts).to.have.lengthOf(3);
      expect(tokenParts[0]).to.be.a('string');
      expect(tokenParts[1]).to.be.a('string');
      expect(tokenParts[2]).to.be.a('string');
    });
  });
});
