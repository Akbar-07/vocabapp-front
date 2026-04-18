import { useState } from 'react';
import { forgotPassword, resetPassword } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPass, setNewPass] = useState('');
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const sendCode = async e => {
    e.preventDefault(); setErr(''); setLoading(true);
    try { await forgotPassword({ email }); setSuccess('Code sent!'); setStep(2); }
    catch(e) { setErr(e.response?.data?.error || 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  const doReset = async e => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      await resetPassword({ email, code, new_password: newPass });
      setSuccess('Password changed successfully!');
      setTimeout(() => nav('/login'), 1500);
    } catch(e) { setErr(e.response?.data?.error || 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🔒 Reset Password</h1>
          <p>{step===1 ? 'Enter your email address' : 'Enter the code and your new password'}</p>
        </div>
        {step === 1 ? (
          <form onSubmit={sendCode}>
            <div className="form-group">
              <label>Email</label>
              <input className="form-input" type="email" placeholder="email@example.com"
                value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            {err && <div className="error-msg">{err}</div>}
            {success && <div className="success-msg">{success}</div>}
            <button className="btn btn-primary btn-full mt-16" disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Send Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={doReset}>
            <div className="form-group">
              <label>Code</label>
              <input className="form-input" placeholder="123456" maxLength={6} autoFocus
                value={code} onChange={e=>setCode(e.target.value)} required
                style={{fontSize:'24px',textAlign:'center',letterSpacing:'8px',fontWeight:'700'}} />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input className="form-input" type="password" placeholder="New password"
                value={newPass} onChange={e=>setNewPass(e.target.value)} required />
            </div>
            {err && <div className="error-msg">{err}</div>}
            {success && <div className="success-msg">{success}</div>}
            <button className="btn btn-primary btn-full mt-16" disabled={loading}>
              {loading ? <span className="spinner"></span> : 'Change Password'}
            </button>
          </form>
        )}
        <div className="auth-link"><Link to="/login">← Back to login</Link></div>
      </div>
    </div>
  );
}
