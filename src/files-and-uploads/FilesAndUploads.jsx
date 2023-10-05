import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { injectIntl, FormattedMessage, intlShape } from '@edx/frontend-platform/i18n';
import { CheckboxFilter } from '@edx/paragon';
import Placeholder from '@edx/frontend-lib-content-components';

import { RequestStatus } from '../data/constants';
import { useModels, useModel } from '../generic/model-store';
import {
  addAssetFile,
  deleteAssetFile,
  fetchAssets,
  updateAssetLock,
  fetchAssetDownload,
} from './data/thunks';
import messages from './messages';
import FilesAndUploadsProvider from './FilesAndUploadsProvider';
import getPageHeadTitle from '../generic/utils';
import FileTable from './FileTable';
import EditFileErrors from './EditFileErrors';
import { getFileSizeToClosestByte } from './data/utils';
import ThumbnailColumn from './table-components/table-custom-columns/ThumbnailColumn';
import ActiveColumn from './table-components/table-custom-columns/ActiveColumn';
import AccessColumn from './table-components/table-custom-columns/AccessColumn';

const FilesAndUploads = ({
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
    totalCount,
    assetIds,
    loadingStatus,
    addingStatus: addAssetStatus,
    deletingStatus: deleteAssetStatus,
    updatingStatus: updateAssetStatus,
    usageStatus: usagePathStatus,
    errors: errorMessages,
  } = useSelector(state => state.assets);

  const handleAddFile = (file) => dispatch(addAssetFile(courseId, file, totalCount));
  const handleDeleteFile = (id) => dispatch(deleteAssetFile(courseId, id, totalCount));
  const handleDownloadFile = (selectedRows) => dispatch(fetchAssetDownload({ selectedRows, courseId }));
  const handleLockFile = ({ fileId, locked }) => dispatch(updateAssetLock({ courseId, assetId: fileId, locked }));

  const assets = useModels('assets', assetIds);
  const data = {
    totalCount,
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
    Cell: ({ row }) => ThumbnailColumn({ row }),
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
    <FilesAndUploadsProvider courseId={courseId}>
      <main>
        <div className="p-4">
          <EditFileErrors
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
            tableColumns,
            maxFileSize,
            files: assets,
          }}
        />
      </main>
    </FilesAndUploadsProvider>
  );
};

FilesAndUploads.propTypes = {
  courseId: PropTypes.string.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(FilesAndUploads);
