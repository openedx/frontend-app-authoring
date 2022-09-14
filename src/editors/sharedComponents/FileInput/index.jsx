import React from 'react';
import PropTypes from 'prop-types';

export const FileInput = ({ fileInput, acceptedFiles }) => (
  <input
    accept={acceptedFiles}
    className="upload d-none"
    onChange={fileInput.addFile}
    ref={fileInput.ref}
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

export default FileInput;
