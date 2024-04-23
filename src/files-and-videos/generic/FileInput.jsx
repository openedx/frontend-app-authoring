import React from 'react';
import PropTypes from 'prop-types';
import { getSupportedFormats } from '../videos-page/data/utils';

export const useFileInput = ({
  onAddFile,
  setSelectedRows,
  setAddOpen,
}) => {
  const ref = React.useRef();
  const click = () => ref.current.click();
  const addFile = (e) => {
    const { files } = e.target;
    setSelectedRows([...files]);
    onAddFile(Object.values(files));
    setAddOpen();
    e.target.value = '';
  };
  return {
    click,
    addFile,
    ref,
  };
};

const FileInput = ({ fileInput: hook, supportedFileFormats, allowMultiple }) => (
  <input
    accept={getSupportedFormats(supportedFileFormats)}
    aria-label="file-input"
    className="upload d-none"
    onChange={hook.addFile}
    ref={hook.ref}
    type="file"
    multiple={allowMultiple}
  />
);

FileInput.propTypes = {
  fileInput: PropTypes.shape({
    addFile: PropTypes.func,
    ref: PropTypes.oneOfType([
      // Either a function
      PropTypes.func,
      // Or the instance of a DOM native element (see the note about SSR)
      PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
    ]),
  }).isRequired,
  supportedFileFormats: PropTypes.oneOfType([
    PropTypes.shape({}),
    PropTypes.arrayOf(PropTypes.string),
  ]),
  allowMultiple: PropTypes.bool,
};

FileInput.defaultProps = {
  supportedFileFormats: null,
  allowMultiple: true,
};

export default FileInput;
