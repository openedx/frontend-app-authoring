import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  waitFor,
  screen,
} from '@testing-library/react';

import ContentTagsDrawer from './ContentTagsDrawer';
import {
  useContentTaxonomyTagsData,
  useContentData,
  useTaxonomyTagsData,
} from './data/apiHooks';
import { getTaxonomyListData } from '../taxonomy/data/api';
import messages from './messages';

const contentId = 'block-v1:SampleTaxonomyOrg1+STC1+2023_1+type@vertical+block@7f47fe2dbcaf47c5a071671c741fe1ab';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({
    contentId,
  }),
}));

// FIXME: replace these mocks with API mocks
jest.mock('./data/apiHooks', () => ({
  useContentTaxonomyTagsData: jest.fn(() => ({
    isSuccess: false,
    data: {},
  })),
  useContentData: jest.fn(() => ({
    isSuccess: false,
    data: {},
  })),
  useContentTaxonomyTagsUpdater: jest.fn(() => ({
    isError: false,
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
  <IntlProvider locale="en" messages={{}}>
    <QueryClientProvider client={queryClient}>
      <ContentTagsDrawer {...params} />
    </QueryClientProvider>
  </IntlProvider>
);

describe('<ContentTagsDrawer />', () => {
  beforeEach(async () => {
    await queryClient.resetQueries();
    // By default, we mock the API call with a promise that never resolves.
    // You can override this in specific test.
    getTaxonomyListData.mockReturnValue(new Promise(() => {}));
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
      results: [{
        id: 123,
        name: 'Taxonomy 1',
        description: 'This is a description 1',
        canTagObject: true,
      }],
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
      const tagCountBadges = container.getElementsByClassName('badge');
      expect(tagCountBadges[0].textContent).toBe('2');
      expect(tagCountBadges[1].textContent).toBe('1');
    });
  });

  it('should test adding a content tag to the staged tags for a taxonomy', async () => {
    setupMockDataForStagedTagsTesting();

    const { container, getByText, getAllByText } = render(<RootWrapper />);
    await waitFor(() => { expect(getByText('Taxonomy 1')).toBeInTheDocument(); });

    // Expand the Taxonomy to view applied tags and "Add a tag" button
    const expandToggle = container.getElementsByClassName('collapsible-trigger')[0];

    fireEvent.click(expandToggle);

    // Click on "Add a tag" button to open dropdown
    const addTagsButton = getByText(messages.collapsibleAddTagsPlaceholderText.defaultMessage);
    // Use `mouseDown` instead of `click` since the react-select didn't respond to `click`
    fireEvent.mouseDown(addTagsButton);

    // Tag 3 should only appear in dropdown selector, (i.e. the dropdown is open, since Tag 3 is not applied)
    expect(getAllByText('Tag 3').length).toBe(1);

    // Click to check Tag 3
    const tag3 = getByText('Tag 3');
    fireEvent.click(tag3);

    // Check that Tag 3 has been staged, i.e. there should be 2 of them on the page
    expect(getAllByText('Tag 3').length).toBe(2);
  });

  it('should test removing a staged content from a taxonomy', async () => {
    setupMockDataForStagedTagsTesting();

    const { container, getByText, getAllByText } = render(<RootWrapper />);
    await waitFor(() => { expect(getByText('Taxonomy 1')).toBeInTheDocument(); });

    // Expand the Taxonomy to view applied tags and "Add a tag" button
    const expandToggle = container.getElementsByClassName('collapsible-trigger')[0];

    fireEvent.click(expandToggle);

    // Click on "Add a tag" button to open dropdown
    const addTagsButton = getByText(messages.collapsibleAddTagsPlaceholderText.defaultMessage);
    // Use `mouseDown` instead of `click` since the react-select didn't respond to `click`
    fireEvent.mouseDown(addTagsButton);

    // Tag 3 should only appear in dropdown selector, (i.e. the dropdown is open, since Tag 3 is not applied)
    expect(getAllByText('Tag 3').length).toBe(1);

    // Click to check Tag 3
    const tag3 = getByText('Tag 3');
    fireEvent.click(tag3);

    // Check that Tag 3 has been staged, i.e. there should be 2 of them on the page
    expect(getAllByText('Tag 3').length).toBe(2);

    // Click it again to unstage it and confirm that there is only one on the page
    fireEvent.click(tag3);
    expect(getAllByText('Tag 3').length).toBe(1);
  });

  it('should test clearing staged tags for a taxonomy', async () => {
    setupMockDataForStagedTagsTesting();

    const {
      container,
      getByText,
      getAllByText,
      queryByText,
    } = render(<RootWrapper />);
    await waitFor(() => { expect(getByText('Taxonomy 1')).toBeInTheDocument(); });

    // Expand the Taxonomy to view applied tags and "Add a tag" button
    const expandToggle = container.getElementsByClassName('collapsible-trigger')[0];

    fireEvent.click(expandToggle);

    // Click on "Add a tag" button to open dropdown
    const addTagsButton = getByText(messages.collapsibleAddTagsPlaceholderText.defaultMessage);
    // Use `mouseDown` instead of `click` since the react-select didn't respond to `click`
    fireEvent.mouseDown(addTagsButton);

    // Tag 3 should only appear in dropdown selector, (i.e. the dropdown is open, since Tag 3 is not applied)
    expect(getAllByText('Tag 3').length).toBe(1);

    // Click to check Tag 3
    const tag3 = getByText('Tag 3');
    fireEvent.click(tag3);

    // Check that Tag 3 has been staged, i.e. there should be 2 of them on the page
    expect(getAllByText('Tag 3').length).toBe(2);

    // Click on the Cancel button in the dropdown to clear the staged tags
    const dropdownCancel = getByText(messages.collapsibleCancelStagedTagsButtonText.defaultMessage);
    fireEvent.click(dropdownCancel);

    // Check that there are no more Tag 3 on the page, since the staged one is cleared
    // and the dropdown has been closed
    expect(queryByText('Tag 3')).not.toBeInTheDocument();
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
});
