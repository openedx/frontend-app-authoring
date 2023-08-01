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
  useToggle,
} from '@edx/paragon';
import Placeholder, { ErrorAlert } from '@edx/frontend-lib-content-components';

import { RequestStatus } from '../data/constants';
import { useModels } from '../generic/model-store';
import {
  addAssetFile,
  deleteAssetFile,
  fetchAssets,
  updateAssetLock,
} from './data/thunks';
import { updateAddingStatus } from '../custom-pages/data/slice';
import messages from './messages';

import FileInput, { fileInput } from './FileInput';
import FilesAndUploadsProvider from './FilesAndUploadsProvider';
import {
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
  const [isDeleteOpen, setDeleteOpen, setDeleteClose] = useToggle(false);
  const [isAddOpen, setAddOpen, setAddClose] = useToggle(false);
  const [selectedRowCount, setSelectedRowCount] = useState(0);
  const assetIds = useSelector(state => state.assets.assetIds);

  useEffect(() => {
    dispatch(fetchAssets(courseId));
  }, [courseId]);
  const totalCount = useSelector(state => state.assets.totalCount);
  const addAssetStatus = useSelector(state => state.assets.addingStatus);
  const deleteAssetStatus = useSelector(state => state.assets.deletingStatus);
  const loadingStatus = useSelector(state => state.assets.loadingStatus);
  const fileInputControl = fileInput({
    onAddFile: (file) => dispatch(addAssetFile(courseId, file, totalCount)),
    onError: () => dispatch(updateAddingStatus({ status: RequestStatus.FAILED })),
    setSelectedRowCount,
    setAddOpen,
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
    setSelectedRowCount(selectedFlatRows.length);
    setDeleteOpen();
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
    /* ********** TODO ***********
     * implement a zip file function when there are multiple files
    */
  };

  const handleLockedAsset = (assetId, locked) => {
    dispatch(updateAssetLock({ courseId, assetId, locked }));
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
    return (
      <div data-testid="under-construction-placeholder" className="row justify-contnt-center m-6">
        <Placeholder />
      </div>
    );
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
          defaultColumnValues={{ Filter: TextFilter }}
          dataViewToggleOptions={{
            isDataViewToggleEnabled: true,
            onDataViewToggle: val => setCurrentView(val),
            defaultActiveStateValue: defaultVal,
            togglePlacement: 'left',
          }}
          initialState={{
            pageSize: 50,
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
              data-testid="files-dropzone"
              onProcessUpload={handleDropzoneAsset}
              maxSize={20 * 1048576}
              errorMessages={{
                invalidSize: 'The file size must be less than 20MB.',
                multipleDragged: 'Cannot upload more than one file.',
              }}
            />
          ) : (
            <div data-testid="files-data-table">
              <DataTable.TableControlBar />
              { currentView === 'card' && <CardView CardComponent={fileCard} columnSizes={columnSizes} selectionPlacement="left" skeletonCardCount={4} /> }
              { currentView === 'list' && <CardView CardComponent={fileCard} columnSizes={{ xs: 12 }} selectionPlacement="left" skeletonCardCount={4} /> }
              <DataTable.EmptyTable content="No results found" />
              <DataTable.TableFooter />
              <ApiStatusToast
                actionType="deleted"
                apiStatus={deleteAssetStatus}
                selectedRowCount={selectedRowCount}
                isOpen={isDeleteOpen}
                setClose={setDeleteClose}
                setSelectedRowCount={setSelectedRowCount}
              />
              <ApiStatusToast
                actionType="added"
                apiStatus={addAssetStatus}
                selectedRowCount={selectedRowCount}
                isOpen={isAddOpen}
                setClose={setAddClose}
                setSelectedRowCount={setSelectedRowCount}
              />
            </div>
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
