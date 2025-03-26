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
import { useContainer, useUpdateContainer } from '../data/apiHooks';
import messages from './messages';

const ContainerInfoHeader = () => {
  const intl = useIntl();
  const [inputIsActive, setIsActive] = useState(false);

  const { libraryId, readOnly } = useLibraryContext();
  const { sidebarComponentInfo } = useSidebarContext();

  const containerId = sidebarComponentInfo?.id;
  // istanbul ignore if: this should never happen
  if (!containerId) {
    throw new Error('containerId is required');
  }

  const { data: container } = useContainer(libraryId, containerId);

  const updateMutation = useUpdateContainer(containerId);
  const { showToast } = useContext(ToastContext);

  const handleSaveDisplayName = useCallback(
    (event) => {
      const newDisplayName = event.target.value;
      if (newDisplayName && newDisplayName !== container?.displayName) {
        updateMutation.mutateAsync({
          displayName: newDisplayName,
        }).then(() => {
          showToast(intl.formatMessage(messages.updateContainerSuccessMsg));
        }).catch(() => {
          showToast(intl.formatMessage(messages.updateContainerErrorMsg));
        }).finally(() => {
          setIsActive(false);
        });
      } else {
        setIsActive(false);
      }
    },
    [container, showToast, intl],
  );

  if (!container) {
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
            defaultValue={container.displayName}
            onBlur={handleSaveDisplayName}
            onKeyDown={handleOnKeyDown}
          />
        )
        : (
          <>
            <span className="font-weight-bold m-1.5">
              {container.displayName}
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

export default ContainerInfoHeader;
