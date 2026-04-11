import React from 'react';

export default function Header() {
  return (
    <header className="header" style={styles.header}>
      <h1 style={styles.title}>JSON Comparator Pro</h1>
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
  title: {
    fontSize: '1.5rem',
    fontWeight: '600',
    background: 'linear-gradient(to right, var(--accent), var(--accent-hover))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)'
  }
};
