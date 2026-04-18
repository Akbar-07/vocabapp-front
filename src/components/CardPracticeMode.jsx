import { useState } from 'react';
import { toggleDifficult } from '../api/vocab';

function shuffle(arr) { return [...arr].sort(() => Math.random()-0.5); }

function makeChoices(allWords, i) {
  if (!allWords.length) return [];
  const w = allWords[i];
  const others = shuffle(allWords.filter((_,j)=>j!==i)).slice(0,3);
  return shuffle([w,...others]);
}

export default function CardPracticeMode({ words, onClose, roomId, onUpdate }) {
  const [shuffled] = useState(() => shuffle(words));
  const [idx, setIdx] = useState(0);
  const [choices, setChoices] = useState(() => makeChoices(shuffle(words), 0));
  const [selected, setSelected] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [reversed, setReversed] = useState(false);
  const [done, setDone] = useState(false);
  const showDef = localStorage.getItem('showDefinition') === 'true';

  if (!shuffled.length) return (
    <div style={{textAlign:'center',padding:'60px'}}>
      <p>No words to practice!</p>
      <button className="btn btn-primary mt-16" onClick={onClose}>Go Back</button>
    </div>
  );

  const w = shuffled[idx];
  const isCorrect = ch => (reversed ? ch.en : ch.uz) === (reversed ? w.en : w.uz);

  const pick = ch => {
    if (selected) return;
    setSelected(ch);
    if (isCorrect(ch)) setCorrect(c=>c+1); else setWrong(c=>c+1);
  };

  const next = () => {
    if (idx+1 >= shuffled.length) { setDone(true); return; }
    const ni = idx+1;
    setIdx(ni); setChoices(makeChoices(shuffled, ni)); setSelected(null);
  };

  if (done) return (
    <div className="app-layout" style={{textAlign:'center',paddingTop:'60px'}}>
      <div className="card" style={{maxWidth:'400px',margin:'0 auto'}}>
        <div style={{fontSize:'60px',marginBottom:'16px'}}>🎉</div>
        <h2 style={{color:'var(--primary-dark)',marginBottom:'20px'}}>Well done!</h2>
        <div className="stats-bar" style={{justifyContent:'center'}}>
          <span>Correct: <span style={{color:'#2b9348'}}>{correct}</span></span>
          <span>Wrong: <span style={{color:'var(--danger)'}}>{wrong}</span></span>
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
        <span style={{color:'#2b9348',fontWeight:600}}>✓ {correct}</span>
        <span style={{color:'var(--danger)',fontWeight:600}}>✗ {wrong}</span>
      </div>
      <div className="card" style={{maxWidth:'520px',margin:'0 auto'}}>
        <div className="practice-word-box">
          <div style={{fontSize:'26px',fontWeight:700}}>{reversed?w.uz:w.en}</div>
          {!reversed && showDef && w.definition && <div style={{fontSize:'13px',color:'#888',fontStyle:'italic'}}>{w.definition}</div>}
        </div>
        <div className="choices-grid">
          {choices.map((ch,i) => {
            let cls = 'choice-btn';
            if (selected) { if (isCorrect(ch)) cls += ' correct'; else if (selected.id===ch.id) cls += ' wrong'; }
            return (
              <button key={i} className={cls} onClick={() => pick(ch)}>
                {reversed?ch.en:ch.uz}
              </button>
            );
          })}
        </div>
        {selected && (
          <div style={{display:'flex',gap:'8px',marginTop:'12px'}}>
            <button className="btn btn-primary" style={{flex:1}} onClick={next}>
              Next <i className="bx bx-right-arrow-alt"></i>
            </button>
            <button className="btn btn-warning" title="Mark difficult"
              onClick={async()=>{await toggleDifficult(roomId,w.id);onUpdate();}}>
              <i className="bx bx-star"></i>
            </button>
            <button className="btn btn-secondary" title="Switch language" onClick={()=>setReversed(!reversed)}>
              <i className="bx bx-transfer"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
