import React from 'react';
import { useSelector } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import {
  act, fireEvent, render, waitFor,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';

import initializeStore from '../store';
import { studioHomeMock } from '../studio-home/__mocks__';
import { getStudioHomeApiUrl } from '../studio-home/data/api';
import { RequestStatus } from '../data/constants';
import messages from './messages';
import CourseRerun from '.';

let axiosMock;
let store;
const mockPathname = '/foo-bar';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

const RootWrapper = () => (
  <MemoryRouter>
    <AppProvider store={store} wrapWithRouter={false}>
      <IntlProvider locale="en">
        <CourseRerun intl={injectIntl} />
      </IntlProvider>
    </AppProvider>
  </MemoryRouter>
);

describe('<CourseRerun />', () => {
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
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);
    useSelector.mockReturnValue(studioHomeMock);
  });

  it('should render successfully', () => {
    const { getByText, getAllByRole } = render(<RootWrapper />);
    expect(getByText(messages.rerunTitle.defaultMessage));
    expect(getAllByRole('button', { name: messages.cancelButton.defaultMessage }).length).toBe(2);
  });

  it('should navigate to /home on cancel button click', () => {
    const { getAllByRole } = render(<RootWrapper />);
    const cancelButton = getAllByRole('button', { name: messages.cancelButton.defaultMessage })[0];

    fireEvent.click(cancelButton);
    waitFor(() => {
      expect(window.location.pathname).toBe('/home');
    });
  });

  it('shows the spinner before the query is complete', async () => {
    useSelector.mockReturnValue({ organizationLoadingStatus: RequestStatus.IN_PROGRESS });

    await act(async () => {
      const { getByRole } = render(<RootWrapper />);
      const spinner = getByRole('status');
      expect(spinner.textContent).toEqual('Loading...');
    });
  });

  it('should show footer', () => {
    const { getByText } = render(<RootWrapper />);
    expect(getByText('Looking for help with Studio?')).toBeInTheDocument();
    expect(getByText('LMS')).toHaveAttribute('href', process.env.LMS_BASE_URL);
  });
});
