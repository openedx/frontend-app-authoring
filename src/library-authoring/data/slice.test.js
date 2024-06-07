import {
  reducer,
  openAddContentSidebar,
  closeLibrarySidebar,
  showToast,
  closeToast,
} from './slice';

describe('slice actions', () => {
  const initialState = {
    showLibrarySidebar: false,
    sidebarBodyComponent: null,
    showToast: false,
    toastMessage: null,
  };

  it('should return the initial state', () => {
    const result = reducer(undefined, { type: undefined });
    expect(result).toEqual(initialState);
  });

  it('should update when open add content sidebar', () => {
    const newState = {
      ...initialState,
      sidebarBodyComponent: 'add-content',
      showLibrarySidebar: true,
    };

    const result = reducer(initialState, openAddContentSidebar());
    expect(result).toEqual(newState);
  });

  it('should update when close content sidebar', () => {
    const result = reducer(initialState, closeLibrarySidebar());
    expect(result).toEqual(initialState);
  });

  it('should update when show toast', () => {
    const toastMessage = 'Test Message';
    const newState = {
      ...initialState,
      showToast: true,
      toastMessage,
    };

    const result = reducer(initialState, showToast({ toastMessage }));
    expect(result).toEqual(newState);
  });

  it('should update when close toast', () => {
    const result = reducer(initialState, closeToast());
    expect(result).toEqual(initialState);
  });
});
