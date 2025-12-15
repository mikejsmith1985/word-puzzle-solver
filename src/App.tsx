import { useState, useEffect } from 'react';
import { loadWords, filterWords, type SearchParams, type ConstraintSet } from './utils/wordFilter';
import { useIsMobile } from './useIsMobile';
import './App.css';

function App() {
  const [words, setWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [letters, setLetters] = useState('');
  const [minLength, setMinLength] = useState('3');
  const [maxLength, setMaxLength] = useState('6');
  const [wordLength, setWordLength] = useState('4');
  const [syncLengths, setSyncLengths] = useState(false);
  const [autoClear, setAutoClear] = useState(() => {
    const saved = localStorage.getItem('autoClear');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const isMobile = useIsMobile();
  const [constraints, setConstraints] = useState<ConstraintSet[]>([
    { position: 1, character: '' },
    { position: 2, character: '' },
    { position: 3, character: '' },
    { position: 4, character: '' },
    { position: 5, character: '' },
    { position: 6, character: '' },
  ]);
  const [results, setResults] = useState<string[]>([]);

  useEffect(() => {
    loadWords().then(w => {
      setWords(w);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('autoClear', JSON.stringify(autoClear));
  }, [autoClear]);

  const handleSearch = () => {
    if (isMobile) {
      const length = parseInt(wordLength) || 4;
      const params: SearchParams = {
        availableLetters: letters,
        minLength: length,
        maxLength: length,
        constraints: constraints.filter(c => c.character.trim()),
      };
      const filtered = filterWords(words, params);
      setResults(filtered.sort((a, b) => a.length - b.length || a.localeCompare(b)));
      if (autoClear) {
        handleClearConstraints();
      }
    } else {
      const params: SearchParams = {
        availableLetters: letters,
        minLength: parseInt(minLength) || 1,
        maxLength: parseInt(maxLength) || 6,
        constraints: constraints.filter(c => c.character.trim()),
      };
      const filtered = filterWords(words, params);
      setResults(filtered.sort((a, b) => a.length - b.length || a.localeCompare(b)));
      if (autoClear) {
        handleClearConstraints();
      }
    }
  };

  const handleConstraintChange = (position: number, character: string) => {
    setConstraints(prev =>
      prev.map(c =>
        c.position === position ? { ...c, character: character.slice(-1).toLowerCase() } : c
      )
    );
  };

  const handleClearConstraints = () => {
    setConstraints(prev => prev.map(c => ({ ...c, character: '' })));
  };

  const setMinLengthButton = (value: number) => {
    setMinLength(String(value));
    if (syncLengths) {
      setMaxLength(String(value));
    }
  };

  const setMaxLengthButton = (value: number) => {
    setMaxLength(String(value));
    if (syncLengths) {
      setMinLength(String(value));
    }
  };

  const handleWordLengthChange = (value: number) => {
    setWordLength(String(value));
    setTimeout(() => handleSearch(), 0);
  };

  const handleClearAll = () => {
    setLetters('');
    setMinLength('3');
    setMaxLength('6');
    setWordLength('4');
    handleClearConstraints();
    setResults([]);
  };

  const handleCopyResults = () => {
    navigator.clipboard.writeText(results.join(', '));
  };

  if (loading) {
    return <div className="container loading">Loading word database (370K+ words)...</div>;
  }

  return (
    <div className="container">
      <header className="header">
        <h1>🔤 Word Puzzle Solver</h1>
        <p>Find words using available letters with position constraints</p>
      </header>

      <div className="search-panel">
        <div className="input-section">
          <label htmlFor="letters">Available Letters (up to 6):</label>
          <input
            id="letters"
            type="text"
            value={letters}
            onChange={e => setLetters(e.target.value.toUpperCase())}
            placeholder="e.g., ABCDEF"
            maxLength={6}
            onKeyPress={e => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <div className="length-section">
          <div className="length-header">
            <h3>Word Length</h3>
            {!isMobile && (
              <div className="length-toggles">
                <label className="sync-toggle">
                  <input
                    type="checkbox"
                    checked={syncLengths}
                    onChange={e => setSyncLengths(e.target.checked)}
                  />
                  <span>Sync Min/Max</span>
                </label>
                <label className="sync-toggle">
                  <input
                    type="checkbox"
                    checked={autoClear}
                    onChange={e => setAutoClear(e.target.checked)}
                  />
                  <span>Auto Clear</span>
                </label>
              </div>
            )}
            {isMobile && (
              <label className="sync-toggle">
                <input
                  type="checkbox"
                  checked={autoClear}
                  onChange={e => setAutoClear(e.target.checked)}
                />
                <span>Auto Clear</span>
              </label>
            )}
          </div>
          {!isMobile && (
            <div className="length-desktop">
              <div className="length-group">
                <label>Min Length:</label>
                <div className="button-group-horizontal">
                  {[3, 4, 5, 6].map(num => (
                    <button
                      key={`min-${num}`}
                      className={`btn btn-length ${minLength === String(num) ? 'active' : ''}`}
                      onClick={() => setMinLengthButton(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              <div className="length-group">
                <label>Max Length:</label>
                <div className="button-group-horizontal">
                  {[3, 4, 5, 6].map(num => (
                    <button
                      key={`max-${num}`}
                      className={`btn btn-length ${maxLength === String(num) ? 'active' : ''}`}
                      onClick={() => setMaxLengthButton(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {isMobile && (
            <div className="length-mobile">
              <div className="length-group">
                <label>Word Length:</label>
                <div className="button-group-horizontal">
                  {[3, 4, 5, 6].map(num => (
                    <button
                      key={`length-${num}`}
                      className={`btn btn-length ${wordLength === String(num) ? 'active' : ''}`}
                      onClick={() => handleWordLengthChange(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="constraints-section">
          <h3>Position Constraints (Optional)</h3>
          <div className="constraints-grid">
            {constraints.map(constraint => (
              <div key={constraint.position} className="constraint-box">
                <label>Pos {constraint.position}:</label>
                <input
                  type="text"
                  value={constraint.character}
                  onChange={e => handleConstraintChange(constraint.position, e.target.value)}
                  placeholder="_"
                  maxLength={1}
                  onKeyPress={e => e.key === 'Enter' && handleSearch()}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="button-group">
          <button className="btn btn-primary" onClick={handleSearch}>
            Search
          </button>
          <button className="btn btn-secondary" onClick={handleClearConstraints}>
            Clear Constraints
          </button>
          <button className="btn btn-secondary" onClick={handleClearAll}>
            Clear All
          </button>
        </div>
      </div>

      <div className="results-section">
        <div className="results-header">
          <h2>Results ({results.length})</h2>
          {results.length > 0 && (
            <button className="btn btn-small" onClick={handleCopyResults}>
              📋 Copy All
            </button>
          )}
        </div>

        {results.length === 0 && (
          <p className="no-results">
            {letters || Object.values(constraints).some(c => c.character)
              ? 'No matches found. Try different letters or constraints.'
              : 'Enter letters and click Search to find words.'}
          </p>
        )}

        {results.length > 0 && (
          <div className="results-grid">
            {results.map(word => (
              <div key={word} className="result-item">
                <span className="word">{word.toUpperCase()}</span>
                <span className="length">({word.length})</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
