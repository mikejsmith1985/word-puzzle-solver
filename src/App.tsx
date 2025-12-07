import { useState, useEffect } from 'react';
import { loadWords, filterWords, type SearchParams, type ConstraintSet } from './utils/wordFilter';
import './App.css';

function App() {
  const [words, setWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [letters, setLetters] = useState('');
  const [minLength, setMinLength] = useState('3');
  const [maxLength, setMaxLength] = useState('6');
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

  const handleSearch = () => {
    const params: SearchParams = {
      availableLetters: letters,
      minLength: parseInt(minLength) || 1,
      maxLength: parseInt(maxLength) || 6,
      constraints: constraints.filter(c => c.character.trim()),
    };
    const filtered = filterWords(words, params);
    setResults(filtered.sort((a, b) => a.length - b.length || a.localeCompare(b)));
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

  const handleClearAll = () => {
    setLetters('');
    setMinLength('3');
    setMaxLength('6');
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
          <div className="length-input">
            <label htmlFor="minLen">Min Length:</label>
            <input
              id="minLen"
              type="number"
              value={minLength}
              onChange={e => setMinLength(e.target.value)}
              min="1"
              max="6"
            />
          </div>
          <div className="length-input">
            <label htmlFor="maxLen">Max Length:</label>
            <input
              id="maxLen"
              type="number"
              value={maxLength}
              onChange={e => setMaxLength(e.target.value)}
              min="1"
              max="6"
            />
          </div>
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
