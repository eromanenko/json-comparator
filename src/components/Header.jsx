import React from 'react';

export default function Header({ showCompareBtn, onCompareClick, showDiffActions, onExpandAll, onCollapseAll, onEdit, mode }) {
  return (
    <header className="header" style={styles.header}>
      <div style={styles.titleContainer}>
        <h1 style={styles.title}>JSON Comparator Pro</h1>
        <span style={styles.versionBadge}>v0.4.1</span>
      </div>
      <p style={styles.subtitle}>Premium visual JSON differentiation</p>
      <div style={styles.rightActions}>
        {showDiffActions && (
          <div style={styles.diffActions}>
            <button style={styles.actionBtn} onClick={onExpandAll}>Expand All</button>
            <button style={styles.actionBtn} onClick={onCollapseAll}>Collapse All</button>
            <button style={styles.editBtn} onClick={onEdit}>
              {mode === 'single' ? 'Edit JSON' : 'Perform a new diff'}
            </button>
          </div>
        )}
        
        {showCompareBtn && (
          <button style={styles.compareBtn} onClick={onCompareClick}>
            Compare
          </button>
        )}
      </div>
    </header>
  );
}

const styles = {
  header: {
    padding: '1.5rem 2rem',
    background: 'var(--bg-panel)',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.75rem'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    background: 'linear-gradient(to right, var(--accent), var(--accent-hover))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  versionBadge: {
    fontSize: '0.75rem',
    fontWeight: '700',
    background: 'rgba(59, 130, 246, 0.1)',
    color: 'var(--accent)',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    letterSpacing: '0.025em',
    textTransform: 'uppercase'
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)'
  },
  rightActions: {
    marginLeft: 'auto',
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },
  compareBtn: {
    background: 'var(--accent)',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1.5rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.4)',
  },
  diffActions: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center'
  },
  actionBtn: {
    background: 'transparent',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    transition: 'all 0.2s'
  },
  editBtn: {
    background: 'transparent',
    border: '1px solid var(--accent)',
    color: 'var(--accent)',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s',
    marginLeft: '0.5rem'
  }
};
