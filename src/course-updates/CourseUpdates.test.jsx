import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import initializeStore from '../store';
import CourseUpdates from './CourseUpdates';
import messages from './messages';
import { getCourseUpdatesApiUrl, getCourseHandoutApiUrl } from './data/api';
import { courseUpdatesMock, courseHandoutsMock } from './__mocks__';

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

jest.mock('@tinymce/tinymce-react', () => {
  const originalModule = jest.requireActual('@tinymce/tinymce-react');
  return {
    __esModule: true,
    ...originalModule,
    Editor: () => 'foo bar',
  };
});

jest.mock('@edx/frontend-lib-content-components', () => ({
  TinyMceWidget: () => <div>Widget</div>,
  prepareEditorRef: jest.fn(() => ({
    refReady: true,
    setEditorRef: jest.fn().mockName('prepareEditorRef.setEditorRef'),
  })),
}));

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en">
      <CourseUpdates courseId={courseId} />
    </IntlProvider>
  </AppProvider>
);

describe('<CourseUpdates />', () => {
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
      .onGet(getCourseUpdatesApiUrl(courseId))
      .reply(200, courseUpdatesMock);
    axiosMock
      .onGet(getCourseHandoutApiUrl(courseId))
      .reply(200, courseHandoutsMock);
  });

  it('render CourseUpdates component correctly', async () => {
    const {
      getByText, getAllByTestId, getByTestId, getByRole,
    } = render(<RootWrapper />);

    await waitFor(() => {
      expect(getByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.headingSubtitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.sectionInfo.defaultMessage)).toBeInTheDocument();
      expect(getByRole('button', { name: messages.newUpdateButton.defaultMessage })).toBeInTheDocument();
      expect(getAllByTestId('course-update')).toHaveLength(3);
      expect(getByTestId('course-handouts')).toBeInTheDocument();
    });
  });
});
