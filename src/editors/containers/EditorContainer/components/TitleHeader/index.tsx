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

/**
 * The title and its edit affordance. Mounted only once the editor is ready, so
 * `localTitleHooks` seeds its state from the block's title rather than an empty
 * store, and the loading render never runs a different hook list than this one.
 */
const TitleHeaderBody = ({ isEditDisabled }: { isEditDisabled: boolean; }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
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

/**
 * The loading render mounts no title hooks at all: the body arrives with the
 * editor and seeds itself from the title that arrives with it.
 */
const TitleHeader = ({ isInitialized, isEditDisabled = false }: Props) => {
  if (!isInitialized) { return <FormattedMessage {...messages.loading} />; }
  return <TitleHeaderBody isEditDisabled={isEditDisabled} />;
};

export default TitleHeader;
