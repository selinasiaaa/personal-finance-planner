import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Chart from 'chart.js/auto';
import './App.css';

// ═══════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════
const API_BASE = import.meta.env.VITE_API_BASE || '';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isStrongPassword = (password) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);

const getStoredUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || 'null');
  } catch { return null; }
};

const setStoredUser = (user, remember = true) => {
  const s = JSON.stringify(user);
  if (remember) { localStorage.setItem('user', s); sessionStorage.removeItem('user'); }
  else          { sessionStorage.setItem('user', s); localStorage.removeItem('user'); }
};

const clearStoredUser = () => {
  localStorage.removeItem('user');
  sessionStorage.removeItem('user');
};

const apiRequest = async (path, options = {}) => {
  const config = {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  };
  const response = await fetch(`${API_BASE}${path}`, config);
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) throw new Error(data?.message || 'Request failed.');
  return data;
};

// ═══════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════
const Sidebar = ({ currentPage, user, isAuthPage }) => {
  const navigate = useNavigate();
  if (isAuthPage) return null;

  const userInitials = user?.name
    ? user.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
    : 'GU';

  const navItems = [
    { page: 'goals',       label: 'Financial Goals',  icon: 'bi-flag-fill',           path: '/' },
    { page: 'investments', label: 'Investments',       icon: 'bi-graph-up-arrow',      path: '/investments' },
    { page: 'roi',         label: 'ROI Calculator',    icon: 'bi-calculator-fill',     path: '/roi' },
    { page: 'dashboard',   label: 'Market Insights',   icon: 'bi-bar-chart-line-fill', path: '/dashboard' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon"><i className="bi bi-bar-chart-fill"></i></div>
        <span className="logo-text">WealthTrack</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.page}
            onClick={() => navigate(item.path)}
            className={`nav-item ${currentPage === item.page ? 'active' : ''}`}
            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', padding: '11px 14px' }}
          >
            <i className={`bi ${item.icon}`}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button
          onClick={() => navigate('/profile')}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            width: '100%',
            background: currentPage === 'profile' ? 'var(--blue-light)' : 'transparent',
            border: currentPage === 'profile' ? '1.5px solid #c7d2fe' : '1.5px solid transparent',
            borderRadius: 'var(--r-sm)', padding: '8px 10px', cursor: 'pointer',
            transition: 'background 0.2s, border-color 0.2s', textAlign: 'left',
          }}
          onMouseEnter={e => { if (currentPage !== 'profile') e.currentTarget.style.background = 'var(--blue-light)'; }}
          onMouseLeave={e => { if (currentPage !== 'profile') e.currentTarget.style.background = 'transparent'; }}
          title="View Profile"
        >
          <div className="user-avatar" style={{ flexShrink: 0 }}>{userInitials}</div>
          <div style={{ minWidth: 0 }}>
            <p className="user-name" style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Guest'}
            </p>
            <p className="user-role" style={{ margin: 0 }}>
              {user ? 'Active Session' : 'Guest Access'}
            </p>
          </div>
        </button>
        {user && (
          <button
            onClick={() => { clearStoredUser(); navigate('/login'); }}
            className="sidebar-logout"
            style={{ background: 'none', border: 'none' }}
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
};

// ═══════════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════════
const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: true });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (getStoredUser()?.email) navigate('/'); }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isValidEmail(formData.email)) { setError('Please enter a valid email address.'); return; }
    if (!formData.password)            { setError('Please enter your password.');          return; }
    setLoading(true);
    try {
      const user = await apiRequest('/api/login', { method: 'POST', body: JSON.stringify({ email: formData.email, password: formData.password }) });
      setStoredUser(user, formData.rememberMe);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e8eeff, #eef1f8)' }}>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Sign In</h2>
            <p>Access your financial dashboard</p>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="Enter your email" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="Enter your password" />
            </div>
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" checked={formData.rememberMe} onChange={e => setFormData({ ...formData, rememberMe: e.target.checked })} />
                Remember me
              </label>
              <a href="/forgot-password" className="forgot-link">Forgot password?</a>
            </div>
            <button type="submit" className="btn-auth" disabled={loading}>{loading ? 'Signing In...' : 'Sign In'}</button>
          </form>
          <div className="auth-footer"><p>Don't have an account? <a href="/register">Sign up</a></p></div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// REGISTER PAGE
// ═══════════════════════════════════════════════════════
const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', agreeTerms: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (getStoredUser()?.email) navigate('/'); }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name)                              { setError('Please enter your full name.');                                          return; }
    if (!isValidEmail(formData.email))               { setError('Please enter a valid email address.');                                  return; }
    if (!isStrongPassword(formData.password))        { setError('Password must be at least 8 characters and include a letter and a number.'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match.');                                           return; }
    if (!formData.agreeTerms)                        { setError('You must agree to the terms.');                                         return; }
    setLoading(true);
    try {
      await apiRequest('/api/register', { method: 'POST', body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }) });
      alert('Registration successful. You can sign in now.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e8eeff, #eef1f8)' }}>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header"><h2>Create Account</h2><p>Start managing your finances today</p></div>
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}
            <div className="form-group"><label>Full Name</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Enter your full name" /></div>
            <div className="form-group"><label>Email</label><input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="Enter your email" /></div>
            <div className="form-group"><label>Password</label><input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="Create a password" minLength="8" /></div>
            <div className="form-group"><label>Confirm Password</label><input type="password" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="Confirm your password" /></div>
            <div className="form-options">
              <label className="checkbox-label">
                <input type="checkbox" checked={formData.agreeTerms} onChange={e => setFormData({ ...formData, agreeTerms: e.target.checked })} />
                I agree to the Terms of Service and Privacy Policy
              </label>
            </div>
            <button type="submit" className="btn-auth" disabled={loading}>{loading ? 'Creating Account...' : 'Create Account'}</button>
          </form>
          <div className="auth-footer"><p>Already have an account? <a href="/login">Sign in</a></p></div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// FORGOT PASSWORD PAGE
// ═══════════════════════════════════════════════════════
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!isValidEmail(email)) { setError('Please enter a valid email address.'); return; }
    setLoading(true);
    try {
      const data = await apiRequest('/api/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
      setSuccess(data?.message || 'Reset link sent to your email.');
      setEmail('');
    } catch (err) {
      setError(err.message || 'Failed to send reset link.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e8eeff, #eef1f8)' }}>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header"><h2>Forgot Password</h2><p>Enter your email to receive a reset link</p></div>
          <form onSubmit={handleSubmit} className="auth-form">
            {error   && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}
            {success && <div style={{ color: '#22c55e', marginBottom: '16px', fontSize: '0.9rem' }}>{success}</div>}
            <div className="form-group"><label>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" /></div>
            <button type="submit" className="btn-auth" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
          </form>
          <div className="auth-footer"><p>Remember your password? <a href="/login">Sign in</a></p></div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// CHANGE PASSWORD PAGE
// ═══════════════════════════════════════════════════════
const ChangePasswordPage = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (!user?.email) navigate('/login'); }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword) { setError('Please fill in all password fields.'); return; }
    if (!isStrongPassword(formData.newPassword)) { setError('New password must be at least 8 characters and include a letter and a number.'); return; }
    if (formData.newPassword !== formData.confirmNewPassword) { setError('New password and confirm password do not match.'); return; }
    setLoading(true);
    try {
      const data = await apiRequest('/api/change-password', { method: 'POST', body: JSON.stringify({ email: user.email, currentPassword: formData.currentPassword, newPassword: formData.newPassword }) });
      setSuccess(data?.message || 'Password changed successfully.');
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setError(err.message || 'Failed to change password.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page" style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #e8eeff, #eef1f8)' }}>
      <div className="auth-container" style={{ maxWidth: '520px' }}>
        <div className="auth-card">
          <div className="auth-header"><h2>Change Password</h2><p>Update your password to keep your account secure</p></div>
          <form onSubmit={handleSubmit} className="auth-form">
            {error   && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}
            {success && <div style={{ color: '#22c55e', marginBottom: '16px', fontSize: '0.9rem' }}>{success}</div>}
            <div className="form-group"><label>Current Password</label><input type="password" value={formData.currentPassword} onChange={e => setFormData({ ...formData, currentPassword: e.target.value })} placeholder="Enter current password" autoComplete="current-password" /></div>
            <div className="form-group"><label>New Password</label><input type="password" value={formData.newPassword} onChange={e => setFormData({ ...formData, newPassword: e.target.value })} placeholder="Enter new password" autoComplete="new-password" /></div>
            <div className="form-group"><label>Confirm Password</label><input type="password" value={formData.confirmNewPassword} onChange={e => setFormData({ ...formData, confirmNewPassword: e.target.value })} placeholder="Confirm new password" autoComplete="new-password" /></div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button type="button" onClick={() => navigate('/profile')} className="btn-modal-cancel" style={{ flex: 1 }}>Cancel</button>
              <button type="submit" className="btn-modal-save" style={{ flex: 1 }} disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// PROFILE PAGE
// ═══════════════════════════════════════════════════════
const ProfilePage = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    name: user?.name || '', email: user?.email || '', phone: user?.phone || '',
    dob: user?.dob || '', occupation: user?.occupation || '', address: user?.address || '',
    city: user?.city || '', country: user?.country || '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { if (!user?.email) navigate('/login'); }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!profileData.name)               { setError('Name is required.');                     return; }
    if (!isValidEmail(profileData.email)) { setError('Please enter a valid email address.'); return; }
    setLoading(true);
    try {
      const updatedUser = await apiRequest('/api/profile', { method: 'PUT', body: JSON.stringify(profileData) });
      const rememberSession = Boolean(localStorage.getItem('user'));
      const newUser = { ...user, ...updatedUser };
      setStoredUser(newUser, rememberSession);
      setUser(newUser);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Update failed.');
    } finally { setLoading(false); }
  };

  const handleLogout = () => { clearStoredUser(); navigate('/login'); };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    try {
      await apiRequest('/api/profile', { method: 'DELETE' });
      clearStoredUser(); navigate('/register');
    } catch (err) { alert(err.message || 'Delete failed.'); }
  };

  const inputStyle = {
    width: '100%', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
    padding: '10px 12px', fontFamily: 'var(--font-b)', fontSize: '.9rem',
    color: 'var(--text-dark)', outline: 'none', background: '#fff', transition: 'border-color .2s',
  };

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 className="page-title">Profile Management</h1>
        <button onClick={handleLogout}
          style={{ background: 'var(--red)', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font-b)', fontSize: '.9rem' }}
          onMouseEnter={e => e.currentTarget.style.background = '#cc0000'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}
        >Logout</button>
      </div>

      {/* Alert */}
      <div className="alert-banner mb-4">
        <i className="bi bi-info-circle-fill me-2"></i>
        <span><strong>Welcome back!</strong> Your profile is up to date.</span>
      </div>

      {/* Summary cards — equal CSS grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="summary-card summary-blue">
          <p className="summary-label">Account Status</p>
          <h2 className="summary-value">Active</h2>
          <p className="summary-sub">Premium Plan</p>
        </div>
        <div className="summary-card summary-green">
          <p className="summary-label">Profile Completion</p>
          <h2 className="summary-value">85%</h2>
          <p className="summary-sub">Add phone number</p>
        </div>
        <div className="summary-card summary-orange">
          <p className="summary-label">Last Login</p>
          <h2 className="summary-value">Today</h2>
          <p className="summary-sub">Secure session</p>
        </div>
        <div className="summary-card summary-purple">
          <p className="summary-label">Goals Linked</p>
          <h2 className="summary-value">7</h2>
          <p className="summary-sub">Active goals</p>
        </div>
      </div>

      {error   && <div style={{ color: 'var(--red)',   marginBottom: 16, fontSize: '.9rem' }}>{error}</div>}
      {success && <div style={{ color: 'var(--green)', marginBottom: 16, fontSize: '.9rem' }}>{success}</div>}

      {/* Form + Actions — CSS grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '16px', alignItems: 'start' }}>
        {/* Left: form */}
        <div style={{ background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 'var(--r-card)', padding: '24px', boxShadow: 'var(--shadow)' }}>
          <h5 style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', marginBottom: '20px', color: 'var(--text-dark)' }}>Profile Information</h5>
          <form onSubmit={handleSubmit}>
            {[
              { label: 'Full Name',    key: 'name',       type: 'text' },
              { label: 'Email',        key: 'email',      type: 'email' },
              { label: 'Phone Number', key: 'phone',      type: 'tel' },
              { label: 'Date of Birth',key: 'dob',        type: 'date' },
              { label: 'Occupation',   key: 'occupation', type: 'text' },
              { label: 'Address',      key: 'address',    type: 'text' },
            ].map(({ label, key, type }) => (
              <div key={key} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontWeight: 500, color: 'var(--text-dark)', marginBottom: '6px', fontSize: '.9rem' }}>{label}</label>
                <input
                  type={type} style={inputStyle} value={profileData[key]}
                  onChange={e => setProfileData({ ...profileData, [key]: e.target.value })}
                  onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                  onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            ))}
            {/* City + Country row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              {[{ label: 'City', key: 'city' }, { label: 'Country', key: 'country' }].map(({ label, key }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontWeight: 500, color: 'var(--text-dark)', marginBottom: '6px', fontSize: '.9rem' }}>{label}</label>
                  <input
                    type="text" style={inputStyle} value={profileData[key]}
                    onChange={e => setProfileData({ ...profileData, [key]: e.target.value })}
                    onFocus={e => e.target.style.borderColor = 'var(--blue)'}
                    onBlur={e  => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              ))}
            </div>
            <button type="submit" className="btn-primary-action" disabled={loading} style={{ borderRadius: 'var(--r-sm)', padding: '10px 24px' }}>
              {loading ? 'Saving...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Right: account actions */}
        <div style={{ background: 'var(--bg-white)', border: '1px solid var(--border)', borderRadius: 'var(--r-card)', padding: '24px', boxShadow: 'var(--shadow)' }}>
          <h5 style={{ fontFamily: 'var(--font-h)', fontSize: '1.1rem', marginBottom: '20px', color: 'var(--text-dark)' }}>Account Actions</h5>
          <button onClick={() => navigate('/change-password')}
            style={{ width: '100%', background: 'var(--orange)', color: '#fff', border: 'none', padding: '12px 16px', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font-b)', fontSize: '.9rem', marginBottom: '12px' }}
            onMouseEnter={e => e.currentTarget.style.background = '#e07612'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--orange)'}
          >Change Password</button>
          <button onClick={handleDeleteAccount}
            style={{ width: '100%', background: 'var(--red)', color: '#fff', border: 'none', padding: '12px 16px', borderRadius: 'var(--r-sm)', cursor: 'pointer', fontWeight: 700, fontFamily: 'var(--font-b)', fontSize: '.9rem' }}
            onMouseEnter={e => e.currentTarget.style.background = '#cc0000'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--red)'}
          >Delete Account</button>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// GOALS PAGE
// ═══════════════════════════════════════════════════════
const GoalsPage = ({ user }) => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([
    { id: 1, icon: '🏠', name: 'Dream Home Down Payment', desc: 'Save for a 20% down payment on a RM650,000 house', target: 'RM 130,000', savings: 'RM 88,400', monthly: 'RM 1,800', dateLabel: 'Dec 2030', status: 'on-track', progressPercent: 68 },
    { id: 2, icon: '🏦', name: 'Personal Savings Fund', desc: 'A flexible goal for personal savings or miscellaneous expenses', target: 'RM 100,000', savings: 'RM 44,000', monthly: 'RM 1,200', dateLabel: 'Sep 2031', status: 'on-track', progressPercent: 44 },
    { id: 3, icon: '🚨', name: 'Emergency Fund', desc: 'Save 3–6 months of expenses for emergencies', target: 'RM 30,000', savings: 'RM 16,500', monthly: 'RM 375', dateLabel: 'Jun 2027', status: 'at-risk', progressPercent: 55 },
    { id: 4, icon: '✈️', name: 'Travel Fund', desc: 'Save for a trip to Korea, including flights and accommodation', target: 'RM 20,000', savings: 'RM 16,400', monthly: 'RM 600', dateLabel: 'Aug 2027', status: 'on-track', progressPercent: 82 },
    { id: 5, icon: '⛱️', name: 'Early Retirement Fund', desc: 'Financial independence by age 51 — retire comfortably', target: 'RM 1,000,000', savings: 'RM 210,000', monthly: 'RM 2,100', dateLabel: 'Mar 2055', status: 'high-risk', progressPercent: 21, hasAI: true },
    { id: 6, icon: '✈️', name: 'Japan Travel Fund', desc: 'Save for a trip to Japan, including flights and accommodation', target: 'RM 5,500', savings: 'RM 5,500', monthly: 'RM 500', dateLabel: 'Dec 2024', status: 'completed', progressPercent: 100 },
    { id: 7, icon: '📦', name: 'Laptop Upgrade Fund', desc: 'A dedicated goal for saving towards a new laptop or device upgrade.', target: 'RM 4,000', savings: 'RM 4,000', monthly: 'RM 250', dateLabel: 'Aug 2025', status: 'completed', progressPercent: 100 },
  ]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [formData, setFormData] = useState({ icon: '🏠', name: '', desc: '', target: '', savings: '', monthly: '', dateLabel: '' });

  useEffect(() => { if (!user?.email) navigate('/login'); }, [user, navigate]);

  const filteredGoals = goals.filter(goal => {
    const matchFilter = filter === 'all' || goal.status === filter;
    const matchSearch = !searchTerm || goal.name.toLowerCase().includes(searchTerm.toLowerCase()) || goal.desc.toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleSaveGoal = (e) => {
    e.preventDefault();
    if (!formData.name) { alert('Please enter a goal name.'); return; }
    if (editingGoal) {
      setGoals(goals.map(g => g.id === editingGoal.id ? { ...editingGoal, ...formData } : g));
      setEditingGoal(null);
    } else {
      setGoals([...goals, { id: Math.max(...goals.map(g => g.id), 0) + 1, ...formData, status: 'on-track', progressPercent: 0 }]);
    }
    setShowModal(false);
    setFormData({ icon: '🏠', name: '', desc: '', target: '', savings: '', monthly: '', dateLabel: '' });
  };

  const handleDeleteGoal = (id) => { if (window.confirm('Delete this goal?')) setGoals(goals.filter(g => g.id !== id)); };
  const handleEditGoal = (goal) => { setEditingGoal(goal); setFormData(goal); setShowModal(true); };
  const openAdd = () => { setEditingGoal(null); setFormData({ icon: '🏠', name: '', desc: '', target: '', savings: '', monthly: '', dateLabel: '' }); setShowModal(true); };

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 className="page-title">Financial Goals</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search-box">
            <i className="bi bi-search search-icon"></i>
            <input type="text" placeholder="Search goals, funds..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <button className="btn-primary-action" onClick={openAdd}><i className="bi bi-plus-lg"></i> Add Goal</button>
        </div>
      </div>

      {/* Summary cards — equal CSS grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
        <div className="summary-card summary-blue">
          <p className="summary-label">Total Saved</p>
          <p className="summary-value">RM 384,800</p>
          <p className="summary-sub">↑ +8.3% vs last quarter</p>
        </div>
        <div className="summary-card summary-green">
          <p className="summary-label">Goals On Track</p>
          <p className="summary-value">3 / 7</p>
          <p className="summary-sub">2 need attention</p>
        </div>
        <div className="summary-card summary-orange">
          <p className="summary-label">Monthly Contribution</p>
          <p className="summary-value">RM 6,825</p>
          <p className="summary-sub">↑ +RM400 this month</p>
        </div>
        <div className="summary-card summary-rainbow">
          <p className="summary-label">Projected by 2030</p>
          <p className="summary-value">RM 500,000</p>
          <p className="summary-sub">Across all goals</p>
        </div>
      </div>

      {/* Alert */}
      <div className="alert-banner mb-4">
        <i className="bi bi-info-circle-fill me-2"></i>
        <span><strong>3 goals are on track.</strong> Your Emergency Fund is falling behind — you're 12% off track.</span>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs mb-4">
        {['all', 'on-track', 'at-risk', 'high-risk', 'completed'].map(f => (
          <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All Goals' : f === 'on-track' ? 'On Track' : f === 'at-risk' ? 'At Risk' : f === 'high-risk' ? 'High Risk' : 'Completed'}
          </button>
        ))}
      </div>

      {/* Goal cards — CSS grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {filteredGoals.map(goal => (
          <div key={goal.id} className="goal-card">
            <div className="goal-card-top">
              <span className="goal-icon">{goal.icon}</span>
              <span className={`status-badge ${goal.status}`}>
                {goal.status === 'completed' ? 'Completed' : goal.status === 'at-risk' ? 'At Risk' : goal.status === 'high-risk' ? 'High Risk' : 'On Track'}
              </span>
            </div>
            <h5 className="goal-title">{goal.name}</h5>
            <p className="goal-desc">{goal.desc || 'No description provided.'}</p>
            <div className="progress goal-progress"><div className="progress-bar" style={{ width: `${goal.progressPercent}%` }}></div></div>
            <p className="goal-amounts"><strong>{goal.savings}</strong> <span>/ {goal.target}</span></p>
            <div className="goal-meta">
              <div className="meta-row">
                <span><i className="bi bi-calendar3"></i> {goal.status === 'completed' ? 'Completed:' : 'Target:'} {goal.dateLabel}</span>
                <div className="goal-actions">
                  {goal.hasAI && (
                    <button className="action-btn" title="AI Advisory" onClick={() => { setSelectedOption(null); setShowAIModal(true); }} style={{ color: '#6366f1' }}>
                      <i className="bi bi-robot"></i>
                    </button>
                  )}
                  <button className="action-btn edit-btn" onClick={() => handleEditGoal(goal)}><i className="bi bi-pencil-square"></i></button>
                  <button className="action-btn delete-btn" onClick={() => handleDeleteGoal(goal.id)}><i className="bi bi-trash3"></i></button>
                </div>
              </div>
              <span className="meta-monthly"><i className="bi bi-coin"></i> {goal.monthly} / month</span>
            </div>
          </div>
        ))}

        {/* Create new goal card */}
        <div className="goal-card create-goal-card" onClick={openAdd}>
          <div className="create-goal-inner">
            <div className="create-plus"><i className="bi bi-plus-lg"></i></div>
            <p className="create-title">Create New Goal</p>
            <p className="create-sub">Track savings, investments & milestones</p>
          </div>
        </div>
      </div>

      {/* AI Advisory Modal */}
      {showAIModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}
          onClick={e => { if (e.target === e.currentTarget) setShowAIModal(false); }}>
          <div style={{ background: 'white', borderRadius: '22px', maxWidth: '560px', width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(59,110,255,.18)' }}>
            <div style={{ background: '#2c3ecc', padding: '28px 26px 22px', borderRadius: '22px 22px 0 0' }}>
              <p style={{ color: 'rgba(255,255,255,.75)', fontSize: '.85rem', fontWeight: 500, margin: '0 0 4px' }}>AI Advisory</p>
              <h3 style={{ color: '#fff', fontFamily: 'Sora, sans-serif', fontSize: '1.3rem', fontWeight: 700, margin: '0 0 16px' }}>Early Retirement Fund</h3>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {[['Target', 'RM 1,000,000'], ['Saved', 'RM 210,000'], ['Monthly', 'RM 2,100'], ['Deadline', 'Mar 2055'], ['Lag', '12% behind']].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ color: 'rgba(255,255,255,.6)', fontSize: '.72rem' }}>{label}</div>
                    <div style={{ color: label === 'Lag' ? '#ff8b8b' : '#fff', fontWeight: 700, fontSize: '.88rem' }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '24px 26px' }}>
              <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.08em', color: '#9ca3af', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                TWO PATHS FORWARD <span style={{ flex: 1, height: 1, background: '#e2e6f0', display: 'block' }}></span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                {[
                  { key: 'A', color: '#3b6eff', label: 'Option A – TIME', big: '+42', unit: 'months', desc: 'Keep saving RM 2,100/month and extend your deadline by 3 years 6 months', tag: 'Retire by Sep 2058', tagStyle: { background: '#f3f5f9', color: '#5c6170' } },
                  { key: 'B', color: '#22c55e', label: 'Option B – AMOUNT', big: '+RM252', unit: '/mo', desc: 'Increase to RM 2,352/month and hit your original March 2055 goal', tag: 'Stay on track for 2055', tagStyle: { background: '#dcfce7', color: '#15803d' } },
                ].map(opt => (
                  <div key={opt.key} onClick={() => setSelectedOption(opt.key)}
                    style={{ border: `1.5px solid ${selectedOption === opt.key ? '#3b6eff' : '#e2e6f0'}`, borderRadius: '16px', padding: '16px', cursor: 'pointer', boxShadow: selectedOption === opt.key ? '0 0 0 3px rgba(59,110,255,.15)' : 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '.72rem', fontWeight: 700, color: opt.color }}>{opt.label}</span>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${selectedOption === opt.key ? '#3b6eff' : '#e2e6f0'}`, background: selectedOption === opt.key ? 'radial-gradient(circle at center, #3b6eff 45%, #fff 45%)' : 'transparent' }}></div>
                    </div>
                    <div style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.6rem', fontWeight: 800 }}>{opt.big} <span style={{ fontSize: '.9rem', fontWeight: 500, color: '#5c6170' }}>{opt.unit}</span></div>
                    <p style={{ fontSize: '.76rem', color: '#5c6170', lineHeight: 1.4, margin: 0 }}>{opt.desc}</p>
                    <span style={{ ...opt.tagStyle, display: 'inline-block', fontSize: '.72rem', fontWeight: 600, borderRadius: '99px', padding: '3px 10px' }}>{opt.tag}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: '#f0f4ff', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#3b6eff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✦</div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '.85rem', margin: 0 }}>WealthTrack AI Advisor</p>
                      <p style={{ fontSize: '.72rem', color: '#9ca3af', margin: 0 }}>Powered by Gemini · Smart Suggestions</p>
                    </div>
                  </div>
                  <span style={{ background: '#e8eeff', color: '#3b6eff', fontSize: '.7rem', fontWeight: 700, borderRadius: '99px', padding: '3px 10px' }}>AI Generated</span>
                </div>
                <p style={{ fontSize: '.84rem', lineHeight: 1.6, margin: '0 0 12px' }}>
                  You're already <strong>RM 210,000</strong> into your retirement journey. Adding just <span style={{ color: '#22c55e', fontWeight: 700, background: '#dcfce7', borderRadius: 4, padding: '1px 5px' }}>+RM 252/month</span> keeps your original March 2055 retirement fully intact.
                </p>
                <div style={{ background: '#fff', borderRadius: '8px', padding: '10px 12px', display: 'flex', gap: '10px' }}>
                  <span>💡</span>
                  <p style={{ fontSize: '.78rem', color: '#5c6170', margin: 0 }}>Automating your monthly transfer removes the temptation to skip — consistency compounds faster than any single large contribution.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button style={{ border: '1.5px solid #e2e6f0', background: '#fff', borderRadius: '99px', padding: '8px 16px', fontFamily: 'DM Sans,sans-serif', fontSize: '.84rem', fontWeight: 600, cursor: 'pointer' }}>↻ Regenerate</button>
                <button onClick={() => setShowAIModal(false)} style={{ border: '1.5px solid #e2e6f0', background: '#fff', borderRadius: '99px', padding: '8px 16px', fontFamily: 'DM Sans,sans-serif', fontSize: '.84rem', fontWeight: 600, cursor: 'pointer' }}>Dismiss</button>
                <button disabled={!selectedOption} onClick={() => { alert(`Applied Option ${selectedOption}!`); setShowAIModal(false); }}
                  style={{ marginLeft: 'auto', background: selectedOption ? '#3b6eff' : '#d1d5db', color: selectedOption ? '#fff' : '#6b7280', border: 'none', borderRadius: '99px', padding: '8px 20px', fontFamily: 'DM Sans,sans-serif', fontSize: '.84rem', fontWeight: 700, cursor: selectedOption ? 'pointer' : 'not-allowed' }}>
                  {selectedOption ? `Apply Option ${selectedOption}` : 'Apply Selected Option'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Goal Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '22px', padding: '32px', maxWidth: '560px', width: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(59,110,255,.18)' }}>
            <h4 className="modal-main-title">{editingGoal ? 'Update Goal' : 'Create New Goal'}</h4>
            <p className="modal-main-sub">{editingGoal ? 'Edit your goal details and save changes.' : 'Define your financial goal and start tracking your progress.'}</p>
            <form onSubmit={handleSaveGoal}>
              {[['Goal Name', 'name', 'e.g. Dream Vacation Fund'], ['Description', 'desc', 'Brief description']].map(([label, key, ph]) => (
                <div key={key} className="modal-field">
                  <label className="modal-label">{label}</label>
                  <input className="modal-input-field" value={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })} placeholder={ph} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {[['Target Amount', 'target', 'RM50,000'], ['Current Savings', 'savings', 'RM0']].map(([label, key, ph]) => (
                  <div key={key} className="modal-field">
                    <label className="modal-label">{label}</label>
                    <input className="modal-input-field" value={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })} placeholder={ph} />
                  </div>
                ))}
              </div>
              <div className="modal-field">
                <label className="modal-label">Monthly Distribution</label>
                <input className="modal-input-field" value={formData.monthly} onChange={e => setFormData({ ...formData, monthly: e.target.value })} placeholder="RM500" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="modal-field">
                  <label className="modal-label">Target Date</label>
                  <input type="month" className="modal-input-field" value={formData.dateLabel} onChange={e => setFormData({ ...formData, dateLabel: e.target.value })} style={{ cursor: 'pointer' }} />
                </div>
                <div className="modal-field">
                  <label className="modal-label">Category</label>
                  <div style={{ position: 'relative' }}>
                    <select className="modal-input-field" value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} style={{ appearance: 'none', cursor: 'pointer', paddingRight: '32px' }}>
                      <option value="🏠">🏠 Home</option>
                      <option value="🎓">🎓 Education</option>
                      <option value="🚨">🚨 Emergency</option>
                      <option value="✈️">✈️ Travel</option>
                      <option value="⛱️">⛱️ Retirement</option>
                      <option value="🏦">🏦 Savings</option>
                      <option value="📦">📦 Others</option>
                    </select>
                    <i className="bi bi-chevron-down" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#5c6170', fontSize: '.8rem' }}></i>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn-modal-cancel" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-modal-save" style={{ flex: 1 }}>{editingGoal ? 'Update Goal' : 'Save Goal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// INVESTMENTS PAGE
// ═══════════════════════════════════════════════════════
const InvestmentsPage = ({ user }) => {
  const navigate = useNavigate();
  const [selectedRisk, setSelectedRisk] = useState('conservative');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  useEffect(() => { if (!user?.email) navigate('/login'); }, [user, navigate]);

  const GOALS_LIST = [
    { id: 'goal-1', name: 'Dream Home Down Payment', saved: 88400,  target: 130000,  status: 'on-track'  },
    { id: 'goal-2', name: 'Personal Savings Fund',   saved: 44000,  target: 100000,  status: 'on-track'  },
    { id: 'goal-3', name: 'Emergency Fund',           saved: 16500,  target: 30000,   status: 'at-risk'   },
    { id: 'goal-4', name: 'Travel Fund',              saved: 16400,  target: 20000,   status: 'on-track'  },
    { id: 'goal-5', name: 'Early Retirement Fund',    saved: 210000, target: 1000000, status: 'high-risk' },
  ];

  const RISK_DATA = {
    conservative: {
      title: 'Conservative Investment Plan', tag: 'LOW RISK', tagColor: '#1b5e20', returnVal: '3–5%',
      gradient: 'linear-gradient(135deg, #2e7d32, #4caf50)', borderColor: '#2e7d32',
      quoteColor: '#f0fdf4', quoteBorder: '#4caf50',
      allocation: [{ label: 'Fixed Deposit / ASB — 50%', pct: 50, color: '#1b5e20' }, { label: 'Sukuk / Bonds — 30%', pct: 30, color: '#4caf50' }, { label: 'Money Market — 20%', pct: 20, color: '#a5d6a7' }],
      instruments: ['ASB (Amanah Saham)', 'Sukuk', 'Fixed Deposit', 'Money Market Fund'],
      suitableGoals: [{ icon: '🚨', text: 'Emergency Fund (3–6 months expenses)' }, { icon: '✈️', text: 'Travel Fund (1–2 years)' }, { icon: '🎓', text: 'Education Savings (short-term)' }],
      quote: '"Capital safety is your priority. Keep losses minimal and grow your savings steadily. Ideal if you need the money within 1–3 years."',
    },
    balanced: {
      title: 'Balanced Investment Plan', tag: 'MEDIUM RISK', tagColor: '#1565c0', returnVal: '6–10%',
      gradient: 'linear-gradient(135deg, #1565c0, #42a5f5)', borderColor: '#1565c0',
      quoteColor: '#eff6ff', quoteBorder: '#42a5f5',
      allocation: [{ label: 'ETFs / Unit Trusts — 40%', pct: 40, color: '#1565c0' }, { label: 'Blue-chip Stocks — 35%', pct: 35, color: '#42a5f5' }, { label: 'Bonds / Sukuk — 25%', pct: 25, color: '#bbdefb' }],
      instruments: ['Bursa Malaysia ETFs', 'Sukuk', 'Blue-chip Stocks', 'Unit Trusts'],
      suitableGoals: [{ icon: '🏠', text: 'Home Down Payment (3–7 years)' }, { icon: '🏦', text: 'Retirement Savings (long-term)' }, { icon: '🎓', text: 'Education Fund (5+ years)' }],
      quote: '"A blend of growth and stability. You accept some volatility in exchange for better long-term returns."',
    },
    aggressive: {
      title: 'Aggressive Investment Plan', tag: 'HIGH RISK', tagColor: '#b71c1c', returnVal: '10–20%+',
      gradient: 'linear-gradient(135deg, #b71c1c, #ef5350)', borderColor: '#b71c1c',
      quoteColor: '#fff5f5', quoteBorder: '#ef5350',
      allocation: [{ label: 'Growth Stocks — 60%', pct: 60, color: '#c62828' }, { label: 'REITs / Sector Funds — 25%', pct: 25, color: '#ef5350' }, { label: 'Crypto / Alternative — 15%', pct: 15, color: '#ffcdd2' }],
      instruments: ['Bursa Growth Stocks', 'Sector ETFs', 'REITs (M-REITs)', 'Crypto Assets'],
      suitableGoals: [{ icon: '⛱️', text: 'Early Retirement Fund (10+ years)' }, { icon: '🏦', text: 'Wealth Building (long horizon)' }, { icon: '📈', text: 'High-growth Portfolio' }],
      quote: '"You\'re in it for the long game. High volatility is acceptable — your focus is maximum wealth accumulation over time."',
    },
  };

  const riskData = RISK_DATA[selectedRisk];

  return (
    <div className="main-content">
      <div style={{ marginBottom: '24px' }}>
        <h1 className="page-title">Investments</h1>
      </div>
      <div className="inv-container">
        <h2 className="inv-main-title">Choose Your Risk Profile</h2>
        <p className="inv-main-sub">Choose a risk level based on your goals and time horizon.</p>
        <div className="risk-tabs mb-4">
          {['conservative', 'balanced', 'aggressive'].map(risk => (
            <button key={risk} className={`risk-tab ${selectedRisk === risk ? 'active ' + risk : ''}`} onClick={() => setSelectedRisk(risk)}>
              {risk.charAt(0).toUpperCase() + risk.slice(1)}
            </button>
          ))}
        </div>
        {/* Banner */}
        <div style={{ background: riskData.gradient, borderRadius: '18px', padding: '28px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', color: '#fff' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.2)', borderRadius: '99px', padding: '4px 12px', fontSize: '.74rem', fontWeight: 700, marginBottom: '10px' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fff', display: 'inline-block' }}></span>
              {riskData.tag}
            </div>
            <div style={{ fontFamily: 'Sora,sans-serif', fontSize: '1.4rem', fontWeight: 700 }}>{riskData.title}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '.72rem', fontWeight: 600, opacity: .8, letterSpacing: '.06em', marginBottom: '2px' }}>EXPECTED RETURN:</div>
            <div style={{ fontFamily: 'Sora,sans-serif', fontSize: '2.2rem', fontWeight: 800 }}>{riskData.returnVal}</div>
            <div style={{ fontSize: '.82rem', opacity: .8 }}>per year</div>
          </div>
        </div>
        {/* Info cards — CSS grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div className="inv-info-card">
            <p className="inv-info-title">Asset Allocation</p>
            <div className="alloc-bar mb-2">
              {riskData.allocation.map((a, i) => <div key={i} className="alloc-segment" style={{ width: `${a.pct}%`, background: a.color }}></div>)}
            </div>
            {riskData.allocation.map((a, i) => (
              <div key={i} className="alloc-item"><span className="alloc-dot" style={{ background: a.color }}></span>{a.label}</div>
            ))}
          </div>
          <div className="inv-info-card">
            <p className="inv-info-title">Recommended Instruments</p>
            <div className="instrument-tags">
              {riskData.instruments.map((inst, i) => <span key={i} className="instrument-tag" style={{ borderColor: riskData.borderColor, color: riskData.borderColor }}>{inst}</span>)}
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div className="inv-info-card">
            <p className="inv-info-title">Suitable Goals</p>
            {riskData.suitableGoals.map((g, i) => <div key={i} className="suitable-item"><span>{g.icon}</span><span>{g.text}</span></div>)}
          </div>
          <div style={{ background: riskData.quoteColor, borderLeft: `3px solid ${riskData.quoteBorder}`, borderRadius: '0 12px 12px 0', padding: '18px 20px', fontStyle: 'italic', fontSize: '.88rem', lineHeight: 1.6, color: '#1a1d2e', display: 'flex', alignItems: 'center' }}>
            {riskData.quote}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary-action" style={{ padding: '10px 40px' }} onClick={() => setShowGoalModal(true)}>Apply this portfolio</button>
        </div>
      </div>

      {/* Select Goal Modal */}
      {showGoalModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
          onClick={e => { if (e.target === e.currentTarget) setShowGoalModal(false); }}>
          <div style={{ background: 'white', borderRadius: '22px', padding: '32px', maxWidth: '640px', width: '90%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,.15)' }}>
            <h4 className="modal-main-title">Select Goal</h4>
            <p className="modal-main-sub">Choose the financial goal to apply this portfolio to.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '20px 0' }}>
              {GOALS_LIST.map(goal => {
                const isSelected = selectedGoal?.id === goal.id;
                const statusStyle = goal.status === 'on-track' ? { background: '#dcfce7', color: '#15803d' } : goal.status === 'at-risk' ? { background: '#ffedd5', color: '#c2410c' } : { background: '#fee2e2', color: '#b91c1c' };
                const statusLabel = goal.status === 'on-track' ? 'On Track' : goal.status === 'at-risk' ? 'At Risk' : 'High Risk';
                return (
                  <div key={goal.id} onClick={() => setSelectedGoal(goal)}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', border: `1.5px solid ${isSelected ? '#3b6eff' : '#e2e6f0'}`, borderRadius: '14px', padding: '16px 18px', cursor: 'pointer', background: isSelected ? '#f0f4ff' : '#fff' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, border: `2px solid ${isSelected ? '#3b6eff' : '#d1d5db'}`, background: isSelected ? 'radial-gradient(circle at center, #3b6eff 45%, #fff 45%)' : 'transparent' }}></div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: '.95rem', margin: '0 0 3px' }}>{goal.name}</p>
                      <p style={{ fontSize: '.82rem', color: '#5c6170', margin: 0 }}>RM {goal.saved.toLocaleString()} / RM {goal.target.toLocaleString()}</p>
                    </div>
                    <span style={{ ...statusStyle, fontSize: '.72rem', fontWeight: 700, borderRadius: '99px', padding: '4px 12px' }}>{statusLabel}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-modal-cancel" onClick={() => { setShowGoalModal(false); setSelectedGoal(null); }}>Cancel</button>
              <button className="btn-modal-save" disabled={!selectedGoal} onClick={() => { setShowGoalModal(false); setShowConfirmModal(true); }} style={{ opacity: selectedGoal ? 1 : 0.5 }}>Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '22px', padding: '32px', maxWidth: '500px', width: '90%' }}>
            <h4 className="modal-main-title">Confirm Portfolio</h4>
            <p className="modal-main-sub">Review your portfolio choice and selected goal before applying.</p>
            <div className="confirm-summary">
              <div className="confirm-row"><span className="confirm-label">Portfolio</span><span className="confirm-value">{selectedRisk.charAt(0).toUpperCase() + selectedRisk.slice(1)}</span></div>
              <div className="confirm-row"><span className="confirm-label">Expected Return</span><span className="confirm-value">{riskData.returnVal}</span></div>
              <div className="confirm-row"><span className="confirm-label">Selected Goal</span><span className="confirm-value">{selectedGoal?.name}</span></div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button className="btn-modal-cancel" onClick={() => { setShowConfirmModal(false); setShowGoalModal(true); }}>Back</button>
              <button className="btn-modal-save" onClick={() => { alert('Portfolio applied successfully!'); setShowConfirmModal(false); setSelectedGoal(null); }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// ROI CALCULATOR PAGE
// ═══════════════════════════════════════════════════════
const RoiPage = ({ user }) => {
  const navigate = useNavigate();
  const [roiMode, setRoiMode] = useState('compound');
  const [formData, setFormData] = useState({ principal: 10000, monthly: 200, rate: 7.0, duration: 10 });
  const [activeRate, setActiveRate] = useState(7);
  const [activeDuration, setActiveDuration] = useState(10);
  const [rateA, setRateA] = useState(5.0);
  const [rateB, setRateB] = useState(8.0);
  const [results, setResults] = useState(null);
  // ── FIX: separate flag so chart renders AFTER canvas mounts ──
  const [chartData, setChartData] = useState(null);
  const chartRef      = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => { if (!user?.email) navigate('/login'); }, [user, navigate]);

  // ── FIX: draw chart only after results panel is in the DOM ──
  useEffect(() => {
    if (!chartData || !chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();
    const color = roiMode === 'compound' ? '#3b6eff' : '#8b5cf6';
    chartInstance.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          data: chartData.values,
          borderColor: color,
          backgroundColor: color + '18',
          fill: true, tension: 0.4,
          pointRadius: 4, pointBackgroundColor: color, borderWidth: 2,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => 'RM ' + Math.round(ctx.raw).toLocaleString('en-MY') } } },
        scales: {
          y: { ticks: { callback: v => 'RM' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v) }, grid: { color: '#e2e6f0' } },
          x: { grid: { display: false } },
        },
      },
    });
  }, [chartData, roiMode]);

  const calcCompound = (P, PMT, r, t) => {
    if (r === 0) return P + PMT * t * 12;
    const n = 12, rt = Math.pow(1 + r / n, n * t);
    return P * rt + PMT * ((rt - 1) / (r / n));
  };
  const calcSimple = (P, r, t) => r === 0 ? P : P * (1 + r * t);

  const calculateResults = () => {
    const P = formData.principal, PMT = formData.monthly, r = formData.rate / 100, t = formData.duration;
    const invested = roiMode === 'compound' ? P + PMT * t * 12 : P;
    const fv       = roiMode === 'compound' ? calcCompound(P, PMT, r, t) : calcSimple(P, r, t);
    const profit   = fv - invested;
    const gain     = invested > 0 ? ((profit / invested) * 100).toFixed(1) : '0.0';

    // Build chart data array first
    const labels = [], values = [];
    for (let yr = 0; yr <= t; yr++) {
      labels.push(yr === 0 ? 'Now' : (yr % 2 === 0 ? `Yr ${yr}` : ''));
      values.push(Math.round(roiMode === 'compound' ? (yr === 0 ? P : calcCompound(P, PMT, r, yr)) : (yr === 0 ? P : calcSimple(P, r, yr))));
    }

    // Set results first (mounts the canvas), then chart data (triggers useEffect)
    setResults({ invested: Math.round(invested), fv: Math.round(fv), profit: Math.round(profit), gain });
    setChartData({ labels, values });
  };

  const calcScenario = (rate) => {
    const P = formData.principal, PMT = formData.monthly, r = rate / 100, t = formData.duration;
    const invested = roiMode === 'compound' ? P + PMT * t * 12 : P;
    const fv       = roiMode === 'compound' ? calcCompound(P, PMT, r, t) : calcSimple(P, r, t);
    const profit   = fv - invested;
    return { invested: Math.round(invested), fv: Math.round(fv), profit: Math.round(profit), gain: invested > 0 ? ((profit / invested) * 100).toFixed(1) : '0.0' };
  };

  const sA = results ? calcScenario(rateA) : null;
  const sB = results ? calcScenario(rateB) : null;
  const fmt = n => 'RM ' + n.toLocaleString();
  const modeBadgeStyle = { background: roiMode === 'compound' ? '#dbeafe' : '#ede9fe', color: roiMode === 'compound' ? '#3b6eff' : '#8b5cf6' };

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 className="page-title">ROI Calculator</h1>
        <div className="roi-mode-toggle">
          <button className={`roi-mode-btn ${roiMode === 'compound' ? 'active compound-active' : ''}`} onClick={() => setRoiMode('compound')}>
            <span className="mode-dot compound-dot"></span> Compound
          </button>
          <span className="roi-divider-pipe">|</span>
          <button className={`roi-mode-btn ${roiMode === 'simple' ? 'active simple-active' : ''}`} onClick={() => setRoiMode('simple')}>
            Simple <span className="mode-dot simple-dot"></span>
          </button>
        </div>
      </div>

      {/* Mode banner */}
      <div className={`mode-banner mb-4 ${roiMode === 'compound' ? 'compound-banner' : 'simple-banner'}`}>
        <i className="bi bi-info-circle-fill me-2"></i>
        <strong>{roiMode === 'compound' ? 'Compound mode active' : 'Simple mode active'}</strong>
        <span>{roiMode === 'compound' ? ' — interest is reinvested each month and added to your balance.' : ' — interest is calculated only on the initial investment and does not compound.'}</span>
      </div>

      {/* Main layout — CSS grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '20px', alignItems: 'start' }}>

        {/* Left: Parameters */}
        <div className="roi-card">
          <div className="roi-card-header">
            <span className="roi-card-label">PARAMETERS</span>
            <span className="roi-mode-badge" style={modeBadgeStyle}>{roiMode === 'compound' ? 'Compound' : 'Simple'}</span>
          </div>
          <div className="roi-field">
            <div className="roi-field-header"><label>Initial Investment</label><span className="roi-field-tag">One-time</span></div>
            <div className="roi-input-group">
              <span className="roi-prefix">RM</span><span className="roi-sep">|</span>
              <input type="number" className="roi-input" value={formData.principal} onChange={e => setFormData({ ...formData, principal: parseFloat(e.target.value) || 0 })} min="0" />
            </div>
          </div>
          <div className="roi-field" style={{ opacity: roiMode === 'compound' ? 1 : 0.45 }}>
            <div className="roi-field-header">
              <label>Monthly Contribution</label>
              <span className="roi-field-tag" style={{ color: roiMode === 'compound' ? '#5c6170' : '#a78bfa' }}>{roiMode === 'compound' ? 'Per month' : 'NOT USED'}</span>
            </div>
            <div className="roi-input-group">
              <span className="roi-prefix">RM</span><span className="roi-sep">|</span>
              <input type="number" className="roi-input" value={formData.monthly} onChange={e => setFormData({ ...formData, monthly: parseFloat(e.target.value) || 0 })} min="0" disabled={roiMode === 'simple'} />
            </div>
          </div>
          <div className="roi-field">
            <div className="roi-field-header"><label>Annual Interest Rate</label></div>
            <div className="roi-input-group">
              <input type="number" className="roi-input" value={formData.rate} onChange={e => { setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 }); setActiveRate(null); }} step="0.5" min="0" max="100" />
              <span className="roi-sep">|</span><span className="roi-suffix">%</span>
            </div>
            <div className="roi-quick-btns mt-2">
              {[3, 5, 7, 9, 12].map(v => (
                <button key={v} className={`quick-btn ${activeRate === v ? (roiMode === 'compound' ? 'active' : 'active-simple') : ''}`}
                  onClick={() => { setFormData({ ...formData, rate: v }); setActiveRate(v); }}>{v}%</button>
              ))}
            </div>
          </div>
          <div className="roi-hr"></div>
          <div className="roi-field">
            <div className="roi-field-header"><label>Duration</label></div>
            <div className="roi-input-group">
              <button className="roi-stepper" onClick={() => { const v = Math.max(1, formData.duration - 1); setFormData({ ...formData, duration: v }); setActiveDuration(null); }}>−</button>
              <span className="roi-sep">|</span>
              <input type="number" className="roi-input" value={formData.duration} onChange={e => { setFormData({ ...formData, duration: parseInt(e.target.value) || 1 }); setActiveDuration(null); }} min="1" max="50" />
              <span className="roi-dur-label">years</span>
              <span className="roi-sep">|</span>
              <button className="roi-stepper" onClick={() => { const v = Math.min(50, formData.duration + 1); setFormData({ ...formData, duration: v }); setActiveDuration(null); }}>+</button>
            </div>
            <div className="roi-quick-btns mt-2">
              {[3, 5, 10, 20].map(v => (
                <button key={v} className={`quick-btn ${activeDuration === v ? (roiMode === 'compound' ? 'active' : 'active-simple') : ''}`}
                  onClick={() => { setFormData({ ...formData, duration: v }); setActiveDuration(v); }}>{v}yr</button>
              ))}
            </div>
          </div>
          <button className={`btn-calculate mt-4 ${roiMode === 'simple' ? 'simple-calc' : ''}`} onClick={calculateResults}>
            Calculate ({roiMode === 'compound' ? 'Compound' : 'Simple'})
          </button>
        </div>

        {/* Right: Results */}
        <div>
          {results && (
            <>
              <div className="roi-card mb-4">
                <div className="roi-card-header mb-3">
                  <span className="roi-card-label">RESULTS</span>
                  <span className="roi-mode-badge" style={modeBadgeStyle}>{roiMode === 'compound' ? 'Compound' : 'Simple'}</span>
                </div>
                {/* CSS grid — equal halves */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="result-stat-card">
                    <div className="result-stat-label">TOTAL INVESTED<br /><small style={{ color: '#9ca3af', fontWeight: 400 }}>{roiMode === 'compound' ? `P + (PMT × ${formData.duration * 12})` : 'Principal only'}</small></div>
                    <div className="result-stat-value">{fmt(results.invested)}</div>
                    <div className="result-divider"></div>
                    <div className="result-stat-label">TOTAL RETURN<br /><small style={{ color: '#9ca3af', fontWeight: 400 }}>{roiMode === 'compound' ? 'Future value (FV)' : 'P × (1 + r × t)'}</small></div>
                    <div className="result-stat-value">{fmt(results.fv)}</div>
                    <div className="result-divider"></div>
                    <div className="result-stat-label">TOTAL PROFIT<br /><small style={{ color: '#22c55e', fontWeight: 600 }}>↑ {results.gain}% gain</small></div>
                    <div className="result-stat-value profit-value">+{fmt(results.profit)}</div>
                  </div>
                  <div className="result-chart-placeholder">
                    {/* Canvas always mounted when results exist */}
                    <canvas ref={chartRef}></canvas>
                  </div>
                </div>
                {roiMode === 'simple' && (
                  <div className="compound-hint mt-3">
                    <i className="bi bi-arrow-left-right me-2"></i>
                    <span>Compound earns <strong>RM {Math.max(0, Math.round(calcCompound(formData.principal, formData.monthly, formData.rate / 100, formData.duration) - results.fv)).toLocaleString()}</strong> more over {formData.duration} years.</span>
                    <button className="hint-link ms-1" onClick={() => setRoiMode('compound')} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#3b6eff', fontWeight: 600, textDecoration: 'underline' }}>Switch to Compound</button>
                  </div>
                )}
              </div>

              {/* Scenario Comparison */}
              <div className="roi-card">
                <div className="roi-card-header mb-3">
                  <span className="roi-card-label">SCENARIO COMPARISON</span>
                  <span className="roi-mode-badge" style={modeBadgeStyle}>{roiMode === 'compound' ? 'Compound' : 'Simple'}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {/* Scenario A */}
                  <div>
                    <div className="scenario-header">
                      <span className="scenario-rate-label">RATE A</span>
                      <div className="roi-input-group mini">
                        <input type="number" className="roi-input" style={{ textAlign: 'right' }} value={rateA} onChange={e => setRateA(parseFloat(e.target.value) || 0)} step="0.5" />
                        <span className="roi-sep">|</span><span className="roi-suffix">%</span>
                      </div>
                    </div>
                    <div className="scenario-card">
                      <div className="scenario-card-top"><span>Scenario A</span><span className="scenario-badge neutral">{rateA}%</span></div>
                      <div className="scenario-row"><span>Total Invested</span><strong>{fmt(sA.invested)}</strong></div>
                      <div className="scenario-row"><span>Total Return</span><strong>{fmt(sA.fv)}</strong></div>
                      <div className="scenario-row"><span>Profit</span><strong style={{ color: '#22c55e' }}>+{fmt(sA.profit)}</strong></div>
                      <div className="scenario-row"><span>Gain</span><strong>{sA.gain}%</strong></div>
                    </div>
                  </div>
                  {/* Scenario B */}
                  <div>
                    <div className="scenario-header">
                      <span className="scenario-rate-label">RATE B</span>
                      <div className="roi-input-group mini">
                        <input type="number" className="roi-input" style={{ textAlign: 'right' }} value={rateB} onChange={e => setRateB(parseFloat(e.target.value) || 0)} step="0.5" />
                        <span className="roi-sep">|</span><span className="roi-suffix">%</span>
                      </div>
                    </div>
                    <div className="scenario-card best-scenario">
                      <div className="scenario-card-top"><span>Scenario B</span><span className="scenario-badge best">{rateB}%</span></div>
                      <div className="scenario-row"><span>Total Invested</span><strong>{fmt(sB.invested)}</strong></div>
                      <div className="scenario-row"><span>Total Return</span><strong style={{ color: '#22c55e' }}>{fmt(sB.fv)}</strong></div>
                      <div className="scenario-row">
                        <span>Profit</span>
                        <span><strong style={{ color: '#22c55e' }}>+{fmt(sB.profit)}</strong>
                          {sB.profit - sA.profit > 0 && <span className="profit-delta">+{fmt(sB.profit - sA.profit)}</span>}
                        </span>
                      </div>
                      <div className="scenario-row">
                        <span>Gain</span>
                        <span><strong style={{ color: '#22c55e' }}>{sB.gain}%</strong> <span className="best-dot">● BEST</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// DASHBOARD PAGE
// ═══════════════════════════════════════════════════════
const DashboardPage = ({ user }) => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    trend: 'Bullish', sp500: 'S&P 500 +2.5%',
    topPerformer: 'Tech Stocks', performance: '+15% Growth',
    riskLevel: 'Moderate', riskSub: 'Monitor volatility',
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const trendChartRef  = useRef(null);
  const sectorChartRef = useRef(null);
  const trendChartInst  = useRef(null);
  const sectorChartInst = useRef(null);

  useEffect(() => { if (!user?.email) navigate('/login'); }, [user, navigate]);
  useEffect(() => { loadInsights(); }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 600));
      setDashboardData({ trend: 'Bullish', sp500: 'S&P 500 +2.5%', topPerformer: 'Tech Stocks', performance: '+15% Growth', riskLevel: 'Moderate', riskSub: 'Monitor volatility' });
      setLastUpdated(new Date());
      setTimeout(() => renderCharts(), 80);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const renderCharts = () => {
    if (trendChartInst.current) trendChartInst.current.destroy();
    if (trendChartRef.current) {
      trendChartInst.current = new Chart(trendChartRef.current, {
        type: 'line',
        data: { labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'], datasets: [{ data: [4200,4350,4205,4510,4630,4585,4790,4875], borderColor: '#3b6eff', backgroundColor: 'rgba(59,110,255,0.10)', pointBackgroundColor: '#3b6eff', pointRadius: 5, borderWidth: 2.5, tension: 0.35, fill: false }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 6000, ticks: { stepSize: 1500, color: '#9ca3af', font: { size: 11 } }, grid: { color: 'rgba(148,163,184,0.18)' }, border: { display: false } }, x: { ticks: { color: '#9ca3af', font: { size: 11 } }, grid: { color: 'rgba(148,163,184,0.18)' }, border: { display: false } } } },
      });
    }
    if (sectorChartInst.current) sectorChartInst.current.destroy();
    if (sectorChartRef.current) {
      sectorChartInst.current = new Chart(sectorChartRef.current, {
        type: 'bar',
        data: { labels: ['Tech','Health','Finance','Energy','Industrial','Consumer'], datasets: [{ data: [15,8,5,-2,6,4], backgroundColor: '#3b6eff', borderRadius: 8, borderSkipped: false }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: -5, max: 15, ticks: { stepSize: 5, color: '#9ca3af', font: { size: 11 } }, grid: { color: 'rgba(148,163,184,0.18)' }, border: { display: false } }, x: { ticks: { color: '#9ca3af', font: { size: 11 } }, grid: { display: false }, border: { display: false } } } },
      });
    }
  };

  const formatDate = d => d?.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) ?? '—';

  const iconBox = (bg, color) => ({ width: 60, height: 60, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.55rem', flexShrink: 0, background: bg, color });

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '28px' }}>
        <div>
          <h1 className="page-title">Market Insights Dashboard</h1>
          <p className="page-subtitle">Real-time market data and analysis</p>
        </div>
        <button type="button" className="btn-primary-action" onClick={loadInsights} disabled={loading}>
          <i className="bi bi-arrow-clockwise"></i>{loading ? 'Refreshing...' : 'Refresh Insights'}
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
        {[
          { label: 'Market Trend',   value: dashboardData.trend,        sub: dashboardData.sp500,       bg: '#eaf7ef', color: '#2563eb', icon: 'bi-graph-up-arrow',     emphasis: 'summary-emphasis-green' },
          { label: 'Top Performer',  value: dashboardData.topPerformer, sub: dashboardData.performance, bg: '#e9efff', color: '#2563eb', icon: 'bi-award',               emphasis: 'summary-emphasis-green' },
          { label: 'Risk Level',     value: dashboardData.riskLevel,    sub: dashboardData.riskSub,     bg: '#fff2e8', color: '#2563eb', icon: 'bi-exclamation-triangle', emphasis: 'summary-emphasis-dark'  },
        ].map(({ label, value, sub, bg, color, icon, emphasis }) => (
          <div key={label} style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: '18px', padding: '22px 24px', boxShadow: '0 2px 16px rgba(59,110,255,.07)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <p className="summary-label">{label}</p>
              <h2 className={`summary-value ${emphasis}`} style={{ fontSize: '1.9rem' }}>{value}</h2>
              <p className="summary-sub">{sub}</p>
            </div>
            <div style={iconBox(bg, color)}><i className={`bi ${icon}`}></i></div>
          </div>
        ))}
      </div>

      {/* API Summary Panel */}
      <div className="dashboard-panel" style={{ marginBottom: '20px' }}>
        <div className="insight-card-head">
          <h3 className="section-title-sm mb-0">API-driven Summary</h3>
          <span className="insight-pill">{dashboardData.riskLevel} Risk</span>
        </div>
        <div className="dashboard-summary-grid">
          <div className="dashboard-summary-item">
            <span className="insight-label">Trend Signal</span>
            <div className="dashboard-inline-highlight"><i className="bi bi-arrow-up-right"></i><span>{dashboardData.trend}</span></div>
          </div>
          <div className="dashboard-summary-item">
            <span className="insight-label">Top Performing Segment</span>
            <strong className="insight-value">{dashboardData.topPerformer}</strong>
          </div>
          <div className="dashboard-summary-item">
            <span className="insight-label">Performance Reading</span>
            <strong className="insight-value dashboard-performance-value">{dashboardData.performance.replace(' Growth', '')}</strong>
          </div>
        </div>
        <div className="dashboard-updated-row">
          <i className="bi bi-clock-history"></i><span>Last Updated: {formatDate(lastUpdated)}</span>
        </div>
      </div>

      {/* Financial News */}
      <div style={{ marginBottom: '20px' }}>
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">Financial News</h2>
          <p className="page-subtitle">Latest updates from trusted sources</p>
        </div>
        <div className="dashboard-news-list">
          {[
            { thumb: 'news-thumb--1', title: 'Tech Stocks Rally as AI Innovation Continues to Drive Growth',       source: 'Financial Times', time: '2 hours ago' },
            { thumb: 'news-thumb--2', title: 'S&P 500 Reaches New Heights Amid Strong Economic Data',              source: 'Bloomberg',       time: '4 hours ago' },
            { thumb: 'news-thumb--3', title: 'Federal Reserve Signals Cautious Approach to Interest Rate Changes', source: 'Reuters',         time: '6 hours ago' },
          ].map((n, i) => (
            <article key={i} className="news-card">
              <div className={`news-thumb ${n.thumb}`}></div>
              <div className="news-content">
                <h3 className="news-title">{n.title}</h3>
                <div className="news-meta">
                  <span className="news-source">{n.source}</span><span>&bull;</span>
                  <span>{n.time}</span><span>&bull;</span>
                  <span className="news-link"><i className="bi bi-box-arrow-up-right"></i></span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div style={{ marginBottom: '20px' }}>
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title">Market Trends Visualization</h2>
          <p className="page-subtitle">Historical performance and sector analysis</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="dashboard-panel chart-panel">
            <h3 className="section-title-sm">S&amp;P 500 Trend (2026)</h3>
            <div className="chart-wrapper"><canvas ref={trendChartRef}></canvas></div>
          </div>
          <div className="dashboard-panel chart-panel">
            <h3 className="section-title-sm">Sector Performance Comparison</h3>
            <div className="chart-wrapper"><canvas ref={sectorChartRef}></canvas></div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="dashboard-panel">
        <div className="dashboard-section-header mb-0">
          <h2 className="dashboard-section-title">Next Actions &amp; Recommendations</h2>
          <p className="page-subtitle">Suggested actions based on current market conditions</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '18px' }}>
          {[
            { icon: 'bi-check-circle',    title: 'Stay Aggressive',             text: 'Market trend is bullish. Consider increasing exposure to growth stocks.',                                                    warn: false },
            { icon: 'bi-bar-chart-line',  title: 'Compare Portfolio Allocation', text: 'Review your current allocation against top-performing sectors.',                                                             warn: true  },
            { icon: 'bi-shield-check',    title: 'Review Risk Level',            text: 'Current market volatility is moderate. Assess your risk tolerance before investing.',                                         warn: false },
            { icon: 'bi-exclamation-circle', title: 'Monitor Tech Sector',      text: `Tech Stocks showing strong performance (${dashboardData.performance.replace(' Growth','')}). Watch for pullback opportunities.`, warn: true  },
          ].map((r, i) => (
            <div key={i} className={`recommendation-item${r.warn ? ' warning' : ''}`}>
              <div className="recommendation-icon"><i className={`bi ${r.icon}`}></i></div>
              <div><h4>{r.title}</h4><p>{r.text}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// PROTECTED ROUTE
// ═══════════════════════════════════════════════════════
const ProtectedRoute = ({ children, user }) => {
  const stored = getStoredUser();
  return stored?.email ? children : <Navigate to="/login" />;
};

// ═══════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════
export default function App() {
  const [user, setUser] = useState(() => getStoredUser());
  const location = useLocation();

  const isAuthPage = ['/login', '/register', '/forgot-password', '/change-password'].includes(location.pathname);
  const currentPageMap = { '/': 'goals', '/dashboard': 'dashboard', '/investments': 'investments', '/roi': 'roi', '/profile': 'profile' };
  const currentPage = currentPageMap[location.pathname] || 'goals';

  useEffect(() => { setUser(getStoredUser()); }, []);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {!isAuthPage && <Sidebar currentPage={currentPage} user={user} isAuthPage={isAuthPage} />}
      <div style={{ flex: 1, width: '100%', minWidth: 0 }}>
        <Routes>
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/change-password" element={<ChangePasswordPage user={user} />} />
          <Route path="/"           element={<ProtectedRoute user={user}><GoalsPage       user={user}           /></ProtectedRoute>} />
          <Route path="/dashboard"  element={<ProtectedRoute user={user}><DashboardPage   user={user}           /></ProtectedRoute>} />
          <Route path="/investments"element={<ProtectedRoute user={user}><InvestmentsPage user={user}           /></ProtectedRoute>} />
          <Route path="/roi"        element={<ProtectedRoute user={user}><RoiPage         user={user}           /></ProtectedRoute>} />
          <Route path="/profile"    element={<ProtectedRoute user={user}><ProfilePage     user={user} setUser={setUser} /></ProtectedRoute>} />
          <Route path="*"           element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}