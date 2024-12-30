import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
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
 * Types used by the useStateWithUrlSearchParam hook.
 */
export type FromStringFn<Type> = (value: string | null) => Type | undefined;
export type ToStringFn<Type> = (value: Type | undefined) => string | undefined;

/**
 * Hook that stores/retrieves state variables using the URL search parameters.
 * This function is overloaded to accept simple Types or Array<Type> values.
 *
 * @param defaultValue: Type | Type[]
 *   Returned when no valid value is found in the url search parameter.
 *   If an Array Type is used, then an Array Type of state values will be maintained.
 * @param paramName: name of the url search parameter to store this value in.
 * @param fromString: returns the Type equivalent of the given string value,
 *   or undefined if the value is invalid.
 * @param toString: returns the string equivalent of the given Type value.
 *   Return defaultValue to clear the url search paramName.
 */
export function useStateWithUrlSearchParam<Type>(
  defaultValue: Type[],
  paramName: string,
  fromString: FromStringFn<Type>,
  toString: ToStringFn<Type>,
): [value: Type[], setter: Dispatch<SetStateAction<Type[]>>];
export function useStateWithUrlSearchParam<Type>(
  defaultValue: Type,
  paramName: string,
  fromString: FromStringFn<Type>,
  toString: ToStringFn<Type>,
): [value: Type, setter: Dispatch<SetStateAction<Type>>];
export function useStateWithUrlSearchParam<Type>(
  defaultValue: Type | Type[],
  paramName: string,
  fromString: FromStringFn<Type>,
  toString: ToStringFn<Type>,
): [value: Type | Type[], setter: Dispatch<SetStateAction<Type | Type[]>>] {
  // STATE WORKAROUND:
  // If we use this hook to control multiple state parameters on the same
  // page, we can run into state update issues. Because our state variables
  // are actually stored in setSearchParams, and not in separate variables like
  // useState would do, the searchParams "previous" state may not be updated
  // for sequential calls to returnSetter in the same render loop (as we do in
  // SearchManager's clearFilters).
  //
  // One workaround could be to use window.location.search as the "previous"
  // value when returnSetter constructs the new URLSearchParams. This works
  // fine with BrowserRouter, however our test suite uses MemoryRouter, and
  // that router doesn't store URL search params, cf
  // https://github.com/remix-run/react-router/issues/9757
  //
  // So instead, we maintain a reference to the current useLocation()
  // object, and use its search params as the "previous" value when
  // initializing URLSearchParams.
  const location = useLocation();
  const locationRef = useRef(location);
  const [searchParams, setSearchParams] = useSearchParams();
  const paramValues = searchParams.getAll(paramName);

  const returnValue: Type | Type[] = (
    defaultValue instanceof Array
      ? (paramValues.map(fromString).filter((v) => v !== undefined)) as Type[]
      : fromString(paramValues[0])
  ) ?? defaultValue;

  // Update the url search parameter using:
  type ReturnSetterParams = (
    // a Type value
    value?: Type | Type[]
    // or a function that returns a Type from the previous returnValue
    | ((value: Type | Type[]) => Type | Type[])
  ) => void;
  const returnSetter: Dispatch<SetStateAction<Type | Type[]>> = useCallback<ReturnSetterParams>((value) => {
    setSearchParams((/* previous -- see STATE WORKAROUND above */) => {
      const useValue = value instanceof Function ? value(returnValue) : value;
      const paramValue: string | string[] | undefined = (
        useValue instanceof Array
          ? useValue.map(toString).filter((v) => v !== undefined) as string[]
          : toString(useValue)
      );

      const newSearchParams = new URLSearchParams(locationRef.current.search);
      if (paramValue === undefined || paramValue === defaultValue) {
        // If the provided value was invalid (toString returned undefined) or
        // the same as the defaultValue, remove it from the search params.
        newSearchParams.delete(paramName);
      } else if (paramValue instanceof Array) {
        // Replace paramName with the new list of values.
        newSearchParams.delete(paramName);
        paramValue.forEach((v) => v && newSearchParams.append(paramName, v));
      } else {
        // Otherwise, just set the new (single) value.
        newSearchParams.set(paramName, paramValue);
      }

      // Update locationRef
      locationRef.current.search = newSearchParams.toString();

      return newSearchParams;
    }, { replace: true });
  }, [returnValue, setSearchParams]);

  // Return the computed value and wrapped set state function
  return [returnValue, returnSetter];
}
