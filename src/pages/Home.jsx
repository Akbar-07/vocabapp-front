import { useState, useEffect } from 'react';
import { getRooms, createRoom, updateRoom, deleteRoom } from '../api/vocab';
import { useNavigate } from 'react-router-dom';
import ShareModal from '../components/ShareModal';
import Modal from '../components/Modal';

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editRoom, setEditRoom] = useState(null);
  const [editName, setEditName] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showShare, setShowShare] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [err, setErr] = useState('');
  const nav = useNavigate();

  const load = () => getRooms().then(r => { setRooms(r.data); setLoading(false); });
  useEffect(() => { load(); }, []);

  const create = async e => {
    e.preventDefault(); setErr('');
    if (!newName.trim()) return;
    try { await createRoom({ name: newName.trim() }); setNewName(''); setShowCreate(false); load(); }
    catch(e) { setErr(e.response?.data?.error || 'Something went wrong.'); }
  };

  const edit = async () => {
    if (!editName.trim()) return;
    await updateRoom(editRoom.id, { name: editName });
    setEditRoom(null); load();
  };

  const del = async () => {
    await deleteRoom(deleteConfirm.id);
    setDeleteConfirm(null); load();
  };

  if (loading) return <div style={{textAlign:'center',padding:'60px'}}><span className="spinner"></span></div>;

  return (
    <div className="app-layout">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'10px'}}>
        <div className="page-title"><i className="bx bx-collection"></i> My Rooms</div>
        <div style={{display:'flex',gap:'10px'}}>
          <button className="btn btn-secondary" onClick={() => setShowShare(true)}>
            <i className="bx bx-share-alt"></i> Share
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <i className="bx bx-plus"></i> New Room
          </button>
        </div>
      </div>

      {rooms.length === 0 ? (
        <div style={{textAlign:'center',padding:'60px 20px',color:'var(--gray)'}}>
          <i className="bx bx-folder-open" style={{fontSize:'60px',color:'var(--light-gray)'}}></i>
          <p style={{marginTop:'16px',fontSize:'16px'}}>No rooms yet. Create your first room!</p>
          <button className="btn btn-primary mt-16" onClick={() => setShowCreate(true)}>
            <i className="bx bx-plus"></i> Create Room
          </button>
        </div>
      ) : (
        <div className="rooms-grid">
          {rooms.map(r => (
            <div key={r.id} className="room-card" onClick={() => nav(`/room/${r.id}`)}>
              <div className="room-card-name"><i className="bx bx-folder"></i> {r.name}</div>
              <div className="room-card-count">{r.word_count} words</div>
              <div className="room-card-actions" onClick={e=>e.stopPropagation()}>
                <button className="btn btn-sm btn-success btn-icon"
                  onClick={() => { setEditRoom(r); setEditName(r.name); }}>
                  <i className="bx bx-edit"></i>
                </button>
                <button className="btn btn-sm btn-danger btn-icon"
                  onClick={() => setDeleteConfirm(r)}>
                  <i className="bx bx-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <Modal title="➕ New Room" onClose={() => setShowCreate(false)}>
          <form onSubmit={create}>
            <div className="form-group">
              <label>Room name</label>
              <input className="form-input" placeholder="e.g. IELTS, Grammar, Daily..." autoFocus
                value={newName} onChange={e=>setNewName(e.target.value)} />
            </div>
            {err && <div className="error-msg">{err}</div>}
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary"><i className="bx bx-plus"></i> Create</button>
            </div>
          </form>
        </Modal>
      )}

      {editRoom && (
        <Modal title="✏️ Rename Room" onClose={() => setEditRoom(null)}>
          <div className="form-group">
            <input className="form-input" autoFocus value={editName} onChange={e=>setEditName(e.target.value)} />
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setEditRoom(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={edit}>Save</button>
          </div>
        </Modal>
      )}

      {deleteConfirm && (
        <Modal title="🗑️ Delete Room" onClose={() => setDeleteConfirm(null)}>
          <p style={{color:'var(--gray)'}}>
            Delete "<b>{deleteConfirm.name}</b>" and all its words?
          </p>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={del}><i className="bx bx-trash"></i> Delete</button>
          </div>
        </Modal>
      )}

      {showShare && <ShareModal onClose={() => setShowShare(false)} onImported={load} />}
    </div>
  );
}
