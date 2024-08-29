import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { injectIntl, FormattedMessage, intlShape } from '@edx/frontend-platform/i18n';
import { CheckboxFilter, Container } from '@openedx/paragon';
import Placeholder from '../../editors/Placeholder';

import { RequestStatus } from '../../data/constants';
import { useModels, useModel } from '../../generic/model-store';
import {
  addAssetFile,
  deleteAssetFile,
  fetchAssets,
  updateAssetLock,
  fetchAssetDownload,
  getUsagePaths,
  resetErrors,
  updateAssetOrder,
  validateAssetFiles,
} from './data/thunks';
import messages from './messages';
import FilesPageProvider from './FilesPageProvider';
import getPageHeadTitle from '../../generic/utils';
import {
  AccessColumn,
  ActiveColumn,
  EditFileErrors,
  FileTable,
  ThumbnailColumn,
} from '../generic';
import { getFileSizeToClosestByte } from '../../utils';
import FileThumbnail from './FileThumbnail';
import FileInfoModalSidebar from './FileInfoModalSidebar';
import FileValidationModal from './FileValidationModal';

const FilesPage = ({
  courseId,
  // injected
  intl,
}) => {
  const dispatch = useDispatch();
  const courseDetails = useModel('courseDetails', courseId);
  document.title = getPageHeadTitle(courseDetails?.name, intl.formatMessage(messages.heading));

  useEffect(() => {
    dispatch(fetchAssets(courseId));
  }, [courseId]);

  const {
    assetIds,
    loadingStatus,
    addingStatus: addAssetStatus,
    deletingStatus: deleteAssetStatus,
    updatingStatus: updateAssetStatus,
    usageStatus: usagePathStatus,
    errors: errorMessages,
  } = useSelector(state => state.assets);

  const handleErrorReset = (error) => dispatch(resetErrors(error));
  const handleDeleteFile = (id) => dispatch(deleteAssetFile(courseId, id));
  const handleDownloadFile = (selectedRows) => dispatch(fetchAssetDownload({ selectedRows, courseId }));
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
  const handleFileOrder = ({ newFileIdOrder, sortType }) => {
    dispatch(updateAssetOrder(courseId, newFileIdOrder, sortType));
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

  if (loadingStatus === RequestStatus.DENIED) {
    return (
      <div data-testid="under-construction-placeholder" className="row justify-contnt-center m-6">
        <Placeholder />
      </div>
    );
  }

  return (
    <FilesPageProvider courseId={courseId}>
      <Container size="xl" className="p-4 pt-4.5">
        <EditFileErrors
          resetErrors={handleErrorReset}
          errorMessages={errorMessages}
          addFileStatus={addAssetStatus}
          deleteFileStatus={deleteAssetStatus}
          updateFileStatus={updateAssetStatus}
          loadingStatus={loadingStatus}
        />
        <div className="h2">
          <FormattedMessage {...messages.heading} />
        </div>
        {loadingStatus !== RequestStatus.FAILED && (
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
        )}
      </Container>
    </FilesPageProvider>
  );
};

FilesPage.propTypes = {
  courseId: PropTypes.string.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(FilesPage);
