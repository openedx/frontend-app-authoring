import React from 'react';
import { render, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';

import { helpUrls } from '../../help-urls/__mocks__';
import { getHelpUrlsApiUrl } from '../../help-urls/data/api';
import initializeStore from '../../store';
import OutlineSidebar from './OutlineSidebar';
import messages from './messages';

let axiosMock;
let store;
const mockPathname = '/foo-bar';
const courseId = '123';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: mockPathname,
  }),
}));

jest.mock('@edx/frontend-platform/i18n', () => ({
  ...jest.requireActual('@edx/frontend-platform/i18n'),
  useIntl: () => ({
    formatMessage: (message) => message.defaultMessage,
  }),
}));

const renderComponent = (props) => render(
  <AppProvider store={store} messages={{}}>
    <IntlProvider locale="en">
      <OutlineSidebar courseId={courseId} {...props} />
    </IntlProvider>
  </AppProvider>,
);

describe('<OutlineSidebar />', () => {
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
    axiosMock
      .onGet(getHelpUrlsApiUrl())
      .reply(200, helpUrls);
  });

  it('render OutlineSidebar component correctly', async () => {
    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText(messages.section_1_title.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.section_1_descriptions_1.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.section_1_descriptions_2.defaultMessage)).toBeInTheDocument();

      expect(getByText(messages.section_2_title.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.section_2_descriptions_1.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.section_2_link.defaultMessage)).toBeInTheDocument();

      expect(getByText(messages.section_3_title.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.section_3_descriptions_1.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.section_3_link.defaultMessage)).toBeInTheDocument();

      expect(getByText(messages.section_4_title.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.section_4_descriptions_1.defaultMessage)).toBeInTheDocument();

      expect(getByText(messages.section_4_descriptions_2.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.section_4_descriptions_3.defaultMessage)).toBeInTheDocument();

      expect(getByText(messages.section_4_link.defaultMessage)).toBeInTheDocument();
    });
  });
});
