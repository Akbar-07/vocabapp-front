import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdminUsers, deleteUser, toggleStaff } from '../api/auth';
import { getAdminStats } from '../api/vocab';
import Modal from '../components/Modal';

const TABS = [
  { id:'dashboard', icon:'bx-home', label:'Dashboard' },
  { id:'users', icon:'bx-group', label:'Users' },
];

export default function Admin() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');
  const [delConfirm, setDelConfirm] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.is_staff) { nav('/'); return; }
    getAdminStats().then(r => setStats(r.data));
    loadUsers();
  }, [user, nav]);

  const loadUsers = () => {
    setLoading(true);
    getAdminUsers().then(r => { setUsers(r.data); setLoading(false); });
  };

  const handleToggleStaff = async id => { await toggleStaff(id); loadUsers(); };
  const handleDelete = async () => { await deleteUser(delConfirm.id); setDelConfirm(null); loadUsers(); };

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <div className="admin-sidebar-title">Admin Panel</div>
        {TABS.map(t => (
          <div key={t.id} className={`admin-nav-item ${tab===t.id?'active':''}`} onClick={() => setTab(t.id)}>
            <i className={`bx ${t.icon}`} style={{fontSize:'20px'}}></i> {t.label}
          </div>
        ))}
        <div className="admin-nav-item" onClick={() => nav('/')}
          style={{borderTop:'1px solid rgba(255,255,255,0.1)',marginTop:'20px'}}>
          <i className="bx bx-arrow-back" style={{fontSize:'20px'}}></i> Back to Site
        </div>
      </div>

      <div className="admin-content">
        {tab==='dashboard' && stats && (
          <>
            <div className="page-title"><i className="bx bx-home"></i> Dashboard</div>
            <div className="stat-cards">
              {[
                ['Total Users',    stats.total_users,    'bx-group',        '#4361ee'],
                ['Verified',       stats.verified_users, 'bx-check-circle', '#2b9348'],
                ['Total Rooms',    stats.total_rooms,    'bx-folder',       '#f72585'],
                ['Total Words',    stats.total_words,    'bx-book',         '#f8961e'],
              ].map(([label,val,icon,color]) => (
                <div key={label} className="stat-card">
                  <i className={`bx ${icon}`} style={{fontSize:'32px',color,marginBottom:'8px'}}></i>
                  <div className="stat-card-num" style={{color}}>{val}</div>
                  <div className="stat-card-label">{label}</div>
                </div>
              ))}
            </div>
            <div className="card">
              <h3 style={{marginBottom:'16px',color:'var(--primary-dark)'}}>👥 Recent Users</h3>
              <table className="admin-table">
                <thead><tr><th>Email</th><th>Username</th><th>Status</th><th>Registered</th></tr></thead>
                <tbody>
                  {users.slice(0,8).map(u => (
                    <tr key={u.id}>
                      <td>{u.email}</td>
                      <td>{u.username}</td>
                      <td>
                        <span className={`badge ${u.is_email_verified?'badge-success':'badge-danger'}`}>
                          {u.is_email_verified ? '✓ Verified' : '✗ Unverified'}
                        </span>
                        {u.is_staff && <span className="badge badge-primary" style={{marginLeft:'4px'}}>Admin</span>}
                      </td>
                      <td style={{fontSize:'12px',color:'var(--gray)'}}>{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab==='users' && (
          <>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px',flexWrap:'wrap',gap:'10px'}}>
              <div className="page-title" style={{margin:0}}>
                <i className="bx bx-group"></i> Users ({users.length})
              </div>
              <input className="form-input" placeholder="🔍 Search by email or username..." value={search}
                onChange={e=>setSearch(e.target.value)} style={{width:'280px',marginTop:0}} />
            </div>
            {loading
              ? <div style={{textAlign:'center',padding:'40px'}}><span className="spinner"></span></div>
              : (
              <div className="card" style={{padding:0,overflow:'hidden'}}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Email</th><th>Username</th><th>Rooms</th>
                      <th>Status</th><th>Registered</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => (
                      <>
                        <tr key={u.id} style={{cursor:'pointer'}}
                          onClick={() => setExpanded(expanded===u.id?null:u.id)}>
                          <td><b>{u.email}</b></td>
                          <td>{u.username}</td>
                          <td><span className="badge badge-primary">{u.room_count}</span></td>
                          <td>
                            <span className={`badge ${u.is_email_verified?'badge-success':'badge-danger'}`}>
                              {u.is_email_verified ? '✓ Verified' : '✗ Unverified'}
                            </span>
                            {u.is_staff && <span className="badge badge-primary" style={{marginLeft:'4px'}}>Admin</span>}
                          </td>
                          <td style={{fontSize:'12px',color:'var(--gray)'}}>{new Date(u.created_at).toLocaleDateString()}</td>
                          <td onClick={e=>e.stopPropagation()}>
                            <div style={{display:'flex',gap:'6px'}}>
                              <button className="btn btn-sm btn-secondary"
                                onClick={() => handleToggleStaff(u.id)}
                                title={u.is_staff?'Remove admin':'Make admin'}>
                                <i className={`bx ${u.is_staff?'bx-shield-x':'bx-shield'}`}></i>
                              </button>
                              <button className="btn btn-sm btn-danger" onClick={() => setDelConfirm(u)}>
                                <i className="bx bx-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expanded===u.id && (
                          <tr className="user-expand" key={u.id+'_exp'}>
                            <td colSpan="6">
                              <div className="user-rooms-list">
                                <p style={{fontWeight:600,marginBottom:'8px',color:'var(--primary-dark)'}}>
                                  📁 {u.username}'s rooms:
                                </p>
                                {u.rooms.length===0
                                  ? <p style={{color:'var(--gray)',fontSize:'14px'}}>No rooms yet.</p>
                                  : u.rooms.map(r => (
                                    <div key={r.id} style={{background:'var(--white)',borderRadius:'10px',padding:'10px 14px',marginBottom:'8px',boxShadow:'var(--card-shadow)'}}>
                                      <div style={{fontWeight:600,marginBottom:'6px'}}>
                                        📂 {r.name} <span className="badge badge-primary">{r.word_count} words</span>
                                      </div>
                                      {r.words.length>0 && (
                                        <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
                                          {r.words.map(w => (
                                            <span key={w.id} style={{fontSize:'12px',padding:'2px 8px',background:'rgba(67,97,238,0.08)',borderRadius:'20px',color:'var(--primary)'}}>
                                              {w.en} — {w.uz}
                                              {w.difficult && <span style={{color:'var(--danger)',marginLeft:'4px'}}>⭐</span>}
                                            </span>
                                          ))}
                                          {r.word_count>10 && <span style={{fontSize:'12px',color:'var(--gray)'}}>+{r.word_count-10} more</span>}
                                        </div>
                                      )}
                                    </div>
                                  ))
                                }
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {delConfirm && (
        <Modal title="🗑️ Delete User" onClose={() => setDelConfirm(null)}>
          <p style={{color:'var(--gray)'}}>
            Delete user "<b>{delConfirm.email}</b>" and all their data?
          </p>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setDelConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={handleDelete}><i className="bx bx-trash"></i> Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
