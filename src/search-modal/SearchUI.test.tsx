import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';
import {
  fireEvent,
  render,
  waitFor,
  within,
  type RenderResult,
} from '@testing-library/react';
import fetchMock from 'fetch-mock-jest';
import type { Store } from 'redux';

import initializeStore from '../store';
import mockResult from './__mocks__/search-result.json';
import mockEmptyResult from './__mocks__/empty-search-result.json';
import mockTagsFacetResult from './__mocks__/facet-search.json';
import mockTagsFacetResultLevel0 from './__mocks__/facet-search-level0.json';
import mockTagsFacetResultLevel1 from './__mocks__/facet-search-level1.json';
import mockTagsKeywordSearchResult from './__mocks__/tags-keyword-search.json';
import SearchUI from './SearchUI';
import { getContentSearchConfigUrl } from '../search-manager/data/api';

// mockResult contains only a single result - this one:
const mockResultDisplayName = 'Test HTML Block';
let store: Store;

const queryClient = new QueryClient();

// Default props for <SearchUI />
const defaults = {
  courseId: 'course-v1:org+test+123',
};
const searchEndpoint = 'http://mock.meilisearch.local/multi-search';
const facetSearchEndpoint = 'http://mock.meilisearch.local/indexes/studio/facet-search';
const tagsKeywordSearchEndpoint = 'http://mock.meilisearch.local/indexes/studio/search';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'), // use actual for all non-hook parts
  useNavigate: () => mockNavigate,
}));

const Wrap: React.FC<{ children:React.ReactNode }> = ({ children }) => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </IntlProvider>
  </AppProvider>
);
let axiosMock: MockAdapter;

const returnEmptyResult = (_url: string, req) => {
  const requestData = JSON.parse(req.body?.toString() ?? '');
  const query = requestData?.queries[0]?.q ?? '';
  // We have to replace the query (search keywords) in the mock results with the actual query,
  // because otherwise we may have an inconsistent state that causes more queries and unexpected results.
  mockEmptyResult.results[0].query = query;
  // And fake the required '_formatted' fields; it contains the highlighting <mark>...</mark> around matched words
  // eslint-disable-next-line no-underscore-dangle, no-param-reassign
  mockEmptyResult.results[0]?.hits.forEach((hit: any) => { hit._formatted = { ...hit }; });
  return mockEmptyResult;
};

describe('<SearchUI />', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    store = initializeStore();
    // The API method to get the Meilisearch connection details uses Axios:
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    axiosMock.onGet(getContentSearchConfigUrl()).reply(200, {
      url: 'http://mock.meilisearch.local',
      index_name: 'studio',
      api_key: 'test-key',
    });

    // The Meilisearch client-side API uses fetch, not Axios.
    fetchMock.post(searchEndpoint, (_url, req) => {
      const requestData = JSON.parse(req.body?.toString() ?? '');
      const query = requestData?.queries[0]?.q ?? '';
      // We have to replace the query (search keywords) in the mock results with the actual query,
      // because otherwise Instantsearch will update the UI and change the query,
      // leading to unexpected results in the test cases.
      mockResult.results[0].query = query;
      // And fake the required '_formatted' fields; it contains the highlighting <mark>...</mark> around matched words
      // eslint-disable-next-line no-underscore-dangle, no-param-reassign
      mockResult.results[0]?.hits.forEach((hit) => { hit._formatted = { ...hit }; });
      return mockResult;
    });
    fetchMock.post(tagsKeywordSearchEndpoint, mockTagsKeywordSearchResult);
  });

  afterEach(async () => {
    fetchMock.mockReset();
  });

  it('should render an empty state', async () => {
    const { getByText } = render(<Wrap><SearchUI {...defaults} /></Wrap>);
    // Before the results have even loaded, we see this message:
    expect(getByText('Start searching to find content')).toBeInTheDocument();
    // When this UI loads, we do a "placeholder" search to load the filter options
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });
    // And that message is still displayed even after the initial results/filters have loaded:
    expect(getByText('Start searching to find content')).toBeInTheDocument();
  });

  it('should render an empty state if no result found', async () => {
    fetchMock.post(searchEndpoint, returnEmptyResult, { overwriteRoutes: true });
    const { getByText, getByRole } = render(<Wrap><SearchUI {...defaults} /></Wrap>);
    // Return an empty result set:
    // Before the results have even loaded, we see this message:
    expect(getByText('Start searching to find content')).toBeInTheDocument();
    // When this UI loads, the UI makes a search, to get the available "block type" facet values.
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });
    // And that message is still displayed even after the initial results/filters have loaded:
    expect(getByText('Start searching to find content')).toBeInTheDocument();
    // Enter a keyword - search for 'noresults':
    fireEvent.change(getByRole('searchbox'), { target: { value: 'noresults' } });
    // Wait for the new search request to load all the results:
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(2, searchEndpoint, 'post'); });
    expect(getByText('We didn\'t find anything matching your search')).toBeInTheDocument();
  });

  it('defaults to searching "All Courses" if used outside of any particular course', async () => {
    const { getByText, queryByText, getByRole } = render(<Wrap><SearchUI {...defaults} courseId="" /></Wrap>);
    // We default to searching all courses:
    expect(getByText('All courses')).toBeInTheDocument();
    expect(queryByText('This course')).toBeNull();
    // Wait for the initial search request that loads all the filter options:
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });
    // Enter a keyword - search for 'giraffe':
    fireEvent.change(getByRole('searchbox'), { target: { value: 'giraffe' } });
    // Wait for the new search request to load all the results:
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(2, searchEndpoint, 'post'); });
    // Now we should see the results:
    expect(queryByText('Enter a keyword')).toBeNull();
    // The result:
    expect(getByText('6 results found')).toBeInTheDocument();
    expect(getByText(mockResultDisplayName)).toBeInTheDocument();
    // Breadcrumbs showing where the result came from:
    expect(getByText('TheCourse / Section 2 / Subsection 3 / The Little Unit That Could')).toBeInTheDocument();
  });

  it('defaults to searching "This Course" if used in a course', async () => {
    const { getByText, queryByText, getByRole } = render(<Wrap><SearchUI {...defaults} /></Wrap>);
    // We default to searching all courses:
    expect(getByText('This course')).toBeInTheDocument();
    expect(queryByText('All courses')).toBeNull();
    // Wait for the initial search request that loads all the filter options:
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });
    // Enter a keyword - search for 'giraffe':
    fireEvent.change(getByRole('searchbox'), { target: { value: 'giraffe' } });
    // Wait for the new search request to load all the results:
    await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });
    // And make sure the request was limited to this course:
    expect(fetchMock).toHaveLastFetched((_url, req) => {
      const requestData = JSON.parse(req.body?.toString() ?? '');
      const requestedFilter = requestData?.queries[0].filter;
      return requestedFilter?.[1] === 'type = "course_block"'
        && requestedFilter?.[2] === 'context_key = "course-v1:org+test+123"';
    });
    // Now we should see the results:
    expect(queryByText('Enter a keyword')).toBeNull();
    // The result:
    expect(getByText('6 results found')).toBeInTheDocument();
    expect(getByText(mockResultDisplayName)).toBeInTheDocument();
    // Breadcrumbs showing where the result came from:
    expect(getByText('TheCourse / Section 2 / Subsection 3 / The Little Unit That Could')).toBeInTheDocument();
  });

  describe('results', () => {
    let rendered: RenderResult;
    beforeEach(async () => {
      rendered = render(<Wrap><SearchUI {...defaults} /></Wrap>);
      const { getByRole } = rendered;
      fireEvent.change(getByRole('searchbox'), { target: { value: 'giraffe' } });
    });

    test('click section result navigates to the context', async () => {
      const { findAllByRole } = rendered;

      const [resultItem] = await findAllByRole('button', { name: /Section 1/ });

      // Clicking the "Open in new window" button should open the result in a new window:
      const { open } = window;
      window.open = jest.fn();
      fireEvent.click(within(resultItem).getByRole('button', { name: 'Open in new window' }));
      expect(window.open).toHaveBeenCalledWith(
        '/course/course-v1:SampleTaxonomyOrg1+STC1+2023_1'
        + '?show=block-v1%3ASampleTaxonomyOrg1%2BSTC1%2B2023_1%2Btype%40chapter%2Bblock%40c7077c8cafcf420dbc0b440bf27bad04',
        '_blank',
      );
      window.open = open;

      // Clicking in the result should navigate to the result's URL:
      fireEvent.click(resultItem);
      expect(mockNavigate).toHaveBeenCalledWith(
        '/course/course-v1:SampleTaxonomyOrg1+STC1+2023_1'
        + '?show=block-v1%3ASampleTaxonomyOrg1%2BSTC1%2B2023_1%2Btype%40chapter%2Bblock%40c7077c8cafcf420dbc0b440bf27bad04',
      );
    });

    test('click subsection result navigates to the context', async () => {
      const { findAllByRole } = rendered;

      const [resultItem] = await findAllByRole('button', { name: /Subsection 1.1/ });

      // Clicking the "Open in new window" button should open the result in a new window:
      const { open } = window;
      window.open = jest.fn();
      fireEvent.click(within(resultItem).getByRole('button', { name: 'Open in new window' }));
      expect(window.open).toHaveBeenCalledWith(
        '/course/course-v1:SampleTaxonomyOrg1+STC1+2023_1'
        + '?show=block-v1%3ASampleTaxonomyOrg1%2BSTC1%2B2023_1%2Btype%40sequential%2Bblock%4092e3e9ca156c44fa8a735f0e9e7c854f',
        '_blank',
      );
      window.open = open;

      // Clicking in the result should navigate to the result's URL:
      fireEvent.click(resultItem);
      expect(mockNavigate).toHaveBeenCalledWith(
        '/course/course-v1:SampleTaxonomyOrg1+STC1+2023_1'
        + '?show=block-v1%3ASampleTaxonomyOrg1%2BSTC1%2B2023_1%2Btype%40sequential%2Bblock%4092e3e9ca156c44fa8a735f0e9e7c854f',
      );
    });

    test('click unit result navigates to the context', async () => {
      const { findAllByRole } = rendered;

      const [resultItem] = await findAllByRole('button', { name: /Unit 1.1.1/ });

      // Clicking the "Open in new window" button should open the result in a new window:
      const { open } = window;
      window.open = jest.fn();
      fireEvent.click(within(resultItem).getByRole('button', { name: 'Open in new window' }));
      expect(window.open).toHaveBeenCalledWith(
        '/course/course-v1:SampleTaxonomyOrg1+STC1+2023_1/container/block-v1:SampleTaxonomyOrg1+STC1+2023_1+type@vertical+block@aaf8b8eb86b54281aeeab12499d2cb0b',
        '_blank',
      );
      window.open = open;

      // Clicking in the result should navigate to the result's URL:
      fireEvent.click(resultItem);
      expect(mockNavigate).toHaveBeenCalledWith(
        '/course/course-v1:SampleTaxonomyOrg1+STC1+2023_1/container/block-v1:SampleTaxonomyOrg1+STC1+2023_1+type@vertical+block@aaf8b8eb86b54281aeeab12499d2cb0b',
      );
    });

    test('click unit component result navigates to the context', async () => {
      const { findAllByRole } = rendered;

      const [resultItem] = await findAllByRole('button', { name: /Announcement/ });

      // Clicking the "Open in new window" button should open the result in a new window:
      const { open } = window;
      window.open = jest.fn();
      fireEvent.click(within(resultItem).getByRole('button', { name: 'Open in new window' }));
      expect(window.open).toHaveBeenCalledWith(
        '/course/course-v1:SampleTaxonomyOrg1+STC1+2023_1/container/block-v1:SampleTaxonomyOrg1+STC1+2023_1+type@vertical+block@aaf8b8eb86b54281aeeab12499d2cb0b'
        + '?show=block-v1%3ASampleTaxonomyOrg1%2BSTC1%2B2023_1%2Btype%40html%2Bblock%400b2d1c0722f742489602b6d8645205f4',
        '_blank',
      );
      window.open = open;

      // Clicking in the result should navigate to the result's URL:
      fireEvent.click(resultItem);
      expect(mockNavigate).toHaveBeenCalledWith(
        '/course/course-v1:SampleTaxonomyOrg1+STC1+2023_1/container/block-v1:SampleTaxonomyOrg1+STC1+2023_1+type@vertical+block@aaf8b8eb86b54281aeeab12499d2cb0b'
        + '?show=block-v1%3ASampleTaxonomyOrg1%2BSTC1%2B2023_1%2Btype%40html%2Bblock%400b2d1c0722f742489602b6d8645205f4',
      );
    });

    test('click lib component in unit result navigates to the context of encompassing lib component', async () => {
      const { findAllByRole } = rendered;

      const [resultItem] = await findAllByRole('button', { name: /Text block in Lib Component/ });

      // Clicking the "Open in new window" button should open the result in a new window:
      const { open } = window;
      window.open = jest.fn();
      fireEvent.click(within(resultItem).getByRole('button', { name: 'Open in new window' }));

      expect(window.open).toHaveBeenCalledWith(
        '/course/course-v1:SampleTaxonomyOrg1+STC1+2023_1/container/block-v1:SampleTaxonomyOrg1+STC1+2023_1+type@vertical+block@aaf8b8eb86b54281aeeab12499d2cb0b'
        + '?show=block-v1%3ASampleTaxonomyOrg1%2BSTC1%2B2023_1%2Btype%40library_content%2Bblock%40427e5cd03fbe431d9d551c67d4e280ae',
        '_blank',
      );
      window.open = open;

      // Clicking in the result should navigate to the result's URL:
      fireEvent.click(resultItem);
      expect(mockNavigate).toHaveBeenCalledWith(
        '/course/course-v1:SampleTaxonomyOrg1+STC1+2023_1/container/block-v1:SampleTaxonomyOrg1+STC1+2023_1+type@vertical+block@aaf8b8eb86b54281aeeab12499d2cb0b'
        + '?show=block-v1%3ASampleTaxonomyOrg1%2BSTC1%2B2023_1%2Btype%40library_content%2Bblock%40427e5cd03fbe431d9d551c67d4e280ae',
      );
    });

    test('click lib component result navigates to course-authoring/library', async () => {
      const { findByRole } = rendered;

      const resultItem = await findByRole('button', { name: /Library Content/ });

      // Clicking the "Open in new window" button should open the result in a new window:
      const { open } = window;
      window.open = jest.fn();
      fireEvent.click(within(resultItem).getByRole('button', { name: 'Open in new window' }));

      expect(window.open).toHaveBeenCalledWith(
        '/library/lib:org1:libafter1',
        '_blank',
      );
      window.open = open;

      // Clicking in the result should navigate to the result's URL:
      fireEvent.click(resultItem);
      expect(mockNavigate).toHaveBeenCalledWith(
        '/library/lib:org1:libafter1',
      );
    });
  });

  describe('filters', () => {
    let rendered: RenderResult;
    beforeEach(async () => {
      fetchMock.post(facetSearchEndpoint, (_path, req) => {
        const requestData = JSON.parse(req.body?.toString() ?? '');
        switch (requestData.facetName) {
          case 'tags.taxonomy': return mockTagsFacetResult;
          case 'tags.level0': return mockTagsFacetResultLevel0;
          case 'tags.level1': return mockTagsFacetResultLevel1;
          default: throw new Error(`Facet ${requestData.facetName} not mocked for testing`);
        }
      });

      rendered = render(<Wrap><SearchUI {...defaults} /></Wrap>);
      const { getByRole, getByText } = rendered;
      // Wait for the initial search request that loads all the filter options:
      await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });
      // Enter a keyword - search for 'giraffe':
      fireEvent.change(getByRole('searchbox'), { target: { value: 'giraffe' } });
      // Wait for the new search request to load all the results and the filter options, based on the search so far:
      await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(1, searchEndpoint, 'post'); });
      // And make sure the request was limited to this course:
      expect(fetchMock).toHaveLastFetched((_url, req) => {
        const requestData = JSON.parse(req.body?.toString() ?? '');
        const requestedFilter = requestData?.queries[0].filter;
        // the filter is:
        // ['', 'type = "course_block"', 'context_key = "course-v1:org+test+123"']
        return (requestedFilter?.length === 3);
      });
      // Now we should see the results:
      expect(getByText('6 results found')).toBeInTheDocument();
      expect(getByText(mockResultDisplayName)).toBeInTheDocument();
    });

    afterEach(async () => {
      // Clear any search filters applied by the previous test.
      // We need to do this because search filters are stored in the URL, and so they can leak between tests.
      const { queryByRole } = rendered;
      const clearFilters = await queryByRole('button', { name: /clear filters/i });
      if (clearFilters) {
        fireEvent.click(clearFilters);
      }
    });

    it('can filter results by component/XBlock type', async () => {
      const { getByRole, getByText } = rendered;
      // Now open the filters menu:
      fireEvent.click(getByRole('button', { name: 'Type' }), {});
      // The dropdown menu has role="group"
      await waitFor(() => { expect(getByRole('group')).toBeInTheDocument(); });
      const problemFilterCheckbox = getByText(/Problem/i);
      fireEvent.click(problemFilterCheckbox, {});
      await waitFor(() => {
        expect(rendered.getByRole('button', { name: /type: problem/i, hidden: true })).toBeInTheDocument();
      });
      // Now wait for the filter to be applied and the new results to be fetched.
      await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(2, searchEndpoint, 'post'); });
      // Because we're mocking the results, there's no actual changes to the mock results,
      // but we can verify that the filter was sent in the request
      expect(fetchMock).toHaveLastFetched((_url, req) => {
        const requestData = JSON.parse(req.body?.toString() ?? '');
        const requestedFilter = requestData?.queries[0].filter;
        return JSON.stringify(requestedFilter) === JSON.stringify([
          [
            'block_type = problem',
            'content.problem_types = choiceresponse',
            'content.problem_types = multiplechoiceresponse',
            'content.problem_types = numericalresponse',
            'content.problem_types = optionresponse',
            'content.problem_types = stringresponse',
          ],
          'type = "course_block"',
          'context_key = "course-v1:org+test+123"',
        ]);
      });
    });

    it('can filter results by tag', async () => {
      const { getByRole, getByLabelText } = rendered;
      // Now open the filters menu:
      fireEvent.click(getByRole('button', { name: 'Tags' }), {});
      // The dropdown menu in this case doesn't have a role; let's just assume it's displayed.
      const checkboxLabel = /^ESDC Skills and Competencies/i;
      await waitFor(() => { expect(getByLabelText(checkboxLabel)).toBeInTheDocument(); });
      // In addition to the checkbox, there is another button to show the child tags:
      expect(getByLabelText(/Expand to show child tags of "ESDC Skills and Competencies"/i)).toBeInTheDocument();
      const competenciesCheckbox = getByLabelText(checkboxLabel);
      fireEvent.click(competenciesCheckbox, {});
      // Now wait for the filter to be applied and the new results to be fetched.
      await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(2, searchEndpoint, 'post'); });
      // Because we're mocking the results, there's no actual changes to the mock results,
      // but we can verify that the filter was sent in the request
      expect(fetchMock).toBeDone((_url, req) => {
        const requestData = JSON.parse(req.body?.toString() ?? '');
        const requestedFilter = requestData?.queries?.[0]?.filter;
        return JSON.stringify(requestedFilter) === JSON.stringify([
          [],
          'type = "course_block"',
          'context_key = "course-v1:org+test+123"',
          'tags.taxonomy = "ESDC Skills and Competencies"', // <-- the newly added filter, sent with the request
        ]);
      });
    });

    it('can filter results by a child tag', async () => {
      const { getByRole, getByLabelText, queryByLabelText } = rendered;
      // Now open the filters menu:
      fireEvent.click(getByRole('button', { name: 'Tags' }), {});
      // The dropdown menu in this case doesn't have a role; let's just assume it's displayed.
      const expandButtonLabel = /Expand to show child tags of "ESDC Skills and Competencies"/i;
      await waitFor(() => { expect(getByLabelText(expandButtonLabel)).toBeInTheDocument(); });

      // First, the child tag is not shown:
      const childTagLabel = /^Abilities/i;
      expect(queryByLabelText(childTagLabel)).toBeNull();
      // Click on the button to show children
      const expandButton = getByLabelText(expandButtonLabel);
      fireEvent.click(expandButton, {});
      // Now the child tag is visible:
      await waitFor(() => { expect(queryByLabelText(childTagLabel)).toBeInTheDocument(); });
      // Click on it:
      const abilitiesTagFilterCheckbox = getByLabelText(childTagLabel);
      fireEvent.click(abilitiesTagFilterCheckbox);
      // Now wait for the filter to be applied and the new results to be fetched.
      await waitFor(() => { expect(fetchMock).toHaveFetchedTimes(2, searchEndpoint, 'post'); });
      // Because we're mocking the results, there's no actual changes to the mock results,
      // but we can verify that the filter was sent in the request
      expect(fetchMock).toBeDone((_url, req) => {
        const requestData = JSON.parse(req.body?.toString() ?? '');
        const requestedFilter = requestData?.queries?.[0]?.filter;
        return JSON.stringify(requestedFilter) === JSON.stringify([
          [],
          'type = "course_block"',
          'context_key = "course-v1:org+test+123"',
          'tags.level0 = "ESDC Skills and Competencies > Abilities"',
        ]);
      });
    });

    it('can do a keyword search of the tag options', async () => {
      const { getByRole, getByLabelText, queryByLabelText } = rendered;
      // Now open the filters menu:
      fireEvent.click(getByRole('button', { name: 'Tags' }), {});
      // The dropdown menu in this case doesn't have a role; let's just assume it's displayed.
      const expandButtonLabel = /Expand to show child tags of "ESDC Skills and Competencies"/i;
      await waitFor(() => { expect(getByLabelText(expandButtonLabel)).toBeInTheDocument(); });

      const input = getByLabelText('Search tags');
      fireEvent.change(input, { target: { value: 'Lightcast' } });

      await waitFor(() => { expect(queryByLabelText(/^ESDC Skills and Competencies/i)).toBeNull(); });
      expect(queryByLabelText(/^Lightcast/i)).toBeInTheDocument();
    });
  });
});
