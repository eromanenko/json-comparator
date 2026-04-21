import React, { useRef, useState, useEffect } from 'react';

export default function InputView({ step, title = '', value, onChange, onAction, actionText, externalError }) {
  const fileRef = useRef(null);
  const [localError, setLocalError] = useState(null);

  const error = externalError || localError;

  // Clear local error when value changes manually via typing
  useEffect(() => {
    if (localError) setLocalError(null);
  }, [value]);

  const validateAndProceed = (text) => {
    try {
      JSON.parse(text || '{}');
      onChange(text);
      setLocalError(null);
      onAction(text);
    } catch (e) {
      onChange(text);
      setLocalError('Invalid JSON formatting. Please check the text.');
      // Optional: show a real popup or toast here
      alert('Invalid JSON formatting! Please fix the errors before continuing.');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      validateAndProceed(text);
    };
    reader.readAsText(file);
    e.target.value = null; // reset
  };

  const handlePaste = (e) => {
    // Get pasted data
    const pastedText = (e.clipboardData || window.clipboardData).getData('text');
    if (!pastedText) return;
    
    // Check if it's valid JSON
    try {
      JSON.parse(pastedText);
      // Valid JSON! Auto-proceed.
      e.preventDefault(); // Prevent normal paste
      validateAndProceed(pastedText);
    } catch (err) {
      // Not valid JSON. Let it paste normally, but maybe set error
      setLocalError('Pasted text is not valid JSON.');
    }
  };

  return (
    <div className="input-view animate-fade-in" style={styles.container}>
      <div style={styles.centerWrapper}>
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <h3>{title}</h3>
            <button 
              style={styles.fileBtn} 
              onClick={() => fileRef.current.click()}
            >
              Choose File
            </button>
            <input 
              type="file" 
              accept=".json" 
              ref={fileRef} 
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>
          <textarea
            className="json-editor"
            style={{...styles.textarea, borderColor: error ? '#ef4444' : 'var(--border-color)'}}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handlePaste}
            placeholder={`Paste ${title.toLowerCase()} here...`}
          />
          {error && <div style={styles.error}>{error}</div>}
        </div>

        <div style={styles.actionCenter}>
          <button style={styles.actionBtn} onClick={() => validateAndProceed(value)}>
            {actionText}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    height: 'calc(100vh - 80px)', // assuming header is ~80px
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  centerWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    width: '100%',
    maxWidth: '800px',
    height: '80%'
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
    justifyContent: 'center',
  },
  actionBtn: {
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    padding: '0.75rem 3rem',
    fontSize: '1.1rem',
    fontWeight: '600',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.4)',
  },
  error: {
    color: '#ef4444',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    background: 'rgba(239, 68, 68, 0.1)'
  }
};
