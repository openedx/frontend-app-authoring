import { useEffect, useState } from 'react';
import { history } from '@edx/frontend-platform';

export const useScrollToHashElement = ({ isLoading }: { isLoading: boolean }) => {
  const [elementWithHash, setElementWithHash] = useState<string | null>(null);

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

export const useEscapeClick = ({ onEscape, dependency }: { onEscape: () => void, dependency: any }) => {
  useEffect(() => {
    const handleEscapeClick = (event: KeyboardEvent) => {
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
 * Hook which loads next page of items on scroll
 */
export const useLoadOnScroll = (
  hasNextPage: boolean | undefined,
  isFetchingNextPage: boolean,
  fetchNextPage: () => void,
  enabled: boolean,
) => {
  useEffect(() => {
    if (enabled) {
      const onscroll = () => {
        // Verify the position of the scroll to implement an infinite scroll.
        // Used `loadLimit` to fetch next page before reach the end of the screen.
        const loadLimit = 300;
        const scrolledTo = window.scrollY + window.innerHeight;
        const scrollDiff = document.body.scrollHeight - scrolledTo;
        const isNearToBottom = scrollDiff <= loadLimit;
        if (isNearToBottom && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      };
      window.addEventListener('scroll', onscroll);
      return () => {
        window.removeEventListener('scroll', onscroll);
      };
    }
    return () => { };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
};
