import { act, initializeMocks, render, screen, userEvent, waitFor } from '@src/testUtils';
import { mockWaffleFlags } from '@src/data/apiHooks.mock';
import ScanResults from './ScanResults';
import messages from './messages';
import type { LinkCheckResult } from '../types';
import {
  useRerunLinkUpdateStatus,
  useUpdateAllPreviousRunLinks,
  useUpdateSinglePreviousRunLink,
} from '../data/apiHooks';

jest.mock('@src/CourseAuthoringContext', () => ({
  useCourseAuthoringContext: jest.fn(() => ({ courseId: 'test-course-id' })),
}));

jest.mock('../data/apiHooks', () => ({
  useRerunLinkUpdateStatus: jest.fn(),
  useUpdateAllPreviousRunLinks: jest.fn(),
  useUpdateSinglePreviousRunLink: jest.fn(),
}));

const mockedUseRerunLinkUpdateStatus = useRerunLinkUpdateStatus as jest.Mock;
const mockedUseUpdateAllPreviousRunLinks = useUpdateAllPreviousRunLinks as jest.Mock;
const mockedUseUpdateSinglePreviousRunLink = useUpdateSinglePreviousRunLink as jest.Mock;

const courseId = 'test-course-id';
const blockId = 'course-update-with-prev-links';

const mockData: LinkCheckResult = {
  sections: [
    {
      id: 'section-1',
      displayName: 'Introduction to Programming',
      subsections: [{
        id: 'subsection-1',
        displayName: 'Getting Started',
        units: [{
          id: 'unit-1',
          displayName: 'Test Broken Links',
          blocks: [{
            id: 'block-1',
            displayName: 'Test Broken Links',
            url: 'https://example.com/block-1',
            brokenLinks: ['https://example.com/broken-link'],
            lockedLinks: ['https://example.com/locked-link'],
            externalForbiddenLinks: ['https://example.com/manual-link'],
            previousRunLinks: [],
          }],
        }],
      }],
    },
  ],
  courseUpdates: [{
    id: blockId,
    displayName: 'Course Update with Previous Links',
    url: 'https://example.com/course-update',
    brokenLinks: ['https://example.com/course-update-broken-link'],
    lockedLinks: [],
    externalForbiddenLinks: [],
    previousRunLinks: [
      { originalLink: 'https://previous.run/link1', isUpdated: false },
      { originalLink: 'https://previous.run/link2', isUpdated: true, updatedLink: 'https://updated.run/link2' },
    ],
  }],
  customPages: [{
    id: 'custom-page-1',
    displayName: 'Custom Page',
    url: 'https://example.com/custom-page',
    brokenLinks: [],
    lockedLinks: [],
    externalForbiddenLinks: ['https://example.com/forbidden-link'],
    previousRunLinks: [],
  }],
};

const emptyData: LinkCheckResult = {
  sections: [],
  courseUpdates: [],
  customPages: [],
};

const previousRunOnlyData: LinkCheckResult = {
  sections: [],
  courseUpdates: [{
    id: blockId,
    displayName: 'Course Update with Previous Links',
    url: 'https://example.com/course-update',
    brokenLinks: [],
    lockedLinks: [],
    externalForbiddenLinks: [],
    previousRunLinks: [{ originalLink: 'https://previous.run/link1', isUpdated: false }],
  }],
  customPages: [],
};

const twoPreviousRunLinksData: LinkCheckResult = {
  ...previousRunOnlyData,
  courseUpdates: [{
    ...previousRunOnlyData.courseUpdates![0],
    previousRunLinks: [
      { originalLink: 'https://previous.run/link1', isUpdated: false },
      { originalLink: 'https://previous.run/link2', isUpdated: false },
    ],
  }],
};

const successfulResult = (newUrl: string) => ({
  id: blockId,
  success: true,
  originalUrl: 'https://previous.run/link1',
  newUrl,
  type: 'course_updates',
});

const customPagePrevRunData: LinkCheckResult = {
  sections: [],
  courseUpdates: [],
  customPages: [{
    id: 'custom-page-prev',
    displayName: 'Custom Page with Previous Links',
    url: 'https://example.com/custom-page-prev',
    brokenLinks: [],
    lockedLinks: [],
    externalForbiddenLinks: [],
    previousRunLinks: [{ originalLink: 'https://previous.run/custom-link1', isUpdated: false }],
  }],
};

const sectionPrevRunData: LinkCheckResult = {
  sections: [{
    id: 'section-prev',
    displayName: 'Section with Previous Links',
    subsections: [{
      id: 'subsection-prev',
      displayName: 'Subsection with Previous Links',
      units: [{
        id: 'unit-prev',
        displayName: 'Unit with Previous Links',
        blocks: [{
          id: 'block-prev',
          displayName: 'Block with Previous Links',
          url: 'https://example.com/block-prev',
          brokenLinks: [],
          lockedLinks: [],
          externalForbiddenLinks: [],
          previousRunLinks: [{ originalLink: 'https://previous.run/section-link1', isUpdated: false }],
        }],
      }],
    }],
  }],
  courseUpdates: [],
  customPages: [],
};

const mixedUnitsData: LinkCheckResult = {
  sections: [{
    id: 'section-mixed',
    displayName: 'Section with Mixed Units',
    subsections: [{
      id: 'subsection-mixed',
      displayName: 'Subsection with Mixed Units',
      units: [{
        id: 'unit-broken-only',
        displayName: 'Unit with Broken Links',
        blocks: [{
          id: 'block-broken-only',
          displayName: 'Broken Only Block',
          url: 'https://example.com/block-broken-only',
          brokenLinks: ['https://example.com/broken-only'],
          lockedLinks: [],
          externalForbiddenLinks: [],
          previousRunLinks: [],
        }],
      }, {
        id: 'unit-locked-only',
        displayName: 'Unit with Locked Links',
        blocks: [{
          id: 'block-locked-only',
          displayName: 'Locked Only Block',
          url: 'https://example.com/block-locked-only',
          brokenLinks: [],
          lockedLinks: ['https://example.com/locked-only'],
          externalForbiddenLinks: [],
          previousRunLinks: [],
        }],
      }],
    }],
  }],
  courseUpdates: [],
  customPages: [],
};

const twoBlocksPrevRunData: LinkCheckResult = {
  sections: [],
  courseUpdates: [{
    id: blockId,
    displayName: 'Course Update with Previous Links',
    url: 'https://example.com/course-update',
    brokenLinks: [],
    lockedLinks: [],
    externalForbiddenLinks: [],
    previousRunLinks: [
      { originalLink: 'https://previous.run/link1', isUpdated: false },
    ],
  }],
  customPages: [{
    id: 'custom-page-prev',
    displayName: 'Custom Page with Previous Links',
    url: 'https://example.com/custom-page',
    brokenLinks: [],
    lockedLinks: [],
    externalForbiddenLinks: [],
    previousRunLinks: [
      { originalLink: 'https://previous.run/custom-link1', isUpdated: false },
    ],
  }],
};

const renderScanResults = (data: LinkCheckResult | null = mockData, onErrorStateChange = jest.fn()) => (
  render(<ScanResults data={data} courseId={courseId} onErrorStateChange={onErrorStateChange} />)
);

describe('ScanResults', () => {
  let updateAllMutateAsync: jest.Mock;
  let updateSingleMutateAsync: jest.Mock;
  let refetch: jest.Mock;

  beforeEach(() => {
    initializeMocks();
    mockWaffleFlags({ enableCourseOptimizerCheckPrevRunLinks: false });
    window.scrollTo = jest.fn();

    refetch = jest.fn().mockResolvedValue({ data: undefined });
    updateAllMutateAsync = jest.fn().mockResolvedValue({});
    updateSingleMutateAsync = jest.fn().mockResolvedValue({});

    mockedUseRerunLinkUpdateStatus.mockReturnValue({
      data: undefined,
      isFetching: false,
      isSuccess: false,
      refetch,
    });
    mockedUseUpdateAllPreviousRunLinks.mockReturnValue({
      isPending: false,
      mutateAsync: updateAllMutateAsync,
    });
    mockedUseUpdateSinglePreviousRunLink.mockReturnValue({
      isPending: false,
      mutateAsync: updateSingleMutateAsync,
    });
  });

  it('renders scan results and content sections', () => {
    renderScanResults();

    expect(screen.getByText(messages.brokenLinksHeader.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.filterButtonLabel.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText('Introduction to Programming')).toBeInTheDocument();
    expect(screen.getByText(messages.courseUpdatesHeader.defaultMessage)).toBeInTheDocument();
    expect(screen.getByText(messages.customPagesHeader.defaultMessage)).toBeInTheDocument();
  });

  it.each([
    ['null data', null],
    ['empty data', emptyData],
  ])('renders the no-results state for %s', (_name, data) => {
    renderScanResults(data);

    expect(screen.getByText(messages.noResultsFound.defaultMessage)).toBeInTheDocument();
  });

  it('opens the filter modal and applies and clears filters', async () => {
    const user = userEvent.setup();
    renderScanResults();

    await user.click(screen.getByRole('button', { name: messages.filterButtonLabel.defaultMessage }));
    expect(screen.getByLabelText(messages.brokenLabel.defaultMessage)).toBeInTheDocument();
    expect(screen.getByLabelText(messages.lockedLabel.defaultMessage)).toBeInTheDocument();
    expect(screen.getByLabelText(messages.manualLabel.defaultMessage)).toBeInTheDocument();

    await user.click(screen.getByLabelText(messages.brokenLabel.defaultMessage));
    expect(screen.getByTestId('chip-brokenLinks')).toBeInTheDocument();
    await user.click(screen.getByTestId('chip-brokenLinks'));
    expect(screen.queryByTestId('chip-brokenLinks')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: messages.filterButtonLabel.defaultMessage }));
    await user.click(screen.getByLabelText(messages.brokenLabel.defaultMessage));
    expect(screen.getByTestId('chip-brokenLinks')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: messages.clearFilters.defaultMessage }));
    expect(screen.queryByTestId('chip-brokenLinks')).not.toBeInTheDocument();
  });

  it('toggles a section to show its links', async () => {
    const user = userEvent.setup();
    renderScanResults();

    await user.click(screen.getByText('Introduction to Programming'));
    expect(screen.getByText('https://example.com/broken-link')).toBeInTheDocument();
  });

  describe('previous-run links', () => {
    beforeEach(() => {
      mockWaffleFlags({ enableCourseOptimizerCheckPrevRunLinks: true });
    });

    it('renders the previous-run section and update-all control', () => {
      renderScanResults(previousRunOnlyData);

      expect(screen.getByText(messages.linkToPrevCourseRun.defaultMessage)).toBeInTheDocument();
      expect(screen.getByTestId('update-all-course')).toBeInTheDocument();
    });

    it('does not render the previous-run section when the feature is disabled', () => {
      mockWaffleFlags({ enableCourseOptimizerCheckPrevRunLinks: false });
      renderScanResults(previousRunOnlyData);

      expect(screen.queryByText(messages.linkToPrevCourseRun.defaultMessage)).not.toBeInTheDocument();
    });

    it('disables update-all when every previous-run link is already updated', () => {
      const data: LinkCheckResult = {
        ...previousRunOnlyData,
        courseUpdates: [{
          ...previousRunOnlyData.courseUpdates![0],
          previousRunLinks: [{
            originalLink: 'https://previous.run/link1',
            isUpdated: true,
            updatedLink: 'https://updated.run/link1',
          }],
        }],
      };
      renderScanResults(data);

      expect(screen.getByTestId('update-all-course')).toBeDisabled();
    });

    it('updates one link when the normalized result has a null originalUrl', async () => {
      const user = userEvent.setup();
      refetch.mockResolvedValue({
        data: {
          status: 'Succeeded',
          results: [{ ...successfulResult('https://updated.run/link1'), originalUrl: null }],
        },
      });
      renderScanResults(previousRunOnlyData);

      await user.click(screen.getByText(messages.courseUpdatesHeader.defaultMessage));
      await user.click(await screen.findByRole('button', { name: messages.updateButton.defaultMessage }));

      await waitFor(() => expect(screen.getByText('https://updated.run/link1')).toBeInTheDocument());
      expect(refetch).toHaveBeenCalled();
      expect(updateSingleMutateAsync).toHaveBeenCalledWith({
        linkUrl: 'https://previous.run/link1',
        blockId,
        contentType: 'course_updates',
      });
    });

    it('updates a previous-run link on a custom page', async () => {
      const user = userEvent.setup();
      refetch.mockResolvedValue({
        data: {
          status: 'Succeeded',
          results: [{
            id: 'custom-page-prev',
            success: true,
            originalUrl: 'https://previous.run/custom-link1',
            newUrl: 'https://updated.run/custom-link1',
            type: 'custom_pages',
          }],
        },
      });
      renderScanResults(customPagePrevRunData);

      await user.click(screen.getByText(messages.customPagesHeader.defaultMessage));
      await user.click(await screen.findByRole('button', { name: messages.updateButton.defaultMessage }));

      await waitFor(() => expect(screen.getByText('https://updated.run/custom-link1')).toBeInTheDocument());
      expect(updateSingleMutateAsync).toHaveBeenCalledWith({
        linkUrl: 'https://previous.run/custom-link1',
        blockId: 'custom-page-prev',
        contentType: 'custom_pages',
      });
    });

    it('updates a previous-run link in a regular section', async () => {
      const user = userEvent.setup();
      refetch.mockResolvedValue({
        data: {
          status: 'Succeeded',
          results: [{
            id: 'block-prev',
            success: true,
            originalUrl: 'https://previous.run/section-link1',
            newUrl: 'https://updated.run/section-link1',
            type: 'course_content',
          }],
        },
      });
      renderScanResults(sectionPrevRunData);

      await user.click(screen.getByText('Section with Previous Links'));
      await user.click(await screen.findByRole('button', { name: messages.updateButton.defaultMessage }));

      await waitFor(() => expect(screen.getByText('https://updated.run/section-link1')).toBeInTheDocument());
      expect(updateSingleMutateAsync).toHaveBeenCalledWith({
        linkUrl: 'https://previous.run/section-link1',
        blockId: 'block-prev',
        contentType: 'course_content',
      });
    });

    it('reports a failed single-link update', async () => {
      const user = userEvent.setup();
      const onErrorStateChange = jest.fn();
      refetch.mockResolvedValue({
        data: {
          status: 'Succeeded',
          results: [{
            id: blockId,
            success: false,
            originalUrl: 'https://previous.run/link1',
            newUrl: null,
            type: 'course_updates',
          }],
        },
      });
      renderScanResults(previousRunOnlyData, onErrorStateChange);

      await user.click(screen.getByText(messages.courseUpdatesHeader.defaultMessage));
      await user.click(await screen.findByRole('button', { name: messages.updateButton.defaultMessage }));

      await waitFor(() => expect(onErrorStateChange).toHaveBeenCalledWith(messages.updateLinkError.defaultMessage));
    });

    it('polls a single-link update until a successful result is available', async () => {
      jest.useFakeTimers();
      try {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        refetch
          .mockResolvedValueOnce({ data: { status: 'In Progress', results: [] } })
          .mockResolvedValueOnce({
            data: { status: 'Succeeded', results: [successfulResult('https://updated.run/link1')] },
          });
        renderScanResults(previousRunOnlyData);

        await user.click(screen.getByText(messages.courseUpdatesHeader.defaultMessage));
        await user.click(await screen.findByRole('button', { name: messages.updateButton.defaultMessage }));
        await waitFor(() => expect(refetch).toHaveBeenCalledTimes(1));

        await act(async () => jest.advanceTimersByTime(2000));

        await waitFor(() => expect(screen.getByText('https://updated.run/link1')).toBeInTheDocument());
        expect(refetch).toHaveBeenCalledTimes(2);
      } finally {
        jest.useRealTimers();
      }
    });

    it('reports a timeout error when the single-link poll never reaches a terminal status', async () => {
      jest.useFakeTimers();
      try {
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
        const onErrorStateChange = jest.fn();
        refetch.mockResolvedValue({ data: { status: 'In Progress' } });
        renderScanResults(previousRunOnlyData, onErrorStateChange);

        await user.click(screen.getByText(messages.courseUpdatesHeader.defaultMessage));
        await user.click(await screen.findByRole('button', { name: messages.updateButton.defaultMessage }));

        // pollForSingleLinkResult allows 30 retries (attempts 0..30) with a 2s delay each,
        // then throws on the 31st attempt. runAllTimersAsync fires every due timer and
        // awaits each callback's returned promise, draining the recursive microtask chain
        // so the timeout throw reaches the outer catch block.
        await act(async () => {
          await jest.runAllTimersAsync();
        });

        expect(onErrorStateChange).toHaveBeenCalledWith(messages.updateLinkError.defaultMessage);
        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
        expect(refetch).toHaveBeenCalledTimes(31);
      } finally {
        jest.useRealTimers();
      }
    });

    it('treats a Succeeded poll with no matching target as a failed single-link update', async () => {
      const user = userEvent.setup();
      const onErrorStateChange = jest.fn();
      refetch.mockResolvedValue({
        data: {
          status: 'Succeeded',
          results: [{
            id: 'different-block',
            success: true,
            originalUrl: 'https://previous.run/other-link',
            newUrl: 'https://updated.run/other-link',
            type: 'course_updates',
          }],
        },
      });
      renderScanResults(previousRunOnlyData, onErrorStateChange);

      await user.click(screen.getByText(messages.courseUpdatesHeader.defaultMessage));
      await user.click(await screen.findByRole('button', { name: messages.updateButton.defaultMessage }));

      await waitFor(() => {
        expect(onErrorStateChange).toHaveBeenCalledWith(messages.updateLinkError.defaultMessage);
        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
      });
    });

    it('treats a non-Succeeded terminal poll with no matching target as a failed single-link update', async () => {
      const user = userEvent.setup();
      const onErrorStateChange = jest.fn();
      refetch.mockResolvedValue({
        data: {
          status: 'Failed',
          results: [{
            id: 'different-block',
            success: true,
            originalUrl: 'https://previous.run/other-link',
            newUrl: 'https://updated.run/other-link',
            type: 'course_updates',
          }],
        },
      });
      renderScanResults(previousRunOnlyData, onErrorStateChange);

      await user.click(screen.getByText(messages.courseUpdatesHeader.defaultMessage));
      await user.click(await screen.findByRole('button', { name: messages.updateButton.defaultMessage }));

      await waitFor(() => {
        expect(onErrorStateChange).toHaveBeenCalledWith(messages.updateLinkError.defaultMessage);
        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
      });
    });

    it('reports a failed single-link update when results omit the originalUrl field', async () => {
      const user = userEvent.setup();
      const onErrorStateChange = jest.fn();
      refetch.mockResolvedValue({
        data: {
          status: 'Succeeded',
          results: [{
            id: blockId,
            success: false,
            newUrl: null,
            type: 'course_updates',
          }],
        },
      });
      renderScanResults(previousRunOnlyData, onErrorStateChange);

      await user.click(screen.getByText(messages.courseUpdatesHeader.defaultMessage));
      await user.click(await screen.findByRole('button', { name: messages.updateButton.defaultMessage }));

      await waitFor(() => {
        expect(onErrorStateChange).toHaveBeenCalledWith(messages.updateLinkError.defaultMessage);
        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
      });
    });

    it('reports a failed update-all result and scrolls to the error', async () => {
      const user = userEvent.setup();
      const onErrorStateChange = jest.fn();
      window.scrollTo = jest.fn();
      mockedUseRerunLinkUpdateStatus.mockReturnValue({
        data: {
          status: 'Succeeded',
          results: [{
            id: blockId,
            success: false,
            originalUrl: 'https://previous.run/link1',
            newUrl: null,
            type: 'course_updates',
          }],
        },
        isFetching: false,
        isSuccess: true,
        refetch,
      });
      renderScanResults(previousRunOnlyData, onErrorStateChange);

      await user.click(screen.getByTestId('update-all-course'));
      await waitFor(() => {
        expect(onErrorStateChange).toHaveBeenCalledWith(messages.updateLinksError.defaultMessage);
        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
      });
    });

    it('reports a failed UpdateStatus without Results', async () => {
      const user = userEvent.setup();
      const onErrorStateChange = jest.fn();
      mockedUseRerunLinkUpdateStatus.mockReturnValue({
        data: {
          status: 'Failed',
          results: [],
        },
        isFetching: false,
        isSuccess: true,
        refetch,
      });
      renderScanResults(previousRunOnlyData, onErrorStateChange);

      await user.click(screen.getByTestId('update-all-course'));

      await waitFor(() => expect(onErrorStateChange).toHaveBeenCalledWith(messages.updateLinksError.defaultMessage));
    });

    it('completes the update-all operation when the response omits a results array', async () => {
      const user = userEvent.setup();
      const onErrorStateChange = jest.fn();
      mockedUseRerunLinkUpdateStatus.mockReturnValue({
        data: {
          status: 'Succeeded',
          results: [],
        },
        isFetching: false,
        isSuccess: true,
        refetch,
      });
      renderScanResults(previousRunOnlyData, onErrorStateChange);

      await user.click(screen.getByTestId('update-all-course'));

      await waitFor(() => expect(onErrorStateChange).toHaveBeenCalledWith(null));
    });

    it('reports a terminal Failed rerun with non-empty failed results', async () => {
      const user = userEvent.setup();
      const onErrorStateChange = jest.fn();
      mockedUseRerunLinkUpdateStatus.mockReturnValue({
        data: {
          status: 'Failed',
          results: [{
            id: blockId,
            success: false,
            originalUrl: 'https://previous.run/link1',
            newUrl: null,
            type: 'course_updates',
          }],
        },
        isFetching: false,
        isSuccess: true,
        refetch,
      });
      renderScanResults(previousRunOnlyData, onErrorStateChange);

      await user.click(screen.getByTestId('update-all-course'));

      await waitFor(() => {
        expect(onErrorStateChange).toHaveBeenCalledWith(messages.updateLinksError.defaultMessage);
        expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
      });
    });

    it.each([
      ['Failed', []],
      ['Succeeded', [{
        id: blockId,
        success: true,
        originalUrl: 'https://previous.run/link1',
        newUrl: 'https://updated.run/link1',
        type: 'course_updates',
      }]],
    ])('does not bulk-process a cached %s rerun status on initial render', (status, results) => {
      const onErrorStateChange = jest.fn();
      mockedUseRerunLinkUpdateStatus.mockReturnValue({
        data: { status, results },
        isFetching: false,
        isSuccess: true,
        refetch,
      });
      renderScanResults(previousRunOnlyData, onErrorStateChange);

      expect(onErrorStateChange).not.toHaveBeenCalled();
      expect(screen.queryByText('https://updated.run/link1')).not.toBeInTheDocument();
      expect(screen.getByTestId('update-all-course')).not.toBeDisabled();
    });

    it('does not bulk-process terminal status data during a single-link update', async () => {
      const user = userEvent.setup();
      const onErrorStateChange = jest.fn();
      mockedUseRerunLinkUpdateStatus.mockReturnValue({
        data: {
          status: 'Failed',
          results: [{
            id: 'other-block',
            success: false,
            originalUrl: 'https://previous.run/other',
            newUrl: null,
            type: 'course_updates',
          }],
        },
        isFetching: false,
        isSuccess: true,
        refetch,
      });
      refetch.mockResolvedValue({
        data: { status: 'Succeeded', results: [successfulResult('https://updated.run/link1')] },
      });
      renderScanResults(previousRunOnlyData, onErrorStateChange);

      await user.click(screen.getByText(messages.courseUpdatesHeader.defaultMessage));
      await user.click(await screen.findByRole('button', { name: messages.updateButton.defaultMessage }));

      await waitFor(() => expect(screen.getByText('https://updated.run/link1')).toBeInTheDocument());
      expect(onErrorStateChange).not.toHaveBeenCalledWith(messages.updateLinksError.defaultMessage);
    });

    it('reports mutation failures for update-all and single-link updates', async () => {
      const user = userEvent.setup();
      const onErrorStateChange = jest.fn();
      updateAllMutateAsync.mockRejectedValueOnce(new Error('update all failed'));
      renderScanResults(previousRunOnlyData, onErrorStateChange);

      await user.click(screen.getByTestId('update-all-course'));
      await waitFor(() => expect(onErrorStateChange).toHaveBeenCalledWith(messages.updateLinksError.defaultMessage));

      updateSingleMutateAsync.mockRejectedValueOnce(new Error('single update failed'));
      renderScanResults(previousRunOnlyData, onErrorStateChange);
      await user.click(screen.getAllByText(messages.courseUpdatesHeader.defaultMessage).at(-1)!);
      await user.click(
        await screen.findAllByRole('button', { name: messages.updateButton.defaultMessage }).then(buttons =>
          buttons.at(-1)!
        ),
      );
      await waitFor(() => expect(onErrorStateChange).toHaveBeenCalledWith(messages.updateLinkError.defaultMessage));
    });

    it('preserves and replaces incremental update mappings', async () => {
      const user = userEvent.setup();
      let status: any = { data: undefined, isFetching: false, isSuccess: false, refetch };
      mockedUseRerunLinkUpdateStatus.mockImplementation(() => status);
      const view = renderScanResults(twoPreviousRunLinksData);

      await user.click(screen.getByTestId('update-all-course'));
      const firstResult = {
        status: 'Succeeded',
        results: [successfulResult('https://updated.run/link1-v1')],
      };
      status = { data: firstResult, isFetching: false, isSuccess: true, refetch };
      view.rerender(
        <ScanResults data={twoPreviousRunLinksData} courseId={courseId} />,
      );
      await user.click(screen.getByText(messages.courseUpdatesHeader.defaultMessage));
      expect(await screen.findByText('https://updated.run/link1-v1')).toBeInTheDocument();

      status = { data: undefined, isFetching: false, isSuccess: false, refetch };
      view.rerender(
        <ScanResults data={twoPreviousRunLinksData} courseId={courseId} />,
      );
      await user.click(screen.getByTestId('update-all-course'));
      const secondResult = {
        ...firstResult,
        results: [
          successfulResult('https://updated.run/link1-v2'),
          {
            ...successfulResult('https://updated.run/link2'),
            originalUrl: 'https://previous.run/link2',
          },
        ],
      };
      status = { data: secondResult, isFetching: false, isSuccess: true, refetch };
      view.rerender(
        <ScanResults data={twoPreviousRunLinksData} courseId={courseId} />,
      );
      const sectionToggle = screen.getByText(messages.courseUpdatesHeader.defaultMessage);
      if (sectionToggle.closest('.collapsible-trigger')?.getAttribute('aria-expanded') === 'false') {
        await user.click(sectionToggle);
      }

      expect(await screen.findByText('https://updated.run/link1-v2')).toBeInTheDocument();
      expect(screen.getByText('https://updated.run/link2')).toBeInTheDocument();
      expect(screen.queryByText('https://updated.run/link1-v1')).not.toBeInTheDocument();
    });

    it('maps bulk results to course-update blocks and ignores unknown result types', async () => {
      const user = userEvent.setup();
      mockedUseRerunLinkUpdateStatus.mockReturnValue({
        data: {
          status: 'Succeeded',
          results: [
            {
              id: 'api-course-update',
              type: 'course_updates',
              success: true,
              originalUrl: 'https://previous.run/link1',
              newUrl: 'https://updated.run/link1',
            },
            {
              id: 'unknown',
              type: 'unknown_type',
              success: true,
              originalUrl: 'https://previous.run/ignored',
              newUrl: 'https://updated.run/ignored',
            },
          ],
        },
        isFetching: false,
        isSuccess: true,
        refetch,
      });
      renderScanResults(previousRunOnlyData);

      await user.click(screen.getByTestId('update-all-course'));
      await user.click(screen.getByText(messages.courseUpdatesHeader.defaultMessage));
      expect(await screen.findByText('https://updated.run/link1')).toBeInTheDocument();
    });

    it('preserves existing colon-separated IDs when later updates target different blocks', async () => {
      const user = userEvent.setup();
      let status: any = { data: undefined, isFetching: false, isSuccess: false, refetch };
      mockedUseRerunLinkUpdateStatus.mockImplementation(() => status);
      const view = renderScanResults(twoBlocksPrevRunData);

      await user.click(screen.getByTestId('update-all-course'));
      const courseUpdateResult = {
        status: 'Succeeded',
        results: [successfulResult('https://updated.run/link1-v1')],
      };
      status = { data: courseUpdateResult, isFetching: false, isSuccess: true, refetch };
      view.rerender(
        <ScanResults data={twoBlocksPrevRunData} courseId={courseId} />,
      );
      await user.click(screen.getByText(messages.courseUpdatesHeader.defaultMessage));
      expect(await screen.findByText('https://updated.run/link1-v1')).toBeInTheDocument();

      status = { data: undefined, isFetching: false, isSuccess: false, refetch };
      view.rerender(
        <ScanResults data={twoBlocksPrevRunData} courseId={courseId} />,
      );
      await user.click(screen.getByTestId('update-all-course'));
      const customPageResult = {
        status: 'Succeeded',
        results: [
          {
            id: 'custom-page-prev',
            success: true,
            originalUrl: 'https://previous.run/custom-link1',
            newUrl: 'https://updated.run/custom-link1',
            type: 'course_updates',
          },
          { id: 'unknown-1', type: 'unknown_type', success: true, originalUrl: 'x', newUrl: 'y' },
          { id: 'unknown-2', type: 'unknown_type', success: true, originalUrl: 'x', newUrl: 'y' },
          { id: 'unknown-3', type: 'unknown_type', success: true, originalUrl: 'x', newUrl: 'y' },
          { id: 'unknown-4', type: 'unknown_type', success: true, originalUrl: 'x', newUrl: 'y' },
        ],
      };
      status = { data: customPageResult, isFetching: false, isSuccess: true, refetch };
      view.rerender(
        <ScanResults data={twoBlocksPrevRunData} courseId={courseId} />,
      );
      await user.click(screen.getByText(messages.customPagesHeader.defaultMessage));
      expect(await screen.findByText('https://updated.run/custom-link1')).toBeInTheDocument();

      const courseToggle = screen.getByText(messages.courseUpdatesHeader.defaultMessage);
      if (courseToggle.closest('.collapsible-trigger')?.getAttribute('aria-expanded') === 'false') {
        await user.click(courseToggle);
      }
      expect(screen.getByText('https://updated.run/link1-v1')).toBeInTheDocument();
    });

    it('drops existing IDs that are in the new bulk successful set', async () => {
      const user = userEvent.setup();
      let status: any = { data: undefined, isFetching: false, isSuccess: false, refetch };
      mockedUseRerunLinkUpdateStatus.mockImplementation(() => status);
      const view = renderScanResults(twoPreviousRunLinksData);

      await user.click(screen.getByTestId('update-all-course'));
      const firstResult = {
        status: 'Succeeded',
        results: [successfulResult('https://updated.run/link1-v1')],
      };
      status = { data: firstResult, isFetching: false, isSuccess: true, refetch };
      view.rerender(
        <ScanResults data={twoPreviousRunLinksData} courseId={courseId} />,
      );
      await user.click(screen.getByText(messages.courseUpdatesHeader.defaultMessage));
      expect(await screen.findByText('https://updated.run/link1-v1')).toBeInTheDocument();

      status = { data: undefined, isFetching: false, isSuccess: false, refetch };
      view.rerender(
        <ScanResults data={twoPreviousRunLinksData} courseId={courseId} />,
      );
      await user.click(screen.getByTestId('update-all-course'));
      const secondResult = {
        status: 'Succeeded',
        results: [
          successfulResult('https://updated.run/link1-v2'),
          { id: 'unknown-1', type: 'unknown_type', success: true, originalUrl: 'x', newUrl: 'y' },
          { id: 'unknown-2', type: 'unknown_type', success: true, originalUrl: 'x', newUrl: 'y' },
          { id: 'unknown-3', type: 'unknown_type', success: true, originalUrl: 'x', newUrl: 'y' },
          { id: 'unknown-4', type: 'unknown_type', success: true, originalUrl: 'x', newUrl: 'y' },
        ],
      };
      status = { data: secondResult, isFetching: false, isSuccess: true, refetch };
      view.rerender(
        <ScanResults data={twoPreviousRunLinksData} courseId={courseId} />,
      );
      const courseToggle = screen.getByText(messages.courseUpdatesHeader.defaultMessage);
      if (courseToggle.closest('.collapsible-trigger')?.getAttribute('aria-expanded') === 'false') {
        await user.click(courseToggle);
      }

      expect(await screen.findByText('https://updated.run/link1-v2')).toBeInTheDocument();
      expect(screen.queryByText('https://updated.run/link1-v1')).not.toBeInTheDocument();
    });
  });

  it('renders no-results when all links are removed by filtering', async () => {
    const user = userEvent.setup();
    renderScanResults({
      sections: [{
        ...mockData.sections[0],
        subsections: [{
          ...mockData.sections[0].subsections[0],
          units: [{
            ...mockData.sections[0].subsections[0].units[0],
            blocks: [{
              ...mockData.sections[0].subsections[0].units[0].blocks[0],
              lockedLinks: [],
              externalForbiddenLinks: [],
            }],
          }],
        }],
      }],
      courseUpdates: [],
      customPages: [],
    });

    await user.click(screen.getByRole('button', { name: messages.filterButtonLabel.defaultMessage }));
    await user.click(screen.getByLabelText(messages.lockedLabel.defaultMessage));
    expect(screen.getByText(messages.noResultsFound.defaultMessage)).toBeInTheDocument();
  });

  it('hides a filtered unit but keeps the section visible when other units remain', async () => {
    const user = userEvent.setup();
    renderScanResults(mixedUnitsData);

    await user.click(screen.getByText('Section with Mixed Units'));
    await user.click(screen.getByRole('button', { name: messages.filterButtonLabel.defaultMessage }));
    await user.click(screen.getByLabelText(messages.brokenLabel.defaultMessage));
    expect(screen.getByText('https://example.com/broken-only')).toBeInTheDocument();
    expect(screen.queryByText('https://example.com/locked-only')).not.toBeInTheDocument();
  });

  it('returns -1 from findPreviousVisibleSection and findNextVisibleSection at boundaries', async () => {
    const user = userEvent.setup();
    renderScanResults({
      sections: [
        {
          id: 'section-broken',
          displayName: 'Section Broken Only',
          subsections: [{
            id: 'subsection-broken',
            displayName: 'Subsection Broken Only',
            units: [{
              id: 'unit-broken',
              displayName: 'Unit Broken Only',
              blocks: [{
                id: 'block-broken',
                displayName: 'Block Broken Only',
                url: 'https://example.com/block-broken',
                brokenLinks: ['https://example.com/broken-only'],
                lockedLinks: [],
                externalForbiddenLinks: [],
                previousRunLinks: [],
              }],
            }],
          }],
        },
        {
          id: 'section-locked',
          displayName: 'Section Locked Only',
          subsections: [{
            id: 'subsection-locked',
            displayName: 'Subsection Locked Only',
            units: [{
              id: 'unit-locked',
              displayName: 'Unit Locked Only',
              blocks: [{
                id: 'block-locked',
                displayName: 'Block Locked Only',
                url: 'https://example.com/block-locked',
                brokenLinks: [],
                lockedLinks: ['https://example.com/locked-only'],
                externalForbiddenLinks: [],
                previousRunLinks: [],
              }],
            }],
          }],
        },
      ],
      courseUpdates: [],
      customPages: [],
    });

    await user.click(screen.getByRole('button', { name: messages.filterButtonLabel.defaultMessage }));
    await user.click(screen.getByLabelText(messages.lockedLabel.defaultMessage));
    expect(screen.getByText('Section Locked Only')).toBeInTheDocument();
    expect(screen.queryByText('Section Broken Only')).not.toBeInTheDocument();

    await user.click(screen.getByTestId('chip-lockedLinks'));
    await user.click(screen.getByRole('button', { name: messages.filterButtonLabel.defaultMessage }));
    await user.click(screen.getByLabelText(messages.brokenLabel.defaultMessage));
    expect(screen.getByText('Section Broken Only')).toBeInTheDocument();
    expect(screen.queryByText('Section Locked Only')).not.toBeInTheDocument();
  });
});
