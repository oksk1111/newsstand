const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/index');

// Test database
const MONGODB_URI = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/newsstand_test';

describe('API Integration Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear all collections before each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  });

  describe('Health Check', () => {
    test('GET /health should return 200', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
    });
  });

  describe('Authentication', () => {
    test('POST /api/auth/guest should create guest session', async () => {
      const response = await request(app)
        .post('/api/auth/guest');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.isGuest).toBe(true);
    });

    test('POST /api/auth/register should create new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.isGuest).toBe(false);
    });

    test('POST /api/auth/login should authenticate user', async () => {
      // First register a user
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Then login
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
    });
  });

  describe('News API', () => {
    test('GET /api/news should return news feed', async () => {
      const response = await request(app).get('/api/news');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('GET /api/news with category filter should work', async () => {
      const response = await request(app)
        .get('/api/news?category=technology&limit=5');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.metadata.category).toBe('technology');
    });

    test('GET /api/news/categories/stats should return category statistics', async () => {
      const response = await request(app).get('/api/news/categories/stats');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('User API', () => {
    let authToken;
    let userId;

    beforeEach(async () => {
      // Create a test user for authenticated endpoints
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      authToken = response.body.token;
      userId = response.body.user.id;
    });

    test('GET /api/user/profile should return user profile', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.profile.id).toBe(userId);
    });

    test('PUT /api/user/preferences should update preferences', async () => {
      const preferences = {
        categories: ['technology', 'business'],
        theme: 'dark',
        language: 'en',
      };

      const response = await request(app)
        .put('/api/user/preferences')
        .set('Authorization', `Bearer ${authToken}`)
        .send(preferences);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.preferences.categories).toEqual(preferences.categories);
      expect(response.body.preferences.theme).toBe(preferences.theme);
    });

    test('GET /api/user/stats should return user statistics', async () => {
      const response = await request(app)
        .get('/api/user/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
      expect(typeof response.body.stats.totalInteractions).toBe('number');
    });
  });

  describe('Error Handling', () => {
    test('GET /invalid-route should return 404', async () => {
      const response = await request(app).get('/invalid-route');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Route not found');
    });

    test('POST /api/auth/login with invalid credentials should return 401', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    test('GET /api/user/profile without token should return 401', async () => {
      const response = await request(app).get('/api/user/profile');
      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access denied. No token provided.');
    });
  });
});
