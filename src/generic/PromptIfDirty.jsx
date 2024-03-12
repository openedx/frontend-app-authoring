import { useEffect } from 'react';
import PropTypes from 'prop-types';

const PromptIfDirty = ({ dirty }) => {
  useEffect(() => {
    // eslint-disable-next-line consistent-return
    const handleBeforeUnload = (event) => {
      if (dirty) {
        const message = 'You have unsaved changes. Are you sure you want to leave?';
        event.preventDefault();
        // eslint-disable-next-line no-param-reassign
        event.returnValue = message;

        return message; // For older browsers
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [dirty]);

  return null;
};
PromptIfDirty.propTypes = {
  dirty: PropTypes.bool.isRequired,
};
export default PromptIfDirty;
