import type MockAdapter from 'axios-mock-adapter';

import {
  act,
  fireEvent,
  render,
  waitFor,
  screen,
  initializeMocks,
} from '@src/testUtils';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import messages from './messages';
import generalMessages from '../messages';
import scanResultsMessages from './scan-results/messages';
import CourseOptimizerPage from './CourseOptimizerPage';
import {
  postLinkCheckCourseApiUrl,
  getLinkCheckStatusApiUrl,
  getRerunLinkUpdateStatusApiUrl,
  postRerunLinkUpdateApiUrl,
} from './data/api';
import {
  mockApiResponse,
  mockApiResponseForNoResultFound,
  mockApiResponseWithPreviousRunLinks,
  mockApiResponseEmpty,
} from './mocks/mockApiResponse';
import { useWaffleFlags } from '../data/apiHooks';
import { useCourseUserPermissions } from '@src/authz/hooks';

let axiosMock: MockAdapter;
const courseId = '123';
const previousRunLink = 'https://example.com/old-course-run/link';
const previousRunLinksApiResponse = {
  LinkCheckStatus: 'Succeeded',
  LinkCheckCreatedAt: '2024-12-14T00:26:50.838350Z',
  LinkCheckOutput: {
    sections: [],
    courseUpdates: [{
      id: 'update-1',
      displayName: 'Course Update with Previous Run Link',
      url: 'https://example.com/course-update-1',
      brokenLinks: [],
      lockedLinks: [],
      externalForbiddenLinks: [],
      previousRunLinks: [{ originalLink: previousRunLink, isUpdated: false }],
    }],
    customPages: [],
  },
};
const terminalRerunResponse = {
  status: 'Succeeded',
  results: [{
    id: 'update-1',
    success: true,
    originalUrl: previousRunLink,
    newUrl: 'https://example.com/new-course-run/link',
    type: 'course_updates',
  }],
};
const terminalRerunResponseWithoutClientUpdate = {
  ...terminalRerunResponse,
  results: [{ ...terminalRerunResponse.results[0], newUrl: undefined }],
};
const authoritativeCompletedLinksApiResponse = {
  ...previousRunLinksApiResponse,
  LinkCheckOutput: {
    ...previousRunLinksApiResponse.LinkCheckOutput,
    courseUpdates: [{
      ...previousRunLinksApiResponse.LinkCheckOutput.courseUpdates[0],
      previousRunLinks: [{
        originalLink: previousRunLink,
        isUpdated: true,
        updatedLink: 'https://example.com/authoritative-refresh/link',
      }],
    }],
  },
};

// Mock the waffle flags hook
jest.mock('../data/apiHooks', () => ({
  ...jest.requireActual('../data/apiHooks'),
  useWaffleFlags: jest.fn(() => ({
    enableCourseOptimizerCheckPrevRunLinks: false,
  })),
}));

jest.mock('@src/authz/hooks', () => ({
  useCourseUserPermissions: jest.fn(),
}));

const mockedUseWaffleFlags = jest.mocked(useWaffleFlags);
const mockedUseCourseUserPermissions = jest.mocked(useCourseUserPermissions);

const mockPermissions = (overrides: Partial<ReturnType<typeof useCourseUserPermissions>> = {}) =>
  mockedUseCourseUserPermissions.mockReturnValue({
    isLoading: false,
    isAuthzEnabled: true,
    canEditCourseContent: true,
    ...overrides,
  } as ReturnType<typeof useCourseUserPermissions>);

const OptimizerPage = () => (
  <CourseAuthoringProvider courseId={courseId}>
    <CourseOptimizerPage />
  </CourseAuthoringProvider>
);

const setupOptimizerPage = async (apiResponse: object = mockApiResponse) => {
  axiosMock.onGet(getLinkCheckStatusApiUrl(courseId)).reply(200, apiResponse);
  const optimizerPage = render(<OptimizerPage />);

  // Wait for the existing scan results to load
  await waitFor(() => {
    expect(optimizerPage.getByText('Introduction to Programming')).toBeInTheDocument();
  });

  // Click on filters button
  fireEvent.click(optimizerPage.getByText(scanResultsMessages.filterButtonLabel.defaultMessage));

  return optimizerPage;
};

describe('CourseOptimizerPage', () => {
  describe('CourseOptimizerPage component', () => {
    beforeEach(() => {
      jest.useRealTimers();
      const mocks = initializeMocks();
      axiosMock = mocks.axiosMock;
      axiosMock
        .onPost(postLinkCheckCourseApiUrl(courseId))
        .reply(200, { LinkCheckStatus: 'In-Progress' });
      axiosMock
        .onGet(getLinkCheckStatusApiUrl(courseId))
        .reply(200, mockApiResponse);
      axiosMock
        .onGet(getRerunLinkUpdateStatusApiUrl(courseId))
        .reply(200, { UpdateStatus: 'Succeeded', Results: [] });
      mockPermissions();
    });

    it('shows a loading spinner while permissions are loading', async () => {
      mockPermissions({ isLoading: true, canEditCourseContent: false });
      render(<OptimizerPage />);
      expect(await screen.findByRole('status')).toBeInTheDocument();
      expect(screen.queryByTestId('permissionDeniedAlert')).not.toBeInTheDocument();
      expect(screen.queryByText(messages.headingTitle.defaultMessage)).not.toBeInTheDocument();
    });

    it('does not fetch optimizer statuses when user lacks edit course content permission', async () => {
      mockPermissions({ canEditCourseContent: false });
      render(<OptimizerPage />);
      expect(await screen.findByTestId('permissionDeniedAlert')).toBeInTheDocument();
      expect(screen.queryByText(messages.headingTitle.defaultMessage)).not.toBeInTheDocument();
      const optimizerStatusRequests = axiosMock.history.get.filter(
        ({ url }) =>
          [
            getLinkCheckStatusApiUrl(courseId),
            getRerunLinkUpdateStatusApiUrl(courseId),
          ].includes(url ?? ''),
      );
      expect(optimizerStatusRequests).toHaveLength(0);
    });

    it('does not fetch rerun status when the optional feature is disabled', async () => {
      render(<OptimizerPage />);
      await waitFor(() => expect(screen.getByText(messages.headingTitle.defaultMessage)).toBeInTheDocument());
      expect(axiosMock.history.get.filter(({ url }) => url === getRerunLinkUpdateStatusApiUrl(courseId))).toHaveLength(
        0,
      );
    });

    it('should render the component', () => {
      const { getByText, queryByText } = render(<OptimizerPage />);
      expect(getByText(messages.headingTitle.defaultMessage)).toBeInTheDocument();
      expect(getByText(messages.buttonTitle.defaultMessage)).toBeInTheDocument();
      expect(queryByText(messages.preparingStepTitle.defaultMessage)).not.toBeInTheDocument();
    });

    it('hides previous scan results while rescanning', async () => {
      let resolvePost: (value: [number, { LinkCheckStatus: string; }]) => void;
      axiosMock.onPost(postLinkCheckCourseApiUrl(courseId)).reply(() =>
        new Promise(resolve => {
          resolvePost = resolve;
        })
      );
      render(<OptimizerPage />);
      expect(await screen.findByText('Introduction to Programming')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: messages.buttonTitle.defaultMessage }));

      await waitFor(() => expect(screen.queryByText('Introduction to Programming')).not.toBeInTheDocument());
      resolvePost!([200, { LinkCheckStatus: 'Pending' }]);
    });

    it('shows the current scan stage and disables the scan button while scanning', async () => {
      axiosMock
        .onGet(getLinkCheckStatusApiUrl(courseId))
        .reply(200, { LinkCheckStatus: 'In Progress' });
      render(<OptimizerPage />);

      expect(await screen.findByText(messages.scanningStepDescription.defaultMessage)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: messages.buttonTitle.defaultMessage })).toBeDisabled();
    });

    it('resets a scan failure when starting a new scan', async () => {
      let statusRequestCount = 0;
      axiosMock.onGet(getLinkCheckStatusApiUrl(courseId)).reply(() => {
        statusRequestCount += 1;
        return statusRequestCount === 1
          ? [200, { LinkCheckStatus: 'Failed' }]
          : [200, { LinkCheckStatus: 'Pending' }];
      });
      render(<OptimizerPage />);
      expect(await screen.findByText('Link Check Failed')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: messages.buttonTitle.defaultMessage }));

      expect(await screen.findByText(messages.preparingStepDescription.defaultMessage)).toBeInTheDocument();
      expect(screen.queryByText('Link Check Failed')).not.toBeInTheDocument();
    });

    it.each([403, 500])('shows the connection error when loading scan status returns %s', async (status) => {
      axiosMock.onGet(getLinkCheckStatusApiUrl(courseId)).reply(status);
      render(<OptimizerPage />);

      expect(await screen.findByTestId('connectionErrorAlert')).toBeInTheDocument();
    });

    it('should show no broken links found message', async () => {
      axiosMock
        .onGet(getLinkCheckStatusApiUrl(courseId))
        .reply(200, { LinkCheckStatus: 'Succeeded' });
      render(<OptimizerPage />);
      expect(await screen.findByText(scanResultsMessages.noResultsFound.defaultMessage)).toBeInTheDocument();
    });

    it('shows the connection error when starting a scan fails', async () => {
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
      fireEvent.click(collapsibleTrigger!);

      await waitFor(() => {
        expect(getByText('https://example.com/locked-link')).toBeInTheDocument();
        expect(queryByText('https://example.com/broken-link')).not.toBeInTheDocument();
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
      fireEvent.click(collapsibleTrigger!);

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
      fireEvent.click(collapsibleTrigger!);

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

      await waitFor(() => {
        expect(getByText(scanResultsMessages.noResultsFound.defaultMessage)).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    describe('Previous Run Links Feature', () => {
      beforeEach(() => {
        // Enable the waffle flag for previous run links
        mockedUseWaffleFlags.mockReturnValue({
          enableCourseOptimizerCheckPrevRunLinks: true,
        } as ReturnType<typeof useWaffleFlags>);
      });

      afterEach(() => {
        // Reset to default (disabled)
        mockedUseWaffleFlags.mockReturnValue({
          enableCourseOptimizerCheckPrevRunLinks: false,
        } as ReturnType<typeof useWaffleFlags>);
      });

      const setupTerminalRerun = (
        initialRerunResponse: object = { status: null, results: [] },
        completedLinkCheckResponse: object = mockApiResponseEmpty,
        terminalResponse: object = terminalRerunResponse,
      ) => {
        axiosMock.resetHandlers();
        let linkCheckStatusRequests = 0;
        let rerunStatusRequests = 0;
        axiosMock.onGet(getLinkCheckStatusApiUrl(courseId)).reply(() => {
          linkCheckStatusRequests += 1;
          return [200, linkCheckStatusRequests === 1 ? previousRunLinksApiResponse : completedLinkCheckResponse];
        });
        axiosMock.onGet(getRerunLinkUpdateStatusApiUrl(courseId)).reply(() => {
          rerunStatusRequests += 1;
          return [200, rerunStatusRequests === 1 ? initialRerunResponse : terminalResponse];
        });
        axiosMock.onPost(postRerunLinkUpdateApiUrl(courseId)).reply(200, { status: 'Pending' });
      };

      it('refreshes authoritative results after a bulk rerun reaches a terminal status', async () => {
        setupTerminalRerun(
          { status: null, results: [] },
          authoritativeCompletedLinksApiResponse,
          terminalRerunResponseWithoutClientUpdate,
        );
        render(<OptimizerPage />);

        await screen.findByText(scanResultsMessages.linkToPrevCourseRun.defaultMessage);
        fireEvent.click(screen.getByText(scanResultsMessages.courseUpdatesHeader.defaultMessage));
        await screen.findByText(previousRunLink);
        fireEvent.click(screen.getByTestId('update-all-course'));

        await waitFor(
          () =>
            expect(axiosMock.history.get.filter(({ url }) => url === getLinkCheckStatusApiUrl(courseId))).toHaveLength(
              2,
            ),
          { timeout: 5000 },
        );
        expect(screen.getByTestId('update-all-course')).toBeDisabled();
        fireEvent.click(screen.getByText(scanResultsMessages.courseUpdatesHeader.defaultMessage));
        expect(await screen.findByText('https://example.com/authoritative-refresh/link')).toBeInTheDocument();
      });

      it('refreshes authoritative results after a single-link rerun reaches a terminal status', async () => {
        setupTerminalRerun();
        render(<OptimizerPage />);

        await screen.findByText(scanResultsMessages.linkToPrevCourseRun.defaultMessage);
        fireEvent.click(screen.getByText(scanResultsMessages.courseUpdatesHeader.defaultMessage));
        await screen.findByText(previousRunLink);
        fireEvent.click(screen.getByRole('button', { name: scanResultsMessages.updateButton.defaultMessage }));

        await waitFor(() =>
          expect(axiosMock.history.get.filter(({ url }) => url === getLinkCheckStatusApiUrl(courseId))).toHaveLength(2)
        );
        await waitFor(() => expect(screen.queryByTestId('update-all-course')).not.toBeInTheDocument());
        // One initial status GET plus the manual post-mutation poll; invalidation must not refetch.
        expect(axiosMock.history.get.filter(({ url }) => url === getRerunLinkUpdateStatusApiUrl(courseId)))
          .toHaveLength(2);
      });

      it('resumes server-owned rerun polling after remounting during an in-progress rerun', async () => {
        axiosMock.resetHandlers();
        let linkCheckStatusRequests = 0;
        let rerunStatusRequests = 0;
        axiosMock.onGet(getLinkCheckStatusApiUrl(courseId)).reply(() => {
          linkCheckStatusRequests += 1;
          return [200, linkCheckStatusRequests === 1 ? previousRunLinksApiResponse : mockApiResponseEmpty];
        });
        axiosMock.onGet(getRerunLinkUpdateStatusApiUrl(courseId)).reply(() => {
          rerunStatusRequests += 1;
          return [
            200,
            rerunStatusRequests <= 2 ? { status: 'In Progress', results: [] } : { status: 'Succeeded', results: [] },
          ];
        });
        axiosMock.onPost(postRerunLinkUpdateApiUrl(courseId)).reply(200, { status: 'Pending' });

        jest.useFakeTimers();
        try {
          const firstRender = render(<OptimizerPage />);
          await screen.findByText(scanResultsMessages.linkToPrevCourseRun.defaultMessage);
          firstRender.unmount();
          render(<OptimizerPage />);

          await act(async () => {
            await Promise.resolve();
            await Promise.resolve();
          });
          expect(rerunStatusRequests).toBe(2);
          await act(async () => {
            jest.advanceTimersByTime(2000);
            await Promise.resolve();
          });
          await waitFor(() => expect(rerunStatusRequests).toBe(3));
        } finally {
          jest.useRealTimers();
        }
      });

      it('refreshes authoritative results when a terminal rerun status is observed after remount', async () => {
        setupTerminalRerun(terminalRerunResponse);
        const firstRender = render(<OptimizerPage />);

        await waitFor(() =>
          expect(axiosMock.history.get.filter(({ url }) => url === getLinkCheckStatusApiUrl(courseId))).toHaveLength(2)
        );
        firstRender.unmount();
        render(<OptimizerPage />);

        await waitFor(() =>
          expect(axiosMock.history.get.filter(({ url }) => url === getLinkCheckStatusApiUrl(courseId))).toHaveLength(3)
        );
        await waitFor(() => expect(screen.queryByTestId('update-all-course')).not.toBeInTheDocument());
      });

      it('should show no results found for previous run links when flag is enabled but no links exist', async () => {
        axiosMock.onGet(getLinkCheckStatusApiUrl(courseId)).reply(200, mockApiResponseForNoResultFound);
        const { getByText, getAllByText } = render(<OptimizerPage />);

        await waitFor(() => {
          expect(getByText(scanResultsMessages.linkToPrevCourseRun.defaultMessage)).toBeInTheDocument();
          // Should show "No results found" for previous run section
          const noResultsElements = getAllByText(scanResultsMessages.noResultsFound.defaultMessage);
          expect(noResultsElements.length).toBeGreaterThan(0);
        }, { timeout: 5000 });
      });

      it('should not show previous run links section when waffle flag is disabled', async () => {
        // Disable the flag
        mockedUseWaffleFlags.mockReturnValue({
          enableCourseOptimizerCheckPrevRunLinks: false,
        } as ReturnType<typeof useWaffleFlags>);

        axiosMock.onGet(getLinkCheckStatusApiUrl(courseId)).reply(200, mockApiResponseWithPreviousRunLinks);
        const { getByText, queryByText } = render(<OptimizerPage />);

        fireEvent.click(getByText(messages.buttonTitle.defaultMessage));

        await waitFor(() => {
          expect(queryByText(scanResultsMessages.linkToPrevCourseRun.defaultMessage)).not.toBeInTheDocument();
        });
      });
    });
  });
});
