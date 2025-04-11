import React, { useCallback, useState } from 'react';
import {
  Form,
  Icon,
  IconButton,
  Stack,
} from '@openedx/paragon';
import { Edit } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';

interface InplaceTextEditorProps {
  text: string;
  onSave: (newText: string) => void;
  readOnly?: boolean;
  textClassName?: string;
  showEditButton?: boolean;
}

export const InplaceTextEditor: React.FC<InplaceTextEditorProps> = ({
  text,
  onSave,
  readOnly = false,
  textClassName,
  showEditButton = false,
}) => {
  const intl = useIntl();
  const [inputIsActive, setIsActive] = useState(false);

  const handleOnChangeText = useCallback(
    (event) => {
      const newText = event.target.value;
      if (newText && newText !== text) {
        onSave(newText);
      }
      setIsActive(false);
    },
    [text],
  );

  const handleClick = () => {
    setIsActive(true);
  };

  const handleOnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleOnChangeText(event);
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
            type="text"
            aria-label="Text input"
            defaultValue={text}
            onBlur={handleOnChangeText}
            onKeyDown={handleOnKeyDown}
          />
        )
        : (
          <>
            <span
              className={textClassName}
              role="button"
              onClick={!readOnly ? handleClick : undefined}
              onKeyDown={!readOnly ? handleClick : undefined}
              tabIndex={0}
            >
              {text}
            </span>
            {!readOnly && showEditButton && (
              <IconButton
                src={Edit}
                iconAs={Icon}
                alt={intl.formatMessage(messages.editTextButtonAlt)}
                onClick={handleClick}
                size="inline"
              />
            )}
          </>
        )}
    </Stack>
  );
};
