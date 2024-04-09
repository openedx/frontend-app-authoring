import { useEffect } from 'react';

/**
 * Hook to control the overflow property of the body based on the presence of an element in the DOM.
 * @param {string} targetSelector - Selector of the target element for overflow control.
 * @returns {void}
 */
const useOverflowControl = (targetSelector) => {
  useEffect(() => {
    const handleOverflow = () => {
      const body = document.querySelector('body');
      const targetElement = document.querySelector(targetSelector);

      body.style.overflow = targetElement ? 'hidden' : 'auto';
    };

    handleOverflow();

    const observer = new MutationObserver(handleOverflow);
    observer.observe(document.body, { attributes: true, childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [targetSelector]);
};

export default useOverflowControl;
