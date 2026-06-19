import {
  FIELD_TYPE,
  getFieldType,
  hasEnumOptions,
  serializeValue,
} from './fieldTypes';

describe('getFieldType()', () => {
  // Enum: a non-empty options list wins over everything else.
  it('returns ENUM when the backend provides a non-empty options list', () => {
    expect(getFieldType({ type: 'String', options: [{ value: 'always' }] })).toBe(FIELD_TYPE.ENUM);
    expect(getFieldType({ type: 'String', options: [{ value: 'a' }, { value: 'b' }] })).toBe(FIELD_TYPE.ENUM);
  });

  // Backend type → input type mapping.
  it('maps the backend type to the matching input type', () => {
    expect(getFieldType({ type: 'Boolean', value: null })).toBe(FIELD_TYPE.BOOLEAN);
    expect(getFieldType({ type: 'Integer', value: null })).toBe(FIELD_TYPE.NUMBER);
    expect(getFieldType({ type: 'Float', value: null })).toBe(FIELD_TYPE.NUMBER);
    expect(getFieldType({ type: 'List', value: null })).toBe(FIELD_TYPE.JSON);
    expect(getFieldType({ type: 'Dict', value: null })).toBe(FIELD_TYPE.JSON);
    expect(getFieldType({ type: 'String', value: null })).toBe(FIELD_TYPE.STRING);
    expect(getFieldType({ type: 'Date', value: null })).toBe(FIELD_TYPE.STRING);
    expect(getFieldType({ type: 'Timedelta', value: null })).toBe(FIELD_TYPE.STRING);
  });

  it('does not treat a non-list options value (e.g. numeric constraints) as an enum', () => {
    expect(getFieldType({ type: 'Integer', options: { min: 0 } })).toBe(FIELD_TYPE.NUMBER);
    expect(getFieldType({ type: 'String', options: [] })).toBe(FIELD_TYPE.STRING);
  });

  it('keeps Boolean/Integer as toggle/number even though XBlock gives them default options', () => {
    // XBlock Boolean fields carry a default values list ([True, False]); that must not turn
    // the field into a dropdown — the backend `type` wins over the presence of options.
    const booleanOptions = [{ value: 'true', displayName: 'True' }, { value: 'false', displayName: 'False' }];
    expect(getFieldType({ type: 'Boolean', options: booleanOptions, value: true })).toBe(FIELD_TYPE.BOOLEAN);
    expect(getFieldType({ type: 'Integer', options: [{ value: '1', displayName: 'One' }] })).toBe(FIELD_TYPE.NUMBER);
  });

  // Value-shape fallback for unknown/missing backend type (e.g. older backend, custom field class).
  it('falls back to inferring from the value shape when type is unknown or missing', () => {
    expect(getFieldType({ value: true })).toBe(FIELD_TYPE.BOOLEAN);
    expect(getFieldType({ value: false })).toBe(FIELD_TYPE.BOOLEAN);
    expect(getFieldType({ value: 42 })).toBe(FIELD_TYPE.NUMBER);
    expect(getFieldType({ value: 0 })).toBe(FIELD_TYPE.NUMBER);
    expect(getFieldType({ value: [] })).toBe(FIELD_TYPE.JSON);
    expect(getFieldType({ value: { cohorted: true } })).toBe(FIELD_TYPE.JSON);
    expect(getFieldType({ value: 'My Course' })).toBe(FIELD_TYPE.STRING);
    expect(getFieldType({ type: 'UserPartitionList', value: ['a'] })).toBe(FIELD_TYPE.JSON);
  });
});

describe('hasEnumOptions()', () => {
  it('is true only for a non-empty array', () => {
    expect(hasEnumOptions([{ value: 'a' }])).toBe(true);
    expect(hasEnumOptions([])).toBe(false);
    expect(hasEnumOptions(null)).toBe(false);
    expect(hasEnumOptions(undefined)).toBe(false);
    expect(hasEnumOptions({ min: 0 })).toBe(false);
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
