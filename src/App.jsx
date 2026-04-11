import { useState } from 'react';
import Header from './components/Header';
import InputView from './components/InputView';
import DiffView from './components/DiffView';
import { computeDiff, countDiffs } from './utils/diff';

function App() {
  const [json1, setJson1] = useState('');
  const [json2, setJson2] = useState('');
  const [diffResult, setDiffResult] = useState(null);
  const [diffStats, setDiffStats] = useState(null);
  
  // View states
  const [isComparing, setIsComparing] = useState(false);
  const [error1, setError1] = useState(null);
  const [error2, setError2] = useState(null);

  const handleCompare = () => {
    let parsed1, parsed2;
    setError1(null);
    setError2(null);

    try {
      parsed1 = JSON.parse(json1 || '{}');
    } catch (e) {
      setError1('Invalid JSON formatting');
      return;
    }

    try {
      parsed2 = JSON.parse(json2 || '{}');
    } catch (e) {
      setError2('Invalid JSON formatting');
      return;
    }

    const diff = computeDiff(parsed1, parsed2);
    setDiffResult(diff);
    setDiffStats(countDiffs(diff));
    setIsComparing(true);
  };

  const handleReset = () => {
    setIsComparing(false);
    setDiffResult(null);
    setDiffStats(null);
  };

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        {!isComparing ? (
          <InputView 
            json1={json1} 
            setJson1={setJson1} error1={error1}
            json2={json2} 
            setJson2={setJson2} error2={error2}
            onCompare={handleCompare}
          />
        ) : (
          <DiffView 
            diffResult={diffResult} 
            stats={diffStats} 
            onReset={handleReset} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
