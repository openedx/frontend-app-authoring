import { initializeMocks } from '@src/testUtils';

import { getAllPages, MAX_PAGE_SIZE, paginatedListPage } from './paginatedList';

const url = 'http://localhost:18010/api/authoring/v2/courses/course-v1:org+101+101/textbooks/';

describe('getAllPages', () => {
  let axiosMock;

  beforeEach(() => {
    ({ axiosMock } = initializeMocks());
  });

  it('returns the results of a single page', async () => {
    axiosMock.onGet(url).reply(200, paginatedListPage(['a', 'b']));

    expect(await getAllPages(url)).toEqual(['a', 'b']);
    expect(axiosMock.history.get).toHaveLength(1);
    expect(axiosMock.history.get[0].params).toEqual({ page: 1, page_size: MAX_PAGE_SIZE });
  });

  it('requests every remaining page by number and keeps the order', async () => {
    axiosMock
      .onGet(url, { params: { page: 1, page_size: MAX_PAGE_SIZE } })
      .reply(200, paginatedListPage(['a'], { page: 1, numPages: 3 }))
      .onGet(url, { params: { page: 2, page_size: MAX_PAGE_SIZE } })
      .reply(200, paginatedListPage(['b'], { page: 2, numPages: 3 }))
      .onGet(url, { params: { page: 3, page_size: MAX_PAGE_SIZE } })
      .reply(200, paginatedListPage(['c'], { page: 3, numPages: 3 }));

    expect(await getAllPages(url)).toEqual(['a', 'b', 'c']);
    expect(axiosMock.history.get).toHaveLength(3);
  });

  it('sends the caller\'s query parameters with every page', async () => {
    axiosMock.onGet(url).reply(200, paginatedListPage([]));

    await getAllPages(url, { view: 'full' });

    expect(axiosMock.history.get[0].params).toEqual({ view: 'full', page: 1, page_size: MAX_PAGE_SIZE });
  });

  it('rejects when a page fails', async () => {
    axiosMock.onGet(url).reply(403);

    await expect(getAllPages(url)).rejects.toThrow('Request failed with status code 403');
  });
});
