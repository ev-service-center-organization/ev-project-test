module.exports = function() {
  return actor({
    assertIn(arr, val, msg = '')  { if (!arr.includes(val)) throw new Error(msg || `${val} not in [${arr}]`); },
    assertFalse(val, msg = '')    { if (val) throw new Error(msg || 'Expected false'); },
    assertNotNull(val, msg = '')  { if (val == null) throw new Error(msg || 'Expected not null'); },
    assertEqual(a, b, msg = '')   { if (a !== b) throw new Error(msg || `${a} !== ${b}`); },
    assertLessOrEqual(a, b, msg = '') { if (a > b) throw new Error(msg || `${a} > ${b}`); },
    assertTrue(val, msg = '')     { if (!val) throw new Error(msg || 'Expected true'); },
  });
};