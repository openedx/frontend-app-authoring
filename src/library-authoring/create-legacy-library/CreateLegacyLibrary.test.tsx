import React from 'react';
import type MockAdapter from 'axios-mock-adapter';
import userEvent from '@testing-library/user-event';

import {
  initializeMocks,
  render,
  screen,
  waitFor,
} from '@src/testUtils';
import studioHomeMock from '@src/studio-home/__mocks__/studioHomeMock';
import { getStudioHomeApiUrl } from '@src/studio-home/data/api';
import { getApiWaffleFlagsUrl } from '@src/data/api';
import { CreateLegacyLibrary } from '.';
import { getContentLibraryV1CreateApiUrl } from './data/api';

const mockNavigate = jest.fn();
const realWindowLocationAssign = window.location.assign;
let axiosMock: MockAdapter;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@src/generic/data/apiHooks', () => ({
  ...jest.requireActual('@src/generic/data/apiHooks'),
  useOrganizationListData: () => ({
    data: ['org1', 'org2', 'org3', 'org4', 'org5'],
    isLoading: false,
  }),
}));

describe('<CreateLegacyLibrary />', () => {
  beforeEach(() => {
    axiosMock = initializeMocks().axiosMock;
    axiosMock
      .onGet(getApiWaffleFlagsUrl(undefined))
      .reply(200, {});
    Object.defineProperty(window, 'location', {
      value: { assign: jest.fn() },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    axiosMock.restore();
    window.location.assign = realWindowLocationAssign;
  });

  test('call api data with correct data', async () => {
    const user = userEvent.setup();
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);
    axiosMock.onPost(getContentLibraryV1CreateApiUrl()).reply(200, {
      id: 'library-id',
      url: '/library/library-id',
    });

    render(<CreateLegacyLibrary />);

    const titleInput = await screen.findByRole('textbox', { name: /library name/i });
    await user.click(titleInput);
    await user.type(titleInput, 'Test Library Name');

    const orgInput = await screen.findByRole('combobox', { name: /organization/i });
    await user.click(orgInput);
    await user.type(orgInput, 'org1');
    await user.tab();

    const slugInput = await screen.findByRole('textbox', { name: /library id/i });
    await user.click(slugInput);
    await user.type(slugInput, 'test_library_slug');

    await user.click(await screen.findByRole('button', { name: /create/i }));
    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].data).toBe(
        '{"display_name":"Test Library Name","org":"org1","number":"test_library_slug"}',
      );
      expect(window.location.assign).toHaveBeenCalledWith('http://localhost:18010/library/library-id');
    });
  });

  test('cannot create new org unless allowed', async () => {
    const user = userEvent.setup();
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);
    axiosMock.onPost(getContentLibraryV1CreateApiUrl()).reply(200, {
      id: 'library-id',
      url: '/library/library-id',
    });

    render(<CreateLegacyLibrary />);

    const titleInput = await screen.findByRole('textbox', { name: /library name/i });
    await user.click(titleInput);
    await user.type(titleInput, 'Test Library Name');

    // We cannot create a new org, and so we're restricted to the allowed list
    const orgOptions = screen.getByTestId('autosuggest-iconbutton');
    await user.click(orgOptions);
    expect(screen.getByText('org1')).toBeInTheDocument();
    ['org2', 'org3', 'org4', 'org5'].forEach((org) => expect(screen.queryByText(org)).not.toBeInTheDocument());

    const orgInput = await screen.findByRole('combobox', { name: /organization/i });
    await user.click(orgInput);
    await user.type(orgInput, 'NewOrg');
    await user.tab();

    const slugInput = await screen.findByRole('textbox', { name: /library id/i });
    await user.click(slugInput);
    await user.type(slugInput, 'test_library_slug');

    await user.click(await screen.findByRole('button', { name: /create/i }));
    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(0);
    });
    expect(await screen.findByText('Required field.')).toBeInTheDocument();
  });

  test('can create new org if allowed', async () => {
    const user = userEvent.setup();
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, {
      ...studioHomeMock,
      allow_to_create_new_org: true,
    });
    axiosMock.onPost(getContentLibraryV1CreateApiUrl()).reply(200, {
      id: 'library-id',
      url: '/library/library-id',
    });

    render(<CreateLegacyLibrary />);

    const titleInput = await screen.findByRole('textbox', { name: /library name/i });
    await user.click(titleInput);
    await user.type(titleInput, 'Test Library Name');

    // We can create a new org, so we're also allowed to use any existing org
    const orgOptions = screen.getByTestId('autosuggest-iconbutton');
    await user.click(orgOptions);
    ['org1', 'org2', 'org3', 'org4', 'org5'].forEach((org) => expect(screen.queryByText(org)).toBeInTheDocument());

    const orgInput = await screen.findByRole('combobox', { name: /organization/i });
    await user.click(orgInput);
    await user.type(orgInput, 'NewOrg');
    await user.tab();

    const slugInput = await screen.findByRole('textbox', { name: /library id/i });
    await user.click(slugInput);
    await user.type(slugInput, 'test_library_slug');

    await user.click(await screen.findByRole('button', { name: /create/i }));
    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].data).toBe(
        '{"display_name":"Test Library Name","org":"NewOrg","number":"test_library_slug"}',
      );
      expect(window.location.assign).toHaveBeenCalledWith('http://localhost:18010/library/library-id');
    });
  });

  test('show api error', async () => {
    const user = userEvent.setup();
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);
    axiosMock.onPost(getContentLibraryV1CreateApiUrl()).reply(400, {
      field: 'Error message',
    });
    render(<CreateLegacyLibrary />);

    const titleInput = await screen.findByRole('textbox', { name: /library name/i });
    await user.click(titleInput);
    await user.type(titleInput, 'Test Library Name');

    const orgInput = await screen.findByRole('combobox', { name: /organization/i });
    await user.click(orgInput);
    await user.type(orgInput, 'org1');
    await user.tab();

    const slugInput = await screen.findByRole('textbox', { name: /library id/i });
    await user.click(slugInput);
    await user.type(slugInput, 'test_library_slug');

    await user.click(await screen.findByRole('button', { name: /create/i }));
    await waitFor(async () => {
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].data).toBe(
        '{"display_name":"Test Library Name","org":"org1","number":"test_library_slug"}',
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });
    await screen.findByText('Request failed with status code 400');
  });

  test('cancel creating library navigates to libraries page', async () => {
    const user = userEvent.setup();
    render(<CreateLegacyLibrary />);

    await user.click(await screen.findByRole('button', { name: /cancel/i }));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/libraries-v1');
    });
  });
});
