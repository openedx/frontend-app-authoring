import MockAdapter from 'axios-mock-adapter';
import { render, waitFor } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import initializeStore from '../../store';
import { getHelpUrlsApiUrl } from '../../help-urls/data/api';
import { helpUrls } from '../../help-urls/__mocks__';
import TextbookSidebar from './TextbookSidebar';
import messages from './messages';

let axiosMock;
let store;
const courseId = 'course-v1:org+101+101';

const renderComponent = () => render(
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <TextbookSidebar courseId={courseId} />
    </IntlProvider>
  </AppProvider>,
);

describe('<TextbookSidebar />', () => {
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
    axiosMock
      .onGet(getHelpUrlsApiUrl())
      .reply(200, helpUrls);
  });

  it('renders TextbookSidebar component correctly', async () => {
    const { getByText } = renderComponent();

    await waitFor(() => {
      expect(getByText(messages.section_1_title.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.section_1_descriptions.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.section_2_title.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.section_2_descriptions.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.sectionLink.defaultMessage)).toHaveAttribute('href', helpUrls.textbooks);
    });
  });
});
