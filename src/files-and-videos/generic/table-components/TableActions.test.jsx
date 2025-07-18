import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { DataTableContext } from '@openedx/paragon';
import { initializeMocks, render } from '../../../testUtils';
import TableActions from './TableActions';
import messages from '../messages';

const defaultProps = {
  selectedFlatRows: [],
  fileInputControl: { click: jest.fn() },
  handleOpenDeleteConfirmation: jest.fn(),
  handleBulkDownload: jest.fn(),
  encodingsDownloadUrl: null,
  handleSort: jest.fn(),
  fileType: 'video',
  setInitialState: jest.fn(),
};

const mockColumns = [
  {
    id: 'wrapperType',
    Header: 'Type',
    accessor: 'wrapperType',
    filter: 'includes',
  },
];

const renderWithContext = (props = {}, contextOverrides = {}) => {
  const contextValue = {
    state: {
      selectedRowIds: {},
      filters: [],
      ...contextOverrides.state,
    },
    clearSelection: jest.fn(),
    gotoPage: jest.fn(),
    setAllFilters: jest.fn(),
    columns: mockColumns,
    ...contextOverrides,
  };

  return render(
    <DataTableContext.Provider value={contextValue}>
      <TableActions {...defaultProps} {...props} />
    </DataTableContext.Provider>,
  );
};

describe('TableActions', () => {
  beforeEach(() => {
    initializeMocks();
    jest.clearAllMocks();
  });

  test('renders buttons and dropdown', () => {
    renderWithContext();

    expect(screen.getByRole('button', { name: messages.sortButtonLabel.defaultMessage })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.actionsButtonLabel.defaultMessage })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: messages.addFilesButtonLabel.defaultMessage.replace('{fileType}', 'video') })).toBeInTheDocument();
  });

  test('disables bulk and delete actions if no rows selected', () => {
    renderWithContext();

    fireEvent.click(screen.getByRole('button', { name: messages.actionsButtonLabel.defaultMessage }));

    const downloadOption = screen.getByText(messages.downloadTitle.defaultMessage);
    const deleteButton = screen.getByTestId('open-delete-confirmation-button');

    expect(downloadOption).toHaveAttribute('aria-disabled', 'true');
    expect(downloadOption).toHaveClass('disabled');

    expect(deleteButton).toHaveAttribute('aria-disabled', 'true');
    expect(deleteButton).toHaveClass('disabled');
  });

  test('enables bulk and delete actions when rows are selected', () => {
    renderWithContext({
      selectedFlatRows: [{ original: { id: '1', displayName: 'Video 1', wrapperType: 'video' } }],
    });

    fireEvent.click(screen.getByRole('button', { name: messages.actionsButtonLabel.defaultMessage }));
    expect(screen.getByText(messages.downloadTitle.defaultMessage)).not.toBeDisabled();
    expect(screen.getByTestId('open-delete-confirmation-button')).not.toBeDisabled();
  });

  test('calls file input click and clears selection when add button clicked', () => {
    const mockClick = jest.fn();
    const mockClear = jest.fn();

    renderWithContext({ fileInputControl: { click: mockClick } }, {}, mockClear);
    fireEvent.click(screen.getByRole('button', { name: messages.addFilesButtonLabel.defaultMessage.replace('{fileType}', 'video') }));
    expect(mockClick).toHaveBeenCalled();
  });

  test('opens sort modal when sort button clicked', () => {
    renderWithContext();
    fireEvent.click(screen.getByRole('button', { name: messages.sortButtonLabel.defaultMessage }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  test('calls handleBulkDownload when selected and clicked', () => {
    const handleBulkDownload = jest.fn();
    renderWithContext({
      selectedFlatRows: [{ original: { id: '1', displayName: 'Video 1', wrapperType: 'video' } }],
      handleBulkDownload,
    });

    fireEvent.click(screen.getByRole('button', { name: messages.actionsButtonLabel.defaultMessage }));
    fireEvent.click(screen.getByText(messages.downloadTitle.defaultMessage));
    expect(handleBulkDownload).toHaveBeenCalled();
  });

  test('calls handleOpenDeleteConfirmation when clicked', () => {
    const handleOpenDeleteConfirmation = jest.fn();
    const selectedFlatRows = [{ original: { id: '1', displayName: 'Video 1', wrapperType: 'video' } }];
    renderWithContext({
      selectedFlatRows,
      handleOpenDeleteConfirmation,
    });

    fireEvent.click(screen.getByRole('button', { name: messages.actionsButtonLabel.defaultMessage }));
    fireEvent.click(screen.getByTestId('open-delete-confirmation-button'));
    expect(handleOpenDeleteConfirmation).toHaveBeenCalledWith(selectedFlatRows);
  });

  test('shows encoding download link when provided', () => {
    const encodingsDownloadUrl = '/some/path/to/encoding.zip';
    renderWithContext({ encodingsDownloadUrl });

    fireEvent.click(screen.getByRole('button', { name: messages.actionsButtonLabel.defaultMessage }));
    expect(screen.getByRole('link', { name: messages.downloadEncodingsTitle.defaultMessage })).toHaveAttribute('href', expect.stringContaining(encodingsDownloadUrl));
  });
});
