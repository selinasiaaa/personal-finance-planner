const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const goals = [
  { id: 'goal-1', name: 'Dream Home Down Payment', saved: 88400, target: 130000, status: 'on-track', portfolioType: null },
  { id: 'goal-2', name: 'Personal Savings Fund', saved: 44000, target: 100000, status: 'on-track', portfolioType: null },
  { id: 'goal-3', name: 'Emergency Fund', saved: 16500, target: 30000, status: 'at-risk', portfolioType: null },
  { id: 'goal-4', name: 'Travel Fund', saved: 16400, target: 20000, status: 'on-track', portfolioType: null },
  { id: 'goal-5', name: 'Early Retirement Fund', saved: 210000, target: 1000000, status: 'high-risk', portfolioType: null },
  { id: 'goal-6', name: 'Japan Travel Fund', saved: 5500, target: 5500, status: 'completed', portfolioType: null },
  { id: 'goal-7', name: 'Laptop Upgrade Fund', saved: 4000, target: 4000, status: 'completed', portfolioType: null },
];

app.put('/api/goals/:id/apply-portfolio', (req, res) => {
  const goalId = req.params.id;
  const { portfolioType } = req.body;

  if (!portfolioType) {
    return res.status(400).json({ message: 'portfolioType is required' });
  }

  const goal = goals.find(g => g.id === goalId);
  if (!goal) {
    return res.status(404).json({ message: 'Goal not found' });
  }

  goal.portfolioType = portfolioType;
  if (portfolioType === 'aggressive') {
    goal.status = 'high-risk';
  } else if (portfolioType === 'balanced') {
    goal.status = 'on-track';
  } else if (portfolioType === 'conservative') {
    goal.status = goal.status === 'completed' ? 'completed' : 'on-track';
  }

  return res.json(goal);
});

const users = []; // In-memory user store for demo

// User Registration
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields required' });
  }
  const existing = users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const user = { id: users.length + 1, name, email, password }; // In real app, hash password
  users.push(user);
  res.status(201).json({ id: user.id, name, email });
});

// User Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  res.json({ id: user.id, name: user.name, email: user.email });
});

app.post('/api/change-password', (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  if (!email || !currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Email, current password, and new password are required.' });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (user.password !== currentPassword) {
    return res.status(400).json({ message: 'Current password is incorrect.' });
  }

  user.password = newPassword;
  return res.json({ message: 'Password changed successfully.' });
});

// Forgot Password (mock)
app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  // In real app, send email
  res.json({ message: 'Reset link sent' });
});

// Profile Management
app.put('/api/profile', (req, res) => {
  // Assume user is authenticated, for demo use first user
  const { name, email, phone, dob, occupation, address, city, country } = req.body;
  if (users.length > 0) {
    users[0].name = name;
    users[0].email = email;
    users[0].phone = phone;
    users[0].dob = dob;
    users[0].occupation = occupation;
    users[0].address = address;
    users[0].city = city;
    users[0].country = country;
    res.json(users[0]);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

app.delete('/api/profile', (req, res) => {
  // Delete user
  if (users.length > 0) {
    users.splice(0, 1);
    res.json({ message: 'Account deleted' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Market Insights (Backend F)
app.get('/api/market-insights', (req, res) => {
  // Mock data
  res.json({
    trend: 'Bullish',
    sp500: '+2.5%',
    topPerformer: 'Tech Stocks',
    performance: '+15%',
    riskLevel: 'Moderate'
  });
});

app.listen(PORT, () => {
  console.log(`Personal Finance Planner API is running on http://localhost:${PORT}`);
});
