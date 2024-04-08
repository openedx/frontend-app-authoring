import { useEffect } from 'react';
import { history } from '@edx/frontend-platform';

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
