import { useEffect } from 'react';
import PropTypes from 'prop-types';

const PromptIfDirty = ({ dirty }) => {
  useEffect(() => {
    // eslint-disable-next-line consistent-return
    const handleBeforeUnload = (event) => {
      if (dirty) {
        event.preventDefault();
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
