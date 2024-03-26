/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import { useSearchBox } from 'react-instantsearch';
import { useIntl } from '@edx/frontend-platform/i18n';
import { SearchField } from '@openedx/paragon';
import messages from './messages';

/**
 * The "main" input field where users type in search keywords. The search happens as they type (no need to press enter).
 * @type {React.FC<import('react-instantsearch').UseSearchBoxProps & {className?: string}>}
 */
const SearchKeywordsField = (props) => {
  const intl = useIntl();
  const { query, refine } = useSearchBox(props);

  return (
    <SearchField
      onSubmit={refine}
      onChange={refine}
      onClear={() => refine('')}
      value={query}
      className={props.className}
      placeholder={intl.formatMessage(messages.inputPlaceholder)}
    />
  );
};

export default SearchKeywordsField;
