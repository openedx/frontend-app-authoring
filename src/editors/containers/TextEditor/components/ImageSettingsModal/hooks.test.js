import { StrictDict } from '../../../../utils';
import { MockUseState } from '../../../../../testUtils';
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

const state = new MockUseState(hooks);

const hookKeys = StrictDict(Object.keys(hooks).reduce(
  (obj, key) => ({ ...obj, [key]: key }),
  {},
));

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
        state.setState.locked = jest.fn();
        hooks.lockDimensions({
          dimensions: simpleDims,
          setLocked: state.setState.locked,
          lockInitialized: false,
        });
        expect(state.setState.locked).not.toHaveBeenCalled();
      });
      it(
        'calls setLocked with the given dimensions and minInc, including gcd',
        () => {
          state.setState.locked = jest.fn();
          hooks.lockDimensions({
            dimensions: simpleDims,
            setLocked: state.setState.locked,
            lockInitialized: true,
          });
          expect(state.setState.locked).toHaveBeenCalledWith({
            ...simpleDims,
            minInc: { gcd: 1, ...simpleDims },
          });
          state.setState.locked.mockClear();

          hooks.lockDimensions({
            dimensions: multiDims,
            setLocked: state.setState.locked,
            lockInitialized: true,
          });
          expect(hooks.findGcd(multiDims.width, multiDims.height)).toEqual(7);
          expect(state.setState.locked).toHaveBeenCalledWith({
            ...multiDims,
            minInc: { gcd, ...reducedDims },
          });
        },
      );
    });
    describe('dimensionLockHooks', () => {
      beforeEach(() => {
        state.mock();
        hook = hooks.dimensionLockHooks({ dimensions: simpleDims });
      });
      afterEach(() => {
        state.restore();
      });

      test('locked is initially null', () => {
        expect(hook.locked).toEqual(null);
      });
      test('initializeLock calls setLockInitialized with true', () => {
        hook.initializeLock();
        expect(state.setState.lockInitialized).toHaveBeenCalledWith(true);
      });
      test('lock calls lockDimensions with lockInitialized, dimensions, and setLocked', () => {
        state.mockVal(state.keys.lockInitialized, true, state.setState.lockInitialized);
        hook = hooks.dimensionLockHooks({ dimensions: simpleDims });
        const lockDimensionsSpy = jest.spyOn(hooks, hookKeys.lockDimensions);
        hook.lock();
        expect(lockDimensionsSpy).toHaveBeenCalledWith({
          dimensions: simpleDims,
          setLocked: state.setState.locked,
          lockInitialized: true,
        });
      });
      test('unlock sets locked to null', () => {
        hook = hooks.dimensionLockHooks({ dimensions: simpleDims });
        hook.unlock();
        expect(state.setState.locked).toHaveBeenCalledWith(null);
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
        state.mockVal(state.keys.dimensions, reducedDims, state.setState.local);
        hook = hooks.dimensionHooks();
        expect(hooks.dimensionLockHooks).toHaveBeenCalledWith({ dimensions: reducedDims });
      });
      test('value is tied to local state', () => {
        state.mockVal(state.keys.local, simpleDims, state.setState.local);
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
          state.mockVal(state.keys.local, simpleDims, state.setState.local);
          hooks.dimensionHooks().setHeight('23.4');
          expect(state.setState.local).toHaveBeenCalledWith({ ...simpleDims, height: 23 });
        });
      });
      describe('setWidth', () => {
        it('sets local width to int value of argument', () => {
          state.mockVal(state.keys.local, simpleDims, state.setState.local);
          hooks.dimensionHooks().setWidth('34.5');
          expect(state.setState.local).toHaveBeenCalledWith({ ...simpleDims, width: 34 });
        });
      });
      describe('updateDimensions', () => {
        it('sets local and stored dimensions to newDimensions output', () => {
          const newDimensions = (args) => ({ newDimensions: args });
          state.mockVal(state.keys.dimensions, simpleDims, state.setState.dimensions);
          state.mockVal(state.keys.locked, reducedDims, state.setState.locked);
          state.mockVal(state.keys.local, multiDims, state.setState.local);
          jest.spyOn(hooks, hookKeys.newDimensions).mockImplementationOnce(newDimensions);
          hook = hooks.dimensionHooks();
          hook.updateDimensions();
          const expected = newDimensions({
            dimensions: simpleDims,
            locked: reducedDims,
            local: multiDims,
          });
          expect(state.setState.local).toHaveBeenCalledWith(expected);
          expect(state.setState.dimensions).toHaveBeenCalledWith(expected);
        });
      });
    });
  });
  describe('altTextHooks', () => {
    it('returns value and isDecorative, along with associated setters', () => {
      state.mock();
      const value = 'myVAL';
      const isDecorative = 'IS WE Decorating?';
      state.mockVal(state.keys.altText, value, state.setState.altText);
      state.mockVal(state.keys.isDecorative, isDecorative, state.setState.isDecorative);
      hook = hooks.altTextHooks();
      expect(hook.value).toEqual(value);
      expect(hook.setValue).toEqual(state.setState.altText);
      expect(hook.isDecorative).toEqual(isDecorative);
      expect(hook.setIsDecorative).toEqual(state.setState.isDecorative);
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
