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

const RootWrapper = ({ maxDepth = 2 }) => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <QueryClientProvider client={queryClient}>
        <TagListTable taxonomyId={1} maxDepth={maxDepth} />
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
const createTagUrl = 'http://localhost:18010/api/content_tagging/v1/taxonomies/1/tags/';

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

  describe('Create a new top-level tag', () => {
    it('should add draft row when top-level"Add tag" button is clicked', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
      render(<RootWrapper />);
      const tag = await screen.findByText('root tag 1');
      expect(tag).toBeInTheDocument();

      const addButton = await screen.findByLabelText('Create Tag');
      addButton.click();
      const creatingRow = await screen.findByTestId('creating-top-tag-row');
      // expect input placeholder text to say "Type tag name"
      expect(creatingRow.querySelector('input').placeholder).toEqual('Type tag name');
      // expect the row to include "Cancel" and "Save" buttons
      expect(within(creatingRow).getByText('Cancel')).toBeInTheDocument();
      expect(within(creatingRow).getByText('Save')).toBeInTheDocument();
    });

    it('should create a new tag when the draft row is saved', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
      axiosMock.onPost(createTagUrl).reply(201, {
        ...tagDefaults,
        value: 'a new tag',
        child_count: 0,
        descendant_count: 0,
        _id: 1234,
      });
      render(<RootWrapper />);
      const tag = await screen.findByText('root tag 1');
      expect(tag).toBeInTheDocument();
      const addButton = await screen.findByLabelText('Create Tag');
      addButton.click();
      const creatingRow = await screen.findByTestId('creating-top-tag-row');
      const input = creatingRow.querySelector('input');
      expect(input).toBeInTheDocument();

      fireEvent.change(input, { target: { value: 'a new tag' } });
      const saveButton = within(creatingRow).getByText('Save');
      fireEvent.click(saveButton);
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
      const addButton = await screen.findByLabelText('Create Tag');
      addButton.click();
      const creatingRow = await screen.findByTestId('creating-top-tag-row');
      const input = creatingRow.querySelector('input');
      expect(input).toBeInTheDocument();

      fireEvent.change(input, { target: { value: 'a new tag' } });
      const cancelButton = within(creatingRow).getByText('Cancel');
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
      const addButton = await screen.findByLabelText('Create Tag');
      addButton.click();
      const creatingRow = await screen.findByTestId('creating-top-tag-row');
      const input = creatingRow.querySelector('input');
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
      axiosMock.onPost(createTagUrl).reply(() => {
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
      const addButton = await screen.findByLabelText('Create Tag');
      addButton.click();
      const creatingRow = await screen.findByTestId('creating-top-tag-row');
      const input = creatingRow.querySelector('input');
      expect(input).toBeInTheDocument();

      fireEvent.change(input, { target: { value: 'a new tag' } });
      const saveButton = within(creatingRow).getByText('Save');
      fireEvent.click(saveButton);
      const spinner = await screen.findByRole('status');
      expect(spinner.textContent).toEqual('Saving...');
    });

    it('should show a newly created top-level tag without triggering a page refresh', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
      axiosMock.onPost(createTagUrl).reply(201, {
        ...tagDefaults,
        value: 'a new tag',
        child_count: 0,
        descendant_count: 0,
        _id: 1234,
      });
      render(<RootWrapper />);
      const tag = await screen.findByText('root tag 1');
      expect(tag).toBeInTheDocument();
      const addButton = await screen.findByLabelText('Create Tag');
      addButton.click();
      const creatingRow = await screen.findByTestId('creating-top-tag-row');
      const input = creatingRow.querySelector('input');
      expect(input).toBeInTheDocument();

      fireEvent.change(input, { target: { value: 'a new tag' } });
      const saveButton = within(creatingRow).getByText('Save');
      fireEvent.click(saveButton);
      let newTag;
      screen.debug();
      await waitFor(() => {
        newTag = screen.getByText('a new tag');
        expect(newTag).toBeInTheDocument();
      });
      // expect the new tag to be the first row after the header, that is, the top of the list
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toContainElement(newTag);
      // expect there to be no draft row, that is, no row should contain an input element
      const draftRows = rows.filter(row => row.querySelector('input'));
      expect(draftRows.length).toBe(0);

      // expect only one get request to have been made, that is, the table should not have been refreshed
      expect(axiosMock.history.get.length).toBe(1);
    });

    it('should show a toast message when a new tag is successfully saved', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
      axiosMock.onPost(createTagUrl).reply(201, {
        ...tagDefaults,
        value: 'a new tag',
        child_count: 0,
        descendant_count: 0,
        _id: 1234,
      });
      render(<RootWrapper />);
      const tag = await screen.findByText('root tag 1');
      expect(tag).toBeInTheDocument();
      const addButton = await screen.findByLabelText('Create Tag');
      addButton.click();
      const creatingRow = await screen.findByTestId('creating-top-tag-row');
      const input = creatingRow.querySelector('input');
      expect(input).toBeInTheDocument();

      fireEvent.change(input, { target: { value: 'a new tag' } });
      const saveButton = within(creatingRow).getByText('Save');
      fireEvent.click(saveButton);
      const toast = await screen.findByText('Tag "a new tag" created successfully');
      expect(toast).toBeInTheDocument();
    });

    it('should add a temporary row to the top of the table', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
      axiosMock.onPost(createTagUrl).reply(201, {
        ...tagDefaults,
        value: 'xyz tag',
        child_count: 0,
        descendant_count: 0,
        _id: 1234,
      });
      render(<RootWrapper />);
      const tag = await screen.findByText('root tag 1');
      expect(tag).toBeInTheDocument();
      const addButton = await screen.findByLabelText('Create Tag');
      addButton.click();
      const creatingRow = await screen.findByTestId('creating-top-tag-row');
      const input = creatingRow.querySelector('input');
      expect(input).toBeInTheDocument();

      fireEvent.change(input, { target: { value: 'xyz tag' } });
      const saveButton = within(creatingRow).getByText('Save');
      fireEvent.click(saveButton);
      // no input row should be in the document
      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        const draftRows = rows.filter(row => row.querySelector('input'));
        expect(draftRows.length).toBe(0);
      });
      const temporaryRow = await screen.findByText('xyz tag');
      expect(temporaryRow).toBeInTheDocument();
    });

    it('should refresh the table and remove the temporary row when a pagination button is clicked', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
      axiosMock.onPost(createTagUrl).reply(201, {
        ...tagDefaults,
        value: 'xyz tag',
        child_count: 0,
        descendant_count: 0,
        _id: 1234,
      });
      render(<RootWrapper />);
      const tag = await screen.findByText('root tag 1');
      expect(tag).toBeInTheDocument();
      const addButton = await screen.findByLabelText('Create Tag');
      addButton.click();
      const creatingRow = await screen.findByTestId('creating-top-tag-row');
      const input = creatingRow.querySelector('input');
      expect(input).toBeInTheDocument();

      fireEvent.change(input, { target: { value: 'xyz tag' } });
      const saveButton = within(creatingRow).getByText('Save');
      fireEvent.click(saveButton);
      const temporaryRow = await screen.findByText('xyz tag');
      // temporaryRow should be at the top of the table, that is, the first row after the header
      const rows = screen.getAllByRole('row');
      expect(rows[1]).toContainElement(temporaryRow);

      // Simulate clicking a pagination button
      const paginationButton = await screen.findByRole('button', { name: 'Go to page 2' });
      fireEvent.click(paginationButton);

      await waitFor(() => {
        // A get request should have refreshed the table data
        expect(axiosMock.history.get.length).toBeGreaterThan(1);
        const xyzTagRow = screen.queryByText('xyz tag');
        expect(xyzTagRow).toBeInTheDocument();
        // expect the row to not be the first row after the header
        expect(rows[1]).not.toContainElement(xyzTagRow);
      });
    });

    /* Acceptance Criteria:
    Add multiple tags consecutively without a page refresh
    Given that the user is viewing the Taxonomy Detail page for a taxonomy
    When the user add a new tag named "Tag A" and save
    And the user add a new tag named "Tag B" and save
    Then the page does not perform a refresh
    And "Tag B" appears at the top of the current page’s tag list
    And "Tag A" appears directly below "Tag B" in the current page’s tag list
    */
    it('should allow adding multiple tags consecutively without a page refresh', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
      axiosMock.onPost(createTagUrl).reply(config => {
        const requestData = JSON.parse(config.data);
        return [201, {
          ...tagDefaults,
          value: requestData.tag,
          child_count: 0,
          descendant_count: 0,
          _id: Math.floor(Math.random() * 10000),
        }];
      });
      render(<RootWrapper />);
      const tag = await screen.findByText('root tag 1');
      expect(tag).toBeInTheDocument();
      const addButton = await screen.findByLabelText('Create Tag');
      addButton.click();
      let creatingRow = await screen.findByTestId('creating-top-tag-row');
      let input = creatingRow.querySelector('input');
      expect(input).toBeInTheDocument();

      fireEvent.change(input, { target: { value: 'Tag A' } });
      let saveButton = within(creatingRow).getByText('Save');
      fireEvent.click(saveButton);
      const tagA = await screen.findByText('Tag A');
      expect(tagA).toBeInTheDocument();

      addButton.click();
      creatingRow = await screen.findByTestId('creating-top-tag-row');
      input = creatingRow.querySelector('input');
      expect(input).toBeInTheDocument();

      fireEvent.change(input, { target: { value: 'Tag B' } });
      saveButton = within(creatingRow).getByText('Save');
      fireEvent.click(saveButton);
      const tagB = await screen.findByText('Tag B');
      expect(tagB).toBeInTheDocument();

      // expect Tag B to be above Tag A in the list
      const rows = screen.getAllByRole('row');
      const tagBRowIndex = rows.findIndex(row => within(row).queryByText('Tag B'));
      const tagARowIndex = rows.findIndex(row => within(row).queryByText('Tag A'));
      expect(tagBRowIndex).toBeLessThan(tagARowIndex);

      // no additional get requests should have been made, that is, the table should not have been refreshed
      expect(axiosMock.history.get.length).toBe(1);
    });

    /* Acceptance Criteria:
    Save is not allowed when the input is empty
    Given the user is on the taxonomy detail page
    And that an inline row is displayed at the top of the tag list to add a new tag
    When the tag name field is empty
    Then the “Save” button is disabled
    */
    it('should disable the Save button when the input is empty', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
      render(<RootWrapper />);
      const tag = await screen.findByText('root tag 1');
      expect(tag).toBeInTheDocument();
      const addButton = await screen.findByText('Add Tag');
      addButton.click();
      const draftRow = await screen.findAllByRole('row');
      const input = draftRow[1].querySelector('input');
      expect(input).toBeInTheDocument();
      const saveButton = within(draftRow[1]).getByText('Save');
      expect(saveButton).toBeDisabled();
      fireEvent.change(input, { target: { value: 'a new tag' } });
      expect(saveButton).not.toBeDisabled();
    });

    /* Acceptance Criteria:
    Save is not allowed with input is only whitespace
    Given the user is on the taxonomy detail page
    And that an inline row is displayed at the top of the tag list to add a new tag
    When the tag name field only contains whitespace
    Then the “Save” button is disabled
    */
    it('should disable the Save button when the input only contains whitespace', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
      render(<RootWrapper />);
      const tag = await screen.findByText('root tag 1');
      expect(tag).toBeInTheDocument();
      const addButton = await screen.findByText('Add Tag');
      addButton.click();
      const draftRow = await screen.findAllByRole('row');
      const input = draftRow[1].querySelector('input');
      expect(input).toBeInTheDocument();
      const saveButton = within(draftRow[1]).getByText('Save');
      expect(saveButton).toBeDisabled();
      fireEvent.change(input, { target: { value: '   ' } });
      expect(saveButton).toBeDisabled();
      fireEvent.change(input, { target: { value: ' a ' } });
      expect(saveButton).not.toBeDisabled();
    });

    /* Acceptance Criteria:
    Leading and trailing whitespace is removed from the tag name on save
    Given that the user is viewing the Taxonomy Detail page for a taxonomy
    When the user adds a new tag with the name " Tag A " and saves
    Then the tag is created successfully
    And the displayed tag name is "Tag A"
    And the saved tag name does not include leading or trailing whitespace
    */

    it('should trim leading and trailing whitespace from the tag name before save', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
      axiosMock.onPost(createTagUrl).reply(201, {
        ...tagDefaults,
        value: 'Tag A',
        child_count: 0,
        descendant_count: 0,
        _id: 4567,
      });

      render(<RootWrapper />);
      await screen.findByText('root tag 1');

      fireEvent.click(await screen.findByLabelText('Create Tag'));
      const draftRow = await screen.findAllByRole('row');
      const input = draftRow[1].querySelector('input');
      const saveButton = within(draftRow[1]).getByText('Save');

      fireEvent.change(input, { target: { value: ' Tag A ' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(axiosMock.history.post.length).toBe(1);
        expect(axiosMock.history.post[0].data).toEqual(JSON.stringify({ tag: 'Tag A' }));
      });
    });

    /* Acceptance Criteria:
    Save is not allowed with invalid characters
    Given the user is on the taxonomy detail page
    And that an inline row is displayed at the top of the tag list to add a new tag
    When the tag name field contains invalid characters
    Then the “Save” button is disabled
    And the user is shown an inline error message indicating that an invalid character has been used
    */

    it('should disable save and show an inline validation error for invalid characters', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);

      render(<RootWrapper />);
      await screen.findByText('root tag 1');

      fireEvent.click(await screen.findByLabelText('Create Tag'));
      const draftRow = await screen.findAllByRole('row');
      const input = draftRow[1].querySelector('input');
      const saveButton = within(draftRow[1]).getByText('Save');

      fireEvent.change(input, { target: { value: 'invalid@tag' } });

      expect(saveButton).toBeDisabled();
      expect(screen.getByText(/invalid character/i)).toBeInTheDocument();
    });

    /* Acceptance Criteria:
    Save is not allowed with a duplicate root-level tag name
    Given the user is on the taxonomy detail page
    And that an inline row is displayed at the top of the tag list to add a new tag
    When a user types in a name that matches an existing tag
    And click the “Save” button
    Then the user is shown an inline error message indicating that the tag name already exists
    */

    it('should show an inline duplicate-name error when the entered root tag already exists', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
      axiosMock.onPost(createTagUrl).reply(400, {
        error: 'Tag with this name already exists',
      });

      render(<RootWrapper />);
      await screen.findByText('root tag 1');

      fireEvent.click(await screen.findByLabelText('Create Tag'));
      const draftRow = await screen.findAllByRole('row');
      const input = draftRow[1].querySelector('input');
      const saveButton = within(draftRow[1]).getByText('Save');

      fireEvent.change(input, { target: { value: 'root tag 1' } });
      fireEvent.click(saveButton);

      expect(await screen.findByText(/already exists/i)).toBeInTheDocument();
    });

    /* Acceptance Criteria:
    Error message will display if the save request fails
    Given the user is on the taxonomy detail page
    And that an inline row is displayed at the top of the tag list to add a new tag
    When a tag name is entered
    And the “Save” button is selected
    And there is an error message displayed at the top of the page
    Then the root-level tag is not created
    And the inline row remains, so the user can try again or cancel
    And a toast appears to indicate that the tag was not saved
    */

    it('should keep the inline row and show a failure toast when save request fails', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
      axiosMock.onPost(createTagUrl).reply(500, {
        error: 'Internal server error',
      });

      render(<RootWrapper />);
      await screen.findByText('root tag 1');

      fireEvent.click(await screen.findByLabelText('Create Tag'));
      const draftRow = await screen.findAllByRole('row');
      const input = draftRow[1].querySelector('input');
      const saveButton = within(draftRow[1]).getByText('Save');

      fireEvent.change(input, { target: { value: 'will fail' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        const draftRows = rows.filter(row => row.querySelector('input'));
        expect(draftRows.length).toBe(1);
      });
      expect(await screen.findByText(/not saved|failed/i)).toBeInTheDocument();
      // expect the input to retain the value that was entered before
      expect(draftRow[1].querySelector('input').value).toEqual('will fail');
      // expect a toast message to indicate that the save failed
      expect(await screen.findByText(/toast/i)).toBeInTheDocument();
      // expect the new tag to not be in the document outside the input field
      expect(screen.queryByText('will fail')).not.toBeInTheDocument();
    });

    /* Acceptance Criteria:
    Add only one new tag at a time
    Given the user is on the taxonomy detail page
    And that an inline row is displayed at the top of the tag list to add a new tag
    All Add Tag or Add Subtag buttons are disabled until the user either saves or cancels the new tag
    */

    it('should disable all Add Tag and Add Subtag buttons when the draft row is displayed', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
      render(<RootWrapper />);
      await screen.findByText('root tag 1');

      fireEvent.click(await screen.findByLabelText('Create Tag'));
      const addButtons = screen.getAllByText(/Add (Tag|Subtag)/);
      addButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    /* Acceptance Criteria:
    Users can only add root-level tags if they have the correct permissions
    Given the user is on the taxonomy detail page
    And the user is on the taxonomy detail page
    And the user does not have permission to edit the taxonomy
    Then the user will not see the Add Tag button
    */

    it('should hide Add Tag for users without taxonomy edit permissions', async () => {
      initializeMockApp({
        authenticatedUser: {
          userId: 3,
          username: 'abc123',
          administrator: false,
          roles: [],
        },
      });
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);

      render(<RootWrapper />);
      await screen.findByText('root tag 1');

      expect(screen.queryByText('Add Tag')).not.toBeInTheDocument();
    });
  });

  describe('Create a new subtag', () => {
    /* Acceptance Criteria:
    The user can add a sub-tag using a parent action menu (three dots)
    Given the user is viewing the taxonomy detail page
    And a tag is displayed in the tag list
    When the user opens the actions menu for that tag (three dots)
    Then the user sees an option labeled "Add sub-tag"
    */
    it('should show an Add sub-tag option in the parent tag actions', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);

      render(<RootWrapper />);
      await screen.findByText('root tag 1');

      expect(screen.queryAllByText('Add Subtag')).not.toBeInTheDocument();
      // user clicks on row actions for root tag 1
      const row = screen.getByText('root tag 1').closest('tr');
      const actionsButton = within(row).getByRole('button', { name: /actions/i });
      fireEvent.click(actionsButton);
      expect(screen.getByText('Add Subtag')).toBeInTheDocument();
    });

    /* Acceptance Criteria:
    Selecting Add sub-tag creates an inline input row beneath the selected tag
    Given the user is on the taxonomy detail page
    And the user is viewing the taxonomy detail page
    And the user has opened the actions menu for a parent tag
    When the user selects "Add sub-tag" from a parent tag
    Then an inline row is displayed directly beneath the parent tag
    And the row includes a text input with placeholder text "Type tag name"
    And the row includes a "Cancel" button
    And the row includes a "Save" button
    */
    it('should render an inline add-subtag row with input, placeholder, and action buttons', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);

      render(<RootWrapper />);
      await screen.findByText('root tag 1');

      let rows = await screen.findAllByRole('row');
      let draftRows = rows.filter(row => row.querySelector('input'));
      expect(draftRows.length).toBe(0);

      fireEvent.click(screen.getAllByText('Add Subtag')[0]);

      rows = await screen.findAllByRole('row');
      draftRows = rows.filter(row => row.querySelector('input'));
      screen.debug();
      expect(draftRows[0].querySelector('input')).toBeInTheDocument();
      // expect the draft row to be directly beneath the parent tag row
      const parentRowIndex = rows.findIndex(row => within(row).queryByText('root tag 1'));
      const draftRowIndex = rows.findIndex(row => row.querySelector('input'));
      expect(draftRowIndex).toBe(parentRowIndex + 1);
      expect(draftRows[0].querySelector('input')).toBeInTheDocument();
      expect(draftRows[0].querySelector('input').placeholder).toEqual('Type tag name');
      expect(within(draftRows[0]).getByText('Cancel')).toBeInTheDocument();
      expect(within(draftRows[0]).getByText('Save')).toBeInTheDocument();
    });

    /* Acceptance Criteria:
    Cancel removes the inline row and does not create a tag
    Given the user is on the taxonomy detail page
    And an inline "Add sub-tag" row is displayed beneath a parent tag
    When the user selects "Cancel"
    Or when the user hits “escape” on their keyboard
    Then the inline row is removed
    And no new sub-tag is created
    And the tag list remains unchanged
    */
    it('should remove add-subtag row and avoid create request when cancelled', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);

      render(<RootWrapper />);
      await screen.findByText('root tag 1');

      fireEvent.click(screen.getAllByText('Add Subtag')[0]);
      const rows = await screen.findAllByRole('row');
      const draftRow = rows.find(row => row.querySelector('input'));
      const input = draftRow.querySelector('input');
      fireEvent.change(input, { target: { value: 'new subtag' } });
      fireEvent.click(within(draftRow).getByText('Cancel'));

      await waitFor(() => {
        expect(axiosMock.history.post.length).toBe(0);
        const currentRows = screen.getAllByRole('row');
        const currentDraftRows = currentRows.filter(row => row.querySelector('input'));
        expect(currentDraftRows.length).toBe(0);
      });
    });

    it('should remove add-subtag row and avoid create request on escape key', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);

      render(<RootWrapper />);
      await screen.findByText('root tag 1');

      fireEvent.click(screen.getAllByText('Add Subtag')[0]);
      const rows = await screen.findAllByRole('row');
      const draftRow = rows.find(row => row.querySelector('input'));
      const input = draftRow.querySelector('input');

      fireEvent.change(input, { target: { value: 'new subtag' } });
      fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        expect(axiosMock.history.post.length).toBe(0);
        const currentRows = screen.getAllByRole('row');
        const currentDraftRows = currentRows.filter(row => row.querySelector('input'));
        expect(currentDraftRows.length).toBe(0);
      });
    });

    /* Acceptance Criteria:
    Saving a tag with a name creates the sub-tag beneath the parent tag
    Given the user is on the taxonomy detail page
    And an inline "Add sub-tag" row is displayed beneath a parent tag
    When the user enters a valid sub-tag name
    And the user selects "Save"
    Then a new sub-tag is created under the selected parent tag
    And the new sub-tag appears in the tag list beneath the parent tag
    And the new sub-tag is indented
    And the inline input row is no longer displayed
    */
    it('should create and render a new sub-tag under the selected parent', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
      axiosMock.onPost(createTagUrl).reply(201, {
        ...tagDefaults,
        value: 'child-new',
        child_count: 0,
        descendant_count: 0,
        _id: 2222,
        parent_value: 'root tag 1',
      });

      render(<RootWrapper />);
      await screen.findByText('root tag 1');

      fireEvent.click(screen.getAllByText('Add Subtag')[0]);
      const rows = await screen.findAllByRole('row');
      const draftRow = rows.find(row => row.querySelector('input'));
      const input = draftRow.querySelector('input');

      fireEvent.change(input, { target: { value: 'child-new' } });
      fireEvent.click(within(draftRow).getByText('Save'));

      expect(await screen.findByText('child-new')).toBeInTheDocument();
      await waitFor(() => {
        const currentRows = screen.getAllByRole('row');
        const currentDraftRows = currentRows.filter(row => row.querySelector('input'));
        expect(currentDraftRows.length).toBe(0);
      });
    });

    /* Acceptance Criteria:
    Save is not allowed when the input is empty
    Given the user is on the taxonomy detail page
    And an inline "Add sub-tag" row is displayed beneath a parent tag
    When the sub-tag name field is empty
    Then "Save" is disabled
    And the user is shown an inline error message indicating the name is required
    */
    it('should disable Save and show required-name inline error for empty sub-tag input', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);

      render(<RootWrapper />);
      await screen.findByText('root tag 1');

      fireEvent.click(screen.getAllByText('Add Subtag')[0]);
      const rows = await screen.findAllByRole('row');
      const draftRow = rows.find(row => row.querySelector('input'));
      const saveButton = within(draftRow).getByText('Save');

      expect(saveButton).toBeDisabled();
      expect(within(draftRow).getByText(/required|name is required/i)).toBeInTheDocument();
    });

    /* Acceptance Criteria:
    Save is not allowed with input is only whitespace
    Given the user is on the taxonomy detail page
    And an inline "Add sub-tag" row is displayed beneath a parent tag
    When the user enters only whitespace into the sub-tag name field
    Then "Save" is disabled
    */
    it('should keep Save disabled for whitespace-only sub-tag input', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);

      render(<RootWrapper />);
      await screen.findByText('root tag 1');

      fireEvent.click(screen.getAllByText('Add Subtag')[0]);
      const rows = await screen.findAllByRole('row');
      const draftRow = rows.find(row => row.querySelector('input'));
      const input = draftRow.querySelector('input');
      const saveButton = within(draftRow).getByText('Save');

      fireEvent.change(input, { target: { value: '   ' } });
      expect(saveButton).toBeDisabled();
    });

    /* Acceptance Criteria:
    Save is not allowed with invalid characters
    Given the user is on the taxonomy detail page
    And an inline "Add sub-tag" row is displayed beneath a parent tag
    When the tag name field contains invalid characters
    Then the “Save” button is disabled
    And the user is shown an inline error message indicating that an invalid character has been used
    */
    it('should disable Save and show invalid-character error for sub-tag input', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);

      render(<RootWrapper />);
      await screen.findByText('root tag 1');

      fireEvent.click(screen.getAllByText('Add Subtag')[0]);
      const rows = await screen.findAllByRole('row');
      const draftRow = rows.find(row => row.querySelector('input'));
      const input = draftRow.querySelector('input');
      const saveButton = within(draftRow).getByText('Save');

      fireEvent.change(input, { target: { value: 'invalid@name' } });
      expect(saveButton).toBeDisabled();
      expect(within(draftRow).getByText(/invalid character/i)).toBeInTheDocument();
    });

    /* Acceptance Criteria:
    Duplicate sub-tag name is not allowed
    Given that a sub-tag name exists under a parent tag
    When a tag name is entered that matches an existing sub-tag name
    And the “Save” button is clicked
    Then the sub-tag is not created
    And the user is shown an inline error message indicating the tag with that name already exists
    */
    it('should show duplicate-name error and avoid creating duplicate sub-tag', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
      axiosMock.onPost(createTagUrl).reply(400, {
        error: 'Tag with this name already exists',
      });

      render(<RootWrapper />);
      await screen.findByText('root tag 1');

      fireEvent.click(screen.getAllByText('Add Subtag')[0]);
      const rows = await screen.findAllByRole('row');
      const draftRow = rows.find(row => row.querySelector('input'));
      const input = draftRow.querySelector('input');

      fireEvent.change(input, { target: { value: 'the child tag' } });
      fireEvent.click(within(draftRow).getByText('Save'));

      expect(await screen.findByText(/already exists/i)).toBeInTheDocument();
    });

    /* Acceptance Criteria:
    Error message will display if the save request fails
    Given the user is on the taxonomy detail page
    Given an inline "Add sub-tag" row is displayed beneath a parent tag
    When a tag name is entered
    And the “Save” button is selected
    And there is an error message displayed at the top of the page
    Then the sub-tag is not created
    And the inline row remains, so the user can try again or cancel
    And a toast appears to indicate that the tag was not saved
    */
    it('should keep inline row and show failure feedback when sub-tag save fails', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
      axiosMock.onPost(createTagUrl).reply(500, {
        error: 'Internal server error',
      });

      render(<RootWrapper />);
      await screen.findByText('root tag 1');

      fireEvent.click(screen.getAllByText('Add Subtag')[0]);
      const rows = await screen.findAllByRole('row');
      const draftRow = rows.find(row => row.querySelector('input'));
      const input = draftRow.querySelector('input');
      fireEvent.change(input, { target: { value: 'subtag fail' } });
      fireEvent.click(within(draftRow).getByText('Save'));

      await waitFor(() => {
        const currentRows = screen.getAllByRole('row');
        const currentDraftRows = currentRows.filter(row => row.querySelector('input'));
        expect(currentDraftRows.length).toBe(1);
      });
      expect(await screen.findByText(/not saved|failed/i)).toBeInTheDocument();
    });

    /* Acceptance Criteria:
    Add only one new tag at a time
    Given an inline "Add sub-tag" row is displayed beneath a parent tag
    When the user opens the actions menu for that parent tag or any other parent tag (three dots)
    And the user selects “Add sub-tag”
    Then the existing "Add sub-tag" row is removed
    And a new "Add sub-tag" row is added below the parent
    */
    it('should move the inline add-subtag row to the latest selected parent', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);

      render(<RootWrapper />);
      await screen.findByText('root tag 1');

      const addSubtagActions = screen.getAllByText('Add Subtag');
      fireEvent.click(addSubtagActions[0]);
      fireEvent.click(addSubtagActions[1]);

      const rows = screen.getAllByRole('row');
      const draftRows = rows.filter(row => row.querySelector('input'));
      expect(draftRows.length).toBe(1);
    });

    /* Acceptance Criteria:
    New tag appears without refreshing the page
    Given an inline "Add sub-tag" row is displayed beneath a parent tag
    When a tag name is successfully added
    Then the new sub-tag appears in the list without a page refresh
    And the table does not get refreshed (no additional get request is made)
    */
    it('should show a newly created sub-tag without triggering a page refresh', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
      axiosMock.onPost(createTagUrl).reply(201, {
        ...tagDefaults,
        value: 'child appears immediately',
        child_count: 0,
        descendant_count: 0,
        _id: 3333,
        parent_value: 'root tag 1',
      });

      render(<RootWrapper />);
      await screen.findByText('root tag 1');

      fireEvent.click(screen.getAllByText('Add Subtag')[0]);
      const rows = await screen.findAllByRole('row');
      const draftRow = rows.find(row => row.querySelector('input'));
      const input = draftRow.querySelector('input');
      fireEvent.change(input, { target: { value: 'child appears immediately' } });
      fireEvent.click(within(draftRow).getByText('Save'));

      expect(await screen.findByText('child appears immediately')).toBeInTheDocument();
      expect(axiosMock.history.get.length).toBe(1);
    });

    /* Acceptance Criteria:
    Users can only add subtags if they have the correct permissions
    Given the user is on the taxonomy detail page
    And the user does not have permission to edit the taxonomy
    When the user opens the actions menu for a tag
    Then the user does not see "Add sub-tag"
    Or "Add sub-tag" is disabled
    */
    it('should hide or disable Add sub-tag actions when user lacks edit permissions', async () => {
      initializeMockApp({
        authenticatedUser: {
          userId: 3,
          username: 'abc123',
          administrator: false,
          roles: [],
        },
      });
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);

      render(<RootWrapper />);
      await screen.findByText('root tag 1');

      const addSubtagActions = screen.queryAllByText('Add Subtag');
      if (addSubtagActions.length === 0) {
        expect(addSubtagActions.length).toBe(0);
      } else {
        addSubtagActions.forEach(action => {
          expect(action).toBeDisabled();
        });
      }
    });
  });

  describe('Create a nested sub-tag', () => {
    /* Acceptance Criteria:
      User can add a sub-tag as child of a sub-tag (nested sub-tags)
      Given the user is on the taxonomy detail page
      And the user has opened the actions menu for a sub-tag
      When the user selects "Add sub-tag" from the sub-tag's actions menu
      Then an inline row is displayed directly beneath the sub-tag
      And the user can enter a name and save to create a new nested sub-tag
      */

    it('should allow adding a nested sub-tag under a sub-tag', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
      axiosMock.onPost(createTagUrl).reply(201, {
        ...tagDefaults,
        value: 'nested child',
        child_count: 0,
        descendant_count: 0,
        _id: 4444,
        parent_value: 'the child tag',
      });

      render(<RootWrapper />);
      // click "Expand row" button to show "the child tag" sub-tag
      await screen.findByText('root tag 1');
      const expandButton = screen.queryAllByText('Expand row')?.[0].closest('a');
      fireEvent.click(expandButton);
      await screen.findByText('the child tag');

      // open actions menu for "the child tag" sub-tag
      const row = screen.getByText('the child tag').closest('tr');
      const actionsButton = within(row).getByRole('button', { name: /actions/i });
      fireEvent.click(actionsButton);
      fireEvent.click(screen.getByText('Add Subtag'));

      const rows = await screen.findAllByRole('row');
      const draftRow = rows.find(row => row.querySelector('input'));
      const input = draftRow.querySelector('input');
      fireEvent.change(input, { target: { value: 'nested child' } });
      fireEvent.click(within(draftRow).getByText('Save'));

      expect(await screen.findByText('nested child')).toBeInTheDocument();
    });

    /* Acceptance Criteria:
      Nested sub-tags save and display correctly without refreshing the page
      Given an inline "Add sub-tag" row is displayed beneath a sub-tag
      When a tag name is successfully added
      Then the new nested sub-tag appears in the list without a page refresh
      And the table does not get refreshed (no additional get request is made)
      */

    it('should show a newly created nested sub-tag without triggering a page refresh', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
      axiosMock.onPost(createTagUrl).reply(201, {
        ...tagDefaults,
        value: 'nested child appears immediately',
        child_count: 0,
        descendant_count: 0,
        _id: 5555,
        parent_value: 'the child tag',
      });

      render(<RootWrapper />);
      // Expand row
      await screen.findByText('root tag 1');
      const expandButton = screen.queryAllByText('Expand row')?.[0].closest('a');
      fireEvent.click(expandButton);
      await screen.findByText('the child tag');

      // open actions menu for "the child tag" sub-tag
      const row = screen.getByText('the child tag').closest('tr');
      const actionsButton = within(row).getByRole('button', { name: /actions/i });
      fireEvent.click(actionsButton);
      fireEvent.click(screen.getByText('Add Subtag'));

      const rows = await screen.findAllByRole('row');
      const draftRow = rows.find(row => row.querySelector('input'));
      const input = draftRow.querySelector('input');
      fireEvent.change(input, { target: { value: 'nested child appears immediately' } });
      fireEvent.click(within(draftRow).getByText('Save'));

      expect(await screen.findByText('nested child appears immediately')).toBeInTheDocument();
      expect(axiosMock.history.get.length).toBe(1);
    });

    /* Acceptance Criteria:
      Nested sub-tags are only creatable for the taxonomy's max-depth level
      Given the taxonomy has a max depth of 2
      When the user opens the actions menu for a sub-tag at depth 1
      Then the user sees an option labeled "Add sub-tag"
      And when the user opens the actions menu for a sub-tag at depth 2
      Then the user does not see an option labeled "Add sub-tag"
     */

    it('should only allow adding sub-tags up to the taxonomy max depth', async () => {
      const maxDepth = 2;
      axiosMock.onGet(rootTagsListUrl).reply(200, {
        ...mockTagsResponse,
        max_depth: maxDepth,
      });
      render(<RootWrapper maxDepth={maxDepth} />);
      await screen.findByText('the child tag');

      // open actions menu for depth 0 root tag
      let row = screen.getByText('root tag 1').closest('tr');
      let actionsButton = within(row).getByRole('button', { name: /actions/i });
      fireEvent.click(actionsButton);
      expect(screen.getByText('Add Subtag')).toBeInTheDocument();

      // open actions menu for depth 1 sub-tag
      row = screen.getByText('the child tag').closest('tr');
      actionsButton = within(row).getByRole('button', { name: /actions/i });
      fireEvent.click(actionsButton);
      expect(screen.getByText('Add Subtag')).toBeInTheDocument();

      // simulate a sub-tag at depth 2 by adding a tag with parent_value of the depth 1 sub-tag
      axiosMock.onPost(createTagUrl).reply(201, {
        ...tagDefaults,
        value: 'depth 2 subtag',
        child_count: 0,
        descendant_count: 0,
        _id: 6666,
        parent_value: 'the child tag',
      });
      fireEvent.click(screen.getAllByText('Add Subtag')[1]);
      let rows = await screen.findAllByRole('row');
      let draftRow = rows.find(row => row.querySelector('input'));
      let input = draftRow.querySelector('input');
      fireEvent.change(input, { target: { value: 'depth 2 subtag' } });
      fireEvent.click(within(draftRow).getByText('Save'));
      await screen.findByText('depth 2 subtag');

      // open actions menu for depth 2 sub-tag
      row = screen.getByText('depth 2 subtag').closest('tr');
      actionsButton = within(row).getByRole('button', { name: /actions/i });
      fireEvent.click(actionsButton);
      expect(screen.queryByText('Add Subtag')).not.toBeInTheDocument();
    });
  });
});
