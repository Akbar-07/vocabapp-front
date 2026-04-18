import { useState, useEffect, useRef } from 'react';
import { toggleDifficult } from '../api/vocab';

export default function PracticeMode({ words, onClose, roomId, onUpdate }) {
  const [shuffled] = useState(() => [...words].sort(() => Math.random()-0.5));
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [reversed, setReversed] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef();
  const showDef = localStorage.getItem('showDefinition') === 'true';

  useEffect(() => { inputRef.current?.focus(); }, [idx]);

  if (!shuffled.length) return (
    <div style={{textAlign:'center',padding:'60px'}}>
      <p>No words to practice!</p>
      <button className="btn btn-primary mt-16" onClick={onClose}>Go Back</button>
    </div>
  );

  const w = shuffled[idx];
  const question = reversed ? w.uz : w.en;
  const expected = (reversed ? w.en : w.uz).toLowerCase();

  const check = () => {
    if (feedback) { next(); return; }
    const ok = answer.trim().toLowerCase() === expected;
    setFeedback(ok ? 'right' : 'wrong');
    if (ok) setCorrect(c=>c+1); else setWrong(c=>c+1);
  };

  const next = () => {
    setAnswer(''); setFeedback(null);
    if (idx+1 >= shuffled.length) setDone(true);
    else setIdx(i=>i+1);
  };

  const speak = () => { const u = new SpeechSynthesisUtterance(w.en); u.lang='en-US'; speechSynthesis.speak(u); };

  if (done) return (
    <div className="app-layout" style={{textAlign:'center',paddingTop:'60px'}}>
      <div className="card" style={{maxWidth:'400px',margin:'0 auto'}}>
        <div style={{fontSize:'60px',marginBottom:'16px'}}>🎉</div>
        <h2 style={{color:'var(--primary-dark)',marginBottom:'20px'}}>Well done!</h2>
        <div className="stats-bar" style={{justifyContent:'center'}}>
          <span>Correct: <span style={{color:'#2b9348'}}>{correct}</span></span>
          <span>Wrong: <span style={{color:'var(--danger)'}}>{wrong}</span></span>
          <span>Total: <span>{shuffled.length}</span></span>
        </div>
        <button className="btn btn-primary btn-full mt-16" onClick={onClose}>Back to Room</button>
      </div>
    </div>
  );

  return (
    <div className="app-layout">
      <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px'}}>
        <button className="btn btn-secondary btn-icon" onClick={onClose}><i className="bx bx-arrow-back"></i></button>
        <span style={{fontWeight:600,color:'var(--gray)'}}>{idx+1}/{shuffled.length}</span>
        <span style={{color:'#2b9348',fontSize:'14px',fontWeight:600}}>✓ {correct}</span>
        <span style={{color:'var(--danger)',fontSize:'14px',fontWeight:600}}>✗ {wrong}</span>
      </div>
      <div className="card" style={{maxWidth:'520px',margin:'0 auto'}}>
        <div className="practice-word-box">
          <button style={{position:'absolute',right:'12px',top:'12px',background:'none',border:'none',cursor:'pointer',color:'var(--gray)'}} onClick={speak}>
            <i className="bx bx-volume-full" style={{fontSize:'22px'}}></i>
          </button>
          <div style={{fontSize:'26px',fontWeight:700}}>{question}</div>
          {!reversed && showDef && w.definition && <div style={{fontSize:'13px',color:'#888',fontStyle:'italic'}}>{w.definition}</div>}
        </div>
        <input ref={inputRef} className="form-input" placeholder="Type the translation..."
          value={answer} onChange={e=>setAnswer(e.target.value)}
          onKeyDown={e=>e.key==='Enter'&&check()} />
        {feedback && (
          <div className={`feedback-box ${feedback==='right'?'feedback-right':'feedback-wrong'}`}>
            {feedback==='right' ? '✅ Correct!' : `❌ Wrong! Correct answer: ${reversed?w.en:w.uz}`}
          </div>
        )}
        <div className="practice-controls mt-16">
          <button className="btn btn-primary" onClick={check}>
            {feedback ? <><i className="bx bx-right-arrow-alt"></i> Next</> : <><i className="bx bx-check"></i> Check</>}
          </button>
          <button className="btn btn-warning" onClick={async()=>{await toggleDifficult(roomId,w.id);onUpdate();}}>
            <i className="bx bx-star"></i> Difficult
          </button>
          <button className="btn btn-secondary" onClick={() => setReversed(!reversed)}>
            <i className="bx bx-transfer"></i> Switch
          </button>
          <button className="btn btn-secondary" onClick={next}>Skip</button>
        </div>
      </div>
    </div>
  );
}
