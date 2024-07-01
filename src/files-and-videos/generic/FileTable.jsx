import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  CardView,
  DataTable,
  Dropzone,
  TextFilter,
  useToggle,
} from '@openedx/paragon';

import { RequestStatus } from '../../data/constants';
import { sortFiles } from './utils';
import messages from './messages';

import InfoModal from './InfoModal';
import FileInput, { useFileInput } from './FileInput';
import {
  GalleryCard,
  TableActions,
  RowStatus,
  MoreInfoColumn,
  FilterStatus,
  Footer,
} from './table-components';
import ApiStatusToast from './ApiStatusToast';
import DeleteConfirmationModal from './DeleteConfirmationModal';

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
  infoModalSidebar,
  // injected
  intl,
}) => {
  const defaultVal = 'card';
  const pageCount = Math.ceil(files.length / 50);
  const columnSizes = {
    xs: 12,
    sm: 6,
    md: 4,
    lg: 3,
    xl: 2,
  };
  const [currentView, setCurrentView] = useState(defaultVal);
  const [isDeleteOpen, setDeleteOpen, setDeleteClose] = useToggle(false);
  const [isDownloadOpen, setDownloadOpen, setDownloadClose] = useToggle(false);
  const [isAssetInfoOpen, openAssetInfo, closeAssetinfo] = useToggle(false);
  const [isAddOpen, setAddOpen, setAddClose] = useToggle(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isDeleteConfirmationOpen, openDeleteConfirmation, closeDeleteConfirmation] = useToggle(false);
  const [initialState, setInitialState] = useState({
    filters: [],
    hiddenColumns: [],
    pageIndex: 0,
    pageSize: 50,
    selectedRowIds: {},
    sortBy: [],
  });

  const {
    loadingStatus,
    usagePathStatus,
    usageErrorMessages,
    encodingsDownloadUrl,
    supportedFileFormats,
    fileType,
  } = data;

  useEffect(() => {
    if (!isEmpty(selectedRows) && Object.keys(selectedRows[0]).length > 0) {
      const updatedRows = [];
      selectedRows.forEach(row => {
        const currentFile = row.original;
        if (currentFile) {
          const [updatedFile] = files.filter(file => file.id === currentFile?.id);
          updatedRows.push({ original: updatedFile });
        }
      });
      setSelectedRows(updatedRows);
    }
  }, [files]);

  const fileInputControl = useFileInput({
    onAddFile: (uploads) => handleAddFile(uploads),
    setSelectedRows,
    setAddOpen,
  });
  const handleDropzoneAsset = ({ fileData, handleError }) => {
    try {
      const file = fileData.get('file');
      handleAddFile([file]);
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
  };

  const handleBulkDownload = useCallback(async (selectedFlatRows) => {
    handleErrorReset({ errorType: 'download' });
    setSelectedRows(selectedFlatRows);
    setDownloadOpen();
    handleDownloadFile(selectedFlatRows);
  }, []);

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
        fileType,
        setInitialState,
      }}
    />
  );

  const fileCard = ({ className, original }) => (
    <GalleryCard
      {...{
        handleLockFile,
        handleBulkDownload,
        handleOpenDeleteConfirmation,
        handleOpenFileInfo,
        thumbnailPreview,
        className,
        original,
        fileType,
      }}
    />
  );

  const moreInfoColumn = {
    id: 'moreInfo',
    Header: '',
    Cell: ({ row }) => MoreInfoColumn({
      row,
      handleLock: handleLockFile,
      handleBulkDownload,
      handleOpenFileInfo,
      handleOpenDeleteConfirmation,
      fileType,
    }),
  };

  const hasMoreInfoColumn = tableColumns.filter(col => col.id === 'moreInfo').length === 1;
  if (!hasMoreInfoColumn) {
    tableColumns.push({ ...moreInfoColumn });
  }

  return (
    <div className="files-table">
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
        initialState={initialState}
        tableActions={headerActions}
        bulkActions={headerActions}
        columns={tableColumns}
        itemCount={files.length}
        pageCount={pageCount}
        data={files}
        FilterStatusComponent={FilterStatus}
        RowStatusComponent={RowStatus}
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
          <div data-testid="files-data-table" className="bg-light-200">
            <DataTable.TableControlBar />
            <hr className="mb-5 border-light-700" />
            { currentView === 'card' && <CardView CardComponent={fileCard} columnSizes={columnSizes} selectionPlacement="left" skeletonCardCount={6} /> }
            { currentView === 'list' && <DataTable.Table /> }
            <DataTable.EmptyTable content={intl.formatMessage(messages.noResultsFoundMessage)} />
            <Footer />
          </div>
        )}

        <ApiStatusToast
          actionType={intl.formatMessage(messages.apiStatusDeletingAction)}
          selectedRowCount={selectedRows.length}
          isOpen={isDeleteOpen}
          setClose={setDeleteClose}
          setSelectedRows={setSelectedRows}
          fileType={fileType}
        />

        {fileType === 'files' && (
          <ApiStatusToast
            actionType={intl.formatMessage(messages.apiStatusAddingAction)}
            selectedRowCount={selectedRows.length}
            isOpen={isAddOpen}
            setClose={setAddClose}
            setSelectedRows={setSelectedRows}
            fileType={fileType}
          />
        )}

        <ApiStatusToast
          actionType={intl.formatMessage(messages.apiStatusDownloadingAction)}
          selectedRowCount={selectedRows.length}
          isOpen={isDownloadOpen}
          setClose={setDownloadClose}
          setSelectedRows={setSelectedRows}
          fileType={fileType}
        />
      </DataTable>
      <FileInput key="generic-file-upload" fileInput={fileInputControl} supportedFileFormats={supportedFileFormats} />
      {!isEmpty(selectedRows) && (
        <InfoModal
          file={selectedRows[0].original}
          onClose={closeAssetinfo}
          isOpen={isAssetInfoOpen}
          thumbnailPreview={thumbnailPreview}
          usagePathStatus={usagePathStatus}
          error={usageErrorMessages}
          sidebar={infoModalSidebar}
        />
      )}
      <DeleteConfirmationModal
        {...{
          isDeleteConfirmationOpen,
          closeDeleteConfirmation,
          handleBulkDelete,
          selectedRows,
          fileType,
        }}
      />
    </div>
  );
};

FileTable.propTypes = {
  courseId: PropTypes.string.isRequired,
  files: PropTypes.arrayOf(PropTypes.shape({})),
  data: PropTypes.shape({
    fileIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    loadingStatus: PropTypes.string.isRequired,
    usagePathStatus: PropTypes.string.isRequired,
    usageErrorMessages: PropTypes.arrayOf(PropTypes.string).isRequired,
    encodingsDownloadUrl: PropTypes.string,
    supportedFileFormats: PropTypes.shape({}),
    fileType: PropTypes.string.isRequired,
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
  infoModalSidebar: PropTypes.func.isRequired,
  // injected
  intl: intlShape.isRequired,
};

FileTable.defaultProps = {
  files: null,
  handleLockFile: () => {},
};

export default injectIntl(FileTable);
