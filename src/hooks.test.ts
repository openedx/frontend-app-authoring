import { fireEvent, renderHook } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { history } from '@edx/frontend-platform';

import { useScrollToHashElement, useEscapeClick, useLoadOnScroll } from '@src/hooks';

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

    beforeEach(() => {
      jest.replaceProperty(window, 'innerHeight', 800);
      jest.replaceProperty(window, 'scrollY', 0);
      jest.spyOn(document.body, 'scrollHeight', 'get').mockReturnValue(2000);
    });

    afterEach(() => {
      jest.restoreAllMocks();
      fetchNextPage.mockReset();
    });

    it('calls fetchNextPage when scrolled near the bottom', () => {
      renderHook(() => useLoadOnScroll(true, false, fetchNextPage, true));

      window.scrollY = 1000;
      fireEvent.scroll(window);

      expect(fetchNextPage).toHaveBeenCalledTimes(1);
    });

    it('loads another page when the content does not fill the window', () => {
      jest.spyOn(document.body, 'scrollHeight', 'get').mockReturnValue(800);

      renderHook(() => useLoadOnScroll(true, false, fetchNextPage, true));

      expect(fetchNextPage).toHaveBeenCalledTimes(1);
    });

    it('does not call fetchNextPage if not near the bottom', () => {
      renderHook(() => useLoadOnScroll(true, false, fetchNextPage, true));

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

    describe('with a content ref', () => {
      const originalGetComputedStyle = window.getComputedStyle;
      let scrollContainer: HTMLDivElement;
      let contentRef: { current: HTMLDivElement; };

      beforeEach(() => {
        scrollContainer = document.createElement('div');
        scrollContainer.style.overflowY = 'auto';
        window.getComputedStyle = jest.fn((element) =>
          Object.assign({}, originalGetComputedStyle(element), {
            overflowY: element === scrollContainer ? scrollContainer.style.overflowY : 'visible',
          })
        );
        Object.defineProperties(scrollContainer, {
          scrollHeight: { configurable: true, value: 2000 },
          clientHeight: { configurable: true, value: 600 },
        });
        contentRef = { current: document.createElement('div') };
        // The scrolling element need not be the content's immediate parent.
        scrollContainer.appendChild(document.createElement('div')).appendChild(contentRef.current);
        document.body.appendChild(scrollContainer);
      });

      afterEach(() => {
        window.getComputedStyle = originalGetComputedStyle;
        scrollContainer.remove();
      });

      it('loads near the container bottom and ignores window scrolling', () => {
        renderHook(() => useLoadOnScroll(true, false, fetchNextPage, true, contentRef));

        window.scrollY = 1200;
        fireEvent.scroll(window);
        fireEvent.scroll(scrollContainer);
        expect(fetchNextPage).not.toHaveBeenCalled();

        scrollContainer.scrollTop = 1200;
        fireEvent.scroll(scrollContainer);
        expect(fetchNextPage).toHaveBeenCalledTimes(1);
      });

      it.each([
        { containerHeight: 500, pageHeight: 2000, expectedCalls: 1 },
        { containerHeight: 2000, pageHeight: 500, expectedCalls: 0 },
      ])('uses container height $containerHeight for initial loading', ({
        containerHeight,
        pageHeight,
        expectedCalls,
      }) => {
        Object.defineProperty(scrollContainer, 'scrollHeight', { value: containerHeight });
        jest.spyOn(document.body, 'scrollHeight', 'get').mockReturnValue(pageHeight);

        renderHook(() => useLoadOnScroll(true, false, fetchNextPage, true, contentRef));

        expect(fetchNextPage).toHaveBeenCalledTimes(expectedCalls);
      });

      it('falls back to window scrolling without a scrollable ancestor', () => {
        scrollContainer.style.overflowY = 'visible';
        renderHook(() => useLoadOnScroll(true, false, fetchNextPage, true, contentRef));

        window.scrollY = 1000;
        fireEvent.scroll(window);

        expect(fetchNextPage).toHaveBeenCalledTimes(1);
      });

      it('starts and stops listening when enabled changes', () => {
        const { rerender, unmount } = renderHook(
          ({ enabled }) => useLoadOnScroll(true, false, fetchNextPage, enabled, contentRef),
          { initialProps: { enabled: false } },
        );
        scrollContainer.scrollTop = 1200;
        fireEvent.scroll(scrollContainer);
        expect(fetchNextPage).not.toHaveBeenCalled();

        rerender({ enabled: true });
        fireEvent.scroll(scrollContainer);
        expect(fetchNextPage).toHaveBeenCalledTimes(1);

        rerender({ enabled: false });
        fireEvent.scroll(scrollContainer);
        expect(fetchNextPage).toHaveBeenCalledTimes(1);

        rerender({ enabled: true });
        unmount();
        fireEvent.scroll(scrollContainer);
        expect(fetchNextPage).toHaveBeenCalledTimes(1);
      });
    });
  });
});
