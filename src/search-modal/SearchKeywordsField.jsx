/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { SearchField } from '@openedx/paragon';
import messages from './messages';
import { useSearchContext } from './manager/SearchManager';

/**
 * The "main" input field where users type in search keywords. The search happens as they type (no need to press enter).
 * @type {React.FC<{className?: string}>}
 */
const SearchKeywordsField = (props) => {
  const intl = useIntl();
  const { searchKeywords, setSearchKeywords } = useSearchContext();

  return (
    <SearchField
      onSubmit={setSearchKeywords}
      onChange={setSearchKeywords}
      onClear={() => setSearchKeywords('')}
      value={searchKeywords}
      className={props.className}
      placeholder={intl.formatMessage(messages.inputPlaceholder)}
    />
  );
};

export default SearchKeywordsField;
