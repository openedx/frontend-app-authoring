import { useIntl } from '@edx/frontend-platform/i18n';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { CheckboxFilter } from '@openedx/paragon';
import {
  addAssetFile,
  deleteAssetFile,
  fetchAssetDownload,
  getUsagePaths,
  resetErrors,
  updateAssetLock,
  updateAssetOrder,
  validateAssetFiles,
} from 'CourseAuthoring/files-and-videos/files-page/data/thunks';
import FileInfoModalSidebar from 'CourseAuthoring/files-and-videos/files-page/FileInfoModalSidebar';
import FileThumbnail from 'CourseAuthoring/files-and-videos/files-page/FileThumbnail';
import FileValidationModal from 'CourseAuthoring/files-and-videos/files-page/FileValidationModal';
import messages from 'CourseAuthoring/files-and-videos/files-page/messages';
import {
  AccessColumn, ActiveColumn, FileTable, ThumbnailColumn,
} from 'CourseAuthoring/files-and-videos/generic';
import { useModels } from 'CourseAuthoring/generic/model-store';
import { getFileSizeToClosestByte } from 'CourseAuthoring/utils';
import PropTypes from 'prop-types';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

const CourseFilesSlot = ({ courseId }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const {
    assetIds,
    loadingStatus,
    usageStatus: usagePathStatus,
    errors: errorMessages,
  } = useSelector(state => state.assets);
  const data = {
    fileIds: assetIds,
    loadingStatus,
    usagePathStatus,
    usageErrorMessages: errorMessages.usageMetrics,
    fileType: 'file',
  };
  const handleErrorReset = (error) => dispatch(resetErrors(error));
  const handleDeleteFile = (id) => dispatch(deleteAssetFile(courseId, id));
  const handleDownloadFile = (selectedRows) => dispatch(fetchAssetDownload({ selectedRows, courseId }));
  const handleAddFile = (files) => {
    handleErrorReset({ errorType: 'add' });
    dispatch(validateAssetFiles(courseId, files));
  };
  const handleLockFile = (fileId, locked) => {
    handleErrorReset({ errorType: 'lock' });
    dispatch(updateAssetLock({ courseId, assetId: fileId, locked }));
  };
  const handleUsagePaths = (asset) => dispatch(getUsagePaths({ asset, courseId }));
  const handleFileOrder = ({ newFileIdOrder, sortType }) => {
    dispatch(updateAssetOrder(courseId, newFileIdOrder, sortType));
  };

  const handleFileOverwrite = (close, files) => {
    Object.values(files).forEach(file => dispatch(addAssetFile(courseId, file, true)));
    close();
  };

  const thumbnailPreview = (props) => FileThumbnail(props);
  const infoModalSidebar = (asset) => FileInfoModalSidebar({
    asset,
    handleLockedAsset: handleLockFile,
  });
  const assets = useModels('assets', assetIds);
  const maxFileSize = 20 * 1048576;

  const activeColumn = {
    id: 'activeStatus',
    Header: 'Active',
    accessor: 'activeStatus',
    Cell: ({ row }) => ActiveColumn({ row, pageLoadStatus: loadingStatus }),
    Filter: CheckboxFilter,
    filter: 'exactTextCase',
    filterChoices: [
      { name: intl.formatMessage(messages.activeCheckboxLabel), value: 'active' },
      { name: intl.formatMessage(messages.inactiveCheckboxLabel), value: 'inactive' },
    ],
  };
  const accessColumn = {
    id: 'lockStatus',
    Header: 'Access',
    accessor: 'lockStatus',
    Cell: ({ row }) => AccessColumn({ row }),
    Filter: CheckboxFilter,
    filterChoices: [
      { name: intl.formatMessage(messages.lockedCheckboxLabel), value: 'locked' },
      { name: intl.formatMessage(messages.publicCheckboxLabel), value: 'public' },
    ],
  };
  const thumbnailColumn = {
    id: 'thumbnail',
    Header: '',
    Cell: ({ row }) => ThumbnailColumn({ row, thumbnailPreview }),
  };
  const fileSizeColumn = {
    id: 'fileSize',
    Header: 'File size',
    accessor: 'fileSize',
    Cell: ({ row }) => {
      const { fileSize } = row.original;
      return getFileSizeToClosestByte(fileSize);
    },
  };

  const tableColumns = [
    { ...thumbnailColumn },
    {
      Header: 'File name',
      accessor: 'displayName',
    },
    { ...fileSizeColumn },
    {
      Header: 'Type',
      accessor: 'wrapperType',
      Filter: CheckboxFilter,
      filter: 'includesValue',
      filterChoices: [
        {
          name: intl.formatMessage(messages.codeCheckboxLabel),
          value: 'code',
        },
        {
          name: intl.formatMessage(messages.imageCheckboxLabel),
          value: 'image',
        },
        {
          name: intl.formatMessage(messages.documentCheckboxLabel),
          value: 'document',
        },
        {
          name: intl.formatMessage(messages.audioCheckboxLabel),
          value: 'audio',
        },
        {
          name: intl.formatMessage(messages.otherCheckboxLabel),
          value: 'other',
        },
      ],
    },
    { ...activeColumn },
    { ...accessColumn },
  ];
  return (
    <PluginSlot id="files_upload_page_table_slot">
      <FileTable
        {...{
          courseId,
          data,
          handleAddFile,
          handleDeleteFile,
          handleDownloadFile,
          handleLockFile,
          handleUsagePaths,
          handleErrorReset,
          handleFileOrder,
          tableColumns,
          maxFileSize,
          thumbnailPreview,
          infoModalSidebar,
          files: assets,
        }}
      />
      <FileValidationModal {...{ handleFileOverwrite }} />
    </PluginSlot>
  );
};

CourseFilesSlot.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default CourseFilesSlot;
