import React from 'react';
import PropTypes from 'prop-types';

import { checkValidFileSize } from './fileValidation';

export const fileInput = ({ onAddFile, maxBytes, onSizeFail }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const ref = React.useRef();
  const click = () => ref.current.click();
  const addFile = (e) => {
    const file = e.target.files[0];
    //  Check file is exists
    if (!file) { return; }

    // Check file size if maxBytes is provided
    if (maxBytes && !checkValidFileSize({ file, onSizeFail, maxBytes })) { return; }

    // Finally, delegate to the provided onAddFile handler
    onAddFile(file);
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
