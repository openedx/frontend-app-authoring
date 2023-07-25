import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { injectIntl, FormattedMessage, intlShape } from '@edx/frontend-platform/i18n';
import {
  DataTable,
  TextFilter,
  CheckboxFilter,
  Dropzone,
  CardView,
} from '@edx/paragon';
import Placeholder, { ErrorAlert } from '@edx/frontend-lib-content-components';

import { RequestStatus } from '../data/constants';
import { useModels } from '../generic/model-store';
import {
  addAssetFile,
  deleteAssetFile,
  fetchAssets,
  updateAssetLock,
  updatePageView,
} from './data/thunks';
import { updateAddingStatus } from '../custom-pages/data/slice';
// import {createZipFile} from './data/utils';
import messages from './messages';

import FileInput, { fileInput } from './FileInput';
import FilesAndUploadsProvider from './FilesAndUploadsProvider';
import {
  TablePagination,
  GalleryCard,
  ListCard,
  TableActions,
} from './table-components';
import ApiStatusToast from './ApiStatusToast';

const FilesAndUploads = ({
  courseId,
  // injected
  intl,
}) => {
  const dispatch = useDispatch();
  const defaultVal = 'card';
  const columnSizes = { xs: 12, sm: 6, lg: 3 };
  const [currentView, setCurrentView] = useState(defaultVal);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchAssets(courseId));
  }, [courseId]);
  // const courseLoadingStatus = useSelector(state => state.courseDetail.loadingStatus);
  const assetIds = useSelector(state => state.assets.assetIds);
  const totalCount = useSelector(state => state.assets.totalCount);
  const addAssetStatus = useSelector(state => state.assets.addingStatus);
  const deleteAssetStatus = useSelector(state => state.assets.deletingStatus);
  // const savingStatus = useSelector(getSavingStatus);
  const loadingStatus = useSelector(state => state.assets.loadingStatus);
  const fileInputControl = fileInput({
    onAddFile: (file) => dispatch(addAssetFile(courseId, file, totalCount)),
    onError: () => dispatch(updateAddingStatus({ status: RequestStatus.FAILED })),
  });
  const assets = useModels('assets', assetIds);

  const handleDropzoneAsset = ({ fileData, handleError }) => {
    try {
      const file = fileData.get('file');
      dispatch(addAssetFile(courseId, file, totalCount));
    } catch (error) {
      handleError(error);
    }
  };

  const handleBulkDelete = (selectedFlatRows) => {
    const assetIdsToDelete = selectedFlatRows.map(row => row.original.id);
    assetIdsToDelete.forEach(id => dispatch(deleteAssetFile(courseId, id, totalCount)));
  };

  const handleBulkDownload = (selectedFlatRows) => {
    selectedFlatRows.forEach(row => {
      const { externalUrl } = row.original;
      const link = document.createElement('a');
      link.target = '_blank';
      link.download = true;
      link.href = externalUrl;
      link.click();
    });
    // if (selectedFlatRows.length === 1) {
    // } else {
    //   console.log('getting zip file');
    // createZipFile({ selectedFlatRows });
    // }
  };

  const handleLockedAsset = (assetId, locked) => {
    dispatch(updateAssetLock({ courseId, assetId, locked }));
  };

  const handlePageChange = (pageNum) => {
    if (pageNum !== currentPage) {
      dispatch(updatePageView(courseId, pageNum - 1, assetIds));
      setCurrentPage(pageNum);
    }
  };

  const headerActions = ({ selectedFlatRows }) => {
    if (_.isEmpty(assets)) {
      return [];
    }
    return (
      <TableActions
        {...{
          selectedFlatRows,
          fileInputControl,
          handleBulkDelete,
          handleBulkDownload,
        }}
      />
    );
  };

  const fileCard = ({ className, original }) => {
    if (currentView === defaultVal) {
      return (
        <GalleryCard
          {...{
            handleBulkDelete,
            handleLockedAsset,
            className,
            original,
          }}
        />
      );
    }
    return (
      <ListCard
        {...{
          handleBulkDelete,
          handleLockedAsset,
          className,
          original,
        }}
      />
    );
  };

  if (loadingStatus === RequestStatus.DENIED) {
    return <Placeholder />;
  }

  return (
    <FilesAndUploadsProvider courseId={courseId}>
      <main className="container p-4 pt-5">
        <ErrorAlert
          hideHeading
          isError={addAssetStatus === RequestStatus.FAILED}
        >
          <FormattedMessage {...messages.fileSizeError} />
        </ErrorAlert>
        <div className="small gray-700">
          {intl.formatMessage(messages.subheading)}
        </div>
        <div className="h2">
          <FormattedMessage {...messages.heading} />
        </div>
        <DataTable
          isFilterable
          isLoading={loadingStatus === RequestStatus.IN_PROGRESS}
          isSortable
          isSelectable
          isPaginated
          manualPagination
          defaultColumnValues={{ Filter: TextFilter }}
          dataViewToggleOptions={{
            isDataViewToggleEnabled: true,
            onDataViewToggle: val => setCurrentView(val),
            defaultActiveStateValue: defaultVal,
            togglePlacement: 'left',
          }}
          initialState={{
            pageSize: 4,
            pageIndex: 0,
          }}
          tableActions={headerActions}
          bulkActions={headerActions}
          columns={[
            {
              Header: 'Name',
              accessor: 'displayName',
            },
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
          ]}
          itemCount={totalCount}
          pageCount={Math.ceil(totalCount / 50)}
          data={assets}
        >
          {_.isEmpty(assets) && loadingStatus !== RequestStatus.IN_PROGRESS ? (
            <Dropzone
              onProcessUpload={handleDropzoneAsset}
              maxSize={20 * 1048576}
              errorMessages={{
                invalidSize: 'The file size must be less than 20MB.',
                multipleDragged: 'Cannot upload more than one file.',
              }}
            />
          ) : (
            <>
              <DataTable.TableControlBar />
              { currentView === 'card' && <CardView CardComponent={fileCard} columnSizes={columnSizes} selectionPlacement="left" /> }
              { currentView === 'list' && <CardView CardComponent={fileCard} columnSizes={{ xs: 12 }} selectionPlacement="left" /> }
              <DataTable.TableFooter>
                <TablePagination {...{ totalCount, currentPage, handlePageChange }} />
              </DataTable.TableFooter>
              <ApiStatusToast
                actionType="deleted"
                apiStatus={deleteAssetStatus}
              />
              <ApiStatusToast
                actionType="added"
                apiStatus={addAssetStatus}
              />
            </>
          )}
        </DataTable>
        <FileInput fileInput={fileInputControl} />
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
