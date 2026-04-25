import { useState } from 'react';
import { login } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const nav = useNavigate();

  const submit = async e => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      const { data } = await login(form);
      loginUser(data); nav('/');
    } catch(e) { setErr(e.response?.data?.error || 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <h1><i className="bx bx-book-open" style={{color:'#4361ee'}}></i> VocabApp</h1>
          <p>Sign in to your account</p>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email or Username</label>
            <input className="form-input" type="text" placeholder="email@example.com or username"
              value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-input" type="password" placeholder="Your password"
              value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
          </div>
          {err && <div className="error-msg">{err}</div>}
          <button className="btn btn-primary btn-full mt-16" disabled={loading}>
            {loading ? <span className="spinner"></span> : <><i className="bx bx-log-in"></i> Sign In</>}
          </button>
        </form>
        <div className="auth-link"><Link to="/forgot-password">Forgot your password?</Link></div>
        <div className="auth-link">No account? <Link to="/register">Register</Link></div>
      </div>
    </div>
  );
}
