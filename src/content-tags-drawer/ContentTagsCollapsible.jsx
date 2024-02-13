// @ts-check
import React from 'react';
import Select, { components, MenuProps } from 'react-select';
import {
  Badge,
  Collapsible,
  Button,
  ModalPopup,
  useToggle,
  SearchField,
} from '@openedx/paragon';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { SelectableBox } from '@edx/frontend-lib-content-components';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import { debounce } from 'lodash';
import messages from './messages';
import './ContentTagsCollapsible.scss';

import ContentTagsDropDownSelector from './ContentTagsDropDownSelector';

import ContentTagsTree from './ContentTagsTree';

import useContentTagsCollapsibleHelper from './ContentTagsCollapsibleHelper';

const CustomMenu = (props) => {
  const { intl, handleSelectableBoxChange, checkedTags, taxonomyId, tagsTree, searchTerm } = props.selectProps;
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
            tagsTree={tagsTree}
            searchTerm={searchTerm}
          />
        </SelectableBox.Set>
      </div>
    </components.Menu>
  );
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
 * @param {TaxonomyData & {contentTags: ContentTagData[]}} props.taxonomyAndTagsData - Taxonomy metadata & applied tags
 */
const ContentTagsCollapsible = ({ contentId, taxonomyAndTagsData }) => {
  const intl = useIntl();
  const { id: taxonomyId, name, canTagObject } = taxonomyAndTagsData;

  const {
    tagChangeHandler, tagsTree, contentTagsCount, checkedTags,
  } = useContentTagsCollapsibleHelper(contentId, taxonomyAndTagsData);

  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSelectableBoxChange = React.useCallback((e) => {
    tagChangeHandler(e.target.value, e.target.checked);
  }, []);

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

  return (
    <div className="d-flex">
      <Collapsible title={name} styling="card-lg" className="taxonomy-tags-collapsible">
        <div key={taxonomyId}>
          <ContentTagsTree tagsTree={tagsTree} removeTagHandler={tagChangeHandler} />
        </div>

        <div className="d-flex taxonomy-tags-selector-menu">

          {canTagObject && (
            <Select
              isMulti
              name="colors"
              isSearchable
              className="d-flex flex-column flex-fill"
              classNamePrefix="react-select"
              onInputChange={handleSearchChange}
              components={{ Menu: CustomMenu }}
              closeMenuOnSelect={false}
              blurInputOnSelect={false}
              intl={intl}
              handleSelectableBoxChange={handleSelectableBoxChange}
              checkedTags={checkedTags}
              taxonomyId={taxonomyId}
              tagsTree={tagsTree}
              searchTerm={searchTerm}
              // value={[
              //   { value: 'Administration,Administrative%20Support,Administrative%20Functions', label: 'Administrative Functions' },
              //   { value: 'Administration,Administrative%20Support,Memos', label: 'Memos' },
              //   { value: 'Another%20One', label: 'Another One' },
              // ]} // TODO: this needs to be staged (not yet commited tags) in the above format
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
};

export default ContentTagsCollapsible;
