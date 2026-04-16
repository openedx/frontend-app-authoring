import React from 'react';
import PropTypes from 'prop-types';

export const fileInput = ({ onAddFile }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const ref = React.useRef();
  const click = () => ref.current.click();
  const addFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      onAddFile(file);
    }
  };
  return {
    click,
    addFile,
    ref,
  };
};

export const FileInput = ({ fileInput: hook, acceptedFiles }) => (
  <input
    accept={acceptedFiles}
    className="upload d-none"
    onChange={hook.addFile}
    ref={hook.ref}
    type="file"
  />
);

FileInput.propTypes = {
  acceptedFiles: PropTypes.string.isRequired,
  fileInput: PropTypes.shape({
    addFile: PropTypes.func,
    ref: PropTypes.oneOfType([
      // Either a function
      PropTypes.func,
      // Or the instance of a DOM native element (see the note about SSR)
      PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
    ]),
  }).isRequired,
};
