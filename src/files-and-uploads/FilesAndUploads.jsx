import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import { injectIntl, FormattedMessage, intlShape } from '@edx/frontend-platform/i18n';
import {
  DataTable,
  TextFilter,
  CheckboxFilter,
  Dropzone,
  CardView,
  useToggle,
  AlertModal,
  ActionRow,
  Button,
} from '@edx/paragon';
import Placeholder, { ErrorAlert } from '@edx/frontend-lib-content-components';

import { RequestStatus } from '../data/constants';
import { useModels } from '../generic/model-store';
import {
  addAssetFile,
  deleteAssetFile,
  fetchAssets,
  getUsagePaths,
  updateAssetLock,
  updateAssetOrder,
} from './data/thunks';
import { sortFiles } from './data/utils';
import messages from './messages';

import FileInfo from './FileInfo';
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
  const columnSizes = {
    xs: 12,
    sm: 6,
    md: 4,
    lg: 2,
  };
  const [currentView, setCurrentView] = useState(defaultVal);
  const [isDeleteOpen, setDeleteOpen, setDeleteClose] = useToggle(false);
  const [isAssetInfoOpen, openAssetInfo, closeAssetinfo] = useToggle(false);
  const [isAddOpen, setAddOpen, setAddClose] = useToggle(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDeleteConfirmationOpen, openDeleteConfirmation, closeDeleteConfirmation] = useToggle(false);

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
  const fileInputControl = fileInput({
    onAddFile: (file) => dispatch(addAssetFile(courseId, file, totalCount)),
    setSelectedRows,
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

  const handleSort = (sortType) => {
    const newAssetIdOrder = sortFiles(assets, sortType);
    dispatch(updateAssetOrder(courseId, newAssetIdOrder, sortType));
  };

  const handleBulkDelete = () => {
    closeDeleteConfirmation();
    setDeleteOpen();
    const assetIdsToDelete = selectedRows.map(row => row.original.id);
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

  const handleOpenDeleteConfirmation = (selectedFlatRows) => {
    setSelectedRows(selectedFlatRows);
    openDeleteConfirmation();
  };

  const handleOpenAssetInfo = (original) => {
    setSelectedRows([{ original }]);
    dispatch(getUsagePaths({ asset: original, courseId, setSelectedRows }));
    openAssetInfo();
  };

  const headerActions = ({ selectedFlatRows }) => (
    <TableActions
      {...{
        selectedFlatRows,
        fileInputControl,
        handleSort,
        handleBulkDownload,
        handleOpenDeleteConfirmation,
      }}
    />
  );

  const fileCard = ({ className, original }) => {
    if (currentView === defaultVal) {
      return (
        <GalleryCard
          {...{
            handleLockedAsset,
            handleOpenDeleteConfirmation,
            handleOpenAssetInfo,
            className,
            original,
          }}
        />
      );
    }
    return (
      <ListCard
        {...{
          handleLockedAsset,
          handleOpenDeleteConfirmation,
          handleOpenAssetInfo,
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
      <main className="containerpt-5">
        <div className="p-4">
          <ErrorAlert
            hideHeading={false}
            isError={addAssetStatus === RequestStatus.FAILED}
          >
            <ul className="p-0">
              {errorMessages.upload.map(message => (
                <li style={{ listStyle: 'none' }}>
                  {intl.formatMessage(messages.errorAlertMessage, { message })}
                </li>
              ))}
            </ul>
          </ErrorAlert>
          <ErrorAlert
            hideHeading={false}
            isError={deleteAssetStatus === RequestStatus.FAILED}
          >
            <ul className="p-0">
              {errorMessages.delete.map(message => (
                <li style={{ listStyle: 'none' }}>
                  {intl.formatMessage(messages.errorAlertMessage, { message })}
                </li>
              ))}
            </ul>
          </ErrorAlert>
          <ErrorAlert
            hideHeading={false}
            isError={updateAssetStatus === RequestStatus.FAILED}
          >
            <ul className="p-0">
              {errorMessages.lock.map(message => (
                <li style={{ listStyle: 'none' }}>
                  {intl.formatMessage(messages.errorAlertMessage, { message })}
                </li>
              ))}
            </ul>

          </ErrorAlert>
          <div className="h2">
            <FormattedMessage {...messages.heading} />
          </div>
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
          {isEmpty(assets) && loadingStatus !== RequestStatus.IN_PROGRESS ? (
            <Dropzone
              data-testid="files-dropzone"
              onProcessUpload={handleDropzoneAsset}
              maxSize={20 * 1048576}
              errorMessages={{
                invalidSize: intl.formatMessage(messages.fileSizeError),
                multipleDragged: 'Dropzone can only upload a single file.',
              }}
            />
          ) : (
            <div data-testid="files-data-table" className="mr-4 ml-3">
              <DataTable.TableControlBar />
              { currentView === 'card' && <CardView CardComponent={fileCard} columnSizes={columnSizes} selectionPlacement="left" skeletonCardCount={6} /> }
              { currentView === 'list' && <CardView CardComponent={fileCard} columnSizes={{ xs: 12 }} selectionPlacement="left" skeletonCardCount={4} /> }
              <DataTable.EmptyTable content={intl.formatMessage(messages.noResultsFoundMessage)} />
              <DataTable.TableFooter />
              <ApiStatusToast
                actionType={intl.formatMessage(messages.apiStatusDeletingAction)}
                selectedRowCount={selectedRows.length}
                isOpen={isDeleteOpen}
                setClose={setDeleteClose}
                setSelectedRows={setSelectedRows}
              />
              <ApiStatusToast
                actionType={intl.formatMessage(messages.apiStatusAddingAction)}
                selectedRowCount={selectedRows.length}
                isOpen={isAddOpen}
                setClose={setAddClose}
                setSelectedRows={setSelectedRows}
              />
            </div>
          )}
        </DataTable>
        <FileInput fileInput={fileInputControl} />
        {!isEmpty(selectedRows) && (
          <FileInfo
            asset={selectedRows[0].original}
            onClose={closeAssetinfo}
            isOpen={isAssetInfoOpen}
            handleLockedAsset={handleLockedAsset}
            usagePathStatus={usagePathStatus}
            error={errorMessages.usageMetrics}
          />
        )}
        <AlertModal
          title={intl.formatMessage(messages.deleteConfirmationTitle)}
          isOpen={isDeleteConfirmationOpen}
          onClose={closeDeleteConfirmation}
          footerNode={(
            <ActionRow>
              <Button variant="tertiary" onClick={closeDeleteConfirmation}>
                {intl.formatMessage(messages.cancelButtonLabel)}
              </Button>
              <Button onClick={handleBulkDelete}>
                {intl.formatMessage(messages.deleteFileButtonLabel)}
              </Button>
            </ActionRow>
          )}
        >
          {intl.formatMessage(messages.deleteConfirmationMessage, { fileNumber: selectedRows.length })}
        </AlertModal>
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
