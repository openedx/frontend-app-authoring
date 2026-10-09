import { createStore } from './gameStore';

describe('createStore', () => {
  it('starts from the initial state', () => {
    const store = createStore({ n: 0 });
    expect(store.get()).toEqual({ n: 0 });
  });

  // The save path reads the state straight after an upload settles, before
  // React has re-rendered. It must see the new value.
  it('reads the new state synchronously after an update', () => {
    const store = createStore({ n: 0 });
    store.update((s) => ({ ...s, n: 1 }));
    expect(store.get()).toEqual({ n: 1 });
  });

  it('notifies subscribers once per change', () => {
    const store = createStore({ n: 0 });
    const listener = jest.fn();
    store.subscribe(listener);
    store.set({ n: 1 });
    store.update((s) => ({ ...s, n: 2 }));
    expect(listener).toHaveBeenCalledTimes(2);
  });

  // A transition that declines to change anything returns the same object;
  // React must not be told anything happened.
  it('does not notify when the state is unchanged', () => {
    const store = createStore({ n: 0 });
    const listener = jest.fn();
    store.subscribe(listener);
    store.update((s) => s);
    store.set(store.get());
    expect(listener).not.toHaveBeenCalled();
  });

  it('stops notifying after unsubscribe', () => {
    const store = createStore({ n: 0 });
    const listener = jest.fn();
    const unsubscribe = store.subscribe(listener);
    unsubscribe();
    store.set({ n: 1 });
    expect(listener).not.toHaveBeenCalled();
  });

  it('lets a listener unsubscribe while being notified', () => {
    const store = createStore({ n: 0 });
    const second = jest.fn();
    const unsubscribeFirst = store.subscribe(() => unsubscribeFirst());
    store.subscribe(second);
    store.set({ n: 1 });
    expect(second).toHaveBeenCalledTimes(1);
  });

  // getSnapshot must be referentially stable between changes, or
  // useSyncExternalStore loops.
  it('returns the same reference until something changes', () => {
    const store = createStore({ n: 0 });
    expect(store.get()).toBe(store.get());
    store.update((s) => s);
    expect(store.get()).toBe(store.get());
  });
});
