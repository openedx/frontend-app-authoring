import React, { useState, useEffect, useCallback } from 'react';
import {
  SelectableBox,
  Icon,
  Spinner,
  Button,
} from '@edx/paragon';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import { ArrowDropDown, ArrowDropUp } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import messages from './messages';
import './ContentTagsDropDownSelector.scss';

import { useTaxonomyTagsData } from './data/apiHooks';

const ContentTagsDropDownSelector = ({
  taxonomyId, level, subTagsUrl, lineage, tagsTree,
}) => {
  const intl = useIntl();
  // This object represents the states of the dropdowns on this level
  // The keys represent the index of the dropdown with
  // the value true (open) false (closed)
  const [dropdownStates, setDropdownStates] = useState({});

  const [tags, setTags] = useState([]);
  const [nextPage, setNextPage] = useState(null);

  // `fetchUrl` is initially `subTagsUrl` to fetch the initial data,
  // however if it is null that means it is the root, and the apiHooks
  // would automatically handle it. Later this url is set to the next
  // page of results (if any)
  //
  // TODO: In the future we may need to refactor this to keep track
  // of the count for how many times the user clicked on "load more" then
  // use useQueries to load all the pages based on that.
  const [fetchUrl, setFetchUrl] = useState(subTagsUrl);

  const isOpen = (i) => dropdownStates[i];

  const clickAndEnterHandler = (i) => {
    // This flips the state of the dropdown at index false (closed) -> true (open)
    // and vice versa. Initially they are undefined which is falsy.
    setDropdownStates({ ...dropdownStates, [i]: !dropdownStates[i] });
  };

  const { data: taxonomyTagsData, isSuccess: isTaxonomyTagsLoaded } = useTaxonomyTagsData(taxonomyId, fetchUrl);

  const isImplicit = (tag) => {
    // Traverse the tags tree using the lineage
    let traversal = tagsTree;
    lineage.forEach(t => {
      // We need to decode the tag to traverse the tree since the lineage value is encoded
      traversal = traversal[decodeURIComponent(t)]?.children || {};
    });

    return (traversal[tag.value] && !traversal[tag.value].explicit) || false;
  };

  useEffect(() => {
    if (isTaxonomyTagsLoaded && taxonomyTagsData) {
      setTags([...tags, ...taxonomyTagsData.results]);
      setNextPage(taxonomyTagsData.next);
    }
  }, [isTaxonomyTagsLoaded, taxonomyTagsData]);

  const loadMoreTags = useCallback(() => {
    setFetchUrl(nextPage);
  }, [nextPage]);

  return (
    <>
      {tags.map((taxonomyTag, i) => (
        <div className="d-flex flex-column" key={`selector-div-${taxonomyTag.value}`} style={{ paddingLeft: `${level * 1}rem` }}>
          <div className="d-flex">
            <SelectableBox
              inputHidden={false}
              type="checkbox"
              className="taxonomy-tags-selectable-box"
              aria-label={`${taxonomyTag.value} checkbox`}
              data-selectable-box="taxonomy-tags"
              value={[...lineage, encodeURIComponent(taxonomyTag.value)].join(',')}
              isIndeterminate={isImplicit(taxonomyTag)}
              disabled={isImplicit(taxonomyTag)}
            >
              {taxonomyTag.value}
            </SelectableBox>
            { taxonomyTag.subTagsUrl
              && (
                <div className="d-flex align-items-center taxonomy-tags-arrow-drop-down" data-link={taxonomyTag.subTagsUrl}>
                  <Icon
                    src={isOpen(i) ? ArrowDropUp : ArrowDropDown}
                    onClick={() => clickAndEnterHandler(i)}
                    tabIndex="0"
                    onKeyPress={(event) => (event.key === 'Enter' ? clickAndEnterHandler(i) : null)}
                  />
                </div>
              )}
          </div>

          { taxonomyTag.subTagsUrl && isOpen(i) && (
            <ContentTagsDropDownSelector
              key={`selector-${taxonomyTag.value}`}
              taxonomyId={taxonomyId}
              subTagsUrl={taxonomyTag.subTagsUrl}
              level={level + 1}
              lineage={[...lineage, encodeURIComponent(taxonomyTag.value)]}
              tagsTree={tagsTree}
            />
          )}

        </div>
      ))}

      { nextPage && isTaxonomyTagsLoaded
        ? (
          <Button
            style={{ marginLeft: `${level * 1}rem` }}
            variant="outline-primary"
            onClick={loadMoreTags}
          >
            <FormattedMessage {...messages.loadMoreTagsButtonText} />
          </Button>
        )
        : null}

      { !isTaxonomyTagsLoaded ? (
        <div className="d-flex justify-content-center align-items-center flex-column">
          <Spinner
            animation="border"
            size="xl"
            screenReaderText={intl.formatMessage(messages.loadingTagsDropdownMessage)}
          />
        </div>
      ) : null}
    </>
  );
};

ContentTagsDropDownSelector.defaultProps = {
  subTagsUrl: undefined,
  lineage: [],
};

ContentTagsDropDownSelector.propTypes = {
  taxonomyId: PropTypes.number.isRequired,
  level: PropTypes.number.isRequired,
  subTagsUrl: PropTypes.string,
  lineage: PropTypes.arrayOf(PropTypes.string),
  tagsTree: PropTypes.objectOf(
    PropTypes.shape({
      explicit: PropTypes.bool.isRequired,
      children: PropTypes.shape({}).isRequired,
    }).isRequired,
  ).isRequired,
};

export default ContentTagsDropDownSelector;
