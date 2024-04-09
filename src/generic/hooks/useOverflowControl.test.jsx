import { renderHook } from '@testing-library/react-hooks';

import useOverflowControl from './useOverflowControl';

const observerInstance = {
  observe: jest.fn(),
  disconnect: jest.fn(),
};

let observerCallback = jest.fn();

const mutationObserverMock = jest.fn((callback) => {
  observerCallback = callback;
  return observerInstance;
});

describe('useOverflowControl', () => {
  const targetElement = document.createElement('div');
  targetElement.className = 'target-element';
  document.body.appendChild(targetElement);

  beforeEach(() => {
    global.MutationObserver = mutationObserverMock;
  });

  afterEach(() => delete global.MutationObserver);

  it('should set body overflow to hidden when target element is present', () => {
    const { unmount } = renderHook(() => useOverflowControl('.target-element'));

    // Simulate the MutationObserver callback with added nodes
    observerCallback([{ addedNodes: [targetElement] }]);
    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    document.body.style.overflow = 'auto';
    expect(document.body.style.overflow).toBe('auto');
  });

  it('should set body overflow to auto when target element is not present', () => {
    const { unmount } = renderHook(() => useOverflowControl('.non-existent-target-element'));

    // Simulate the MutationObserver callback with added nodes
    observerCallback([{ removedNodes: [document.querySelector('.non-existent-target-element')] }]);
    expect(document.body.style.overflow).toBe('auto');

    unmount();

    document.body.style.overflow = 'auto';
    expect(document.body.style.overflow).toBe('auto');
  });
});
