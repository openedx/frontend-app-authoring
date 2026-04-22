import React, { useEffect } from 'react';
import { Button, Card, Form, Icon, ModalDialog } from '@openedx/paragon';
import { WarningFilled } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

interface TypeXToConfirmModalProps {
  label: string;
  bodyText: string | React.ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  X: string;
  // any additional context that the caller wants to pass to the onConfirm callback; not a React context.
  context?: Record<string, any> | null;
  isOpen: boolean;
  onConfirm: (context?: Record<string, any> | null) => void;
  onCancel: () => void;
  setContext?: (context: Record<string, any> | null) => void;
}

const TypeXToConfirmModal: React.FC<TypeXToConfirmModalProps> = ({
  label,
  X,
  bodyText,
  confirmLabel,
  cancelLabel,
  isOpen,
  context,
  onConfirm,
  onCancel,
  setContext,
}) => {
  const [confirmedByTyping, setConfirmedByTyping] = React.useState(false);
  const intl = useIntl();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!confirmedByTyping) { return; }
    if (e.key === 'Enter') {
      onConfirm(context);
    }
  };

  const handleConfirm = () => {
    if (!confirmedByTyping) { return; }
    setConfirmedByTyping(false);
    onConfirm(context);
  };

  const handleCancel = () => {
    setConfirmedByTyping(false);
    onCancel();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === X) {
      setConfirmedByTyping(true);
    } else {
      setConfirmedByTyping(false);
    }
  };

  // Don't remove. This is necessary to prevent an old state from erroneously enabling the confirm button
  useEffect(() => {
    if (!isOpen) {
      setConfirmedByTyping(false);
      if (setContext) {
        // reset onConfirm callback context when modal is closed
        setContext(null);
      }
    }
  }, [X, isOpen, context, setContext]);

  return (
    <ModalDialog
      title={label}
      isOpen={isOpen}
      onClose={handleCancel}
      isOverflowVisible
    >
      <ModalDialog.Header>
        <ModalDialog.Title>{label}</ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <Card className="bg-warning-100">
          <Card.Section>
            <div className="d-flex align-items-start mb-2">
              <Icon src={WarningFilled} className="text-warning-500 mr-2" />
              <div className="small">{bodyText}</div>
            </div>
          </Card.Section>
        </Card>
        <div className="mt-3">
          <div>
            {(() => {
              const messageText = intl.formatMessage(messages.typeToConfirmInstruction, { X });
              const parts = messageText.split(X);
              return (
                <>
                  {parts[0]}
                  <strong>{X}</strong>
                  {parts[1]}
                </>
              );
            })()}
          </div>
          <Form.Control
            onKeyDown={handleKeyDown}
            onChange={handleChange}
            className="mt-4"
          />
        </div>
        <ModalDialog.Footer>
          <Button variant="tertiary" onClick={handleCancel}>
            {cancelLabel}
          </Button>
          <Button onClick={handleConfirm} disabled={!confirmedByTyping} variant="danger">
            {confirmLabel}
          </Button>
        </ModalDialog.Footer>
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default React.memo(TypeXToConfirmModal);
