import React from 'react';
import type MockAdapter from 'axios-mock-adapter';
import userEvent from '@testing-library/user-event';

import {
  act,
  fireEvent,
  initializeMocks,
  render,
  screen,
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

    render(<CreateLibrary />);

    const titleInput = await screen.findByRole('textbox', { name: /library name/i });
    userEvent.click(titleInput);
    userEvent.type(titleInput, 'Test Library Name');

    const orgInput = await screen.findByRole('combobox', { name: /organization/i });
    userEvent.click(orgInput);
    userEvent.type(orgInput, 'org1');
    act(() => userEvent.tab());

    const slugInput = await screen.findByRole('textbox', { name: /library id/i });
    userEvent.click(slugInput);
    userEvent.type(slugInput, 'test_library_slug');

    fireEvent.click(await screen.findByRole('button', { name: /create/i }));
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

    render(<CreateLibrary />);

    const titleInput = await screen.findByRole('textbox', { name: /library name/i });
    userEvent.click(titleInput);
    userEvent.type(titleInput, 'Test Library Name');

    // We cannot create a new org, and so we're restricted to the allowed list
    const orgOptions = screen.getByTestId('autosuggest-iconbutton');
    userEvent.click(orgOptions);
    expect(screen.getByText('org1')).toBeInTheDocument();
    ['org2', 'org3', 'org4', 'org5'].forEach((org) => expect(screen.queryByText(org)).not.toBeInTheDocument());

    const orgInput = await screen.findByRole('combobox', { name: /organization/i });
    userEvent.click(orgInput);
    userEvent.type(orgInput, 'NewOrg');
    act(() => userEvent.tab());

    const slugInput = await screen.findByRole('textbox', { name: /library id/i });
    userEvent.click(slugInput);
    userEvent.type(slugInput, 'test_library_slug');

    fireEvent.click(await screen.findByRole('button', { name: /create/i }));
    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(0);
    });
    expect(await screen.findByText('Required field.')).toBeInTheDocument();
  });

  test('can create new org if allowed', async () => {
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, {
      ...studioHomeMock,
      allow_to_create_new_org: true,
    });
    axiosMock.onPost(getContentLibraryV2CreateApiUrl()).reply(200, {
      id: 'library-id',
    });

    render(<CreateLibrary />);

    const titleInput = await screen.findByRole('textbox', { name: /library name/i });
    userEvent.click(titleInput);
    userEvent.type(titleInput, 'Test Library Name');

    // We can create a new org, so we're also allowed to use any existing org
    const orgOptions = screen.getByTestId('autosuggest-iconbutton');
    userEvent.click(orgOptions);
    ['org1', 'org2', 'org3', 'org4', 'org5'].forEach((org) => expect(screen.queryByText(org)).toBeInTheDocument());

    const orgInput = await screen.findByRole('combobox', { name: /organization/i });
    userEvent.click(orgInput);
    userEvent.type(orgInput, 'NewOrg');
    act(() => userEvent.tab());

    const slugInput = await screen.findByRole('textbox', { name: /library id/i });
    userEvent.click(slugInput);
    userEvent.type(slugInput, 'test_library_slug');

    fireEvent.click(await screen.findByRole('button', { name: /create/i }));
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
    render(<CreateLibrary />);

    const titleInput = await screen.findByRole('textbox', { name: /library name/i });
    userEvent.click(titleInput);
    userEvent.type(titleInput, 'Test Library Name');

    const orgInput = await screen.findByTestId('autosuggest-textbox-input');
    userEvent.click(orgInput);
    userEvent.type(orgInput, 'org1');
    act(() => userEvent.tab());

    const slugInput = await screen.findByRole('textbox', { name: /library id/i });
    userEvent.click(slugInput);
    userEvent.type(slugInput, 'test_library_slug');

    fireEvent.click(await screen.findByRole('button', { name: /create/i }));
    await waitFor(async () => {
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].data).toBe(
        '{"description":"","title":"Test Library Name","org":"org1","slug":"test_library_slug"}',
      );
      expect(mockNavigate).not.toHaveBeenCalled();
      const errorMessage = 'Request failed with status code 400{ "field": "Error message" }';
      expect(await screen.findByRole('alert')).toHaveTextContent(errorMessage);
    });
  });

  test('cancel creating library navigates to libraries page', async () => {
    render(<CreateLibrary />);

    fireEvent.click(await screen.findByRole('button', { name: /cancel/i }));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/libraries');
    });
  });
});
