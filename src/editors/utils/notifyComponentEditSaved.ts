export const COMPONENT_EDIT_SAVE_STORAGE_KEY = 'courseRefreshTriggerOnComponentEditSave';

/**
 * Fires the same-window storage event the course-unit page's sidebar
 * (Published/Draft status, Publish button) listens for to refresh itself
 * after a component is saved.
 */
export const notifyComponentEditSaved = () => {
  const now = Date.now().toString();
  sessionStorage.setItem(COMPONENT_EDIT_SAVE_STORAGE_KEY, now);
  window.dispatchEvent(
    new StorageEvent('storage', { key: COMPONENT_EDIT_SAVE_STORAGE_KEY, newValue: now }),
  );
};
