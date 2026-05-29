const request = require('supertest');
const app = require('../server');

const User = require('../models/User');
const createTestJWT = require('../utils/createTestJWT');

describe('Profile Management - Functional Tests', () => {

  afterEach(async () => {
    await User.deleteMany({});
  });

  // FT-06 · Unauthorized Access
  test('FT-06: GET /api/users/profile returns 401 when no token', async () => {
    const res = await request(app).get('/api/users/profile');
    expect(res.status).toBe(401);
  });

  // FT-07 · Invalid Token
  test('FT-07: GET /api/users/profile rejects invalid token', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'Bearer invalidtoken');

    expect([401, 403]).toContain(res.status);
  });

  // FT-08 · Update Without Auth
  test('FT-08: PUT /api/users/profile without token returns 401', async () => {
    const res = await request(app)
      .put('/api/users/profile')
      .send({ name: 'Hack Attempt' });

    expect(res.status).toBe(401);
  });

  // FT-09 · Change Password Wrong Old Password
  test('FT-09: PUT /api/users/change-password rejects invalid password', async () => {
    const user = await User.create({
      name: 'User',
      email: 'wrong@test.com',
      password: '123456'
    });

    const token = createTestJWT(user._id);

    const res = await request(app)
      .put('/api/users/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        oldPassword: 'wrongpass',
        newPassword: 'newpass123'
      });

    expect([400, 401]).toContain(res.status);
  });

  // FT-10 · Delete Account Without Auth
  test('FT-10: DELETE /api/users/profile returns 401 without auth', async () => {
    const res = await request(app)
      .delete('/api/users/profile');

    expect(res.status).toBe(401);
  });

});