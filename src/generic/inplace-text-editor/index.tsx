import React, {
  useCallback,
  useEffect,
  useState,
  forwardRef,
} from 'react';
import {
  Form,
  Icon,
  IconButton,
  OverlayTrigger,
  Stack,
} from '@openedx/paragon';
import { Edit } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';

interface IconWrapperProps {
  popper: any;
  children: React.ReactNode;
  [key: string]: any;
}

const IconWrapper = forwardRef<HTMLDivElement, IconWrapperProps>(({ popper, children, ...props }, ref) => {
  useEffect(() => {
    // This is a workaround to force the popper to update its position when
    // the editor is opened.
    // Ref: https://react-bootstrap.netlify.app/docs/components/overlays/#updating-position-dynamically
    popper.scheduleUpdate();
  }, [popper, children]);

  return (
    <div ref={ref} {...props}>
      {children}
    </div>
  );
});

interface InplaceTextEditorProps {
  text: string;
  onSave: (newText: string) => void;
  readOnly?: boolean;
  textClassName?: string;
  alwaysShowEditButton?: boolean;
}

export const InplaceTextEditor: React.FC<InplaceTextEditorProps> = ({
  text,
  onSave,
  readOnly = false,
  textClassName,
  alwaysShowEditButton = false,
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

  if (readOnly) {
    return (
      <span className={textClassName}>
        {text}
      </span>
    );
  }

  if (alwaysShowEditButton) {
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
            <span className={textClassName}>
              {text}
            </span>
          )}
        <IconButton
          src={Edit}
          iconAs={Icon}
          alt={intl.formatMessage(messages.editTextButtonAlt)}
          onClick={handleEdit}
          size="inline"
        />
      </Stack>
    );
  }

  return (
    <OverlayTrigger
      trigger={['hover', 'focus']}
      placement="right"
      overlay={(
        <IconWrapper>
          <Icon
            id="edit-text-icon"
            src={Edit}
            className="ml-1.5"
            onClick={handleEdit}
          />
        </IconWrapper>
      )}
    >
      <div>
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
            <span
              onClick={handleEdit}
              onKeyDown={handleEdit}
              className={textClassName}
              role="button"
              tabIndex={0}
            >
              {text}
            </span>
          )}
      </div>
    </OverlayTrigger>
  );
};
