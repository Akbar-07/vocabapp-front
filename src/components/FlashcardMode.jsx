import { useState } from 'react';

export default function FlashcardMode({ words, onClose }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reversed, setReversed] = useState(false);
  const showDef = localStorage.getItem('showDefinition') === 'true';

  if (!words.length) return (
    <div className="flashcard-overlay" style={{display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <p style={{fontSize:'20px',marginBottom:'20px'}}>No words in this room!</p>
        <button className="btn btn-primary" onClick={onClose}>Go Back</button>
      </div>
    </div>
  );

  const w = words[index];
  const front = reversed ? w.uz : w.en;
  const back  = reversed ? w.en : w.uz;
  const speak = () => { const u = new SpeechSynthesisUtterance(w.en); u.lang='en-US'; speechSynthesis.speak(u); };

  return (
    <div className="flashcard-overlay">
      <div style={{maxWidth:'700px',margin:'0 auto'}}>
        <div className="flashcard-header">
          <div className="flashcard-progress">{index+1} / {words.length}</div>
          <div style={{display:'flex',gap:'10px'}}>
            <button className="btn btn-secondary btn-icon" onClick={speak} title="Pronounce">
              <i className="bx bx-volume-full"></i>
            </button>
            <button className="btn btn-secondary btn-icon" onClick={onClose} style={{fontSize:'20px'}}>✕</button>
          </div>
        </div>

        <div className="flashcard-wrap">
          <div className={`flashcard ${flipped?'flipped':''}`} onClick={() => setFlipped(!flipped)}>
            <div className="flashcard-inner">
              <div className="fc-face front">
                <div className="fc-word">{front}</div>
                {!reversed && showDef && (
                  <>
                    {w.definition && <div className="fc-def">{w.definition}</div>}
                    {w.synonyms?.length > 0 && <div className="fc-syn">≈ {w.synonyms.join(', ')}</div>}
                    {w.antonyms?.length > 0 && <div className="fc-ant">↔ {w.antonyms.join(', ')}</div>}
                  </>
                )}
                <div className="fc-hint">Click to flip</div>
              </div>
              <div className="fc-face back">
                <div className="fc-word">{back}</div>
                <div className="fc-hint">Click to flip</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flashcard-controls">
          <button className="flashcard-btn fb-prev" onClick={() => { setFlipped(false); setIndex(i=>Math.max(0,i-1)); }}>
            <i className="bx bx-left-arrow-alt"></i> Previous
          </button>
          <button className="flashcard-btn fb-next" onClick={() => { setFlipped(false); setIndex(i=>Math.min(words.length-1,i+1)); }}>
            Next <i className="bx bx-right-arrow-alt"></i>
          </button>
          <button className="flashcard-btn fb-switch" onClick={() => { setReversed(!reversed); setFlipped(false); }}>
            <i className="bx bx-transfer"></i> Switch
          </button>
        </div>
      </div>
    </div>
  );
}
