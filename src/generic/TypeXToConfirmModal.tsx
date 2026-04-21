import React, { useEffect } from 'react';
import { Button, Form, ModalDialog } from '@openedx/paragon';

interface TypeXToConfirmModalProps {
  label: string;
  bodyText: string;
  confirmLabel: string;
  cancelLabel: string;
  X: string;
  context?: any;
  isOpen: boolean;
  onConfirm: (context?: any) => void;
  onCancel: () => void;
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
}) => {
  const [confirmedByTyping, setConfirmedByTyping] = React.useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!confirmedByTyping) return;
    if (e.key === 'Enter') {
      onConfirm(context);
    }
  };

  const handleConfirm = () => {
    if (!confirmedByTyping) return;
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
    }
  }, [X, isOpen]);

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
        <div>{bodyText}</div>
        <div>
          <div>
            Type <span className="text-primary-500 font-weight-bold">{X}</span> to confirm
          </div>
          <Form.Control
            onKeyDown={handleKeyDown}
            onChange={handleChange}
          />
        </div>
        <ModalDialog.Footer>
          <Button variant="tertiary" onClick={handleCancel}>
            {cancelLabel}
          </Button>
          <Button onClick={handleConfirm} disabled={!confirmedByTyping}>
            {confirmLabel}
          </Button>
        </ModalDialog.Footer>
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default React.memo(TypeXToConfirmModal);
