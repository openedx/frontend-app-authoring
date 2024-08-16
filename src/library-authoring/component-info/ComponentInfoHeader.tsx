/* eslint-disable react/require-default-props */
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
import { useUpdateXBlockFields, useXBlockFields } from '../data/apiHooks';
import messages from './messages';

interface ComponentInfoHeaderProps {
  library: ContentLibrary;
  usageKey: string;
}

const ComponentInfoHeader = ({ library, usageKey }: ComponentInfoHeaderProps) => {
  const intl = useIntl();
  const [inputIsActive, setIsActive] = useState(false);

  const {
    data: xblockFields,
  } = useXBlockFields(library.id, usageKey);

  const updateMutation = useUpdateXBlockFields(library.id, usageKey);
  const { showToast } = useContext(ToastContext);

  const handleSaveDisplayName = useCallback(
    (event) => {
      const newDisplayName = event.target.value;
      if (newDisplayName && newDisplayName !== xblockFields?.displayName) {
        updateMutation.mutateAsync({
          metadata: {
            display_name: newDisplayName,
          },
        }).then(() => {
          showToast(intl.formatMessage(messages.updateComponentSuccessMsg));
        }).catch(() => {
          showToast(intl.formatMessage(messages.updateComponentErrorMsg));
        });
      }
      setIsActive(false);
    },
    [xblockFields, showToast, intl],
  );

  const handleClick = () => {
    setIsActive(true);
  };

  const hanldeOnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSaveDisplayName(event);
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
            name="displayName"
            id="displayName"
            type="text"
            aria-label="Display name input"
            defaultValue={xblockFields?.displayName}
            onBlur={handleSaveDisplayName}
            onKeyDown={hanldeOnKeyDown}
          />
        )
        : (
          <>
            <span className="font-weight-bold m-1.5">
              {xblockFields?.displayName}
            </span>
            {library.canEditLibrary && (
              <IconButton
                src={Edit}
                iconAs={Icon}
                alt={intl.formatMessage(messages.editNameButtonAlt)}
                onClick={handleClick}
              />
            )}
          </>
        )}
    </Stack>
  );
};

export default ComponentInfoHeader;
