// Ensure JWT_SECRET is set before any module is loaded
process.env.JWT_SECRET = process.env.JWT_SECRET || 'testsecret';

// Mock nodemailer and sendEmail BEFORE importing authController
// so no real email is sent during unit tests
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
  }),
}));

jest.mock('../utils/sendEmail', () => jest.fn().mockResolvedValue(true));

const {
  register,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
} = require('../controllers/authController');

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// ─── Mock helpers ────────────────────────────────────────────────────────────
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

afterEach(() => {
  jest.restoreAllMocks();
});

// ─── 2.1 User Management (Auth) ──────────────────────────────────────────────
describe('User Management - Unit Tests', () => {

  // UT-01 · Register – Missing Fields
  test('UT-01: register returns 400 when required fields are missing', async () => {
    const req = { body: { name: '', email: '', password: '' } };
    const res = mockRes();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Please provide all fields' })
    );
  });

  // UT-02 · Register – Duplicate Email
  test('UT-02: register returns 400 when email already exists', async () => {
    const req = { body: { name: 'Alice', email: 'alice@test.com', password: '123456' } };
    const res = mockRes();

    jest.spyOn(User, 'findOne').mockResolvedValue({ _id: 'existing', email: 'alice@test.com' });

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'User already exists' })
    );
  });

  // UT-03 · Login – Invalid Email
  test('UT-03: login returns 401 when email is not found', async () => {
    const req = { body: { email: 'nobody@test.com', password: '123456' } };
    const res = mockRes();

    jest.spyOn(User, 'findOne').mockResolvedValue(null);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid email' })
    );
  });

  // UT-04 · Login – Wrong Password
  test('UT-04: login returns 401 when password does not match', async () => {
    const req = { body: { email: 'user@test.com', password: 'wrongpass' } };
    const res = mockRes();

    jest.spyOn(User, 'findOne').mockResolvedValue({
      _id: 'u1',
      email: 'user@test.com',
      password: 'hashedpassword',
    });
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid password' })
    );
  });

  // UT-05 · Forgot Password – Email Not Found
  test('UT-05: forgotPassword returns 404 when user email does not exist', async () => {
    const req = { body: { email: 'ghost@test.com' } };
    const res = mockRes();

    jest.spyOn(User, 'findOne').mockResolvedValue(null);

    await forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'There is no user with that email' })
    );
  });

  // UT-06 · Reset Password – Invalid / Expired Token
  test('UT-06: resetPassword returns 400 for invalid or expired token', async () => {
    const req = { params: { resetToken: 'badtoken' }, body: { password: 'newpass123' } };
    const res = mockRes();

    jest.spyOn(User, 'findOne').mockResolvedValue(null);

    await resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid or expired token' })
    );
  });

  // UT-07 · Change Password – Missing Fields
  test('UT-07: changePassword returns 400 when fields are missing', async () => {
    const req = { user: { id: 'u1' }, body: { currentPassword: '', newPassword: '' } };
    const res = mockRes();

    await changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Please provide both current and new passwords' })
    );
  });

  // UT-08 · Change Password – Incorrect Current Password
  test('UT-08: changePassword returns 401 when current password is incorrect', async () => {
    const req = {
      user: { id: 'u1' },
      body: { currentPassword: 'wrongpass', newPassword: 'newpass123' },
    };
    const res = mockRes();

    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue({ _id: 'u1', password: 'hashedpassword' }),
    });
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    await changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Current password is incorrect' })
    );
  });

  // UT-09 · Register – Success
  test('UT-09: register returns 201 with user data and token on success', async () => {
    const req = { body: { name: 'Bob', email: 'bob@test.com', password: '123456' } };
    const res = mockRes();

    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(User, 'create').mockResolvedValue({
      _id: 'u2',
      name: 'Bob',
      email: 'bob@test.com',
    });

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Bob', email: 'bob@test.com', token: expect.any(String) })
    );
  });

  // UT-10 · Login – Success
  test('UT-10: login returns 200 with user data and token on success', async () => {
    const req = { body: { email: 'bob@test.com', password: '123456' } };
    const res = mockRes();

    jest.spyOn(User, 'findOne').mockResolvedValue({
      _id: 'u2',
      name: 'Bob',
      email: 'bob@test.com',
      password: 'hashedpassword',
    });
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'bob@test.com', token: expect.any(String) })
    );
  });
});