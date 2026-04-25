import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  updateProfile, changePassword,
  requestEmailChange, confirmEmailChange,
  resendVerification, verifyEmail
} from '../api/auth';

export default function ProfileModal({ onClose }) {
  const { user, setUser } = useAuth();

  const [tab, setTab] = useState('info');

  // Info tab
  const [username, setUsername]     = useState(user?.username || '');
  const [newEmail, setNewEmail]     = useState('');
  const [emailStep, setEmailStep]   = useState('idle'); // idle | code
  const [emailCode, setEmailCode]   = useState('');
  const [infoMsg, setInfoMsg]       = useState({ type: '', text: '' });
  const [infoLoading, setInfoLoading] = useState(false);

  // Verify email
  const [verifyStep, setVerifyStep] = useState('idle'); // idle | code
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyMsg, setVerifyMsg]   = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Password tab
  const [curPass,  setCurPass]  = useState('');
  const [newPass,  setNewPass]  = useState('');
  const [newPass2, setNewPass2] = useState('');
  const [passMsg,  setPassMsg]  = useState({ type: '', text: '' });
  const [passLoading, setPassLoading] = useState(false);

  const saveUsername = async () => {
    if (!username.trim()) return;
    setInfoLoading(true); setInfoMsg({ type: '', text: '' });
    try {
      const { data } = await updateProfile({ username });
      setUser(prev => ({ ...prev, username: data.username }));
      setInfoMsg({ type: 'success', text: 'Username saved!' });
    } catch (e) {
      setInfoMsg({ type: 'error', text: e.response?.data?.error || 'Something went wrong' });
    } finally { setInfoLoading(false); }
  };

  const requestEmail = async () => {
    if (!newEmail.trim()) return;
    setInfoLoading(true); setInfoMsg({ type: '', text: '' });
    try {
      await requestEmailChange({ new_email: newEmail });
      setEmailStep('code');
      setInfoMsg({ type: 'success', text: 'Verification code sent to your new email!' });
    } catch (e) {
      setInfoMsg({ type: 'error', text: e.response?.data?.error || 'Something went wrong' });
    } finally { setInfoLoading(false); }
  };

  const confirmEmail = async () => {
    if (!emailCode.trim()) return;
    setInfoLoading(true); setInfoMsg({ type: '', text: '' });
    try {
      const { data } = await confirmEmailChange({ code: emailCode });
      setUser(prev => ({ ...prev, email: data.email }));
      setEmailStep('idle'); setNewEmail(''); setEmailCode('');
      setInfoMsg({ type: 'success', text: 'Email changed successfully!' });
    } catch (e) {
      setInfoMsg({ type: 'error', text: e.response?.data?.error || 'Invalid code' });
    } finally { setInfoLoading(false); }
  };

  // Send verification code
  const handleSendVerify = async () => {
    setVerifyLoading(true); setVerifyMsg('');
    try {
      await resendVerification();
      setVerifyStep('code');
      setVerifyMsg('Verification code sent to your email!');
    } catch (e) {
      setVerifyMsg(e.response?.data?.error || 'Something went wrong');
    } finally { setVerifyLoading(false); }
  };

  // Confirm verification code
  const handleConfirmVerify = async () => {
    if (!verifyCode.trim()) return;
    setVerifyLoading(true); setVerifyMsg('');
    try {
      await verifyEmail({ code: verifyCode, email: user?.email });
      setUser(prev => ({ ...prev, is_email_verified: true }));
      setVerifyStep('idle'); setVerifyCode('');
      setVerifyMsg('Email verified successfully!');
    } catch (e) {
      setVerifyMsg(e.response?.data?.error || 'Invalid code');
    } finally { setVerifyLoading(false); }
  };

  const handlePassword = async () => {
    if (!curPass || !newPass || !newPass2) {
      setPassMsg({ type: 'error', text: 'Please fill in all fields' }); return;
    }
    if (newPass !== newPass2) {
      setPassMsg({ type: 'error', text: 'New passwords do not match' }); return;
    }
    if (newPass.length < 6) {
      setPassMsg({ type: 'error', text: 'Password must be at least 6 characters' }); return;
    }
    setPassLoading(true); setPassMsg({ type: '', text: '' });
    try {
      await changePassword({ current_password: curPass, new_password: newPass });
      setPassMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurPass(''); setNewPass(''); setNewPass2('');
    } catch (e) {
      setPassMsg({ type: 'error', text: e.response?.data?.error || 'Something went wrong' });
    } finally { setPassLoading(false); }
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="profile-modal">
        {/* Header */}
        <div className="profile-modal-header">
          <div className="profile-avatar-big">
            {(user?.username || 'U')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '16px' }}>{user?.username}</div>
            <div style={{ fontSize: '13px', color: 'var(--gray)' }}>{user?.email}</div>
            {!user?.is_email_verified && (
              <div style={{ marginTop: '8px', padding: '10px 12px', background: 'rgba(247,37,133,0.08)', borderRadius: '10px', border: '1px solid rgba(247,37,133,0.2)' }}>
                <div style={{ fontSize: '12px', color: '#f72585', fontWeight: 600, marginBottom: '8px' }}>
                  <i className="bx bx-error-circle"></i> Email not verified
                </div>
                {verifyStep === 'idle' ? (
                  <button className="btn btn-sm" style={{ background: '#f72585', color: 'white', fontSize: '12px' }}
                    onClick={handleSendVerify} disabled={verifyLoading}>
                    {verifyLoading ? <span className="spinner"></span> : <><i className="bx bx-envelope"></i> Send verification code</>}
                  </button>
                ) : (
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--gray)', marginBottom: '6px' }}>{verifyMsg}</div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input className="form-input" style={{ fontSize: '13px', padding: '6px 10px' }}
                        value={verifyCode} onChange={e => setVerifyCode(e.target.value)}
                        placeholder="6-digit code" maxLength={6} />
                      <button className="btn btn-sm btn-primary" onClick={handleConfirmVerify} disabled={verifyLoading || !verifyCode}>
                        {verifyLoading ? <span className="spinner"></span> : 'Verify'}
                      </button>
                    </div>
                    <button style={{ background: 'none', border: 'none', color: 'var(--gray)', fontSize: '11px', cursor: 'pointer', marginTop: '4px' }}
                      onClick={() => { setVerifyStep('idle'); setVerifyCode(''); setVerifyMsg(''); }}>
                      Cancel
                    </button>
                  </div>
                )}
                {verifyStep === 'idle' && verifyMsg && (
                  <div style={{ fontSize: '11px', color: 'var(--gray)', marginTop: '4px' }}>{verifyMsg}</div>
                )}
              </div>
            )}
          </div>
          <button className="btn btn-icon btn-secondary" onClick={onClose}>
            <i className="bx bx-x"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button className={`profile-tab ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>
            <i className="bx bx-user"></i> Info
          </button>
          <button className={`profile-tab ${tab === 'password' ? 'active' : ''}`} onClick={() => setTab('password')}>
            <i className="bx bx-lock"></i> Password
          </button>
        </div>

        {/* Info Tab */}
        {tab === 'info' && (
          <div className="profile-tab-content">
            {infoMsg.text && (
              <div className={infoMsg.type === 'success' ? 'success-msg' : 'error-msg'} style={{ marginBottom: '16px' }}>
                {infoMsg.text}
              </div>
            )}
            <div className="form-group">
              <label>Username</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input className="form-input" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
                <button className="btn btn-primary" onClick={saveUsername} disabled={infoLoading || username === user?.username}>
                  {infoLoading ? <span className="spinner"></span> : 'Save'}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label>Change Email</label>
              <div style={{ fontSize: '12px', color: 'var(--gray)', marginBottom: '6px' }}>
                Current: <strong>{user?.email}</strong>
              </div>
              {emailStep === 'idle' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input className="form-input" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="New email" type="email" />
                  <button className="btn btn-primary" onClick={requestEmail} disabled={infoLoading || !newEmail}>
                    {infoLoading ? <span className="spinner"></span> : 'Send'}
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '12px', color: 'var(--primary)', marginBottom: '8px' }}>
                    <i className="bx bx-envelope"></i> Code sent to {newEmail}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input className="form-input" value={emailCode} onChange={e => setEmailCode(e.target.value)} placeholder="6-digit code" maxLength={6} />
                    <button className="btn btn-primary" onClick={confirmEmail} disabled={infoLoading || !emailCode}>
                      {infoLoading ? <span className="spinner"></span> : 'Verify'}
                    </button>
                  </div>
                  <button style={{ background: 'none', border: 'none', color: 'var(--gray)', fontSize: '12px', cursor: 'pointer', marginTop: '6px' }}
                    onClick={() => { setEmailStep('idle'); setEmailCode(''); }}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Password Tab */}
        {tab === 'password' && (
          <div className="profile-tab-content">
            {passMsg.text && (
              <div className={passMsg.type === 'success' ? 'success-msg' : 'error-msg'} style={{ marginBottom: '16px' }}>
                {passMsg.text}
              </div>
            )}
            <div className="form-group">
              <label>Current password</label>
              <input className="form-input" type="password" value={curPass} onChange={e => setCurPass(e.target.value)} placeholder="Current password" />
            </div>
            <div className="form-group" style={{ marginTop: '12px' }}>
              <label>New password</label>
              <input className="form-input" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="New password" />
            </div>
            <div className="form-group" style={{ marginTop: '12px' }}>
              <label>Confirm new password</label>
              <input className="form-input" type="password" value={newPass2} onChange={e => setNewPass2(e.target.value)} placeholder="Repeat new password" />
            </div>
            <button className="btn btn-primary btn-full" style={{ marginTop: '20px' }} onClick={handlePassword} disabled={passLoading}>
              {passLoading ? <span className="spinner"></span> : 'Change Password'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
