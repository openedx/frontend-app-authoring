import fetchMock from 'fetch-mock-jest';
import { cloneDeep } from 'lodash';

import userEvent from '@testing-library/user-event';
import {
  initializeMocks,
  render,
  screen,
  within,
} from '../testUtils';
import { mockContentSearchConfig } from '../search-manager/data/api.mock';
import mockInfoResult from './__mocks__/courseBlocksInfo.json';
import CourseLibraries from './CourseLibraries';
import { mockGetEntityLinksByDownstreamContext } from './data/api.mocks';

mockContentSearchConfig.applyMock();
mockGetEntityLinksByDownstreamContext.applyMock();

const searchEndpoint = 'http://mock.meilisearch.local/indexes/studio/search';

jest.mock('../studio-home/hooks', () => ({
  useStudioHome: () => ({
    isLoadingPage: false,
    isFailedLoadingPage: false,
    librariesV2Enabled: true,
  }),
}));

describe('<CourseLibraries />', () => {
  beforeEach(() => {
    initializeMocks();
    fetchMock.mockReset();

    // The Meilisearch client-side API uses fetch, not Axios.
    fetchMock.post(searchEndpoint, (_url, req) => {
      const requestData = JSON.parse(req.body?.toString() ?? '');
      const filter = requestData?.filter[1];
      const mockInfoResultCopy = cloneDeep(mockInfoResult);
      const resp = mockInfoResultCopy.filter((o: { filter: string }) => o.filter === filter)[0] || {
        result: {
          hits: [],
          query: '',
          processingTimeMs: 0,
          limit: 4,
          offset: 0,
          estimatedTotalHits: 0,
        },
      };
      const { result } = resp;
      return result;
    });
  });

  const renderCourseLibrariesPage = async (courseKey?: string) => {
    const courseId = courseKey || mockGetEntityLinksByDownstreamContext.courseKey;
    render(<CourseLibraries courseId={courseId} />);
  };

  it('shows the spinner before the query is complete', async () => {
    // This mock will never return data (it loads forever):
    await renderCourseLibrariesPage(mockGetEntityLinksByDownstreamContext.courseKeyLoading);
    const spinner = await screen.findByRole('status');
    expect(spinner.textContent).toEqual('Loading...');
  });

  it('shows empty state wheen no links are present', async () => {
    await renderCourseLibrariesPage(mockGetEntityLinksByDownstreamContext.courseKeyEmpty);
    const emptyMsg = await screen.findByText('This course does not use any content from libraries.');
    expect(emptyMsg).toBeInTheDocument();
  });

  it('shows alert when out of sync components are present', async () => {
    await renderCourseLibrariesPage(mockGetEntityLinksByDownstreamContext.courseKey);
    const alert = await screen.findByRole('alert');
    expect(await within(alert).findByText(
      '1 library components are out of sync. Review updates to accept or ignore changes',
    )).toBeInTheDocument();
    const allTab = await screen.findByRole('tab', { name: 'Libraries' });
    expect(allTab).toHaveAttribute('aria-selected', 'true');

    const reviewBtn = await screen.findByRole('button', { name: 'Review' });
    userEvent.click(reviewBtn);

    expect(allTab).toHaveAttribute('aria-selected', 'false');
    expect(await screen.findByRole('tab', { name: 'Review Content Updates (1)' })).toHaveAttribute('aria-selected', 'true');
    expect(alert).not.toBeInTheDocument();

    // go back to all tab
    userEvent.click(allTab);
    // alert should not be back
    expect(alert).not.toBeInTheDocument();
    expect(allTab).toHaveAttribute('aria-selected', 'true');

    // review updates button
    const reviewActionBtn = await screen.findByRole('button', { name: 'Review Updates' });
    userEvent.click(reviewActionBtn);
    expect(await screen.findByRole('tab', { name: 'Review Content Updates (1)' })).toHaveAttribute('aria-selected', 'true');
  });

  it('hide alert on dismiss', async () => {
    await renderCourseLibrariesPage(mockGetEntityLinksByDownstreamContext.courseKey);
    const alert = await screen.findByRole('alert');
    expect(await within(alert).findByText(
      '1 library components are out of sync. Review updates to accept or ignore changes',
    )).toBeInTheDocument();
    const dismissBtn = await screen.findByRole('button', { name: 'Dismiss' });
    userEvent.click(dismissBtn);
    const allTab = await screen.findByRole('tab', { name: 'Libraries' });
    expect(allTab).toHaveAttribute('aria-selected', 'true');

    expect(alert).not.toBeInTheDocument();
  });

  it('shows links split by library', async () => {
    await renderCourseLibrariesPage(mockGetEntityLinksByDownstreamContext.courseKey);
    const msg = await screen.findByText('This course contains content from these libraries.');
    expect(msg).toBeInTheDocument();
    const allButtons = await screen.findAllByRole('button');
    // total 3 components used from lib 1
    const expectedLib1Blocks = 3;
    // total 4 components used from lib 1
    const expectedLib2Blocks = 4;
    // 1 component has updates.
    const expectedLib2ToUpdate = 1;

    const libraryCards = allButtons.filter((el) => el.classList.contains('collapsible-trigger'));
    expect(libraryCards.length).toEqual(2);
    expect(await within(libraryCards[0]).findByText('CS problems 2')).toBeInTheDocument();
    expect(await within(libraryCards[0]).findByText(`${expectedLib1Blocks} components applied`)).toBeInTheDocument();
    expect(await within(libraryCards[0]).findByText('All components up to date')).toBeInTheDocument();

    const libParent1 = libraryCards[0].parentElement;
    expect(libParent1).not.toBeNull();
    userEvent.click(libraryCards[0]);
    const xblockCards1 = libParent1!.querySelectorAll('div.card');
    expect(xblockCards1.length).toEqual(expectedLib1Blocks);

    expect(await within(libraryCards[1]).findByText('CS problems 3')).toBeInTheDocument();
    expect(await within(libraryCards[1]).findByText(`${expectedLib2Blocks} components applied`)).toBeInTheDocument();
    expect(await within(libraryCards[1]).findByText(`${expectedLib2ToUpdate} component out of sync`)).toBeInTheDocument();

    const libParent2 = libraryCards[1].parentElement;
    expect(libParent2).not.toBeNull();
    userEvent.click(libraryCards[1]);
    const xblockCards2 = libParent2!.querySelectorAll('div.card');
    expect(xblockCards2.length).toEqual(expectedLib2Blocks);
  });
});
