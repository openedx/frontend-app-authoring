import React from 'react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import {
  act,
  render,
  fireEvent,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ContentTagsCollapsible from './ContentTagsCollapsible';
import messages from './messages';
import { useTaxonomyTagsData } from './data/apiHooks';

jest.mock('./data/apiHooks', () => ({
  useContentTaxonomyTagsUpdater: jest.fn(() => ({
    isError: false,
    mutate: jest.fn(),
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

const data = {
  contentId: 'block-v1:SampleTaxonomyOrg1+STC1+2023_1+type@vertical+block@7f47fe2dbcaf47c5a071671c741fe1ab',
  taxonomyAndTagsData: {
    id: 123,
    name: 'Taxonomy 1',
    canTagObject: true,
    contentTags: [
      {
        value: 'Tag 1',
        lineage: ['Tag 1'],
        canDeleteObjecttag: true,
      },
      {
        value: 'Tag 1.1',
        lineage: ['Tag 1', 'Tag 1.1'],
        canDeleteObjecttag: true,
      },
      {
        value: 'Tag 2',
        lineage: ['Tag 2'],
        canDeleteObjecttag: true,
      },
    ],
  },
};

const ContentTagsCollapsibleComponent = ({ contentId, taxonomyAndTagsData }) => (
  <IntlProvider locale="en" messages={{}}>
    <ContentTagsCollapsible contentId={contentId} taxonomyAndTagsData={taxonomyAndTagsData} />
  </IntlProvider>
);

ContentTagsCollapsibleComponent.propTypes = ContentTagsCollapsible.propTypes;

describe('<ContentTagsCollapsible />', () => {
  beforeAll(() => {
    jest.useFakeTimers(); // To account for debounce timer
  });

  afterAll(() => {
    jest.useRealTimers(); // Restore real timers after the tests
  });

  async function getComponent(updatedData) {
    const componentData = (!updatedData ? data : updatedData);

    return render(
      <ContentTagsCollapsibleComponent
        contentId={componentData.contentId}
        taxonomyAndTagsData={componentData.taxonomyAndTagsData}
      />,
    );
  }

  function setupTaxonomyMock() {
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
  }

  it('should render taxonomy tags data along content tags number badge', async () => {
    const { container, getByText } = await getComponent();
    expect(getByText('Taxonomy 1')).toBeInTheDocument();
    expect(container.getElementsByClassName('badge').length).toBe(1);
    expect(getByText('3')).toBeInTheDocument();
  });

  it('should render new tags as they are checked in the dropdown', async () => {
    setupTaxonomyMock();
    const { container, getByText, getAllByText } = await getComponent();

    // Expand the Taxonomy to view applied tags and "Add tags" button
    const expandToggle = container.getElementsByClassName('collapsible-trigger')[0];
    fireEvent.click(expandToggle);

    // Click on "Add tags" button to open dropdown to select new tags
    const addTagsButton = getByText(messages.addTagsButtonText.defaultMessage);
    fireEvent.click(addTagsButton);

    // Wait for the dropdown selector for tags to open,
    // Tag 3 should only appear there
    expect(getByText('Tag 3')).toBeInTheDocument();
    expect(getAllByText('Tag 3').length === 1);

    const tag3 = getByText('Tag 3');

    fireEvent.click(tag3);

    // After clicking on Tag 3, it should also appear in amongst
    // the tag bubbles in the tree
    expect(getAllByText('Tag 3').length === 2);
  });

  it('should remove tag when they are unchecked in the dropdown', async () => {
    setupTaxonomyMock();
    const { container, getByText, getAllByText } = await getComponent();

    // Expand the Taxonomy to view applied tags and "Add tags" button
    const expandToggle = container.getElementsByClassName('collapsible-trigger')[0];

    fireEvent.click(expandToggle);

    // Check that Tag 2 appears in tag bubbles
    expect(getByText('Tag 2')).toBeInTheDocument();

    // Click on "Add tags" button to open dropdown to select new tags
    const addTagsButton = getByText(messages.addTagsButtonText.defaultMessage);
    fireEvent.click(addTagsButton);

    // Wait for the dropdown selector for tags to open,
    // Tag 3 should only appear there, (i.e. the dropdown is open, since Tag 3 is not applied)
    expect(getByText('Tag 3')).toBeInTheDocument();

    // Get the Tag 2 checkbox and click on it
    const tag2 = getAllByText('Tag 2')[1];
    fireEvent.click(tag2);

    // After clicking on Tag 2, it should be removed from
    // the tag bubbles in so only the one in the dropdown appears
    expect(getAllByText('Tag 2').length === 1);
  });

  it('should handle search term change', async () => {
    const {
      container, getByText, getByRole, getByDisplayValue,
    } = await getComponent();

    // Expand the Taxonomy to view applied tags and "Add tags" button
    const expandToggle = container.getElementsByClassName('collapsible-trigger')[0];
    fireEvent.click(expandToggle);

    // Click on "Add tags" button to open dropdown
    const addTagsButton = getByText(messages.addTagsButtonText.defaultMessage);
    fireEvent.click(addTagsButton);

    // Get the search field
    const searchField = getByRole('searchbox');

    const searchTerm = 'memo';

    // Trigger a change in the search field
    userEvent.type(searchField, searchTerm);

    await act(async () => {
      // Fast-forward time by 500 milliseconds (for the debounce delay)
      jest.advanceTimersByTime(500);
    });

    // Check that the search term has been set
    expect(searchField).toHaveValue(searchTerm);
    expect(getByDisplayValue(searchTerm)).toBeInTheDocument();

    // Clear search
    userEvent.clear(searchField);

    // Check that the search term has been cleared
    expect(searchField).toHaveValue('');
  });

  it('should close dropdown selector when clicking away', async () => {
    setupTaxonomyMock();
    const { container, getByText, queryByText } = await getComponent();

    // Expand the Taxonomy to view applied tags and "Add tags" button
    const expandToggle = container.getElementsByClassName('collapsible-trigger')[0];

    fireEvent.click(expandToggle);

    // Click on "Add tags" button to open dropdown
    const addTagsButton = getByText(messages.addTagsButtonText.defaultMessage);
    fireEvent.click(addTagsButton);

    // Wait for the dropdown selector for tags to open, Tag 3 should appear
    // since it is not applied
    expect(queryByText('Tag 3')).toBeInTheDocument();

    // Simulate clicking outside the dropdown remove focus
    userEvent.click(document.body);

    // Simulate clicking outside the dropdown again to close it
    userEvent.click(document.body);

    // Wait for the dropdown selector for tags to close, Tag 3 is no longer on
    // the page
    expect(queryByText('Tag 3')).not.toBeInTheDocument();
  });

  it('should render taxonomy tags data without tags number badge', async () => {
    const updatedData = { ...data };
    updatedData.taxonomyAndTagsData = { ...updatedData.taxonomyAndTagsData };
    updatedData.taxonomyAndTagsData.contentTags = [];
    const { container, getByText } = await getComponent(updatedData);

    expect(getByText('Taxonomy 1')).toBeInTheDocument();
    expect(container.getElementsByClassName('invisible').length).toBe(1);
  });
});
