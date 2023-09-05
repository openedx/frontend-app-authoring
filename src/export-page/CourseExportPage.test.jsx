import React from 'react';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';
import { Helmet } from 'react-helmet';

import initializeStore from '../store';
import { exportPageMock } from './__mocks__';
import messages from './messages';
import CourseExportPage from './CourseExportPage';
import { postExportCourseApiUrl } from './data/api';

let store;
let axiosMock;
const courseId = '123';
const courseName = 'About Node JS';

jest.mock('../generic/model-store', () => ({
  useModel: jest.fn().mockReturnValue({
    name: courseName,
  }),
}));

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <CourseExportPage intl={injectIntl} courseId={courseId} />
    </IntlProvider>
  </AppProvider>
);

describe('<CourseExportPage />', () => {
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
      .onGet(postExportCourseApiUrl(courseId))
      .reply(200, exportPageMock);
  });
  it('should render page title correctly', async () => {
    render(<RootWrapper />);
    await waitFor(() => {
      const helmet = Helmet.peek();
      expect(helmet.title).toEqual(
        `${messages.headingTitle.defaultMessage} | ${courseName} | ${process.env.SITE_NAME}`,
      );
    });
  });
  it('should render without errors', async () => {
    const { getByText } = render(<RootWrapper />);
    await waitFor(() => {
      expect(getByText(messages.headingSubtitle.defaultMessage)).toBeInTheDocument();
      const exportPageElement = getByText(messages.headingTitle.defaultMessage, {
        selector: 'h2.sub-header-title',
      });
      expect(exportPageElement).toBeInTheDocument();
      expect(getByText(messages.titleUnderButton.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.description2.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.buttonTitle.defaultMessage)).toBeInTheDocument();
    });
  });
  it('should start exporting on click', async () => {
    const { getByText, container } = render(<RootWrapper />);
    const button = container.querySelector('.btn-primary');
    fireEvent.click(button);
    expect(getByText(/Preparing to start the export/i)).toBeInTheDocument();
  });
});
