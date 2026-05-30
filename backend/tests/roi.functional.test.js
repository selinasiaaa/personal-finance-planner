const express = require('express');
const request = require('supertest');
const bodyParser = require('body-parser');
const roiController = require('../controllers/roiController');
const RoiCalculation = require('../models/RoiCalculation');

const app = express();
app.use(bodyParser.json());
const fakeProtect = (req, res, next) => { req.user = { _id: 'user1' }; next(); };

app.post('/roi/save', fakeProtect, roiController.saveRoi);
app.get('/roi/history/:userId', fakeProtect, roiController.getRoi);
app.delete('/roi/delete/:roiId', fakeProtect, roiController.deleteRoi);
app.delete('/roi/history', fakeProtect, roiController.deleteManyRoi);

afterEach(() => {
    jest.restoreAllMocks();
});

describe('ROI Routes - Functional Tests', () => {
    test('FT-01 POST /roi/save returns 201 and json', async () => {
        jest.spyOn(RoiCalculation, 'create').mockResolvedValue({ _id: 'r1', initialInvestment: 1000 });
        const res = await request(app)
            .post('/roi/save')
            .send({ mode: 'simple', principal: 1000 });
        expect(res.status).toBe(201);
        expect(res.headers['content-type']).toMatch(/application\/json/);
        expect(res.body).toHaveProperty('_id', 'r1');
    });

    test('FT-02 GET /roi/history/:userId returns history array', async () => {
        jest.spyOn(RoiCalculation, 'find').mockReturnValue({ sort: jest.fn().mockResolvedValue([{ _id: 'r1' }]) });
        const res = await request(app).get('/roi/history/user1');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('FT-03 DELETE /roi/delete/:roiId returns 404 when not found', async () => {
        jest.spyOn(RoiCalculation, 'findById').mockResolvedValue(null);
        const res = await request(app).delete('/roi/delete/notfound');
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message', 'Roi record not found');
    });

    test('FT-04 DELETE /roi/delete/:roiId returns 200 on success', async () => {
        jest.spyOn(RoiCalculation, 'findById').mockResolvedValue({ _id: 'r1', userId: 'user1' });
        jest.spyOn(RoiCalculation, 'findByIdAndDelete').mockResolvedValue({});
        const res = await request(app).delete('/roi/delete/r1');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message');
    });

    test('FT-05 DELETE /roi/history deletes many and returns deletedCount', async () => {
        jest.spyOn(RoiCalculation, 'deleteMany').mockResolvedValue({ deletedCount: 2 });
        const res = await request(app).delete('/roi/history').send({ ids: ['r1', 'r2'] });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('deletedCount', 2);
    });
});
