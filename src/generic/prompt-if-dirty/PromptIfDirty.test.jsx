import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import PromptIfDirty from './PromptIfDirty';

describe('PromptIfDirty', () => {
  let container = null;
  let mockEvent = null;
  let root = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    mockEvent = new Event('beforeunload');
    jest.spyOn(window, 'addEventListener');
    jest.spyOn(window, 'removeEventListener');
    jest.spyOn(mockEvent, 'preventDefault');
    Object.defineProperty(mockEvent, 'returnValue', { writable: true });
    mockEvent.returnValue = '';
  });

  afterEach(() => {
    window.addEventListener.mockRestore();
    window.removeEventListener.mockRestore();
    mockEvent.preventDefault.mockRestore();
    mockEvent = null;
    root.unmount();
    container.remove();
    container = null;
  });

  it('should add event listener on mount', () => {
    act(() => {
      root = createRoot(container);
      root.render(<PromptIfDirty dirty />);
    });

    expect(window.addEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('should remove event listener on unmount', () => {
    act(() => {
      root = createRoot(container);
      root.render(<PromptIfDirty dirty />);
    });
    act(() => {
      root.unmount();
    });

    expect(window.removeEventListener).toHaveBeenCalledWith('beforeunload', expect.any(Function));
  });

  it('should call preventDefault and set returnValue when dirty is true', () => {
    act(() => {
      root = createRoot(container);
      root.render(<PromptIfDirty dirty />);
    });
    act(() => {
      window.dispatchEvent(mockEvent);
    });

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(mockEvent.returnValue).toBe('');
  });

  it('should not call preventDefault when dirty is false', () => {
    act(() => {
      root = createRoot(container);
      root.render(<PromptIfDirty dirty={false} />);
    });
    act(() => {
      window.dispatchEvent(mockEvent);
    });

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
  });
});
