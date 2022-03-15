import { StrictDict } from '../../../../utils';
import * as hooks from './hooks';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: jest.fn(),
}));

const simpleDims = { width: 3, height: 4 };
const reducedDims = { width: 7, height: 13 };
const gcd = 7;
const multiDims = {
  width: reducedDims.width * gcd,
  height: reducedDims.height * gcd,
};

const stateKeys = StrictDict(Object.keys(hooks.state).reduce(
  (obj, key) => ({ ...obj, [key]: key }),
  {},
));

const hookKeys = StrictDict(Object.keys(hooks).reduce(
  (obj, key) => ({ ...obj, [key]: key }),
  {},
));

let oldState;
const setState = {};
const mockState = () => {
  oldState = hooks.state;
  const keys = Object.keys(stateKeys);
  keys.forEach(key => {
    setState[key] = jest.fn();
    hooks.state[key] = jest.fn(val => [val, setState[key]]);
  });
};
const restoreState = () => {
  hooks.state = { ...oldState };
};

const mockStateVal = (key, val) => (
  hooks.state[key].mockReturnValueOnce([val, setState[key]])
);

let hook;

describe('ImageSettingsModal hooks', () => {
  describe('dimensions-related hooks', () => {
    describe('getValidDimensions', () => {
      describe('decreasing change when at minimum valid increment', () => {
        it('returns current dimensions', () => {
          const dimensions = { ...reducedDims };
          const locked = { minInc: { ...dimensions, gcd } };
          let local = { ...dimensions, width: dimensions.width - 1 };
          expect(
            hooks.getValidDimensions({ dimensions, local, locked }),
          ).toEqual(dimensions);
          local = { ...dimensions, height: dimensions.height - 1 };
          expect(
            hooks.getValidDimensions({ dimensions, local, locked }),
          ).toEqual(dimensions);
        });
      });
      describe('valid change', () => {
        it(
          'returns the nearest valid pair of dimensions in the change direciton',
          () => {
            const w = 7;
            const h = 13;
            const values = [
              // bumps up if direction is up but nearest is current
              [[w + 1, h], [w * 2, h * 2]],
              [[w + 1, h], [w * 2, h * 2]],
              // bumps up if just below next
              [[w, 2 * h - 1], [w * 2, h * 2]],
              [[w, 2 * h - 1], [w * 2, h * 2]],
              // rounds down to next if that is closest
              [[w, 2 * h + 1], [w * 2, h * 2]],
              [[w, 2 * h + 1], [w * 2, h * 2]],
              // ensure is not locked to second iteration, by getting close to 3rd
              [[w, 3 * h - 1], [w * 3, h * 3]],
              [[w, 3 * h - 1], [w * 3, h * 3]],
            ];
            values.forEach(([local, expected]) => {
              const dimensions = { width: w, height: h };
              expect(hooks.getValidDimensions({
                dimensions,
                local: { width: local[0], height: local[1] },
                locked: { ...dimensions, minInc: { ...dimensions, gcd: 1 } },
              })).toEqual({ width: expected[0], height: expected[1] });
            });
          },
        );
      });
    });
    describe('newDimensions', () => {
      it('returns the local values if not locked, or if local is equal to dimensions', () => {
        expect(hooks.newDimensions({
          dimensions: { ...simpleDims },
          local: { ...simpleDims },
          locked: { ...simpleDims },
        })).toEqual({ ...simpleDims });
        expect(hooks.newDimensions({
          dimensions: { ...simpleDims },
          local: { ...reducedDims },
          locked: null,
        })).toEqual({ ...reducedDims });
      });
      it('returns getValidDimensions if locked and local has changed', () => {
        const getValidDimensions = (args) => ({ getValidDimensions: args });
        jest.spyOn(hooks, hookKeys.getValidDimensions).mockImplementationOnce(getValidDimensions);
        const args = {
          dimensions: { ...simpleDims },
          local: { ...multiDims },
          locked: { ...reducedDims },
        };
        expect(hooks.newDimensions(args)).toEqual(getValidDimensions(args));
      });
    });
    describe('lockDimensions', () => {
      it('does not call setLocked if lockInitialized is false', () => {
        setState.locked = jest.fn();
        hooks.lockDimensions({
          dimensions: simpleDims,
          setLocked: setState.locked,
          lockInitialized: false,
        });
        expect(setState.locked).not.toHaveBeenCalled();
      });
      it(
        'calls setLocked with the given dimensions and minInc, including gcd',
        () => {
          setState.locked = jest.fn();
          hooks.lockDimensions({
            dimensions: simpleDims,
            setLocked: setState.locked,
            lockInitialized: true,
          });
          expect(setState.locked).toHaveBeenCalledWith({
            ...simpleDims,
            minInc: { gcd: 1, ...simpleDims },
          });
          setState.locked.mockClear();

          hooks.lockDimensions({
            dimensions: multiDims,
            setLocked: setState.locked,
            lockInitialized: true,
          });
          expect(hooks.findGcd(multiDims.width, multiDims.height)).toEqual(7);
          expect(setState.locked).toHaveBeenCalledWith({
            ...multiDims,
            minInc: { gcd, ...reducedDims },
          });
        },
      );
    });
    describe('dimensionLockHooks', () => {
      beforeEach(() => {
        mockState();
        hook = hooks.dimensionLockHooks({ dimensions: simpleDims });
      });
      afterEach(() => {
        restoreState();
      });

      test('locked is initially null', () => {
        expect(hook.locked).toEqual(null);
      });
      test('initializeLock calls setLockInitialized with true', () => {
        hook.initializeLock();
        expect(setState.lockInitialized).toHaveBeenCalledWith(true);
      });
      test('lock calls lockDimensions with lockInitialized, dimensions, and setLocked', () => {
        mockStateVal(stateKeys.lockInitialized, true, setState.lockInitialized);
        hook = hooks.dimensionLockHooks({ dimensions: simpleDims });
        const lockDimensionsSpy = jest.spyOn(hooks, hookKeys.lockDimensions);
        hook.lock();
        expect(lockDimensionsSpy).toHaveBeenCalledWith({
          dimensions: simpleDims,
          setLocked: setState.locked,
          lockInitialized: true,
        });
      });
      test('unlock sets locked to null', () => {
        hook = hooks.dimensionLockHooks({ dimensions: simpleDims });
        hook.unlock();
        expect(setState.locked).toHaveBeenCalledWith(null);
      });
    });
    describe('dimensionHooks', () => {
      let lockHooks;
      beforeEach(() => {
        mockState();
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
        restoreState();
      });
      it('initializes dimension lock hooks with incoming dimension value', () => {
        mockStateVal(stateKeys.dimensions, reducedDims, setState.local);
        hook = hooks.dimensionHooks();
        expect(hooks.dimensionLockHooks).toHaveBeenCalledWith({ dimensions: reducedDims });
      });
      test('value is tied to local state', () => {
        mockStateVal(stateKeys.local, simpleDims, setState.local);
        hook = hooks.dimensionHooks();
        expect(hook.value).toEqual(simpleDims);
      });
      describe('onImgLoad', () => {
        const img = { naturalHeight: 200, naturalWidth: 345 };
        const evt = { target: img };
        it('calls initializeDimensions with selection dimensions if passed', () => {
          hook.onImgLoad(simpleDims)(evt);
          expect(setState.dimensions).toHaveBeenCalledWith(simpleDims);
          expect(setState.local).toHaveBeenCalledWith(simpleDims);
        });
        it('calls initializeDimensions with target image dimensions if no selection', () => {
          hook.onImgLoad({})(evt);
          const expected = { width: img.naturalWidth, height: img.naturalHeight };
          expect(setState.dimensions).toHaveBeenCalledWith(expected);
          expect(setState.local).toHaveBeenCalledWith(expected);
        });
        it('calls initializeLock', () => {
          const initializeDimensions = jest.fn();
          hook.onImgLoad(initializeDimensions, simpleDims)(evt);
          expect(lockHooks.initializeLock).toHaveBeenCalled();
        });
      });
      describe('setHeight', () => {
        it('sets local height to int value of argument', () => {
          mockStateVal(stateKeys.local, simpleDims, setState.local);
          hooks.dimensionHooks().setHeight('23.4');
          expect(setState.local).toHaveBeenCalledWith({ ...simpleDims, height: 23 });
        });
      });
      describe('setWidth', () => {
        it('sets local width to int value of argument', () => {
          mockStateVal(stateKeys.local, simpleDims, setState.local);
          hooks.dimensionHooks().setWidth('34.5');
          expect(setState.local).toHaveBeenCalledWith({ ...simpleDims, width: 34 });
        });
      });
      describe('updateDimensions', () => {
        it('sets local and stored dimensions to newDimensions output', () => {
          const newDimensions = (args) => ({ newDimensions: args });
          mockStateVal(stateKeys.dimensions, simpleDims, setState.dimensions);
          mockStateVal(stateKeys.locked, reducedDims, setState.locked);
          mockStateVal(stateKeys.local, multiDims, setState.local);
          jest.spyOn(hooks, hookKeys.newDimensions).mockImplementationOnce(newDimensions);
          hook = hooks.dimensionHooks();
          hook.updateDimensions();
          const expected = newDimensions({
            dimensions: simpleDims,
            locked: reducedDims,
            local: multiDims,
          });
          expect(setState.local).toHaveBeenCalledWith(expected);
          expect(setState.dimensions).toHaveBeenCalledWith(expected);
        });
      });
    });
  });
  describe('altTextHooks', () => {
    it('returns value and isDecorative, along with associated setters', () => {
      mockState();
      const value = 'myVAL';
      const isDecorative = 'IS WE Decorating?';
      mockStateVal(stateKeys.altText, value, setState.altText);
      mockStateVal(stateKeys.isDecorative, isDecorative, setState.isDecorative);
      hook = hooks.altTextHooks();
      expect(hook.value).toEqual(value);
      expect(hook.setValue).toEqual(setState.altText);
      expect(hook.isDecorative).toEqual(isDecorative);
      expect(hook.setIsDecorative).toEqual(setState.isDecorative);
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
  describe('onSaveClick', () => {
    it('calls saveToEditor with dimensions, altText, and isDecorative', () => {
      const dimensions = simpleDims;
      const altText = 'What is this?';
      const isDecorative = 'probably';
      const saveToEditor = jest.fn();
      hooks.onSaveClick({
        altText,
        dimensions,
        isDecorative,
        saveToEditor,
      })();
      expect(saveToEditor).toHaveBeenCalledWith({
        altText,
        dimensions,
        isDecorative,
      });
    });
  });
});
