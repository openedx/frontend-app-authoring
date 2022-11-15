import { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { keyStore } from '../../../../../utils';
import { actions, selectors } from '../../../../../data/redux';
import { MockUseState } from '../../../../../../testUtils';

import * as duration from './duration';
import * as handlers from './handlers';
import * as hooks from './hooks';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useState: (val) => ({ useState: val }),
  useEffect: jest.fn(),
  useCallback: jest.fn((cb, prereqs) => ({ useCallback: { cb, prereqs } })),
  useMemo: jest.fn((cb, prereqs) => ({ useMemo: { cb, prereqs } })),
}));

jest.mock('./duration', () => ({
  onDurationChange: jest.fn(value => ({ onDurationChange: value })),
  onDurationKeyDown: jest.fn(value => ({ onDurationKeyDown: value })),
  updateDuration: jest.fn(value => ({ updateDuration: value })),
  durationValue: jest.fn(value => ({ durationValue: value })),
}));

jest.mock('./handlers', () => ({
  handleIndexEvent: jest.fn(args => ({ handleIndexEvent: args })),
  handleIndexTransformEvent: jest.fn(args => ({ handleIndexTransformEvent: args })),
  onValue: jest.fn(cb => ({ onValue: cb })),
  onChecked: jest.fn(cb => ({ onChecked: cb })),
  onEvent: jest.fn(cb => ({ onEvent: cb })),
}));

jest.mock('../../../../../data/redux', () => ({
  actions: {
    video: {
      updateField: (val) => ({ updateField: val }),
    },
  },
  selectors: {
    video: {
      videoSource: (state) => ({ videoSource: state }),
      fallbackVideos: (state) => ({ fallbackVideos: state }),
      allowVideoDownloads: (state) => ({ allowVideoDownloads: state }),
      thumbnail: (state) => ({ thumbnail: state }),
      transcripts: (state) => ({ transcripts: state }),
      allowTranscriptDownloads: (state) => ({ allowTranscriptDownloads: state }),
      showTranscriptByDefault: (state) => ({ showTranscriptByDefault: state }),
      duration: (state) => ({ duration: state }),
      handout: (state) => ({ handout: state }),
      licenseType: (state) => ({ licenseType: state }),
      licenseDetails: (state) => ({ licenseDetails: state }),
    },
  },
}));

const keys = {
  duration: keyStore(duration),
  handlers: keyStore(handlers),
  hooks: keyStore(hooks),
  selectors: hooks.selectorKeys,
};

const state = new MockUseState(hooks);
const testValue = 'my-test-value';
const testValue2 = 'my-test-value-2';
const testKey = keys.selectors.handout;
const dispatch = jest.fn(val => ({ dispatch: val }));

let out;

describe('Video Settings modal hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('state hooks', () => {
    state.testGetter(state.keys.videoSource);
    state.testGetter(state.keys.fallbackVideos);
    state.testGetter(state.keys.allowVideoDownloads);

    state.testGetter(state.keys.thumbnail);

    state.testGetter(state.keys.transcripts);
    state.testGetter(state.keys.allowTranscriptDownloads);
    state.testGetter(state.keys.showTranscriptByDefault);

    state.testGetter(state.keys.duration);

    state.testGetter(state.keys.handout);

    state.testGetter(state.keys.licenseType);
    state.testGetter(state.keys.licenseDetails);
  });
  describe('non-state hooks', () => {
    beforeEach(() => state.mock());
    afterEach(() => state.restore());
    describe('updatedArray', () => {
      it('returns a new array with the given index replaced', () => {
        const testArray = ['0', '1', '2', '3', '4'];
        const oldArray = [...testArray];
        expect(hooks.updatedArray(testArray, 3, testValue)).toEqual(
          ['0', '1', '2', testValue, '4'],
        );
        expect(testArray).toEqual(oldArray);
      });
    });
    describe('updatedObject', () => {
      it('returns a new object with the given index replaced', () => {
        const testObj = { some: 'data', [testKey]: testValue };
        const oldObj = { ...testObj };
        expect(hooks.updatedObject(testObj, testKey, testValue2)).toEqual(
          { ...testObj, [testKey]: testValue2 },
        );
        expect(testObj).toEqual(oldObj);
      });
    });
    describe('updateFormField', () => {
      it('returns a memoized callback that is only created once', () => {
        expect(hooks.updateFormField({ dispatch, key: testKey }).useCallback.prereqs).toEqual([]);
      });
      it('returns memoized callback that dispaches updateField with val on the given key', () => {
        hooks.updateFormField({ dispatch, key: testKey }).useCallback.cb(testValue);
        expect(dispatch).toHaveBeenCalledWith(actions.video.updateField({
          [testKey]: testValue,
        }));
      });
    });
    describe('currentValue', () => {
      it('returns duration display of form value if is duration key', () => {
        expect(
          hooks.currentValue({ key: keys.selectors.duration, formValue: testValue }),
        ).toEqual(duration.durationValue(testValue));
      });
      it('returns the raw formValue by default', () => {
        expect(
          hooks.currentValue({ key: testKey, formValue: testValue }),
        ).toEqual(testValue);
      });
    });
    describe('valueHooks', () => {
      let formValue;
      beforeEach(() => {
        formValue = useSelector(selectors.video[testKey]);
      });
      describe('behavior', () => {
        describe('initialization', () => {
          test('useEffect memoized on formValue', () => {
            hooks.valueHooks({ dispatch, key: testKey });
            expect(useEffect).toHaveBeenCalled();
            expect(useEffect.mock.calls[0][1]).toEqual([formValue]);
          });
          test('calls setLocal with durationValue(formValue) if is duration', () => {
            hooks.valueHooks({ dispatch, key: keys.selectors.duration });
            useEffect.mock.calls[0][0]();
            expect(state.setState[keys.selectors.duration]).toHaveBeenCalledWith(
              duration.durationValue(useSelector(selectors.video.duration)),
            );
          });
          test('calls setLocal with formValue by default', () => {
            hooks.valueHooks({ dispatch, key: testKey });
            useEffect.mock.calls[0][0]();
            expect(state.setState[testKey]).toHaveBeenCalledWith(formValue);
          });
        });
      });
      describe('returned object', () => {
        const mockCurrentValue = (args) => ({ currentValue: args });
        const mockUpdateFormField = (args) => jest.fn(
          (val) => ({ updateFormField: { args, val } }),
        );
        beforeEach(() => {
          jest.spyOn(hooks, keys.hooks.currentValue)
            .mockImplementationOnce(mockCurrentValue);
          jest.spyOn(hooks, keys.hooks.updateFormField)
            .mockImplementationOnce(mockUpdateFormField);
          out = hooks.valueHooks({ dispatch, key: testKey });
        });
        test('formValue from selectors.video[key]', () => {
          expect(out.formValue).toEqual(useSelector(selectors.video[testKey]));
        });
        describe('local and setLocal', () => {
          test('keyed to state, initialized with memo of currentValue that never updates', () => {
            const { local, setLocal } = out;
            expect(local.useMemo.cb()).toEqual(mockCurrentValue({ key: testKey, formValue }));
            expect(local.useMemo.prereqs).toEqual([]);
            setLocal(testValue);
            expect(state.setState[testKey]).toHaveBeenCalledWith(testValue);
          });
        });
        test('setFormValue forwarded from module', () => {
          expect(out.setFormValue(testValue)).toEqual(
            mockUpdateFormField({ dispatch, key: testKey })(testValue),
          );
        });
        describe('setAll', () => {
          it('returns a memoized callback based on setLocal and setFormValue', () => {
            expect(out.setAll.useCallback.prereqs).toEqual([out.setLocal, out.setFormValue]);
          });
          it('calls setLocal and setFormValue with the passed value', () => {
            out.setAll.useCallback.cb(testValue);
            expect(out.setLocal).toHaveBeenCalledWith(testValue);
            expect(out.setFormValue).toHaveBeenCalledWith(testValue);
          });
        });
      });
    });
    describe('genericWidget', () => {
      const valueProps = {
        formValue: '123',
        local: 23,
        setLocal: jest.fn(),
        setFormValue: jest.fn(),
        setAll: jest.fn(),
      };
      beforeEach(() => {
        jest.spyOn(hooks, keys.hooks.valueHooks).mockReturnValueOnce(valueProps);
        out = hooks.genericWidget({ dispatch, key: testKey });
      });
      describe('returned object', () => {
        it('forwards formValue and local from valueHooks', () => {
          expect(hooks.valueHooks).toHaveBeenCalledWith({ dispatch, key: testKey });
          expect(out.formValue).toEqual(valueProps.formValue);
          expect(out.local).toEqual(valueProps.local);
        });
        test('setFormValue mapped to valueHooks.setFormValue', () => {
          expect(out.setFormValue).toEqual(valueProps.setFormValue);
        });
        test('onChange mapped to handlers.onValue(valueHooks.setLocal)', () => {
          expect(out.onChange).toEqual(handlers.onValue(valueProps.setLocal));
        });
        test('onCheckedChange mapped to handlers.onChecked(valueHooks.setAll)', () => {
          expect(out.onCheckedChange).toEqual(handlers.onChecked(valueProps.setAll));
        });
        test('onBlur mapped to handlers.onValue(valueHooks.setAll)', () => {
          expect(out.onBlur).toEqual(handlers.onValue(valueProps.setAll));
        });
      });
    });
    describe('non-generic widgets', () => {
      const widgetValues = {
        formValue: '123',
        local: 23,
        setLocal: jest.fn(),
        setFormValue: jest.fn(),
        setAll: jest.fn(),
      };
      let valueHooksSpy;
      beforeEach(() => {
        valueHooksSpy = jest.spyOn(hooks, keys.hooks.valueHooks).mockReturnValue(widgetValues);
      });
      afterEach(() => {
        valueHooksSpy.mockRestore();
      });
      describe('arrayWidget', () => {
        const mockUpdatedArray = (...args) => ({ updatedArray: args });
        let arraySpy;
        beforeEach(() => {
          arraySpy = jest.spyOn(hooks, keys.hooks.updatedArray)
            .mockImplementation(mockUpdatedArray);
          out = hooks.arrayWidget({ dispatch, key: testKey });
        });
        afterEach(() => {
          arraySpy.mockRestore();
        });
        it('forwards widget values', () => {
          expect(out.formValue).toEqual(widgetValues.formValue);
          expect(out.local).toEqual(widgetValues.local);
        });
        it('overrides onChange with handleIndexTransformEvent', () => {
          expect(out.onChange).toEqual(handlers.handleIndexTransformEvent({
            handler: handlers.onValue,
            setter: widgetValues.setLocal,
            transform: arraySpy,
            local: widgetValues.local,
          }));
        });
        it('overrides onBlur with handleIndexTransformEvent', () => {
          expect(out.onBlur).toEqual(handlers.handleIndexTransformEvent({
            handler: handlers.onValue,
            setter: widgetValues.setAll,
            transform: arraySpy,
            local: widgetValues.local,
          }));
        });
        it('adds onClear event that calls setAll with empty string', () => {
          out.onClear(testKey)();
          expect(widgetValues.setAll).toHaveBeenCalledWith(
            arraySpy(widgetValues.local, testKey, ''),
          );
        });
      });
      describe('objectWidget', () => {
        beforeEach(() => {
          out = hooks.objectWidget({ dispatch, key: testKey });
        });
        it('forwards widget values', () => {
          expect(out.formValue).toEqual(widgetValues.formValue);
          expect(out.local).toEqual(widgetValues.local);
        });
        it('overrides onChange with handleIndexTransformEvent', () => {
          expect(out.onChange).toEqual(handlers.handleIndexTransformEvent({
            handler: handlers.onValue,
            setter: widgetValues.setLocal,
            transform: hooks.updatedObject,
            local: widgetValues.local,
          }));
        });
        it('overrides onBlur with handleIndexTransformEvent', () => {
          expect(out.onBlur).toEqual(handlers.handleIndexTransformEvent({
            handler: handlers.onValue,
            setter: widgetValues.setAll,
            transform: hooks.updatedObject,
            local: widgetValues.local,
          }));
        });
      });
      describe('durationWidget', () => {
        beforeEach(() => {
          out = hooks.durationWidget({ dispatch });
        });
        it('forwards widget values', () => {
          expect(out.formValue).toEqual(widgetValues.formValue);
          expect(out.local).toEqual(widgetValues.local);
        });
        describe('onBlur', () => {
          test('memoized callback based on formValue, local, and setFormValue from widget', () => {
            expect(out.onBlur.useCallback.prereqs).toEqual(
              [widgetValues.formValue, widgetValues.local, widgetValues.setFormField],
            );
          });
          test('calls handleIndexEvent with updateDuration', () => {
            expect(out.onBlur.useCallback.cb).toEqual(
              handlers.handleIndexEvent({
                handler: handlers.onValue,
                transform: duration.updateDuration(widgetValues),
              }),
            );
          });
        });
        describe('onChange', () => {
          test('memoized callback based on local from widget', () => {
            expect(out.onChange.useCallback.prereqs).toEqual([widgetValues.local]);
          });
          test('calls handleIndexTransformEvent with setLocal', () => {
            expect(out.onChange.useCallback.cb).toEqual(
              handlers.handleIndexTransformEvent({
                handler: handlers.onValue,
                setter: widgetValues.setLocal,
                transform: duration.onDurationChange,
                local: widgetValues.local,
              }),
            );
          });
        });
        describe('onKeyDown', () => {
          test('memoized callback based on local from widget', () => {
            expect(out.onKeyDown.useCallback.prereqs).toEqual([widgetValues.local]);
          });
          test('calls handleIndexTransformEvent with setLocal', () => {
            expect(out.onKeyDown.useCallback.cb).toEqual(
              handlers.handleIndexTransformEvent({
                handler: handlers.onEvent,
                setter: widgetValues.setLocal,
                transform: duration.onDurationKeyDown,
                local: widgetValues.local,
              }),
            );
          });
        });
      });
    });
    describe('widgetValues', () => {
      describe('returned object', () => {
        test('shaped to the fields object, where each value is called with key and dispatch', () => {
          const testKeys = ['1', '24', '23gsa'];
          const fieldMethods = [
            jest.fn(v => ({ v1: v })),
            jest.fn(v => ({ v2: v })),
            jest.fn(v => ({ v3: v })),
          ];
          const fields = testKeys.reduce((obj, key, index) => ({
            ...obj,
            [key]: fieldMethods[index],
          }), {});
          const expected = testKeys.reduce((obj, key, index) => ({
            ...obj,
            [key]: fieldMethods[index]({ key, dispatch }),
          }), {});
          expect(hooks.widgetValues({ fields, dispatch })).toMatchObject(expected);
        });
      });
    });
  });
});
