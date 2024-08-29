import React from 'react';
import { StrictDict } from '../../../utils';
import { MockUseState } from '../../../testUtils';
import * as hooks from './hooks';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn(),
  useState: (val) => ({ useState: val }),
}));

const simpleDims = { width: 3, height: 4 };
const reducedDims = { width: 7, height: 13 };
const gcd = 7;
const multiDims = {
  width: reducedDims.width * gcd,
  height: reducedDims.height * gcd,
};

const state = new MockUseState(hooks);

const hookKeys = StrictDict(Object.keys(hooks).reduce(
  (obj, key) => ({ ...obj, [key]: key }),
  {},
));

let hook;

const testVal = 'MY test VALUE';

describe('state values', () => {
  const testStateMethod = (key) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
    expect(hooks.state[key](testVal)).toEqual(React.useState(testVal));
  };
  test('provides altText state value', () => testStateMethod(state.keys.altText));
  test('provides dimensions state value', () => testStateMethod(state.keys.dimensions));
  test('provides showAltTextDismissibleError state value', () => testStateMethod(state.keys.showAltTextDismissibleError));
  test('provides showAltTextSubmissionError state value', () => testStateMethod(state.keys.showAltTextSubmissionError));
  test('provides isDecorative state value', () => testStateMethod(state.keys.isDecorative));
  test('provides isLocked state value', () => testStateMethod(state.keys.isLocked));
  test('provides local state value', () => testStateMethod(state.keys.local));
  test('provides lockAspectRatio state value', () => testStateMethod(state.keys.lockAspectRatio));
});

describe('ImageSettingsModal hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('dimensions-related hooks', () => {
    describe('getValidDimensions', () => {
      it('returns local dimensions if not locked', () => {
        expect(hooks.getValidDimensions({
          dimensions: simpleDims,
          local: reducedDims,
          isLocked: false,
          lockAspectRatio: simpleDims,
        })).toEqual(reducedDims);
      });
      it('returns local dimensions if the same as stored', () => {
        expect(hooks.getValidDimensions({
          dimensions: simpleDims,
          local: simpleDims,
          isLocked: true,
          lockAspectRatio: reducedDims,
        })).toEqual(simpleDims);
      });
      describe('valid change when aspect ratio is locked', () => {
        describe(
          'keeps changed dimension and keeps the other dimension proportional but rounded',
          () => {
            const [w, h] = [7, 13];

            const testDimensions = (newDimensions, expected) => {
              const dimensions = { width: w, height: h };
              expect(hooks.getValidDimensions({
                dimensions,
                local: { width: newDimensions[0], height: newDimensions[1] },
                lockAspectRatio: { ...dimensions },
                isLocked: true,
              })).toEqual({ width: expected[0], height: expected[1] });
            };

            it('if width is increased, increases and rounds height to stay proportional', () => {
              testDimensions([8, h], [8, 15]);
            });
            it('if height is increased, increases and rounds width to stay proportional', () => {
              testDimensions([w, 25], [13, 25]);
            });
            it('if width is decreased, decreases and rounds height to stay proportional', () => {
              testDimensions([6, h], [6, 11]);
            });
            it('if height is decreased, decreases and rounds width to stay proportional', () => {
              testDimensions([7, 10], [5, 10]);
            });
          },
        );
      });
      it('calculates new dimensions proportionally and correctly when lock is active', () => {
        expect(hooks.getValidDimensions({
          dimensions: { width: 1517, height: 803 },
          local: { width: 758, height: 803 },
          isLocked: true,
          lockAspectRatio: { width: 1517, height: 803 },
        })).toEqual({ width: 758, height: 401 });
      });
    });
    describe('dimensionLockHooks', () => {
      beforeEach(() => {
        state.mock();
        hook = hooks.dimensionLockHooks({ dimensions: simpleDims });
      });
      afterEach(() => {
        state.restore();
      });
      test('lockAspectRatio defaults to null', () => {
        expect(hook.lockAspectRatio).toEqual(null);
      });
      test('isLocked defaults to true', () => {
        expect(hook.isLocked).toEqual(true);
      });
      describe('initializeLock', () => {
        it('calls setLockAspectRatio with the passed dimensions divided by their gcd', () => {
          hook.initializeLock(multiDims);
          expect(state.setState.lockAspectRatio).toHaveBeenCalledWith(reducedDims);
        });
        it('returns the values themselves if they have no gcd', () => {
          jest.spyOn(hooks, hookKeys.findGcd).mockReturnValueOnce(1);
          hook.initializeLock(simpleDims);
          expect(state.setState.lockAspectRatio).toHaveBeenCalledWith(simpleDims);
        });
      });
      test('lock sets isLocked to true', () => {
        hook = hooks.dimensionLockHooks({ dimensions: simpleDims });
        hook.lock();
        expect(state.setState.isLocked).toHaveBeenCalledWith(true);
      });
      test('unlock sets locked to null', () => {
        hook = hooks.dimensionLockHooks({ dimensions: simpleDims });
        hook.unlock();
        expect(state.setState.isLocked).toHaveBeenCalledWith(false);
      });
    });
    describe('dimensionHooks', () => {
      let lockHooks;
      beforeEach(() => {
        state.mock();
        lockHooks = {
          initializeLock: jest.fn(),
          lock: jest.fn(),
          unlock: jest.fn(),
          locked: { ...reducedDims },
        };
        jest.spyOn(hooks, hookKeys.dimensionLockHooks).mockReturnValueOnce(lockHooks);
        hook = hooks.dimensionHooks();
      });
      afterEach(() => {
        state.restore();
      });
      it('initializes dimension lock hooks with incoming dimension value', () => {
        state.mockVal(state.keys.dimensions, reducedDims);
        hook = hooks.dimensionHooks();
        expect(hooks.dimensionLockHooks).toHaveBeenCalledWith({ dimensions: reducedDims });
      });
      test('value is tied to local state', () => {
        state.mockVal(state.keys.local, simpleDims);
        hook = hooks.dimensionHooks();
        expect(hook.value).toEqual(simpleDims);
      });
      describe('onImgLoad', () => {
        const img = { naturalHeight: 200, naturalWidth: 345 };
        const evt = { target: img };
        it('calls initializeDimensions with selection dimensions if passed', () => {
          hook.onImgLoad(simpleDims)(evt);
          expect(state.setState.dimensions).toHaveBeenCalledWith(simpleDims);
          expect(state.setState.local).toHaveBeenCalledWith(simpleDims);
        });
        it('calls initializeDimensions with target image dimensions if no selection', () => {
          hook.onImgLoad({})(evt);
          const expected = { width: img.naturalWidth, height: img.naturalHeight };
          expect(state.setState.dimensions).toHaveBeenCalledWith(expected);
          expect(state.setState.local).toHaveBeenCalledWith(expected);
        });
        it('calls initializeLock', () => {
          const initializeDimensions = jest.fn();
          hook.onImgLoad(initializeDimensions, simpleDims)(evt);
          expect(lockHooks.initializeLock).toHaveBeenCalled();
        });
      });
      describe('setHeight', () => {
        it('sets local height to int value of argument', () => {
          state.mockVal(state.keys.local, simpleDims);
          hooks.dimensionHooks().setHeight('23.4');
          expect(state.setState.local).toHaveBeenCalledWith({ ...simpleDims, height: 23 });
        });
      });
      describe('setWidth', () => {
        it('sets local width to int value of argument', () => {
          state.mockVal(state.keys.local, simpleDims);
          hooks.dimensionHooks().setWidth('34.5');
          expect(state.setState.local).toHaveBeenCalledWith({ ...simpleDims, width: 34 });
        });
      });
      describe('updateDimensions', () => {
        it('sets local and stored dimensions to newDimensions output', () => {
          // store values we care about under height or width, and add junk data to be stripped out.
          const testDims = (args) => ({ ...simpleDims, height: args });
          const getValidDimensions = (args) => ({ ...testDims(args), junk: 'data' });
          state.mockVal(state.keys.isLocked, true);
          state.mockVal(state.keys.dimensions, simpleDims);
          state.mockVal(state.keys.lockAspectRatio, reducedDims);
          state.mockVal(state.keys.local, multiDims);
          jest.spyOn(hooks, hookKeys.getValidDimensions).mockImplementationOnce(getValidDimensions);
          hook = hooks.dimensionHooks();
          hook.updateDimensions();
          const expected = testDims({
            dimensions: simpleDims,
            lockAspectRatio: reducedDims,
            local: multiDims,
            isLocked: true,
          });
          expect(state.setState.local).toHaveBeenCalledWith(expected);
          expect(state.setState.dimensions).toHaveBeenCalledWith(expected);
        });
      });
    });
  });
  describe('altTextHooks', () => {
    const value = 'myVAL';
    const isDecorative = true;
    const showAltTextDismissibleError = true;
    const showAltTextSubmissionError = true;
    beforeEach(() => {
      state.mock();
      hook = hooks.altTextHooks();
    });
    afterEach(() => {
      state.restore();
    });
    it('returns value and isDecorative', () => {
      state.mockVal(state.keys.altText, value);
      state.mockVal(state.keys.isDecorative, isDecorative);
      hook = hooks.altTextHooks();
      expect(hook.value).toEqual(value);
      expect(hook.isDecorative).toEqual(isDecorative);
    });
    test('setValue sets value', () => {
      state.mockVal(state.keys.altText, value);
      hook = hooks.altTextHooks();
      hook.setValue(value);
      expect(state.setState.altText).toHaveBeenCalledWith(value);
    });
    test('setIsDecorative sets isDecorative', () => {
      state.mockVal(state.keys.altText, value);
      hook = hooks.altTextHooks();
      hook.setIsDecorative(value);
      expect(state.setState.isDecorative).toHaveBeenCalledWith(value);
    });
    describe('error', () => {
      test('show is initialized to false and returns properly', () => {
        expect(hook.error.show).toEqual(false);
        state.mockVal(state.keys.showAltTextDismissibleError, showAltTextDismissibleError);
        hook = hooks.altTextHooks();
        expect(hook.error.show).toEqual(showAltTextDismissibleError);
      });
      test('set sets showAltTextDismissibleError to true', () => {
        hook.error.set();
        expect(state.setState.showAltTextDismissibleError).toHaveBeenCalledWith(true);
      });
      test('dismiss sets showAltTextDismissibleError to false', () => {
        hook.error.dismiss();
        expect(state.setState.showAltTextDismissibleError).toHaveBeenCalledWith(false);
      });
    });
    describe('validation', () => {
      test('show is initialized to false and returns properly', () => {
        expect(hook.validation.show).toEqual(false);
        state.mockVal(state.keys.showAltTextSubmissionError, showAltTextSubmissionError);
        hook = hooks.altTextHooks();
        expect(hook.validation.show).toEqual(showAltTextSubmissionError);
      });
      test('set sets showAltTextSubmissionError to true', () => {
        hook.validation.set();
        expect(state.setState.showAltTextSubmissionError).toHaveBeenCalledWith(true);
      });
      test('dismiss sets showAltTextSubmissionError to false', () => {
        hook.validation.dismiss();
        expect(state.setState.showAltTextSubmissionError).toHaveBeenCalledWith(false);
      });
    });
  });
  describe('onInputChange', () => {
    it('calls handleValue with event value prop', () => {
      const value = 'TEST value';
      const onChange = jest.fn();
      hooks.onInputChange(onChange)({ target: { value } });
      expect(onChange).toHaveBeenCalledWith(value);
    });
  });
  describe('onCheckboxChange', () => {
    it('calls handleValue with event checked prop', () => {
      const checked = 'TEST value';
      const onChange = jest.fn();
      hooks.onCheckboxChange(onChange)({ target: { checked } });
      expect(onChange).toHaveBeenCalledWith(checked);
    });
  });
  describe('checkFormValidation', () => {
    const props = {
      onAltTextFail: jest.fn().mockName('onAltTextFail'),
    };
    beforeEach(() => {
      props.altText = '';
      props.isDecorative = false;
    });
    it('calls onAltTextFail when isDecorative is false and altText is an empty string', () => {
      hooks.checkFormValidation({ ...props });
      expect(props.onAltTextFail).toHaveBeenCalled();
    });
    it('returns false when isDeocrative is false and altText is an empty string', () => {
      expect(hooks.checkFormValidation({ ...props })).toEqual(false);
    });
    it('returns true when isDecorative is true', () => {
      props.isDecorative = true;
      expect(hooks.checkFormValidation({ ...props })).toEqual(true);
    });
  });
  describe('onSaveClick', () => {
    const props = {
      altText: {
        error: {
          show: true,
          set: jest.fn(),
          dismiss: jest.fn(),
        },
        validation: {
          show: true,
          set: jest.fn(),
          dismiss: jest.fn(),
        },
      },
      dimensions: simpleDims,
      saveToEditor: jest.fn().mockName('saveToEditor'),
    };
    beforeEach(() => {
      props.altText.value = 'What is this?';
      props.isDecorative = false;
    });
    it('calls checkFormValidation', () => {
      jest.spyOn(hooks, hookKeys.checkFormValidation);
      hooks.onSaveClick({ ...props })();
      expect(hooks.checkFormValidation).toHaveBeenCalled();
    });
    it('calls saveToEditor with dimensions, altText and isDecorative when checkFormValidation is true', () => {
      jest.spyOn(hooks, hookKeys.checkFormValidation).mockReturnValueOnce(true);
      hooks.onSaveClick({ ...props })();
      expect(props.saveToEditor).toHaveBeenCalledWith({
        altText: props.altText.value,
        dimensions: props.dimensions,
        isDecorative: props.isDecorative,
      });
    });
    it('calls dismissError and sets showAltTextSubmissionError to false when checkFormValidation is true', () => {
      jest.spyOn(hooks, hookKeys.checkFormValidation).mockReturnValueOnce(true);
      hooks.onSaveClick({ ...props })();
      expect(props.altText.error.dismiss).toHaveBeenCalled();
      expect(props.altText.validation.dismiss).toHaveBeenCalled();
    });
    it('does not call saveEditor when checkFormValidation is false', () => {
      jest.spyOn(hooks, hookKeys.checkFormValidation).mockReturnValueOnce(false);
      hooks.onSaveClick({ ...props })();
      expect(props.saveToEditor).not.toHaveBeenCalled();
    });
  });
  describe('findGcd', () => {
    it('should return correct gcd', () => {
      expect(hooks.findGcd(9, 12)).toBe(3);
      expect(hooks.findGcd(3, 4)).toBe(1);
    });
  });
  describe('reduceDimensions', () => {
    it('should return correct gcd', () => {
      expect(hooks.reduceDimensions(9, 12)).toEqual([3, 4]);
      expect(hooks.reduceDimensions(7, 8)).toEqual([7, 8]);
    });
  });
});
