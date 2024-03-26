/* eslint-disable react/prop-types */
// @ts-check
import React from 'react';
import { useSearchBox } from 'react-instantsearch';
import { useIntl } from '@edx/frontend-platform/i18n';
import { SearchField } from '@openedx/paragon';
import messages from './messages';

/** @type {React.FC<import('react-instantsearch').UseSearchBoxProps & {className?: string}>} */
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
