// @ts-check
import React from 'react';
import Select, { components } from 'react-select';
import {
  Badge,
  Collapsible,
  Button,
  Spinner,
} from '@openedx/paragon';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { SelectableBox } from '@edx/frontend-lib-content-components';
import { useIntl, intlShape } from '@edx/frontend-platform/i18n';
import { debounce } from 'lodash';
import messages from './messages';

import ContentTagsDropDownSelector from './ContentTagsDropDownSelector';

import ContentTagsTree from './ContentTagsTree';

import useContentTagsCollapsibleHelper from './ContentTagsCollapsibleHelper';

const CustomMenu = (props) => {
  const {
    intl,
    handleSelectableBoxChange,
    checkedTags,
    taxonomyId,
    appliedContentTagsTree,
    stagedContentTagsTree,
    handleStagedTagsMenuChange,
    selectRef,
    searchTerm,
    value,
    commitStagedTags,
  } = props.selectProps;
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
              onClick={() => { handleStagedTagsMenuChange([]); selectRef.current?.blur(); }}
            >
              { intl.formatMessage(messages.collapsibleCancelStagedTagsButtonText) }
            </Button>
            <Button
              variant="tertiary"
              className="text-info-500 add-tags-button"
              disabled={!(value && value.length)}
              onClick={() => { commitStagedTags(); handleStagedTagsMenuChange([]); selectRef.current?.blur(); }}
            >
              { intl.formatMessage(messages.collapsibleAddStagedTagsButtonText) }
            </Button>
          </div>
        </div>
      </div>
    </components.Menu>
  );
};

CustomMenu.propTypes = {
  selectProps: PropTypes.shape({
    intl: intlShape.isRequired,
    handleSelectableBoxChange: PropTypes.func.isRequired,
    checkedTags: PropTypes.arrayOf(PropTypes.string).isRequired,
    taxonomyId: PropTypes.number.isRequired,
    appliedContentTagsTree: PropTypes.objectOf(
      PropTypes.shape({
        explicit: PropTypes.bool.isRequired,
        children: PropTypes.shape({}).isRequired,
      }).isRequired,
    ).isRequired,
    stagedContentTagsTree: PropTypes.objectOf(
      PropTypes.shape({
        explicit: PropTypes.bool.isRequired,
        children: PropTypes.shape({}).isRequired,
      }).isRequired,
    ).isRequired,
    handleStagedTagsMenuChange: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    selectRef: PropTypes.shape({ current: PropTypes.object }),
    searchTerm: PropTypes.string.isRequired,
    value: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })).isRequired,
    commitStagedTags: PropTypes.func.isRequired,
  }).isRequired,
};

const CustomLoadingIndicator = (props) => {
  const { intl } = props.selectProps;
  return (
    <Spinner
      animation="border"
      size="xl"
      screenReaderText={intl.formatMessage(messages.loadingMessage)}
    />
  );
};

CustomLoadingIndicator.propTypes = {
  selectProps: PropTypes.shape({
    intl: intlShape.isRequired,
  }).isRequired,
};

/** @typedef {import("../taxonomy/data/types.mjs").TaxonomyData} TaxonomyData */
/** @typedef {import("./data/types.mjs").Tag} ContentTagData */

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
 * @param {Array<Object>} props.stagedContentTags - Array of staged tags represented objects with value/label
 * @param {Function} props.addStagedContentTag - Callback function to add a staged tag for a taxonomy
 * @param {Function} props.removeStagedContentTag - Callback function to remove a staged tag from a taxonomy
 * @param {Function} props.setStagedTags - Callback function to set staged tags for a taxonomy to provided tags list
 * @param {TaxonomyData & {contentTags: ContentTagData[]}} props.taxonomyAndTagsData - Taxonomy metadata & applied tags
 */
const ContentTagsCollapsible = ({
  contentId, taxonomyAndTagsData, stagedContentTags, addStagedContentTag, removeStagedContentTag, setStagedTags,
}) => {
  const intl = useIntl();
  const { id: taxonomyId, name, canTagObject } = taxonomyAndTagsData;
  const selectRef = React.useRef(null);

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

  const handleSearchChange = React.useCallback((value, { action, prevInputValue }) => {
    if (value === '') {
      // No need to debounce when search term cleared. Clear debounce function
      handleSearch.cancel();
      setSearchTerm('');
    } else {
      handleSearch(value);
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

  return (
    <div className="d-flex">
      <Collapsible title={name} styling="card-lg" className="taxonomy-tags-collapsible">
        <div key={taxonomyId}>
          <ContentTagsTree tagsTree={appliedContentTagsTree} removeTagHandler={removeAppliedTagHandler} />
        </div>

        <div className="d-flex taxonomy-tags-selector-menu">

          {canTagObject && (
            <Select
              ref={selectRef}
              isMulti
              isLoading={updateTags.isLoading}
              isDisabled={updateTags.isLoading}
              name="tags-select"
              placeholder={intl.formatMessage(messages.collapsibleAddTagsPlaceholderText)}
              isSearchable
              className="d-flex flex-column flex-fill"
              classNamePrefix="react-select"
              onInputChange={handleSearchChange}
              onChange={handleStagedTagsMenuChange}
              components={{ Menu: CustomMenu, LoadingIndicator: CustomLoadingIndicator }}
              closeMenuOnSelect={false}
              blurInputOnSelect={false}
              intl={intl}
              handleSelectableBoxChange={handleSelectableBoxChange}
              checkedTags={checkedTags}
              taxonomyId={taxonomyId}
              appliedContentTagsTree={appliedContentTagsTree}
              stagedContentTagsTree={stagedContentTagsTree}
              handleStagedTagsMenuChange={handleStagedTagsMenuChange}
              selectRef={selectRef}
              searchTerm={searchTerm}
              value={stagedContentTags}
              commitStagedTags={commitStagedTags}
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

ContentTagsCollapsible.propTypes = {
  contentId: PropTypes.string.isRequired,
  taxonomyAndTagsData: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    contentTags: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.string,
      lineage: PropTypes.arrayOf(PropTypes.string),
    })),
    canTagObject: PropTypes.bool.isRequired,
  }).isRequired,
  stagedContentTags: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string,
  })).isRequired,
  addStagedContentTag: PropTypes.func.isRequired,
  removeStagedContentTag: PropTypes.func.isRequired,
  setStagedTags: PropTypes.func.isRequired,
};

export default ContentTagsCollapsible;
