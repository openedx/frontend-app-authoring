import React from 'react';
import { act, renderHook } from '@testing-library/react';
import { useScrollToLastPosition, useLayoutGrid } from './hooks';
import { iframeMessageTypes } from '../constants';

jest.useFakeTimers();

describe('useLayoutGrid', () => {
  it('returns fullWidth layout when isUnitLibraryType is true', () => {
    const { result } = renderHook(() => useLayoutGrid('someCategory', true));

    expect(result.current).toEqual({
      lg: [{ span: 12 }, { span: 0 }],
      md: [{ span: 12 }, { span: 0 }],
      sm: [{ span: 12 }, { span: 0 }],
      xs: [{ span: 12 }, { span: 0 }],
      xl: [{ span: 12 }, { span: 0 }],
    });
  });

  it('returns default layout when isUnitLibraryType is false', () => {
    const { result } = renderHook(() => useLayoutGrid('someCategory', false));

    expect(result.current).toEqual({
      lg: [{ span: 8 }, { span: 4 }],
      md: [{ span: 8 }, { span: 4 }],
      sm: [{ span: 8 }, { span: 3 }],
      xs: [{ span: 9 }, { span: 3 }],
      xl: [{ span: 9 }, { span: 3 }],
    });
  });

  it('does not recompute layout if unitCategory remains the same', () => {
    const { result, rerender } = renderHook(
      ({ unitCategory, isUnitLibraryType }) => useLayoutGrid(unitCategory, isUnitLibraryType),
      { initialProps: { unitCategory: 'category1', isUnitLibraryType: false } },
    );

    const firstResult = result.current;

    rerender({ unitCategory: 'category1', isUnitLibraryType: false });

    expect(result.current).toBe(firstResult);
  });

  it('recomputes layout when unitCategory changes', () => {
    const { result, rerender } = renderHook(
      ({ unitCategory, isUnitLibraryType }) => useLayoutGrid(unitCategory, isUnitLibraryType),
      { initialProps: { unitCategory: 'category1', isUnitLibraryType: false } },
    );

    const firstResult = result.current;

    rerender({ unitCategory: 'category2', isUnitLibraryType: false });

    expect(result.current).not.toBe(firstResult);
  });
});

describe('useScrollToLastPosition', () => {
  const storageKey = 'createXBlockLastYPosition';
  let scrollToSpy;
  let clearTimeoutSpy;
  let setTimeoutSpy;
  let setStateSpy;

  beforeEach(() => {
    localStorage.clear();
    scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
    clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    setTimeoutSpy = jest.spyOn(global, 'setTimeout');
    setStateSpy = jest.spyOn(React, 'useState');
  });

  afterEach(() => {
    jest.clearAllTimers();
    scrollToSpy.mockRestore();
    clearTimeoutSpy.mockRestore();
    setTimeoutSpy.mockRestore();
    setStateSpy.mockRestore();
  });

  it('should not add event listener if no lastYPosition is in localStorage', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

    renderHook(() => useScrollToLastPosition(storageKey));

    expect(addEventListenerSpy).not.toHaveBeenCalledWith('message', expect.any(Function));

    addEventListenerSpy.mockRestore();
  });

  it('should add event listener if lastYPosition exists in localStorage', () => {
    localStorage.setItem(storageKey, '500');

    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

    renderHook(() => useScrollToLastPosition(storageKey));

    expect(addEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));

    addEventListenerSpy.mockRestore();
  });

  it('should scroll to saved position on message event', () => {
    localStorage.setItem(storageKey, '500');

    const { unmount } = renderHook(() => useScrollToLastPosition(storageKey));

    act(() => {
      window.dispatchEvent(new MessageEvent('message', { data: { type: iframeMessageTypes.resize } }));
      jest.advanceTimersByTime(1000);
    });

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 500, behavior: 'smooth' });
    expect(localStorage.getItem(storageKey)).toBeNull();

    unmount();
  });

  it('should clear timeout and remove event listener on unmount', () => {
    localStorage.setItem(storageKey, '500');

    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useScrollToLastPosition(storageKey));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('should clear previous timeout before setting a new one on multiple message events', () => {
    localStorage.setItem(storageKey, '500');

    renderHook(() => useScrollToLastPosition(storageKey));

    act(() => {
      window.dispatchEvent(new MessageEvent('message', { data: { type: iframeMessageTypes.resize } }));
      window.dispatchEvent(new MessageEvent('message', { data: { type: iframeMessageTypes.resize } }));
    });

    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(setTimeoutSpy).toHaveBeenCalledTimes(2);
  });

  it('should not scroll if multiple message events prevent execution of setTimeout callback', () => {
    localStorage.setItem(storageKey, '500');

    renderHook(() => useScrollToLastPosition(storageKey));

    act(() => {
      window.dispatchEvent(new MessageEvent('message', { data: { type: iframeMessageTypes.resize } }));
      jest.advanceTimersByTime(500);
      window.dispatchEvent(new MessageEvent('message', { data: { type: iframeMessageTypes.resize } }));
    });

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it('should scroll only after the final timeout', () => {
    localStorage.setItem(storageKey, '500');

    renderHook(() => useScrollToLastPosition(storageKey));

    act(() => {
      window.dispatchEvent(new MessageEvent('message', { data: { type: iframeMessageTypes.resize } }));
      jest.advanceTimersByTime(1000);
    });

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 500, behavior: 'smooth' });
  });

  it('should NOT set hasLastPosition to false if lastYPosition exists and is valid', () => {
    localStorage.setItem(storageKey, '500');

    renderHook(() => useScrollToLastPosition(storageKey));

    expect(setStateSpy).not.toHaveBeenCalledWith(false);
  });
});
