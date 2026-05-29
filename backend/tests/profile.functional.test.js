const request = require('supertest');
const app = require('../server');

const User = require('../models/User');
const createTestJWT = require('../utils/createTestJWT');

describe('Profile Management - Functional Tests', () => {

  // FT-01 View Profile
  test('FT-01: GET /api/users/profile returns user data', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@user.com',
      password: '123456'
    });

    const token = createTestJWT(user._id);

    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', 'test@user.com');
  });

  // FT-02 Update Profile
  test('FT-02: PUT /api/users/profile updates user profile', async () => {
    const user = await User.create({
      name: 'Old Name',
      email: 'old@mail.com',
      password: '123456'
    });

    const token = createTestJWT(user._id);

    const res = await request(app)
      .put('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Name' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', 'New Name');
  });

  // FT-03 Change Password
  test('FT-03: PUT /api/users/change-password updates password', async () => {
    const user = await User.create({
      name: 'User',
      email: 'user@mail.com',
      password: '123456'
    });

    const token = createTestJWT(user._id);

    const res = await request(app)
      .put('/api/users/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        oldPassword: '123456',
        newPassword: 'newpass123'
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  // FT-04 Delete Account
  test('FT-04: DELETE /api/users/profile removes account', async () => {
    const user = await User.create({
      name: 'Delete User',
      email: 'delete@test.com',
      password: '123456'
    });

    const token = createTestJWT(user._id);

    const res = await request(app)
      .delete('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

});