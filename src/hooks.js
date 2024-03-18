import { useEffect, useState } from 'react';
import { history } from '@edx/frontend-platform';

// eslint-disable-next-line import/prefer-default-export
export const useScrollToHashElement = ({ isLoading }) => {
  const [elementWithHash, setElementWithHash] = useState(null);

  useEffect(() => {
    const currentHash = window.location.hash.substring(1);

    if (currentHash) {
      const element = document.getElementById(currentHash);
      if (element) {
        element.scrollIntoView();
        history.replace({ hash: '' });
      }
      setElementWithHash(currentHash);
    }
  }, [isLoading]);

  return { elementWithHash };
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
