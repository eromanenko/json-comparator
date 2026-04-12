import React, { useState, useRef } from 'react';
import { DIFF_TYPES } from '../utils/diff';

export default function DiffView({ diffResult, stats, onReset }) {
  const [showMissing, setShowMissing] = useState(true);
  const [showDifferentTypes, setShowDifferentTypes] = useState(true);
  const [showDifferentValues, setShowDifferentValues] = useState(true);
  const [collapsedPaths, setCollapsedPaths] = useState(new Set());

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

  const toggleCollapse = (path) => {
    setCollapsedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const expandAll = () => setCollapsedPaths(new Set());

  const collapseAll = () => {
    const getAllPaths = (node) => {
      let paths = [];
      if (node.dataType === 'object' || node.dataType === 'array') {
        if (node.path !== '') paths.push(node.path);
        if (node.children) {
          Object.values(node.children).forEach(child => {
            paths = paths.concat(getAllPaths(child));
          });
        }
      }
      return paths;
    };
    if (diffResult) {
      setCollapsedPaths(new Set(getAllPaths(diffResult)));
    }
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

  const indentSpaceFn = (indent) => '  '.repeat(indent);

  const renderKey = (key) => key !== null ? <><span style={styles.jsonKey}>"{key}"</span><span style={styles.jsonColon}>: </span></> : null;

  const renderTreeRows = (node, indent = 0, key = null, isLast = true) => {
    const rows = [];
    const indentSpace = indentSpaceFn(indent);
    const isFilteredOut = !isVisible(node.type);

    let typeLeft = node.dataType;
    let typeRight = node.dataType;
    if (node.type === DIFF_TYPES.CHANGED_TYPE) {
      typeLeft = node.dataType1;
      typeRight = node.dataType2;
    } else if (node.type === DIFF_TYPES.ADDED) {
      typeLeft = undefined;
    } else if (node.type === DIFF_TYPES.REMOVED) {
      typeRight = undefined;
    }

    const isTreeLeft = typeLeft === 'object' || typeLeft === 'array';
    const isTreeRight = typeRight === 'object' || typeRight === 'array';

    const isEmptyLeft = isTreeLeft && Object.keys(node.val1 || {}).length === 0;
    const isEmptyRight = isTreeRight && Object.keys(node.val2 || {}).length === 0;

    const renderAsTree = (isTreeLeft && !isEmptyLeft) || (isTreeRight && !isEmptyRight);

    if (renderAsTree) {
      const isArrayLeft = typeLeft === 'array';
      const isArrayRight = typeRight === 'array';
      const isCollapsed = collapsedPaths.has(node.path);
      
      const openBracketLeft = isTreeLeft ? (isArrayLeft ? (isCollapsed ? '[ ... ]' : '[') : (isCollapsed ? '{ ... }' : '{')) : '';
      const closeBracketLeft = isTreeLeft ? (isArrayLeft ? ']' : '}') : '';

      const openBracketRight = isTreeRight ? (isArrayRight ? (isCollapsed ? '[ ... ]' : '[') : (isCollapsed ? '{ ... }' : '{')) : '';
      const closeBracketRight = isTreeRight ? (isArrayRight ? ']' : '}') : '';
      
      const toggleIcon = (
        <span 
          onClick={() => toggleCollapse(node.path)}
          style={styles.toggleIcon}
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? '▸' : '▾'}
        </span>
      );
      
      const comma = (!isLast && isCollapsed) ? ',' : '';
      
      let leftShow = node.type !== DIFF_TYPES.ADDED;
      let rightShow = node.type !== DIFF_TYPES.REMOVED;
      
      let leftContentOpen = '';
      if (leftShow) {
        if (isTreeLeft && !isEmptyLeft) leftContentOpen = <>{renderKey(key)}<span style={styles.jsonComma}>{openBracketLeft + comma}</span></>;
        else leftContentOpen = formatPair(key, node.val1, typeLeft, isLast && node.type !== DIFF_TYPES.REMOVED);
      }
      
      let rightContentOpen = '';
      if (rightShow) {
        if (isTreeRight && !isEmptyRight) rightContentOpen = <>{renderKey(key)}<span style={styles.jsonComma}>{openBracketRight + comma}</span></>;
        else rightContentOpen = formatPair(key, node.val2, typeRight, isLast && node.type !== DIFF_TYPES.ADDED);
      }

      rows.push({
        left: (
          <div key={`${node.path}-open-left`} style={{...styles.line, ...getRowStyle(node.type, 'left')}}>
            {isTreeLeft && !isEmptyLeft && toggleIcon}
            <span>
              {indentSpace}{leftContentOpen}
            </span>
          </div>
        ),
        right: (
          <div key={`${node.path}-open-right`} style={{...styles.line, ...getRowStyle(node.type, 'right')}}>
            {isTreeRight && !isEmptyRight && toggleIcon}
            <span>
              {indentSpace}{rightContentOpen}
            </span>
          </div>
        )
      });

      if (!isCollapsed) {
        if (node.children) {
          const childKeys = Object.keys(node.children);
          childKeys.forEach((ckey, idx) => {
            const childLast = idx === childKeys.length - 1;
            rows.push(...renderTreeRows(node.children[ckey], indent + 1, ckey, childLast));
          });
        }

        rows.push({
          left: (
            <div key={`${node.path}-close-left`} style={{...styles.line, ...getRowStyle(node.type, 'left')}}>
               <span>
                 {indentSpace}{leftShow && isTreeLeft && !isEmptyLeft ? <>{closeBracketLeft}{!isLast && <span style={styles.jsonComma}>,</span>}</> : ''}
               </span>
            </div>
          ),
          right: (
            <div key={`${node.path}-close-right`} style={{...styles.line, ...getRowStyle(node.type, 'right')}}>
               <span>
                 {indentSpace}{rightShow && isTreeRight && !isEmptyRight ? <>{closeBracketRight}{!isLast && <span style={styles.jsonComma}>,</span>}</> : ''}
               </span>
            </div>
          )
        });
      }
      
    } else {
      // It's a leaf node
      const leftShow = node.type !== DIFF_TYPES.ADDED;
      const rightShow = node.type !== DIFF_TYPES.REMOVED;
      
      let typeLeft = node.type === DIFF_TYPES.CHANGED_TYPE ? node.dataType1 : node.dataType;
      let typeRight = node.type === DIFF_TYPES.CHANGED_TYPE ? node.dataType2 : node.dataType;

      rows.push({
        left: (
          <div key={`${node.path}-left`} style={{...styles.line, ...getRowStyle(node.type, 'left')}}>
            <span>
              {indentSpace}
              {leftShow ? formatPair(key, node.val1, typeLeft, isLast && node.type !== DIFF_TYPES.REMOVED) : ''}
            </span>
          </div>
        ),
        right: (
          <div key={`${node.path}-right`} style={{...styles.line, ...getRowStyle(node.type, 'right')}}>
             <span>
               {indentSpace}
               {rightShow ? formatPair(key, node.val2, typeRight, isLast && node.type !== DIFF_TYPES.ADDED) : ''}
             </span>
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
        </div>
        <div style={styles.actions}>
          <button style={styles.actionBtn} onClick={expandAll}>Expand All</button>
          <button style={styles.actionBtn} onClick={collapseAll}>Collapse All</button>
          <button style={styles.btn} onClick={onReset}>Perform a new diff</button>
        </div>
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
  actions: {
    display: 'flex',
    gap: '0.5rem',
    marginLeft: 'auto'
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
    alignItems: 'center',
    position: 'relative'
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
  },
  toggleIcon: {
    position: 'absolute',
    left: '4px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '12px',
    textAlign: 'center',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    userSelect: 'none',
    zIndex: 10
  }
};
