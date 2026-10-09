/**
 * A minimal external store for state that must be readable synchronously
 * outside React's render cycle. `subscribe`/`get` satisfy the
 * `useSyncExternalStore(subscribe, getSnapshot)` contract: `get` returns the
 * same reference until `set` replaces it.
 */
export interface Store<T> {
  /** The current state, right now, whether or not React has re-rendered. */
  get: () => T;
  /** Replaces the state and notifies subscribers, unless it is the same object. */
  set: (next: T) => void;
  /** Applies a pure transition to the current state. */
  update: (transition: (state: T) => T) => void;
  /** Registers a change listener and returns the function that removes it. */
  subscribe: (listener: () => void) => () => void;
}

export const createStore = <T>(initial: T): Store<T> => {
  let state = initial;
  const listeners = new Set<() => void>();

  const set = (next: T) => {
    if (Object.is(next, state)) { return; }
    state = next;
    // Copy first: a listener may unsubscribe itself while being notified.
    Array.from(listeners).forEach((listener) => listener());
  };

  return {
    get: () => state,
    set,
    update: (transition) => set(transition(state)),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
};
