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
 * Types used by the useListHelpers and useStateWithUrlSearchParam hooks.
 */
export type FromStringFn<Type> = (value: string | null) => Type | undefined;
export type ToStringFn<Type> = (value: Type | undefined) => string | undefined;

/**
 * Hook that stores/retrieves state variables using the URL search parameters.
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
  fromString: FromStringFn<Type>,
  toString: ToStringFn<Type>,
): [value: Type, setter: Dispatch<SetStateAction<Type>>] {
  // STATE WORKAROUND:
  // If we use this hook to control multiple state parameters on the same
  // page, we can run into state update issues. Because our state variables
  // are actually stored in setSearchParams, and not in separate variables like
  // useState would do, the searchParams "previous" state may not be updated
  // for sequential calls to returnSetter in the same render loop (like in
  // SearchManager's clearFilters).
  //
  // One workaround could be to use window.location.search as the "previous"
  // value when returnSetter constructs the new URLSearchParams. This works
  // fine with BrowserRouter, but our test suite uses MemoryRouter, and that
  // router doesn't store URL search params, cf
  // https://github.com/remix-run/react-router/issues/9757
  //
  // So instead, we maintain a reference to the current useLocation()
  // object, and use its search params as the "previous" value when
  // initializing URLSearchParams.
  const location = useLocation();
  const locationRef = useRef(location);
  const [searchParams, setSearchParams] = useSearchParams();

  const returnValue: Type = fromString(searchParams.get(paramName)) ?? defaultValue;
  // Update the url search parameter using:
  type ReturnSetterParams = (
    // a Type value
    value?: Type
    // or a function that returns a Type from the previous returnValue
    | ((value: Type) => Type)
  ) => void;
  const returnSetter: Dispatch<SetStateAction<Type>> = useCallback<ReturnSetterParams>((value) => {
    setSearchParams((/* prev */) => {
      const useValue = value instanceof Function ? value(returnValue) : value;
      const paramValue = toString(useValue);
      const newSearchParams = new URLSearchParams(locationRef.current.search);
      // If the provided value was invalid (toString returned undefined)
      // or the same as the defaultValue, remove it from the search params.
      if (paramValue === undefined || paramValue === defaultValue) {
        newSearchParams.delete(paramName);
      } else {
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

/**
 * Helper hook for useStateWithUrlSearchParam<Type[]>.
 *
 * useListHelpers provides toString and fromString handlers that can:
 * - split/join a list of values using a separator string, and
 * - validate each value using the provided functions, omitting any invalid values.
 *
 * @param fromString
 *   Serialize a string to a Type, or undefined if not valid.
 * @param toString
 *   Deserialize a Type to a string.
 * @param separator : string to use when splitting/joining the types.
 *   Defaults value is ','.
 */
export function useListHelpers<Type>({
  fromString,
  toString,
  separator = ',',
}: {
  fromString: FromStringFn<Type>,
  toString: ToStringFn<Type>,
  separator?: string;
}): [ FromStringFn<Type[]>, ToStringFn<Type[]> ] {
  const isType = (item: Type | undefined): item is Type => item !== undefined;

  // Split the given string with separator,
  // and convert the parts to a list of Types, omiting any invalid Types.
  const fromStringToList : FromStringFn<Type[]> = (value: string) => (
    value
      ? value.split(separator).map(fromString).filter(isType)
      : []
  );
  // Convert an array of Types to strings and join with separator.
  // Returns undefined if the given list contains no valid Types.
  const fromListToString : ToStringFn<Type[]> = (value: Type[]) => {
    const stringValues = value.map(toString).filter((val) => val !== undefined);
    return (
      stringValues && stringValues.length
        ? stringValues.join(separator)
        : undefined
    );
  };
  return [fromStringToList, fromListToString];
}
