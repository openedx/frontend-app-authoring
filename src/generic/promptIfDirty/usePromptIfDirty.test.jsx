import { renderHook } from '@testing-library/react-hooks';
import usePromptIfDirty from './usePromptIfDirty';

describe('usePromptIfDirty', () => {
  let mockEvent = null;

  beforeEach(() => {
    mockEvent = new Event('beforeunload');
    jest.spyOn(window, 'addEventListener');
    jest.spyOn(window, 'removeEventListener');
    jest.spyOn(mockEvent, 'preventDefault');
    Object.defineProperty(mockEvent, 'returnValue', { writable: true });
  });

  afterEach(() => {
    window.addEventListener.mockRestore();
    window.removeEventListener.mockRestore();
    mockEvent.preventDefault.mockRestore();
    mockEvent = null;
  });

  it('should add event listener on mount', () => {
    renderHook(() => usePromptIfDirty(() => true));

    expect(window.addEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('should remove event listener on unmount', () => {
    const { unmount } = renderHook(() => usePromptIfDirty(() => true));
    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('should call preventDefault and set returnValue when dirty is true', () => {
    renderHook(() => usePromptIfDirty(() => true));
    window.dispatchEvent(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.returnValue).toBe(true);
  });

  it('should not call preventDefault when dirty is false', () => {
    renderHook(() => usePromptIfDirty(() => false));
    window.dispatchEvent(mockEvent);

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
  });
});
