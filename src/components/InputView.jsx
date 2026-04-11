import React, { useRef } from 'react';

export default function InputView({ json1, setJson1, error1, json2, setJson2, error2, onCompare }) {
  const file1Ref = useRef(null);
  const file2Ref = useRef(null);

  const handleFileUpload = (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setter(e.target.result);
    reader.readAsText(file);
    e.target.value = null; // reset
  };

  return (
    <div className="input-view animate-fade-in" style={styles.container}>
      <div style={styles.panelsContainer}>
        
        {/* Left Panel */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <h3>Original JSON</h3>
            <button 
              style={styles.fileBtn} 
              onClick={() => file1Ref.current.click()}
            >
              Choose File
            </button>
            <input 
              type="file" 
              accept=".json" 
              ref={file1Ref} 
              onChange={(e) => handleFileUpload(e, setJson1)}
              style={{ display: 'none' }}
            />
          </div>
          <textarea
            className="json-editor"
            style={{...styles.textarea, borderColor: error1 ? '#ef4444' : 'var(--border-color)'}}
            value={json1}
            onChange={(e) => setJson1(e.target.value)}
            placeholder="Paste original JSON here..."
          />
          {error1 && <div style={styles.error}>{error1}</div>}
        </div>

        {/* Action Center */}
        <div style={styles.actionCenter}>
          <button style={styles.compareBtn} onClick={onCompare}>
            Compare
          </button>
          <div style={styles.sampleText}>or paste text directly</div>
        </div>

        {/* Right Panel */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <h3>Modified JSON</h3>
            <button 
              style={styles.fileBtn} 
              onClick={() => file2Ref.current.click()}
            >
              Choose File
            </button>
            <input 
              type="file" 
              accept=".json" 
              ref={file2Ref} 
              onChange={(e) => handleFileUpload(e, setJson2)}
              style={{ display: 'none' }}
            />
          </div>
          <textarea
            className="json-editor"
            style={{...styles.textarea, borderColor: error2 ? '#ef4444' : 'var(--border-color)'}}
            value={json2}
            onChange={(e) => setJson2(e.target.value)}
            placeholder="Paste modified JSON here..."
          />
          {error2 && <div style={styles.error}>{error2}</div>}
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    height: 'calc(100vh - 80px)', // assuming header is ~80px
  },
  panelsContainer: {
    display: 'flex',
    gap: '2rem',
    height: '100%',
    alignItems: 'stretch'
  },
  panel: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-panel)',
    borderRadius: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    border: '1px solid var(--border-color)'
  },
  panelHeader: {
    padding: '1rem',
    background: 'rgba(255,255,255,0.02)',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  fileBtn: {
    background: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'all 0.2s',
  },
  textarea: {
    flex: '1',
    background: 'transparent',
    border: 'none',
    padding: '1rem',
    color: 'var(--text-main)',
    resize: 'none',
    outline: 'none',
    fontSize: '0.875rem',
    lineHeight: '1.5'
  },
  actionCenter: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem'
  },
  compareBtn: {
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    fontWeight: '600',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.4)',
  },
  sampleText: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    textAlign: 'center'
  },
  error: {
    color: '#ef4444',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    background: 'rgba(239, 68, 68, 0.1)'
  }
};
