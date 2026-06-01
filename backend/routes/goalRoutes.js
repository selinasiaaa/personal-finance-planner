/**
 * routes/goalRoutes.js
 */

const express = require('express'); //loads the Express framework into this file.
const router = express.Router(); //  any request starting with /api/goals gets handed to this router
const { protect } = require('../middleware/authMiddleware'); // protect is a middleware — its job is to verify the JWT token before any route handler runs.
const {
  getGoals,
  getSummary,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  getAdvice,
  assignPortfolio,
} = require('../controllers/goalController'); // Pull out all the handler functions from the backend goalController.js.

// All goal routes are protected
router.use(protect); // router.use() means — every single incoming request, regardless of method, must pass through protect first before reaching any handler.
//If the token is invalid or missing, protect immediately returns 401 and the route handler never runs.

router.get('/summary', getSummary);          // GET  /api/goals/summary
router.get('/', getGoals);                   // GET  /api/goals
router.get('/:id', getGoal);                 // GET  /api/goals/:id    | :id literally means — match ANY string in this position, no exceptions.
router.post('/', createGoal);                // POST /api/goals
router.put('/:id', updateGoal);              // PUT  /api/goals/:id
router.delete('/:id', deleteGoal);           // DELETE /api/goals/:id
router.post('/:id/advice', getAdvice);       // POST /api/goals/:id/advice  ← AI
router.put('/:id/portfolio', assignPortfolio); // PUT /api/goals/:id/portfolio

//Express checks top to bottom, and runs the first match it finds.

module.exports = router;











































