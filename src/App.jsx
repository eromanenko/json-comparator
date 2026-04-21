import { useState, useRef } from 'react';
import Header from './components/Header';
import InputView from './components/InputView';
import DiffView from './components/DiffView';
import { computeDiff, countDiffs } from './utils/diff';

function App() {
  const [step, setStep] = useState('INPUT_1'); // INPUT_1, VIEW_1, INPUT_2, VIEW_DIFF
  const [json1, setJson1] = useState('');
  const [json2, setJson2] = useState('');
  
  const [parsed1, setParsed1] = useState(null);
  
  const [diffResult, setDiffResult] = useState(null);
  const [diffStats, setDiffStats] = useState(null);

  const diffViewRef = useRef(null);

  const handleFormat1 = (text) => {
    const currentJson = typeof text === 'string' ? text : json1;
    try {
      const parsed = JSON.parse(currentJson || '{}');
      setParsed1(parsed);
      const diff = computeDiff(parsed, JSON.parse(JSON.stringify(parsed))); // Dummy diff with deep clone to force tree traversal
      setDiffResult(diff);
      setStep('VIEW_1');
    } catch (e) {
      // InputView handles the error display internally
    }
  };

  const handleCompareClick = () => {
    setStep('INPUT_2');
  };

  const handleFormat2 = (text) => {
    const currentJson = typeof text === 'string' ? text : json2;
    try {
      const parsed2 = JSON.parse(currentJson || '{}');
      const diff = computeDiff(parsed1, parsed2);
      setDiffResult(diff);
      setDiffStats(countDiffs(diff));
      setStep('VIEW_DIFF');
    } catch (e) {
      // InputView handles the error display internally
    }
  };

  const handleEdit = () => {
    if (step === 'VIEW_1') {
      setStep('INPUT_1');
    } else {
      setStep('INPUT_1');
    }
  };

  return (
    <div className="app-container">
      <Header 
        showCompareBtn={step === 'VIEW_1'} 
        onCompareClick={handleCompareClick} 
        showDiffActions={step === 'VIEW_1' || step === 'VIEW_DIFF'}
        onExpandAll={() => diffViewRef.current?.expandAll()}
        onCollapseAll={() => diffViewRef.current?.collapseAll()}
        onEdit={handleEdit}
        mode={step === 'VIEW_1' ? 'single' : 'diff'}
      />
      <main className="main-content">
        {step === 'INPUT_1' && (
          <InputView 
            step={step}
            title="Original JSON"
            value={json1} 
            onChange={setJson1} 
            onAction={handleFormat1}
            actionText="Format & View"
          />
        )}

        {step === 'VIEW_1' && (
          <DiffView 
            ref={diffViewRef}
            mode="single"
            diffResult={diffResult} 
            stats={{}} 
            onReset={handleEdit} 
          />
        )}

        {step === 'INPUT_2' && (
          <InputView 
            step={step}
            title="Modified JSON"
            value={json2} 
            onChange={setJson2} 
            onAction={handleFormat2}
            actionText="Compare"
          />
        )}

        {step === 'VIEW_DIFF' && (
          <DiffView 
            ref={diffViewRef}
            mode="diff"
            diffResult={diffResult} 
            stats={diffStats} 
            onReset={handleEdit} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
