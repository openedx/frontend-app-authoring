import fetchMock from 'fetch-mock-jest';

import userEvent from '@testing-library/user-event';
import MockAdapter from 'axios-mock-adapter/types';
import { QueryClient } from '@tanstack/react-query';
import {
  act,
  initializeMocks,
  render,
  screen,
  waitFor,
  within,
} from '@src/testUtils';
import { mockContentSearchConfig } from '@src/search-manager/data/api.mock';
import { type ToastActionData } from '@src/generic/toast-context';
import { libraryBlockChangesUrl } from '@src/course-unit/data/api';
import { CourseAuthoringProvider } from '@src/CourseAuthoringContext';
import { useCourseUserPermissions } from '@src/authz/hooks';
import { CourseLibraries } from './CourseLibraries';
import {
  mockGetEntityLinks,
  mockGetEntityLinksSummaryByDownstreamContext,
  mockFetchIndexDocuments,
  mockUseLibBlockMetadata,
} from './data/api.mocks';
import * as api from './data/api';
import { invalidateLinksQuery } from './data/apiHooks';

mockContentSearchConfig.applyMock();
mockGetEntityLinks.applyMock();
mockGetEntityLinksSummaryByDownstreamContext.applyMock();
mockUseLibBlockMetadata.applyMock();

const searchParamsGetMock = jest.fn();
let axiosMock: MockAdapter;
let mockShowToast: (message: string, action?: ToastActionData) => void;
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

jest.mock('@src/authz/hooks', () => ({
  useCourseUserPermissions: jest.fn(),
}));

const mockPermissions = (overrides = {}) =>
  jest.mocked(useCourseUserPermissions).mockReturnValue({
    isLoading: false,
    isAuthzEnabled: true,
    canManageLibraryUpdates: true,
    ...overrides,
  } as ReturnType<typeof useCourseUserPermissions>);

describe('<CourseLibraries />', () => {
  beforeEach(() => {
    initializeMocks();
    fetchMock.mockReset();
    mockFetchIndexDocuments.applyMock();
    localStorage.clear();
    searchParamsGetMock.mockReturnValue('all');
    mockPermissions();
  });

  const renderCourseLibrariesPage = async (courseKey?: string) => {
    const courseId = courseKey || mockGetEntityLinks.courseKey;
    render(
      <CourseAuthoringProvider courseId={courseId}>
        <CourseLibraries />
      </CourseAuthoringProvider>,
    );
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

  it('shows PermissionDeniedAlert when user lacks manage library updates permission', async () => {
    mockPermissions({ canManageLibraryUpdates: false });
    await renderCourseLibrariesPage();
    expect(await screen.findByTestId('permissionDeniedAlert')).toBeInTheDocument();
    expect(screen.queryByText('Libraries')).not.toBeInTheDocument();
  });

  it('shows a loading spinner while permissions are loading', async () => {
    mockPermissions({ isLoading: true, canManageLibraryUpdates: false });
    await renderCourseLibrariesPage();
    expect(await screen.findByRole('status')).toBeInTheDocument();
    expect(screen.queryByTestId('permissionDeniedAlert')).not.toBeInTheDocument();
    expect(screen.queryByText('Libraries')).not.toBeInTheDocument();
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
    expect(
      await within(alert).findByText(
        '7 library components are out of sync. Review updates to accept or ignore changes',
      ),
    ).toBeInTheDocument();
    expect(allTab).toHaveAttribute('aria-selected', 'true');

    const reviewBtn = await screen.findByRole('button', { name: 'Review' });
    await user.click(reviewBtn);

    expect(allTab).toHaveAttribute('aria-selected', 'false');
    expect(await screen.findByRole('tab', { name: 'Review Content Updates 7' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
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
    expect(
      await within(alert).findByText(
        '7 library components are out of sync. Review updates to accept or ignore changes',
      ),
    ).toBeInTheDocument();
    const dismissBtn = await screen.findByRole('button', { name: 'Dismiss' });
    await user.click(dismissBtn);
    expect(allTab).toHaveAttribute('aria-selected', 'true');
    await waitFor(() => expect(alert).not.toBeInTheDocument());
    // review updates button
    const reviewActionBtn = await screen.findByRole('button', { name: 'Review Updates' });
    await user.click(reviewActionBtn);
    expect(await screen.findByRole('tab', { name: 'Review Content Updates 7' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
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
    expect(
      await within(alert).findByText(
        '7 library components are out of sync. Review updates to accept or ignore changes',
      ),
    ).toBeInTheDocument();
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
    mockGetEntityLinks.applyMock();
    localStorage.clear();
    searchParamsGetMock.mockReturnValue('review');
    queryClient = mocks.queryClient;
  });

  const renderCourseLibrariesReviewPage = async (courseKey?: string) => {
    const courseId = courseKey || mockGetEntityLinks.courseKey;
    render(
      <CourseAuthoringProvider courseId={courseId}>
        <CourseLibraries />
      </CourseAuthoringProvider>,
    );
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
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['courseLibraries', 'course-v1:OpenEdx+DemoX+CourseX'],
    });
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
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['courseLibraries', 'course-v1:OpenEdx+DemoX+CourseX'],
    });
  });

  test.each([
    {
      label: 'ignore change works with components',
      itemIndex: 0,
      expectedToastMsg:
        '"Dropdown" will remain out of sync with library content. You will be notified when this component is updated again.',
    },
    {
      label: 'ignore change works with containers',
      itemIndex: 5,
      expectedToastMsg:
        '"Unit 1" will remain out of sync with library content. You will be notified when this component is updated again.',
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
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['courseLibraries', 'course-v1:OpenEdx+DemoX+CourseX'],
    });
  });

  test.each([
    {
      label: 'ignore change works with components',
      itemIndex: 0,
      expectedToastMsg:
        '"Dropdown" will remain out of sync with library content. You will be notified when this component is updated again.',
    },
    {
      label: 'ignore change works with containers',
      itemIndex: 5,
      expectedToastMsg:
        '"Unit 1" will remain out of sync with library content. You will be notified when this component is updated again.',
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
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['courseLibraries', 'course-v1:OpenEdx+DemoX+CourseX'],
    });
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

  it('keeps the Update button pending until the links refetch, then removes the card', async () => {
    const user = userEvent.setup();
    const usageKey = mockGetEntityLinks.response[0].downstreamUsageKey;
    axiosMock.onPost(libraryBlockChangesUrl(usageKey)).reply(200, {});
    await renderCourseLibrariesReviewPage(mockGetEntityLinksSummaryByDownstreamContext.courseKey);
    const updateBtns = await screen.findAllByRole('button', { name: 'Update' });
    expect(updateBtns.length).toEqual(7);

    // Hold the links refetch until the test releases it. Once released, the synced item is no longer ready to sync.
    let releaseRefetch = () => {};
    const refetchReleased = new Promise<void>((resolve) => {
      releaseRefetch = resolve;
    });
    jest.spyOn(api, 'getEntityLinks').mockImplementation(async (courseId, readyToSync) => {
      await refetchReleased;
      const links = await mockGetEntityLinks(courseId, readyToSync);
      return links.filter((link) => link.downstreamUsageKey !== usageKey);
    });

    try {
      await user.click(updateBtns[0]);
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith('Success! "Dropdown" is updated');
      });
      // The sync is done but the links have not refetched yet, so a second click must not send another sync.
      expect(updateBtns[0]).toHaveAttribute('aria-disabled', 'true');
      await user.click(updateBtns[0]);
      expect(axiosMock.history.post.length).toEqual(1);
    } finally {
      releaseRefetch();
    }

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Update' }).length).toEqual(6);
    });
    expect(axiosMock.history.post.length).toEqual(1);
  });

  it('keeps the first Update button pending when a second update cancels its links refetch', async () => {
    const user = userEvent.setup();
    const firstKey = mockGetEntityLinks.response[0].downstreamUsageKey;
    const secondKey = mockGetEntityLinks.response[1].downstreamUsageKey;
    axiosMock.onPost(libraryBlockChangesUrl(firstKey)).reply(200, {});
    axiosMock.onPost(libraryBlockChangesUrl(secondKey)).reply(200, {});
    await renderCourseLibrariesReviewPage(mockGetEntityLinksSummaryByDownstreamContext.courseKey);
    const updateBtns = await screen.findAllByRole('button', { name: 'Update' });
    expect(updateBtns.length).toEqual(7);

    // Hold every links refetch until the test releases them. Once released, both synced items are gone.
    let releaseRefetch = () => {};
    const refetchReleased = new Promise<void>((resolve) => {
      releaseRefetch = resolve;
    });
    jest.spyOn(api, 'getEntityLinks').mockImplementation(async (courseId, readyToSync) => {
      await refetchReleased;
      const links = await mockGetEntityLinks(courseId, readyToSync);
      return links.filter((link) => ![firstKey, secondKey].includes(link.downstreamUsageKey));
    });

    try {
      await user.click(updateBtns[0]);
      await waitFor(() => {
        expect(axiosMock.history.post.length).toEqual(1);
      });
      // The second update invalidates the links again, which cancels the refetch the first update is waiting for.
      await user.click(updateBtns[1]);
      await waitFor(() => {
        expect(axiosMock.history.post.length).toEqual(2);
      });
      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledTimes(2);
      });
      expect(updateBtns[0]).toHaveAttribute('aria-disabled', 'true');
      expect(updateBtns[1]).toHaveAttribute('aria-disabled', 'true');
    } finally {
      releaseRefetch();
    }

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Update' }).length).toEqual(5);
    });
    expect(axiosMock.history.post.length).toEqual(2);
  });

  it('keeps the card and re-enables the Update button when the sync fails', async () => {
    const user = userEvent.setup();
    const mockInvalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    const usageKey = mockGetEntityLinks.response[0].downstreamUsageKey;
    axiosMock.onPost(libraryBlockChangesUrl(usageKey)).reply(500, {});
    await renderCourseLibrariesReviewPage(mockGetEntityLinksSummaryByDownstreamContext.courseKey);
    const updateBtns = await screen.findAllByRole('button', { name: 'Update' });

    await user.click(updateBtns[0]);
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Failed to update component');
    });
    await waitFor(() => {
      expect(updateBtns[0]).not.toHaveAttribute('aria-disabled', 'true');
    });
    expect(screen.getAllByRole('button', { name: 'Update' }).length).toEqual(7);
    expect(mockInvalidateQueries).not.toHaveBeenCalled();
  });

  it('re-enables the Update button if the item is still out of sync after the links refetch', async () => {
    const user = userEvent.setup();
    const usageKey = mockGetEntityLinks.response[0].downstreamUsageKey;
    axiosMock.onPost(libraryBlockChangesUrl(usageKey)).reply(200, {});
    await renderCourseLibrariesReviewPage(mockGetEntityLinksSummaryByDownstreamContext.courseKey);
    const updateBtns = await screen.findAllByRole('button', { name: 'Update' });

    await user.click(updateBtns[0]);
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Success! "Dropdown" is updated');
    });
    await waitFor(() => {
      expect(updateBtns[0]).not.toHaveAttribute('aria-disabled', 'true');
    });
    expect(screen.getAllByRole('button', { name: 'Update' }).length).toEqual(7);

    // The button works again
    await user.click(updateBtns[0]);
    await waitFor(() => {
      expect(axiosMock.history.post.length).toEqual(2);
    });
  });

  it('updates an item that became ready to sync after the page loaded', async () => {
    const user = userEvent.setup();
    const usageKey = mockGetEntityLinks.response[0].downstreamUsageKey;
    axiosMock.onPost(libraryBlockChangesUrl(usageKey)).reply(200, {});
    let includeItem = false;
    jest.spyOn(api, 'getEntityLinks').mockImplementation(async (courseId, readyToSync) => {
      const links = await mockGetEntityLinks(courseId, readyToSync);
      return includeItem ? links : links.filter((link) => link.downstreamUsageKey !== usageKey);
    });
    await renderCourseLibrariesReviewPage(mockGetEntityLinksSummaryByDownstreamContext.courseKey);
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Update' }).length).toEqual(6);
    });

    // The library is published again while the page is open, so the item shows up after a refetch.
    includeItem = true;
    await act(() => invalidateLinksQuery(queryClient, mockGetEntityLinks.courseKey));
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: 'Update' }).length).toEqual(7);
    });

    const mockInvalidateQueries = jest.spyOn(queryClient, 'invalidateQueries');
    await user.click(screen.getAllByRole('button', { name: 'Update' })[0]);
    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith('Success! "Dropdown" is updated');
    });
    expect(mockShowToast).not.toHaveBeenCalledWith('Failed to update component');
    expect(mockInvalidateQueries).toHaveBeenCalledWith({
      queryKey: ['courseLibraries', 'course-v1:OpenEdx+DemoX+CourseX'],
    });
  });
});
