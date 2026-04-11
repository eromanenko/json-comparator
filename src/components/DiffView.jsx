import React, { useState, useRef } from 'react';
import { DIFF_TYPES } from '../utils/diff';

export default function DiffView({ diffResult, stats, onReset }) {
  const [showMissing, setShowMissing] = useState(true);
  const [showDifferentTypes, setShowDifferentTypes] = useState(true);
  const [showDifferentValues, setShowDifferentValues] = useState(true);
  const [showMargins, setShowMargins] = useState(false);

  const leftPaneRef = useRef(null);
  const rightPaneRef = useRef(null);
  const isScrollingRef = useRef(false);

  // Sync scrolling between panels
  const handleScrollLeft = (e) => {
    if (isScrollingRef.current) return;
    isScrollingRef.current = true;
    if (rightPaneRef.current) {
      rightPaneRef.current.scrollTop = e.target.scrollTop;
    }
    window.requestAnimationFrame(() => { isScrollingRef.current = false; });
  };

  const handleScrollRight = (e) => {
    if (isScrollingRef.current) return;
    isScrollingRef.current = true;
    if (leftPaneRef.current) {
      leftPaneRef.current.scrollTop = e.target.scrollTop;
    }
    window.requestAnimationFrame(() => { isScrollingRef.current = false; });
  };

  // Checks if a node should be visible based on filters
  const isVisible = (type) => {
    if (type === DIFF_TYPES.UNCHANGED) return true;
    if ((type === DIFF_TYPES.ADDED || type === DIFF_TYPES.REMOVED) && showMissing) return true;
    if (type === DIFF_TYPES.CHANGED_TYPE && showDifferentTypes) return true;
    if (type === DIFF_TYPES.CHANGED_VALUE && showDifferentValues) return true;
    return false;
  };

  const renderVal = (val, type) => {
    if (val === undefined) return '';
    if (type === 'string') return `"${val}"`;
    if (type === 'null') return 'null';
    if (type === 'array' || type === 'object') {
      try {
        return JSON.stringify(val);
      } catch (e) {
        return type === 'array' ? '[...]' : '{...}';
      }
    }
    return String(val);
  };

  const getRowStyle = (type, side) => {
    // Left side shouldn't highlight ADDED, right side shouldn't highlight REMOVED
    if (type === DIFF_TYPES.REMOVED && side === 'left' && showMissing) {
      return { background: 'var(--diff-remove-bg)', borderLeft: '4px solid var(--diff-remove-border)' };
    }
    if (type === DIFF_TYPES.ADDED && side === 'right' && showMissing) {
      return { background: 'var(--diff-add-bg)', borderLeft: '4px solid var(--diff-add-border)' };
    }
    if ((type === DIFF_TYPES.CHANGED_TYPE && showDifferentTypes) || (type === DIFF_TYPES.CHANGED_VALUE && showDifferentValues)) {
      if (side === 'left' || side === 'right') {
        return { background: 'var(--diff-change-bg)', borderLeft: '4px solid var(--diff-change-border)' };
      }
    }
    
    // For hidden filters or normal lines, keep spacing consistent so elements align perfectly
    return { borderLeft: '4px solid transparent' };
  };

  // Helper to format key value pair
  const formatPair = (key, val, dataType, isLast) => (
    <>
      {key !== null && <span style={styles.jsonKey}>"{key}"</span>}
      {key !== null && <span style={styles.jsonColon}>: </span>}
      <span style={styles.jsonValue(dataType)}>{renderVal(val, dataType)}</span>
      {!isLast && <span style={styles.jsonComma}>,</span>}
    </>
  );

  const getMarginStyle = (indent) => {
    return showMargins ? { paddingLeft: `calc(1rem + ${indent * 24}px)` } : {};
  };

  const renderTreeRows = (node, indent = 0, key = null, isLast = true) => {
    const rows = [];
    const indentSpace = showMargins ? '' : '  '.repeat(indent);
    const isFilteredOut = !isVisible(node.type);

    if (node.dataType === 'object' || node.dataType === 'array') {
      const isArray = node.dataType === 'array';
      const openBracket = isArray ? '[' : '{';
      const closeBracket = isArray ? ']' : '}';
      
      rows.push({
        left: (
          <div key={`${node.path}-open-left`} style={{...styles.line, ...getRowStyle(DIFF_TYPES.UNCHANGED, 'left'), ...getMarginStyle(indent)}}>
            {indentSpace}{key !== null ? `"${key}": ` : ''}{openBracket}
          </div>
        ),
        right: (
          <div key={`${node.path}-open-right`} style={{...styles.line, ...getRowStyle(DIFF_TYPES.UNCHANGED, 'right'), ...getMarginStyle(indent)}}>
            {indentSpace}{key !== null ? `"${key}": ` : ''}{openBracket}
          </div>
        )
      });

      if (node.children) {
        const childKeys = Object.keys(node.children);
        childKeys.forEach((ckey, idx) => {
          const childLast = idx === childKeys.length - 1;
          rows.push(...renderTreeRows(node.children[ckey], indent + 1, ckey, childLast));
        });
      }

      rows.push({
        left: (
          <div key={`${node.path}-close-left`} style={{...styles.line, ...getRowStyle(DIFF_TYPES.UNCHANGED, 'left'), ...getMarginStyle(indent)}}>
             {indentSpace}{closeBracket}{!isLast && ','}
          </div>
        ),
        right: (
          <div key={`${node.path}-close-right`} style={{...styles.line, ...getRowStyle(DIFF_TYPES.UNCHANGED, 'right'), ...getMarginStyle(indent)}}>
             {indentSpace}{closeBracket}{!isLast && ','}
          </div>
        )
      });
      
    } else {
      // It's a leaf node
      const leftShow = node.type !== DIFF_TYPES.ADDED;
      const rightShow = node.type !== DIFF_TYPES.REMOVED;
      
      let typeLeft = node.type === DIFF_TYPES.CHANGED_TYPE ? node.dataType1 : node.dataType;
      let typeRight = node.type === DIFF_TYPES.CHANGED_TYPE ? node.dataType2 : node.dataType;

      rows.push({
        left: (
          <div key={`${node.path}-left`} style={{...styles.line, ...getRowStyle(node.type, 'left'), ...getMarginStyle(indent)}}>
            {indentSpace}
            {leftShow ? formatPair(key, node.val1, typeLeft, isLast && node.type !== DIFF_TYPES.REMOVED) : ''}
          </div>
        ),
        right: (
          <div key={`${node.path}-right`} style={{...styles.line, ...getRowStyle(node.type, 'right'), ...getMarginStyle(indent)}}>
             {indentSpace}
             {rightShow ? formatPair(key, node.val2, typeRight, isLast && node.type !== DIFF_TYPES.ADDED) : ''}
          </div>
        )
      });
    }

    return rows;
  };

  const treeRows = diffResult ? renderTreeRows(diffResult) : [];

  return (
    <div className="diff-view animate-fade-in" style={styles.container}>
      <div style={styles.toolbar}>
        <div style={styles.stats}>
          <span>Found {stats.total} differences</span>
        </div>
        <div style={styles.filters}>
          <span>Show:</span>
          <label style={{ ...styles.label, ...styles.missingLabel }}>
            <input 
              type="checkbox" 
              checked={showMissing} 
              onChange={() => setShowMissing(!showMissing)}
            /> 
            {stats.missingProperties} missing properties
          </label>
          <label style={{ ...styles.label, ...styles.changeLabel }}>
            <input 
              type="checkbox" 
              checked={showDifferentTypes} 
              onChange={() => setShowDifferentTypes(!showDifferentTypes)}
            /> 
            {stats.incorrectTypes} different types
          </label>
          <label style={{ ...styles.label, ...styles.changeLabel }}>
            <input 
              type="checkbox" 
              checked={showDifferentValues} 
              onChange={() => setShowDifferentValues(!showDifferentValues)}
            /> 
            {stats.changedValues} different values
          </label>
          <label style={{ ...styles.label, ...styles.marginLabel }}>
            <input 
              type="checkbox" 
              checked={showMargins} 
              onChange={() => setShowMargins(!showMargins)}
            /> 
            Nested margins
          </label>
        </div>
        <button style={styles.btn} onClick={onReset}>Perform a new diff</button>
      </div>

      <div style={styles.editorWrap}>
        <div 
          style={{...styles.pane, ...styles.leftPane}} 
          onScroll={handleScrollLeft} 
          ref={leftPaneRef}
        >
          {treeRows.map(r => r.left)}
        </div>
        <div 
          style={styles.pane} 
          onScroll={handleScrollRight} 
          ref={rightPaneRef}
        >
          {treeRows.map(r => r.right)}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    height: 'calc(100vh - 80px)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    padding: '1rem',
    background: 'var(--bg-panel)',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
  },
  stats: {
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '4px',
    fontWeight: '500'
  },
  filters: {
    display: 'flex',
    gap: '1.5rem',
    flex: '1'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.85rem'
  },
  missingLabel: {
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    background: 'linear-gradient(90deg, var(--diff-remove-bg) 0%, var(--diff-add-bg) 100%)',
    borderLeft: '4px solid var(--diff-remove-border)',
    borderRight: '4px solid var(--diff-add-border)'
  },
  changeLabel: {
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    background: 'var(--diff-change-bg)',
    borderLeft: '4px solid var(--diff-change-border)'
  },
  marginLabel: {
    padding: '0.25rem 0.75rem',
    borderRadius: '4px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border-color)',
    marginLeft: 'auto' // push to the right edge
  },
  btn: {
    background: 'transparent',
    border: '1px solid var(--accent)',
    color: 'var(--accent)',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s'
  },
  editorWrap: {
    flex: '1',
    background: 'var(--bg-panel)',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    display: 'flex',
    overflow: 'hidden', // Contain the scrolling panes
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.875rem',
    lineHeight: '1.6',
    whiteSpace: 'pre'
  },
  pane: {
    flex: '1',
    overflow: 'auto', // Both X and Y scrolling
    padding: '1rem 0',
    minWidth: 0, // necessary for flex children with auto overflow
  },
  leftPane: {
    borderRight: '1px solid var(--border-color)',
  },
  line: {
    padding: '0 1rem',
    // We add transparent borders instead of 0 padding so the text doesn't shift
    height: '1.6em', // ensure empty lines maintain height
    display: 'flex', // ensure consistent height
    alignItems: 'center'
  },
  jsonKey: {
    color: '#38bdf8'
  },
  jsonColon: {
    color: 'var(--text-main)',
    whiteSpace: 'pre'
  },
  jsonValue: (type) => ({
    color: type === 'string' ? '#a3e635' : 
           type === 'number' ? '#fb923c' :
           type === 'boolean' ? '#f472b6' :
           type === 'null' ? '#94a3b8' : 'var(--text-main)',
    whiteSpace: 'pre'
  }),
  jsonComma: {
    color: 'var(--text-main)'
  }
};
