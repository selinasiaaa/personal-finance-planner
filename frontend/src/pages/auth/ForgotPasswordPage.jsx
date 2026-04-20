import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest, isValidEmail } from '../../utils/session'
import './AuthShared.css'

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
    <div className="auth-page">
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

export default ForgotPasswordPage
