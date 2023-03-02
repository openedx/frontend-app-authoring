import * as hooks from './hooks';

const mockRawOLX = 'rawOLX';
const mockBuiltOLX = 'builtOLX';

jest.mock('../../data/ReactStateOLXParser', () => (
  jest.fn().mockImplementation(() => ({
    buildOLX: () => mockBuiltOLX,
  }))
));
jest.mock('../../data/ReactStateSettingsParser');

describe('EditProblemView hooks parseState', () => {
  const toStringMock = () => mockRawOLX;
  const refMock = { current: { state: { doc: { toString: toStringMock } } } };

  test('default problem', () => {
    const res = hooks.parseState({
      problem: 'problem',
      isAdvanced: false,
      ref: refMock,
      assets: {},
    })();
    expect(res.olx).toBe(mockBuiltOLX);
  });
  test('advanced problem', () => {
    const res = hooks.parseState({
      problem: 'problem',
      isAdvanced: true,
      ref: refMock,
      assets: {},
    })();
    expect(res.olx).toBe(mockRawOLX);
  });
});
