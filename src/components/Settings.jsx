import { useEffect, useState } from 'react';
import { getRooms, syncGrammar } from '../api/vocab';

export default function Settings({ onClose, onNightMode, nightMode }) {
  const [rooms, setRooms] = useState([]);
  const [showDef, setShowDef] = useState(() => localStorage.getItem('showDefinition') === 'true');
  const [autoSpeak, setAutoSpeak] = useState(() => localStorage.getItem('autoSpeak') === 'true');
  const [syncMsg, setSyncMsg] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [grammarExists, setGrammarExists] = useState(false);

  const loadRooms = () =>
    getRooms().then(r => {
      setRooms(r.data);
      setGrammarExists(r.data.some(room => room.name === 'grammar'));
    });

  useEffect(() => { loadRooms(); }, []);

  const toggleDef = v => {
    setShowDef(v);
    localStorage.setItem('showDefinition', v);
    document.body.classList.toggle('definition-hidden', !v);
  };

  const handleGrammarSync = async () => {
    setSyncing(true); setSyncMsg('');
    try {
      const { data } = await syncGrammar();
      setSyncMsg(data.message);
      loadRooms(); // rooms listni yangilaydi va grammarExists=true bo'ladi → button yo'qoladi
    } catch (e) {
      const err = e.response?.data?.error;
      if (err === 'already_synced') {
        setGrammarExists(true); // button yashir
      } else {
        setSyncMsg('Sync failed. Please try again.');
      }
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <div className="settings-backdrop" onClick={onClose}></div>
      <div className="settings-panel">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
          <h3 style={{fontWeight:700,color:'var(--primary-dark)'}}>⚙️ Settings</h3>
          <button className="btn btn-icon btn-secondary" onClick={onClose}><i className="bx bx-x"></i></button>
        </div>

        <div className="setting-row">
          <span>Night Mode</span>
          <label className="switch">
            <input type="checkbox" checked={nightMode} onChange={e => onNightMode(e.target.checked)} />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-row">
          <span>Show Definitions</span>
          <label className="switch">
            <input type="checkbox" checked={showDef} onChange={e => toggleDef(e.target.checked)} />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-row">
          <span>Auto Pronunciation</span>
          <label className="switch">
            <input type="checkbox" checked={autoSpeak}
              onChange={e => { setAutoSpeak(e.target.checked); localStorage.setItem('autoSpeak', e.target.checked); }} />
            <span className="slider"></span>
          </label>
        </div>

        {/* Grammar Sync — faqat grammar room yo'q bo'lganda ko'rinadi */}
        {!grammarExists && (
          <div style={{marginTop:'20px',padding:'14px',background:'var(--light)',borderRadius:'10px'}}>
            <p style={{fontWeight:600,marginBottom:'6px',fontSize:'14px',color:'var(--primary-dark)'}}>
              <i className="bx bx-book"></i> Grammar Room
            </p>
            <p style={{fontSize:'12px',color:'var(--gray)',marginBottom:'10px'}}>
              Add 95 built-in grammar & vocabulary words to your account.
            </p>
            <button className="btn btn-primary btn-full btn-sm" onClick={handleGrammarSync} disabled={syncing}>
              {syncing
                ? <span className="spinner"></span>
                : <><i className="bx bx-import"></i> Add Grammar Words</>}
            </button>
            {syncMsg && <div className="success-msg mt-8" style={{fontSize:'12px'}}>{syncMsg}</div>}
          </div>
        )}

        {/* Rooms list */}
        <div style={{marginTop:'20px'}}>
          <p style={{fontSize:'12px',color:'var(--gray)',marginBottom:'8px',fontWeight:600,textTransform:'uppercase',letterSpacing:'1px'}}>
            My Rooms
          </p>
          {rooms.length === 0
            ? <p style={{color:'var(--gray)',fontSize:'13px'}}>No rooms yet.</p>
            : rooms.map(r => (
              <div key={r.id} style={{padding:'8px 0',borderBottom:'1px solid var(--light-gray)',fontSize:'14px',display:'flex',justifyContent:'space-between'}}>
                <span>{r.name}</span>
                <span style={{color:'var(--gray)'}}>{r.word_count} words</span>
              </div>
            ))
          }
        </div>
      </div>
    </>
  );
}
