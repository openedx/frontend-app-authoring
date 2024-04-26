import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  waitFor,
  screen,
  within,
} from '@testing-library/react';

import ContentTagsDrawer from './ContentTagsDrawer';
import {
  useContentTaxonomyTagsData,
  useContentData,
  useTaxonomyTagsData,
  useContentTaxonomyTagsUpdater,
} from './data/apiHooks';
import { getTaxonomyListData } from '../taxonomy/data/api';
import messages from './messages';
import { ContentTagsDrawerSheetContext } from './common/context';

const contentId = 'block-v1:SampleTaxonomyOrg1+STC1+2023_1+type@vertical+block@7f47fe2dbcaf47c5a071671c741fe1ab';
const mockOnClose = jest.fn();
const mockMutate = jest.fn();
const mockSetBlockingSheet = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    contentId,
  }),
}));

// FIXME: replace these mocks with API mocks
jest.mock('./data/apiHooks', () => ({
  useContentTaxonomyTagsData: jest.fn(() => {}),
  useContentData: jest.fn(() => ({
    isSuccess: false,
    data: {},
  })),
  useContentTaxonomyTagsUpdater: jest.fn(() => ({
    isError: false,
    mutate: mockMutate,
  })),
  useTaxonomyTagsData: jest.fn(() => ({
    hasMorePages: false,
    tagPages: {
      isLoading: true,
      isError: false,
      canAddTag: false,
      data: [],
    },
  })),
}));

jest.mock('../taxonomy/data/api', () => ({
  // By default, the mock taxonomy list will never load (promise never resolves):
  getTaxonomyListData: jest.fn(),
}));

const queryClient = new QueryClient();

const RootWrapper = (params) => (
  <ContentTagsDrawerSheetContext.Provider value={params}>
    <IntlProvider locale="en" messages={{}}>
      <QueryClientProvider client={queryClient}>
        <ContentTagsDrawer {...params} />
      </QueryClientProvider>
    </IntlProvider>
  </ContentTagsDrawerSheetContext.Provider>
);

describe('<ContentTagsDrawer />', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await queryClient.resetQueries();
    // By default, we mock the API call with a promise that never resolves.
    // You can override this in specific test.
    getTaxonomyListData.mockReturnValue(new Promise(() => {}));
    useContentTaxonomyTagsUpdater.mockReturnValue({
      isError: false,
      mutate: mockMutate,
    });
  });

  const setupMockDataForStagedTagsTesting = () => {
    useContentTaxonomyTagsData.mockReturnValue({
      isSuccess: true,
      data: {
        taxonomies: [
          {
            name: 'Taxonomy 1',
            taxonomyId: 123,
            canTagObject: true,
            tags: [
              {
                value: 'Tag 1',
                lineage: ['Tag 1'],
                canDeleteObjecttag: true,
              },
              {
                value: 'Tag 2',
                lineage: ['Tag 2'],
                canDeleteObjecttag: true,
              },
            ],
          },
        ],
      },
    });
    getTaxonomyListData.mockResolvedValue({
      results: [
        {
          id: 123,
          name: 'Taxonomy 1',
          description: 'This is a description 1',
          canTagObject: true,
        },
      ],
    });

    useTaxonomyTagsData.mockReturnValue({
      hasMorePages: false,
      canAddTag: false,
      tagPages: {
        isLoading: false,
        isError: false,
        data: [{
          value: 'Tag 1',
          externalId: null,
          childCount: 0,
          depth: 0,
          parentValue: null,
          id: 12345,
          subTagsUrl: null,
          canChangeTag: false,
          canDeleteTag: false,
        }, {
          value: 'Tag 2',
          externalId: null,
          childCount: 0,
          depth: 0,
          parentValue: null,
          id: 12346,
          subTagsUrl: null,
          canChangeTag: false,
          canDeleteTag: false,
        }, {
          value: 'Tag 3',
          externalId: null,
          childCount: 0,
          depth: 0,
          parentValue: null,
          id: 12347,
          subTagsUrl: null,
          canChangeTag: false,
          canDeleteTag: false,
        }],
      },
    });
  };

  const setupLargeMockDataForStagedTagsTesting = () => {
    useContentTaxonomyTagsData.mockReturnValue({
      isSuccess: true,
      data: {
        taxonomies: [
          {
            name: 'Taxonomy 1',
            taxonomyId: 123,
            canTagObject: true,
            tags: [
              {
                value: 'Tag 1',
                lineage: ['Tag 1'],
                canDeleteObjecttag: true,
              },
              {
                value: 'Tag 2',
                lineage: ['Tag 2'],
                canDeleteObjecttag: true,
              },
            ],
          },
          {
            name: 'Taxonomy 2',
            taxonomyId: 124,
            canTagObject: true,
            tags: [
              {
                value: 'Tag 1',
                lineage: ['Tag 1'],
                canDeleteObjecttag: true,
              },
            ],
          },
          {
            name: 'Taxonomy 3',
            taxonomyId: 125,
            canTagObject: true,
            tags: [
              {
                value: 'Tag 1.1.1',
                lineage: ['Tag 1', 'Tag 1.1', 'Tag 1.1.1'],
                canDeleteObjecttag: true,
              },
            ],
          },
          {
            name: '(B) Taxonomy 4',
            taxonomyId: 126,
            canTagObject: true,
            tags: [],
          },
          {
            name: '(A) Taxonomy 5',
            taxonomyId: 127,
            canTagObject: true,
            tags: [],
          },
        ],
      },
    });
    getTaxonomyListData.mockResolvedValue({
      results: [
        {
          id: 123,
          name: 'Taxonomy 1',
          description: 'This is a description 1',
          canTagObject: true,
        },
        {
          id: 124,
          name: 'Taxonomy 2',
          description: 'This is a description 2',
          canTagObject: true,
        },
        {
          id: 125,
          name: 'Taxonomy 3',
          description: 'This is a description 3',
          canTagObject: true,
        },
        {
          id: 127,
          name: '(A) Taxonomy 5',
          description: 'This is a description 5',
          canTagObject: true,
        },
        {
          id: 126,
          name: '(B) Taxonomy 4',
          description: 'This is a description 4',
          canTagObject: true,
        },
      ],
    });

    useTaxonomyTagsData.mockReturnValue({
      hasMorePages: false,
      canAddTag: false,
      tagPages: {
        isLoading: false,
        isError: false,
        data: [{
          value: 'Tag 1',
          externalId: null,
          childCount: 0,
          depth: 0,
          parentValue: null,
          id: 12345,
          subTagsUrl: null,
          canChangeTag: false,
          canDeleteTag: false,
        }, {
          value: 'Tag 2',
          externalId: null,
          childCount: 0,
          depth: 0,
          parentValue: null,
          id: 12346,
          subTagsUrl: null,
          canChangeTag: false,
          canDeleteTag: false,
        }, {
          value: 'Tag 3',
          externalId: null,
          childCount: 0,
          depth: 0,
          parentValue: null,
          id: 12347,
          subTagsUrl: null,
          canChangeTag: false,
          canDeleteTag: false,
        }],
      },
    });
  };

  it('should render page and page title correctly', () => {
    setupMockDataForStagedTagsTesting();
    const { getByText } = render(<RootWrapper />);
    expect(getByText('Manage tags')).toBeInTheDocument();
  });

  it('shows spinner before the content data query is complete', async () => {
    await act(async () => {
      const { getAllByRole } = render(<RootWrapper />);
      const spinner = getAllByRole('status')[0];
      expect(spinner.textContent).toEqual('Loading'); // Uses <Spinner />
    });
  });

  it('shows spinner before the taxonomy tags query is complete', async () => {
    await act(async () => {
      const { getAllByRole } = render(<RootWrapper />);
      const spinner = getAllByRole('status')[1];
      expect(spinner.textContent).toEqual('Loading...'); // Uses <Loading />
    });
  });

  it('shows the content display name after the query is complete', async () => {
    useContentData.mockReturnValue({
      isSuccess: true,
      data: {
        displayName: 'Unit 1',
      },
    });
    await act(async () => {
      const { getByText } = render(<RootWrapper />);
      expect(getByText('Unit 1')).toBeInTheDocument();
    });
  });

  it('shows content using params', async () => {
    useContentData.mockReturnValue({
      isSuccess: true,
      data: {
        displayName: 'Unit 1',
      },
    });
    render(<RootWrapper id={contentId} />);
    expect(screen.getByText('Unit 1')).toBeInTheDocument();
  });

  it('shows the taxonomies data including tag numbers after the query is complete', async () => {
    useContentTaxonomyTagsData.mockReturnValue({
      isSuccess: true,
      data: {
        taxonomies: [
          {
            name: 'Taxonomy 1',
            taxonomyId: 123,
            canTagObject: true,
            tags: [
              {
                value: 'Tag 1',
                lineage: ['Tag 1'],
                canDeleteObjecttag: true,
              },
              {
                value: 'Tag 2',
                lineage: ['Tag 2'],
                canDeleteObjecttag: true,
              },
            ],
          },
          {
            name: 'Taxonomy 2',
            taxonomyId: 124,
            canTagObject: true,
            tags: [
              {
                value: 'Tag 3',
                lineage: ['Tag 3'],
                canDeleteObjecttag: true,
              },
            ],
          },
        ],
      },
    });
    getTaxonomyListData.mockResolvedValue({
      results: [{
        id: 123,
        name: 'Taxonomy 1',
        description: 'This is a description 1',
        canTagObject: false,
      }, {
        id: 124,
        name: 'Taxonomy 2',
        description: 'This is a description 2',
        canTagObject: false,
      }],
    });
    await act(async () => {
      const { container, getByText } = render(<RootWrapper />);
      await waitFor(() => { expect(getByText('Taxonomy 1')).toBeInTheDocument(); });
      expect(getByText('Taxonomy 1')).toBeInTheDocument();
      expect(getByText('Taxonomy 2')).toBeInTheDocument();
      const tagCountBadges = container.getElementsByClassName('taxonomy-tags-count-chip');
      expect(tagCountBadges[0].textContent).toBe('2');
      expect(tagCountBadges[1].textContent).toBe('1');
    });
  });

  it('should be read only on first render', async () => {
    setupMockDataForStagedTagsTesting();
    render(<RootWrapper />);
    expect(await screen.findByText('Taxonomy 1')).toBeInTheDocument();

    // Not show delete tag buttons
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();

    // Not show add a tag select
    expect(screen.queryByText(/add a tag/i)).not.toBeInTheDocument();

    // Not show cancel button
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();

    // Not show save button
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
  });

  it('should change to edit mode when click on `Edit tags`', async () => {
    setupMockDataForStagedTagsTesting();
    render(<RootWrapper />);
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

  it('should change to read mode when click on `Cancel`', async () => {
    setupMockDataForStagedTagsTesting();
    render(<RootWrapper />);
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

  it('shows spinner when loading commit tags', async () => {
    setupMockDataForStagedTagsTesting();
    useContentTaxonomyTagsUpdater.mockReturnValue({
      status: 'loading',
      isError: false,
      mutate: mockMutate,
    });
    render(<RootWrapper />);
    expect(await screen.findByText('Taxonomy 1')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should test adding a content tag to the staged tags for a taxonomy', async () => {
    setupMockDataForStagedTagsTesting();
    render(<RootWrapper />);
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
    expect(screen.getAllByText('Tag 3').length).toBe(1);

    // Click to check Tag 3
    const tag3 = screen.getByText('Tag 3');
    fireEvent.click(tag3);

    // Check that Tag 3 has been staged, i.e. there should be 2 of them on the page
    expect(screen.getAllByText('Tag 3').length).toBe(2);
  });

  it('should test removing a staged content from a taxonomy', async () => {
    setupMockDataForStagedTagsTesting();
    render(<RootWrapper />);
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
    expect(screen.getAllByText('Tag 3').length).toBe(1);

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
    setupMockDataForStagedTagsTesting();

    const {
      container,
    } = render(<RootWrapper />);
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
    expect(screen.getAllByText('Tag 3').length).toBe(1);

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
    setupMockDataForStagedTagsTesting();
    render(<RootWrapper />);
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
    const tag3 = screen.getByText(/tag 3/i);
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

  it('should test delete feched tags and cancel', async () => {
    setupMockDataForStagedTagsTesting();
    render(<RootWrapper />);
    expect(await screen.findByText('Taxonomy 1')).toBeInTheDocument();

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

    expect(tag).not.toBeInTheDocument();

    // Click "Cancel"
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(screen.getByText(/tag 2/i)).toBeInTheDocument();
  });

  it('should test delete global staged tags and cancel', async () => {
    setupMockDataForStagedTagsTesting();
    render(<RootWrapper />);
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
    const tag3 = screen.getByText(/tag 3/i);
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

  it('should test add removed feched tags and cancel', async () => {
    setupMockDataForStagedTagsTesting();
    render(<RootWrapper />);
    expect(await screen.findByText('Taxonomy 1')).toBeInTheDocument();

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

    expect(tag).not.toBeInTheDocument();

    // Click on "Add a tag" button to open dropdown
    const addTagsButton = screen.getByText(/add a tag/i);
    // Use `mouseDown` instead of `click` since the react-select didn't respond to `click`
    fireEvent.mouseDown(addTagsButton);

    // Click to check Tag 2
    const tag2 = screen.getByText(/tag 2/i);
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
    setupMockDataForStagedTagsTesting();
    render(<RootWrapper onClose={mockOnClose} />);

    const cancelButton = await screen.findByRole('button', {
      name: /close/i,
    });
    expect(cancelButton).toBeInTheDocument();
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call closeManageTagsDrawer when Escape key is pressed and no selectable box is active', () => {
    const postMessageSpy = jest.spyOn(window.parent, 'postMessage');

    const { container } = render(<RootWrapper />);

    fireEvent.keyDown(container, {
      key: 'Escape',
    });

    expect(postMessageSpy).toHaveBeenCalledWith('closeManageTagsDrawer', '*');

    postMessageSpy.mockRestore();
  });

  it('should call `onClose` when Escape key is pressed and no selectable box is active', () => {
    const { container } = render(<RootWrapper onClose={mockOnClose} />);

    fireEvent.keyDown(container, {
      key: 'Escape',
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should not call closeManageTagsDrawer when Escape key is pressed and a selectable box is active', () => {
    const postMessageSpy = jest.spyOn(window.parent, 'postMessage');

    const { container } = render(<RootWrapper />);

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
    const { container } = render(<RootWrapper onClose={mockOnClose} />);

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

    const { container } = render(<RootWrapper blockingSheet />);
    fireEvent.keyDown(container, {
      key: 'Escape',
    });

    expect(postMessageSpy).not.toHaveBeenCalled();

    postMessageSpy.mockRestore();
  });

  it('should not call `onClose` when Escape key is pressed and container is blocked', () => {
    const { container } = render(<RootWrapper blockingSheet onClose={mockOnClose} />);
    fireEvent.keyDown(container, {
      key: 'Escape',
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('should call `setBlockingSheet` on add a tag', async () => {
    setupMockDataForStagedTagsTesting();
    render(<RootWrapper blockingSheet setBlockingSheet={mockSetBlockingSheet} />);
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
    const tag3 = screen.getByText(/tag 3/i);
    fireEvent.click(tag3);

    // Click "Add tags" to save to global staged tags
    const addTags = screen.getByRole('button', { name: /add tags/i });
    fireEvent.click(addTags);

    expect(mockSetBlockingSheet).toHaveBeenCalledWith(true);
  });

  it('should call `setBlockingSheet` on delete a tag', async () => {
    setupMockDataForStagedTagsTesting();
    render(<RootWrapper blockingSheet setBlockingSheet={mockSetBlockingSheet} />);
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
    setupMockDataForStagedTagsTesting();
    render(<RootWrapper />);
    expect(await screen.findByText('Taxonomy 1')).toBeInTheDocument();
    const editTagsButton = screen.getByRole('button', {
      name: /edit tags/i,
    });
    fireEvent.click(editTagsButton);

    const saveButton = screen.getByRole('button', {
      name: /save/i,
    });
    fireEvent.click(saveButton);

    expect(mockMutate).toHaveBeenCalled();
  });

  it('should taxonomies must be ordered', async () => {
    setupLargeMockDataForStagedTagsTesting();
    render(<RootWrapper />);
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
});
