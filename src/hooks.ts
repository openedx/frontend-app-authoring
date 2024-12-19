import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { history } from '@edx/frontend-platform';
import { useLocation, useSearchParams } from 'react-router-dom';

export const useScrollToHashElement = ({ isLoading }: { isLoading: boolean }) => {
  const [elementWithHash, setElementWithHash] = useState<string | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const currentHash = window.location.hash.substring(1);

    if (currentHash) {
      const element = document.getElementById(currentHash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        history.replace({ pathname, hash: '' });
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
      const canFetchNextPage = hasNextPage && !isFetchingNextPage;
      // Used `loadLimit` to fetch next page before reach the end of the screen.
      const loadLimit = 300;

      const onscroll = () => {
        // Verify the position of the scroll to implement an infinite scroll.
        const scrolledTo = window.scrollY + window.innerHeight;
        const scrollDiff = document.body.scrollHeight - scrolledTo;
        const isNearToBottom = scrollDiff <= loadLimit;
        if (isNearToBottom && canFetchNextPage) {
          fetchNextPage();
        }
      };
      window.addEventListener('scroll', onscroll);

      // If the content is less than the screen height, fetch the next page.
      const hasNoScroll = (document.body.scrollHeight - loadLimit) <= window.innerHeight;
      if (hasNoScroll && canFetchNextPage) {
        fetchNextPage();
      }

      return () => {
        window.removeEventListener('scroll', onscroll);
      };
    }
    return () => { };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
};

/**
 * Hook which stores state variables in the URL search parameters.
 *
 * It wraps useState with functions that get/set a query string
 * search parameter when returning/setting the state variable.
 *
 * @param defaultValue: Type
 *   Returned when no valid value is found in the url search parameter.
 * @param paramName: name of the url search parameter to store this value in.
 * @param fromString: returns the Type equivalent of the given string value,
 *   or undefined if the value is invalid.
 * @param toString: returns the string equivalent of the given Type value.
 *   Return defaultValue to clear the url search paramName.
 */
export function useStateWithUrlSearchParam<Type>(
  defaultValue: Type,
  paramName: string,
  fromString: (value: string | null) => Type | undefined,
  toString: (value: Type) => string | undefined,
): [value: Type, setter: Dispatch<SetStateAction<Type>>] {
  const [searchParams, setSearchParams] = useSearchParams();
  const returnValue: Type = fromString(searchParams.get(paramName)) ?? defaultValue;
  // Function to update the url search parameter
  const returnSetter: Dispatch<SetStateAction<Type>> = useCallback((value: Type) => {
    setSearchParams((prevParams) => {
      const paramValue: string = toString(value) ?? '';
      const newSearchParams = new URLSearchParams(prevParams);
      // If using the default paramValue, remove it from the search params.
      if (paramValue === defaultValue) {
        newSearchParams.delete(paramName);
      } else {
        newSearchParams.set(paramName, paramValue);
      }
      return newSearchParams;
    }, { replace: true });
  }, [setSearchParams]);

  // Return the computed value and wrapped set state function
  return [returnValue, returnSetter];
}
