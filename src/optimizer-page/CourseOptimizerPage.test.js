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

    it('should list broken links results', async () => {
      const {
        getByText, queryAllByText, getAllByText, container,
      } = render(<OptimizerPage />);
      expect(getByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
      fireEvent.click(getByText(messages.buttonTitle.defaultMessage));
      await waitFor(() => {
        expect(getByText('5 broken links')).toBeInTheDocument();
        expect(getByText('5 locked links')).toBeInTheDocument();
      });
      const collapsibleTrigger = container.querySelector('.collapsible-trigger');
      expect(collapsibleTrigger).toBeInTheDocument();
      fireEvent.click(collapsibleTrigger);
      await waitFor(() => {
        expect(getAllByText(scanResultsMessages.brokenLinkStatus.defaultMessage)[0]).toBeInTheDocument();
        expect(queryAllByText(scanResultsMessages.lockedLinkStatus.defaultMessage)[0]).toBeInTheDocument();
        expect(queryAllByText(scanResultsMessages.recommendedManualCheckText.defaultMessage)[0]).toBeInTheDocument();
        const brokenLinks = getAllByText('https://example.com/broken-link-algo');
        expect(brokenLinks.length).toBeGreaterThan(0);
        fireEvent.click(brokenLinks[0]);
        const lockedLinks = getAllByText('https://example.com/locked-link-algo');
        expect(lockedLinks.length).toBeGreaterThan(0);
        fireEvent.click(lockedLinks[0]);
        fireEvent.click((getAllByText('Go to Block'))[0]);
      });
    });

    it('should not list locked links results when show locked links is unchecked', async () => {
      const {
        getByText, getAllByText, getByLabelText, queryAllByText, queryByText, container,
      } = render(<OptimizerPage />);
      expect(getByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
      fireEvent.click(getByText(messages.buttonTitle.defaultMessage));
      await waitFor(() => {
        expect(getByText('5 broken links')).toBeInTheDocument();
      });
      fireEvent.click(getByLabelText(scanResultsMessages.lockedCheckboxLabel.defaultMessage));
      const collapsibleTrigger = container.querySelector('.collapsible-trigger');
      expect(collapsibleTrigger).toBeInTheDocument();
      fireEvent.click(collapsibleTrigger);
      await waitFor(() => {
        expect(queryByText('5 locked links')).not.toBeInTheDocument();
        expect(getAllByText(scanResultsMessages.brokenLinkStatus.defaultMessage)[0]).toBeInTheDocument();
        expect(queryAllByText(scanResultsMessages.lockedLinkStatus.defaultMessage)?.[0]).toBeUndefined();
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
  });
});
