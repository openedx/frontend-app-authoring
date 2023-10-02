import React from 'react';
import { useSelector } from 'react-redux';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { IntlProvider, injectIntl } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import {
  act, fireEvent, render, waitFor,
} from '@testing-library/react';
import MockAdapter from 'axios-mock-adapter';

import initializeStore from '../store';
import { RequestStatus } from '../data/constants';
import { COURSE_CREATOR_STATES } from '../constants';
import { executeThunk } from '../utils';
import { studioHomeMock } from './__mocks__';
import { getStudioHomeApiUrl } from './data/api';
import { fetchStudioHomeData } from './data/thunks';
import messages from './messages';
import createNewCourseMessages from './create-new-course-form/messages';
import createOrRerunCourseMessages from '../generic/create-or-rerun-course/messages';
import { StudioHome } from '.';

let axiosMock;
let store;
const mockPathname = '/foo-bar';
const {
  studioShortName,
  studioRequestEmail,
} = studioHomeMock;

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
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <StudioHome intl={injectIntl} />
    </IntlProvider>
  </AppProvider>
);

describe('<StudioHome />', async () => {
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
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, studioHomeMock);
    await executeThunk(fetchStudioHomeData(), store.dispatch);
    useSelector.mockReturnValue(studioHomeMock);
  });

  it('should render page and page title correctly', () => {
    const { getByText } = render(<RootWrapper />);
    expect(getByText(`${studioShortName} home`)).toBeInTheDocument();
  });

  it('should render email staff header button', async () => {
    useSelector.mockReturnValue({
      ...studioHomeMock,
      courseCreatorStatus: COURSE_CREATOR_STATES.disallowedForThisSite,
    });

    const { getByRole } = render(<RootWrapper />);
    expect(getByRole('link', { name: messages.emailStaffBtnText.defaultMessage }))
      .toHaveAttribute('href', `mailto:${studioRequestEmail}`);
  });

  it('should render create new course button', async () => {
    useSelector.mockReturnValue({
      ...studioHomeMock,
      courseCreatorStatus: COURSE_CREATOR_STATES.granted,
    });

    const { getByRole } = render(<RootWrapper />);
    expect(getByRole('button', { name: messages.addNewCourseBtnText.defaultMessage })).toBeInTheDocument();
  });

  it('should show verify email layout if user inactive', () => {
    useSelector.mockReturnValue({
      ...studioHomeMock,
      userIsActive: false,
    });

    const { getByText } = render(<RootWrapper />);
    expect(getByText('Thanks for signing up, abc123!', { exact: false })).toBeInTheDocument();
  });

  it('shows the spinner before the query is complete', async () => {
    useSelector.mockReturnValue({
      studioHomeLoadingStatus: RequestStatus.IN_PROGRESS,
      userIsActive: true,
    });

    await act(async () => {
      const { getByRole } = render(<RootWrapper />);
      const spinner = getByRole('status');
      expect(spinner.textContent).toEqual('Loading...');
    });
  });

  describe('render new library button', () => {
    it('should not show button', async () => {
      useSelector.mockReturnValue({
        ...studioHomeMock,
        courseCreatorStatus: COURSE_CREATOR_STATES.granted,
      });

      const { queryByTestId } = render(<RootWrapper />);
      const createNewLibraryButton = queryByTestId('new-library-button');
      expect(createNewLibraryButton).toBeNull();
    });
    it('href should include create', async () => {
      useSelector.mockReturnValue({
        ...studioHomeMock,
        courseCreatorStatus: COURSE_CREATOR_STATES.granted,
        splitStudioHome: true,
        redirectToLibraryAuthoringMfe: true,
      });
      const libraryAuthoringMfeUrl = 'http://localhost:3001';

      const { getByTestId } = render(<RootWrapper />);
      const createNewLibraryButton = getByTestId('new-library-button');
      expect(createNewLibraryButton.getAttribute('href')).toBe(`${libraryAuthoringMfeUrl}/create`);
    });
  });

  it('should render create new course container', async () => {
    useSelector.mockReturnValue({
      ...studioHomeMock,
      courseCreatorStatus: COURSE_CREATOR_STATES.granted,
    });

    const { getByRole, getByText } = render(<RootWrapper />);
    const createNewCourseButton = getByRole('button', { name: messages.addNewCourseBtnText.defaultMessage });

    await act(() => fireEvent.click(createNewCourseButton));
    expect(getByText(createNewCourseMessages.createNewCourse.defaultMessage)).toBeInTheDocument();
  });

  it('should hide create new course container', async () => {
    useSelector.mockReturnValue({
      ...studioHomeMock,
      courseCreatorStatus: COURSE_CREATOR_STATES.granted,
    });

    const { getByRole, queryByText, getByText } = render(<RootWrapper />);
    const createNewCourseButton = getByRole('button', { name: messages.addNewCourseBtnText.defaultMessage });

    fireEvent.click(createNewCourseButton);
    waitFor(() => {
      expect(getByText(createNewCourseMessages.createNewCourse.defaultMessage)).toBeInTheDocument();
    });

    const cancelButton = getByRole('button', { name: createOrRerunCourseMessages.cancelButton.defaultMessage });
    fireEvent.click(cancelButton);
    waitFor(() => {
      expect(queryByText(createNewCourseMessages.createNewCourse.defaultMessage)).not.toBeInTheDocument();
    });
  });

  describe('contact administrator card', () => {
    it('should show contact administrator card with no add course buttons', () => {
      useSelector.mockReturnValue({
        ...studioHomeMock,
        courses: null,
        courseCreatorStatus: COURSE_CREATOR_STATES.pending,
      });
      const { getByText, queryByText } = render(<RootWrapper />);
      const defaultTitleMessage = messages.defaultSection_1_Title.defaultMessage;
      const titleWithStudioName = defaultTitleMessage.replace('{studioShortName}', 'Studio');
      const administratorCardTitle = getByText(titleWithStudioName);

      expect(administratorCardTitle).toBeVisible();

      const addCourseButton = queryByText(messages.btnAddNewCourseText.defaultMessage);
      expect(addCourseButton).toBeNull();
    });

    it('should show contact administrator card with add course buttons', () => {
      useSelector.mockReturnValue({
        ...studioHomeMock,
        courses: null,
        courseCreatorStatus: COURSE_CREATOR_STATES.granted,
      });
      const { getByText, getByTestId } = render(<RootWrapper />);
      const defaultTitleMessage = messages.defaultSection_1_Title.defaultMessage;
      const titleWithStudioName = defaultTitleMessage.replace('{studioShortName}', 'Studio');
      const administratorCardTitle = getByText(titleWithStudioName);

      expect(administratorCardTitle).toBeVisible();

      const addCourseButton = getByTestId('contact-admin-create-course');
      expect(addCourseButton).toBeVisible();

      fireEvent.click(addCourseButton);
      expect(getByTestId('create-course-form')).toBeVisible();
    });
  });

  it('should show footer', () => {
    const { getByText } = render(<RootWrapper />);
    expect(getByText('Looking for help with Studio?')).toBeInTheDocument();
    expect(getByText('LMS')).toHaveAttribute('href', process.env.LMS_BASE_URL);
  });
});
