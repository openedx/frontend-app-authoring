import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import {
  render, waitFor, waitForElementToBeRemoved, screen, within,
  fireEvent,
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
    {
      ...tagDefaults,
      depth: 1,
      value: 'the child tag',
      child_count: 0,
      _id: 1111,
      sub_tags_url: null,
      parent_value: 'root tag 1',
    },
    {
      ...tagDefaults,
      depth: 2,
      value: 'the grandchild tag',
      child_count: 0,
      _id: 1111,
      sub_tags_url: null,
      parent_value: 'the child tag',
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
const rootTagsListUrl = 'http://localhost:18010/api/content_tagging/v1/taxonomies/1/tags/?page=1&page_size=100&full_depth_threshold=1000';
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
    expect(spinner.textContent).toEqual('Loading...');
    resolveResponse([200, { results: [] }]);
    await waitForElementToBeRemoved(() => screen.queryByRole('status'));
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
    const expandButton = screen.getAllByText('Expand row')[0];
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
    const tableFooter = await screen.findAllByRole('navigation', {
      name: /table pagination/i,
    });
    expect(tableFooter[0]).toBeInTheDocument();
  });

  it('should render correct number of items in pagination footer', async () => {
    axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsPaginationResponse);
    render(<RootWrapper />);
    const paginationButtons = await screen.findByText('Page 1 of 2');
    expect(paginationButtons).toBeInTheDocument();
  });

  it('should add draft row when top-level"Add tag" button is clicked', async () => {
    axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
    render(<RootWrapper />);
    const tag = await screen.findByText('root tag 1');
    expect(tag).toBeInTheDocument();

    const addButton = await screen.findByText('Add Tag');
    addButton.click();
    const draftRow = await screen.findAllByRole('row');

    expect(draftRow[1].querySelector('input')).toBeInTheDocument();
    // expect input placeholder text to say "Type tag name"
    expect(draftRow[1].querySelector('input').placeholder).toEqual('Type tag name');
    // expect the row to include "Cancel" and "Save" buttons
    expect(within(draftRow[1]).getByText('Cancel')).toBeInTheDocument();
    expect(within(draftRow[1]).getByText('Save')).toBeInTheDocument();
  });

  it('should create a new tag when the draft row is saved', async () => {
    axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
    axiosMock.onPost('http://localhost:18010/api/content_tagging/v1/taxonomies/1/tags/').reply(201, {
      ...tagDefaults,
      value: 'a new tag',
      child_count: 0,
      descendant_count: 0,
      _id: 1234,
    });
    render(<RootWrapper />);
    const tag = await screen.findByText('root tag 1');
    expect(tag).toBeInTheDocument();
    const addButton = await screen.findByText('Add Tag');
    addButton.click();
    const draftRow = await screen.findAllByRole('row');
    const input = draftRow[1].querySelector('input');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'a new tag' } });
    fireEvent.blur(input);
    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(1);
      expect(axiosMock.history.post[0].data).toEqual(JSON.stringify({
        tag: 'a new tag',
      }));
    });
  });

  /* Acceptance Criteria:
  Cancel removes the inline row and does not create a tag
    Given the user is on the taxonomy detail page
    And that an inline row is displayed at the top of the tag list to add a new tag
    When the user selects the “Cancel” button
    Or when the user hits “escape” on their keyboard
    Then the inline row is removed
    And no new root-level tag is created
    And the tag list remains unchanged
  */
  it('should not create a new tag when the draft row is cancelled', async () => {
    axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
    render(<RootWrapper />);
    const tag = await screen.findByText('root tag 1');
    expect(tag).toBeInTheDocument();
    const addButton = await screen.findByText('Add Tag');
    addButton.click();
    const draftRow = await screen.findAllByRole('row');
    const input = draftRow[1].querySelector('input');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'a new tag' } });
    const cancelButton = within(draftRow[1]).getByText('Cancel');
    fireEvent.click(cancelButton);
    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(0);
      expect(screen.queryByText('a new tag')).not.toBeInTheDocument();
      // expect there to be no draft row, that is, no row should contain an input element
      const rows = screen.getAllByRole('row');
      const draftRows = rows.filter(row => row.querySelector('input'));
      expect(draftRows.length).toBe(0);
    });
  });

  it('should not create a new tag when the escape button is pressed', async () => {
    axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
    render(<RootWrapper />);
    const tag = await screen.findByText('root tag 1');
    expect(tag).toBeInTheDocument();
    const addButton = await screen.findByText('Add Tag');
    addButton.click();
    const draftRow = await screen.findAllByRole('row');
    const input = draftRow[1].querySelector('input');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'a new tag' } });
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
    await waitFor(() => {
      expect(axiosMock.history.post.length).toBe(0);
      expect(screen.queryByText('a new tag')).not.toBeInTheDocument();
      // expect there to be no draft row, that is, no row should contain an input element
      const rows = screen.getAllByRole('row');
      const draftRows = rows.filter(row => row.querySelector('input'));
      expect(draftRows.length).toBe(0);
    });
  });

  /* Acceptance Criteria:
  Saving creates a new root-level tag
  Given the user is on the taxonomy detail page
  And that an inline row is displayed at the top of the tag list to add a new tag
  When the user enters a tag name
  And the user selects the “Save” button
  Or the user hits “return/enter” on their keyboard
  Then an indicator is displayed to show the save in progress (loading spinner)
  Then a new root-level tag is created
  And the current pagination has not changed
  And the new tag appears in the tag list at the root level at the top
  And the inline input row, along with the two buttons, is no longer displayed
  And a toast appears to indicate that the tag was successfully saved
  */
  it('should show a loading spinner when saving a new tag', async () => {
    axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
    axiosMock.onPost('http://localhost:18010/api/content_tagging/v1/taxonomies/1/tags/').reply(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve([201, {
            ...tagDefaults,
            value: 'a new tag',
            child_count: 0,
            descendant_count: 0,
            _id: 1234,
          }]);
        }, 100);
      });
    });
    render(<RootWrapper />);
    const tag = await screen.findByText('root tag 1');
    expect(tag).toBeInTheDocument();
    const addButton = await screen.findByText('Add Tag');
    addButton.click();
    const draftRow = await screen.findAllByRole('row');
    const input = draftRow[1].querySelector('input');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'a new tag' } });
    const saveButton = within(draftRow[1]).getByText('Save');
    fireEvent.click(saveButton);
    const spinner = await screen.findByRole('status');
    expect(spinner.textContent).toEqual('Saving...');
  });

  it('should show a toast message when a new tag is successfully saved', async () => {
    axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
    axiosMock.onPost('http://localhost:18010/api/content_tagging/v1/taxonomies/1/tags/').reply(201, {
      ...tagDefaults,
      value: 'a new tag',
      child_count: 0,
      descendant_count: 0,
      _id: 1234,
    });
    render(<RootWrapper />);
    const tag = await screen.findByText('root tag 1');
    expect(tag).toBeInTheDocument();
    const addButton = await screen.findByText('Add Tag');
    addButton.click();
    const draftRow = await screen.findAllByRole('row');
    const input = draftRow[1].querySelector('input');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'a new tag' } });
    const saveButton = within(draftRow[1]).getByText('Save');
    fireEvent.click(saveButton);
    const toast = await screen.findByText('Tag "a new tag" created successfully');
    expect(toast).toBeInTheDocument();
  });

  it('should not reload the page after successfully saving a top-level tag and instead add a temporary row to the top of the table', async () => {
    axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
    axiosMock.onPost('http://localhost:18010/api/content_tagging/v1/taxonomies/1/tags/').reply(201, {
      ...tagDefaults,
      value: 'a new tag',
      child_count: 0,
      descendant_count: 0,
      _id: 1234,
    });
    render(<RootWrapper />);
    const tag = await screen.findByText('root tag 1');
    expect(tag).toBeInTheDocument();
    const addButton = await screen.findByText('Add Tag');
    addButton.click();
    const draftRow = await screen.findAllByRole('row');
    const input = draftRow[1].querySelector('input');
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'a new tag' } });
    const saveButton = within(draftRow[1]).getByText('Save');
    fireEvent.click(saveButton);
    // no input row should be in the document
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      const draftRows = rows.filter(row => row.querySelector('input'));
      expect(draftRows.length).toBe(0);
    });
    const temporaryRow = await screen.findByText('a new tag');
    expect(temporaryRow).toBeInTheDocument();

    //
  });

  it('after a temporary row is added to the table, ')
});
