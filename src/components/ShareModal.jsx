import { useState, useEffect } from 'react';
import { getRooms, createShareCode, useShareCode } from '../api/vocab';
import Modal from '../components/Modal';

export default function ShareModal({ onClose, onImported }) {
  const [tab, setTab] = useState('send');
  const [rooms, setRooms] = useState([]);
  const [selected, setSelected] = useState([]);
  const [code, setCode] = useState('');
  const [genCode, setGenCode] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { getRooms().then(r => setRooms(r.data)); }, []);

  const toggle = id => setSelected(s => s.includes(id) ? s.filter(x=>x!==id) : [...s,id]);

  const generate = async () => {
    if (!selected.length) return setErr('Please select at least one room.');
    setErr(''); setLoading(true);
    try { const { data } = await createShareCode(selected); setGenCode(data.code); }
    catch(e) { setErr(e.response?.data?.error || 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  const doUseCode = async () => {
    if (!code.trim()) return setErr('Please enter a code.');
    setErr(''); setLoading(true);
    try {
      const { data } = await useShareCode(code);
      setMsg(data.message);
      setTimeout(() => { onClose(); onImported && onImported(); }, 1500);
    } catch(e) { setErr(e.response?.data?.error || 'Invalid code.'); }
    finally { setLoading(false); }
  };

  const copy = () => { navigator.clipboard.writeText(genCode); setMsg('Copied!'); };

  return (
    <Modal title="🔗 Share Rooms" onClose={onClose}>
      <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
        {[['send','📤 Send'],['receive','📥 Receive']].map(([t,l]) => (
          <button key={t} className={`btn btn-sm ${tab===t?'btn-primary':'btn-secondary'}`}
            onClick={() => { setTab(t); setErr(''); setMsg(''); setGenCode(''); }}>
            {l}
          </button>
        ))}
      </div>

      {tab === 'send' ? (
        <>
          <p style={{fontSize:'14px',color:'var(--gray)',marginBottom:'10px'}}>Select rooms to share:</p>
          <div className="room-checkbox-list">
            {rooms.map(r => (
              <label key={r.id} className="room-checkbox-item">
                <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggle(r.id)} />
                <span>{r.name}</span>
                <span style={{marginLeft:'auto',fontSize:'12px',color:'var(--gray)'}}>{r.word_count} words</span>
              </label>
            ))}
          </div>
          {genCode ? (
            <>
              <div className="share-code-display">{genCode}</div>
              <button className="btn btn-success btn-full" onClick={copy}>
                <i className="bx bx-copy"></i> Copy Code
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-full mt-16" onClick={generate} disabled={loading}>
              {loading ? <span className="spinner"></span> : <><i className="bx bx-qr"></i> Generate Code</>}
            </button>
          )}
        </>
      ) : (
        <>
          <div className="form-group">
            <label>Enter share code</label>
            <input className="form-input" placeholder="XXXXXXXX" value={code}
              onChange={e=>setCode(e.target.value.toUpperCase())} autoFocus
              style={{fontSize:'22px',textAlign:'center',letterSpacing:'4px',fontWeight:'700'}} />
          </div>
          <button className="btn btn-primary btn-full mt-16" onClick={doUseCode} disabled={loading}>
            {loading ? <span className="spinner"></span> : <><i className="bx bx-import"></i> Import Rooms</>}
          </button>
        </>
      )}
      {err && <div className="error-msg mt-8">{err}</div>}
      {msg && <div className="success-msg mt-8">{msg}</div>}
    </Modal>
  );
}
