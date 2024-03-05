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

  it('should call `addStagedContentTag` when tag checked in the dropdown', async () => {
    setupTaxonomyMock();
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
    setupTaxonomyMock();
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
    setupTaxonomyMock();
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
    setupTaxonomyMock();
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
    setupTaxonomyMock();
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

  it('should remove applied tags when clicking on `x` of tag bubble', async () => {
    setupTaxonomyMock();
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

  it('should render taxonomy tags data without tags number badge', async () => {
    const updatedData = { ...data };
    updatedData.taxonomyAndTagsData = { ...updatedData.taxonomyAndTagsData };
    updatedData.taxonomyAndTagsData.contentTags = [];
    const { container, getByText } = await getComponent(updatedData);

    expect(getByText('Taxonomy 1')).toBeInTheDocument();
    expect(container.getElementsByClassName('invisible').length).toBe(1);
  });
});
