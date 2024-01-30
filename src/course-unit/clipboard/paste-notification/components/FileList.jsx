import PropTypes from 'prop-types';

import { FILE_LIST_DEFAULT_VALUE } from '../constants';

const FileList = ({ fileList }) => (
  <ul>
    {fileList.map((fileName) => (
      <li>{fileName}</li>
    ))}
  </ul>
);

FileList.propTypes = {
  fileList: PropTypes.arrayOf(PropTypes.string),
};

FileList.defaultProps = {
  fileList: FILE_LIST_DEFAULT_VALUE,
};

export default FileList;
