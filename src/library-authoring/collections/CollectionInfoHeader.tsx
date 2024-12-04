import React, { useState, useContext, useCallback } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Icon,
  IconButton,
  Stack,
  Form,
} from '@openedx/paragon';
import { Edit } from '@openedx/paragon/icons';

import { ToastContext } from '../../generic/toast-context';
import { useLibraryContext } from '../common/context/LibraryContext';
import { useSidebarContext } from '../common/context/SidebarContext';
import { useCollection, useUpdateCollection } from '../data/apiHooks';
import messages from './messages';

const CollectionInfoHeader = () => {
  const intl = useIntl();
  const [inputIsActive, setIsActive] = useState(false);

  const { libraryId, readOnly } = useLibraryContext();
  const { sidebarComponentInfo } = useSidebarContext();

  const collectionId = sidebarComponentInfo?.id;
  // istanbul ignore if: this should never happen
  if (!collectionId) {
    throw new Error('collectionId is required');
  }

  const { data: collection } = useCollection(libraryId, collectionId);

  const updateMutation = useUpdateCollection(libraryId, collectionId);
  const { showToast } = useContext(ToastContext);

  const handleSaveDisplayName = useCallback(
    (event) => {
      const newTitle = event.target.value;
      if (newTitle && newTitle !== collection?.title) {
        updateMutation.mutateAsync({
          title: newTitle,
        }).then(() => {
          showToast(intl.formatMessage(messages.updateCollectionSuccessMsg));
        }).catch(() => {
          showToast(intl.formatMessage(messages.updateCollectionErrorMsg));
        }).finally(() => {
          setIsActive(false);
        });
      } else {
        setIsActive(false);
      }
    },
    [collection, showToast, intl],
  );

  if (!collection) {
    return null;
  }

  const handleClick = () => {
    setIsActive(true);
  };

  const handleOnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSaveDisplayName(event);
    } else if (event.key === 'Escape') {
      setIsActive(false);
    }
  };

  return (
    <Stack direction="horizontal">
      {inputIsActive
        ? (
          <Form.Control
            autoFocus
            name="title"
            id="title"
            type="text"
            aria-label="Title input"
            defaultValue={collection.title}
            onBlur={handleSaveDisplayName}
            onKeyDown={handleOnKeyDown}
          />
        )
        : (
          <>
            <span className="font-weight-bold m-1.5">
              {collection.title}
            </span>
            {!readOnly && (
              <IconButton
                src={Edit}
                iconAs={Icon}
                alt={intl.formatMessage(messages.editTitleButtonAlt)}
                onClick={handleClick}
                size="inline"
              />
            )}
          </>
        )}
    </Stack>
  );
};

export default CollectionInfoHeader;
