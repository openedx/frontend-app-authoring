import StrictDict from './StrictDict';

const value1 = 'valUE1';
const value2 = 'vALue2';
const key1 = 'Key1';
const key2 = 'keY2';

jest.spyOn(window, 'Error').mockImplementation(error => ({ stack: error }));

describe('StrictDict', () => {
  let consoleError;
  let consoleLog;
  let windowError;
  beforeEach(() => {
    consoleError = window.console.error;
    consoleLog = window.console.lot;
    windowError = window.Error;
    window.console.error = jest.fn();
    window.console.log = jest.fn();
    window.Error = jest.fn(error => ({ stack: error }));
  });
  afterAll(() => {
    window.console.error = consoleError;
    window.console.log = consoleLog;
    window.Error = windowError;
  });
  const rawDict = {
    [key1]: value1,
    [key2]: value2,
  };
  const dict = StrictDict(rawDict);
  it('provides key access like a normal dict object', () => {
    expect(dict[key1]).toEqual(value1);
  });
  it('allows key listing', () => {
    expect(Object.keys(dict)).toEqual([key1, key2]);
  });
  it('allows item listing', () => {
    expect(Object.values(dict)).toEqual([value1, value2]);
  });
  it('allows stringification', () => {
    expect(dict.toString()).toEqual(rawDict.toString());
    expect({ ...dict }).toEqual({ ...rawDict });
  });
  it('allows entry listing', () => {
    expect(Object.entries(dict)).toEqual(Object.entries(rawDict));
  });
  describe('missing key', () => {
    it('logs error with target, name, and error stack', () => {
      // eslint-ignore-next-line no-unused-vars
      const callBadKey = () => dict.fakeKey;
      callBadKey();
      expect(window.console.error.mock.calls).toEqual([
        [{ target: dict, name: 'fakeKey' }],
        [Error('invalid property "fakeKey"').stack],
      ]);
    });
    it('returns undefined', () => {
      expect(dict.fakeKey).toEqual(undefined);
    });
  });
});
