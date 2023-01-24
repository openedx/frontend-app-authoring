import React from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import { Icon, IconButton, Truncate } from '@edx/paragon';
import { EditOutline } from '@edx/paragon/icons';
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
    <div className="d-flex flex-row align-items-center">
      <Truncate>
        {localTitle}
      </Truncate>
      <IconButton
        alt={intl.formatMessage(messages.editTitleLabel)}
        iconAs={Icon}
        className="mx-2"
        onClick={startEditing}
        size="sm"
        src={EditOutline}
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
