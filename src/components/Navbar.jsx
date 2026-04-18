import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Settings from './Settings';

export default function Navbar({ onNightMode, nightMode }) {
  const { user, logoutUser } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const nav = useNavigate();

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand" onClick={() => nav('/')} style={{cursor:'pointer'}}>
            <i className="bx bx-book-open"></i> VocabApp
          </div>
          <div className="navbar-actions">
            {user?.is_staff && (
              <button className="btn btn-sm" style={{background:'#f72585',color:'white'}} onClick={() => nav('/admin')}>
                <i className="bx bx-shield"></i> Admin
              </button>
            )}
            <button className="btn btn-sm btn-secondary" onClick={() => setShowSettings(true)} title="Settings">
              <i className="bx bx-cog"></i>
            </button>
            <button className="btn btn-sm btn-danger" title="Sign out"
              onClick={() => { logoutUser(); nav('/login'); }}>
              <i className="bx bx-log-out"></i>
            </button>
          </div>
        </div>
      </nav>
      {showSettings && <Settings onClose={() => setShowSettings(false)} onNightMode={onNightMode} nightMode={nightMode} />}
    </>
  );
}
