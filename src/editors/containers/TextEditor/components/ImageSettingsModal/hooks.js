import React from 'react';

import { StrictDict } from '../../../../utils';
import * as module from './hooks';

// Simple wrappers for useState to allow easy mocking for tests.
export const state = {
  dimensions: (val) => React.useState(val),
  locked: (val) => React.useState(val),
  local: (val) => React.useState(val),
  lockInitialized: (val) => React.useState(val),
  altText: (val) => React.useState(val),
  isDecorative: (val) => React.useState(val),
};

export const dimKeys = StrictDict({
  height: 'height',
  width: 'width',
});

/**
 * findGcd(numerator, denominator)
 * Find the greatest common denominator of a ratio or fraction.
 * @param {number} numerator - ratio numerator
 * @param {number} denominator - ratio denominator
 * @return {number} - ratio greatest common denominator
 */
export const findGcd = (a, b) => (b ? findGcd(b, a % b) : a);
const checkEqual = (d1, d2) => (d1.height === d2.height && d1.width === d2.width);

/**
 * getValidDimensions({ dimensions, local, locked })
 * Find valid ending dimensions based on start state, request, and lock state
 * @param {obj} dimensions - current stored dimensions
 * @param {obj} local - local (active) dimensions in the inputs
 * @param {obj} locked - locked dimensions
 * @return {obj} - output dimensions after move ({ height, width })
 */
export const getValidDimensions = ({
  dimensions,
  local,
  locked,
}) => {
  const out = {};
  let iter;
  const { minInc } = locked;
  const isMin = dimensions.height === minInc.height;

  const keys = (local.height !== dimensions.height)
    ? { changed: dimKeys.height, other: dimKeys.width }
    : { changed: dimKeys.width, other: dimKeys.height };

  const direction = local[keys.changed] > dimensions[keys.changed] ? 1 : -1;

  // don't move down if already at minimum size
  if (direction < 0 && isMin) { return dimensions; }
  // find closest valid iteration of the changed field
  iter = Math.max(Math.round(local[keys.changed] / minInc[keys.changed]), 1);
  // if closest valid iteration is current iteration, move one iteration in the change direction
  if (iter === (dimensions[keys.changed] / minInc[keys.changed])) { iter += direction; }

  out[keys.changed] = iter * minInc[keys.changed];
  out[keys.other] = out[keys.changed] * (locked[keys.other] / locked[keys.changed]);

  return out;
};

/**
 * newDimensions({ dimensions, local, locked })
 * Returns the local dimensions if unlocked or unchanged, and otherwise returns new valid
 * dimensions.
 * @param {obj} dimensions - current stored dimensions
 * @param {obj} local - local (active) dimensions in the inputs
 * @param {obj} locked - locked dimensions
 * @return {obj} - output dimensions after attempted move ({ height, width })
 */
export const newDimensions = ({ dimensions, local, locked }) => (
  (!locked || checkEqual(local, dimensions))
    ? local
    : module.getValidDimensions({ dimensions, local, locked })
);

/**
 * lockDimensions({ dimensions, lockInitialized, setLocked })
 * Lock dimensions if lock initialized.  Store minimum valid increment on lock so
 * that we don't have re-compute.
 * @param {obj} dimensions - current stored dimensions
 * @param {bool} lockInitialized - has the lock state initialized?
 * @param {func} setLocked - set lock state
 */
export const lockDimensions = ({ dimensions, lockInitialized, setLocked }) => {
  if (!lockInitialized) { return; }

  // find minimum viable increment
  let gcd = findGcd(dimensions.width, dimensions.height);
  if ([dimensions.width, dimensions.height].some(v => !Number.isInteger(v / gcd))) {
    gcd = 1;
  }
  const minInc = { width: dimensions.width / gcd, height: dimensions.height / gcd, gcd };
  setLocked({ ...dimensions, minInc });
};

/**
 * dimensionLockHooks({ dimensions })
 * Returns a set of hooks pertaining to the dimension locks.
 * Locks the dimensions initially, on lock initialization.
 * @param {obj} dimensions - current stored dimensions
 * @return {obj} - dimension lock hooks
 *   {func} initializeLock - enable the lock mechanism
 *   {obj} locked - current locked state
 *   {func} lock - lock the current dimensions
 *   {func} unlock - unlock the dimensions
 */
export const dimensionLockHooks = ({ dimensions }) => {
  const [locked, setLocked] = module.state.locked(null);
  const [lockInitialized, setLockInitialized] = module.state.lockInitialized(null);
  const lock = () => module.lockDimensions({ lockInitialized, dimensions, setLocked });

  React.useEffect(lock, [lockInitialized]);

  return {
    initializeLock: () => setLockInitialized(true),
    locked,
    lock,
    unlock: () => setLocked(null),
  };
};

/**
 * dimensionHooks()
 * Returns an object of dimension-focused react hooks.
 * @return {obj} - dimension hooks
 *   {func} onImgLoad - initializes image dimension fields
 *     @param {object} selection - selected image object with possible override dimensions.
 *     @return {callback} - image load event callback that loads dimensions.
 *   {object} locked - current locked state
 *   {func} lock - lock current dimensions
 *   {func} unlock - unlock dimensions
 *   {object} value - current dimension values
 *   {func} setHeight - set height
 *     @param {string} - new height string
 *   {func} setWidth - set width
 *     @param {string} - new width string
 *   {func} updateDimensions - set dimensions based on state
 */
export const dimensionHooks = () => {
  const [dimensions, setDimensions] = module.state.dimensions(null);
  const [local, setLocal] = module.state.local(null);
  const setAll = (value) => {
    setDimensions(value);
    setLocal(value);
  };
  const {
    initializeLock,
    lock,
    locked,
    unlock,
  } = module.dimensionLockHooks({ dimensions });
  return {
    onImgLoad: (selection) => ({ target: img }) => {
      setAll({
        height: selection.height || img.naturalHeight,
        width: selection.width || img.naturalWidth,
      });
      initializeLock();
    },
    locked,
    lock,
    unlock,
    value: local,
    setHeight: (height) => setLocal({ ...local, height: parseInt(height, 10) }),
    setWidth: (width) => setLocal({ ...local, width: parseInt(width, 10) }),
    updateDimensions: () => setAll(module.newDimensions({ dimensions, local, locked })),
  };
};

/**
 * altTextHooks(savedText)
 * Returns a set of react hooks focused around alt text
 * @return {obj} - alt text hooks
 *   {string} value - alt text value
 *   {func} setValue - set alt test value
 *     @param {string} - new alt text
 *   {bool} isDecorative - is the image decorative?
 *   {func} setIsDecorative - set isDecorative field
 *     @param {bool} isDecorative
 */
export const altTextHooks = (savedText) => {
  const [value, setValue] = module.state.altText(savedText || '');
  const [isDecorative, setIsDecorative] = module.state.isDecorative(false);
  return {
    value,
    setValue,
    isDecorative,
    setIsDecorative,
  };
};

/**
 * onInputChange(handleValue)
 * Simple event handler forwarding the event target value to a given callback
 * @param {func} handleValue - event value handler
 * @return {func} - evt callback that will call handleValue with the event target value.
 */
export const onInputChange = (handleValue) => (e) => handleValue(e.target.value);

/**
 * onCheckboxChange(handleValue)
 * Simple event handler forwarding the event target checked prop to a given callback
 * @param {func} handleValue - event value handler
 * @return {func} - evt callback that will call handleValue with the event target checked prop.
 */
export const onCheckboxChange = (handleValue) => (e) => handleValue(e.target.checked);

/**
 * onSave({ altText, dimensions, isDecorative, saveToEditor })
 * Handle saving the image context to the text editor
 * @param {string} altText - image alt text
 * @param {object} dimension - image dimensions ({ width, height })
 * @param {bool} isDecorative - is the image decorative?
 * @param {func} saveToEditor - save method for submitting image settings.
 */
export const onSaveClick = ({
  altText,
  dimensions,
  isDecorative,
  saveToEditor,
}) => () => saveToEditor({
  altText,
  dimensions,
  isDecorative,
});

/**
 * isSaveDisabled(altText)
 * Returns true the save button should be disabled (altText is missing and not decorative)
 * @param {object} altText - altText hook object
 *   {bool} isDecorative - is the image decorative?
 *   {string} value - alt text value
 * @return {bool} - should the save button be disabled?
 */
export const isSaveDisabled = (altText) => !altText.isDecorative && (altText.value === '');

export default {
  altText: altTextHooks,
  dimensions: dimensionHooks,
  isSaveDisabled,
  onCheckboxChange,
  onInputChange,
  onSaveClick,
};
