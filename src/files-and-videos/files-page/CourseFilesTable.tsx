import { useIntl } from '@edx/frontend-platform/i18n';
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
} from '@src/files-and-videos/files-page/data/thunks';
import FileInfoModalSidebar from '@src/files-and-videos/files-page/FileInfoModalSidebar';
import FileThumbnail from '@src/files-and-videos/files-page/FileThumbnail';
import FileValidationModal from '@src/files-and-videos/files-page/FileValidationModal';
import messages from '@src/files-and-videos/files-page/messages';
import {
  AccessColumn,
  ActiveColumn,
  FileTable,
  ThumbnailColumn,
} from '@src/files-and-videos/generic';
import { useModels } from '@src/generic/model-store';
import { DeprecatedReduxState } from '@src/store';
import { getFileSizeToClosestByte } from '@src/utils';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { UPLOAD_FILE_MAX_SIZE } from '@src/constants';

export const CourseFilesTable = () => {
  const intl = useIntl();
  const { courseId } = useParams() as { courseId: string };
  const dispatch = useDispatch();
  const {
    assetIds,
    loadingStatus,
    usageStatus: usagePathStatus,
    errors: errorMessages,
  } = useSelector((state: DeprecatedReduxState) => state.assets);

  const handleErrorReset = (error) => dispatch(resetErrors(error));
  const handleDeleteFile = (id) => dispatch(deleteAssetFile(courseId, id));
  const handleDownloadFile = (selectedRows) => dispatch(fetchAssetDownload({
    selectedRows,
    courseId,
  }));
  const handleAddFile = (files) => {
    handleErrorReset({ errorType: 'add' });
    dispatch(validateAssetFiles(courseId, files));
  };
  const handleFileOverwrite = (close, files) => {
    Object.values(files).forEach(file => dispatch(addAssetFile(courseId, file, true)));
    close();
  };
  const handleLockFile = (fileId, locked) => {
    handleErrorReset({ errorType: 'lock' });
    dispatch(updateAssetLock({ courseId, assetId: fileId, locked }));
  };
  const handleUsagePaths = (asset) => dispatch(getUsagePaths({ asset, courseId }));
  const handleFileOrder = ({ newFileIdOrder }) => {
    dispatch(updateAssetOrder(courseId, newFileIdOrder));
  };

  const thumbnailPreview = (props) => FileThumbnail(props);
  const infoModalSidebar = (asset) => FileInfoModalSidebar({
    asset,
    handleLockedAsset: handleLockFile,
  });

  const assets = useModels('assets', assetIds);
  const data = {
    fileIds: assetIds,
    loadingStatus,
    usagePathStatus,
    usageErrorMessages: errorMessages.usageMetrics,
    fileType: 'file',
  };
  const maxFileSize = UPLOAD_FILE_MAX_SIZE;

  const activeColumn = {
    id: 'activeStatus',
    Header: intl.formatMessage(messages.fileActiveColumn),
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
    Header: intl.formatMessage(messages.fileAccessColumn),
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
    Header: intl.formatMessage(messages.fileSizeColumn),
    accessor: 'fileSize',
    Cell: ({ row }) => {
      const { fileSize } = row.original;
      return getFileSizeToClosestByte(fileSize);
    },
  };

  const tableColumns = [
    { ...thumbnailColumn },
    {
      Header: intl.formatMessage(messages.fileNameColumn),
      accessor: 'displayName',
    },
    { ...fileSizeColumn },
    {
      Header: intl.formatMessage(messages.fileTypeColumn),
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

  if (!courseId) {
    return null;
  }
  return (
    <>
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
    </>
  );
};
