import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react';
import PropTypes from 'prop-types';

import initializeStore from '../../store';
import { getTaxonomyExportFile } from '../data/api';
import { TaxonomyContext } from '../common/context';
import { planImportTags } from './data/api';
import ImportTagsWizard from './ImportTagsWizard';

let store;

const queryClient = new QueryClient();

jest.mock('../data/api', () => ({
  ...jest.requireActual('../data/api'),
  getTaxonomyExportFile: jest.fn(),
}));

const mockUseImportTagsMutate = jest.fn();

jest.mock('./data/api', () => ({
  ...jest.requireActual('./data/api'),
  planImportTags: jest.fn(),
  useImportTags: jest.fn(() => ({
    ...jest.requireActual('./data/api').useImportTags(),
    mutateAsync: mockUseImportTagsMutate,
  })),
}));

const mockSetToastMessage = jest.fn();
const mockSetAlertProps = jest.fn();
const context = {
  toastMessage: null,
  setToastMessage: mockSetToastMessage,
  alertProps: null,
  setAlertProps: mockSetAlertProps,
};

const taxonomy = {
  id: 1,
  name: 'Test Taxonomy',
};

const RootWrapper = ({ close }) => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <QueryClientProvider client={queryClient}>
        <TaxonomyContext.Provider value={context}>
          <ImportTagsWizard taxonomy={taxonomy} isOpen close={close} />
        </TaxonomyContext.Provider>
      </QueryClientProvider>
    </IntlProvider>
  </AppProvider>
);

RootWrapper.propTypes = {
  close: PropTypes.func.isRequired,
};

describe('<ImportTagsWizard />', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    store = initializeStore();
  });

  it('render the dialog in the first step can close on cancel', async () => {
    const close = jest.fn();
    const { getByTestId } = render(<RootWrapper close={close} />);

    await waitFor(() => {
      expect(getByTestId('export-step')).toBeInTheDocument();
    });

    const cancelButton = getByTestId('cancel-button');
    cancelButton.click();
    expect(close).toHaveBeenCalled();
  });

  it('can export taxonomies from the dialog', async () => {
    const close = jest.fn();
    const { getByTestId } = render(<RootWrapper close={close} />);

    await waitFor(() => {
      expect(getByTestId('export-step')).toBeInTheDocument();
    });

    const exportJsonButton = getByTestId('export-json-button');
    exportJsonButton.click();
    expect(getTaxonomyExportFile).toHaveBeenCalledWith(taxonomy.id, 'json');
    const exportCsvButton = getByTestId('export-csv-button');
    exportCsvButton.click();
    expect(getTaxonomyExportFile).toHaveBeenCalledWith(taxonomy.id, 'csv');
  });

  it.each(['success', 'error'])('an upload taxonomies from the dialog (%p)', async (expectedResult) => {
    const close = jest.fn();
    const { getAllByTestId, getByTestId, getByText } = render(<RootWrapper close={close} />);

    await waitFor(() => {
      expect(getByTestId('export-step')).toBeInTheDocument();
    });

    fireEvent.click(getByTestId('next-button'));

    expect(getByTestId('upload-step')).toBeInTheDocument();

    // Test back button
    fireEvent.click(getByTestId('back-button'));
    expect(getByTestId('export-step')).toBeInTheDocument();
    fireEvent.click(getByTestId('next-button'));
    expect(getByTestId('upload-step')).toBeInTheDocument();

    const importButton = getByTestId('import-button');
    expect(importButton).toBeDisabled();

    // Invalid file type
    const fileTarGz = new File(['file contents'], 'example.tar.gz', { type: 'application/gzip' });
    fireEvent.drop(getByTestId('dropzone'), { dataTransfer: { files: [fileTarGz], types: ['Files'] } });
    expect(importButton).toBeDisabled();
    expect(getByTestId('dropzone')).toBeInTheDocument();

    // Correct file type
    const fileJson = new File(['file contents'], 'example.json', { type: 'application/gzip' });
    fireEvent.drop(getByTestId('dropzone'), { dataTransfer: { files: [fileJson], types: ['Files'] } });
    await waitFor(() => {
      expect(getByTestId('file-info')).toBeInTheDocument();
    });
    expect(getByText('example.json')).toBeInTheDocument();

    // Clear file
    const clearFileButton = getByTestId('clear-file-button');
    clearFileButton.click();
    await waitFor(() => {
      expect(getByTestId('dropzone')).toBeInTheDocument();
    });

    // Reselect file
    fireEvent.drop(getByTestId('dropzone'), { dataTransfer: { files: [fileJson], types: ['Files'] } });
    await waitFor(() => {
      expect(getByTestId('file-info')).toBeInTheDocument();
    });

    planImportTags.mockRejectedValueOnce(new Error('Test error'));
    importButton.click();

    expect(planImportTags).toHaveBeenCalledWith(taxonomy.id, fileJson);
    await waitFor(() => {
      expect(getByText('Test error')).toBeInTheDocument();
    });
    const errorAlert = getByText('Test error');

    // Reselect file to clear the error
    fireEvent.click(getByTestId('clear-file-button'));
    expect(errorAlert).not.toBeInTheDocument();
    fireEvent.drop(getByTestId('dropzone'), { dataTransfer: { files: [fileJson], types: ['Files'] } });

    await waitFor(() => {
      expect(getByTestId('file-info')).toBeInTheDocument();
    });

    const expectedPlan = 'Import plan for Test import taxonomy\n'
      + '--------------------------------\n'
      + '#1: Create a new tag with values (external_id=tag_1, value=Tag 1, parent_id=None).\n'
      + '#2: Create a new tag with values (external_id=tag_2, value=Tag 2, parent_id=None).\n'
      + '#3: Create a new tag with values (external_id=tag_3, value=Tag 3, parent_id=None).\n'
      + '#4: Create a new tag with values (external_id=tag_4, value=Tag 4, parent_id=None).\n'
      + '#5: Delete tag (external_id=old_tag_1)\n'
      + '#6: Delete tag (external_id=old_tag_2)\n';
    planImportTags.mockResolvedValueOnce(expectedPlan);

    expect(importButton).not.toBeDisabled();

    importButton.click();

    await waitFor(() => {
      expect(getByTestId('plan-step')).toBeInTheDocument();
    });

    // Test back button
    fireEvent.click(getByTestId('back-button'));
    expect(getByTestId('upload-step')).toBeInTheDocument();
    planImportTags.mockResolvedValueOnce(expectedPlan);
    fireEvent.click(getByTestId('import-button'));
    await waitFor(() => {
      expect(getByTestId('plan-step')).toBeInTheDocument();
    });

    expect(getAllByTestId('plan-action')).toHaveLength(6);

    fireEvent.click(getByTestId('continue-button'));

    expect(getByTestId('confirm-step')).toBeInTheDocument();

    // Test back button
    fireEvent.click(getByTestId('back-button'));
    expect(getByTestId('plan-step')).toBeInTheDocument();
    fireEvent.click(getByTestId('continue-button'));
    expect(getByTestId('confirm-step')).toBeInTheDocument();

    if (expectedResult === 'success') {
      mockUseImportTagsMutate.mockResolvedValueOnce({});
    } else {
      mockUseImportTagsMutate.mockRejectedValueOnce(new Error('Test error'));
    }

    fireEvent.click(getByTestId('confirm-button'));

    await waitFor(() => {
      expect(mockUseImportTagsMutate).toHaveBeenCalledWith({ taxonomyId: taxonomy.id, file: fileJson });
    });

    if (expectedResult === 'success') {
      // Toast message shown
      expect(mockSetToastMessage).toBeCalledWith(`"${taxonomy.name}" updated`);
    } else {
      // Alert message shown
      expect(mockSetAlertProps).toBeCalledWith(
        expect.objectContaining({
          variant: 'danger',
          title: 'Import error',
          description: 'Test error',
        }),
      );
    }
  });
});
