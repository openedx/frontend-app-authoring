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
import CourseOptimizerPage, { pollLinkCheckDuringScan, pollRerunLinkUpdateDuringUpdate, pollRerunLinkUpdateStatus } from './CourseOptimizerPage';
import { postLinkCheckCourseApiUrl, getLinkCheckStatusApiUrl } from './data/api';
import {
  mockApiResponse,
  mockApiResponseForNoResultFound,
  mockApiResponseWithPreviousRunLinks,
  mockApiResponseEmpty,
} from './mocks/mockApiResponse';
import * as thunks from './data/thunks';
import { useWaffleFlags } from '../data/apiHooks';

let store;
let axiosMock;
const courseId = '123';
const courseName = 'About Node JS';

jest.mock('../generic/model-store', () => ({
  useModel: jest.fn().mockReturnValue({
    name: courseName,
  }),
}));

// Mock the waffle flags hook
jest.mock('../data/apiHooks', () => ({
  useWaffleFlags: jest.fn(() => ({
    enableCourseOptimizerCheckPrevRunLinks: false,
  })),
}));

jest.mock('../generic/model-store', () => ({
  useModel: jest.fn().mockReturnValue({
    name: 'About Node JS',
  }),
}));

const OptimizerPage = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <CourseOptimizerPage courseId={courseId} />
    </IntlProvider>
  </AppProvider>
);

const setupOptimizerPage = async (apiResponse = mockApiResponse) => {
  axiosMock.onGet(getLinkCheckStatusApiUrl(courseId)).reply(200, apiResponse);
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
        expect(getByText(scanResultsMessages.noResultsFound.defaultMessage)).toBeInTheDocument();
      });
    });

    it('should show an error state in the scan stepper if request does not go through', async () => {
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

    it('should show only locked links when lockedLinks filter is selected', async () => {
      const {
        getByText,
        getByLabelText,
        queryByText,
        container,
      } = await setupOptimizerPage();
      // Check if the modal is opened
      expect(getByText('Locked')).toBeInTheDocument();
      // Select the locked links checkbox
      fireEvent.click(getByLabelText(scanResultsMessages.lockedLabel.defaultMessage));

      const collapsibleTrigger = container.querySelector('.collapsible-trigger');
      expect(collapsibleTrigger).toBeInTheDocument();
      fireEvent.click(collapsibleTrigger);

      await waitFor(() => {
        expect(getByText('https://example.com/locked-link')).toBeInTheDocument();
        expect(queryByText('https://example.com/broken-link')).not.toBeInTheDocument();
        expect(queryByText('https://outsider.com/forbidden-link')).not.toBeInTheDocument();
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
        expect(getByText('https://example.com/broken-link')).toBeInTheDocument();
        expect(queryByText('https://example.com/locked-link')).not.toBeInTheDocument();
        expect(queryByText('https://outsider.com/forbidden-link')).not.toBeInTheDocument();
      });
    });

    it('should show only manual links when manualLinks filter is selected and show all links when clicked again', async () => {
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
        expect(getByText('https://outsider.com/forbidden-link')).toBeInTheDocument();
        expect(queryByText('https://example.com/broken-link')).not.toBeInTheDocument();
        expect(queryByText('https://example.com/locked-link')).not.toBeInTheDocument();
      });

      // Click the manual links checkbox again to clear the filter
      fireEvent.click(getByLabelText(scanResultsMessages.manualLabel.defaultMessage));

      // Assert that all links are displayed after clearing the filter
      await waitFor(() => {
        expect(getByText('https://example.com/broken-link')).toBeInTheDocument();
        expect(getByText('https://outsider.com/forbidden-link')).toBeInTheDocument();
        expect(getByText('https://example.com/locked-link')).toBeInTheDocument();
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
        expect(getByText('https://outsider.com/forbidden-link')).toBeInTheDocument();
        expect(getByText('https://example.com/locked-link')).toBeInTheDocument();
        expect(queryByText('https://example.com/broken-link')).not.toBeInTheDocument();
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
        expect(getByText('https://example.com/broken-link')).toBeInTheDocument();
        expect(getByText('https://outsider.com/forbidden-link')).toBeInTheDocument();
        expect(getByText('https://example.com/locked-link')).toBeInTheDocument();
      });
    });

    it('should show only manual links when the broken chip is clicked and show all links when clear filters button is clicked', async () => {
      const {
        getByText,
        getByLabelText,
        getByTestId,
        queryByText,
        container,
      } = await setupOptimizerPage();
      // Select broken & manual link checkboxes
      fireEvent.click(getByLabelText(scanResultsMessages.brokenLabel.defaultMessage));
      fireEvent.click(getByLabelText(scanResultsMessages.manualLabel.defaultMessage));

      const collapsibleTrigger = container.querySelector('.collapsible-trigger');
      expect(collapsibleTrigger).toBeInTheDocument();
      fireEvent.click(collapsibleTrigger);

      // Assert that both links are displayed
      await waitFor(() => {
        expect(getByText('https://example.com/broken-link')).toBeInTheDocument();
        expect(getByText('https://outsider.com/forbidden-link')).toBeInTheDocument();
        expect(queryByText('https://example.com/locked-link')).not.toBeInTheDocument();
      });

      // Click on the "Broken" chip to remove the broken filter (should leave only manual)
      const brokenChip = getByTestId('chip-brokenLinks');
      fireEvent.click(brokenChip);

      // Assert that only manual links are displayed
      await waitFor(() => {
        expect(queryByText('https://example.com/broken-link')).not.toBeInTheDocument();
        expect(getByText('https://outsider.com/forbidden-link')).toBeInTheDocument();
        expect(queryByText('https://example.com/locked-link')).not.toBeInTheDocument();
      });

      // Click the "Clear filters" button
      const clearFiltersButton = getByText(scanResultsMessages.clearFilters.defaultMessage);
      fireEvent.click(clearFiltersButton);

      // Assert that all links are displayed after clearing filters
      await waitFor(() => {
        expect(getByText('https://example.com/broken-link')).toBeInTheDocument();
        expect(getByText('https://outsider.com/forbidden-link')).toBeInTheDocument();
        expect(getByText('https://example.com/locked-link')).toBeInTheDocument();
      });
    });

    it('should show no results found message when filter with no links is selected', async () => {
      const {
        getByText,
        getByLabelText,
      } = await setupOptimizerPage(mockApiResponseForNoResultFound);
      // Check if the modal is opened
      expect(getByText('Locked')).toBeInTheDocument();
      // Select the broken links checkbox
      fireEvent.click(getByLabelText(scanResultsMessages.lockedLabel.defaultMessage));

      await waitFor(() => {
        expect(getByText(scanResultsMessages.noResultsFound.defaultMessage)).toBeInTheDocument();
      });
    });

    it('should always show no scan data message when data is empty', async () => {
      axiosMock.onGet(getLinkCheckStatusApiUrl(courseId)).reply(200, mockApiResponseEmpty);
      const { getByText } = render(<OptimizerPage />);

      fireEvent.click(getByText(messages.buttonTitle.defaultMessage));

      await waitFor(() => {
        expect(getByText(scanResultsMessages.noResultsFound.defaultMessage)).toBeInTheDocument();
      });
    });

    describe('Previous Run Links Feature', () => {
      beforeEach(() => {
        // Enable the waffle flag for previous run links
        useWaffleFlags.mockReturnValue({
          enableCourseOptimizerCheckPrevRunLinks: true,
        });
      });

      afterEach(() => {
        // Reset to default (disabled)
        useWaffleFlags.mockReturnValue({
          enableCourseOptimizerCheckPrevRunLinks: false,
        });
      });

      it('should show previous run links section when waffle flag is enabled and links exist', async () => {
        axiosMock.onGet(getLinkCheckStatusApiUrl(courseId)).reply(200, mockApiResponseWithPreviousRunLinks);
        const { getByText } = render(<OptimizerPage />);

        fireEvent.click(getByText(messages.buttonTitle.defaultMessage));

        await waitFor(() => {
          expect(getByText(scanResultsMessages.linkToPrevCourseRun.defaultMessage)).toBeInTheDocument();
        });
      });

      it('should show no results found for previous run links when flag is enabled but no links exist', async () => {
        axiosMock.onGet(getLinkCheckStatusApiUrl(courseId)).reply(200, mockApiResponseForNoResultFound);
        const { getByText, getAllByText } = render(<OptimizerPage />);

        fireEvent.click(getByText(messages.buttonTitle.defaultMessage));

        await waitFor(() => {
          expect(getByText(scanResultsMessages.linkToPrevCourseRun.defaultMessage)).toBeInTheDocument();
          // Should show "No results found" for previous run section
          const noResultsElements = getAllByText(scanResultsMessages.noResultsFound.defaultMessage);
          expect(noResultsElements.length).toBeGreaterThan(0);
        });
      });

      it('should not show previous run links section when waffle flag is disabled', async () => {
        // Disable the flag
        useWaffleFlags.mockReturnValue({
          enableCourseOptimizerCheckPrevRunLinks: false,
        });

        axiosMock.onGet(getLinkCheckStatusApiUrl(courseId)).reply(200, mockApiResponseWithPreviousRunLinks);
        const { getByText, queryByText } = render(<OptimizerPage />);

        fireEvent.click(getByText(messages.buttonTitle.defaultMessage));

        await waitFor(() => {
          expect(queryByText(scanResultsMessages.linkToPrevCourseRun.defaultMessage)).not.toBeInTheDocument();
        });
      });

      it('should handle previous run links in course updates and custom pages', async () => {
        axiosMock.onGet(getLinkCheckStatusApiUrl(courseId)).reply(200, mockApiResponseWithPreviousRunLinks);
        const { getByText, container } = render(<OptimizerPage />);

        fireEvent.click(getByText(messages.buttonTitle.defaultMessage));

        await waitFor(() => {
          expect(getByText(scanResultsMessages.linkToPrevCourseRun.defaultMessage)).toBeInTheDocument();

          const prevRunSections = container.querySelectorAll('.scan-results');
          expect(prevRunSections.length).toBeGreaterThan(1);
        });
      });
    });

    describe('CourseOptimizerPage polling helpers - rerun', () => {
      beforeEach(() => {
        jest.restoreAllMocks();
      });

      it('starts polling when shouldPoll is true', () => {
        const mockDispatch = jest.fn();
        const courseId = 'course-v1:Test+001';

        // Mock setInterval to return a sentinel id
        const intervalId = 123;
        const setIntervalSpy = jest.spyOn(global, 'setInterval').mockImplementation(() => intervalId);

        const intervalRef = { current: undefined };

        // Call with rerunLinkUpdateInProgress true so shouldPoll === true
        pollRerunLinkUpdateDuringUpdate(true, null, intervalRef, mockDispatch, courseId);

        expect(setIntervalSpy).toHaveBeenCalled();
        expect(intervalRef.current).toBe(intervalId);
      });

      it('clears existing interval when shouldPoll is false', () => {
        const mockDispatch = jest.fn();
        const courseId = 'course-v1:Test+002';
        const clearIntervalSpy = jest.spyOn(global, 'clearInterval').mockImplementation(() => {});
        const setIntervalSpy = jest.spyOn(global, 'setInterval').mockImplementation(() => 456);
        const intervalRef = { current: 456 };

        pollRerunLinkUpdateDuringUpdate(false, { status: 'Succeeded' }, intervalRef, mockDispatch, courseId);

        expect(clearIntervalSpy).toHaveBeenCalledWith(456);
        expect(intervalRef.current).toBeUndefined();

        setIntervalSpy.mockRestore();
        clearIntervalSpy.mockRestore();
      });

      it('pollRerunLinkUpdateStatus schedules dispatch at provided delay', () => {
        jest.useFakeTimers();
        const mockDispatch = jest.fn();
        const courseId = 'course-v1:Test+003';

        let capturedFn = null;
        jest.spyOn(global, 'setInterval').mockImplementation((fn) => {
          capturedFn = fn;
          return 789;
        });

        const id = pollRerunLinkUpdateStatus(mockDispatch, courseId, 1000);
        expect(id).toBe(789);

        if (capturedFn) {
          capturedFn();
        }
        expect(mockDispatch).toHaveBeenCalledWith(expect.any(Function));

        jest.useRealTimers();
      });
    });
  });
});
