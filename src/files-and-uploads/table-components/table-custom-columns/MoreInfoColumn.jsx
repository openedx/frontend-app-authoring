import React from 'react';
import { PropTypes } from 'prop-types';
import FileMenu from '../../FileMenu';

const MoreInfoColumn = ({
  row,
  handleLock,
  onDownload,
  openAssetInfo,
  openDeleteConfirmation,
}) => {
  const {
    externalUrl,
    locked,
    portableUrl,
    id,
    wrapperType,
  } = row.original;

  return (
    <FileMenu
      {...{
        externalUrl,
        handleLock,
        locked,
        onDownload,
        openAssetInfo,
        openDeleteConfirmation,
        portableUrl,
        id,
        wrapperType,
      }}
    />
  );
};

MoreInfoColumn.propTypes = {
  row: {
    original: {
      externalUrl: PropTypes.string,
      locked: PropTypes.bool,
      portableUrl: PropTypes.string,
      id: PropTypes.string.isRequired,
      wrapperType: PropTypes.string,
    }.isRequired,
  }.isRequired,
  handleLock: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  openAssetInfo: PropTypes.func.isRequired,
  openDeleteConfirmation: PropTypes.func.isRequired,
};

export default MoreInfoColumn;
