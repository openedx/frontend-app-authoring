import { act, fireEvent, renderHook } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { history } from '@edx/frontend-platform';

import {
  useScrollToHashElement,
  useEscapeClick,
  useLoadOnScroll,
  useStickyState,
} from './hooks';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

jest.mock('@edx/frontend-platform', () => ({
  history: {
    replace: jest.fn(),
  },
}));

describe('Custom Hooks', () => {
  describe('useScrollToHashElement', () => {
    beforeEach(() => {
      window.location.hash = '#test';
      document.body.innerHTML = '<div id="test">Test Element</div>';

      Element.prototype.scrollIntoView = jest.fn();

      jest.mocked(useLocation).mockReturnValue({
        pathname: '/test',
        state: null,
        search: '',
        hash: '',
        key: 'default',
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
      window.location.hash = '';
    });

    it('scrolls to element with the hash and replaces the URL hash', () => {
      renderHook(() => useScrollToHashElement({ isLoading: false }));
      const element = document.getElementById('test');

      expect(element).toBeInTheDocument();
      expect(element?.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
      expect(history.replace).toHaveBeenCalledWith({ pathname: '/test', hash: '' });
    });
  });

  describe('useEscapeClick', () => {
    it('calls onEscape when Escape key is pressed', () => {
      const onEscape = jest.fn();

      renderHook(() => useEscapeClick({ onEscape, dependency: [] }));

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(onEscape).toHaveBeenCalledTimes(1);
    });

    it('does not call onEscape for other keys', () => {
      const onEscape = jest.fn();

      renderHook(() => useEscapeClick({ onEscape, dependency: [] }));

      fireEvent.keyDown(window, { key: 'Enter' });

      expect(onEscape).not.toHaveBeenCalled();
    });
  });

  describe('useLoadOnScroll', () => {
    const fetchNextPage = jest.fn();

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('calls fetchNextPage when scrolled near the bottom', () => {
      renderHook(() => useLoadOnScroll(true, false, fetchNextPage, true));

      Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 1000 });
      Object.defineProperty(document.body, 'scrollHeight', { writable: true, configurable: true, value: 1500 });
      window.scrollY = 1200;

      fireEvent.scroll(window);

      // Called on scroll once and then due to content being less than screen height
      // and hasNextPage being true.
      expect(fetchNextPage).toHaveBeenCalledTimes(2);
    });

    it('does not call fetchNextPage if not near the bottom', () => {
      renderHook(() => useLoadOnScroll(true, false, fetchNextPage, true));

      Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 1000 });
      Object.defineProperty(document.body, 'scrollHeight', { writable: true, configurable: true, value: 2000 });
      window.scrollY = 500;

      fireEvent.scroll(window);

      expect(fetchNextPage).not.toHaveBeenCalled();
    });

    it('does not call fetchNextPage if fetching is in progress', () => {
      renderHook(() => useLoadOnScroll(true, true, fetchNextPage, true));

      fireEvent.scroll(window);

      expect(fetchNextPage).not.toHaveBeenCalled();
    });

    it('does not call fetchNextPage if hasNextPage is false', () => {
      renderHook(() => useLoadOnScroll(false, false, fetchNextPage, true));

      fireEvent.scroll(window);

      expect(fetchNextPage).not.toHaveBeenCalled();
    });
  });

  describe('useStickyState', () => {
    const key = 'use-sticky-state-test';

    beforeEach(() => {
      localStorage.clear();
    });

    it('persists the value and restores it on the next mount', () => {
      const { result } = renderHook(() => useStickyState(1, key));
      expect(result.current[0]).toBe(1);

      act(() => result.current[1](5));
      expect(localStorage.getItem(key)).toBe('5');

      const { result: remounted } = renderHook(() => useStickyState(1, key));
      expect(remounted.current[0]).toBe(5);
    });

    it('ignores a stored value that is not valid JSON', () => {
      localStorage.setItem(key, '{not json');
      const { result } = renderHook(() => useStickyState('default', key));
      expect(result.current[0]).toBe('default');
    });

    it('keeps working when storage is unavailable', () => {
      const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('blocked');
      });
      const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('blocked');
      });

      const { result } = renderHook(() => useStickyState('default', key));
      expect(result.current[0]).toBe('default');
      act(() => result.current[1]('changed'));
      expect(result.current[0]).toBe('changed');

      getItem.mockRestore();
      setItem.mockRestore();
    });
  });
});
