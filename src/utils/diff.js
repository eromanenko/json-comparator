export const DIFF_TYPES = {
  UNCHANGED: 'unchanged',
  ADDED: 'added',        // Equivalent to "missing property" on the left
  REMOVED: 'removed',    // Equivalent to "missing property" on the right
  CHANGED_VALUE: 'changed_value',
  CHANGED_TYPE: 'changed_type', // Equivalent to "incorrect type"
};

export const getType = (val) => {
  if (val === null) return 'null';
  if (Array.isArray(val)) return 'array';
  return typeof val;
};

export const computeDiff = (obj1, obj2, path = '') => {
  const type1 = getType(obj1);
  const type2 = getType(obj2);

  // If both are the same reference or primitive value
  if (obj1 === obj2) {
    return {
      path,
      type: DIFF_TYPES.UNCHANGED,
      val1: obj1,
      val2: obj2,
      dataType: type1
    };
  }

  // If one is undefined (meaning it's added or removed from an object)
  if (obj1 === undefined) {
    let children = undefined;
    if (type2 === 'object' && obj2 !== null) {
      children = {};
      Object.keys(obj2).sort().forEach(key => {
        children[key] = computeDiff(undefined, obj2[key], path ? `${path}.${key}` : key);
      });
    } else if (type2 === 'array') {
      children = {};
      for(let i=0; i<obj2.length; i++) {
        children[i] = computeDiff(undefined, obj2[i], `${path}[${i}]`);
      }
    }

    return {
      path,
      type: DIFF_TYPES.ADDED,
      val1: undefined,
      val2: obj2,
      dataType: type2,
      children
    };
  }
  
  if (obj2 === undefined) {
    let children = undefined;
    if (type1 === 'object' && obj1 !== null) {
      children = {};
      Object.keys(obj1).sort().forEach(key => {
        children[key] = computeDiff(obj1[key], undefined, path ? `${path}.${key}` : key);
      });
    } else if (type1 === 'array') {
      children = {};
      for(let i=0; i<obj1.length; i++) {
        children[i] = computeDiff(obj1[i], undefined, `${path}[${i}]`);
      }
    }

    return {
      path,
      type: DIFF_TYPES.REMOVED,
      val1: obj1,
      val2: undefined,
      dataType: type1,
      children
    };
  }

  // If types differ entirely
  if (type1 !== type2) {
    return {
      path,
      type: DIFF_TYPES.CHANGED_TYPE,
      val1: obj1,
      val2: obj2,
      dataType1: type1,
      dataType2: type2
    };
  }

  // If both are arrays
  if (type1 === 'array') {
    // For simplicity, we compare array by index. In a more advanced algo, we'd use LCS.
    const maxLen = Math.max(obj1.length, obj2.length);
    const children = {};
    let hasChanges = false;
    
    for (let i = 0; i < maxLen; i++) {
      const childDiff = computeDiff(obj1[i], obj2[i], `${path}[${i}]`);
      children[i] = childDiff;
      if (childDiff.type !== DIFF_TYPES.UNCHANGED || childDiff.hasChanges) {
        hasChanges = true;
      }
    }
    
    return {
      path,
      type: DIFF_TYPES.UNCHANGED, // The array itself is 'unchanged' in reference concept, but might have changes inside
      hasChanges,
      dataType: 'array',
      val1: obj1,
      val2: obj2,
      children
    };
  }

  // If both are objects
  if (type1 === 'object') {
    const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
    const children = {};
    let hasChanges = false;
    
    // Sort keys to ensure stable output
    Array.from(keys).sort().forEach(key => {
      const childDiff = computeDiff(obj1[key], obj2[key], path ? `${path}.${key}` : key);
      children[key] = childDiff;
      if (childDiff.type !== DIFF_TYPES.UNCHANGED || childDiff.hasChanges) {
        hasChanges = true;
      }
    });

    return {
      path,
      type: DIFF_TYPES.UNCHANGED,
      hasChanges,
      dataType: 'object',
      val1: obj1,
      val2: obj2,
      children
    };
  }

  // Both are primitives but different values
  return {
    path,
    type: DIFF_TYPES.CHANGED_VALUE,
    val1: obj1,
    val2: obj2,
    dataType: type1
  };
};

export const countDiffs = (diffTree) => {
  let counts = {
    missingProperties: 0,
    incorrectTypes: 0,
    changedValues: 0,
    total: 0
  };

  const traverse = (node) => {
    if (node.type === DIFF_TYPES.ADDED || node.type === DIFF_TYPES.REMOVED) {
      counts.missingProperties++;
      counts.total++;
    } else if (node.type === DIFF_TYPES.CHANGED_TYPE) {
      counts.incorrectTypes++;
      counts.total++;
    } else if (node.type === DIFF_TYPES.CHANGED_VALUE) {
      counts.changedValues++;
      counts.total++;
    }

    if (node.children) {
      Object.values(node.children).forEach(traverse);
    }
  };

  if (diffTree) {
    traverse(diffTree);
  }

  return counts;
};
