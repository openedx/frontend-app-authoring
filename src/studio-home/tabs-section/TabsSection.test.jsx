import React from 'react';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  waitFor, render, fireEvent, screen, act,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import MockAdapter from 'axios-mock-adapter';

import initializeStore from '../../store';
import { studioHomeMock } from '../__mocks__';
import messages from '../messages';
import tabMessages from './messages';
import TabsSection from '.';
import {
  initialState,
  generateGetStudioHomeDataApiResponse,
  generateGetStudioCoursesApiResponse,
  generateGetStuioHomeLibrariesApiResponse,
} from '../factories/mockApiResponses';
import { getApiBaseUrl, getStudioHomeApiUrl } from '../data/api';
import { executeThunk } from '../../utils';
import { fetchLibraryData, fetchStudioHomeData } from '../data/thunks';

const { studioShortName } = studioHomeMock;

let axiosMock;
let store;
const courseApiLink = `${getApiBaseUrl()}/api/contentstore/v2/home/courses`;
const libraryApiLink = `${getApiBaseUrl()}/api/contentstore/v1/home/libraries`;

const mockDispatch = jest.fn();

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <TabsSection intl={{ formatMessage: jest.fn() }} dispatch={mockDispatch} />
    </IntlProvider>
  </AppProvider>
);

describe('<TabsSection />', () => {
  beforeEach(() => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    store = initializeStore(initialState);
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  it('should render all tabs correctly', async () => {
    const data = generateGetStudioHomeDataApiResponse();
    data.archivedCourses = [{
      courseKey: 'course-v1:MachineLearning+123+2023',
      displayName: 'Machine Learning',
      lmsLink: '//localhost:18000/courses/course-v1:MachineLearning+123+2023/jump_to/block-v1:MachineLearning+123+2023+type@course+block@course',
      number: '123',
      org: 'LSE',
      rerunLink: '/course_rerun/course-v1:MachineLearning+123+2023',
      run: '2023',
      url: '/course/course-v1:MachineLearning+123+2023',
    }];

    render(<RootWrapper />);
    axiosMock.onGet(getStudioHomeApiUrl()).reply(200, data);
    await executeThunk(fetchStudioHomeData(), store.dispatch);

    expect(screen.getByText(tabMessages.coursesTabTitle.defaultMessage)).toBeInTheDocument();

    expect(screen.getByText(tabMessages.librariesTabTitle.defaultMessage)).toBeInTheDocument();

    expect(screen.getByText(tabMessages.archivedTabTitle.defaultMessage)).toBeInTheDocument();
  });

  describe('course tab', () => {
    it('should render specific course details', async () => {
      render(<RootWrapper />);
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      axiosMock.onGet(courseApiLink).reply(200, generateGetStudioCoursesApiResponse());
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      expect(screen.getByText(studioHomeMock.courses[0].displayName)).toBeVisible();

      expect(screen.getByText(
        `${studioHomeMock.courses[0].org} / ${studioHomeMock.courses[0].number} / ${studioHomeMock.courses[0].run}`,
      )).toBeVisible();
    });

    it('should render default sections when courses are empty', async () => {
      const data = generateGetStudioCoursesApiResponse();
      data.results.courses = [];

      render(<RootWrapper />);
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      axiosMock.onGet(courseApiLink).reply(200, data);
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      expect(screen.getByText(`Are you staff on an existing ${studioShortName} course?`)).toBeInTheDocument();

      expect(screen.getByText(messages.defaultSection_1_Description.defaultMessage)).toBeInTheDocument();

      expect(screen.getByRole('button', { name: messages.defaultSection_2_Title.defaultMessage })).toBeInTheDocument();

      expect(screen.getByText(messages.defaultSection_2_Description.defaultMessage)).toBeInTheDocument();
    });

    it('should render course fetch failure alert', async () => {
      render(<RootWrapper />);
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      axiosMock.onGet(courseApiLink).reply(404);
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      expect(screen.getByText(tabMessages.courseTabErrorMessage.defaultMessage)).toBeVisible();
    });

    it('should render pagination when there are courses', async () => {
      render(<RootWrapper />);
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      axiosMock.onGet(courseApiLink).reply(200, generateGetStudioCoursesApiResponse());
      await executeThunk(fetchStudioHomeData(), store.dispatch);
      const data = generateGetStudioCoursesApiResponse();
      const coursesLength = data.results.courses.length;
      const totalItems = data.count;
      const paginationInfoText = `Showing ${coursesLength} of ${totalItems}`;

      expect(screen.getByText(studioHomeMock.courses[0].displayName)).toBeVisible();

      const pagination = screen.getByRole('navigation');
      const paginationInfo = screen.getByTestId('pagination-info');
      expect(paginationInfo.textContent).toContain(paginationInfoText);
      expect(pagination).toBeVisible();
    });

    it('should not render pagination when there are not courses', async () => {
      const data = generateGetStudioCoursesApiResponse();
      data.results.courses = [];
      render(<RootWrapper />);
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      axiosMock.onGet(courseApiLink).reply(200, data);
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      const pagination = screen.queryByRole('navigation');
      expect(pagination).not.toBeInTheDocument();
    });
  });

  describe('library tab', () => {
    it('should switch to Libraries tab and render specific library details', async () => {
      render(<RootWrapper />);
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      axiosMock.onGet(libraryApiLink).reply(200, generateGetStuioHomeLibrariesApiResponse());
      await executeThunk(fetchStudioHomeData(), store.dispatch);
      await executeThunk(fetchLibraryData(), store.dispatch);

      const librariesTab = screen.getByText(tabMessages.librariesTabTitle.defaultMessage);
      await act(async () => {
        fireEvent.click(librariesTab);
      });

      expect(librariesTab).toHaveClass('active');

      expect(screen.getByText(studioHomeMock.libraries[0].displayName)).toBeVisible();

      expect(screen.getByText(`${studioHomeMock.libraries[0].org} / ${studioHomeMock.libraries[0].number}`)).toBeVisible();
    });

    it('should hide Libraries tab when libraries are disabled', async () => {
      const data = generateGetStudioHomeDataApiResponse();
      data.librariesEnabled = false;

      render(<RootWrapper />);
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, data);
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      expect(screen.getByText(tabMessages.coursesTabTitle.defaultMessage)).toBeInTheDocument();
      expect(screen.queryByText(tabMessages.librariesTabTitle.defaultMessage)).toBeNull();
    });

    it('should redirect to library authoring mfe', async () => {
      const data = generateGetStudioHomeDataApiResponse();
      data.redirectToLibraryAuthoringMfe = true;

      render(<RootWrapper />);
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, data);
      await executeThunk(fetchStudioHomeData(), store.dispatch);

      const librariesTab = screen.getByText(tabMessages.librariesTabTitle.defaultMessage);
      fireEvent.click(librariesTab);

      waitFor(() => {
        expect(window.location.href).toBe(data.libraryAuthoringMfeUrl);
      });
    });

    it('should render libraries fetch failure alert', async () => {
      render(<RootWrapper />);
      axiosMock.onGet(getStudioHomeApiUrl()).reply(200, generateGetStudioHomeDataApiResponse());
      axiosMock.onGet(libraryApiLink).reply(404);
      await executeThunk(fetchStudioHomeData(), store.dispatch);
      await executeThunk(fetchLibraryData(), store.dispatch);

      const librariesTab = screen.getByText(tabMessages.librariesTabTitle.defaultMessage);
      await act(async () => {
        fireEvent.click(librariesTab);
      });

      expect(librariesTab).toHaveClass('active');

      expect(screen.getByText(tabMessages.librariesTabErrorMessage.defaultMessage)).toBeVisible();
    });
  });
});
