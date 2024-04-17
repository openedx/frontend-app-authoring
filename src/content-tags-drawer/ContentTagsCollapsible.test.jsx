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

const taxonomyMockData = {
  hasMorePages: false,
  canAddTag: false,
  tagPages: {
    isLoading: false,
    isError: false,
    data: [{
      value: 'Tag 1',
      externalId: null,
      childCount: 2,
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
};

const nestedTaxonomyMockData = {
  hasMorePages: false,
  canAddTag: false,
  tagPages: {
    isLoading: false,
    isError: false,
    data: [{
      value: 'Tag 1.1',
      externalId: null,
      childCount: 0,
      depth: 1,
      parentValue: 'Tag 1',
      id: 12354,
      subTagsUrl: null,
      canChangeTag: false,
      canDeleteTag: false,
    }, {
      value: 'Tag 1.2',
      externalId: null,
      childCount: 0,
      depth: 1,
      parentValue: 'Tag 1',
      id: 12355,
      subTagsUrl: null,
      canChangeTag: false,
      canDeleteTag: false,
    }],
  },
};

jest.mock('./data/apiHooks', () => ({
  useContentTaxonomyTagsUpdater: jest.fn(() => ({
    isError: false,
    mutate: jest.fn(),
  })),
  useTaxonomyTagsData: jest.fn((_, parentTagValue) => {
    // To mock nested call of useTaxonomyData in subtags dropdown
    if (parentTagValue === 'Tag 1') {
      return nestedTaxonomyMockData;
    }
    return taxonomyMockData;
  }),
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
  stagedContentTags: [],
  addStagedContentTag: jest.fn(),
  removeStagedContentTag: jest.fn(),
  setStagedTags: jest.fn(),
};

const ContentTagsCollapsibleComponent = ({
  contentId,
  taxonomyAndTagsData,
  stagedContentTags,
  addStagedContentTag,
  removeStagedContentTag,
  setStagedTags,
}) => (
  <IntlProvider locale="en" messages={{}}>
    <ContentTagsCollapsible
      contentId={contentId}
      taxonomyAndTagsData={taxonomyAndTagsData}
      stagedContentTags={stagedContentTags}
      addStagedContentTag={addStagedContentTag}
      removeStagedContentTag={removeStagedContentTag}
      setStagedTags={setStagedTags}
    />
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

  afterEach(() => {
    jest.clearAllMocks(); // Reset all mock function call counts after each test case
  });

  async function getComponent(updatedData) {
    const componentData = (!updatedData ? data : updatedData);

    return render(
      <ContentTagsCollapsibleComponent
        contentId={componentData.contentId}
        taxonomyAndTagsData={componentData.taxonomyAndTagsData}
        stagedContentTags={componentData.stagedContentTags}
        addStagedContentTag={componentData.addStagedContentTag}
        removeStagedContentTag={componentData.removeStagedContentTag}
        setStagedTags={componentData.setStagedTags}
      />,
    );
  }

  it('should render taxonomy tags data along content tags number badge', async () => {
    const { container, getByText } = await getComponent();
    expect(getByText('Taxonomy 1')).toBeInTheDocument();
    expect(container.getElementsByClassName('taxonomy-tags-count-chip').length).toBe(1);
    expect(getByText('3')).toBeInTheDocument();
  });

  it('should call `addStagedContentTag` when tag checked in the dropdown', async () => {
    const { container, getByText, getAllByText } = await getComponent();

    // Expand the Taxonomy to view applied tags and "Add a tag" button
    const expandToggle = container.getElementsByClassName('collapsible-trigger')[0];

    fireEvent.click(expandToggle);

    // Click on "Add a tag" button to open dropdown to select new tags
    const addTagsButton = getByText(messages.collapsibleAddTagsPlaceholderText.defaultMessage);
    // Use `mouseDown/mouseUp` instead of `click` since the react-select didn't respond to `click`
    fireEvent.mouseDown(addTagsButton);
    fireEvent.mouseUp(addTagsButton);

    // Wait for the dropdown selector for tags to open,
    // Tag 3 should only appear there, (i.e. the dropdown is open, since Tag 3 is not applied)
    expect(getAllByText('Tag 3').length).toBe(1);

    // Click to check Tag 3 and check the `addStagedContentTag` was called with the correct params
    const tag3 = getByText('Tag 3');
    fireEvent.click(tag3);

    const taxonomyId = 123;
    const addedStagedTag = {
      value: 'Tag%203',
      label: 'Tag 3',
    };
    expect(data.addStagedContentTag).toHaveBeenCalledTimes(1);
    expect(data.addStagedContentTag).toHaveBeenCalledWith(taxonomyId, addedStagedTag);
  });

  it('should call `removeStagedContentTag` when tag staged tag unchecked in the dropdown', async () => {
    const { container, getByText, getAllByText } = await getComponent();

    // Expand the Taxonomy to view applied tags and "Add a tag" button
    const expandToggle = container.getElementsByClassName('collapsible-trigger')[0];

    fireEvent.click(expandToggle);

    // Click on "Add a tag" button to open dropdown to select new tags
    const addTagsButton = getByText(messages.collapsibleAddTagsPlaceholderText.defaultMessage);
    // Use `mouseDown/mouseup` instead of `click` since the react-select didn't respond to `click`
    fireEvent.mouseDown(addTagsButton);
    fireEvent.mouseUp(addTagsButton);

    // Wait for the dropdown selector for tags to open,
    // Tag 3 should only appear there, (i.e. the dropdown is open, since Tag 3 is not applied)
    expect(getAllByText('Tag 3').length).toBe(1);

    // Click to check Tag 3
    const tag3 = getByText('Tag 3');
    fireEvent.click(tag3);

    // Click to uncheck Tag 3 and check the `removeStagedContentTag` was called with the correct params
    fireEvent.click(tag3);
    const taxonomyId = 123;
    const tagValue = 'Tag%203';
    expect(data.removeStagedContentTag).toHaveBeenCalledTimes(1);
    expect(data.removeStagedContentTag).toHaveBeenCalledWith(taxonomyId, tagValue);
  });

  it('should call `setStagedTags` to clear staged tags when clicking inline "Add" button', async () => {
    // Setup component to have staged tags
    const { container, getByText } = await getComponent({
      ...data,
      stagedContentTags: [{
        value: 'Tag%203',
        label: 'Tag 3',
      }],
    });

    // Expand the Taxonomy to view applied tags and staged tags
    const expandToggle = container.getElementsByClassName('collapsible-trigger')[0];

    fireEvent.click(expandToggle);

    // Click on inline "Add" button and check that the appropriate methods are called
    const inlineAdd = getByText(messages.collapsibleInlineAddStagedTagsButtonText.defaultMessage);
    fireEvent.click(inlineAdd);

    // Check that `setStagedTags` called with empty tags list to clear staged tags
    const taxonomyId = 123;
    expect(data.setStagedTags).toHaveBeenCalledTimes(1);
    expect(data.setStagedTags).toHaveBeenCalledWith(taxonomyId, []);
  });

  it('should call `setStagedTags` to clear staged tags when clicking "Add tags" button in dropdown', async () => {
    // Setup component to have staged tags
    const { container, getByText } = await getComponent({
      ...data,
      stagedContentTags: [{
        value: 'Tag%203',
        label: 'Tag 3',
      }],
    });

    // Expand the Taxonomy to view applied tags and staged tags
    const expandToggle = container.getElementsByClassName('collapsible-trigger')[0];

    fireEvent.click(expandToggle);

    // Click on dropdown with staged tags to expand it
    const selectTagsDropdown = container.getElementsByClassName('react-select-add-tags__control')[0];
    // Use `mouseDown` instead of `click` since the react-select didn't respond to `click`
    fireEvent.mouseDown(selectTagsDropdown);

    // Click on "Add tags" button and check that the appropriate methods are called
    const dropdownAdd = getByText(messages.collapsibleAddStagedTagsButtonText.defaultMessage);
    fireEvent.click(dropdownAdd);

    // Check that `setStagedTags` called with empty tags list to clear staged tags
    const taxonomyId = 123;
    expect(data.setStagedTags).toHaveBeenCalledTimes(1);
    expect(data.setStagedTags).toHaveBeenCalledWith(taxonomyId, []);
  });

  it('should close dropdown and clear staged tags when clicking "Cancel" inside dropdown', async () => {
    // Setup component to have staged tags
    const { container, getByText } = await getComponent({
      ...data,
      stagedContentTags: [{
        value: 'Tag%203',
        label: 'Tag 3',
      }],
    });

    // Expand the Taxonomy to view applied tags and staged tags
    const expandToggle = container.getElementsByClassName('collapsible-trigger')[0];

    fireEvent.click(expandToggle);

    // Click on dropdown with staged tags to expand it
    const selectTagsDropdown = container.getElementsByClassName('react-select-add-tags__control')[0];
    // Use `mouseDown` instead of `click` since the react-select didn't respond to `click`
    fireEvent.mouseDown(selectTagsDropdown);

    // Click on inline "Add" button and check that the appropriate methods are called
    const dropdownCancel = getByText(messages.collapsibleCancelStagedTagsButtonText.defaultMessage);
    fireEvent.click(dropdownCancel);

    // Check that `setStagedTags` called with empty tags list to clear staged tags
    const taxonomyId = 123;
    expect(data.setStagedTags).toHaveBeenCalledTimes(1);
    expect(data.setStagedTags).toHaveBeenCalledWith(taxonomyId, []);

    // Check that the dropdown is closed
    expect(dropdownCancel).not.toBeInTheDocument();
  });

  it('should handle search term change', async () => {
    const {
      container, getByText, getByRole, getByDisplayValue,
    } = await getComponent();

    // Expand the Taxonomy to view applied tags and "Add a tag" button
    const expandToggle = container.getElementsByClassName('collapsible-trigger')[0];
    fireEvent.click(expandToggle);

    // Click on "Add a tag" button to open dropdown
    const addTagsButton = getByText(messages.collapsibleAddTagsPlaceholderText.defaultMessage);
    // Use `mouseDown` instead of `click` since the react-select didn't respond to click
    fireEvent.mouseDown(addTagsButton);

    // Get the search field
    const searchField = getByRole('combobox');

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
    const { container, getByText, queryByText } = await getComponent();

    // Expand the Taxonomy to view applied tags and "Add a tag" button
    const expandToggle = container.getElementsByClassName('collapsible-trigger')[0];

    fireEvent.click(expandToggle);

    // Click on "Add a tag" button to open dropdown
    const addTagsButton = getByText(messages.collapsibleAddTagsPlaceholderText.defaultMessage);
    // Use `mouseDown` instead of `click` since the react-select didn't respond to `click`
    fireEvent.mouseDown(addTagsButton);

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

  it('should test keyboard navigation of add tags widget', async () => {
    const {
      container,
      getByText,
      queryByText,
      queryAllByText,
    } = await getComponent();

    // Expand the Taxonomy to view applied tags and "Add a tag" button
    const expandToggle = container.getElementsByClassName('collapsible-trigger')[0];

    fireEvent.click(expandToggle);

    // Click on "Add a tag" button to open dropdown
    const addTagsButton = getByText(messages.collapsibleAddTagsPlaceholderText.defaultMessage);
    // Use `mouseDown` instead of `click` since the react-select didn't respond to `click`
    fireEvent.mouseDown(addTagsButton);

    // Wait for the dropdown selector for tags to open, Tag 3 should appear
    // since it is not applied
    expect(queryByText('Tag 3')).toBeInTheDocument();

    /*
    The dropdown data looks like the following:

      │Tag 1
      │  │
      │  ├─ Tag 1.1
      │  │
      │  │
      │  └─ Tag 1.2
      │
      │Tag 2
      │
      │
      │Tag 3

     */

    // Press tab to focus on first element in dropdown, Tag 1 should be focused
    userEvent.tab();
    const dropdownTag1Div = queryAllByText('Tag 1')[1].closest('.dropdown-selector-tag-actions');
    expect(dropdownTag1Div).toHaveFocus();

    // Press right arrow to expand Tag 1, Tag 1.1 & Tag 1.2 should now be visible
    userEvent.keyboard('{arrowright}');
    expect(queryAllByText('Tag 1.1').length).toBe(2);
    expect(queryByText('Tag 1.2')).toBeInTheDocument();

    // Press left arrow to collapse Tag 1, Tag 1.1 & Tag 1.2 should not be visible
    userEvent.keyboard('{arrowleft}');
    expect(queryAllByText('Tag 1.1').length).toBe(1);
    expect(queryByText('Tag 1.2')).not.toBeInTheDocument();

    // Press enter key to expand Tag 1, Tag 1.1 & Tag 1.2 should now be visible
    userEvent.keyboard('{enter}');
    expect(queryAllByText('Tag 1.1').length).toBe(2);
    expect(queryByText('Tag 1.2')).toBeInTheDocument();

    // Press down arrow to navigate to Tag 1.1, it should be focused
    userEvent.keyboard('{arrowdown}');
    const dropdownTag1pt1Div = queryAllByText('Tag 1.1')[1].closest('.dropdown-selector-tag-actions');
    expect(dropdownTag1pt1Div).toHaveFocus();

    // Press down arrow again to navigate to Tag 1.2, it should be fouced
    userEvent.keyboard('{arrowdown}');
    const dropdownTag1pt2Div = queryAllByText('Tag 1.2')[0].closest('.dropdown-selector-tag-actions');
    expect(dropdownTag1pt2Div).toHaveFocus();

    // Press down arrow again to navigate to Tag 2, it should be fouced
    userEvent.keyboard('{arrowdown}');
    const dropdownTag2Div = queryAllByText('Tag 2')[1].closest('.dropdown-selector-tag-actions');
    expect(dropdownTag2Div).toHaveFocus();

    // Press up arrow to navigate back to Tag 1.2, it should be focused
    userEvent.keyboard('{arrowup}');
    expect(dropdownTag1pt2Div).toHaveFocus();

    // Press up arrow to navigate back to Tag 1.1, it should be focused
    userEvent.keyboard('{arrowup}');
    expect(dropdownTag1pt1Div).toHaveFocus();

    // Press up arrow again to navigate to Tag 1, it should be focused
    userEvent.keyboard('{arrowup}');
    expect(dropdownTag1Div).toHaveFocus();

    // Press down arrow twice to navigate to Tag 1.2, it should be focsed
    userEvent.keyboard('{arrowdown}');
    userEvent.keyboard('{arrowdown}');
    expect(dropdownTag1pt2Div).toHaveFocus();

    // Press space key to check Tag 1.2, it should be staged
    userEvent.keyboard('{space}');
    const taxonomyId = 123;
    const addedStagedTag = {
      value: 'Tag%201,Tag%201.2',
      label: 'Tag 1.2',
    };
    expect(data.addStagedContentTag).toHaveBeenCalledWith(taxonomyId, addedStagedTag);

    // Press enter key again to uncheck Tag 1.2 (since it's a leaf), it should be unstaged
    userEvent.keyboard('{enter}');
    const tagValue = 'Tag%201,Tag%201.2';
    expect(data.removeStagedContentTag).toHaveBeenCalledWith(taxonomyId, tagValue);

    // Press left arrow to navigate back to Tag 1, it should be focused
    userEvent.keyboard('{arrowleft}');
    expect(dropdownTag1Div).toHaveFocus();

    // Press tab key it should jump to cancel button, it should be focused
    userEvent.tab();
    const dropdownCancel = getByText(messages.collapsibleCancelStagedTagsButtonText.defaultMessage);
    expect(dropdownCancel).toHaveFocus();

    // Press tab again, it should exit and close the select menu, since there are not staged tags
    userEvent.tab();
    expect(queryByText('Tag 3')).not.toBeInTheDocument();

    // Press shift tab, focus back on select menu input, it should open the menu
    userEvent.tab({ shift: true });
    expect(queryByText('Tag 3')).toBeInTheDocument();

    // Press shift tab again, it should focus out and close the select menu
    userEvent.tab({ shift: true });
    expect(queryByText('Tag 3')).not.toBeInTheDocument();

    // Press tab again, the select menu should open, then press escape, it should close
    userEvent.tab();
    expect(queryByText('Tag 3')).toBeInTheDocument();
    userEvent.keyboard('{escape}');
    expect(queryByText('Tag 3')).not.toBeInTheDocument();
  });

  it('should remove applied tags when clicking on `x` of tag bubble', async () => {
    const { container, getByText } = await getComponent();

    // Expand the Taxonomy to view applied tags
    const expandToggle = container.getElementsByClassName('collapsible-trigger')[0];

    fireEvent.click(expandToggle);

    // Click on 'x' of applied tag to remove it
    const appliedTag = getByText('Tag 2');
    const xButtonAppliedTag = appliedTag.nextSibling;
    xButtonAppliedTag.click();

    // Check that the applied tag has been removed
    expect(appliedTag).not.toBeInTheDocument();
  });

  it('should render taxonomy tags data with tags number badge as cero', async () => {
    const updatedData = { ...data };
    updatedData.taxonomyAndTagsData = { ...updatedData.taxonomyAndTagsData };
    updatedData.taxonomyAndTagsData.contentTags = [];
    const { container, getByText } = await getComponent(updatedData);

    expect(getByText('Taxonomy 1')).toBeInTheDocument();
    expect(container.getElementsByClassName('taxonomy-tags-count-chip').length).toBe(1);
    expect(getByText('0')).toBeInTheDocument();
  });
});
