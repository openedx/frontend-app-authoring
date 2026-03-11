import React from 'react';
import PropTypes from 'prop-types';
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
const adminUser = {
  userId: 3,
  username: 'abc123',
  administrator: true,
  roles: [],
};
const nonAdminUser = {
  ...adminUser,
  administrator: false,
};

const RootWrapper = ({ maxDepth = 3 }) => (
  <AppProvider store={store}>
    <IntlProvider locale="en" messages={{}}>
      <QueryClientProvider client={queryClient}>
        <TagListTable taxonomyId={1} maxDepth={maxDepth} />
      </QueryClientProvider>
    </IntlProvider>
  </AppProvider>
);

RootWrapper.propTypes = {
  maxDepth: PropTypes.number,
};

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
const rootTagsListUrl = 'http://localhost:18010/api/content_tagging/v1/taxonomies/1/tags/?full_depth_threshold=1000';
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

const renderTagListTable = (maxDepth = 3) => render(<RootWrapper maxDepth={maxDepth} />);

const waitForRootTag = async () => {
  const tag = await screen.findByText('root tag 1');
  expect(tag).toBeInTheDocument();
  return tag;
};

const getDraftRows = () => screen.getAllByRole('row').filter(row => row.querySelector('input'));

const expectNoDraftRows = () => {
  expect(getDraftRows().length).toBe(0);
};

const openTopLevelDraftRow = async () => {
  const addButton = await screen.findByLabelText('Create Tag');
  addButton.click();
  const creatingRow = await screen.findByTestId('creating-top-row');
  const input = creatingRow.querySelector('input');
  expect(input).toBeInTheDocument();
  return { creatingRow, input };
};

const openActionsMenuForTag = (tagName, actionButtonName = /actions/i) => {
  const row = screen.getByText(tagName).closest('tr');
  const actionsButton = within(row).getByRole('button', { name: actionButtonName });
  fireEvent.click(actionsButton);
  return row;
};

const openSubtagDraftRow = async ({
  tagName,
  actionButtonName = /actions/i,
  addSubtagIndex = 0,
}) => {
  openActionsMenuForTag(tagName, actionButtonName);
  fireEvent.click(screen.getAllByText('Add Subtag')[addSubtagIndex]);
  const rows = await screen.findAllByRole('row');
  const draftRow = rows.find(row => row.querySelector('input'));
  const input = draftRow.querySelector('input');
  expect(input).toBeInTheDocument();
  return { rows, draftRow, input };
};

describe('<TagListTable />', () => {
  beforeAll(async () => {
    initializeMockApp({
      authenticatedUser: adminUser,
    });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });
  beforeEach(async () => {
    store = initializeStore();
    axiosMock.reset();
  });

  it('has a valid tr -> td structure when the table is expanded to show subtags', async () => {
    axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
    axiosMock.onGet(subTagsUrl).reply(200, subTagsResponse);
    renderTagListTable();
    const expandButton = screen.getAllByText('Expand All')[0];
    expandButton.click();
    const childTag = await screen.findByText('the child tag');
    expect(childTag).toBeInTheDocument();
    const allCells = screen.getAllByRole('cell');
    allCells.forEach(cell => {
      const nestedTr = cell.querySelector('tr');
      expect(nestedTr).toBeNull();
    });
  });

  it('should render page correctly', async () => {
    axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
    renderTagListTable();
    await waitForRootTag();

    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(3 + 1); // 3 items plus header
    expect(within(rows[0]).getAllByRole('columnheader')[0].textContent).toEqual('Tag name');
    expect(within(rows[1]).getAllByRole('cell')[0].textContent).toEqual('root tag 1');
  });

  it('should render page correctly with subtags', async () => {
    axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
    axiosMock.onGet(subTagsUrl).reply(200, subTagsResponse);
    renderTagListTable();
    const expandButton = await screen.findByLabelText('Show Subtags');
    expandButton.click();
    const childTag = await screen.findByText('the child tag');
    expect(childTag).toBeInTheDocument();
  });

  it('should not render pagination footer', async () => {
    axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
    renderTagListTable();
    await waitFor(() => {
      expect(screen.queryByRole('navigation', {
        name: /table pagination/i,
      })).not.toBeInTheDocument();
    });
  });

  it('should render pagination footer', async () => {
    axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsPaginationResponse);
    renderTagListTable();
    const tableFooter = await screen.findAllByRole('navigation', {
      name: /table pagination/i,
    });
    expect(tableFooter[0]).toBeInTheDocument();
  });

  it('should render correct number of items in pagination footer', async () => {
    axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsPaginationResponse);
    renderTagListTable();
    const paginationButtons = await screen.findByText('Page 1 of 2');
    expect(paginationButtons).toBeInTheDocument();
  });

  describe('Create a new top-level tag', () => {
    describe('with editable user and loaded taxonomy', () => {
      beforeEach(async () => {
        axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
        renderTagListTable();
        await waitForRootTag();
      });

      it('should add draft row when top-level"Add tag" button is clicked', async () => {
        const { creatingRow } = await openTopLevelDraftRow();

        expect(within(creatingRow).getByText('Cancel')).toBeInTheDocument();
        expect(within(creatingRow).getByText('Save')).toBeInTheDocument();
      });

      it('should create a new tag when the draft row is saved', async () => {
        axiosMock.onPost(createTagUrl).reply(201, {
          ...tagDefaults,
          value: 'a new tag',
          child_count: 0,
          descendant_count: 0,
          _id: 1234,
        });
        const { creatingRow, input } = await openTopLevelDraftRow();

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

      it('should not create a new tag when the draft row is cancelled', async () => {
        const { creatingRow, input } = await openTopLevelDraftRow();

        fireEvent.change(input, { target: { value: 'a new tag' } });
        const cancelButton = within(creatingRow).getByText('Cancel');
        fireEvent.click(cancelButton);
        await waitFor(() => {
          expect(axiosMock.history.post.length).toBe(0);
          expect(screen.queryByText('a new tag')).not.toBeInTheDocument();
          expectNoDraftRows();
        });
      });

      it('should not create a new tag when the escape button is pressed', async () => {
        const { input } = await openTopLevelDraftRow();

        fireEvent.change(input, { target: { value: 'a new tag' } });
        fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });
        await waitFor(() => {
          expect(axiosMock.history.post.length).toBe(0);
          expect(screen.queryByText('a new tag')).not.toBeInTheDocument();
          expectNoDraftRows();
        });
      });
      it('should show a loading spinner when saving a new tag', async () => {
        axiosMock.onPost(createTagUrl).reply(() => new Promise(resolve => {
          setTimeout(() => {
            resolve([201, {
              ...tagDefaults,
              value: 'a new tag',
              child_count: 0,
              descendant_count: 0,
              _id: 1234,
            }]);
          }, 100);
        }));
        const { creatingRow, input } = await openTopLevelDraftRow();

        fireEvent.change(input, { target: { value: 'a new tag' } });
        const saveButton = within(creatingRow).getByText('Save');
        fireEvent.click(saveButton);
        const spinner = await screen.findByRole('status');
        expect(spinner.textContent).toEqual('Saving...');
      });

      it('should show a newly created top-level tag without triggering a page refresh', async () => {
        axiosMock.onPost(createTagUrl).reply(201, {
          ...tagDefaults,
          value: 'a new tag',
          child_count: 0,
          descendant_count: 0,
          _id: 1234,
        });
        const { creatingRow, input } = await openTopLevelDraftRow();

        fireEvent.change(input, { target: { value: 'a new tag' } });
        const saveButton = within(creatingRow).getByText('Save');
        fireEvent.click(saveButton);
        let newTag;
        await waitFor(() => {
          newTag = screen.getByText('a new tag');
          expect(newTag).toBeInTheDocument();
        });
        // expect the new tag to be the first row after the header, that is, the top of the list
        const rows = screen.getAllByRole('row');
        expect(rows[1]).toContainElement(newTag);
        expectNoDraftRows();

        // expect only one get request to have been made, that is, the table should not have been refreshed
        expect(axiosMock.history.get.length).toBe(1);
      });

      it('should show a toast message when a new tag is successfully saved', async () => {
        axiosMock.onPost(createTagUrl).reply(201, {
          ...tagDefaults,
          value: 'a new tag',
          child_count: 0,
          descendant_count: 0,
          _id: 1234,
        });
        const { creatingRow, input } = await openTopLevelDraftRow();

        fireEvent.change(input, { target: { value: 'a new tag' } });
        const saveButton = within(creatingRow).getByText('Save');
        fireEvent.click(saveButton);
        const toast = await screen.findByText('Tag "a new tag" created successfully');
        expect(toast).toBeInTheDocument();
      });

      it('should add a temporary row to the top of the table', async () => {
        axiosMock.onPost(createTagUrl).reply(201, {
          ...tagDefaults,
          value: 'xyz tag',
          child_count: 0,
          descendant_count: 0,
          _id: 1234,
        });
        const { creatingRow, input } = await openTopLevelDraftRow();

        fireEvent.change(input, { target: { value: 'xyz tag' } });
        const saveButton = within(creatingRow).getByText('Save');
        fireEvent.click(saveButton);
        // no input row should be in the document
        await waitFor(() => {
          expectNoDraftRows();
        });
        const temporaryRow = await screen.findByText('xyz tag');
        expect(temporaryRow).toBeInTheDocument();
      });

      // temporarily skipped because pagination is not implemented yet
      it.skip('should refresh the table and remove the temporary row when a pagination button is clicked', async () => {
        axiosMock.onPost(createTagUrl).reply(201, {
          ...tagDefaults,
          value: 'xyz tag',
          child_count: 0,
          descendant_count: 0,
          _id: 1234,
        });
        const { creatingRow, input } = await openTopLevelDraftRow();

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

      // a bit flaky when ran together with other tests - any way to improve this?
      it('should allow adding multiple tags consecutively without a page refresh', async () => {
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
        let addButton = await screen.findByLabelText('Create Tag');
        addButton.click();
        let creatingRow = await screen.findByTestId('creating-top-row');
        let input = creatingRow.querySelector('input');
        expect(input).toBeInTheDocument();

        fireEvent.change(input, { target: { value: 'Tag A' } });
        let saveButton = within(creatingRow).getByText('Save');
        fireEvent.click(saveButton);
        const tagA = await screen.findByText('Tag A');
        expect(tagA).toBeInTheDocument();

        addButton = await screen.findByLabelText('Create Tag');
        addButton.click();
        creatingRow = await screen.findByTestId('creating-top-row');
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
      it.skip('should disable the Save button when the input is empty', async () => {
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
      it.skip('should disable the Save button when the input only contains whitespace', async () => {
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
        axiosMock.onPost(createTagUrl).reply(201, {
          ...tagDefaults,
          value: 'Tag A',
          child_count: 0,
          descendant_count: 0,
          _id: 4567,
        });

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

      it.skip('should disable save and show an inline validation error for invalid characters', async () => {
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
        axiosMock.onPost(createTagUrl).reply(400, {
          error: 'Tag with this name already exists',
        });

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

      it.skip('should keep the inline row and show a failure toast when save request fails', async () => {
        axiosMock.onPost(createTagUrl).reply(500, {
          error: 'Internal server error',
        });

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

      it.skip('should disable all Add Tag and Add Subtag buttons when the draft row is displayed', async () => {
        fireEvent.click(await screen.findByLabelText('Create Tag'));
        const addButtons = screen.getAllByText(/Add (Tag|Subtag)/);
        addButtons.forEach(button => {
          expect(button).toBeDisabled();
        });
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
      initializeMockApp({ authenticatedUser: nonAdminUser });
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);

      renderTagListTable();
      await waitForRootTag();

      expect(screen.queryByText('Add Tag')).not.toBeInTheDocument();
    });
  });

  describe('Create a new subtag', () => {
    describe('with editable user and loaded taxonomy', () => {
      beforeEach(async () => {
        axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
        renderTagListTable();
        await waitForRootTag();
      });

      /* Acceptance Criteria:
    The user can add a sub-tag using a parent action menu (three dots)
    Given the user is viewing the taxonomy detail page
    And a tag is displayed in the tag list
    When the user opens the actions menu for that tag (three dots)
    Then the user sees an option labeled "Add sub-tag"
    */
      it('should show an Add sub-tag option in the parent tag actions', async () => {
        expect(screen.queryAllByText('Add Subtag').length).toBe(0);
        // user clicks on row actions for root tag 1
        openActionsMenuForTag('root tag 1');
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
        const { rows } = await openSubtagDraftRow({ tagName: 'root tag 1' });
        const draftRows = rows.filter(tableRow => tableRow.querySelector('input'));
        expect(draftRows[0].querySelector('input')).toBeInTheDocument();
        // expect the draft row to be directly beneath the parent tag row
        const parentRowIndex = rows.findIndex(tableRow => within(tableRow).queryByText('root tag 1'));
        const draftRowIndex = rows.findIndex(tableRow => tableRow.querySelector('input'));
        expect(draftRowIndex).toBe(parentRowIndex + 1);
        expect(draftRows[0].querySelector('input')).toBeInTheDocument();
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
        const { draftRow, input } = await openSubtagDraftRow({ tagName: 'root tag 1' });
        fireEvent.change(input, { target: { value: 'new subtag' } });
        fireEvent.click(within(draftRow).getByText('Cancel'));

        await waitFor(() => {
          expect(axiosMock.history.post.length).toBe(0);
          expectNoDraftRows();
        });
      });

      it('should remove add-subtag row and avoid create request on escape key', async () => {
        const { input } = await openSubtagDraftRow({ tagName: 'root tag 1' });

        fireEvent.change(input, { target: { value: 'new subtag' } });
        fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

        await waitFor(() => {
          expect(axiosMock.history.post.length).toBe(0);
          expectNoDraftRows();
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
      it.skip('should disable Save and show required-name inline error for empty sub-tag input', async () => {
        fireEvent.click(screen.getAllByText('Add Subtag')[0]);
        const rows = await screen.findAllByRole('row');
        const draftRow = rows.find(tableRow => tableRow.querySelector('input'));
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
      it.skip('should keep Save disabled for whitespace-only sub-tag input', async () => {
        fireEvent.click(screen.getAllByText('Add Subtag')[0]);
        const rows = await screen.findAllByRole('row');
        const draftRow = rows.find(tableRow => tableRow.querySelector('input'));
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
      it.skip('should disable Save and show invalid-character error for sub-tag input', async () => {
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
      it.skip('should show duplicate-name error and avoid creating duplicate sub-tag', async () => {
        axiosMock.onPost(createTagUrl).reply(400, {
          error: 'Tag with this name already exists',
        });

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
      it.skip('should keep inline row and show failure feedback when sub-tag save fails', async () => {
        axiosMock.onPost(createTagUrl).reply(500, {
          error: 'Internal server error',
        });

        fireEvent.click(screen.getAllByText('Add Subtag')[0]);
        const rows = await screen.findAllByRole('row');
        const draftRow = rows.find(row => row.querySelector('input'));
        const input = draftRow.querySelector('input');
        fireEvent.change(input, { target: { value: 'subtag fail' } });
        fireEvent.click(within(draftRow).getByText('Save'));

        await waitFor(() => {
          expect(getDraftRows().length).toBe(1);
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
      it.skip('should move the inline add-subtag row to the latest selected parent', async () => {
        const addSubtagActions = screen.getAllByText('Add Subtag');
        fireEvent.click(addSubtagActions[0]);
        fireEvent.click(addSubtagActions[1]);

        const rows = screen.getAllByRole('row');
        const draftRows = rows.filter(row => row.querySelector('input'));
        expect(draftRows.length).toBe(1);
      });
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
      initializeMockApp({ authenticatedUser: nonAdminUser });
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);

      renderTagListTable();
      await waitForRootTag();

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

    /* Acceptance Criteria:
      Nested sub-tags save and display correctly without refreshing the page
      Given an inline "Add sub-tag" row is displayed beneath a sub-tag
      When a tag name is successfully added
      Then the new nested sub-tag appears in the list without a page refresh
      And the table does not get refreshed (no additional get request is made)
      */

    /* Acceptance Criteria:
      Nested sub-tags are only creatable for the taxonomy's max-depth level
      Given the taxonomy has a max depth of 2
      When the user opens the actions menu for a sub-tag at depth 1
      Then the user sees an option labeled "Add sub-tag"
      And when the user opens the actions menu for a sub-tag at depth 2
      Then the user does not see an option labeled "Add sub-tag"
     */

    it.skip('should only allow adding sub-tags up to the taxonomy max depth', async () => {
      const maxDepth = 2;
      axiosMock.onGet(rootTagsListUrl).reply(200, {
        ...mockTagsResponse,
        max_depth: maxDepth,
      });
      renderTagListTable(maxDepth);
      await screen.findByText('the child tag');

      // open actions menu for depth 0 root tag
      let row = openActionsMenuForTag('root tag 1');
      expect(screen.getByText('Add Subtag')).toBeInTheDocument();

      // open actions menu for depth 1 sub-tag
      row = openActionsMenuForTag('the child tag');
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
      const rows = await screen.findAllByRole('row');
      const draftRow = rows.find(tableRow => tableRow.querySelector('input'));
      const input = draftRow.querySelector('input');
      fireEvent.change(input, { target: { value: 'depth 2 subtag' } });
      fireEvent.click(within(draftRow).getByText('Save'));
      await screen.findByText('depth 2 subtag');

      // open actions menu for depth 2 sub-tag
      row = screen.getByText('depth 2 subtag').closest('tr');
      const actionsButton = within(row).getByRole('button', { name: /actions/i });
      fireEvent.click(actionsButton);
      expect(screen.queryByText('Add Subtag')).not.toBeInTheDocument();
    });
  });
});

// These async creation flows are intentionally isolated because they pass individually
// but can be flaky when interleaved with the larger suite's async/query timing.
describe('<TagListTable /> isolated async subtag tests', () => {
  beforeAll(async () => {
    initializeMockApp({
      authenticatedUser: adminUser,
    });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: adminUser,
    });
    store = initializeStore();
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    queryClient.clear();
  });

  it('shows the spinner before the query is complete', async () => {
    // Simulate an actual slow response from the API:
    let resolveResponse;
    const promise = new Promise(resolve => { resolveResponse = resolve; });
    axiosMock.onGet(rootTagsListUrl).reply(() => promise);
    renderTagListTable();
    const spinner = await screen.findByRole('status');
    expect(spinner.textContent).toEqual('Loading...');
    resolveResponse([200, { results: [] }]);
    await waitForElementToBeRemoved(() => screen.queryByRole('status'));
    const noFoundComponent = await screen.findByText('No results found');
    expect(noFoundComponent).toBeInTheDocument();
  });

  describe('with loaded root tags', () => {
    beforeEach(async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
      renderTagListTable();
      await waitForRootTag();
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
      axiosMock.onPost(createTagUrl).reply(201, {
        ...tagDefaults,
        value: 'child-new',
        child_count: 0,
        descendant_count: 0,
        _id: 2222,
        parent_value: 'root tag 1',
      });

      const { draftRow, input } = await openSubtagDraftRow({ tagName: 'root tag 1' });

      fireEvent.change(input, { target: { value: 'child-new' } });
      fireEvent.click(within(draftRow).getByText('Save'));

      await waitFor(() => {
        expect(screen.getByText('child-new')).toBeInTheDocument();
        expectNoDraftRows();
      });
    });

    /* Acceptance Criteria:
    New tag appears without refreshing the page
    Given an inline "Add sub-tag" row is displayed beneath a parent tag
    When a tag name is successfully added
    Then the new sub-tag appears in the list without a page refresh
    And the table does not get refreshed (no additional get request is made)
    */
    it('should show a newly created sub-tag without triggering a page refresh', async () => {
      axiosMock.onPost(createTagUrl).reply(201, {
        ...tagDefaults,
        value: 'child appears immediately',
        child_count: 0,
        descendant_count: 0,
        _id: 3333,
        parent_value: 'root tag 1',
      });

      const { draftRow, input } = await openSubtagDraftRow({ tagName: 'root tag 1' });
      fireEvent.change(input, { target: { value: 'child appears immediately' } });
      expect(screen.queryByText('child appears immediately')).toBeNull();
      fireEvent.click(within(draftRow).getByText('Save'));

      await waitFor(() => {
        expect(screen.queryByText('child appears immediately')).toBeInTheDocument();
      });
      expect(axiosMock.history.get.length).toBe(1);
    });

    /* Acceptance Criteria:
      User can add a sub-tag as child of a sub-tag (nested sub-tags)
      Given the user is on the taxonomy detail page
      And the user has opened the actions menu for a sub-tag
      When the user selects "Add sub-tag" from the sub-tag's actions menu
      Then an inline row is displayed directly beneath the sub-tag
      And the user can enter a name and save to create a new nested sub-tag
      */
    it('should allow adding a nested sub-tag under a sub-tag', async () => {
      axiosMock.onPost(createTagUrl).reply(201, {
        ...tagDefaults,
        value: 'nested child',
        child_count: 0,
        descendant_count: 0,
        _id: 4444,
        parent_value: 'the child tag',
      });

      const expandButton = screen.getAllByLabelText('Show Subtags')[0];
      fireEvent.click(expandButton);

      await screen.findByText('the child tag');
      const { input } = await openSubtagDraftRow({
        tagName: 'the child tag',
        actionButtonName: /more actions for tag the child tag/i,
      });
      fireEvent.change(input, { target: { value: 'nested child' } });
      fireEvent.click(within(input.closest('tr')).getByText('Save'));

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
      axiosMock.onPost(createTagUrl).reply(201, {
        ...tagDefaults,
        value: 'nested child appears immediately',
        child_count: 0,
        descendant_count: 0,
        _id: 5555,
        parent_value: 'the child tag',
      });

      const expandButton = screen.getAllByLabelText('Show Subtags')[0];
      fireEvent.click(expandButton);
      await screen.findByText('the child tag');

      const { draftRow, input } = await openSubtagDraftRow({ tagName: 'the child tag' });
      fireEvent.change(input, { target: { value: 'nested child appears immediately' } });

      const saveButton = within(draftRow).getByText('Save');

      fireEvent.click(saveButton);

      expect(await screen.findByText('nested child appears immediately')).toBeInTheDocument();
      expect(axiosMock.history.get.length).toBe(1);
    });
  });
});
