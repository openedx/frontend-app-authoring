/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/jsx-filename-extension */
import {
  fireEvent, render, waitFor, screen,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import MockAdapter from 'axios-mock-adapter';
import initializeStore from '../store';
import messages from './messages';
import generalMessages from '../messages';
import scanResultsMessages from './scan-results/messages';
import CourseOptimizerPage, { pollLinkCheckDuringScan } from './CourseOptimizerPage';
import { postLinkCheckCourseApiUrl, getLinkCheckStatusApiUrl } from './data/api';
import mockApiResponse from './mocks/mockApiResponse';
import * as thunks from './data/thunks';

let store;
let axiosMock;
const courseId = '123';
const courseName = 'About Node JS';

jest.mock('../generic/model-store', () => ({
  useModel: jest.fn().mockReturnValue({
    name: courseName,
  }),
}));

const OptimizerPage = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <CourseOptimizerPage courseId={courseId} />
    </IntlProvider>
  </AppProvider>
);

const setupOptimizerPage = async () => {
  axiosMock.onGet(getLinkCheckStatusApiUrl(courseId)).reply(200, mockApiResponse);
  const optimizerPage = render(<OptimizerPage />);

  // Click the scan button
  fireEvent.click(optimizerPage.getByText(messages.buttonTitle.defaultMessage));

  // Wait for the scan results to load
  await waitFor(() => {
    expect(optimizerPage.getByText('Introduction to Programming')).toBeInTheDocument();
  });

  // Click on filters button
  fireEvent.click(optimizerPage.getByText(scanResultsMessages.filterButtonLabel.defaultMessage));

  return optimizerPage;
};

describe('CourseOptimizerPage', () => {
  describe('pollLinkCheckDuringScan', () => {
    let mockFetchLinkCheckStatus;
    beforeEach(() => {
      mockFetchLinkCheckStatus = jest.fn();
      jest.spyOn(thunks, 'fetchLinkCheckStatus').mockImplementation(mockFetchLinkCheckStatus);
      jest.useFakeTimers();
      jest.spyOn(global, 'setInterval').mockImplementation((cb) => { cb(); return true; });
    });

    afterEach(() => {
      jest.clearAllTimers();
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    it('should start polling if linkCheckInProgress has never been started (is null)', () => {
      const linkCheckInProgress = null;
      const interval = { current: null };
      const dispatch = jest.fn();
      const courseId = 'course-123';
      pollLinkCheckDuringScan(linkCheckInProgress, interval, dispatch, courseId);
      expect(interval.current).toBeTruthy();
      expect(mockFetchLinkCheckStatus).toHaveBeenCalled();
    });

    it('should start polling if link check is in progress', () => {
      const linkCheckInProgress = true;
      const interval = { current: null };
      const dispatch = jest.fn();
      const courseId = 'course-123';
      pollLinkCheckDuringScan(linkCheckInProgress, interval, dispatch, courseId);
      expect(interval.current).toBeTruthy();
    });

    it('should not start polling if link check is not in progress', () => {
      const linkCheckInProgress = false;
      const interval = { current: null };
      const dispatch = jest.fn();
      const courseId = 'course-123';
      pollLinkCheckDuringScan(linkCheckInProgress, interval, dispatch, courseId);
      expect(interval.current).toBeFalsy();
    });

    it('should clear the interval if link check is finished', () => {
      const linkCheckInProgress = false;
      const interval = { current: 1 };
      const dispatch = jest.fn();
      const courseId = 'course-123';
      pollLinkCheckDuringScan(linkCheckInProgress, interval, dispatch, courseId);
      expect(interval.current).toBeUndefined();
    });
  });

  describe('CourseOptimizerPage component', () => {
    beforeEach(() => {
      jest.useRealTimers();
      jest.clearAllMocks();
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
        .onPost(postLinkCheckCourseApiUrl(courseId))
        .reply(200, { LinkCheckStatus: 'In-Progress' });
      axiosMock
        .onGet(getLinkCheckStatusApiUrl(courseId))
        .reply(200, mockApiResponse);
    });

    it('should render the component', () => {
      const { getByText, queryByText } = render(<OptimizerPage />);
      expect(getByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.buttonTitle.defaultMessage)).toBeInTheDocument();
      expect(queryByText(messages.preparingStepTitle)).not.toBeInTheDocument();
    });

    it('should start scan after clicking the scan button', async () => {
      const { getByText } = render(<OptimizerPage />);
      expect(getByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
      fireEvent.click(getByText(messages.buttonTitle.defaultMessage));
      await waitFor(() => {
        expect(getByText(messages.preparingStepTitle.defaultMessage)).toBeInTheDocument();
      });
    });

    it('should show no broken links found message', async () => {
      axiosMock
        .onGet(getLinkCheckStatusApiUrl(courseId))
        .reply(200, { LinkCheckStatus: 'Succeeded' });
      const { getByText } = render(<OptimizerPage />);
      expect(getByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
      fireEvent.click(getByText(messages.buttonTitle.defaultMessage));
      await waitFor(() => {
        expect(getByText(scanResultsMessages.noBrokenLinksCard.defaultMessage)).toBeInTheDocument();
      });
    });

    it('should show error message if request does not go through', async () => {
      axiosMock
        .onPost(postLinkCheckCourseApiUrl(courseId))
        .reply(500);
      render(<OptimizerPage />);
      expect(screen.getByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
      fireEvent.click(screen.getByText(messages.buttonTitle.defaultMessage));
      await waitFor(() => {
        expect(screen.getByText(generalMessages.supportText.defaultMessage)).toBeInTheDocument();
      });
    });

    it('should show only broken links when brokenLinks filter is selected', async () => {
      const {
        getByText,
        getByLabelText,
        queryByText,
        container,
      } = await setupOptimizerPage();
      // Check if the modal is opened
      expect(getByText('Broken')).toBeInTheDocument();
      // Select the broken links checkbox
      fireEvent.click(getByLabelText(scanResultsMessages.brokenLabel.defaultMessage));

      const collapsibleTrigger = container.querySelector('.collapsible-trigger');
      expect(collapsibleTrigger).toBeInTheDocument();
      fireEvent.click(collapsibleTrigger);

      await waitFor(() => {
        expect(getByText('Test Broken Links')).toBeInTheDocument();
        expect(queryByText('Test Locked Links')).not.toBeInTheDocument();
        expect(queryByText('Test Manual Links')).not.toBeInTheDocument();
      });
    });

    it('should show only manual links when manualLinks filter is selected', async () => {
      const {
        getByText,
        getByLabelText,
        queryByText,
        container,
      } = await setupOptimizerPage();
      // Check if the modal is opened
      expect(getByText('Manual')).toBeInTheDocument();
      // Select the manual links checkbox
      fireEvent.click(getByLabelText(scanResultsMessages.manualLabel.defaultMessage));

      const collapsibleTrigger = container.querySelector('.collapsible-trigger');
      expect(collapsibleTrigger).toBeInTheDocument();
      fireEvent.click(collapsibleTrigger);

      await waitFor(() => {
        expect(getByText('Test Manual Links')).toBeInTheDocument();
        expect(queryByText('Test Broken Links')).not.toBeInTheDocument();
        expect(queryByText('Test Locked Links')).not.toBeInTheDocument();
      });
    });

    it('should show only manual & locked links when manual & locked Links filters are selected, ignore broken links', async () => {
      const {
        getByText,
        getByLabelText,
        queryByText,
        container,
      } = await setupOptimizerPage();
      // Check if the modal is opened
      expect(getByText('Manual')).toBeInTheDocument();
      expect(getByText('Locked')).toBeInTheDocument();
      // Select the manual & locked links checkbox
      fireEvent.click(getByLabelText(scanResultsMessages.manualLabel.defaultMessage));
      fireEvent.click(getByLabelText(scanResultsMessages.lockedLabel.defaultMessage));

      const collapsibleTrigger = container.querySelector('.collapsible-trigger');
      expect(collapsibleTrigger).toBeInTheDocument();
      fireEvent.click(collapsibleTrigger);

      await waitFor(() => {
        expect(getByText('Test Manual Links')).toBeInTheDocument();
        expect(getByText('Test Locked Links')).toBeInTheDocument();
        expect(queryByText('Test Broken Links')).not.toBeInTheDocument();
      });
    });

    it('should show all links when all filters are selected', async () => {
      const {
        getByText,
        getByLabelText,
        container,
      } = await setupOptimizerPage();
      // Check if the modal is opened
      expect(getByText('Broken')).toBeInTheDocument();
      expect(getByText('Manual')).toBeInTheDocument();
      expect(getByText('Locked')).toBeInTheDocument();
      // Select the all checkboxes
      fireEvent.click(getByLabelText(scanResultsMessages.brokenLabel.defaultMessage));
      fireEvent.click(getByLabelText(scanResultsMessages.lockedLabel.defaultMessage));
      fireEvent.click(getByLabelText(scanResultsMessages.manualLabel.defaultMessage));

      const collapsibleTrigger = container.querySelector('.collapsible-trigger');
      expect(collapsibleTrigger).toBeInTheDocument();
      fireEvent.click(collapsibleTrigger);

      await waitFor(() => {
        expect(getByText('Test Broken Links')).toBeInTheDocument();
        expect(getByText('Test Manual Links')).toBeInTheDocument();
        expect(getByText('Test Locked Links')).toBeInTheDocument();
      });
    });
  });
});
