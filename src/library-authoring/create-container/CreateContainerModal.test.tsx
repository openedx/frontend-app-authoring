import React from 'react';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter';

import { useLibraryContext } from '../common/context/LibraryContext';
import { ToastContext, ToastContextData } from '../../generic/toast-context';
import CreateContainerModal from './CreateContainerModal';
import { ContainerType } from '../../generic/key-utils';
import { getLibraryCollectionItemsApiUrl, getLibraryContainerChildrenApiUrl } from '../data/api';

let axiosMock: MockAdapter;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const mockNavigateTo = jest.fn();
const mockShowToast = jest.fn();
const mockCloseToast = jest.fn();

// Mock the useLibraryRoutes hook
const mockUseLibraryRoutes = jest.fn().mockReturnValue({
  navigateTo: mockNavigateTo,
  insideCollection: true,
  insideSection: false,
  insideSubsection: false,
});

jest.mock('../routes', () => ({
  useLibraryRoutes: () => mockUseLibraryRoutes(),
}));

// Mock the useLibraryContext hook
jest.mock('../common/context/LibraryContext', () => ({
  useLibraryContext: jest.fn(),
}));

const defaultLibraryContext = {
  libraryId: 'test-library',
  collectionId: 'test-collection',
  containerId: 'lct:org:lib:unit:test-container',
  setContainerId: jest.fn(),
  readOnly: false,
  isLoadingLibraryData: false,
  showOnlyPublished: false,
  extraFilter: [],
  isCreateCollectionModalOpen: false,
  openCreateCollectionModal: jest.fn(),
  closeCreateCollectionModal: jest.fn(),
  createContainerModalType: ContainerType.Chapter,
  setCreateContainerModalType: jest.fn(),
  componentBeingEdited: undefined,
  openComponentEditor: jest.fn(),
  closeComponentEditor: jest.fn(),
  setCollectionId: jest.fn(),
};

const defaultToastContext: ToastContextData = {
  showToast: mockShowToast,
  closeToast: mockCloseToast,
  toastMessage: null,
  toastAction: undefined,
};

const renderComponent = (
  toastContextValue = defaultToastContext,
) => {
  // Set up the mock implementation for useLibraryContext
  jest.mocked(useLibraryContext).mockReturnValue(defaultLibraryContext);

  return render(
    <QueryClientProvider client={queryClient}>
      <IntlProvider locale="en" messages={{}}>
        <ToastContext.Provider value={toastContextValue}>
          <CreateContainerModal />
        </ToastContext.Provider>
      </IntlProvider>
    </QueryClientProvider>,
  );
};

describe('CreateContainerModal container linking', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'test-user',
        administrator: true,
        roles: [],
      },
    });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    jest.clearAllMocks();

    // Reset the useLibraryRoutes mock to default values
    mockUseLibraryRoutes.mockReturnValue({
      navigateTo: mockNavigateTo,
      insideCollection: true,
      insideSection: false,
      insideSubsection: false,
    });
  });

  it('links container to collection when inside a collection', async () => {
    // Mock the container creation API
    axiosMock.onPost(/\/api\/libraries\/.*\/containers/).reply(200, {
      id: 'lct:org:libId:collection:1',
      displayName: 'Test Container',
    });

    // Mock the collection linking API
    const collectionItemsUrl = getLibraryCollectionItemsApiUrl('test-library', 'test-collection');
    axiosMock.onPatch(collectionItemsUrl).reply(200);

    renderComponent();

    // Fill in the form
    const nameInput = screen.getByLabelText(/name/i);
    await userEvent.type(nameInput, 'Test Container');

    // Submit the form
    const createButton = screen.getByRole('button', { name: /create/i });
    await userEvent.click(createButton);

    // Verify API calls
    await waitFor(() => {
      // Verify container creation call
      expect(axiosMock.history.post).toHaveLength(1);
      expect(axiosMock.history.post[0].url).toMatch(/\/api\/libraries\/.*\/containers/);
      expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
        can_stand_alone: false,
        container_type: 'section',
        display_name: 'Test Container',
      });

      // Verify collection linking call
      expect(axiosMock.history.patch).toHaveLength(1);
      expect(axiosMock.history.patch[0].url).toBe(collectionItemsUrl);
      expect(JSON.parse(axiosMock.history.patch[0].data)).toEqual({
        usage_keys: ['lct:org:libId:collection:1'],
      });

      expect(mockNavigateTo).toHaveBeenCalledWith({ containerId: 'lct:org:libId:collection:1' });
      expect(mockShowToast).toHaveBeenCalled();
    });
  });

  it('links container to section when inside a section', async () => {
    // Mock the container creation API
    axiosMock.onPost(/\/api\/libraries\/.*\/containers/).reply(200, {
      id: 'lct:org:libId:section:1',
      displayName: 'Test Container',
    });

    // Mock the container linking API
    const containerChildrenUrl = getLibraryContainerChildrenApiUrl('lct:org:lib:unit:test-container', false);
    axiosMock.onPost(containerChildrenUrl).reply(200);

    // Override the default context for section test
    jest.mocked(useLibraryContext).mockReturnValue({
      ...defaultLibraryContext,
      collectionId: undefined,
      containerId: 'lct:org:lib:unit:test-container',
    });

    // Update the useLibraryRoutes mock for section test
    mockUseLibraryRoutes.mockReturnValue({
      navigateTo: mockNavigateTo,
      insideCollection: false,
      insideSection: true,
      insideSubsection: false,
    });

    renderComponent();

    // Fill in the form
    const nameInput = screen.getByLabelText('Name your section');
    await userEvent.type(nameInput, 'Test Container');

    // Submit the form
    const createButton = screen.getByRole('button', { name: /create/i });
    await userEvent.click(createButton);

    // Verify API calls
    await waitFor(() => {
      // Verify container creation call
      expect(axiosMock.history.post[0].url).toMatch(/\/api\/libraries\/.*\/containers/);
      expect(JSON.parse(axiosMock.history.post[0].data)).toEqual({
        can_stand_alone: false,
        container_type: 'section',
        display_name: 'Test Container',
      });

      // Verify container linking call
      expect(axiosMock.history.post[1].url).toBe(containerChildrenUrl);
      expect(JSON.parse(axiosMock.history.post[1].data)).toEqual({
        usage_keys: ['lct:org:libId:section:1'],
      });

      expect(mockNavigateTo).toHaveBeenCalledWith({ containerId: 'lct:org:libId:section:1' });
      expect(mockShowToast).toHaveBeenCalled();
    });
  });

  it('handles linking error gracefully', async () => {
    // Mock the API responses - creation succeeds but linking fails
    axiosMock.onPost(/\/api\/libraries\/.*\/containers/).reply(200, {
      id: 'new-container-id',
      displayName: 'Test Container',
    });

    // Mock the collection linking API to fail
    const collectionItemsUrl = getLibraryCollectionItemsApiUrl('test-library', 'test-collection');
    axiosMock.onPatch(collectionItemsUrl).reply(500);

    renderComponent();

    // Fill in the form
    const nameInput = screen.getByLabelText(/name/i);
    await userEvent.type(nameInput, 'Test Container');

    // Submit the form
    const createButton = screen.getByRole('button', { name: /create/i });
    await userEvent.click(createButton);

    // Verify error handling
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(expect.stringMatching(/error/i));
      expect(defaultLibraryContext.setCreateContainerModalType).toHaveBeenCalledWith(undefined);
    });
  });
});
