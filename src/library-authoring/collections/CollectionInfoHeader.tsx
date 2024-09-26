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
import type { ContentLibrary } from '../data/api';
import type { CollectionHit } from '../../search-manager/data/api';
import { useUpdateCollection } from '../data/apiHooks';
import messages from './messages';

interface CollectionInfoHeaderProps {
  library: ContentLibrary;
  collection: CollectionHit;
}

const CollectionInfoHeader = ({ library, collection }: CollectionInfoHeaderProps) => {
  const intl = useIntl();
  const [inputIsActive, setIsActive] = useState(false);

  const updateMutation = useUpdateCollection(library.id, collection.blockId);
  const { showToast } = useContext(ToastContext);

  const handleSaveDisplayName = useCallback(
    (event) => {
      const newTitle = event.target.value;
      if (newTitle && newTitle !== collection.displayName) {
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
            defaultValue={collection.displayName}
            onBlur={handleSaveDisplayName}
            onKeyDown={handleOnKeyDown}
          />
        )
        : (
          <>
            <span className="font-weight-bold m-1.5">
              {collection.displayName}
            </span>
            {library.canEditLibrary && (
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
