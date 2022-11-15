import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import { Icon, IconButton, Truncate } from '@edx/paragon';
import { Edit } from '@edx/paragon/icons';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { localTitleHooks } from './hooks';
import messages from './messages';
import EditableHeader from './EditableHeader';

export const TitleHeader = ({
  isInitialized,
  // injected
  intl,
}) => {
  if (!isInitialized) { return intl.formatMessage(messages.loading); }
  const dispatch = useDispatch();

  const {
    inputRef,
    isEditing,
    handleChange,
    handleKeyDown,
    localTitle,
    startEditing,
    cancelEdit,
    updateTitle,
  } = localTitleHooks({ dispatch });

  if (isEditing) {
    return (
      <EditableHeader
        {...{
          inputRef,
          handleChange,
          handleKeyDown,
          localTitle,
          updateTitle,
          cancelEdit,
        }}
      />
    );
  }
  return (
    <div className="d-flex">
      <Truncate>
        {localTitle}
      </Truncate>
      <IconButton
        alt={intl.formatMessage(messages.editTitleLabel)}
        iconAs={Icon}
        className="mr-2"
        onClick={startEditing}
        size="sm"
        src={Edit}
      />
    </div>
  );
};
TitleHeader.defaultProps = {};
TitleHeader.propTypes = {
  isInitialized: PropTypes.bool.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(TitleHeader);
