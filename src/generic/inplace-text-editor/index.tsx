import React, {
  useCallback,
  useState,
} from 'react';
import {
  Form,
  Icon,
  IconButton,
  Truncate,
  Stack,
} from '@openedx/paragon';
import { Edit } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';

interface InplaceTextEditorProps {
  text: string;
  onSave: (newText: string) => Promise<void>;
  readOnly?: boolean;
  textClassName?: string;
}

export const InplaceTextEditor: React.FC<InplaceTextEditorProps> = ({
  text,
  onSave,
  readOnly = false,
  textClassName,
}) => {
  const intl = useIntl();
  const [inputIsActive, setIsActive] = useState(false);
  const [pendingSaveText, setPendingSaveText] = useState<string>(); // state with the new text while updating

  const handleOnChangeText = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => {
      const inputText = event.currentTarget.value;
      setIsActive(false);
      if (inputText && inputText !== text) {
        // NOTE: While using react query for optimistic updates would be the best approach,
        // it could not be possible in some cases. For that reason, we use the `pendingSaveText` state
        // to show the new text while saving.
        setPendingSaveText(inputText);
        try {
          await onSave(inputText);
        } catch {
          // don't propagate the exception
        } finally {
          // reset the pending save text
          setPendingSaveText(undefined);
        }
      }
    },
    [text],
  );

  const handleEdit = () => {
    setIsActive(true);
  };

  const handleOnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleOnChangeText(event);
    } else if (event.key === 'Escape') {
      setIsActive(false);
    }
  };

  // If we have the `pendingSaveText` state it means that we are in the process of saving the new text.
  // In that case, we show the new text instead of the original in read-only mode as an optimistic update.
  if (readOnly || pendingSaveText) {
    return (
      <Truncate.Deprecated className={textClassName}>
        {pendingSaveText || text}
      </Truncate.Deprecated>
    );
  }

  return (
    <Stack
      direction="horizontal"
      gap={1}
    >
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
            <Truncate.Deprecated className={textClassName}>
              {text}
            </Truncate.Deprecated>
            <IconButton
              src={Edit}
              iconAs={Icon}
              alt={intl.formatMessage(messages.editTextButtonAlt)}
              onClick={handleEdit}
              size="sm"
            />
          </>
        )}
    </Stack>
  );
};
