import {
  useCallback,
  useState,
  useEffect,
} from 'react';
import { useSelector } from 'react-redux';

import { StrictDict, keyStore } from '../../../../../utils';
import { actions, selectors } from '../../../../../data/redux';

import {
  handleIndexTransformEvent,
  onValue,
  onChecked,
} from './handlers';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
import * as module from './hooks';

export const selectorKeys = keyStore(selectors.video);

export const state = StrictDict(
  [
    selectorKeys.videoSource,
    selectorKeys.videoId,
    selectorKeys.fallbackVideos,
    selectorKeys.allowVideoDownloads,
    selectorKeys.allowVideoSharing,

    selectorKeys.thumbnail,

    selectorKeys.transcripts,
    selectorKeys.allowTranscriptDownloads,
    selectorKeys.showTranscriptByDefault,

    selectorKeys.duration,

    selectorKeys.handout,

    selectorKeys.licenseType,
    selectorKeys.licenseDetails,
  ].reduce(
    (obj, key) => ({ ...obj, [key]: (val) => useState(val) }),
    {},
  ),
);

/**
 * updateArray(array, index, val)
 * Returns a new array with the element at <index> replaced with <val>
 * @param {any[]} array - array of values
 * @param {number} index - array index to replace
 * @param {any} val - new value
 * @return {any[]} - new array with element at index replaced with val
 */
export const updatedArray = (array, index, val) => {
  const newArray = [...array];
  newArray.splice(index, 1, val);
  return newArray;
};

/**
 * updateObject(object, index, val)
 * Returns a new object with the element at <index> replaced with <val>
 * @param {object} object - object of values
 * @param {string} index - object index to replace
 * @param {any} val - new value
 * @return {any[]} - new object with element at index replaced with val
 */
export const updatedObject = (obj, index, val) => ({ ...obj, [index]: val });

/**
 * updateFormField({ dispatch, key })(val)
 * Creates a callback to update a given form field based on an incoming value.
 * @param {func} dispatch - redux dispatch method
 * @param {string} key - form key
 * @return {func} - callback taking a value and updating the video redux field
 */
// eslint-disable-next-line react-hooks/rules-of-hooks
export const updateFormField = ({ dispatch, key }) => useCallback(
  (val) => dispatch(actions.video.updateField({ [key]: val })),
  [],
);

/**
 * valueHooks({ dispatch, key })
 * returns local and redux state associated with the given data key, as well as methods
 * to update either or both of those.
 * @param {string} key - redux video state key
 * @param {func} dispatch - redux dispatch method
 * @return {object} - hooks based on the local and redux value associated with the given key
 *   formValue - value state in redux
 *   setFormValue - sets form field in redux
 *   local - value state in hook
 *   setLocal - sets form field in hook
 *   setAll - sets form field in hook AND redux
 */
export const valueHooks = ({ dispatch, key }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const formValue = useSelector(selectors.video[key]);
  const [local, setLocal] = module.state[key](formValue);
  const setFormValue = module.updateFormField({ dispatch, key });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    setLocal(formValue);
  }, [formValue]);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const setAll = useCallback(
    (val) => {
      setLocal(val);
      setFormValue(val);
    },
    [setLocal, setFormValue],
  );
  return {
    formValue,
    local,
    setLocal,
    setFormValue,
    setAll,
  };
};

/**
 * genericWidget({ dispatch, key })
 * Returns the value-tied hooks for inputs associated with a flat value in redux
 * Tied to redux video shape based on data key
 * includes onChange, onBlur, and onCheckedChange methods.  blur and checked change
 * instantly affect both redux and local, while change (while typing) only affects
 * the local component.
 * @param {func} dispatch - redux dispatch method
 * @param {string} key - redux video shape key
 * @return {object} - state hooks
 *   formValue - value state in redux
 *   setFormValue - sets form field in redux
 *   local - value state in hook
 *   setLocal - sets form field in hook
 *   setAll - sets form field in hook AND redux
 *   onChange - handle input change by updating local state
 *   onCheckedChange - handle checked change by updating local and redux state
 *   onBlur - handle input blur by updating local and redux states
 */
export const genericWidget = ({ dispatch, key }) => {
  const {
    formValue,
    local,
    setLocal,
    setFormValue,
    setAll,
  } = module.valueHooks({ dispatch, key });
  return {
    formValue,
    local,
    setLocal,
    setAll,
    setFormValue,
    onChange: onValue(setLocal),
    onCheckedChange: onChecked(setAll),
    onBlur: onValue(setAll),
  };
};

/**
 * arrayWidget({ dispatch, key })
 * Returns the value-tied hooks for inputs associated with a value in an array in the
 * video redux shape.
 * Tied to redux video shape based on data key
 * includes onChange, onBlur, and onClear methods.  blur changes local and redux state,
 * on change affects only local state, and onClear sets both to an empty string.
 * The creators from this widget will require an index to provide the final event-handler.
 * @param {func} dispatch - redux dispatch method
 * @param {string} key - redux video shape key
 * @return {object} - state hooks
 *   formValue - value state in redux
 *   setFormValue - sets form field in redux
 *   local - value state in hook
 *   setLocal - sets form field in hook
 *   setAll - sets form field in hook AND redux
 *   onChange(index) - handle input change by updating local state
 *   onBlur(index) - handle input blur by updating local and redux states
 *   onClear(index) - handle clear event by setting value to empty string
 */
export const arrayWidget = ({ dispatch, key }) => {
  const widget = module.valueHooks({ dispatch, key });
  return {
    ...widget,
    onBlur: handleIndexTransformEvent({
      handler: onValue,
      setter: widget.setAll,
      transform: module.updatedArray,
      local: widget.local,
    }),
    onChange: handleIndexTransformEvent({
      handler: onValue,
      setter: widget.setLocal,
      transform: module.updatedArray,
      local: widget.local,
    }),
    onClear: (index) => () => widget.setAll(module.updatedArray(widget.local, index, '')),
  };
};

/**
 * objectWidget({ dispatch, key })
 * Returns the value-tied hooks for inputs associated with a value in an object in the
 * video redux shape.
 * Tied to redux video shape based on data key
 * includes onChange and onBlur methods.  blur changes local and redux state,
 * on change affects only local state.
 * The creators from this widget will require an index to provide the final event-handler.
 * @param {func} dispatch - redux dispatch method
 * @param {string} key - redux video shape key
 * @return {object} - state hooks
 *   formValue - value state in redux
 *   setFormValue - sets form field in redux
 *   local - value state in hook
 *   setLocal - sets form field in hook
 *   setAll - sets form field in hook AND redux
 *   onChange(index) - handle input change by updating local state
 *   onBlur(index) - handle input blur by updating local and redux states
 *   onClear(index) - handle clear event by setting value to empty string
 */
export const objectWidget = ({ dispatch, key }) => {
  const widget = module.valueHooks({ dispatch, key });
  return {
    ...widget,
    onChange: handleIndexTransformEvent({
      handler: onValue,
      setter: widget.setLocal,
      transform: module.updatedObject,
      local: widget.local,
    }),
    onBlur: handleIndexTransformEvent({
      handler: onValue,
      setter: widget.setAll,
      transform: module.updatedObject,
      local: widget.local,
    }),
  };
};

/**
 * widgetValues({ fields, dispatch })
 * widget value populator, that takes a fields mapping (dataKey: widgetFn) and dispatch
 * method, and returns object of widget values.
 * @param {object} fields - object with video data keys for keys and widget methods for values
 * @param {func} dispatch - redux dispatch method
 * @return {object} - { <key>: <widgetFn({ key, dispatch })> }
 */
export const widgetValues = ({ fields, dispatch }) => Object.keys(fields).reduce(
  (obj, key) => ({
    ...obj,
    [key]: fields[key]({ key, dispatch }),
  }),
  {},
);
