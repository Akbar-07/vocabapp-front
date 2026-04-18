import { useState } from 'react';
import { verifyEmail } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const nav = useNavigate();

  const submit = async e => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      const { data } = await verifyEmail({ email, code });
      loginUser(data); nav('/');
    } catch(e) { setErr(e.response?.data?.error || 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>📧 Verify Email</h1>
          <p>A 6-digit code was sent to <b>{email}</b></p>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Verification Code</label>
            <input className="form-input" placeholder="123456" maxLength={6}
              value={code} onChange={e=>setCode(e.target.value)} required autoFocus
              style={{fontSize:'28px',textAlign:'center',letterSpacing:'10px',fontWeight:'700'}} />
          </div>
          {err && <div className="error-msg">{err}</div>}
          <button className="btn btn-primary btn-full mt-16" disabled={loading}>
            {loading ? <span className="spinner"></span> : <><i className="bx bx-check"></i> Verify</>}
          </button>
        </form>
      </div>
    </div>
  );
}
