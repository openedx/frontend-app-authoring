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
