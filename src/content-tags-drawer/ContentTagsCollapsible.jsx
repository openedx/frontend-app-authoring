// @ts-check
import React from 'react';
import {
  Badge,
  Collapsible,
  SelectableBox,
  Button,
  ModalPopup,
  useToggle,
  SearchField,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import { debounce } from 'lodash';
import messages from './messages';
import './ContentTagsCollapsible.scss';

import ContentTagsDropDownSelector from './ContentTagsDropDownSelector';

import ContentTagsTree from './ContentTagsTree';

import useContentTagsCollapsibleHelper from './ContentTagsCollapsibleHelper';

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
  const { id, name, canTagObject } = taxonomyAndTagsData;

  const {
    tagChangeHandler, tagsTree, contentTagsCount, checkedTags,
  } = useContentTagsCollapsibleHelper(contentId, taxonomyAndTagsData);

  const [isOpen, open, close] = useToggle(false);
  const [addTagsButtonRef, setAddTagsButtonRef] = React.useState(null);

  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSelectableBoxChange = React.useCallback((e) => {
    tagChangeHandler(e.target.value, e.target.checked);
  }, []);

  const handleSearch = debounce((term) => {
    setSearchTerm(term.trim());
  }, 500); // Perform search after 500ms

  const handleSearchChange = React.useCallback((value) => {
    if (value === '') {
      // No need to debounce when search term cleared. Clear debounce function
      handleSearch.cancel();
      setSearchTerm('');
    } else {
      handleSearch(value);
    }
  }, []);

  const modalPopupOnCloseHandler = React.useCallback((event) => {
    close(event);
    // Clear search term
    setSearchTerm('');
  }, []);

  return (
    <div className="d-flex">
      <Collapsible title={name} styling="card-lg" className="taxonomy-tags-collapsible">
        <div key={id}>
          <ContentTagsTree tagsTree={tagsTree} removeTagHandler={tagChangeHandler} />
        </div>

        <div className="d-flex taxonomy-tags-selector-menu">

          {canTagObject && (
            <Button
              ref={setAddTagsButtonRef}
              variant="outline-primary"
              onClick={open}
            >
              <FormattedMessage {...messages.addTagsButtonText} />
            </Button>
          )}
        </div>
        <ModalPopup
          hasArrow
          placement="bottom"
          positionRef={addTagsButtonRef}
          isOpen={isOpen}
          onClose={modalPopupOnCloseHandler}
        >
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
              <SearchField
                onSubmit={() => {}}
                onChange={handleSearchChange}
                className="mb-2"
              />

              <ContentTagsDropDownSelector
                key={`selector-${id}`}
                taxonomyId={id}
                level={0}
                tagsTree={tagsTree}
                searchTerm={searchTerm}
              />
            </SelectableBox.Set>
          </div>
        </ModalPopup>

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
