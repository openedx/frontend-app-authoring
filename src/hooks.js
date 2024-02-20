import { useEffect, useState } from 'react';
import { history } from '@edx/frontend-platform';

// eslint-disable-next-line import/prefer-default-export
export const useScrollToHashElement = ({ isLoading }) => {
  useEffect(() => {
    const currentHash = window.location.hash;

    if (currentHash) {
      const element = document.querySelector(currentHash);

      if (element) {
        element.scrollIntoView();
        history.replace({ hash: '' });
      }
    }
  }, [isLoading]);
};

export const useEscapeClick = ({ onEscape, dependency }) => {
  useEffect(() => {
    const handleEscapeClick = (event) => {
      if (event.key === 'Escape') {
        onEscape();
      }
    };

    window.addEventListener('keydown', handleEscapeClick);

    return () => {
      window.removeEventListener('keydown', handleEscapeClick);
    };
  }, [dependency]);
};

/**
 * Custom hook to debounce a string value.
 *
 * @param {string} value - The string value to be debounced.
 * @param {number} [delay=500] - The delay in milliseconds before updating the debounced value.
 * @returns {string} The debounced string value.
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};
