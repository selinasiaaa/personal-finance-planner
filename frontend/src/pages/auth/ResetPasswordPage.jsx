import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { apiRequest, isStrongPassword } from '../../utils/session'
import './AuthShared.css'

const ResetPasswordPage = () => {
  const navigate = useNavigate()
  const { token } = useParams()
  const [formData, setFormData] = useState({ newPassword: '', confirmNewPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!token) {
      setError('Reset token is missing or invalid.')
      return
    }

    if (!formData.newPassword || !formData.confirmNewPassword) {
      setError('Please fill in both password fields.')
      return
    }

    if (!isStrongPassword(formData.newPassword)) {
      setError('New password must be at least 8 characters and include a letter and a number.')
      return
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      setError('New password and confirm password do not match.')
      return
    }

    setLoading(true)
    try {
      const data = await apiRequest(`/api/auth/reset-password/${token}`, {
        method: 'PUT',
        body: JSON.stringify({ password: formData.newPassword }),
      })

      setSuccess(data?.message || 'Password reset successfully.')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.message || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container auth-container--narrow">
        <div className="auth-card">
          <div className="auth-header"><h2>Reset Password</h2><p>Create a new password for your account</p></div>
          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}
            {success && <div style={{ color: '#22c55e', marginBottom: '16px', fontSize: '0.9rem' }}>{success}</div>}
            <div className="form-group"><label>New Password</label><input type="password" value={formData.newPassword} onChange={e => setFormData({ ...formData, newPassword: e.target.value })} placeholder="Enter new password" autoComplete="new-password" /></div>
            <div className="form-group"><label>Confirm Password</label><input type="password" value={formData.confirmNewPassword} onChange={e => setFormData({ ...formData, confirmNewPassword: e.target.value })} placeholder="Confirm new password" autoComplete="new-password" /></div>
            <button type="submit" className="btn-auth" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
          </form>
          <div className="auth-footer"><p>Remember your password? <a href="/login">Sign in</a></p></div>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage