import React from 'react';
import type MockAdapter from 'axios-mock-adapter';
import userEvent from '@testing-library/user-event';

import {
  fireEvent,
  initializeMocks,
  render,
  waitFor,
} from '../../testUtils';
import { studioHomeMock } from '../../studio-home/__mocks__';
import { getStudioHomeApiUrl } from '../../studio-home/data/api';
import { getApiWaffleFlagsUrl } from '../../data/api';
import { CreateLibrary } from '.';
import { getContentLibraryV2CreateApiUrl } from './data/api';

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

describe('<CreateLibrary />', () => {
  beforeEach(() => {
    axiosMock = initializeMocks().axiosMock;
    axiosMock
      .onGet(getApiWaffleFlagsUrl(undefined))
      .reply(200, {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    axiosMock.restore();
  });

  test('call api data with correct data', async () => {
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);
    axiosMock.onPost(getContentLibraryV2CreateApiUrl()).reply(200, {
      id: 'library-id',
    });

    const { getByRole } = render(<CreateLibrary />);

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

  test('cannot create new org unless allowed', async () => {
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);
    axiosMock.onPost(getContentLibraryV2CreateApiUrl()).reply(200, {
      id: 'library-id',
    });

    const { getByRole, getByText } = render(<CreateLibrary />);

    const titleInput = getByRole('textbox', { name: /library name/i });
    userEvent.click(titleInput);
    userEvent.type(titleInput, 'Test Library Name');

    const orgInput = getByRole('combobox', { name: /organization/i });
    userEvent.click(orgInput);
    userEvent.type(orgInput, 'NewOrg');
    userEvent.tab();

    const slugInput = getByRole('textbox', { name: /library id/i });
    userEvent.click(slugInput);
    userEvent.type(slugInput, 'test_library_slug');

    fireEvent.click(getByRole('button', { name: /create/i }));
    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(0);
    });
    expect(getByText('Required field.')).toBeInTheDocument();
  });

  test('can create new org if allowed', async () => {
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, {
      ...studioHomeMock,
      allow_to_create_new_org: true,
      allowToCreateNewOrg: true,
    });
    axiosMock.onPost(getContentLibraryV2CreateApiUrl()).reply(200, {
      id: 'library-id',
    });

    const { getByRole } = render(<CreateLibrary />);

    const titleInput = getByRole('textbox', { name: /library name/i });
    userEvent.click(titleInput);
    userEvent.type(titleInput, 'Test Library Name');

    const orgInput = getByRole('combobox', { name: /organization/i });
    userEvent.click(orgInput);
    userEvent.type(orgInput, 'NewOrg');
    userEvent.tab();

    const slugInput = getByRole('textbox', { name: /library id/i });
    userEvent.click(slugInput);
    userEvent.type(slugInput, 'test_library_slug');

    fireEvent.click(getByRole('button', { name: /create/i }));
    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].data).toBe(
        '{"description":"","title":"Test Library Name","org":"NewOrg","slug":"test_library_slug"}',
      );
      expect(mockNavigate).toHaveBeenCalledWith('/library/library-id');
    });
  });

  test('show api error', async () => {
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);
    axiosMock.onPost(getContentLibraryV2CreateApiUrl()).reply(400, {
      field: 'Error message',
    });
    const { getByRole, getByTestId } = render(<CreateLibrary />);

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
    const { getByRole } = render(<CreateLibrary />);

    fireEvent.click(getByRole('button', { name: /cancel/i }));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/libraries');
    });
  });
});
