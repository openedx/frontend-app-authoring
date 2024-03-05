import { useEffect } from 'react';
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

export const useKeyHandler = ({ keyName, handler, dependencies = [] }) => {
  useEffect(() => {
    const checkKey = (event) => {
      if (event.key === keyName) {
        handler();
      }
    };

    window.addEventListener('keydown', checkKey);

    return () => {
      window.removeEventListener('keydown', checkKey);
    };
  }, dependencies);
};
