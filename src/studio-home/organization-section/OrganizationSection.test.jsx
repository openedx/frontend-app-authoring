import React from 'react';
import { useSelector } from 'react-redux';
import { act, fireEvent, render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { fetchOrganizationsQuery } from '../../generic/data/thunks';
import { getOrganizationsUrl } from '../../generic/data/api';
import initializeStore from '../../store';
import { executeThunk } from '../../utils';
import messages from '../messages';
import OrganizationSection from '.';

let store;
let axiosMock;

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <OrganizationSection intl={{ formatMessage: jest.fn() }} />
    </IntlProvider>
  </AppProvider>
);

describe('<OrganizationSection />', () => {
  beforeEach(async () => {
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
    axiosMock.onDelete(getOrganizationsUrl()).reply(200);
    await executeThunk(fetchOrganizationsQuery(), store.dispatch);
    useSelector.mockReturnValue(['edX', 'org']);
  });

  it('renders text content correctly', () => {
    const { getByText } = render(<RootWrapper />);
    expect(getByText(messages.organizationTitle.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.organizationLabel.defaultMessage)).toBeInTheDocument();
    expect(getByText(messages.organizationSubmitBtnText.defaultMessage)).toBeInTheDocument();
  });

  it('should change path after selecting org', () => {
    const selectedOrgStr = 'edX';
    const {
      getByPlaceholderText,
      getByRole,
      getByText,
      getByDisplayValue,
    } = render(<RootWrapper />);

    const orgInput = getByPlaceholderText(messages.organizationInputPlaceholder.defaultMessage);
    act(() => {
      fireEvent.click(orgInput);
    });

    const selectedOrg = getByText(selectedOrgStr);
    act(() => {
      fireEvent.click(selectedOrg);
    });

    const submitButton = getByRole('button', { name: messages.organizationSubmitBtnText.defaultMessage });
    act(() => {
      fireEvent.click(submitButton);
    });

    expect(window.location.pathname).toBe('/home');
    expect(window.location.search).toBe(`?org=${selectedOrgStr}`);
    expect(getByDisplayValue(selectedOrgStr)).toBeInTheDocument();
  });
});
