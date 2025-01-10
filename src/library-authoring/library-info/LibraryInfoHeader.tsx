import { useState, useContext } from 'react';
import {
  Icon,
  IconButton,
  Stack,
  Form,
} from '@openedx/paragon';
import { Edit } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import { ToastContext } from '../../generic/toast-context';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useUpdateLibraryMetadata } from '../data/apiHooks';
import messages from './messages';

const LibraryInfoHeader = () => {
  const intl = useIntl();
  const [inputIsActive, setIsActive] = useState(false);
  const updateMutation = useUpdateLibraryMetadata();
  const { showToast } = useContext(ToastContext);
  const { libraryData: library, readOnly } = useLibraryContext();

  if (!library) {
    return null;
  }

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

  const handleOnKeyDown = (event) => {
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
            onKeyDown={handleOnKeyDown}
          />
        )
        : (
          <>
            <span className="font-weight-bold mt-1.5 ml-1.5">
              {library.title}
            </span>
            {!readOnly && (
              <IconButton
                src={Edit}
                iconAs={Icon}
                alt={intl.formatMessage(messages.editNameButtonAlt)}
                onClick={handleClick}
                className="mt-1 ml-2"
                size="inline"
              />
            )}
          </>
        )}
    </Stack>
  );
};

export default LibraryInfoHeader;
