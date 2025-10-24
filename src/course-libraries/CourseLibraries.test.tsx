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
    const user = userEvent.setup();
    await renderCourseLibrariesPage(mockGetEntityLinks.courseKey);
    const allTab = await screen.findByRole('tab', { name: 'Libraries' });
    const reviewTab = await screen.findByRole('tab', { name: 'Review Content Updates 7' });
    // review tab should be open by default as outOfSyncCount is greater than 0
    expect(reviewTab).toHaveAttribute('aria-selected', 'true');

    await user.click(allTab);
    const alert = await screen.findByRole('alert');
    expect(await within(alert).findByText(
      '7 library components are out of sync. Review updates to accept or ignore changes',
    )).toBeInTheDocument();
    expect(allTab).toHaveAttribute('aria-selected', 'true');

    const reviewBtn = await screen.findByRole('button', { name: 'Review' });
    await user.click(reviewBtn);

    expect(allTab).toHaveAttribute('aria-selected', 'false');
    expect(await screen.findByRole('tab', { name: 'Review Content Updates 7' })).toHaveAttribute('aria-selected', 'true');
    expect(alert).not.toBeInTheDocument();
  });

  it('hide alert on dismiss', async () => {
    const user = userEvent.setup();
    await renderCourseLibrariesPage(mockGetEntityLinks.courseKey);
    const reviewTab = await screen.findByRole('tab', { name: 'Review Content Updates 7' });
    // review tab should be open by default as outOfSyncCount is greater than 0
    expect(reviewTab).toHaveAttribute('aria-selected', 'true');
    const allTab = await screen.findByRole('tab', { name: 'Libraries' });
    await user.click(allTab);
    expect(allTab).toHaveAttribute('aria-selected', 'true');

    const alert = await screen.findByRole('alert');
    expect(await within(alert).findByText(
      '7 library components are out of sync. Review updates to accept or ignore changes',
    )).toBeInTheDocument();
    const dismissBtn = await screen.findByRole('button', { name: 'Dismiss' });
    await user.click(dismissBtn);
    expect(allTab).toHaveAttribute('aria-selected', 'true');
    await waitFor(() => expect(alert).not.toBeInTheDocument());
    // review updates button
    const reviewActionBtn = await screen.findByRole('button', { name: 'Review Updates' });
    await user.click(reviewActionBtn);
    expect(await screen.findByRole('tab', { name: 'Review Content Updates 7' })).toHaveAttribute('aria-selected', 'true');
  });

  it('show alert if max lastPublishedDate is greated than the local storage value', async () => {
    const user = userEvent.setup();
    const lastPublishedDate = new Date('2025-05-01T22:20:44.989042Z');
    localStorage.setItem(
      `outOfSyncCountAlert-${mockGetEntityLinks.courseKey}`,
      String(lastPublishedDate.getTime() - 1000),
    );

    await renderCourseLibrariesPage(mockGetEntityLinks.courseKey);
    const allTab = await screen.findByRole('tab', { name: 'Libraries' });
    const reviewTab = await screen.findByRole('tab', { name: 'Review Content Updates 7' });
    // review tab should be open by default as outOfSyncCount is greater than 0
    expect(reviewTab).toHaveAttribute('aria-selected', 'true');

    await user.click(allTab);
    const alert = await screen.findByRole('alert');
    expect(await within(alert).findByText(
      '7 library components are out of sync. Review updates to accept or ignore changes',
    )).toBeInTheDocument();
  });

  it('doesnt show alert if max lastPublishedDate is less than the local storage value', async () => {
    const user = userEvent.setup();
    const lastPublishedDate = new Date('2025-05-01T22:20:44.989042Z');
    localStorage.setItem(
      `outOfSyncCountAlert-${mockGetEntityLinks.courseKey}`,
      String(lastPublishedDate.getTime() + 1000),
    );

    await renderCourseLibrariesPage(mockGetEntityLinks.courseKey);
    const allTab = await screen.findByRole('tab', { name: 'Libraries' });
    const reviewTab = await screen.findByRole('tab', { name: 'Review Content Updates 7' });
    // review tab should be open by default as outOfSyncCount is greater than 0
    expect(reviewTab).toHaveAttribute('aria-selected', 'true');
    await user.click(allTab);
    expect(allTab).toHaveAttribute('aria-selected', 'true');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
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
    await renderCourseLibrariesReviewPage();
    const updateBtns = await screen.findAllByRole('button', { name: 'Update' });
    expect(updateBtns.length).toEqual(7);
    const ignoreBtns = await screen.findAllByRole('button', { name: 'Ignore' });
    expect(ignoreBtns.length).toEqual(7);
  });

  test.each([
    {
      label: 'update changes works with components',
      itemIndex: 0,
      expectedToastMsg: 'Success! "Dropdown" is updated',
    },
    {
      label: 'update changes works with containers',
      itemIndex: 5,
      expectedToastMsg: 'Success! "Unit 1" is updated',
    },
  ])('$label', async ({ itemIndex, expectedToastMsg }) => {
    const user = userEvent.setup();
    const mockInvalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    const usageKey = mockGetEntityLinks.response[itemIndex].downstreamUsageKey;
    axiosMock.onPost(libraryBlockChangesUrl(usageKey)).reply(200, {});
    await renderCourseLibrariesReviewPage(mockGetEntityLinksSummaryByDownstreamContext.courseKey);
    const updateBtns = await screen.findAllByRole('button', { name: 'Update' });
    expect(updateBtns.length).toEqual(7);
    await user.click(updateBtns[itemIndex]);
    await waitFor(() => {
      expect(axiosMock.history.post.length).toEqual(1);
    });
    expect(axiosMock.history.post[0].url).toEqual(libraryBlockChangesUrl(usageKey));
    expect(mockShowToast).toHaveBeenCalledWith(expectedToastMsg);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['courseLibraries', 'course-v1:OpenEdx+DemoX+CourseX'] });
  });

  test.each([
    {
      label: 'update changes works in preview modal with components',
      itemIndex: 0,
      expectedToastMsg: 'Success! "Dropdown" is updated',
    },
    {
      label: 'update changes works in preview modal with containers',
      itemIndex: 5,
      expectedToastMsg: 'Success! "Unit 1" is updated',
    },
  ])('$label', async ({ itemIndex, expectedToastMsg }) => {
    const user = userEvent.setup();
    const mockInvalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    const usageKey = mockGetEntityLinks.response[itemIndex].downstreamUsageKey;
    axiosMock.onPost(libraryBlockChangesUrl(usageKey)).reply(200, {});
    await renderCourseLibrariesReviewPage(mockGetEntityLinksSummaryByDownstreamContext.courseKey);
    const previewBtns = await screen.findAllByRole('button', { name: 'Review Updates' });
    expect(previewBtns.length).toEqual(7);
    await user.click(previewBtns[itemIndex]);
    const dialog = await screen.findByRole('dialog');
    const confirmBtn = await within(dialog).findByRole('button', { name: 'Accept changes' });
    await user.click(confirmBtn);
    await waitFor(() => {
      expect(axiosMock.history.post.length).toEqual(1);
    });
    expect(axiosMock.history.post[0].url).toEqual(libraryBlockChangesUrl(usageKey));
    expect(mockShowToast).toHaveBeenCalledWith(expectedToastMsg);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['courseLibraries', 'course-v1:OpenEdx+DemoX+CourseX'] });
  });

  test.each([
    {
      label: 'ignore change works with components',
      itemIndex: 0,
      expectedToastMsg: '"Dropdown" will remain out of sync with library content. You will be notified when this component is updated again.',
    },
    {
      label: 'ignore change works with containers',
      itemIndex: 5,
      expectedToastMsg: '"Unit 1" will remain out of sync with library content. You will be notified when this component is updated again.',
    },
  ])('$label', async ({ itemIndex, expectedToastMsg }) => {
    const user = userEvent.setup();
    const mockInvalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    const usageKey = mockGetEntityLinks.response[itemIndex].downstreamUsageKey;
    axiosMock.onDelete(libraryBlockChangesUrl(usageKey)).reply(204, {});
    await renderCourseLibrariesReviewPage(mockGetEntityLinksSummaryByDownstreamContext.courseKey);
    const ignoreBtns = await screen.findAllByRole('button', { name: 'Ignore' });
    expect(ignoreBtns.length).toEqual(7);
    // Show confirmation modal on clicking ignore.
    await user.click(ignoreBtns[itemIndex]);
    const dialog = await screen.findByRole('dialog', { name: 'Ignore these changes?' });
    expect(dialog).toBeInTheDocument();
    const confirmBtn = await within(dialog).findByRole('button', { name: 'Ignore' });
    await user.click(confirmBtn);
    await waitFor(() => {
      expect(axiosMock.history.delete.length).toEqual(1);
    });
    expect(axiosMock.history.delete[0].url).toEqual(libraryBlockChangesUrl(usageKey));
    expect(mockShowToast).toHaveBeenCalledWith(expectedToastMsg);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['courseLibraries', 'course-v1:OpenEdx+DemoX+CourseX'] });
  });

  test.each([
    {
      label: 'ignore change works with components',
      itemIndex: 0,
      expectedToastMsg: '"Dropdown" will remain out of sync with library content. You will be notified when this component is updated again.',
    },
    {
      label: 'ignore change works with containers',
      itemIndex: 5,
      expectedToastMsg: '"Unit 1" will remain out of sync with library content. You will be notified when this component is updated again.',
    },
  ])('$label', async ({ itemIndex, expectedToastMsg }) => {
    const user = userEvent.setup();
    const mockInvalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    const usageKey = mockGetEntityLinks.response[itemIndex].downstreamUsageKey;
    axiosMock.onDelete(libraryBlockChangesUrl(usageKey)).reply(204, {});
    await renderCourseLibrariesReviewPage(mockGetEntityLinksSummaryByDownstreamContext.courseKey);
    const previewBtns = await screen.findAllByRole('button', { name: 'Review Updates' });
    expect(previewBtns.length).toEqual(7);
    await user.click(previewBtns[itemIndex]);
    const previewDialog = await screen.findByRole('dialog');
    const ignoreBtn = await within(previewDialog).findByRole('button', { name: 'Ignore changes' });
    await user.click(ignoreBtn);
    // Show confirmation modal on clicking ignore.
    const dialog = await screen.findByRole('dialog', { name: 'Ignore these changes?' });
    expect(dialog).toBeInTheDocument();
    const confirmBtn = await within(dialog).findByRole('button', { name: 'Ignore' });
    await user.click(confirmBtn);
    await waitFor(() => {
      expect(axiosMock.history.delete.length).toEqual(1);
    });
    expect(axiosMock.history.delete[0].url).toEqual(libraryBlockChangesUrl(usageKey));
    expect(mockShowToast).toHaveBeenCalledWith(expectedToastMsg);
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['courseLibraries', 'course-v1:OpenEdx+DemoX+CourseX'] });
  });

  it('should show sync modal with local changes', async () => {
    const itemIndex = 3;
    const user = userEvent.setup();
    await renderCourseLibrariesReviewPage(mockGetEntityLinksSummaryByDownstreamContext.courseKey);
    const previewBtns = await screen.findAllByRole('button', { name: 'Review Updates' });
    expect(previewBtns.length).toEqual(7);
    await user.click(previewBtns[itemIndex]);

    expect(screen.getByText('This library content has local edits.')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /course content/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /published library content/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update to published library content/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /keep course content/i })).toBeInTheDocument();
  });
});
