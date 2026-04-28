import React, { useEffect } from 'react';
import {
  ActionRow,
  Button,
  Card,
  Form,
  Icon,
  ModalDialog,
} from '@openedx/paragon';
import { WarningFilled } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from './messages';

interface TypeXToConfirmModalProps {
  label: string;
  bodyText: string | React.ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  X: string;
  confirmPayload?: Record<string, any> | null;
  isOpen: boolean;
  onConfirm: (confirmPayload?: Record<string, any> | null) => void;
  onCancel: () => void;
  setConfirmPayload?: (confirmPayload: Record<string, any> | null) => void;
}

const TypeXToConfirmModal: React.FC<TypeXToConfirmModalProps> = ({
  label,
  X,
  bodyText,
  confirmLabel,
  cancelLabel,
  isOpen,
  confirmPayload,
  onConfirm,
  onCancel,
  setConfirmPayload,
}) => {
  const [confirmedByTyping, setConfirmedByTyping] = React.useState(false);
  const intl = useIntl();

  const handleConfirm = () => {
    if (!confirmedByTyping) { return; }
    setConfirmedByTyping(false);
    onConfirm(confirmPayload);
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
      if (setConfirmPayload) {
        setConfirmPayload(null);
      }
    }
  }, [X, isOpen, confirmPayload, setConfirmPayload]);

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
            {intl.formatMessage(messages.typeToConfirmInstruction, {
              X,
              strong: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
            })}
          </div>
          <Form.Control
            onChange={handleChange}
            className="mt-4"
          />
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <Button variant="tertiary" onClick={handleCancel}>
            {cancelLabel}
          </Button>
          <Button onClick={handleConfirm} disabled={!confirmedByTyping} variant="danger">
            {confirmLabel}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default React.memo(TypeXToConfirmModal);
