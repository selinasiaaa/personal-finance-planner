const { saveRoi, getRoi, deleteRoi } = require('../controllers/roiController');
const RoiCalculation = require('../models/RoiCalculation');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

afterEach(() => {
    jest.restoreAllMocks();
});

describe('ROI Controller - Unit Tests', () => {
    test('UT-01 saveRoi returns 201 and created roi', async () => {
        const req = { user: { _id: 'user1' }, body: { mode: 'simple', principal: 1000, monthlyContribution: 0, annualInterestRate: 5, durationInYears: 1, invested: 1000, futureValue: 1050, profit: 50, gainPercentage: 5, timeLineData: {} } };
        const res = mockRes();
        jest.spyOn(RoiCalculation, 'create').mockResolvedValue({ _id: 'r1', initialInvestment: 1000 });
        await saveRoi(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ _id: 'r1' }));
    });

    test('UT-02 saveRoi unauthorized when no user', async () => {
        const req = { body: {} };
        const res = mockRes();
        await saveRoi(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Unauthorized' }));
    });

    test('UT-03 getRoi unauthorized when no user', async () => {
        const req = {};
        const res = mockRes();
        await getRoi(req, res);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Unauthorized' }));
    });

    test('UT-04 getRoi returns user history', async () => {
        const req = { user: { _id: 'user1' } };
        const res = mockRes();
        jest.spyOn(RoiCalculation, 'find').mockReturnValue({ sort: jest.fn().mockResolvedValue([{ _id: 'r1' }]) });
        await getRoi(req, res);
        expect(res.json).toHaveBeenCalledWith(expect.any(Array));
    });

    test('UT-05 deleteRoi returns 403 if not owner', async () => {
        const req = { params: { roiId: 'r1' }, user: { _id: 'owner2' } };
        const res = mockRes();
        jest.spyOn(RoiCalculation, 'findById').mockResolvedValue({ _id: 'r1', userId: 'owner1' });
        await deleteRoi(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('Forbidden') }));
    });
});
