import { renderHook } from '@testing-library/react-hooks';
import { fireEvent } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { history } from '@edx/frontend-platform';

import { useScrollToHashElement, useEscapeClick, useLoadOnScroll } from './hooks';

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
});
