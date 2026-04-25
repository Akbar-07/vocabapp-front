import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Settings from './Settings';
import ProfileModal from './ProfileModal';

export default function Navbar({ onNightMode, nightMode }) {
  const { user, logoutUser } = useAuth();
  const [showSettings, setShowSettings]   = useState(false);
  const [showProfile,  setShowProfile]    = useState(false);
  const [showDropdown, setShowDropdown]   = useState(false);
  const dropdownRef = useRef(null);
  const nav = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openSettings = () => { setShowDropdown(false); setShowSettings(true); };
  const openProfile  = () => { setShowDropdown(false); setShowProfile(true); };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand" onClick={() => nav('/')} style={{ cursor: 'pointer' }}>
            <i className="bx bx-book-open"></i> VocabApp
          </div>
          <div className="navbar-actions">
            {user?.is_staff && (
              <button className="btn btn-sm" style={{ background: '#f72585', color: 'white' }} onClick={() => nav('/admin')}>
                <i className="bx bx-shield"></i> Admin
              </button>
            )}

            <div className="user-dropdown-wrap" ref={dropdownRef}>
              <button className="btn btn-sm btn-secondary user-dropdown-btn" onClick={() => setShowDropdown(v => !v)}>
                <span className="user-avatar-mini">{(user?.username || 'U')[0].toUpperCase()}</span>
                <span className="user-dropdown-name">{user?.username}</span>
                <i className={`bx bx-chevron-${showDropdown ? 'up' : 'down'}`}></i>
              </button>

              {showDropdown && (
                <div className="user-dropdown-menu">
                  <button className="user-dropdown-item" onClick={openProfile}>
                    <i className="bx bx-user"></i> Profile
                  </button>
                  <button className="user-dropdown-item" onClick={openSettings}>
                    <i className="bx bx-cog"></i> Settings
                  </button>
                  <div className="user-dropdown-divider"></div>
                  <button className="user-dropdown-item danger" onClick={() => { logoutUser(); nav('/login'); }}>
                    <i className="bx bx-log-out"></i> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showSettings && <Settings onClose={() => setShowSettings(false)} onNightMode={onNightMode} nightMode={nightMode} />}
      {showProfile  && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
}
