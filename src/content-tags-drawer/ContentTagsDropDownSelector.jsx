// @ts-check
import React, { useEffect, useState, useCallback } from 'react';
import {
  Icon,
  Spinner,
  Button,
} from '@openedx/paragon';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import { ArrowDropDown, ArrowDropUp, Add } from '@openedx/paragon/icons';
import PropTypes from 'prop-types';

import SelectableBox from '../editors/sharedComponents/SelectableBox';
import { useTaxonomyTagsData } from './data/apiHooks';
import messages from './messages';

const HighlightedText = ({ text, highlight }) => {
  if (!highlight) {
    return <span>{text}</span>;
  }

  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <span>
      {parts.map((part, index) => (
        // eslint-disable-next-line react/no-array-index-key -- using index because part is not unique
        <React.Fragment key={index}>
          {part.toLowerCase() === highlight.toLowerCase() ? <b>{part}</b> : part}
        </React.Fragment>
      ))}
    </span>
  );
};

HighlightedText.propTypes = {
  text: PropTypes.string.isRequired,
  highlight: PropTypes.string,
};

HighlightedText.defaultProps = {
  highlight: '',
};

const ContentTagsDropDownSelector = ({
  taxonomyId, level, lineage, appliedContentTagsTree, stagedContentTagsTree, searchTerm,
}) => {
  const intl = useIntl();

  // This object represents the states of the dropdowns on this level
  // The keys represent the index of the dropdown with
  // the value true (open) false (closed)
  const [dropdownStates, setDropdownStates] = useState(/** type Record<string, boolean> */ {});
  const isOpen = (tagValue) => dropdownStates[tagValue];

  const [numPages, setNumPages] = useState(1);
  const parentTagValue = lineage.length ? decodeURIComponent(lineage[lineage.length - 1]) : null;
  const { hasMorePages, tagPages } = useTaxonomyTagsData(taxonomyId, parentTagValue, numPages, searchTerm);

  const [prevSearchTerm, setPrevSearchTerm] = useState(searchTerm);

  // Reset the page and tags state when search term changes
  // and store search term to compare
  if (prevSearchTerm !== searchTerm) {
    setPrevSearchTerm(searchTerm);
    setNumPages(1);
  }

  useEffect(() => {
    if (tagPages.isSuccess) {
      if (searchTerm) {
        const expandAll = tagPages.data.reduce(
          (acc, tagData) => ({
            ...acc,
            [tagData.value]: !!tagData.childCount,
          }),
          {},
        );
        setDropdownStates(expandAll);
      } else {
        setDropdownStates({});
      }
    }
  }, [searchTerm, tagPages.isSuccess]);

  const clickAndEnterHandler = (tagValue) => {
    // This flips the state of the dropdown at index false (closed) -> true (open)
    // and vice versa. Initially they are undefined which is falsy.
    setDropdownStates({ ...dropdownStates, [tagValue]: !dropdownStates[tagValue] });
  };

  const isImplicit = (tag) => {
    // Traverse the applied tags tree using the lineage
    let appliedTraversal = appliedContentTagsTree;
    lineage.forEach(t => {
      appliedTraversal = appliedTraversal[t]?.children || {};
    });
    const isAppliedImplicit = (appliedTraversal[tag.value] && !appliedTraversal[tag.value].explicit);

    // Traverse the staged tags tree using the lineage
    let stagedTraversal = stagedContentTagsTree;
    lineage.forEach(t => {
      stagedTraversal = stagedTraversal[t]?.children || {};
    });
    const isStagedImplicit = (stagedTraversal[tag.value] && !stagedTraversal[tag.value].explicit);

    return isAppliedImplicit || isStagedImplicit || false;
  };

  const isApplied = (tag) => {
    // Traverse the applied tags tree using the lineage
    let appliedTraversal = appliedContentTagsTree;
    lineage.forEach(t => {
      appliedTraversal = appliedTraversal[t]?.children || {};
    });
    return !!appliedTraversal[tag.value];
  };

  const isStagedExplicit = (tag) => {
    // Traverse the staged tags tree using the lineage
    let stagedTraversal = stagedContentTagsTree;
    lineage.forEach(t => {
      stagedTraversal = stagedTraversal[t]?.children || {};
    });
    return stagedTraversal[tag.value] && stagedTraversal[tag.value].explicit;
  };

  // Returns the state of the tag as a string: [Unchecked/Implicit/Checked]
  const getTagState = (tag) => {
    if (isApplied(tag) || isStagedExplicit(tag)) {
      return intl.formatMessage(messages.taxonomyTagChecked);
    }

    if (isImplicit(tag)) {
      return intl.formatMessage(messages.taxonomyTagImplicit);
    }

    return intl.formatMessage(messages.taxonomyTagUnchecked);
  };

  const isTopOfTagTreeDropdown = (index) => index === 0 && level === 0;

  const loadMoreTags = useCallback(() => {
    setNumPages((x) => x + 1);
  }, []);

  const handleKeyBoardNav = (e, hasChildren) => {
    const keyPressed = e.code;
    const currentElement = e.target;
    const encapsulator = currentElement.closest('.dropdown-selector-tag-encapsulator');

    // Get tag value with full lineage, this is URI encoded
    const tagValueWithLineage = currentElement.querySelector('.pgn__form-checkbox-input')?.value;
    // Extract and decode the actual tag value
    let tagValue = tagValueWithLineage.split(',').slice(-1)[0];
    tagValue = tagValue ? decodeURIComponent(tagValue) : tagValue;

    if (keyPressed === 'ArrowRight') {
      e.preventDefault();
      if (tagValue && !isOpen(tagValue)) {
        clickAndEnterHandler(tagValue);
      }
    } else if (keyPressed === 'ArrowLeft') {
      e.preventDefault();
      if (tagValue && isOpen(tagValue)) {
        clickAndEnterHandler(tagValue);
      } else {
        // Handles case of jumping out of subtags to previous parent tag
        const prevParentTagEncapsulator = encapsulator?.parentNode.closest('.dropdown-selector-tag-encapsulator');
        const prevParentTag = prevParentTagEncapsulator?.querySelector('.dropdown-selector-tag-actions');
        prevParentTag?.focus();
      }
    } else if (keyPressed === 'ArrowUp') {
      const prevSubTags = encapsulator?.previousElementSibling?.querySelectorAll('.dropdown-selector-tag-actions');
      const prevSubTag = prevSubTags && prevSubTags[prevSubTags.length - 1];
      const prevTag = encapsulator?.previousElementSibling?.querySelector('.dropdown-selector-tag-actions');

      if (prevSubTag) {
        // Handles case of jumping in to subtags
        prevSubTag.focus();
      } else if (prevTag) {
        // Handles case of navigating to previous tag on same level
        prevTag.focus();
      } else {
        // Handles case of jumping out of subtags to previous parent tag
        const prevParentTagEncapsulator = encapsulator?.parentNode.closest('.dropdown-selector-tag-encapsulator');
        const prevParentTag = prevParentTagEncapsulator?.querySelector('.dropdown-selector-tag-actions');
        prevParentTag?.focus();
      }
    } else if (keyPressed === 'ArrowDown') {
      const subTagEncapsulator = encapsulator?.querySelector('.dropdown-selector-tag-encapsulator');
      const nextSubTag = subTagEncapsulator?.querySelector('.dropdown-selector-tag-actions');
      const nextTag = encapsulator?.nextElementSibling?.querySelector('.dropdown-selector-tag-actions');

      if (nextSubTag) {
        // Handles case of jumping into subtags
        nextSubTag.focus();
      } else if (nextTag) {
        // Handles case of navigating to next tag on same level
        nextTag?.focus();
      } else {
        // Handles case of jumping out of subtags to next focusable parent tag
        let nextParentTagEncapsulator = encapsulator?.parentNode?.closest('.dropdown-selector-tag-encapsulator');

        while (nextParentTagEncapsulator) {
          const nextParentTag = nextParentTagEncapsulator.nextElementSibling?.querySelector(
            '.dropdown-selector-tag-actions',
          );
          if (nextParentTag) {
            nextParentTag.focus();
            break;
          }
          nextParentTagEncapsulator = nextParentTagEncapsulator.parentNode.closest(
            '.dropdown-selector-tag-encapsulator',
          );
        }
      }
    } else if (keyPressed === 'Enter') {
      e.preventDefault();
      if (hasChildren && tagValue) {
        clickAndEnterHandler(tagValue);
      } else {
        const checkbox = currentElement.querySelector('.taxonomy-tags-selectable-box');
        checkbox.click();
      }
    } else if (keyPressed === 'Space') {
      e.preventDefault();
      const checkbox = currentElement.querySelector('.taxonomy-tags-selectable-box');
      checkbox.click();
    }
  };

  return (
    <div style={{ marginLeft: `${level * 1 }rem` }}>
      {tagPages.isLoading ? (
        <div className="d-flex justify-content-center align-items-center flex-row">
          <Spinner
            animation="border"
            size="xl"
            screenReaderText={intl.formatMessage(messages.loadingTagsDropdownMessage)}
          />
        </div>
      ) : null }
      {tagPages.isError ? 'Error...' : null /* TODO: show a proper error message */}

      {tagPages.data?.map((tagData, i) => (
        <div key={tagData.value} className="mt-1 ml-1 dropdown-selector-tag-encapsulator">
          <div
            className="d-flex flex-row"
            style={{
              minHeight: '44px',
            }}
          >
            {/* The tabIndex and onKeyDown are needed to implement custom keyboard navigation */}
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
            <div
              className="d-flex dropdown-selector-tag-actions"
              // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
              tabIndex={isTopOfTagTreeDropdown(i) ? 0 : -1} // Only enable tab into top of dropdown tree to set focus
              onKeyDown={(e) => handleKeyBoardNav(e, tagData.childCount > 0)}
              aria-label={
                intl.formatMessage(
                  (isTopOfTagTreeDropdown(i)
                    ? messages.taxonomyTagActionInstructionsAriaLabel
                    : messages.taxonomyTagActionsAriaLabel),
                  { tag: tagData.value, tagState: getTagState(tagData) },
                )
              }
            >
              <SelectableBox
                inputHidden={false}
                type="checkbox"
                className="d-flex align-items-center taxonomy-tags-selectable-box"
                data-selectable-box="taxonomy-tags"
                value={[...lineage, tagData.value].map(t => encodeURIComponent(t)).join(',')}
                isIndeterminate={isApplied(tagData) || isImplicit(tagData)}
                disabled={isApplied(tagData) || isImplicit(tagData)}
                tabIndex="-1"
              >
                <HighlightedText text={tagData.value} highlight={searchTerm} />
              </SelectableBox>
              { tagData.childCount > 0
                && (
                  <div className="d-flex align-items-center taxonomy-tags-arrow-drop-down">
                    <Icon
                      src={isOpen(tagData.value) ? ArrowDropUp : ArrowDropDown}
                      onClick={() => clickAndEnterHandler(tagData.value)}
                      tabIndex={-1}
                    />
                  </div>
                )}
            </div>

          </div>

          { tagData.childCount > 0 && isOpen(tagData.value) && (
            <ContentTagsDropDownSelector
              taxonomyId={taxonomyId}
              level={level + 1}
              lineage={[...lineage, tagData.value]}
              appliedContentTagsTree={appliedContentTagsTree}
              stagedContentTagsTree={stagedContentTagsTree}
              searchTerm={searchTerm}
            />
          )}

        </div>
      ))}

      { hasMorePages
        ? (
          <div>
            <Button
              tabIndex={0}
              variant="tertiary"
              iconBefore={Add}
              onClick={loadMoreTags}
              className="mb-2 ml-1 taxonomy-tags-load-more-button px-0 text-info-500"
            >
              <FormattedMessage {...messages.loadMoreTagsButtonText} />
            </Button>
          </div>
        )
        : null}

      { tagPages.data.length === 0 && !tagPages.isLoading && (
        <div className="d-flex justify-content-center muted-text">
          { searchTerm
            ? <FormattedMessage {...messages.noTagsFoundMessage} values={{ searchTerm }} />
            : <FormattedMessage {...messages.noTagsInTaxonomyMessage} />}
        </div>
      )}

    </div>
  );
};

ContentTagsDropDownSelector.defaultProps = {
  lineage: [],
  searchTerm: '',
};

ContentTagsDropDownSelector.propTypes = {
  taxonomyId: PropTypes.number.isRequired,
  level: PropTypes.number.isRequired,
  lineage: PropTypes.arrayOf(PropTypes.string),
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
  searchTerm: PropTypes.string,
};

export default ContentTagsDropDownSelector;
