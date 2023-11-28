import React, { useState } from 'react';
import {
  SelectableBox,
  Icon,
  Spinner,
} from '@edx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { ArrowDropDown, ArrowDropUp } from '@edx/paragon/icons';
import PropTypes from 'prop-types';
import messages from './messages';
import './ContentTagsDropDownSelector.scss';

import { useTaxonomyTagsDataResponse, useIsTaxonomyTagsDataLoaded } from './data/apiHooks';

const ContentTagsDropDownSelector = ({
  taxonomyId, level, subTagsUrl,
}) => {
  const intl = useIntl();
  // This object represents the states of the dropdowns on this level
  // The keys represent the index of the dropdown with
  // the value true (open) false (closed)
  const [dropdownStates, setDropdownStates] = useState({});

  const isOpen = (i) => dropdownStates[i];

  const clickAndEnterHandler = (i) => {
    // This flips the state of the dropdown at index false (closed) -> true (open)
    // and vice versa. Initially they are undefined which is falsy.
    setDropdownStates({ ...dropdownStates, [i]: !dropdownStates[i] });
  };

  const taxonomyTagsData = useTaxonomyTagsDataResponse(taxonomyId, subTagsUrl);
  const isTaxonomyTagsLoaded = useIsTaxonomyTagsDataLoaded(taxonomyId, subTagsUrl);

  return (
    isTaxonomyTagsLoaded && taxonomyTagsData
      ? taxonomyTagsData.results.map((taxonomyTag, i) => (
        <div className="d-flex flex-column" key={`selector-div-${taxonomyTag.value}`} style={{ paddingLeft: `${level * 1}rem` }}>
          <div className="d-flex">
            <SelectableBox
              inputHidden={false}
              type="checkbox"
              className="taxonomy-tags-selectable-box"
              aria-label={`${taxonomyTag.value} checkbox`}
              data-selectable-box="taxonomy-tags"
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
            />
          )}

        </div>
      ))
      : (
        <div className="d-flex justify-content-center align-items-center flex-column">
          <Spinner
            animation="border"
            size="xl"
            screenReaderText={intl.formatMessage(messages.loadingTagsDropdownMessage)}
          />
        </div>
      )
  );
};

ContentTagsDropDownSelector.defaultProps = {
  subTagsUrl: undefined,
};

ContentTagsDropDownSelector.propTypes = {
  taxonomyId: PropTypes.number.isRequired,
  level: PropTypes.number.isRequired,
  subTagsUrl: PropTypes.string,
};

export default ContentTagsDropDownSelector;
