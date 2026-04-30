import {
  FIELD_TYPE,
  ENUM_OPTIONS,
  getFieldType,
  serializeValue,
} from './fieldTypes';

describe('getFieldType()', () => {
  // Key-based overrides (must win regardless of value type)
  it('returns BOOLEAN for keys in BOOLEAN_KEYS even when value is null', () => {
    expect(getFieldType('selfPaced', null)).toBe(FIELD_TYPE.BOOLEAN);
  });

  it('returns NUMBER for keys in NUMBER_KEYS even when value is null', () => {
    expect(getFieldType('maxAttempts', null)).toBe(FIELD_TYPE.NUMBER);
  });

  it('returns ENUM for keys present in ENUM_OPTIONS', () => {
    expect(getFieldType('showanswer', 'always')).toBe(FIELD_TYPE.ENUM);
    expect(getFieldType('rerandomize', 'never')).toBe(FIELD_TYPE.ENUM);
    expect(getFieldType('catalogVisibility', 'both')).toBe(FIELD_TYPE.ENUM);
  });

  // Value-based fallback
  it('returns BOOLEAN when value is a boolean (and key not overridden)', () => {
    expect(getFieldType('someUnknownKey', true)).toBe(FIELD_TYPE.BOOLEAN);
    expect(getFieldType('someUnknownKey', false)).toBe(FIELD_TYPE.BOOLEAN);
  });

  it('returns NUMBER when value is a number (and key not overridden)', () => {
    expect(getFieldType('someUnknownKey', 42)).toBe(FIELD_TYPE.NUMBER);
    expect(getFieldType('someUnknownKey', 0)).toBe(FIELD_TYPE.NUMBER);
  });

  it('returns JSON for array values', () => {
    expect(getFieldType('advancedModules', [])).toBe(FIELD_TYPE.JSON);
    expect(getFieldType('ltiPassports', ['key:secret'])).toBe(FIELD_TYPE.JSON);
  });

  it('returns JSON for object values', () => {
    expect(getFieldType('cohortConfig', { cohorted: true })).toBe(FIELD_TYPE.JSON);
  });

  it('returns STRING as default for string values with no key override', () => {
    expect(getFieldType('displayName', 'My Course')).toBe(FIELD_TYPE.STRING);
    expect(getFieldType('giturl', '')).toBe(FIELD_TYPE.STRING);
  });
});

describe('serializeValue()', () => {
  it('serializes boolean values to string', () => {
    expect(serializeValue(true, FIELD_TYPE.BOOLEAN)).toBe('true');
    expect(serializeValue(false, FIELD_TYPE.BOOLEAN)).toBe('false');
  });

  it('serializes number values to string', () => {
    expect(serializeValue(3, FIELD_TYPE.NUMBER)).toBe('3');
    expect(serializeValue(0, FIELD_TYPE.NUMBER)).toBe('0');
  });

  it('serializes enum values as JSON strings', () => {
    expect(serializeValue('always', FIELD_TYPE.ENUM)).toBe('"always"');
    expect(serializeValue('never', FIELD_TYPE.ENUM)).toBe('"never"');
  });

  it('serializes string values as JSON strings', () => {
    expect(serializeValue('My Course', FIELD_TYPE.STRING)).toBe('"My Course"');
    expect(serializeValue('', FIELD_TYPE.STRING)).toBe('""');
  });

  it('returns JSON type values as-is (already a string)', () => {
    const raw = '["module_a","module_b"]';
    expect(serializeValue(raw, FIELD_TYPE.JSON)).toBe(raw);
  });
});

describe('ENUM_OPTIONS', () => {
  it('contains options for all 8 enum fields', () => {
    const expectedFields = [
      'showanswer',
      'rerandomize',
      'catalogVisibility',
      'courseVisibility',
      'showCorrectness',
      'videoSharingOptions',
      'courseEditMethod',
      'certificatesDisplayBehavior',
    ];
    expectedFields.forEach((field) => {
      expect(ENUM_OPTIONS[field]).toBeDefined();
      expect(ENUM_OPTIONS[field].length).toBeGreaterThan(0);
    });
  });

  it('every option has a value and a label', () => {
    Object.entries(ENUM_OPTIONS).forEach(([, options]) => {
      options.forEach(({ value, label }) => {
        expect(typeof value).toBe('string');
        expect(typeof label).toBe('string');
      });
    });
  });
});
