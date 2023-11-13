import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { injectIntl, FormattedMessage, intlShape } from '@edx/frontend-platform/i18n';
import { CheckboxFilter } from '@edx/paragon';
import Placeholder from '@edx/frontend-lib-content-components';

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
import { getFileSizeToClosestByte } from '../generic/utils';
import FileThumbnail from './FileThumbnail';
import FileInfoModalSidebar from './FileInfoModalSidebar';

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
  const handleAddFile = (file) => dispatch(addAssetFile(courseId, file));
  const handleDeleteFile = (id) => dispatch(deleteAssetFile(courseId, id));
  const handleDownloadFile = (selectedRows) => dispatch(fetchAssetDownload({ selectedRows, courseId }));
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
  };
  const maxFileSize = 20 * 1048576;

  const activeColumn = {
    id: 'usageLocations',
    Header: 'Active',
    Cell: ({ row }) => ActiveColumn({ row }),
  };
  const accessColumn = {
    id: 'locked',
    Header: 'Access',
    Cell: ({ row }) => AccessColumn({ row }),
  };
  const thumbnailColumn = {
    id: 'thumbnail',
    Header: '',
    Cell: ({ row }) => ThumbnailColumn({ row, thumbnailPreview }),
  };
  const fileSizeColumn = {
    id: 'fileSize',
    Header: 'File size',
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
          name: 'Code',
          value: 'code',
        },
        {
          name: 'Images',
          value: 'image',
        },
        {
          name: 'Documents',
          value: 'document',
        },
        {
          name: 'Audio',
          value: 'audio',
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
      <main>
        <div className="p-4">
          <EditFileErrors
            resetErrors={handleErrorReset}
            errorMessages={errorMessages}
            addFileStatus={addAssetStatus}
            deleteFileStatus={deleteAssetStatus}
            updateFileStatus={updateAssetStatus}
          />
          <div className="h2">
            <FormattedMessage {...messages.heading} />
          </div>
        </div>
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
      </main>
    </FilesPageProvider>
  );
};

FilesPage.propTypes = {
  courseId: PropTypes.string.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(FilesPage);
