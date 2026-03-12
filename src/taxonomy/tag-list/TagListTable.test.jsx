import React from 'react';
import PropTypes from 'prop-types';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import {
  render, waitFor, waitForElementToBeRemoved, screen, within,
  fireEvent, act, cleanup,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MockAdapter from 'axios-mock-adapter';

import initializeStore from '../../store';
import * as apiHooksModule from '../data/apiHooks';
import * as hooksModule from './hooks';
import * as treeTableModule from '../tree-table';
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

const flushReactUpdates = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

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
  await act(async () => {
    fireEvent.click(addButton);
  });
  const creatingRow = await screen.findByTestId('creating-top-row');
  const input = creatingRow.querySelector('input');
  expect(input).toBeInTheDocument();
  return { creatingRow, input };
};

const openActionsMenuForTag = (tagName, actionButtonName = /actions/i) => {
  const row = screen.getByText(tagName).closest('tr');
  const actionsButton = within(row).getByRole('button', { name: actionButtonName });
  act(() => {
    fireEvent.click(actionsButton);
  });
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
    axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
    axiosMock.onGet(subTagsUrl).reply(200, subTagsResponse);
    renderTagListTable();
    await waitForRootTag();
    await flushReactUpdates();
  });

  it('has a valid tr -> td structure when the table is expanded to show subtags', async () => {
    const expandButton = screen.getAllByText('Expand All')[0];
    fireEvent.click(expandButton);
    const childTag = await screen.findByText('the child tag');
    expect(childTag).toBeInTheDocument();
    const allCells = screen.getAllByRole('cell');
    allCells.forEach(cell => {
      const nestedTr = cell.querySelector('tr');
      expect(nestedTr).toBeNull();
    });
  });

  it('should render page correctly', async () => {
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(3 + 1); // 3 items plus header
    expect(within(rows[0]).getAllByRole('columnheader')[0].textContent).toEqual('Tag name');
    expect(within(rows[1]).getAllByRole('cell')[0].textContent).toEqual('root tag 1');
  });

  it('should render page correctly with subtags', async () => {
    const expandButton = await screen.findByLabelText('Show Subtags');
    fireEvent.click(expandButton);
    const childTag = await screen.findByText('the child tag');
    expect(childTag).toBeInTheDocument();
  });

  it('should not render pagination footer if too few results', async () => {
    axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
    renderTagListTable();
    await waitFor(() => {
      expect(screen.queryByRole('navigation', {
        name: /table pagination/i,
      })).not.toBeInTheDocument();
    });
  });

  // temporarily skipped because pagination is not implemented yet
  it.skip('should render pagination footer', async () => {
    axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsPaginationResponse);
    renderTagListTable();
    const tableFooter = await screen.findAllByRole('navigation', {
      name: /table pagination/i,
    });
    expect(tableFooter[0]).toBeInTheDocument();
  });

  // temporarily skipped because pagination is not implemented yet
  it.skip('should render correct number of items in pagination footer', async () => {
    axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsPaginationResponse);
    renderTagListTable();
    const paginationButtons = await screen.findByText('Page 1 of 2');
    expect(paginationButtons).toBeInTheDocument();
  });

  describe('Create a new top-level tag', () => {
    describe('with editable user and loaded taxonomy', () => {
      it('should add draft row when top-level "Add tag" button is clicked', async () => {
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
        fireEvent.click(addButton);
        let creatingRow = await screen.findByTestId('creating-top-row');
        let input = creatingRow.querySelector('input');
        expect(input).toBeInTheDocument();

        fireEvent.change(input, { target: { value: 'Tag A' } });
        let saveButton = within(creatingRow).getByText('Save');
        fireEvent.click(saveButton);
        const tagA = await screen.findByText('Tag A');
        expect(tagA).toBeInTheDocument();

        addButton = await screen.findByLabelText('Create Tag');
        fireEvent.click(addButton);
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

      it('should disable the Save button when the input is empty', async () => {
        const addButton = await screen.findByLabelText('Create Tag');
        fireEvent.click(addButton);
        const draftRow = await screen.findAllByRole('row');
        const input = draftRow[1].querySelector('input');
        expect(input).toBeInTheDocument();
        const saveButton = within(draftRow[1]).getByText('Save');
        expect(saveButton).toBeDisabled();
        fireEvent.change(input, { target: { value: 'a new tag' } });
        expect(saveButton).not.toBeDisabled();
      });

      it('should disable the Save button when the input only contains whitespace', async () => {
        const addButton = await screen.findByLabelText('Create Tag');
        fireEvent.click(addButton);
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

      it('should disable save and show an inline validation error for invalid characters', async () => {
        fireEvent.click(await screen.findByLabelText('Create Tag'));
        const draftRow = await screen.findAllByRole('row');
        const input = draftRow[1].querySelector('input');
        const saveButton = within(draftRow[1]).getByText('Save');

        await act(async () => {
          fireEvent.change(input, { target: { value: 'invalid;tag' } });
        });

        expect(saveButton).toBeDisabled();
        expect(screen.getByText(/invalid character/i)).toBeInTheDocument();
      });

      it('should show an inline duplicate-name error when the entered root tag already exists', async () => {
        axiosMock.onPost(createTagUrl).reply(400, ['Tag with this name already exists']);

        fireEvent.click(await screen.findByLabelText('Create Tag'));
        const draftRow = await screen.findAllByRole('row');
        const input = draftRow[1].querySelector('input');
        const saveButton = within(draftRow[1]).getByText('Save');

        fireEvent.change(input, { target: { value: 'root tag 1' } });
        fireEvent.click(saveButton);

        expect(await screen.findByText('Tag with this name already exists')).toBeInTheDocument();
      });

      it('should keep the inline row and show a failure toast when save request fails', async () => {
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

        // Banner error message should be shown at the top of the table
        expect(await screen.findByText('Error saving changes')).toBeInTheDocument();

        // Toast message to indicate that the save failed
        expect(await screen.findByText('Error creating tag: Internal server error')).toBeInTheDocument();
        // expect the input to retain the value that was entered before
        expect(draftRow[1].querySelector('input').value).toEqual('will fail');
        // expect the new tag to not be in the document outside the input field
        expect(screen.queryByText('will fail')).not.toBeInTheDocument();
      });

      it('should disable Add Tag button when the draft row is displayed', async () => {
        fireEvent.click(await screen.findByLabelText('Create Tag'));
        const addButton = await screen.findByLabelText('Create Tag');
        expect(addButton).toBeDisabled();
      });
    });

    it('should hide Add Tag for users without taxonomy edit permissions', async () => {
      initializeMockApp({ authenticatedUser: nonAdminUser });
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);

      expect(screen.queryByText('Add Tag')).not.toBeInTheDocument();
    });
  });

  describe('Create a new subtag', () => {
    describe('with editable user and loaded taxonomy', () => {
      it('should show an Add sub-tag option in the parent tag actions', async () => {
        expect(screen.queryAllByText('Add Subtag').length).toBe(0);
        // user clicks on row actions for root tag 1
        openActionsMenuForTag('root tag 1');
        expect(screen.getByText('Add Subtag')).toBeInTheDocument();
      });

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

      it('should disable Save and show required-name inline error for empty sub-tag input', async () => {
        openActionsMenuForTag('root tag 1');
        fireEvent.click(screen.getByText('Add Subtag'));
        const rows = await screen.findAllByRole('row');
        const draftRow = rows.find(tableRow => tableRow.querySelector('input'));
        const saveButton = within(draftRow).getByText('Save');
        const input = draftRow.querySelector('input');
        act(() => {
          fireEvent.change(input, { target: { value: ' ' } });
        });

        expect(saveButton).toBeDisabled();
        expect(within(draftRow).getByText(/Name is required/i)).toBeInTheDocument();
      });

      it('should keep Save disabled for whitespace-only sub-tag input', async () => {
        openActionsMenuForTag('root tag 1');
        fireEvent.click(screen.getByText('Add Subtag'));
        const rows = await screen.findAllByRole('row');
        const draftRow = rows.find(tableRow => tableRow.querySelector('input'));
        const input = draftRow.querySelector('input');
        const saveButton = within(draftRow).getByText('Save');

        fireEvent.change(input, { target: { value: '   ' } });
        expect(saveButton).toBeDisabled();
      });

      it('should disable Save and show invalid-character error for sub-tag input', async () => {
        openActionsMenuForTag('root tag 1');
        fireEvent.click(screen.getByText('Add Subtag'));
        const rows = await screen.findAllByRole('row');
        const draftRow = rows.find(row => row.querySelector('input'));
        const input = draftRow.querySelector('input');
        const saveButton = within(draftRow).getByText('Save');

        fireEvent.change(input, { target: { value: 'invalid;name' } });
        expect(saveButton).toBeDisabled();
        expect(within(draftRow).getByText(/invalid character/i)).toBeInTheDocument();
      });

      it('should keep inline row and show failure feedback when sub-tag save fails', async () => {
        axiosMock.onPost(createTagUrl).reply(500, {
          error: 'Internal server error',
        });

        openActionsMenuForTag('root tag 1');
        fireEvent.click(screen.getByText('Add Subtag'));
        const rows = await screen.findAllByRole('row');
        const draftRow = rows.find(row => row.querySelector('input'));
        const input = draftRow.querySelector('input');
        fireEvent.change(input, { target: { value: 'subtag fail' } });
        fireEvent.click(within(draftRow).getByText('Save'));

        await waitFor(() => {
          expect(getDraftRows().length).toBe(1);
        });
        expect(await screen.findByText(/Error creating tag:/i)).toBeInTheDocument();
      });
    });

    it('should hide or disable Add sub-tag actions when user lacks edit permissions', async () => {
      initializeMockApp({ authenticatedUser: nonAdminUser });
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

  describe('At smaller max depth', () => {
    beforeEach(async () => {
      const maxDepth = 2;
      // clear all previously rendered react
      cleanup();
      axiosMock.onGet(rootTagsListUrl).reply(200, {
        ...mockTagsResponse,
        max_depth: maxDepth,
      });
      // re-render with a smaller max depth to allow nested sub-tags
      renderTagListTable(maxDepth);
      await waitForRootTag();
      await flushReactUpdates();
    });
    it('should only allow adding sub-tags up to the taxonomy max depth', async () => {
      const expandButton = screen.getAllByLabelText('Show Subtags')[0];

      // open actions menu for depth 0 root tag
      openActionsMenuForTag('root tag 1');
      expect(screen.getByText('Add Subtag')).toBeInTheDocument();

      act(() => {
        fireEvent.click(expandButton);
      });
      await screen.findByText('the child tag');

      // depth 1 is the max allowed depth when maxDepth=2,
      // so there should be no actions menu to add another sub-tag
      const childTagRow = screen.getByText('the child tag').closest('tr');
      expect(within(childTagRow).queryByRole('button', { name: /actions/i })).not.toBeInTheDocument();
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
      cleanup();
      renderTagListTable();
      await waitForRootTag();
      await flushReactUpdates();
    });

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

describe('<TagListTable /> pagination transition behavior', () => {
  let tableViewProps;
  const mockEnterViewMode = jest.fn();

  const mockTableMode = (tableMode) => {
    jest.spyOn(hooksModule, 'useTableModes').mockReturnValue({
      tableMode,
      enterDraftMode: jest.fn(),
      exitDraftWithoutSave: jest.fn(),
      enterPreviewMode: jest.fn(),
      enterViewMode: mockEnterViewMode,
    });
  };

  beforeEach(() => {
    tableViewProps = null;
    mockEnterViewMode.mockReset();
    store = initializeStore();
    queryClient.clear();

    jest.spyOn(apiHooksModule, 'useTagListData').mockReturnValue({
      isLoading: false,
      data: {
        results: [],
        numPages: 1,
      },
    });
    jest.spyOn(apiHooksModule, 'useCreateTag').mockReturnValue({
      isPending: false,
      mutateAsync: jest.fn(),
    });
    jest.spyOn(hooksModule, 'useEditActions').mockReturnValue({
      handleCreateTag: jest.fn(),
      handleUpdateTag: jest.fn(),
      validate: jest.fn(() => true),
    });
    jest.spyOn(treeTableModule, 'TableView').mockImplementation((props) => {
      tableViewProps = props;
      return <div data-testid="mock-table-view" />;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('transitions from preview mode back to view mode on pagination changes', async () => {
    mockTableMode('preview');

    renderTagListTable();

    expect(await screen.findByTestId('mock-table-view')).toBeInTheDocument();
    expect(tableViewProps).toBeTruthy();

    act(() => {
      tableViewProps.handlePaginationChange({ pageIndex: 1, pageSize: 100 });
    });

    expect(mockEnterViewMode).toHaveBeenCalled();
  });

  it('does not transition to view mode on pagination changes when already in view mode', async () => {
    mockTableMode('view');

    renderTagListTable();

    expect(await screen.findByTestId('mock-table-view')).toBeInTheDocument();
    expect(tableViewProps).toBeTruthy();

    act(() => {
      tableViewProps.handlePaginationChange({ pageIndex: 1, pageSize: 100 });
    });

    expect(mockEnterViewMode).not.toHaveBeenCalled();
  });
});
