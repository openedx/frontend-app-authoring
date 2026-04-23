import React from 'react';
import { AxiosError } from 'axios';
import userEvent from '@testing-library/user-event';
import {
  render,
  waitFor,
  waitForElementToBeRemoved,
  screen,
  within,
  fireEvent,
  act,
  cleanup,
  initializeMocks,
} from '@src/testUtils';
import * as apiHooksModule from '../data/apiHooks';
import * as hooksModule from './hooks';
import * as treeTableModule from '../tree-table';
import TagListTable from './TagListTable';

let axiosMock;
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

const tagDefaults = { depth: 0, external_id: '', parent_value: null };
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
      _id: 1001,
      sub_tags_url: '/request/to/load/subtags/1',
      usage_count: 1,
    },
    {
      ...tagDefaults,
      value: 'root tag 2',
      child_count: 1,
      _id: 1002,
      sub_tags_url: '/request/to/load/subtags/2',
      usage_count: 0,
    },
    {
      ...tagDefaults,
      value: 'root tag 3',
      child_count: 1,
      _id: 1003,
      sub_tags_url: '/request/to/load/subtags/3',
      usage_count: 3,
    },
    {
      ...tagDefaults,
      depth: 1,
      value: 'the child tag',
      child_count: 0,
      _id: 1111,
      sub_tags_url: null,
      parent_value: 'root tag 1',
      usage_count: 1,
    },
    {
      ...tagDefaults,
      depth: 2,
      value: 'the grandchild tag',
      child_count: 0,
      _id: 1111,
      sub_tags_url: null,
      parent_value: 'the child tag',
      usage_count: null,
    },
  ],
};

const mockTagResponseDisallowingEdits = {
  ...mockTagsResponse,
  results: mockTagsResponse.results.map((tag) => ({
    ...tag,
    can_change_tag: false,
    can_delete_tag: false,
  })),
};
const rootTagsListUrl =
  'http://localhost:18010/api/content_tagging/v1/taxonomies/1/tags/?full_depth_threshold=10000&include_counts=true';
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
const subTagsUrl =
  'http://localhost:18010/api/content_tagging/v1/taxonomies/1/tags/?full_depth_threshold=10000&parent_tag=root+tag+1';
const createTagUrl = 'http://localhost:18010/api/content_tagging/v1/taxonomies/1/tags/';
const deleteTagUrl = createTagUrl;

const renderTagListTable = (maxDepth = 3) => render(<TagListTable taxonomyId={1} maxDepth={maxDepth} />);

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
  fireEvent.click(addButton);
  const creatingRow = await screen.findByTestId('creating-top-row');
  const input = creatingRow.querySelector('input');
  expect(input).toBeInTheDocument();
  return { creatingRow, input };
};

const openActionsMenuForTag = (tagName, actionButtonName = /actions/i) => {
  if (!screen.queryAllByText(tagName)?.length) {
    // expand all
    const expandButton = screen.queryByRole('button', { name: 'Expand All' });
    if (expandButton) {
      fireEvent.click(expandButton);
    }
  }
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

const openRenameDraftRow = async (tagName = 'root tag 1') => {
  openActionsMenuForTag(tagName);
  fireEvent.click(screen.getByRole('button', { name: /Rename/i }));
  const input = screen.getByRole('textbox', { name: /type tag name/i });
  const row = input.closest('tr');
  expect(row).toBeInTheDocument();
  const saveButton = within(row).getByText('Save');
  const cancelButton = within(row).getByText('Cancel');
  return {
    row,
    input,
    saveButton,
    cancelButton,
  };
};

const buildTagsResponse = (results) => ({
  ...mockTagsResponse,
  count: results.filter((tag) => tag.depth === 0).length,
  results,
});

const openDeleteDialogForTag = async ({
  tagName,
  actionButtonName = /actions/i,
} = {}) => {
  openActionsMenuForTag(tagName, actionButtonName);
  fireEvent.click(screen.getByRole('button', { name: /^Delete$/i }));
  const dialog = await screen.findByRole('dialog');
  expect(within(dialog).getByText(`Delete "${tagName}"`)).toBeInTheDocument();
  const input = within(dialog).getByRole('textbox');
  const cancelButton = within(dialog).getByRole('button', { name: 'Cancel' });
  const deleteButton = within(dialog).getByRole('button', {
    name: /Delete Tag|Delete Tags/i,
  });
  return {
    dialog,
    input,
    cancelButton,
    deleteButton,
  };
};

const expectDeleteRequest = async ({ tagName, withSubtags }) => {
  await waitFor(() => {
    expect(axiosMock.history.delete.length).toBe(1);
    expect(axiosMock.history.delete[0].url).toBe(deleteTagUrl);
    expect(axiosMock.history.delete[0].data).toEqual(
      JSON.stringify({
        tags: [tagName],
        with_subtags: withSubtags,
      }),
    );
  });
};

describe('<TagListTable />', () => {
  beforeEach(async () => {
    ({ axiosMock } = initializeMocks({ user: adminUser }));
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
    expect(within(rows[0]).getAllByRole('columnheader')[1].textContent).toEqual('Usage Count');
  });

  it('should render usage count correctly for root tag', async () => {
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(3 + 1); // 3 items plus header
    expect(within(rows[1]).getAllByRole('cell')[1].textContent).toEqual('1');
  });

  it('should render page correctly with subtags', async () => {
    const expandButton = await screen.findByLabelText('Show Subtags');
    fireEvent.click(expandButton);
    const childTag = await screen.findByText('the child tag');
    expect(childTag).toBeInTheDocument();
  });

  it('should render usage count correctly for sub tag', async () => {
    // Expand all tags and await for child tag to render
    const expandButton = screen.getAllByText('Expand All')[0];
    fireEvent.click(expandButton);
    const childTag = await screen.findByText('the child tag');
    expect(childTag).toBeInTheDocument();

    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(5 + 1); // 5 items plus header
    expect(within(rows[2]).getAllByRole('cell')[1].textContent).toEqual('1');
  });

  it('should render usage count as empty/no content when usage count is "0"', async () => {
    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(3 + 1); // 3 items plus header
    expect(within(rows[2]).getAllByRole('cell')[1].textContent).toEqual('');
  });

  it('should render usage count as empty/no when usage count is "null"', async () => {
    // Expand all tags and await for child tag to render
    const expandButton = screen.getAllByText('Expand All')[0];
    fireEvent.click(expandButton);
    const childTag = await screen.findByText('the child tag');
    expect(childTag).toBeInTheDocument();

    const rows = screen.getAllByRole('row');
    expect(rows.length).toBe(5 + 1); // 5 items plus header
    expect(within(rows[4]).getAllByRole('cell')[1].textContent).toEqual('');
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

  describe('Create a new top-level tag', () => {
    it('should disable tag creation buttons if the taxonomy includes `can_add_tag: false`', async () => {
      axiosMock.onGet(rootTagsListUrl).reply(200, {
        ...mockTagsResponse,
        can_add_tag: false,
      });
      cleanup();
      ({ axiosMock } = initializeMocks({ user: adminUser }));
      axiosMock.onGet(rootTagsListUrl).reply(200, {
        ...mockTagsResponse,
        can_add_tag: false,
      });
      axiosMock.onGet(subTagsUrl).reply(200, subTagsResponse);
      renderTagListTable();
      await waitForRootTag();

      openActionsMenuForTag('root tag 1');
      expect(screen.getByRole('button', { name: 'Add Subtag' })).toHaveAttribute('aria-disabled', 'true');
      expect(screen.getByLabelText('Create Tag')).toBeDisabled();
    });

    describe('with editable user and loaded taxonomy', () => {
      beforeEach(() => {
        axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);
      });

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
          _id: 1234,
        });
        const { creatingRow, input } = await openTopLevelDraftRow();

        fireEvent.change(input, { target: { value: 'a new tag' } });
        const saveButton = within(creatingRow).getByRole('button', { name: 'Save' });
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
        axiosMock.onPost(createTagUrl).reply(() =>
          new Promise(resolve => {
            setTimeout(() => {
              resolve([201, {
                ...tagDefaults,
                value: 'a new tag',
                child_count: 0,
                _id: 1234,
              }]);
            }, 100);
          })
        );
        const { creatingRow, input } = await openTopLevelDraftRow();

        fireEvent.change(input, { target: { value: 'a new tag' } });
        const saveButton = within(creatingRow).getByRole('button', { name: 'Save' });
        fireEvent.click(saveButton);
        const spinner = await screen.findByRole('status');
        expect(spinner.textContent).toEqual('Saving...');
      });

      it('should show a newly created top-level tag without triggering a page refresh', async () => {
        axiosMock.onPost(createTagUrl).reply(201, {
          ...tagDefaults,
          value: 'a new tag',
          child_count: 0,
          _id: 1234,
        });
        const { creatingRow, input } = await openTopLevelDraftRow();

        fireEvent.change(input, { target: { value: 'a new tag' } });
        const saveButton = within(creatingRow).getByRole('button', { name: 'Save' });
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
          _id: 1234,
        });
        const { creatingRow, input } = await openTopLevelDraftRow();

        fireEvent.change(input, { target: { value: 'a new tag' } });
        const saveButton = within(creatingRow).getByRole('button', { name: 'Save' });
        fireEvent.click(saveButton);
        const toast = await screen.findByText('Tag "a new tag" created successfully');
        expect(toast).toBeInTheDocument();
      });

      it('should add a temporary row to the top of the table', async () => {
        axiosMock.onPost(createTagUrl).reply(201, {
          ...tagDefaults,
          value: 'xyz tag',
          child_count: 0,
          _id: 1234,
        });
        const { creatingRow, input } = await openTopLevelDraftRow();

        fireEvent.change(input, { target: { value: 'xyz tag' } });
        const saveButton = within(creatingRow).getByRole('button', { name: 'Save' });
        fireEvent.click(saveButton);
        // no input row should be in the document
        await waitFor(() => {
          expectNoDraftRows();
        });
        const temporaryRow = await screen.findByText('xyz tag');
        expect(temporaryRow).toBeInTheDocument();
      });

      // a bit flaky when ran together with other tests - any way to improve this?
      it('should allow adding multiple tags consecutively without a page refresh', async () => {
        // clear axios mock history
        axiosMock.reset();
        axiosMock.onPost(createTagUrl).reply(config => {
          const requestData = JSON.parse(config.data);
          return [201, {
            ...tagDefaults,
            value: requestData.tag,
            child_count: 0,
            _id: Math.floor(Math.random() * 10000),
          }];
        });
        let addButton = await screen.findByLabelText('Create Tag');
        fireEvent.click(addButton);
        let creatingRow = await screen.findByTestId('creating-top-row');
        let input = creatingRow.querySelector('input');
        expect(input).toBeInTheDocument();

        fireEvent.change(input, { target: { value: 'Tag A' } });
        let saveButton = within(creatingRow).getByRole('button', { name: 'Save' });
        fireEvent.click(saveButton);
        const tagA = await screen.findByText('Tag A');
        expect(tagA).toBeInTheDocument();

        addButton = await screen.findByLabelText('Create Tag');
        fireEvent.click(addButton);
        creatingRow = await screen.findByTestId('creating-top-row');
        input = creatingRow.querySelector('input');
        expect(input).toBeInTheDocument();

        fireEvent.change(input, { target: { value: 'Tag B' } });
        saveButton = within(creatingRow).getByRole('button', { name: 'Save' });
        fireEvent.click(saveButton);
        const tagB = await screen.findByText('Tag B');
        expect(tagB).toBeInTheDocument();

        // expect Tag B to be above Tag A in the list
        const rows = screen.getAllByRole('row');
        const tagBRowIndex = rows.findIndex(row => within(row).queryByText('Tag B'));
        const tagARowIndex = rows.findIndex(row => within(row).queryByText('Tag A'));
        expect(tagBRowIndex).toBeLessThan(tagARowIndex);

        // no additional get requests should have been made, that is, the table should not have been refreshed
        expect(axiosMock.history.get.length).toBe(0);
      });

      it('should disable the Save button when the input is empty', async () => {
        const addButton = await screen.findByLabelText('Create Tag');
        fireEvent.click(addButton);
        const draftRow = await screen.findAllByRole('row');
        const input = draftRow[1].querySelector('input');
        expect(input).toBeInTheDocument();
        const saveButton = within(draftRow[1]).getByRole('button', { name: 'Save' });
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
        const saveButton = within(draftRow[1]).getByRole('button', { name: 'Save' });
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
          _id: 4567,
        });

        fireEvent.click(await screen.findByLabelText('Create Tag'));
        const draftRow = await screen.findAllByRole('row');
        const input = draftRow[1].querySelector('input');
        const saveButton = within(draftRow[1]).getByRole('button', { name: 'Save' });

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
        const saveButton = within(draftRow[1]).getByRole('button', { name: 'Save' });

        fireEvent.change(input, { target: { value: 'invalid;tag' } });

        expect(saveButton).toBeDisabled();
        expect(screen.getByText(/invalid character/i)).toBeInTheDocument();
      });

      it('should show failure feedback when creating a duplicate root tag name', async () => {
        axiosMock.onPost(createTagUrl).reply(() => {
          const error = new AxiosError('Request failed with status code 400');
          error.response = {
            data: {
              tag: ['Tag with this name already exists'],
            },
          };
          return Promise.reject(error);
        });

        fireEvent.click(await screen.findByLabelText('Create Tag'));
        const draftRow = await screen.findAllByRole('row');
        const input = draftRow[1].querySelector('input');
        const saveButton = within(draftRow[1]).getByRole('button', { name: 'Save' });

        fireEvent.change(input, { target: { value: 'root tag 1' } });
        fireEvent.click(saveButton);

        expect(await screen.findByText('Error creating tag: Tag with this name already exists')).toBeInTheDocument();
      });

      it('should keep the inline row and show a failure toast when save request fails', async () => {
        axiosMock.onPost(createTagUrl).reply(() => {
          const error = new AxiosError('Request failed with status code 500');
          error.response = {
            data: {
              tag: ['Internal server error'],
            },
          };
          return Promise.reject(error);
        });

        fireEvent.click(await screen.findByLabelText('Create Tag'));
        const draftRow = await screen.findAllByRole('row');
        const input = draftRow[1].querySelector('input');
        const saveButton = within(draftRow[1]).getByRole('button', { name: 'Save' });

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
      initializeMocks({ user: nonAdminUser });
      axiosMock.onGet(rootTagsListUrl).reply(200, mockTagsResponse);

      expect(screen.queryByText('Add Tag')).not.toBeInTheDocument();
    });
  });

  describe('Create a new subtag', () => {
    it('should show an Add sub-tag option in the parent tag actions', async () => {
      expect(screen.queryAllByText('Add Subtag').length).toBe(0);
      // user clicks on row actions for root tag 1
      openActionsMenuForTag('root tag 1');
      expect(screen.getByRole('button', { name: 'Add Subtag' })).toBeInTheDocument();
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
      expect(within(draftRows[0]).getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(within(draftRows[0]).getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });

    it('should remove add-subtag row and avoid create request when cancelled', async () => {
      const { draftRow, input } = await openSubtagDraftRow({ tagName: 'root tag 1' });
      fireEvent.change(input, { target: { value: 'new subtag' } });
      fireEvent.click(within(draftRow).getByRole('button', { name: 'Cancel' }));

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
      fireEvent.click(screen.getByRole('button', { name: 'Add Subtag' }));
      const rows = await screen.findAllByRole('row');
      const draftRow = rows.find(tableRow => tableRow.querySelector('input'));
      const saveButton = within(draftRow).getByRole('button', { name: 'Save' });
      const input = draftRow.querySelector('input');
      fireEvent.change(input, { target: { value: ' ' } });

      expect(saveButton).toBeDisabled();
      expect(within(draftRow).getByText(/Name is required/i)).toBeInTheDocument();
    });

    it('should keep Save disabled for whitespace-only sub-tag input', async () => {
      openActionsMenuForTag('root tag 1');
      fireEvent.click(screen.getByRole('button', { name: 'Add Subtag' }));
      const rows = await screen.findAllByRole('row');
      const draftRow = rows.find(tableRow => tableRow.querySelector('input'));
      const input = draftRow.querySelector('input');
      const saveButton = within(draftRow).getByRole('button', { name: 'Save' });

      fireEvent.change(input, { target: { value: '   ' } });
      expect(saveButton).toBeDisabled();
    });

    it('should disable Save and show invalid-character error for sub-tag input', async () => {
      openActionsMenuForTag('root tag 1');
      fireEvent.click(screen.getByRole('button', { name: 'Add Subtag' }));
      const rows = await screen.findAllByRole('row');
      const draftRow = rows.find(row => row.querySelector('input'));
      const input = draftRow.querySelector('input');
      const saveButton = within(draftRow).getByRole('button', { name: 'Save' });

      fireEvent.change(input, { target: { value: 'invalid;name' } });
      expect(saveButton).toBeDisabled();
      expect(within(draftRow).getByText(/invalid character/i)).toBeInTheDocument();
    });

    it('should keep inline row and show failure feedback when sub-tag save fails', async () => {
      axiosMock.onPost(createTagUrl).reply(500, {
        error: 'Internal server error',
      });

      openActionsMenuForTag('root tag 1');
      fireEvent.click(screen.getByRole('button', { name: 'Add Subtag' }));
      const rows = await screen.findAllByRole('row');
      const draftRow = rows.find(row => row.querySelector('input'));
      const input = draftRow.querySelector('input');
      fireEvent.change(input, { target: { value: 'subtag fail' } });
      fireEvent.click(within(draftRow).getByRole('button', { name: 'Save' }));

      await waitFor(() => {
        expect(getDraftRows().length).toBe(1);
      });
      expect(await screen.findByText(/Error creating tag:/i)).toBeInTheDocument();
    });

    it('should hide or disable Add sub-tag actions when user lacks edit permissions', async () => {
      initializeMocks({ user: nonAdminUser });
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

  describe('Tag Rename Errors', () => {
    it('should keep the inline row and show a failure toast when save request fails', async () => {
      axiosMock.onPatch().reply(500, {
        error: 'Internal server error',
      });
      const { input } = await openRenameDraftRow('root tag 1');

      fireEvent.change(input, { target: { value: 'will fail' } });
      fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

      let draftRow;
      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        const draftRows = rows.filter(row => row.querySelector('input'));
        expect(draftRows.length).toBe(1);
        draftRow = draftRows[0]; // eslint-disable-line prefer-destructuring
      });

      // Banner error message should be shown at the top of the table
      expect(await screen.findByText(/Error saving changes/i)).toBeInTheDocument();

      // Toast message to indicate that the save failed
      expect(await screen.findByText(/Error updating tag:\s*.+/i)).toBeInTheDocument();

      // expect the input to retain the value that was entered before
      expect(draftRow.querySelector('input').value).toEqual('will fail');
      // expect the new tag to not be in the document outside the input field
      expect(screen.queryByText('will fail')).not.toBeInTheDocument();
    });
  });

  const tagDepthScenarios = [
    {
      description: 'Rename a top-level tag',
      tagName: 'root tag 1',
    },
    { description: 'Rename a sub-tag', tagName: 'the child tag' },
    { description: 'Rename a grandchild tag', tagName: 'the grandchild tag' },
  ];

  tagDepthScenarios.forEach(({ description, tagName }) => {
    describe(description, () => {
      beforeEach(async () => {
        axiosMock.resetHistory();
      });
      it('should disable tag edit buttons if tag includes `can_edit: false`', async () => {
        axiosMock.reset();
        axiosMock.onGet(rootTagsListUrl).reply(200, mockTagResponseDisallowingEdits);
        cleanup();
        ({ axiosMock } = initializeMocks({ user: adminUser }));
        axiosMock.onGet(rootTagsListUrl).reply(200, mockTagResponseDisallowingEdits);
        axiosMock.onGet(subTagsUrl).reply(200, subTagsResponse);
        renderTagListTable();
        await waitForRootTag();

        openActionsMenuForTag(tagName);
        expect(screen.getByRole('button', { name: /Rename/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Rename/i })).toHaveAttribute('aria-disabled', 'true');
      });

      it('should show tag actions menu', async () => {
        openActionsMenuForTag(tagName);
        expect(screen.getByText('Add Subtag')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Rename/i })).toBeInTheDocument();
      });
      it('should show editable input and action buttons when Rename is selected from actions menu', async () => {
        const { row } = await openRenameDraftRow(tagName);
        expect(within(row).getByRole('textbox')).toBeInTheDocument();
        // expect the input to be pre-filled with the current tag name
        expect(within(row).getByRole('textbox').value).toEqual(tagName);
        expect(within(row).getByRole('button', { name: /Save/i })).toBeInTheDocument();
        expect(within(row).getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
      });
      it('should disable Save button until the tag name is changed', async () => {
        const { input, saveButton } = await openRenameDraftRow(tagName);

        expect(saveButton).toBeDisabled();
        fireEvent.change(input, { target: { value: `${tagName} updated` } });
        expect(saveButton).not.toBeDisabled();
      });
      it('should save changes and show success toast when Enter is pressed', async () => {
        axiosMock.onPatch(/.*/).reply(200, {});
        const { input } = await openRenameDraftRow(tagName);

        fireEvent.change(input, { target: { value: `${tagName} updated` } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        await waitFor(() => {
          expect(axiosMock.history.patch.length).toBe(1);
          expect(axiosMock.history.patch[0].data).toEqual(JSON.stringify({
            tag: tagName,
            updated_tag_value: `${tagName} updated`,
          }));
        });
        expect(await screen.findByText(`Tag "${tagName} updated" updated successfully`)).toBeInTheDocument();
      });
      it('should save changes and show success toast when Save is clicked', async () => {
        axiosMock.onPatch(/.*/).reply(200, {});
        const { input, saveButton } = await openRenameDraftRow(tagName);

        fireEvent.change(input, { target: { value: `${tagName} updated` } });
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(axiosMock.history.patch.length).toBe(1);
          expect(axiosMock.history.patch[0].data).toEqual(JSON.stringify({
            tag: tagName,
            updated_tag_value: `${tagName} updated`,
          }));
        });
        expect(await screen.findByText(`Tag "${tagName} updated" updated successfully`)).toBeInTheDocument();
      });
      it('should cancel editing and revert to original name when Esc is pressed', async () => {
        const { input } = await openRenameDraftRow(tagName);

        fireEvent.change(input, { target: { value: `${tagName} updated` } });
        fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' });

        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        expect(screen.getByText(tagName)).toBeInTheDocument();
        expect(axiosMock.history.patch.length).toBe(0);
      });
      it('should cancel editing and revert to original name when Cancel is clicked', async () => {
        const { input, cancelButton } = await openRenameDraftRow(tagName);

        fireEvent.change(input, { target: { value: `${tagName} updated` } });
        fireEvent.click(cancelButton);

        expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
        expect(screen.getByText(tagName)).toBeInTheDocument();
        expect(axiosMock.history.patch.length).toBe(0);
      });
    });
  });

  describe('Nested behavior', () => {
    beforeEach(async () => {
      axiosMock.resetHistory();
    });

    it('should keep the parent-child relationships in the updated tree data when renaming a parent tag', async () => {
      // this only tests that the frontend is updated correctly before reloading data;
      // the rest is covered by the backend tests for the rename endpoint

      axiosMock.onPatch(/.*/).reply(200, {});
      const { input, saveButton } = await openRenameDraftRow('root tag 1');

      fireEvent.change(input, { target: { value: 'root tag 1 updated' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(axiosMock.history.patch.length).toBe(1);
        expect(axiosMock.history.patch[0].data).toEqual(JSON.stringify({
          tag: 'root tag 1',
          updated_tag_value: 'root tag 1 updated',
        }));
      });
      // make sure rows are not already expanded by checking that the child tag is not visible before expanding
      expect(screen.queryAllByText('the child tag')?.length).toBeFalsy();
      fireEvent.click(await screen.findByLabelText('Show Subtags'));
      // expect the child tag to still be present under the renamed parent tag
      expect(await screen.findByText('the child tag')).toBeInTheDocument();
      // expect the grandchild tag to still be present under the child tag
      openActionsMenuForTag('the child tag');
      fireEvent.click(await screen.findByLabelText('Show Subtags'));
      expect(await screen.findByText('the grandchild tag')).toBeInTheDocument();
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
      fireEvent.click(screen.getAllByText('Expand All')[0]);

      // open actions menu for depth 0 root tag
      openActionsMenuForTag('root tag 1');
      expect(screen.getByText('Add Subtag')).toBeInTheDocument();

      await screen.findByText('the child tag');
      await screen.findByText('the grandchild tag');

      // depth 1 is not innermost when maxDepth=2, so adding another sub-tag is allowed
      const childTagRow = screen.getByText('the child tag').closest('tr');
      expect(within(childTagRow).getByRole('button', { name: /actions/i })).toBeInTheDocument();

      // depth 2 is innermost when maxDepth=2, so no add-subtag action should be shown
      const grandchildTagRow = screen.getByText('the grandchild tag').closest('tr');
      expect(within(grandchildTagRow).queryByRole('button', { name: /actions/i })).toBeInTheDocument();
      openActionsMenuForTag('the grandchild tag');
      expect(within(grandchildTagRow).getByRole('button', { name: /Rename/i })).toBeInTheDocument();
      expect(within(grandchildTagRow).getByText('Add Subtag')).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Delete Tags', () => {
    const tagDepthScenarios = [
      {
        description: 'Delete a top-level tag',
        tagName: 'root tag 1',
      },
      { description: 'Delete a sub-tag', tagName: 'the child tag' },
      { description: 'Delete a grandchild tag', tagName: 'the grandchild tag' },
    ];

    tagDepthScenarios.forEach(({ description, tagName }) => {
      describe(description, () => {
        beforeEach(async () => {
          axiosMock.resetHistory();
        });

        it('should disable delete action if tag includes `can_delete: false`', async () => {
          axiosMock.reset();
          axiosMock
            .onGet(rootTagsListUrl)
            .reply(200, mockTagResponseDisallowingEdits);
          axiosMock.onGet(subTagsUrl).reply(200, subTagsResponse);
          cleanup();
          ({ axiosMock } = initializeMocks({ user: adminUser }));
          axiosMock
            .onGet(rootTagsListUrl)
            .reply(200, mockTagResponseDisallowingEdits);
          axiosMock.onGet(subTagsUrl).reply(200, subTagsResponse);
          renderTagListTable();
          await waitForRootTag();

          openActionsMenuForTag(tagName);
          const deleteButton = screen.getByRole('button', { name: /Delete/i });
          expect(deleteButton).toBeInTheDocument();
          expect(deleteButton).toHaveAttribute('aria-disabled', 'true');
        });
      });
    });

    it('opens the delete confirmation dialog for a leaf tag from the actions menu and requires typing "DELETE" before deletion can proceed', async () => {
      fireEvent.click(screen.getAllByText('Expand All')[0]);
      await screen.findByText('the grandchild tag');

      const { dialog, input, cancelButton, deleteButton } = await openDeleteDialogForTag({
        tagName: 'the grandchild tag',
        actionButtonName: /more actions for tag "the grandchild tag"/i,
      });

      expect(dialog).toHaveTextContent(
        'Warning! You are about to delete 1 tag(s).',
      );
      expect(dialog).toHaveTextContent(
        'Any tags applied to course content will be removed across all assigned organizations.',
      );
      expect(dialog).toHaveTextContent('Type DELETE to confirm');
      expect(cancelButton).toBeInTheDocument();
      expect(deleteButton).toHaveTextContent('Delete Tag');
      expect(deleteButton).toBeDisabled();

      fireEvent.change(input, { target: { value: 'DELETE ALL 2 TAGS' } });
      expect(deleteButton).toBeDisabled();

      fireEvent.change(input, { target: { value: 'DELETE' } });
      expect(deleteButton).toBeEnabled();
    });

    it('opens the stronger delete confirmation dialog for a parent tag and requires the exact descendant-aware confirmation phrase before enabling delete', async () => {
      fireEvent.click(screen.getAllByText('Expand All')[0]);
      await screen.findByText('the child tag');

      const { dialog, input, deleteButton } = await openDeleteDialogForTag({
        tagName: 'the child tag',
        actionButtonName: /more actions for tag "the child tag"/i,
      });

      expect(dialog).toHaveTextContent(
        'Warning! You are about to delete a tag containing sub-tags. If you proceed, 2 tags will be deleted.',
      );
      expect(dialog).toHaveTextContent('Type DELETE ALL 2 TAGS to confirm');
      expect(deleteButton).toHaveTextContent('Delete Tags');
      expect(deleteButton).toBeDisabled();

      fireEvent.change(input, { target: { value: 'DELETE' } });
      expect(deleteButton).toBeDisabled();

      fireEvent.change(input, { target: { value: 'DELETE ALL 2 TAGS' } });
      expect(deleteButton).toBeEnabled();
    });

    it('shows the descendant deletion warning and the total recursive tag count when deleting a tag with nested subtags', async () => {
      const { dialog, deleteButton } = await openDeleteDialogForTag({
        tagName: 'root tag 1',
      });

      expect(dialog).toHaveTextContent(
        'Warning! You are about to delete a tag containing sub-tags. If you proceed, 3 tags will be deleted.',
      );
      expect(dialog).toHaveTextContent('Type DELETE ALL 3 TAGS to confirm');
      expect(deleteButton).toHaveTextContent('Delete Tags');
    });

    it('deletes a leaf tag after typed confirmation and shows the success toast describing that tagged content will be updated', async () => {
      axiosMock.reset();
      axiosMock.onDelete(deleteTagUrl).reply(204);
      axiosMock
        .onGet(rootTagsListUrl)
        .reply(
          200,
          buildTagsResponse(
            mockTagsResponse.results.filter(
              (tag) => tag.value !== 'root tag 2',
            ),
          ),
        );

      expect(screen.queryByText('root tag 2')).toBeInTheDocument();

      const { input, deleteButton } = await openDeleteDialogForTag({
        tagName: 'root tag 2',
      });
      fireEvent.change(input, { target: { value: 'DELETE' } });
      fireEvent.click(deleteButton);

      await expectDeleteRequest({ tagName: 'root tag 2', withSubtags: false });
      expect(
        await screen.findByText(
          '1 tag(s) deleted. This change will be applied across all tagged content.',
        ),
      ).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.queryByText('root tag 2')).not.toBeInTheDocument();
      });
    });

    it('deletes a parent tag together with all rendered descendants after typed confirmation and shows the success toast with the total deleted count', async () => {
      fireEvent.click(screen.getAllByText('Expand All')[0]);
      await screen.findByText('the child tag');
      await screen.findByText('the grandchild tag');

      axiosMock.reset();
      axiosMock.onDelete(deleteTagUrl).reply(204);
      axiosMock
        .onGet(rootTagsListUrl)
        .reply(
          200,
          buildTagsResponse(
            mockTagsResponse.results.filter(
              (tag) =>
                !['root tag 1', 'the child tag', 'the grandchild tag'].includes(
                  tag.value,
                ),
            ),
          ),
        );

      const { input, deleteButton } = await openDeleteDialogForTag({
        tagName: 'root tag 1',
      });
      fireEvent.change(input, { target: { value: 'DELETE ALL 3 TAGS' } });
      fireEvent.click(deleteButton);

      await expectDeleteRequest({ tagName: 'root tag 1', withSubtags: true });
      expect(
        await screen.findByText(
          '3 tag(s) deleted. This change will be applied across all tagged content.',
        ),
      ).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.queryByText('root tag 1')).not.toBeInTheDocument();
        expect(screen.queryByText('the child tag')).not.toBeInTheDocument();
        expect(
          screen.queryByText('the grandchild tag'),
        ).not.toBeInTheDocument();
        expect(screen.getByText('root tag 2')).toBeInTheDocument();
      });
    });

    it('does not issue a delete request when the dialog is canceled and leaves the table unchanged', async () => {
      const { cancelButton } = await openDeleteDialogForTag({
        tagName: 'root tag 1',
      });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      expect(axiosMock.history.delete.length).toBe(0);
      expect(screen.getByText('root tag 1')).toBeInTheDocument();
    });

    it('does not keep a previous typed confirmation when the delete dialog is closed and reopened for the same tag', async () => {
      const firstOpen = await openDeleteDialogForTag({ tagName: 'root tag 1' });
      fireEvent.change(firstOpen.input, {
        target: { value: 'DELETE ALL 3 TAGS' },
      });
      expect(firstOpen.deleteButton).toBeEnabled();
      fireEvent.click(firstOpen.cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      const secondOpen = await openDeleteDialogForTag({
        tagName: 'root tag 1',
      });
      expect(secondOpen.input.value).toEqual('');
      expect(secondOpen.deleteButton).toBeDisabled();
    });

    it('completes the delete workflow with keyboard only by opening the menu, selecting Delete, typing the confirmation phrase, and pressing Enter', async () => {
      const user = userEvent.setup();
      axiosMock.reset();
      axiosMock.onDelete(deleteTagUrl).reply(204);
      axiosMock
        .onGet(rootTagsListUrl)
        .reply(
          200,
          buildTagsResponse(
            mockTagsResponse.results.filter(
              (tag) => tag.value !== 'root tag 2',
            ),
          ),
        );

      const row = screen.getByText('root tag 2').closest('tr');
      const actionsButton = within(row).getByRole('button', {
        name: /more actions for tag "root tag 2"/i,
      });
      actionsButton.focus();
      expect(actionsButton).toHaveFocus();

      await user.keyboard('{Enter}');

      const deleteMenuItem = await screen.findByRole('button', {
        name: /^Delete$/i,
      });
      deleteMenuItem.focus();
      expect(deleteMenuItem).toHaveFocus();
      await user.keyboard('{Enter}');

      const dialog = await screen.findByRole('dialog');
      const input = within(dialog).getByRole('textbox');
      await user.type(input, 'DELETE');
      await user.keyboard('{Enter}');

      await expectDeleteRequest({ tagName: 'root tag 2', withSubtags: false });
      expect(
        await screen.findByText(
          '1 tag(s) deleted. This change will be applied across all tagged content.',
        ),
      ).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.queryByText('root tag 2')).not.toBeInTheDocument();
      });
    });

    it('cancels the delete workflow with keyboard only by pressing Escape and does not send a delete request', async () => {
      const user = userEvent.setup();
      const row = screen.getByText('root tag 1').closest('tr');
      const actionsButton = within(row).getByRole('button', {
        name: /more actions for tag "root tag 1"/i,
      });
      actionsButton.focus();
      expect(actionsButton).toHaveFocus();

      await user.keyboard('{Enter}');

      const deleteMenuItem = await screen.findByRole('button', {
        name: /^Delete$/i,
      });
      deleteMenuItem.focus();
      expect(deleteMenuItem).toHaveFocus();
      await user.keyboard('{Enter}');

      const dialog = await screen.findByRole('dialog');
      expect(
        within(dialog).getByText('Delete "root tag 1"'),
      ).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      expect(axiosMock.history.delete.length).toBe(0);
      expect(screen.getByText('root tag 1')).toBeInTheDocument();
    });

    it('surfaces a failed delete through both the persistent error alert and the delete-error toast while leaving the row visible', async () => {
      axiosMock.reset();
      axiosMock.onDelete(deleteTagUrl).reply(() => {
        const error = new AxiosError('Request failed with status code 500');
        error.response = {
          data: {
            value: ['Delete failed'],
          },
        };
        return Promise.reject(error);
      });

      const { input, deleteButton } = await openDeleteDialogForTag({
        tagName: 'root tag 1',
      });
      fireEvent.change(input, { target: { value: 'DELETE ALL 3 TAGS' } });
      fireEvent.click(deleteButton);

      await expectDeleteRequest({ tagName: 'root tag 1', withSubtags: true });
      expect(
        await screen.findByText('Error saving changes'),
      ).toBeInTheDocument();
      expect(
        await screen.findByText('Error deleting tag: Delete failed'),
      ).toBeInTheDocument();
      expect(screen.getByText('root tag 1')).toBeInTheDocument();
    });
  });
});

// These async creation flows are intentionally isolated because they pass individually
// but can be flaky when interleaved with the larger suite's async/query timing.
describe('<TagListTable /> isolated async subtag tests', () => {
  beforeEach(async () => {
    ({ axiosMock } = initializeMocks({ user: adminUser }));
  });

  it('shows the spinner before the query is complete', async () => {
    // Simulate an actual slow response from the API:
    let resolveResponse;
    const promise = new Promise(resolve => {
      resolveResponse = resolve;
    });
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
        _id: 4444,
        parent_value: 'the child tag',
      });

      const expandButton = screen.getAllByLabelText('Show Subtags')[0];
      fireEvent.click(expandButton);

      await screen.findByText('the child tag');
      const { input } = await openSubtagDraftRow({
        tagName: 'the child tag',
        actionButtonName: /more actions for tag "the child tag"/i,
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

    it('should allow adding a great-grandchild sub-tag under a grandchild tag', async () => {
      axiosMock.onPost(createTagUrl).reply(201, {
        ...tagDefaults,
        value: 'great grandchild',
        child_count: 0,
        _id: 6666,
        parent_value: 'the grandchild tag',
      });

      fireEvent.click(screen.getAllByText('Expand All')[0]);
      await screen.findByText('the grandchild tag');

      const { input } = await openSubtagDraftRow({
        tagName: 'the grandchild tag',
        actionButtonName: /more actions for tag "the grandchild tag"/i,
      });
      fireEvent.change(input, { target: { value: 'great grandchild' } });
      fireEvent.click(within(input.closest('tr')).getByText('Save'));

      expect(await screen.findByText('great grandchild')).toBeInTheDocument();
    });

    it('should show a newly created great-grandchild sub-tag without triggering a page refresh', async () => {
      axiosMock.onPost(createTagUrl).reply(201, {
        ...tagDefaults,
        value: 'great grandchild appears immediately',
        child_count: 0,
        _id: 7777,
        parent_value: 'the grandchild tag',
      });

      fireEvent.click(screen.getAllByText('Expand All')[0]);
      await screen.findByText('the grandchild tag');

      const { draftRow, input } = await openSubtagDraftRow({
        tagName: 'the grandchild tag',
        actionButtonName: /more actions for tag "the grandchild tag"/i,
      });
      fireEvent.change(input, { target: { value: 'great grandchild appears immediately' } });

      const saveButton = within(draftRow).getByText('Save');

      fireEvent.click(saveButton);

      expect(await screen.findByText('great grandchild appears immediately')).toBeInTheDocument();
      expect(axiosMock.history.get.length).toBe(1);
    });

    it('should allow adding a sub-tag at depth 2 when maxDepth is 3', async () => {
      fireEvent.click(screen.getAllByText('Expand All')[0]);

      await screen.findByText('the grandchild tag');
      const grandchildRow = screen.getByText('the grandchild tag').closest('tr');
      const grandchildActionsButton = within(grandchildRow).getByRole('button', {
        name: /more actions for tag "the grandchild tag"/i,
      });

      fireEvent.click(grandchildActionsButton);
      expect(screen.getByText('Add Subtag')).toBeInTheDocument();
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
    initializeMocks({ user: adminUser });

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
    jest.spyOn(treeTableModule, 'TableView').mockImplementation(() => {
      tableViewProps = React.useContext(treeTableModule.TreeTableContext);
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
