import {
  render,
  screen,
  within,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import DeleteConfirmationModal from './DeleteConfirmationModal';

const defaultProps = {
  isDeleteConfirmationOpen: true,
  closeDeleteConfirmation: jest.fn(),
  handleBulkDelete: jest.fn(),
  selectedRows: [{
    original: {
      displayName: 'test',
      activeStatus: 'active',
      id: 'file-test',
      usageLocations: [{
        displayLocation: 'unit', url: 'unit/url',
      }],
    },
  }],
  fileType: 'file',
};

const renderComponent = (props) => {
  render(
    <IntlProvider locale="en">
      <DeleteConfirmationModal {...props} />
    </IntlProvider>,
  );
};

describe('DeleteConfirmationModal', () => {
  it('should show file name in title', () => {
    renderComponent(defaultProps);
    const { displayName } = defaultProps.selectedRows[0].original;

    expect(screen.getByText(`Delete ${displayName}`)).toBeInTheDocument();
  });

  it('should show number of files in title', () => {
    const props = {
      ...defaultProps,
      selectedRows: [
        ...defaultProps.selectedRows,
        { original: { displayName: 'test 2', activeStatus: 'inactive' } },
      ],
    };

    renderComponent(props);
    const numberOfFiles = props.selectedRows.length;

    expect(screen.getByText(`Delete ${numberOfFiles} ${defaultProps.fileType}s`)).toBeInTheDocument();
  });

  it('should not show delete confirmation usage list', () => {
    const props = {
      ...defaultProps,
      selectedRows: [],
    };
    renderComponent(props);

    expect(screen.queryByRole('list')).toBeNull();
  });

  it('should show test file in delete confirmation usage list', () => {
    renderComponent(defaultProps);
    const deleteUsageList = screen.getByRole('list');

    expect(within(deleteUsageList).getByTestId('collapsible-file-test')).toBeVisible();
  });

  it('should not show test file in delete confirmation usage list', () => {
    const props = {
      ...defaultProps,
      selectedRows: [
        ...defaultProps.selectedRows,
        { original: { displayName: 'test 2', activeStatus: 'inactive', id: 'file-test2' } },
      ],
    };
    renderComponent(props);
    const deleteUsageList = screen.getByRole('list');

    expect(within(deleteUsageList).queryByTestId('collapsible-file-test2')).toBeNull();
  });
});
