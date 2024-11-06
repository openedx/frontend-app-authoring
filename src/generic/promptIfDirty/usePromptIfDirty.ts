import { useEffect } from 'react';

const usePromptIfDirty = (checkIfDirty : () => boolean) => {
  useEffect(() => {
    // eslint-disable-next-line consistent-return
    const handleBeforeUnload = (event) => {
      if (checkIfDirty()) {
        event.preventDefault();
        // Included for legacy support, e.g. Chrome/Edge < 119
        event.returnValue = true; // eslint-disable-line no-param-reassign
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [checkIfDirty]);

  return null;
};

export default usePromptIfDirty;
