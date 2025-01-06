/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/jsx-filename-extension */
import {
  fireEvent, render, waitFor,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { AppProvider } from '@edx/frontend-platform/react';
import { initializeMockApp } from '@edx/frontend-platform';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import MockAdapter from 'axios-mock-adapter';
import initializeStore from '../store';
import messages from './messages';
import scanResultsMessages from './scan-results/messages';
import CourseOptimizerPage, { pollLinkCheckDuringScan } from './CourseOptimizerPage';
import { postLinkCheckCourseApiUrl, getLinkCheckStatusApiUrl } from './data/api';
import mockApiResponse from './mocks/mockApiResponse';

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
    it('should start polling if linkCheckInProgress has never been started (is null)', () => {
      const linkCheckInProgress = null;
      const linkCheckResult = 'someresult';
      const interval = { current: null };
      const dispatch = jest.fn();
      const courseId = 'course-123';
      pollLinkCheckDuringScan(linkCheckInProgress, linkCheckResult, interval, dispatch, courseId);
      expect(interval.current).not.toBeNull();
    });

    it('should start polling if link check is in progress', () => {
      const linkCheckInProgress = true;
      const linkCheckResult = 'someresult';
      const interval = { current: null };
      const dispatch = jest.fn();
      const courseId = 'course-123';
      pollLinkCheckDuringScan(linkCheckInProgress, linkCheckResult, interval, dispatch, courseId);
      expect(interval.current).not.toBeNull();
    });
    it('should not start polling if link check is not in progress', () => {
      const linkCheckInProgress = false;
      const linkCheckResult = null;
      const interval = { current: null };
      const dispatch = jest.fn();
      const courseId = 'course-123';
      pollLinkCheckDuringScan(linkCheckInProgress, linkCheckResult, interval, dispatch, courseId);
      expect(interval.current).toBeNull();
    });
    it('should clear the interval if link check is finished', () => {
      const linkCheckInProgress = false;
      const linkCheckResult = null;
      const interval = { current: 1 };
      const dispatch = jest.fn();
      const courseId = 'course-123';
      pollLinkCheckDuringScan(linkCheckInProgress, linkCheckResult, interval, dispatch, courseId);
      expect(interval.current).toBeNull();
    });
  });

  describe('CourseOptimizerPage component', () => {
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
        .onPost(postLinkCheckCourseApiUrl(courseId))
        .reply(200, { LinkCheckStatus: 'In-Progress' });
      axiosMock
        .onGet(getLinkCheckStatusApiUrl(courseId))
        .reply(200, mockApiResponse);
    });

    // postLinkCheckCourseApiUrl
    // getLinkCheckStatusApiUrl

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
      const { getByText, getAllByText, container } = render(<OptimizerPage />);
      expect(getByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
      fireEvent.click(getByText(messages.buttonTitle.defaultMessage));
      await waitFor(() => {
        expect(getByText('5 broken links')).toBeInTheDocument();
      });
      const collapsibleTrigger = container.querySelector('.collapsible-trigger');
      expect(collapsibleTrigger).toBeInTheDocument();
      fireEvent.click(collapsibleTrigger);
      await waitFor(() => {
        expect(getAllByText(scanResultsMessages.brokenLinkStatus.defaultMessage)[0]).toBeInTheDocument();
        expect(getAllByText(scanResultsMessages.lockedLinkStatus.defaultMessage)[0]).toBeInTheDocument();
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
  });
});
