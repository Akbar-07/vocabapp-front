import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoom, addWord, updateWord, deleteWord, toggleDifficult, clearDifficult } from '../api/vocab';
import Modal from '../components/Modal';
import FlashcardMode from '../components/FlashcardMode';
import PracticeMode from '../components/PracticeMode';
import CardPracticeMode from '../components/CardPracticeMode';

export default function RoomPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [room, setRoom] = useState(null);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ en:'', uz:'', definition:'', synonyms:'', antonyms:'' });
  const [editWord, setEditWord] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleteW, setDeleteW] = useState(null);
  const [err, setErr] = useState('');
  const [mode, setMode] = useState(null);
  const [practiceType, setPracticeType] = useState(false);

  const load = useCallback(() => {
    getRoom(id).then(r => { setRoom(r.data); setLoading(false); }).catch(() => nav('/'));
  }, [id, nav]);

  useEffect(() => { load(); }, [load]);

  const addWordFn = async e => {
    e.preventDefault(); setErr('');
    try {
      await addWord(id, {
        ...form,
        synonyms: form.synonyms ? form.synonyms.split(',').map(s=>s.trim()).filter(Boolean) : [],
        antonyms: form.antonyms ? form.antonyms.split(',').map(s=>s.trim()).filter(Boolean) : [],
      });
      setForm({ en:'', uz:'', definition:'', synonyms:'', antonyms:'' });
      load();
    } catch(e) { setErr(e.response?.data?.error || 'Something went wrong.'); }
  };

  const saveEdit = async () => {
    await updateWord(id, editWord.id, {
      ...editForm,
      synonyms: typeof editForm.synonyms === 'string'
        ? editForm.synonyms.split(',').map(s=>s.trim()).filter(Boolean)
        : editForm.synonyms,
      antonyms: typeof editForm.antonyms === 'string'
        ? editForm.antonyms.split(',').map(s=>s.trim()).filter(Boolean)
        : editForm.antonyms,
    });
    setEditWord(null); load();
  };

  const delWord = async () => { await deleteWord(id, deleteW.id); setDeleteW(null); load(); };
  const toggleDiff = async wid => { await toggleDifficult(id, wid); load(); };
  const speak = text => { const u = new SpeechSynthesisUtterance(text); u.lang='en-US'; speechSynthesis.speak(u); };

  if (loading) return <div style={{textAlign:'center',padding:'60px'}}><span className="spinner"></span></div>;
  if (!room) return null;

  const words = room.words || [];
  const difficultWords = words.filter(w => w.difficult);
  const displayWords = tab === 'difficult' ? difficultWords : words;

  if (mode==='flashcard') return <FlashcardMode words={practiceType?difficultWords:words} onClose={() => setMode(null)} />;
  if (mode==='practice') return <PracticeMode words={practiceType?difficultWords:words} onClose={() => setMode(null)} roomId={id} onUpdate={load} />;
  if (mode==='card-practice') return <CardPracticeMode words={practiceType?difficultWords:words} onClose={() => setMode(null)} roomId={id} onUpdate={load} />;

  return (
    <div className="app-layout">
      <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px',flexWrap:'wrap'}}>
        <button className="btn btn-secondary btn-icon" onClick={() => nav('/')}><i className="bx bx-arrow-back"></i></button>
        <div className="page-title" style={{margin:0}}><i className="bx bx-folder-open"></i> {room.name}</div>
      </div>

      <div className="card">
        <div className="tab-buttons">
          {[['all','bx-list-ul','All Words'],['difficult','bx-star','Difficult'],['add','bx-plus','Add Word']].map(([t,ic,label]) => (
            <button key={t} className={`tab-btn ${tab===t?'active':''}`} onClick={() => setTab(t)}>
              <i className={`bx ${ic}`}></i> {label}
              {t==='all' && <span className="count-badge">{words.length}</span>}
              {t==='difficult' && <span className="count-badge">{difficultWords.length}</span>}
            </button>
          ))}
        </div>

        {(tab==='all' || tab==='difficult') && (
          <>
            {tab==='all' && (
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'16px'}}>
                <button className="btn btn-primary btn-sm" onClick={() => { setPracticeType(false); setMode('flashcard'); }}>
                  <i className="bx bx-book-open"></i> Flashcard
                </button>
                <button className="btn btn-sm" style={{background:'var(--success)',color:'white'}} onClick={() => { setPracticeType(false); setMode('practice'); }}>
                  <i className="bx bx-play"></i> Practice
                </button>
                <button className="btn btn-sm" style={{background:'var(--primary-dark)',color:'white'}} onClick={() => { setPracticeType(false); setMode('card-practice'); }}>
                  <i className="bx bx-category"></i> Card Practice
                </button>
                <button className="btn btn-sm btn-warning" onClick={() => { setPracticeType(true); setMode('practice'); }}>
                  <i className="bx bx-star"></i> Difficult Practice
                </button>
              </div>
            )}
            {tab==='difficult' && difficultWords.length > 0 && (
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'16px'}}>
                <button className="btn btn-sm" style={{background:'var(--success)',color:'white'}} onClick={() => { setPracticeType(true); setMode('practice'); }}>
                  <i className="bx bx-play"></i> Practice
                </button>
                <button className="btn btn-sm" style={{background:'var(--primary-dark)',color:'white'}} onClick={() => { setPracticeType(true); setMode('card-practice'); }}>
                  <i className="bx bx-category"></i> Card Practice
                </button>
                <button className="btn btn-sm btn-danger" onClick={async () => { await clearDifficult(id); load(); }}>
                  <i className="bx bx-trash"></i> Clear All
                </button>
              </div>
            )}
            <ul style={{listStyle:'none',padding:0,maxHeight:'50vh',overflowY:'auto'}}>
              {displayWords.length === 0 ? (
                <li style={{textAlign:'center',padding:'40px',color:'var(--gray)'}}>
                  <i className="bx bx-folder-open" style={{fontSize:'40px',display:'block',marginBottom:'10px'}}></i>
                  No words yet
                </li>
              ) : displayWords.map(w => (
                <li key={w.id} className="word-item">
                  <div className="word-info-col">
                    <div className="word-main">
                      {w.en}
                      {w.difficult && <span className="difficult-dot"></span>}
                      <span className="word-sep"> — </span>
                      <span className="word-uz-inline">{w.uz}</span>
                      {(w.synonyms?.length > 0 || w.antonyms?.length > 0) && (
                        <span className="word-tags-inline">
                          {' '}({[...(w.synonyms||[]), ...(w.antonyms||[])].join(', ')})
                        </span>
                      )}
                    </div>
                    {w.definition && <div className="word-def">{w.definition}</div>}
                  </div>
                  <div className="word-actions">
                    <button className="btn btn-sm btn-icon" style={{background:'rgba(67,97,238,0.1)',color:'var(--primary)'}}
                      onClick={() => speak(w.en)} title="Pronounce"><i className="bx bx-volume-full"></i></button>
                    <button className="btn btn-sm btn-icon" title="Mark difficult"
                      style={{background:w.difficult?'var(--warning)':'rgba(0,0,0,0.05)',color:w.difficult?'white':'var(--gray)'}}
                      onClick={() => toggleDiff(w.id)}><i className="bx bx-star"></i></button>
                    <button className="btn btn-sm btn-icon btn-success" title="Edit"
                      onClick={() => { setEditWord(w); setEditForm({...w,synonyms:w.synonyms?.join(', ')||'',antonyms:w.antonyms?.join(', ')||''}); }}>
                      <i className="bx bx-edit"></i>
                    </button>
                    <button className="btn btn-sm btn-icon btn-danger" title="Delete" onClick={() => setDeleteW(w)}>
                      <i className="bx bx-trash"></i>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="stats-bar">
              <span>Total: <span>{words.length}</span></span>
              <span>Difficult: <span>{difficultWords.length}</span></span>
            </div>
          </>
        )}

        {tab==='add' && (
          <form onSubmit={addWordFn}>
            {[['en','Word (e.g. hello)'],['uz','Translation (e.g. Salom)'],['definition','Definition (optional)'],['synonyms','Synonyms (comma separated)'],['antonyms','Antonyms (comma separated)']].map(([f,ph]) => (
              <div className="form-group" key={f}>
                <input className="form-input" placeholder={ph}
                  value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})}
                  {...(f==='en'||f==='uz'?{required:true}:{})} />
              </div>
            ))}
            {err && <div className="error-msg">{err}</div>}
            <button type="submit" className="btn btn-primary btn-full mt-16">
              <i className="bx bx-plus"></i> Add Word
            </button>
          </form>
        )}
      </div>

      {editWord && (
        <Modal title="✏️ Edit Word" onClose={() => setEditWord(null)}>
          {[['en','Word'],['uz','Translation'],['definition','Definition'],['synonyms','Synonyms'],['antonyms','Antonyms']].map(([f,l]) => (
            <div className="form-group" key={f}>
              <label>{l}</label>
              <input className="form-input" value={editForm[f]||''} onChange={e=>setEditForm({...editForm,[f]:e.target.value})} />
            </div>
          ))}
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setEditWord(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveEdit}>Save</button>
          </div>
        </Modal>
      )}

      {deleteW && (
        <Modal title="🗑️ Delete Word" onClose={() => setDeleteW(null)}>
          <p style={{color:'var(--gray)'}}>Delete "<b>{deleteW.en}</b>"?</p>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={() => setDeleteW(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={delWord}><i className="bx bx-trash"></i> Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
