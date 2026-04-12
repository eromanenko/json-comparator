import React from 'react';

export default function Header() {
  return (
    <header className="header" style={styles.header}>
      <div style={styles.titleContainer}>
        <h1 style={styles.title}>JSON Comparator Pro</h1>
        <span style={styles.versionBadge}>v0.4.1</span>
      </div>
      <p style={styles.subtitle}>Premium visual JSON differentiation</p>
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
  }
};
