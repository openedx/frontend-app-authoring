/* eslint-disable */
import React from 'react';

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) { return {}; }
  const target = {};
  const sourceKeys = Object.keys(source);
  let key; let
    i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) { continue; }
    target[key] = source[key];
  }

  return target;
}

const getBoundingClientRect = function getBoundingClientRect(element) {
  const rect = element.getBoundingClientRect();
  return {
    left: Math.ceil(rect.left),
    width: Math.ceil(rect.width),
  };
};

const sortNumList = function sortNumList(arr) {
  return [].concat(arr).sort((a, b) => Number(a) - Number(b));
};

const useGetLatest = function useGetLatest(val) {
  const ref = React.useRef(val);
  ref.current = val;
  return React.useCallback(() => ref.current, []);
};

const linearInterpolator = {
  getPercentageForValue: function getPercentageForValue(val, min, max) {
    return Math.max(0, Math.min(100, (val - min) / (max - min) * 100));
  },
  getValueForClientX: function getValueForClientX(clientX, trackDims, min, max) {
    const { left } = trackDims;
    const { width } = trackDims;
    const percentageValue = (clientX - left) / width;
    const value = (max - min) * percentageValue;
    return value + min;
  },
};
function useRanger(_ref) {
  const _ref$interpolator = _ref.interpolator;
  const interpolator = _ref$interpolator === void 0 ? linearInterpolator : _ref$interpolator;
  const _ref$tickSize = _ref.tickSize;
  const tickSize = _ref$tickSize === void 0 ? 10 : _ref$tickSize;
  const { values } = _ref;
  const { min } = _ref;
  const { max } = _ref;
  const controlledTicks = _ref.ticks;
  const { steps } = _ref;
  const { onChange } = _ref;
  const { onDrag } = _ref;
  const { stepSize } = _ref;

  const _React$useState = React.useState(null);
  const activeHandleIndex = _React$useState[0];
  const setActiveHandleIndex = _React$useState[1];

  const _React$useState2 = React.useState();
  const tempValues = _React$useState2[0];
  const setTempValues = _React$useState2[1];

  const getLatest = useGetLatest({
    activeHandleIndex,
    onChange,
    onDrag,
    values,
    tempValues,
  });
  const trackElRef = React.useRef();
  const getValueForClientX = React.useCallback((clientX) => {
    const trackDims = getBoundingClientRect(trackElRef.current);
    return interpolator.getValueForClientX(clientX, trackDims, min, max);
  }, [interpolator, max, min]);
  const getNextStep = React.useCallback((val, direction) => {
    if (steps) {
      const currIndex = steps.indexOf(val);
      const nextIndex = currIndex + direction;

      if (nextIndex >= 0 && nextIndex < steps.length) {
        return steps[nextIndex];
      }
      return val;
    }
    if (process.env.NODE_ENV !== 'production') {
      if (typeof stepSize === 'undefined') {
        throw new Error('Warning: The option `stepSize` is expected in `useRanger`, but its value is `undefined`');
      }
    }

    const nextVal = val + stepSize * direction;

    if (nextVal >= min && nextVal <= max) {
      return nextVal;
    }
    return val;
  }, [max, min, stepSize, steps]);
  const roundToStep = React.useCallback((val) => {
    let left = min;
    let right = max;

    if (steps) {
      steps.forEach((step) => {
        if (step <= val && step > left) {
          left = step;
        }

        if (step >= val && step < right) {
          right = step;
        }
      });
    } else {
      if (process.env.NODE_ENV !== 'production') {
        if (typeof stepSize === 'undefined') {
          throw new Error('Warning: The option `stepSize` is expected in `useRanger`, but its value is `undefined`');
        }
      }

      while (left < val && left + stepSize < val) {
        left += stepSize;
      }

      right = Math.min(left + stepSize, max);
    }

    if (val - left < right - val) {
      return left;
    }

    return right;
  }, [max, min, stepSize, steps]);
  const handleDrag = React.useCallback((e) => {
    const _getLatest = getLatest();
    const { activeHandleIndex } = _getLatest;
    const { onDrag } = _getLatest;

    const clientX = e.type === 'touchmove' ? e.changedTouches[0].clientX : e.clientX;
    const newValue = getValueForClientX(clientX);
    const newRoundedValue = roundToStep(newValue);
    const newValues = []
      .concat(values.slice(0, activeHandleIndex), [newRoundedValue], values.slice(activeHandleIndex + 1));

    if (onDrag) {
      onDrag(newValues);
    } else {
      setTempValues(newValues);
    }
  }, [getLatest, getValueForClientX, roundToStep, values]);
  const handleKeyDown = React.useCallback((e, i) => {
    const _getLatest2 = getLatest();
    const { values } = _getLatest2;
    const _getLatest2$onChange = _getLatest2.onChange;
    const onChange = _getLatest2$onChange === void 0
      ? function () {} : _getLatest2$onChange; // Left Arrow || Right Arrow

    if (e.keyCode === 37 || e.keyCode === 39) {
      setActiveHandleIndex(i);
      const direction = e.keyCode === 37 ? -1 : 1;
      const newValue = getNextStep(values[i], direction);
      const newValues = [].concat(values.slice(0, i), [newValue], values.slice(i + 1));
      const sortedValues = sortNumList(newValues);
      onChange(sortedValues);
    }
  }, [getLatest, getNextStep]);
  const handlePress = React.useCallback((e, i) => {
    setActiveHandleIndex(i);

    const handleRelease = function handleRelease(e) {
      const _getLatest3 = getLatest();
      const { tempValues } = _getLatest3;
      const { values } = _getLatest3;
      const _getLatest3$onChange = _getLatest3.onChange;
      const onChange = _getLatest3$onChange === void 0 ? function () {} : _getLatest3$onChange;
      const _getLatest3$onDrag = _getLatest3.onDrag;
      const onDrag = _getLatest3$onDrag === void 0 ? function () {} : _getLatest3$onDrag;

      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('touchmove', handleDrag);
      document.removeEventListener('mouseup', handleRelease);
      document.removeEventListener('touchend', handleRelease);
      const sortedValues = sortNumList(tempValues || values);
      onChange(sortedValues);
      onDrag(sortedValues);
      setActiveHandleIndex(null);
      setTempValues();
    };

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('touchmove', handleDrag);
    document.addEventListener('mouseup', handleRelease);
    document.addEventListener('touchend', handleRelease);
  }, [getLatest, handleDrag]);
  const getPercentageForValue = React.useCallback((val) =>
    interpolator.getPercentageForValue(val, min, max), [interpolator, max, min]); // Build the ticks

  const ticks = React.useMemo(() => {
    let ticks = controlledTicks || steps;

    if (!ticks) {
      ticks = [min];

      while (ticks[ticks.length - 1] < max - tickSize) {
        ticks.push(ticks[ticks.length - 1] + tickSize);
      }

      ticks.push(max);
    }

    return ticks.map((value, i) => ({
      value,
      getTickProps: function getTickProps(_temp) {
        const _ref2 = _temp === void 0 ? {} : _temp;
        const _ref2$key = _ref2.key;
        const key = _ref2$key === void 0 ? i : _ref2$key;
        const _ref2$style = _ref2.style;
        const style = _ref2$style === void 0 ? {} : _ref2$style;
        const rest = _objectWithoutPropertiesLoose(_ref2, ['key', 'style']);

        return {
          key,
          style: {
            position: 'absolute',
            width: 0,
            left: `${getPercentageForValue(value) }%`,
            transform: 'translateX(-50%)',
            ...style,
          },
          ...rest,
        };
      },
    }));
  }, [controlledTicks, getPercentageForValue, max, min, steps, tickSize]);
  const segments = React.useMemo(() => {
    const sortedValues = sortNumList(tempValues || values);
    return [].concat(sortedValues, [max]).map((value, i) => ({
      value,
      getSegmentProps: function getSegmentProps(_temp2) {
        const _ref3 = _temp2 === void 0 ? {} : _temp2;
        const _ref3$key = _ref3.key;
        const key = _ref3$key === void 0 ? i : _ref3$key;
        const _ref3$style = _ref3.style;
        const style = _ref3$style === void 0 ? {} : _ref3$style;
        const rest = _objectWithoutPropertiesLoose(_ref3, ['key', 'style']);

        const left = getPercentageForValue(sortedValues[i - 1] ? sortedValues[i - 1] : min);
        const width = getPercentageForValue(value) - left;
        return {
          key,
          style: {
            position: 'absolute',
            left: `${left }%`,
            width: `${width }%`,
            ...style,
          },
          ...rest,
        };
      },
    }));
  }, [getPercentageForValue, max, min, tempValues, values]);
  const handles = React.useMemo(() => (tempValues || values).map((value, i) => ({
    value,
    active: i === activeHandleIndex,
    getHandleProps: function getHandleProps(_temp3) {
      const _ref4 = _temp3 === void 0 ? {} : _temp3;
      const _ref4$key = _ref4.key;
      const key = _ref4$key === void 0 ? i : _ref4$key;
      const { ref } = _ref4;
      const _ref4$innerRef = _ref4.innerRef;
      const _onKeyDown = _ref4.onKeyDown;
      const _onMouseDown = _ref4.onMouseDown;
      const _onTouchStart = _ref4.onTouchStart;
      const _ref4$style = _ref4.style;
      const style = _ref4$style === void 0 ? {} : _ref4$style;
      const rest = _objectWithoutPropertiesLoose(_ref4, [
        'key', 'ref', 'innerRef', 'onKeyDown', 'onMouseDown', 'onTouchStart', 'style',
      ]);

      return {
        key,
        onKeyDown: function onKeyDown(e) {
          e.persist();
          handleKeyDown(e, i);
          if (_onKeyDown) { _onKeyDown(e); }
        },
        onMouseDown: function onMouseDown(e) {
          e.persist();
          handlePress(e, i);
          if (_onMouseDown) { _onMouseDown(e); }
        },
        onTouchStart: function onTouchStart(e) {
          e.persist();
          handlePress(e, i);
          if (_onTouchStart) { _onTouchStart(e); }
        },
        role: 'slider',
        'aria-valuemin': min,
        'aria-valuemax': max,
        'aria-valuenow': value,
        style: {
          position: 'absolute',
          top: '50%',
          left: `${getPercentageForValue(value) }%`,
          zIndex: i === activeHandleIndex ? '1' : '0',
          transform: 'translate(-50%, -50%)',
          ...style,
        },
        ...rest,
      };
    },
  })), [activeHandleIndex, getPercentageForValue, handleKeyDown, handlePress, min, max, tempValues, values]);

  const getTrackProps = function getTrackProps(_temp4) {
    const _ref5 = _temp4 === void 0 ? {} : _temp4;
    const _ref5$style = _ref5.style;
    const style = _ref5$style === void 0 ? {} : _ref5$style;
    const _ref6 = _ref5.ref;
    const rest = _objectWithoutPropertiesLoose(_ref5, ['style', 'ref']);

    return {
      ref: function ref(el) {
        trackElRef.current = el;

        if (_ref6) {
          if (typeof _ref6 === 'function') {
            _ref6(el);
          } else {
            _ref6.current = el;
          }
        }
      },
      style: {
        position: 'relative',
        userSelect: 'none',
        ...style,
      },
      ...rest,
    };
  };

  return {
    activeHandleIndex,
    getTrackProps,
    ticks,
    segments,
    handles,
  };
}

export { useRanger };
