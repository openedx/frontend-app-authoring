// @ts-check
// disable prop-types since we're using TypeScript to define the prop types,
// but the linter can't detect that in a .jsx file.
/* eslint-disable react/prop-types */
import React from 'react';
import Select, { components } from 'react-select';
import {
  Badge,
  Collapsible,
  Button,
  Spinner,
} from '@openedx/paragon';
import classNames from 'classnames';
import { SelectableBox } from '@edx/frontend-lib-content-components';
import { useIntl } from '@edx/frontend-platform/i18n';
import { debounce } from 'lodash';
import messages from './messages';

import ContentTagsDropDownSelector from './ContentTagsDropDownSelector';

import ContentTagsTree from './ContentTagsTree';

import useContentTagsCollapsibleHelper from './ContentTagsCollapsibleHelper';

/** @typedef {import("./ContentTagsCollapsible").TagTreeEntry} TagTreeEntry */
/** @typedef {import("./ContentTagsCollapsible").TaxonomySelectProps} TaxonomySelectProps */
/** @typedef {import("../taxonomy/data/types.mjs").TaxonomyData} TaxonomyData */
/** @typedef {import("./data/types.mjs").Tag} ContentTagData */

/**
 * Custom Menu component for our Select box
 * @param {import("react-select").MenuProps&{selectProps: TaxonomySelectProps}} props
 */
const CustomMenu = (props) => {
  const {
    handleSelectableBoxChange,
    checkedTags,
    taxonomyId,
    appliedContentTagsTree,
    stagedContentTagsTree,
    handleCommitStagedTags,
    handleCancelStagedTags,
    searchTerm,
    value,
  } = props.selectProps;
  const intl = useIntl();
  return (
    <components.Menu {...props}>
      <div className="bg-white p-3 shadow">

        <SelectableBox.Set
          type="checkbox"
          name="tags"
          columns={1}
          ariaLabel={intl.formatMessage(messages.taxonomyTagsAriaLabel)}
          className="taxonomy-tags-selectable-box-set"
          onChange={handleSelectableBoxChange}
          value={checkedTags}
        >
          <ContentTagsDropDownSelector
            key={`selector-${taxonomyId}`}
            taxonomyId={taxonomyId}
            level={0}
            appliedContentTagsTree={appliedContentTagsTree}
            stagedContentTagsTree={stagedContentTagsTree}
            searchTerm={searchTerm}
          />
        </SelectableBox.Set>
        <hr className="mt-0 mb-0" />
        <div className="d-flex flex-row justify-content-end">
          <div className="d-inline">
            <Button
              variant="tertiary"
              className="cancel-add-tags-button"
              onClick={handleCancelStagedTags}
            >
              { intl.formatMessage(messages.collapsibleCancelStagedTagsButtonText) }
            </Button>
            <Button
              variant="tertiary"
              className="text-info-500 add-tags-button"
              disabled={!(value && value.length)}
              onClick={handleCommitStagedTags}
            >
              { intl.formatMessage(messages.collapsibleAddStagedTagsButtonText) }
            </Button>
          </div>
        </div>
      </div>
    </components.Menu>
  );
};

const CustomLoadingIndicator = () => {
  const intl = useIntl();
  return (
    <Spinner
      animation="border"
      size="xl"
      screenReaderText={intl.formatMessage(messages.loadingMessage)}
    />
  );
};

/**
 * Custom IndicatorsContainer component for our Select box
 * @param {import("react-select").IndicatorsContainerProps&{selectProps: TaxonomySelectProps}} props
 */
const CustomIndicatorsContainer = (props) => {
  const {
    value,
    handleCommitStagedTags,
  } = props.selectProps;
  const intl = useIntl();
  return (
    <components.IndicatorsContainer {...props}>
      {
        (value && value.length && (
          <Button
            variant="dark"
            size="sm"
            className="mt-2 mb-2 rounded-0"
            onClick={handleCommitStagedTags}
            onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }}
          >
            { intl.formatMessage(messages.collapsibleInlineAddStagedTagsButtonText) }
          </Button>
        )) || null
      }
      {props.children}
    </components.IndicatorsContainer>
  );
};

/**
 * Collapsible component that holds a Taxonomy along with Tags that belong to it.
 * This includes both applied tags and tags that are available to select
 * from a dropdown list.
 *
 * This component also handles all the logic with selecting/deselecting tags and keeps track of the
 * tags tree in the state. That is used to render the Tag bubbgles as well as the populating the
 * state of the tags in the dropdown selectors.
 *
 * The `contentTags` that is passed are consolidated and converted to a tree structure. For example:
 *
 * FROM:
 *
 * [
 *   {
 *     "value": "DNA Sequencing",
 *     "lineage": [
 *       "Science and Research",
 *       "Genetics Subcategory",
 *       "DNA Sequencing"
 *     ]
 *   },
 *   {
 *     "value": "Virology",
 *     "lineage": [
 *       "Science and Research",
 *       "Molecular, Cellular, and Microbiology",
 *       "Virology"
 *     ]
 *   }
 * ]
 *
 * TO:
 *
 * {
 *   "Science and Research": {
 *     explicit: false,
 *     children: {
 *       "Genetics Subcategory": {
 *         explicit: false,
 *         children: {
 *           "DNA Sequencing": {
 *             explicit: true,
 *             children: {}
 *           }
 *         }
 *       },
 *       "Molecular, Cellular, and Microbiology": {
 *         explicit: false,
 *         children: {
 *           "Virology": {
 *             explicit: true,
 *             children: {}
 *           }
 *         }
 *       }
 *     }
 *   }
 * };
 *
 *
 * It also keeps track of newly added tags as they are selected in the dropdown selectors.
 * They are store in the same format above, and then merged to one tree that is used as the
 * source of truth for both the tag bubble and the dropdowns. They keys are order alphabetically.
 *
 * In the dropdowns, the value of each SelectableBox is stored along with it's lineage and is URI encoded.
 * Ths is so we are able to traverse and manipulate different parts of the tree leading to it.
 * Here is an example of what the value of the "Virology" tag would be:
 *
 *  "Science%20and%20Research,Molecular%2C%20Cellular%2C%20and%20Microbiology,Virology"
 *
 * @param {Object} props - The component props.
 * @param {string} props.contentId - Id of the content object
 * @param {{value: string, label: string}[]} props.stagedContentTags
 *        - Array of staged tags represented as objects with value/label
 * @param {(taxonomyId: number, tag: {value: string, label: string}) => void} props.addStagedContentTag
 *        - Callback function to add a staged tag for a taxonomy
 * @param {(taxonomyId: number, tagValue: string) => void} props.removeStagedContentTag
 *        - Callback function to remove a staged tag from a taxonomy
 * @param {Function} props.setStagedTags - Callback function to set staged tags for a taxonomy to provided tags list
 * @param {TaxonomyData & {contentTags: ContentTagData[]}} props.taxonomyAndTagsData - Taxonomy metadata & applied tags
 */
const ContentTagsCollapsible = ({
  contentId, taxonomyAndTagsData, stagedContentTags, addStagedContentTag, removeStagedContentTag, setStagedTags,
}) => {
  const intl = useIntl();
  const { id: taxonomyId, name, canTagObject } = taxonomyAndTagsData;
  const selectRef = React.useRef(/** @type {HTMLSelectElement | null} */(null));

  const {
    tagChangeHandler,
    removeAppliedTagHandler,
    appliedContentTagsTree,
    stagedContentTagsTree,
    contentTagsCount,
    checkedTags,
    commitStagedTags,
    updateTags,
  } = useContentTagsCollapsibleHelper(
    contentId,
    taxonomyAndTagsData,
    addStagedContentTag,
    removeStagedContentTag,
    stagedContentTags,
  );

  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSelectableBoxChange = React.useCallback((e) => {
    tagChangeHandler(e.target.value, e.target.checked);
  }, [tagChangeHandler]);

  const handleSearch = debounce((term) => {
    setSearchTerm(term.trim());
  }, 500); // Perform search after 500ms

  const handleSearchChange = React.useCallback((value, { action }) => {
    if (action === 'input-blur') {
      // Cancel/clear search if focused away from select input
      handleSearch.cancel();
      setSearchTerm('');
    } else if (action === 'input-change') {
      if (value === '') {
        // No need to debounce when search term cleared. Clear debounce function
        handleSearch.cancel();
        setSearchTerm('');
      } else {
        handleSearch(value);
      }
    }
  }, []);

  // onChange handler for react-select component, currently only called when
  // staged tags in the react-select input are removed or fully cleared.
  // The remaining staged tags are passed in as the parameter, so we set the state
  // to the passed in tags
  const handleStagedTagsMenuChange = React.useCallback((stagedTags) => {
    // Get tags that were unstaged to remove them from checkbox selector
    const unstagedTags = stagedContentTags.filter(
      t1 => !stagedTags.some(t2 => t1.value === t2.value),
    );

    // Call the `tagChangeHandler` with the unstaged tags to unselect them from the selectbox
    // and update the staged content tags tree. Since the `handleStagedTagsMenuChange` function is={}
    // only called when a change occurs in the react-select menu component we know that tags can only be
    // removed from there, hence the tagChangeHandler is always called with `checked=false`.
    unstagedTags.forEach(unstagedTag => tagChangeHandler(unstagedTag.value, false));
    setStagedTags(taxonomyId, stagedTags);
  }, [taxonomyId, setStagedTags, stagedContentTags, tagChangeHandler]);

  const handleCommitStagedTags = React.useCallback(() => {
    commitStagedTags();
    handleStagedTagsMenuChange([]);
    selectRef.current?.blur();
    setSearchTerm('');
  }, [commitStagedTags, handleStagedTagsMenuChange, selectRef, setSearchTerm]);

  const handleCancelStagedTags = React.useCallback(() => {
    handleStagedTagsMenuChange([]);
    selectRef.current?.blur();
    setSearchTerm('');
  }, [handleStagedTagsMenuChange, selectRef, setSearchTerm]);

  return (
    <div className="d-flex">
      <Collapsible title={name} styling="card-lg" className="taxonomy-tags-collapsible">
        <div key={taxonomyId}>
          <ContentTagsTree tagsTree={appliedContentTagsTree} removeTagHandler={removeAppliedTagHandler} />
        </div>

        <div className="d-flex taxonomy-tags-selector-menu">

          {canTagObject && (
            <Select
              ref={/** @type {React.RefObject} */(selectRef)}
              isMulti
              isLoading={updateTags.isLoading}
              isDisabled={updateTags.isLoading}
              name="tags-select"
              placeholder={intl.formatMessage(messages.collapsibleAddTagsPlaceholderText)}
              isSearchable
              className="d-flex flex-column flex-fill"
              classNamePrefix="react-select-add-tags"
              onInputChange={handleSearchChange}
              onChange={handleStagedTagsMenuChange}
              components={{
                Menu: CustomMenu,
                LoadingIndicator: CustomLoadingIndicator,
                IndicatorsContainer: CustomIndicatorsContainer,
              }}
              closeMenuOnSelect={false}
              blurInputOnSelect={false}
              handleSelectableBoxChange={handleSelectableBoxChange}
              checkedTags={checkedTags}
              taxonomyId={taxonomyId}
              appliedContentTagsTree={appliedContentTagsTree}
              stagedContentTagsTree={stagedContentTagsTree}
              handleCommitStagedTags={handleCommitStagedTags}
              handleCancelStagedTags={handleCancelStagedTags}
              searchTerm={searchTerm}
              value={stagedContentTags}
            />
          )}
        </div>
      </Collapsible>
      <div className="d-flex">
        <Badge
          variant="light"
          pill
          className={classNames('align-self-start', 'mt-3', {
            invisible: contentTagsCount === 0,
          })}
        >
          {contentTagsCount}
        </Badge>
      </div>
    </div>
  );
};

export default ContentTagsCollapsible;
