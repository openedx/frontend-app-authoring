import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Icon, IconButton, Truncate } from '@openedx/paragon';
import { EditOutline } from '@openedx/paragon/icons';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';

import { selectors } from '@src/editors/data/redux';
import { localTitleHooks } from './hooks';
import messages from './messages';
import EditableHeader from './EditableHeader';

interface Props {
  isInitialized: boolean;
  /** Set while a save is in flight: a title change could no longer be part of it. */
  isEditDisabled?: boolean;
}

const TitleHeader = ({
  isInitialized,
  isEditDisabled = false,
}: Props) => {
  const intl = useIntl();
  if (!isInitialized) { return <FormattedMessage {...messages.loading} />; }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const dispatch = useDispatch();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const title = useSelector(selectors.app.displayTitle);

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

  // While editing is locked the plain title is shown even mid-edit, so nothing
  // further can be typed into it.
  if (isEditing && !isEditDisabled) {
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
    <div className="d-flex flex-row align-items-center mt-1">
      <Truncate.Deprecated>
        {title}
      </Truncate.Deprecated>
      <IconButton
        alt={intl.formatMessage(messages.editTitleLabel)}
        iconAs={Icon}
        className="mx-2"
        onClick={startEditing}
        disabled={isEditDisabled}
        size="sm"
        src={EditOutline}
      />
    </div>
  );
};
export default TitleHeader;
