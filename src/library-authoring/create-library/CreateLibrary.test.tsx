import React from 'react';
import MockAdapter from 'axios-mock-adapter';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import initializeStore from '../../store';
import { CreateLibrary } from '.';
import { getContentLibraryV2CreateApiUrl } from './data/api';

let store;
const mockNavigate = jest.fn();
let axiosMock: MockAdapter;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../generic/data/apiHooks', () => ({
  ...jest.requireActual('../../generic/data/apiHooks'),
  useOrganizationListData: () => ({
    data: ['org1', 'org2', 'org3', 'org4', 'org5'],
    isLoading: false,
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <QueryClientProvider client={queryClient}>
        <CreateLibrary />
      </QueryClientProvider>
    </IntlProvider>
  </AppProvider>
);

describe('<CreateLibrary />', () => {
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

    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  afterEach(() => {
    jest.clearAllMocks();
    axiosMock.restore();
    queryClient.clear();
  });

  test('call api data with correct data', async () => {
    axiosMock.onPost(getContentLibraryV2CreateApiUrl()).reply(200, {
      id: 'library-id',
    });

    const { getByRole } = render(<RootWrapper />);

    const titleInput = getByRole('textbox', { name: /library name/i });
    userEvent.click(titleInput);
    userEvent.type(titleInput, 'Test Library Name');

    const orgInput = getByRole('combobox', { name: /organization/i });
    userEvent.click(orgInput);
    userEvent.type(orgInput, 'org1');
    userEvent.tab();

    const slugInput = getByRole('textbox', { name: /library id/i });
    userEvent.click(slugInput);
    userEvent.type(slugInput, 'test_library_slug');

    fireEvent.click(getByRole('button', { name: /create/i }));
    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].data).toBe(
        '{"description":"","title":"Test Library Name","org":"org1","slug":"test_library_slug"}',
      );
      expect(mockNavigate).toHaveBeenCalledWith('/library/library-id');
    });
  });

  test('show api error', async () => {
    axiosMock.onPost(getContentLibraryV2CreateApiUrl()).reply(400, {
      field: 'Error message',
    });
    const { getByRole, getByTestId } = render(<RootWrapper />);

    const titleInput = getByRole('textbox', { name: /library name/i });
    userEvent.click(titleInput);
    userEvent.type(titleInput, 'Test Library Name');

    const orgInput = getByTestId('autosuggest-textbox-input');
    userEvent.click(orgInput);
    userEvent.type(orgInput, 'org1');
    userEvent.tab();

    const slugInput = getByRole('textbox', { name: /library id/i });
    userEvent.click(slugInput);
    userEvent.type(slugInput, 'test_library_slug');

    fireEvent.click(getByRole('button', { name: /create/i }));
    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].data).toBe(
        '{"description":"","title":"Test Library Name","org":"org1","slug":"test_library_slug"}',
      );
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(getByRole('alert')).toHaveTextContent('Request failed with status code 400');
      expect(getByRole('alert')).toHaveTextContent('{"field":"Error message"}');
    });
  });

  test('cancel creating library navigates to libraries page', async () => {
    const { getByRole } = render(<RootWrapper />);

    fireEvent.click(getByRole('button', { name: /cancel/i }));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/libraries');
    });
  });
});
