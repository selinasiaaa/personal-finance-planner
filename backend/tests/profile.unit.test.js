const { getUserProfile, updateUserProfile, deleteUserProfile } = require('../controllers/userController');
const User = require('../models/User');

describe('Profile Management - Unit Tests', () => {
  
  // Helper mock response
  const mockRes = () => {
    const res = {};
    res.json = jest.fn().mockReturnValue(res);
    res.status = jest.fn().mockReturnValue(res);
    return res;
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // UT-01 View Profile
  test('UT-01: getUserProfile returns user data correctly', async () => {
    const req = { user: { _id: 'user1' } };
    const res = mockRes();

    jest.spyOn(User, 'findById').mockResolvedValue({
      _id: 'user1',
      name: 'Ali',
      email: 'ali@test.com',
      phone: '0123456789',
      occupation: 'Student'
    });

    await getUserProfile(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Ali',
        email: 'ali@test.com'
      })
    );
  });

  // UT-02 Update Profile
  test('UT-02: updateUserProfile updates fields correctly', async () => {
    const req = {
      user: { _id: 'user1' },
      body: { name: 'New Name', city: 'KL' }
    };

    const res = mockRes();

    const saveMock = jest.fn().mockResolvedValue(true);

    jest.spyOn(User, 'findById').mockResolvedValue({
      name: 'Old Name',
      city: 'Old City',
      save: saveMock
    });

    await updateUserProfile(req, res);

    expect(saveMock).toHaveBeenCalled();
  });

  // UT-03 Delete Profile
  test('UT-03: deleteUserProfile deletes account successfully', async () => {
    const req = { user: { _id: 'user1' } };
    const res = mockRes();

    jest.spyOn(User, 'findById').mockResolvedValue({ _id: 'user1' });
    jest.spyOn(User, 'findByIdAndDelete').mockResolvedValue({});

    await deleteUserProfile(req, res);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'User account deleted successfully'
      })
    );
  });

});