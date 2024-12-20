import {
  act,
  fireEvent,
  initializeMocks,
  render,
  waitFor,
  screen,
  within,
} from '../testUtils';
import ContentTagsDrawer from './ContentTagsDrawer';
import messages from './messages';
import { ContentTagsDrawerSheetContext } from './common/context';
import {
  mockContentData,
  mockContentTaxonomyTagsData,
  mockTaxonomyListData,
  mockTaxonomyTagsData,
} from './data/api.mocks';
import { getContentTaxonomyTagsApiUrl } from './data/api';

const path = '/content/:contentId?/*';
const mockOnClose = jest.fn();
const mockSetBlockingSheet = jest.fn();
const mockNavigate = jest.fn();
mockContentTaxonomyTagsData.applyMock();
mockTaxonomyListData.applyMock();
mockTaxonomyTagsData.applyMock();
mockContentData.applyMock();

const {
  stagedTagsId,
  otherTagsId,
  languageWithTagsId,
  languageWithoutTagsId,
  largeTagsId,
  emptyTagsId,
} = mockContentTaxonomyTagsData;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderDrawer = (contentId, drawerParams = {}) => (
  render(
    <ContentTagsDrawerSheetContext.Provider value={drawerParams}>
      <ContentTagsDrawer {...drawerParams} />
    </ContentTagsDrawerSheetContext.Provider>,
    { path, params: { contentId } },
  )
);

describe('<ContentTagsDrawer />', () => {
  beforeEach(async () => {
    initializeMocks();
  });

  it('should render page and page title correctly', () => {
    renderDrawer(stagedTagsId);
    expect(screen.getByText('Manage tags')).toBeInTheDocument();
  });

  it('shows spinner before the content data query is complete', async () => {
    await act(async () => {
      renderDrawer(stagedTagsId);
      const spinner = screen.getAllByRole('status')[0];
      expect(spinner.textContent).toEqual('Loading'); // Uses <Spinner />
    });
  });

  it('shows spinner before the taxonomy tags query is complete', async () => {
    await act(async () => {
      renderDrawer(stagedTagsId);
      const spinner = screen.getAllByRole('status')[1];
      expect(spinner.textContent).toEqual('Loading...'); // Uses <Loading />
    });
  });

  it('shows the content display name after the query is complete in drawer variant', async () => {
    renderDrawer('test');
    expect(await screen.findByText('Loading...')).toBeInTheDocument();
    expect(await screen.findByText('Unit 1')).toBeInTheDocument();
    expect(await screen.findByText('Manage tags')).toBeInTheDocument();
  });

  it('shows the content display name after the query is complete in component variant', async () => {
    renderDrawer('test', { variant: 'component' });
    expect(await screen.findByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Unit 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Manage tags')).not.toBeInTheDocument();
  });

  it('shows content using params', async () => {
    renderDrawer(undefined, { id: 'test' });
    expect(await screen.findByText('Loading...')).toBeInTheDocument();
    expect(await screen.findByText('Unit 1')).toBeInTheDocument();
    expect(await screen.findByText('Manage tags')).toBeInTheDocument();
  });

  it('shows the taxonomies data including tag numbers after the query is complete', async () => {
    await act(async () => {
      const { container } = renderDrawer(largeTagsId);
      await waitFor(() => { expect(screen.getByText('Taxonomy 1')).toBeInTheDocument(); });
      expect(screen.getByText('Taxonomy 1')).toBeInTheDocument();
      expect(screen.getByText('Taxonomy 2')).toBeInTheDocument();
      const tagCountBadges = container.getElementsByClassName('taxonomy-tags-count-chip');
      expect(tagCountBadges[0].textContent).toBe('3');
      expect(tagCountBadges[1].textContent).toBe('2');
    });
  });

  it('should be read only on first render on drawer variant', async () => {
    renderDrawer(stagedTagsId);
    expect(await screen.findByText('Taxonomy 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i }));
    expect(screen.getByRole('button', { name: /edit tags/i }));

    // Not show delete tag buttons
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();

    // Not show add a tag select
    expect(screen.queryByText(/add a tag/i)).not.toBeInTheDocument();

    // Not show cancel button
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();

    // Not show save button
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
  });

  it('should be read only on first render on component variant', async () => {
    renderDrawer(stagedTagsId, { variant: 'component' });
    expect(await screen.findByText('Taxonomy 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /manage tags/i }));

    // Not show delete tag buttons
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();

    // Not show add a tag select
    expect(screen.queryByText(/add a tag/i)).not.toBeInTheDocument();

    // Not show cancel button
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();

    // Not show save button
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
  });

  it('should change to edit mode when click on `Edit tags` on drawer variant', async () => {
    renderDrawer(stagedTagsId);
    expect(await screen.findByText('Taxonomy 1')).toBeInTheDocument();
    const editTagsButton = screen.getByRole('button', {
      name: /edit tags/i,
    });
    fireEvent.click(editTagsButton);

    // Show delete tag buttons
    expect(screen.getAllByRole('button', {
      name: /delete/i,
    }).length).toBe(2);

    // Show add a tag select
    expect(screen.getByText(/add a tag/i)).toBeInTheDocument();

    // Show cancel button
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();

    // Show save button
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('should change to edit mode when click on `Manage tags` on component variant', async () => {
    renderDrawer(stagedTagsId, { variant: 'component' });
    expect(await screen.findByText('Taxonomy 1')).toBeInTheDocument();
    const manageTagsButton = screen.getByRole('button', {
      name: /manage tags/i,
    });
    fireEvent.click(manageTagsButton);

    // Show delete tag buttons
    expect(screen.getAllByRole('button', {
      name: /delete/i,
    }).length).toBe(2);

    // Show add a tag select
    expect(screen.getByText(/add a tag/i)).toBeInTheDocument();

    // Show cancel button
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();

    // Show save button
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('should change to read mode when click on `Cancel` on drawer variant', async () => {
    renderDrawer(stagedTagsId);
    expect(await screen.findByText('Taxonomy 1')).toBeInTheDocument();
    const editTagsButton = screen.getByRole('button', {
      name: /edit tags/i,
    });
    fireEvent.click(editTagsButton);

    const cancelButton = screen.getByRole('button', {
      name: /cancel/i,
    });
    fireEvent.click(cancelButton);

    // Not show delete tag buttons
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();

    // Not show add a tag select
    expect(screen.queryByText(/add a tag/i)).not.toBeInTheDocument();

    // Not show cancel button
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();

    // Not show save button
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
  });

  it('should change to read mode when click on `Cancel` on component variant', async () => {
    renderDrawer(stagedTagsId, { variant: 'component' });
    expect(await screen.findByText('Taxonomy 1')).toBeInTheDocument();
    const manageTagsButton = screen.getByRole('button', {
      name: /manage tags/i,
    });
    fireEvent.click(manageTagsButton);

    const cancelButton = screen.getByRole('button', {
      name: /cancel/i,
    });
    fireEvent.click(cancelButton);

    // Not show delete tag buttons
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();

    // Not show add a tag select
    expect(screen.queryByText(/add a tag/i)).not.toBeInTheDocument();

    // Not show cancel button
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();

    // Not show save button
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
  });

  test.each([
    {
      variant: 'drawer',
      editButton: /edit tags/i,
    },
    {
      variant: 'component',
      editButton: /manage tags/i,
    },
  ])(
    'should hide "$editButton" button on $variant variant if not allowed to tag object',
    async ({ variant, editButton }) => {
      renderDrawer(stagedTagsId, { variant, readOnly: true });
      expect(await screen.findByText('Taxonomy 1')).toBeInTheDocument();

      expect(screen.queryByRole('button', { name: editButton })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
      expect(screen.queryByText(/add a tag/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
    },
  );

  it('should test adding a content tag to the staged tags for a taxonomy', async () => {
    renderDrawer(stagedTagsId);
    expect(await screen.findByText('Taxonomy 1')).toBeInTheDocument();

    // To edit mode
    const editTagsButton = screen.getByRole('button', {
      name: /edit tags/i,
    });
    fireEvent.click(editTagsButton);

    // Click on "Add a tag" button to open dropdown
    const addTagsButton = screen.getByText(messages.collapsibleAddTagsPlaceholderText.defaultMessage);
    // Use `mouseDown` instead of `click` since the react-select didn't respond to `click`
    fireEvent.mouseDown(addTagsButton);

    // Tag 3 should only appear in dropdown selector, (i.e. the dropdown is open, since Tag 3 is not applied)
    expect((await screen.findAllByText('Tag 3')).length).toBe(1);

    // Click to check Tag 3
    const tag3 = screen.getByText('Tag 3');
    fireEvent.click(tag3);

    // Check that Tag 3 has been staged, i.e. there should be 2 of them on the page
    expect(screen.getAllByText('Tag 3').length).toBe(2);
  });

  it('should test removing a staged content from a taxonomy', async () => {
    renderDrawer(stagedTagsId);
    expect(await screen.findByText('Taxonomy 1')).toBeInTheDocument();

    // To edit mode
    const editTagsButton = screen.getByRole('button', {
      name: /edit tags/i,
    });
    fireEvent.click(editTagsButton);

    // Click on "Add a tag" button to open dropdown
    const addTagsButton = screen.getByText(messages.collapsibleAddTagsPlaceholderText.defaultMessage);
    // Use `mouseDown` instead of `click` since the react-select didn't respond to `click`
    fireEvent.mouseDown(addTagsButton);

    // Tag 3 should only appear in dropdown selector, (i.e. the dropdown is open, since Tag 3 is not applied)
    expect((await screen.findAllByText('Tag 3')).length).toBe(1);

    // Click to check Tag 3
    const tag3 = screen.getByText('Tag 3');
    fireEvent.click(tag3);

    // Check that Tag 3 has been staged, i.e. there should be 2 of them on the page
    expect(screen.getAllByText('Tag 3').length).toBe(2);

    // Click it again to unstage it and confirm that there is only one on the page
    fireEvent.click(tag3);
    expect(screen.getAllByText('Tag 3').length).toBe(1);
  });

  it('should test clearing staged tags for a taxonomy', async () => {
    const {
      container,
    } = renderDrawer(stagedTagsId);
    expect(await screen.findByText('Taxonomy 1')).toBeInTheDocument();

    // To edit mode
    const editTagsButton = screen.getByRole('button', {
      name: /edit tags/i,
    });
    fireEvent.click(editTagsButton);

    // Click on "Add a tag" button to open dropdown
    const addTagsButton = screen.getByText(/add a tag/i);
    // Use `mouseDown` instead of `click` since the react-select didn't respond to `click`
    fireEvent.mouseDown(addTagsButton);

    // Tag 3 should only appear in dropdown selector, (i.e. the dropdown is open, since Tag 3 is not applied)
    expect((await screen.findAllByText('Tag 3')).length).toBe(1);

    // Click to check Tag 3
    const tag3 = screen.getByText('Tag 3');
    fireEvent.click(tag3);

    // Check that Tag 3 has been staged, i.e. there should be 2 of them on the page
    expect(screen.getAllByText('Tag 3').length).toBe(2);

    const dropdown = container.querySelector('#content-tags-drawer > div:nth-child(1) > div');
    const dropdownCancel = within(dropdown).getByRole('button', { name: /cancel/i });
    fireEvent.click(dropdownCancel);

    // Check that there are no more Tag 3 on the page, since the staged one is cleared
    // and the dropdown has been closed
    expect(screen.queryByText('Tag 3')).not.toBeInTheDocument();
  });

  it('should test adding global staged tags and cancel', async () => {
    renderDrawer(stagedTagsId);
    expect(await screen.findByText('Taxonomy 1')).toBeInTheDocument();

    // To edit mode
    const editTagsButton = screen.getByRole('button', {
      name: /edit tags/i,
    });
    fireEvent.click(editTagsButton);

    // Click on "Add a tag" button to open dropdown
    const addTagsButton = screen.getByText(/add a tag/i);
    // Use `mouseDown` instead of `click` since the react-select didn't respond to `click`
    fireEvent.mouseDown(addTagsButton);

    // Click to check Tag 3
    const tag3 = await screen.findByText(/tag 3/i);
    fireEvent.click(tag3);

    // Click "Add tags" to save to global staged tags
    const addTags = screen.getByRole('button', { name: /add tags/i });
    fireEvent.click(addTags);

    expect(screen.getByText(/tag 3/i)).toBeInTheDocument();

    // Click "Cancel"
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(screen.queryByText(/tag 3/i)).not.toBeInTheDocument();
  });

  it('should test delete fetched tags and cancel', async () => {
    renderDrawer(stagedTagsId);
    expect(await screen.findByText('Taxonomy 1')).toBeInTheDocument();

    // To edit mode
    const editTagsButton = screen.getByRole('button', {
      name: /edit tags/i,
    });
    fireEvent.click(editTagsButton);

    // Delete the tag
    const tag = await screen.findByText(/tag 2/i);
    const deleteButton = within(tag).getByRole('button', {
      name: /delete/i,
    });
    fireEvent.click(deleteButton);

    expect(tag).not.toBeInTheDocument();

    // Click "Cancel"
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(screen.getByText(/tag 2/i)).toBeInTheDocument();
  });

  it('should test delete global staged tags and cancel', async () => {
    renderDrawer(stagedTagsId);
    expect(await screen.findByText('Taxonomy 1')).toBeInTheDocument();

    // To edit mode
    const editTagsButton = screen.getByRole('button', {
      name: /edit tags/i,
    });
    fireEvent.click(editTagsButton);

    // Click on "Add a tag" button to open dropdown
    const addTagsButton = screen.getByText(/add a tag/i);
    // Use `mouseDown` instead of `click` since the react-select didn't respond to `click`
    fireEvent.mouseDown(addTagsButton);

    // Click to check Tag 3
    const tag3 = await screen.findByText(/tag 3/i);
    fireEvent.click(tag3);

    // Click "Add tags" to save to global staged tags
    const addTags = screen.getByRole('button', { name: /add tags/i });
    fireEvent.click(addTags);

    const tag = screen.getByText(/tag 3/i);
    expect(screen.getByText(/tag 3/i)).toBeInTheDocument();

    // Delete the tag
    const deleteButton = within(tag).getByRole('button', {
      name: /delete/i,
    });
    fireEvent.click(deleteButton);

    expect(tag).not.toBeInTheDocument();

    // Click "Cancel"
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(screen.queryByText(/tag 3/i)).not.toBeInTheDocument();
  });

  it('should test add removed fetched tags and cancel', async () => {
    renderDrawer(stagedTagsId);
    expect(await screen.findByText('Taxonomy 1')).toBeInTheDocument();

    // To edit mode
    const editTagsButton = screen.getByRole('button', {
      name: /edit tags/i,
    });
    fireEvent.click(editTagsButton);

    // Delete the tag
    const tag = await screen.findByText(/tag 2/i);
    const deleteButton = within(tag).getByRole('button', {
      name: /delete/i,
    });
    fireEvent.click(deleteButton);

    expect(tag).not.toBeInTheDocument();

    // Click on "Add a tag" button to open dropdown
    const addTagsButton = screen.getByText(/add a tag/i);
    // Use `mouseDown` instead of `click` since the react-select didn't respond to `click`
    fireEvent.mouseDown(addTagsButton);

    // Click to check Tag 2
    const tag2 = await screen.findByText(/tag 2/i);
    fireEvent.click(tag2);

    // Click "Add tags" to save to global staged tags
    const addTags = screen.getByRole('button', { name: /add tags/i });
    fireEvent.click(addTags);

    expect(screen.getByText(/tag 2/i)).toBeInTheDocument();

    // Click "Cancel"
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(screen.getByText(/tag 2/i)).toBeInTheDocument();
  });

  it('should call onClose when cancel is clicked', async () => {
    renderDrawer(stagedTagsId, { onClose: mockOnClose });

    const cancelButton = await screen.findByRole('button', {
      name: /close/i,
    });
    expect(cancelButton).toBeInTheDocument();
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call closeManageTagsDrawer when Escape key is pressed and no selectable box is active', () => {
    const postMessageSpy = jest.spyOn(window.parent, 'postMessage');

    const { container } = renderDrawer(stagedTagsId);

    fireEvent.keyDown(container, {
      key: 'Escape',
    });

    expect(postMessageSpy).toHaveBeenCalledWith('closeManageTagsDrawer', '*');

    postMessageSpy.mockRestore();
  });

  it('should call `onClose` when Escape key is pressed and no selectable box is active', () => {
    const { container } = renderDrawer(stagedTagsId, { onClose: mockOnClose });

    fireEvent.keyDown(container, {
      key: 'Escape',
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should not call closeManageTagsDrawer when Escape key is pressed and a selectable box is active', () => {
    const postMessageSpy = jest.spyOn(window.parent, 'postMessage');

    const { container } = renderDrawer(stagedTagsId);

    // Simulate that the selectable box is open by adding an element with the data attribute
    const selectableBox = document.createElement('div');
    selectableBox.setAttribute('data-selectable-box', 'taxonomy-tags');
    document.body.appendChild(selectableBox);

    fireEvent.keyDown(container, {
      key: 'Escape',
    });

    expect(postMessageSpy).not.toHaveBeenCalled();

    // Remove the added element
    document.body.removeChild(selectableBox);

    postMessageSpy.mockRestore();
  });

  it('should not call `onClose` when Escape key is pressed and a selectable box is active', () => {
    const { container } = renderDrawer(stagedTagsId, { onClose: mockOnClose });

    // Simulate that the selectable box is open by adding an element with the data attribute
    const selectableBox = document.createElement('div');
    selectableBox.setAttribute('data-selectable-box', 'taxonomy-tags');
    document.body.appendChild(selectableBox);

    fireEvent.keyDown(container, {
      key: 'Escape',
    });

    expect(mockOnClose).not.toHaveBeenCalled();

    // Remove the added element
    document.body.removeChild(selectableBox);
  });

  it('should not call closeManageTagsDrawer when Escape key is pressed and container is blocked', () => {
    const postMessageSpy = jest.spyOn(window.parent, 'postMessage');
    const { container } = renderDrawer(stagedTagsId, { blockingSheet: true });
    fireEvent.keyDown(container, {
      key: 'Escape',
    });

    expect(postMessageSpy).not.toHaveBeenCalled();

    postMessageSpy.mockRestore();
  });

  it('should not call `onClose` when Escape key is pressed and container is blocked', () => {
    const { container } = renderDrawer(stagedTagsId, {
      blockingSheet: true,
      onClose: mockOnClose,
    });
    fireEvent.keyDown(container, {
      key: 'Escape',
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should call `setBlockingSheet` on add a tag', async () => {
    renderDrawer(stagedTagsId, {
      blockingSheet: true,
      setBlockingSheet: mockSetBlockingSheet,
    });
    expect(await screen.findByText('Taxonomy 1')).toBeInTheDocument();

    expect(mockSetBlockingSheet).toHaveBeenCalledWith(false);

    // To edit mode
    const editTagsButton = screen.getByRole('button', {
      name: /edit tags/i,
    });
    fireEvent.click(editTagsButton);

    // Click on "Add a tag" button to open dropdown
    const addTagsButton = screen.getByText(/add a tag/i);
    // Use `mouseDown` instead of `click` since the react-select didn't respond to `click`
    fireEvent.mouseDown(addTagsButton);

    // Click to check Tag 3
    const tag3 = await screen.findByText(/tag 3/i);
    fireEvent.click(tag3);

    // Click "Add tags" to save to global staged tags
    const addTags = screen.getByRole('button', { name: /add tags/i });
    fireEvent.click(addTags);

    expect(mockSetBlockingSheet).toHaveBeenCalledWith(true);
  });

  it('should call `setBlockingSheet` on delete a tag', async () => {
    renderDrawer(stagedTagsId, {
      blockingSheet: true,
      setBlockingSheet: mockSetBlockingSheet,
    });
    expect(await screen.findByText('Taxonomy 1')).toBeInTheDocument();

    expect(mockSetBlockingSheet).toHaveBeenCalledWith(false);

    // To edit mode
    const editTagsButton = screen.getByRole('button', {
      name: /edit tags/i,
    });
    fireEvent.click(editTagsButton);

    // Delete the tag
    const tag = screen.getByText(/tag 2/i);
    const deleteButton = within(tag).getByRole('button', {
      name: /delete/i,
    });
    fireEvent.click(deleteButton);

    expect(mockSetBlockingSheet).toHaveBeenCalledWith(true);
  });

  it('should call `updateTags` mutation on save', async () => {
    const { axiosMock } = initializeMocks();
    const url = getContentTaxonomyTagsApiUrl(stagedTagsId);
    axiosMock.onPut(url).reply(200);
    renderDrawer(stagedTagsId);
    expect(await screen.findByText('Taxonomy 1')).toBeInTheDocument();
    const editTagsButton = screen.getByRole('button', {
      name: /edit tags/i,
    });
    fireEvent.click(editTagsButton);

    const saveButton = screen.getByRole('button', {
      name: /save/i,
    });
    fireEvent.click(saveButton);

    await waitFor(() => expect(axiosMock.history.put[0].url).toEqual(url));
  });

  it('should taxonomies must be ordered', async () => {
    renderDrawer(largeTagsId);
    expect(await screen.findByText('Taxonomy 1')).toBeInTheDocument();

    // First, taxonomies with content sorted by count implicit
    // Later, empty taxonomies sorted by name
    const expectedOrder = [
      'Taxonomy 3', // 3 tags
      'Taxonomy 1', // 2 tags
      'Taxonomy 2', // 1 tag
      '(A) Taxonomy 5',
      '(B) Taxonomy 4',
    ];

    const taxonomies = screen.getAllByText(/.*Taxonomy.*/);
    for (let i = 0; i !== taxonomies.length; i++) {
      expect(taxonomies[i].textContent).toBe(expectedOrder[i]);
    }
  });

  it('should not show "Other tags" section', async () => {
    renderDrawer(stagedTagsId);
    expect(await screen.findByText('Taxonomy 1')).toBeInTheDocument();

    expect(screen.queryByText('Other tags')).not.toBeInTheDocument();
  });

  it('should show "Other tags" section', async () => {
    renderDrawer(otherTagsId);
    expect(await screen.findByText('Taxonomy 1')).toBeInTheDocument();

    expect(screen.getByText('Other tags')).toBeInTheDocument();
    expect(screen.getByText('Taxonomy 2')).toBeInTheDocument();
    expect(screen.getByText('Tag 3')).toBeInTheDocument();
    expect(screen.getByText('Tag 4')).toBeInTheDocument();
  });

  it('should test delete "Other tags" and cancel', async () => {
    renderDrawer(otherTagsId);
    expect(await screen.findByText('Taxonomy 2')).toBeInTheDocument();

    // To edit mode
    const editTagsButton = screen.getByRole('button', {
      name: /edit tags/i,
    });
    fireEvent.click(editTagsButton);

    // Delete the tag
    const tag = screen.getByText(/tag 3/i);
    const deleteButton = within(tag).getByRole('button', {
      name: /delete/i,
    });
    fireEvent.click(deleteButton);

    expect(tag).not.toBeInTheDocument();

    // Click "Cancel"
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(screen.getByText(/tag 3/i)).toBeInTheDocument();
  });

  it('should show Language Taxonomy', async () => {
    renderDrawer(languageWithTagsId);
    expect(await screen.findByText('Languages')).toBeInTheDocument();
  });

  it('should hide Language Taxonomy', async () => {
    renderDrawer(languageWithoutTagsId);
    expect(await screen.findByText('Taxonomy 1')).toBeInTheDocument();
    expect(screen.queryByText('Languages')).not.toBeInTheDocument();
  });

  it('should show empty drawer message', async () => {
    renderDrawer(emptyTagsId);
    expect(await screen.findByText(/to use tags, please or contact your administrator\./i)).toBeInTheDocument();
    const enableButton = screen.getByRole('button', {
      name: /enable a taxonomy/i,
    });
    fireEvent.click(enableButton);
    expect(mockNavigate).toHaveBeenCalledWith('/taxonomies');
  });
});
