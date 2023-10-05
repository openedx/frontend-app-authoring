import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  DataTable,
  TextFilter,
  Dropzone,
  CardView,
  useToggle,
  AlertModal,
  ActionRow,
  Button,
} from '@edx/paragon';

import { RequestStatus } from '../data/constants';
import {
  resetErrors,
  getUsagePaths,
  updateAssetOrder,
} from './data/thunks';
import { sortFiles } from './data/utils';
import messages from './messages';

import FileInfo from './FileInfo';
import FileInput, { useFileInput } from './FileInput';
import {
  GalleryCard,
  ListCard,
  TableActions,
} from './table-components';
import ApiStatusToast from './ApiStatusToast';
import { clearErrors } from './data/slice';
import MoreInfoColumn from './table-components/table-custom-columns/MoreInfoColumn';

const FileTable = ({
  courseId,
  files,
  data,
  handleAddFile,
  handleLockFile,
  handleDeleteFile,
  handleDownloadFile,
  tableColumns,
  maxFileSize,
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

  const {
    totalCount,
    loadingStatus,
    usagePathStatus,
    usageErrorMessages,
  } = data;
  const fileInputControl = useFileInput({
    onAddFile: (file) => handleAddFile(file),
    setSelectedRows,
    setAddOpen,
  });
  const handleDropzoneAsset = ({ fileData, handleError }) => {
    try {
      const file = fileData.get('file');
      handleAddFile(file);
    } catch (error) {
      handleError(error);
    }
  };

  const handleSort = (sortType) => {
    const newAssetIdOrder = sortFiles(files, sortType);
    dispatch(updateAssetOrder(courseId, newAssetIdOrder, sortType));
  };

  const handleBulkDelete = () => {
    closeDeleteConfirmation();
    setDeleteOpen();
    dispatch(resetErrors({ errorType: 'delete' }));
    const fileIdsToDelete = selectedRows.map(row => row.original.id);
    fileIdsToDelete.forEach(id => handleDeleteFile(id));
  };

  const handleBulkDownload = useCallback(async (selectedFlatRows) => {
    dispatch(resetErrors({ errorType: 'download' }));
    handleDownloadFile(selectedFlatRows);
  }, []);

  const handleLockedAsset = (fileId, locked) => {
    dispatch(clearErrors({ errorType: 'lock' }));
    handleLockFile({ fileId, locked });
  };

  const handleOpenDeleteConfirmation = (selectedFlatRows) => {
    setSelectedRows(selectedFlatRows);
    openDeleteConfirmation();
  };

  const handleOpenAssetInfo = (original) => {
    dispatch(resetErrors({ errorType: 'usageMetrics' }));
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
    if (currentView === 'card') {
      return (
        <GalleryCard
          {...{
            handleLockedAsset,
            handleBulkDownload,
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
          handleBulkDownload,
          handleOpenDeleteConfirmation,
          handleOpenAssetInfo,
          className,
          original,
        }}
      />
    );
  };
  const moreInfoColumn = {
    id: 'moreInfo',
    Header: '',
    Cell: ({ row }) => MoreInfoColumn({
      row,
      handleLock: handleLockedAsset,
      onDownload: handleBulkDownload,
      openAssetInfo: handleOpenAssetInfo,
      openDeleteConfirmation: handleOpenDeleteConfirmation,
    }),
  };

  const hasMoreInfoColumn = tableColumns.filter(col => col.id === 'moreInfo').length === 1;
  if (!hasMoreInfoColumn) {
    tableColumns.push({ ...moreInfoColumn });
  }

  return (
    <>
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
        columns={tableColumns}
        itemCount={totalCount}
        pageCount={Math.ceil(totalCount / 50)}
        data={files}
      >
        {isEmpty(files) && loadingStatus !== RequestStatus.IN_PROGRESS ? (
          <Dropzone
            data-testid="files-dropzone"
            onProcessUpload={handleDropzoneAsset}
            maxSize={maxFileSize}
            errorMessages={{
              invalidSize: intl.formatMessage(messages.fileSizeError),
              multipleDragged: 'Dropzone can only upload a single file.',
            }}
          />
        ) : (
          <div data-testid="files-data-table" className="mr-4 ml-3">
            <DataTable.TableControlBar />
            { currentView === 'card' && <CardView CardComponent={fileCard} columnSizes={columnSizes} selectionPlacement="left" skeletonCardCount={6} /> }
            { currentView === 'list' && <DataTable.Table /> }
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
          error={usageErrorMessages}
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
    </>
  );
};

FileTable.propTypes = {
  courseId: PropTypes.string.isRequired,
  files: PropTypes.arrayOf(PropTypes.shape({})),
  data: PropTypes.arrayOf(PropTypes.shape({
    totalCount: PropTypes.number.isRequired,
    fileIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    loadingStatus: PropTypes.string.isRequired,
    usagePathStatus: PropTypes.string.isRequired,
    usageErrorMessages: PropTypes.arrayOf(PropTypes.string).isRequired,
  })).isRequired,
  handleAddFile: PropTypes.func.isRequired,
  handleDeleteFile: PropTypes.func.isRequired,
  handleDownloadFile: PropTypes.func.isRequired,
  handleLockFile: PropTypes.func.isRequired,
  tableColumns: PropTypes.arrayOf(PropTypes.shape({
    Header: PropTypes.string,
    accessor: PropTypes.string,
  })).isRequired,
  maxFileSize: PropTypes.number.isRequired,
  // injected
  intl: intlShape.isRequired,
};

FileTable.defaultProps = {
  files: null,
};

export default injectIntl(FileTable);
