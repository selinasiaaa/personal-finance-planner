const {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile
} = require('../controllers/userController');

const User = require('../models/User');

describe('Profile Management - Unit Tests', () => {

  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // UT-11 · View Profile Not Found
  test('UT-11: getUserProfile returns 404 when user not found', async () => {
    const req = { user: { _id: 'invalidUser' } };
    const res = mockRes();

    jest.spyOn(User, 'findById').mockResolvedValue(null);

    await getUserProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'User not found' })
    );
  });

  // UT-12 · Update Profile Success
  test('UT-12: updateUserProfile updates user fields correctly', async () => {
    const req = {
      user: { _id: 'user1' },
      body: { name: 'Updated Name' }
    };

    const res = mockRes();

    const saveMock = jest.fn().mockResolvedValue({
      name: 'Updated Name',
      email: 'old@mail.com'
    });

    const userMock = {
      name: 'Old Name',
      email: 'old@mail.com',
      save: saveMock
    };

    jest.spyOn(User, 'findById').mockResolvedValue(userMock);

    await updateUserProfile(req, res);

    expect(userMock.name).toBe('Updated Name');
    expect(saveMock).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  // UT-13 · Empty Update Request
  test('UT-13: updateUserProfile handles empty request body', async () => {
    const req = {
      user: { _id: 'user1' },
      body: {}
    };

    const res = mockRes();

    const saveMock = jest.fn();

    jest.spyOn(User, 'findById').mockResolvedValue({
      name: 'User',
      email: 'user@test.com',
      save: saveMock
    });

    await updateUserProfile(req, res);

    expect(saveMock).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalled();
  });

  // UT-14 · Delete User Not Found
  test('UT-14: deleteUserProfile returns 404 when user not found', async () => {
    const req = { user: { _id: 'user1' } };
    const res = mockRes();

    jest.spyOn(User, 'findById').mockResolvedValue(null);

    await deleteUserProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'User not found' })
    );
  });

  // UT-15 · Delete User Success
  test('UT-15: deleteUserProfile deletes user successfully', async () => {
    const req = { user: { _id: 'user1' } };
    const res = mockRes();

    jest.spyOn(User, 'findById').mockResolvedValue({ _id: 'user1' });
    const deleteSpy = jest.spyOn(User, 'findByIdAndDelete')
      .mockResolvedValue({});

    await deleteUserProfile(req, res);

    expect(deleteSpy).toHaveBeenCalledWith(req.user._id);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });

});