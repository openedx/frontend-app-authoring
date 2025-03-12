import fetchMock from 'fetch-mock-jest';

import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter/types';
import { QueryClient } from '@tanstack/react-query';
import {
  initializeMocks,
  render,
  screen,
  waitFor,
  within,
} from '../testUtils';
import { mockContentSearchConfig } from '../search-manager/data/api.mock';
import { CourseLibraries } from './CourseLibraries';
import {
  mockGetEntityLinks,
  mockGetEntityLinksSummaryByDownstreamContext,
  mockFetchIndexDocuments,
  mockUseLibBlockMetadata,
} from './data/api.mocks';
import { libraryBlockChangesUrl } from '../course-unit/data/api';
import { type ToastActionData } from '../generic/toast-context';

mockContentSearchConfig.applyMock();
mockGetEntityLinks.applyMock();
mockGetEntityLinksSummaryByDownstreamContext.applyMock();
mockUseLibBlockMetadata.applyMock();

const searchParamsGetMock = jest.fn();
let axiosMock: MockAdapter;
let mockShowToast: (message: string, action?: ToastActionData | undefined) => void;
let queryClient: QueryClient;

jest.mock('../studio-home/hooks', () => ({
  useStudioHome: () => ({
    isLoadingPage: false,
    isFailedLoadingPage: false,
    librariesV2Enabled: true,
  }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useSearchParams: () => [{
    get: searchParamsGetMock,
    getAll: () => [],
  }],
}));

describe('<CourseLibraries />', () => {
  beforeEach(() => {
    initializeMocks();
    fetchMock.mockReset();
    mockFetchIndexDocuments.applyMock();
    localStorage.clear();
    searchParamsGetMock.mockReturnValue('all');
  });

  const renderCourseLibrariesPage = async (courseKey?: string) => {
    const courseId = courseKey || mockGetEntityLinks.courseKey;
    render(<CourseLibraries courseId={courseId} />);
  };

  it('shows the spinner before the query is complete', async () => {
    // This mock will never return data (it loads forever):
    await renderCourseLibrariesPage(mockGetEntityLinksSummaryByDownstreamContext.courseKeyLoading);
    const spinner = await screen.findByRole('status');
    expect(spinner.textContent).toEqual('Loading...');
  });

  it('shows empty state when no links are present', async () => {
    await renderCourseLibrariesPage(mockGetEntityLinks.courseKeyEmpty);
    const emptyMsg = await screen.findByText('This course does not use any content from libraries.');
    expect(emptyMsg).toBeInTheDocument();
  });

  it('shows alert when out of sync components are present', async () => {
    await renderCourseLibrariesPage(mockGetEntityLinks.courseKey);
    const alert = await screen.findByRole('alert');
    expect(await within(alert).findByText(
      '5 library components are out of sync. Review updates to accept or ignore changes',
    )).toBeInTheDocument();
    const allTab = await screen.findByRole('tab', { name: 'Libraries' });
    expect(allTab).toHaveAttribute('aria-selected', 'true');

    const reviewBtn = await screen.findByRole('button', { name: 'Review' });
    userEvent.click(reviewBtn);

    expect(allTab).toHaveAttribute('aria-selected', 'false');
    expect(await screen.findByRole('tab', { name: 'Review Content Updates 5' })).toHaveAttribute('aria-selected', 'true');
    expect(alert).not.toBeInTheDocument();

    // go back to all tab
    userEvent.click(allTab);
    // alert should not be back
    expect(alert).not.toBeInTheDocument();
    expect(allTab).toHaveAttribute('aria-selected', 'true');

    // review updates button
    const reviewActionBtn = await screen.findByRole('button', { name: 'Review Updates' });
    userEvent.click(reviewActionBtn);
    expect(await screen.findByRole('tab', { name: 'Review Content Updates 5' })).toHaveAttribute('aria-selected', 'true');
  });

  it('hide alert on dismiss', async () => {
    await renderCourseLibrariesPage(mockGetEntityLinks.courseKey);
    const alert = await screen.findByRole('alert');
    expect(await within(alert).findByText(
      '5 library components are out of sync. Review updates to accept or ignore changes',
    )).toBeInTheDocument();
    const dismissBtn = await screen.findByRole('button', { name: 'Dismiss' });
    userEvent.click(dismissBtn);
    const allTab = await screen.findByRole('tab', { name: 'Libraries' });
    expect(allTab).toHaveAttribute('aria-selected', 'true');

    expect(alert).not.toBeInTheDocument();
  });
});

describe('<CourseLibraries ReviewTab />', () => {
  beforeEach(() => {
    const mocks = initializeMocks();
    axiosMock = mocks.axiosMock;
    mockShowToast = mocks.mockShowToast;
    fetchMock.mockReset();
    mockFetchIndexDocuments.applyMock();
    localStorage.clear();
    searchParamsGetMock.mockReturnValue('review');
    queryClient = mocks.queryClient;
  });

  const renderCourseLibrariesReviewPage = async (courseKey?: string) => {
    const courseId = courseKey || mockGetEntityLinks.courseKey;
    render(<CourseLibraries courseId={courseId} />);
  };

  it('shows the spinner before the query is complete', async () => {
    // This mock will never return data (it loads forever):
    await renderCourseLibrariesReviewPage(mockGetEntityLinks.courseKeyLoading);
    const spinner = await screen.findByRole('status');
    expect(spinner.textContent).toEqual('Loading...');
  });

  it('shows empty state when no readyToSync links are present', async () => {
    await renderCourseLibrariesReviewPage(mockGetEntityLinksSummaryByDownstreamContext.courseKeyUpToDate);
    const emptyMsg = await screen.findByText('All components are up to date');
    expect(emptyMsg).toBeInTheDocument();
  });

  it('shows all readyToSync links', async () => {
    await renderCourseLibrariesReviewPage(mockGetEntityLinksSummaryByDownstreamContext.courseKey);
    const updateBtns = await screen.findAllByRole('button', { name: 'Update' });
    expect(updateBtns.length).toEqual(5);
    const ignoreBtns = await screen.findAllByRole('button', { name: 'Ignore' });
    expect(ignoreBtns.length).toEqual(5);
  });

  it('update changes works', async () => {
    const mockInvalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    const usageKey = mockGetEntityLinks.response.results[0].downstreamUsageKey;
    axiosMock.onPost(libraryBlockChangesUrl(usageKey)).reply(200, {});
    await renderCourseLibrariesReviewPage(mockGetEntityLinksSummaryByDownstreamContext.courseKey);
    const updateBtns = await screen.findAllByRole('button', { name: 'Update' });
    expect(updateBtns.length).toEqual(5);
    userEvent.click(updateBtns[0]);
    await waitFor(() => {
      expect(axiosMock.history.post.length).toEqual(1);
    });
    expect(axiosMock.history.post[0].url).toEqual(libraryBlockChangesUrl(usageKey));
    expect(mockShowToast).toHaveBeenCalledWith('Success! "Dropdown" is updated');
    expect(mockInvalidateQueries).toHaveBeenCalledWith(['courseLibraries', 'course-v1:OpenEdx+DemoX+CourseX']);
  });

  it('update changes works in preview modal', async () => {
    const mockInvalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    const usageKey = mockGetEntityLinks.response.results[0].downstreamUsageKey;
    axiosMock.onPost(libraryBlockChangesUrl(usageKey)).reply(200, {});
    await renderCourseLibrariesReviewPage(mockGetEntityLinksSummaryByDownstreamContext.courseKey);
    const previewBtns = await screen.findAllByRole('button', { name: 'Review Updates' });
    expect(previewBtns.length).toEqual(5);
    userEvent.click(previewBtns[0]);
    const dialog = await screen.findByRole('dialog');
    const confirmBtn = await within(dialog).findByRole('button', { name: 'Accept changes' });
    userEvent.click(confirmBtn);
    await waitFor(() => {
      expect(axiosMock.history.post.length).toEqual(1);
    });
    expect(axiosMock.history.post[0].url).toEqual(libraryBlockChangesUrl(usageKey));
    expect(mockShowToast).toHaveBeenCalledWith('Success! "Dropdown" is updated');
    expect(mockInvalidateQueries).toHaveBeenCalledWith(['courseLibraries', 'course-v1:OpenEdx+DemoX+CourseX']);
  });

  it('ignore change works', async () => {
    const mockInvalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    const usageKey = mockGetEntityLinks.response.results[0].downstreamUsageKey;
    axiosMock.onDelete(libraryBlockChangesUrl(usageKey)).reply(204, {});
    await renderCourseLibrariesReviewPage(mockGetEntityLinksSummaryByDownstreamContext.courseKey);
    const ignoreBtns = await screen.findAllByRole('button', { name: 'Ignore' });
    expect(ignoreBtns.length).toEqual(5);
    // Show confirmation modal on clicking ignore.
    userEvent.click(ignoreBtns[0]);
    const dialog = await screen.findByRole('dialog', { name: 'Ignore these changes?' });
    expect(dialog).toBeInTheDocument();
    const confirmBtn = await within(dialog).findByRole('button', { name: 'Ignore' });
    userEvent.click(confirmBtn);
    await waitFor(() => {
      expect(axiosMock.history.delete.length).toEqual(1);
    });
    expect(axiosMock.history.delete[0].url).toEqual(libraryBlockChangesUrl(usageKey));
    expect(mockShowToast).toHaveBeenCalledWith(
      '"Dropdown" will remain out of sync with library content. You will be notified when this component is updated again.',
    );
    expect(mockInvalidateQueries).toHaveBeenCalledWith(['courseLibraries', 'course-v1:OpenEdx+DemoX+CourseX']);
  });

  it('ignore change works in preview', async () => {
    const mockInvalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    const usageKey = mockGetEntityLinks.response.results[0].downstreamUsageKey;
    axiosMock.onDelete(libraryBlockChangesUrl(usageKey)).reply(204, {});
    await renderCourseLibrariesReviewPage(mockGetEntityLinksSummaryByDownstreamContext.courseKey);
    const previewBtns = await screen.findAllByRole('button', { name: 'Review Updates' });
    expect(previewBtns.length).toEqual(5);
    userEvent.click(previewBtns[0]);
    const previewDialog = await screen.findByRole('dialog');
    const ignoreBtn = await within(previewDialog).findByRole('button', { name: 'Ignore changes' });
    userEvent.click(ignoreBtn);
    // Show confirmation modal on clicking ignore.
    const dialog = await screen.findByRole('dialog', { name: 'Ignore these changes?' });
    expect(dialog).toBeInTheDocument();
    const confirmBtn = await within(dialog).findByRole('button', { name: 'Ignore' });
    userEvent.click(confirmBtn);
    await waitFor(() => {
      expect(axiosMock.history.delete.length).toEqual(1);
    });
    expect(axiosMock.history.delete[0].url).toEqual(libraryBlockChangesUrl(usageKey));
    expect(mockShowToast).toHaveBeenCalledWith(
      '"Dropdown" will remain out of sync with library content. You will be notified when this component is updated again.',
    );
    expect(mockInvalidateQueries).toHaveBeenCalledWith(['courseLibraries', 'course-v1:OpenEdx+DemoX+CourseX']);
  });
});
