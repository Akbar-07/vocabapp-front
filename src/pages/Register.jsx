import { useState } from 'react';
import { register } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async e => {
    e.preventDefault(); setErr(''); setLoading(true);
    try {
      await register(form);
      setSuccess('Verification code sent to your email!');
      setTimeout(() => nav(`/verify-email?email=${encodeURIComponent(form.email)}`), 1500);
    } catch(e) {
      const d = e.response?.data;
      setErr(d?.email?.[0] || d?.username?.[0] || d?.password?.[0] || d?.error || 'Something went wrong.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div className="auth-logo">
          <h1><i className="bx bx-book-open" style={{color:'#4361ee'}}></i> VocabApp</h1>
          <p>Create a new account</p>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email</label>
            <input className="form-input" type="email" placeholder="email@example.com"
              value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Username</label>
            <input className="form-input" placeholder="username"
              value={form.username} onChange={e=>setForm({...form,username:e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-input" type="password" placeholder="At least 6 characters"
              value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
          </div>
          {err && <div className="error-msg">{err}</div>}
          {success && <div className="success-msg">{success}</div>}
          <button className="btn btn-primary btn-full mt-16" disabled={loading}>
            {loading ? <span className="spinner"></span> : <><i className="bx bx-user-plus"></i> Register</>}
          </button>
        </form>
        <div className="auth-link">Already have an account? <Link to="/login">Sign in</Link></div>
      </div>
    </div>
  );
}
