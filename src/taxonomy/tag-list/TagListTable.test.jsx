import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import {
  render, waitFor, screen, within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';

import initializeStore from '../../store';
import TagListTable from './TagListTable';

let store;
let axiosMock;
const queryClient = new QueryClient();

const RootWrapper = () => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <QueryClientProvider client={queryClient}>
        <TagListTable taxonomyId={1} />
      </QueryClientProvider>
    </IntlProvider>
  </AppProvider>
);

const tagDefaults = { depth: 0, external_id: null, parent_value: null };
const mockTagsResponse = {
  next: null,
  previous: null,
  count: 3,
  num_pages: 1,
  current_page: 1,
  start: 0,
  results: [
    {
      ...tagDefaults,
      value: 'root tag 1',
      child_count: 1,
      descendant_count: 14,
      _id: 1001,
      sub_tags_url: '/request/to/load/subtags/1',
    },
    {
      ...tagDefaults,
      value: 'root tag 2',
      child_count: 1,
      descendant_count: 10,
      _id: 1002,
      sub_tags_url: '/request/to/load/subtags/2',
    },
    {
      ...tagDefaults,
      value: 'root tag 3',
      child_count: 1,
      descendant_count: 5,
      _id: 1003,
      sub_tags_url: '/request/to/load/subtags/3',
    },
  ],
};
const mockTagsPaginationResponse = {
  next: null,
  previous: null,
  count: 103,
  num_pages: 2,
  current_page: 1,
  start: 0,
  results: [],
};
const rootTagsListUrl = 'http://localhost:18010/api/content_tagging/v1/taxonomies/1/tags/?page=1&page_size=100';
const subTagsResponse = {
  next: null,
  previous: null,
  count: 1,
  num_pages: 1,
  current_page: 1,
  start: 0,
  results: [
    {
      ...tagDefaults,
      depth: 1,
      value: 'the child tag',
      child_count: 0,
      _id: 1111,
      sub_tags_url: null,
    },
  ],
};
const subTagsUrl = 'http://localhost:18010/api/content_tagging/v1/taxonomies/1/tags/?full_depth_threshold=10000&parent_tag=root+tag+1';

describe('<TagListTable />', () => {
  beforeAll(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: 3,
        username: 'abc123',
        administrator: true,
        roles: [],
      },
    });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });
  beforeEach(async () => {
    store = initializeStore();
    axiosMock.reset();
  });

  it('shows the spinner before the query is complete', async () => {
    // Simulate an actual slow response from the API:
    let resolveResponse;
    const promise = new Promise(resolve => { resolveResponse = resolve; });
    axiosMock.onGet(rootTagsListUrl).reply(() => promise);
    render(<RootWrapper />);
    const spinner = screen.getByRole('status');
    expect(spinner.textContent).toEqual('loading');
    resolveResponse([200, {}]);
    const noFoundComponent = await screen.findByText('No results found');
    expect(noFoundComponent).toBeInTheDocument();
  });

  it('should render page correctly', async () => {
    axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
    render(<RootWrapper />);
    const tag = await screen.findByText('root tag 1');
    expect(tag).toBeInTheDocument();

    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(3 + 1); // 3 items plus header
    expect(within(rows[0]).getAllByRole('columnheader')[0].textContent).toEqual('Tag name');
    expect(within(rows[1]).getAllByRole('cell')[0].textContent).toEqual('root tag 1 (14)');
  });

  it('should render page correctly with subtags', async () => {
    axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
    axiosMock.onGet(subTagsUrl).reply(200, subTagsResponse);
    render(<RootWrapper />);
    const expandButton = screen.getAllByLabelText('Expand row')[0];
    expandButton.click();
    const childTag = await screen.findByText('the child tag');
    expect(childTag).toBeInTheDocument();
  });

  it('should not render pagination footer', async () => {
    axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
    render(<RootWrapper />);
    await waitFor(() => {
      expect(screen.queryByRole('navigation', {
        name: /table pagination/i,
      })).not.toBeInTheDocument();
    });
  });

  it('should render pagination footer', async () => {
    axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsPaginationResponse);
    render(<RootWrapper />);
    const tableFooter = await screen.findByRole('navigation', {
      name: /table pagination/i,
    });
    expect(tableFooter).toBeInTheDocument();
  });
});
