import React, { useState, useContext } from 'react';
import {
  Icon,
  IconButton,
  Stack,
  Form,
} from '@openedx/paragon';
import { Edit } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';
import type { ContentLibrary } from '../data/api';
import { useUpdateLibraryMetadata } from '../data/apiHooks';
import { ToastContext } from '../../generic/toast-context';

type LibraryInfoHeaderProps = {
  library: ContentLibrary,
};

const LibraryInfoHeader = ({ library } : LibraryInfoHeaderProps) => {
  const intl = useIntl();
  const [inputIsActive, setIsActive] = useState(false);
  const updateMutation = useUpdateLibraryMetadata();
  const { showToast } = useContext(ToastContext);

  const handleSaveTitle = (event) => {
    const newTitle = event.target.value;
    if (newTitle && newTitle !== library.title) {
      updateMutation.mutateAsync({
        id: library.id,
        title: newTitle,
      }).then(() => {
        showToast(intl.formatMessage(messages.updateLibrarySuccessMsg));
      }).catch(() => {
        showToast(intl.formatMessage(messages.updateLibraryErrorMsg));
      });
    }
    setIsActive(false);
  };

  const handleClick = () => {
    setIsActive(true);
  };

  const hanldeOnKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSaveTitle(event);
    } else if (event.key === 'Escape') {
      setIsActive(false);
    }
  };

  return (
    <Stack direction="horizontal">
      { inputIsActive
        ? (
          <Form.Control
            autoFocus
            name="title"
            id="title"
            type="text"
            aria-label="Title input"
            defaultValue={library.title}
            onBlur={handleSaveTitle}
            onKeyDown={hanldeOnKeyDown}
          />
        )
        : (
          <>
            <span className="font-weight-bold mt-1.5 ml-1.5">
              {library.title}
            </span>
            {library.canEditLibrary && (
              <IconButton
                src={Edit}
                iconAs={Icon}
                alt={intl.formatMessage(messages.editNameButtonAlt)}
                onClick={handleClick}
                className="mt-1"
                size="inline"
              />
            )}
          </>
        )}
    </Stack>
  );
};

export default LibraryInfoHeader;
