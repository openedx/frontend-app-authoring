import React from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { SearchField } from '@openedx/paragon';
import messages from './messages';
import { useSearchContext } from './SearchManager';

/**
 * The "main" input field where users type in search keywords. The search happens as they type (no need to press enter).
 */
const SearchKeywordsField: React.FC<{ className?: string, placeholder?: string }> = (props) => {
  const intl = useIntl();
  const { searchKeywords, setSearchKeywords, usageKey } = useSearchContext();
  const defaultPlaceholder = usageKey ? messages.clearUsageKeyToSearch : messages.inputPlaceholder;
  const { placeholder = intl.formatMessage(defaultPlaceholder) } = props;

  return (
    <SearchField.Advanced
      onSubmit={setSearchKeywords}
      onChange={setSearchKeywords}
      onClear={() => setSearchKeywords('')}
      value={searchKeywords}
      className={props.className}
      disabled={!!usageKey}
    >
      <SearchField.Label />
      <SearchField.Input
        autoFocus
        placeholder={placeholder}
      />
      <SearchField.ClearButton />
      <SearchField.SubmitButton />
    </SearchField.Advanced>
  );
};

export default SearchKeywordsField;
