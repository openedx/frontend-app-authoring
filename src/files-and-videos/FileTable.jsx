import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
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
import { sortFiles } from './data/utils';
import messages from './messages';

import FileInfo from './FileInfo';
import FileInput, { useFileInput } from './FileInput';
import {
  GalleryCard,
  TableActions,
} from './table-components';
import ApiStatusToast from './ApiStatusToast';
import FilterStatus from './table-components/FilterStatus';
import MoreInfoColumn from './table-components/table-custom-columns/MoreInfoColumn';

const FileTable = ({
  files,
  data,
  handleAddFile,
  handleLockFile,
  handleDeleteFile,
  handleDownloadFile,
  handleUsagePaths,
  handleErrorReset,
  handleFileOrder,
  tableColumns,
  maxFileSize,
  thumbnailPreview,
  // injected
  intl,
}) => {
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
    encodingsDownloadUrl,
    supportedFileFormats,
  } = data;
  useEffect(() => {
    if (!isEmpty(selectedRows) && Object.keys(selectedRows[0]).length > 0) {
      const udpatedRows = [];
      selectedRows.forEach(row => {
        const currentFile = row.original;
        const [updatedFile] = files.filter(file => file.id === currentFile.id);
        udpatedRows.push({ original: updatedFile });
      });
      setSelectedRows(udpatedRows);
    }
  }, [files]);

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
    const newFileIdOrder = sortFiles(files, sortType);
    handleFileOrder({ newFileIdOrder, sortType });
  };

  const handleBulkDelete = () => {
    closeDeleteConfirmation();
    setDeleteOpen();
    handleErrorReset({ errorType: 'delete' });
    const fileIdsToDelete = selectedRows.map(row => row.original.id);
    fileIdsToDelete.forEach(id => handleDeleteFile(id));
    setSelectedRows([]);
  };

  const handleBulkDownload = useCallback(async (selectedFlatRows) => {
    handleErrorReset({ errorType: 'download' });
    handleDownloadFile(selectedFlatRows);
  }, []);

  const handleLockedFile = (fileId, locked) => {
    handleErrorReset({ errorType: 'lock' });
    handleLockFile({ fileId, locked });
  };

  const handleOpenDeleteConfirmation = (selectedFlatRows) => {
    setSelectedRows(selectedFlatRows);
    openDeleteConfirmation();
  };

  const handleOpenFileInfo = (original) => {
    handleErrorReset({ errorType: 'usageMetrics' });
    setSelectedRows([{ original }]);
    handleUsagePaths(original);
    openAssetInfo();
  };

  const headerActions = ({ selectedFlatRows }) => (
    <TableActions
      {...{
        selectedFlatRows,
        fileInputControl,
        encodingsDownloadUrl,
        handleSort,
        handleBulkDownload,
        handleOpenDeleteConfirmation,
        supportedFileFormats,
      }}
    />
  );

  const fileCard = ({ className, original }) => (
    <GalleryCard
      {...{
        handleLockedFile,
        handleBulkDownload,
        handleOpenDeleteConfirmation,
        handleOpenFileInfo,
        thumbnailPreview,
        className,
        original,
      }}
    />
  );

  const moreInfoColumn = {
    id: 'moreInfo',
    Header: '',
    Cell: ({ row }) => MoreInfoColumn({
      row,
      handleLock: handleLockedFile,
      handleBulkDownload,
      handleOpenFileInfo,
      handleOpenDeleteConfirmation,
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
        FilterStatusComponent={FilterStatus}
      >
        {isEmpty(files) && loadingStatus !== RequestStatus.IN_PROGRESS ? (
          <Dropzone
            data-testid="files-dropzone"
            accept={supportedFileFormats}
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
          </div>
        )}

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
      </DataTable>
      <FileInput key="generic-file-upload" fileInput={fileInputControl} supportedFileFormats={supportedFileFormats} />
      {!isEmpty(selectedRows) && (
        <FileInfo
          file={selectedRows[0].original}
          onClose={closeAssetinfo}
          isOpen={isAssetInfoOpen}
          handleLockedFile={handleLockedFile}
          thumbnailPreview={thumbnailPreview}
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
  data: PropTypes.shape({
    totalCount: PropTypes.number.isRequired,
    fileIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    loadingStatus: PropTypes.string.isRequired,
    usagePathStatus: PropTypes.string.isRequired,
    usageErrorMessages: PropTypes.arrayOf(PropTypes.string).isRequired,
    encodingsDownloadUrl: PropTypes.string,
    supportedFileFormats: PropTypes.shape({}),
  }).isRequired,
  handleAddFile: PropTypes.func.isRequired,
  handleDeleteFile: PropTypes.func.isRequired,
  handleDownloadFile: PropTypes.func.isRequired,
  handleUsagePaths: PropTypes.func.isRequired,
  handleLockFile: PropTypes.func,
  handleErrorReset: PropTypes.func.isRequired,
  handleFileOrder: PropTypes.func.isRequired,
  tableColumns: PropTypes.arrayOf(PropTypes.shape({
    Header: PropTypes.string,
    accessor: PropTypes.string,
  })).isRequired,
  maxFileSize: PropTypes.number.isRequired,
  thumbnailPreview: PropTypes.func.isRequired,
  // injected
  intl: intlShape.isRequired,
};

FileTable.defaultProps = {
  files: null,
  handleLockFile: () => {},
};

export default injectIntl(FileTable);
