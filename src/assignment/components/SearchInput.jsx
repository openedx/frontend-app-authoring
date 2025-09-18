import React from 'react';
import { Form, Icon, IconButton } from '@openedx/paragon';
import { Search, Close } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import { useAssignmentContext } from '../context/AssignmentContext';
import messages from '../data/messages';

const SearchBar = () => {
  const intl = useIntl();
  const { searchQuery, setSearchQuery } = useAssignmentContext();

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  return (
    <div className="search-bar">
      <Form.Control
        type="text"
        value={searchQuery}
        onChange={handleInputChange}
        placeholder={intl.formatMessage(messages.searchPlaceholder)}
        aria-label={intl.formatMessage(messages.searchPlaceholder)}
        trailingElement={
          searchQuery?.length > 0 ? (
            <IconButton
              iconAs={Icon}
              src={Close}
              alt={intl.formatMessage(messages.clearSearch)} 
              size="sm"
              variant="tertiary"
              onClick={handleClear}
            />
          ) : (
            <Icon src={Search} />
          )
        }
      />
    </div>
  );
};

export default SearchBar;
