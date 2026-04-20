import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, ModalDialog } from '@openedx/paragon';

const TypeXToConfirmPopup = ({
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

  return (
    <ModalDialog
      title={label}
      isOpen={isOpen}
      onClose={onCancel}
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
            onChange={(e) => e.target.value === X ? setConfirmedByTyping(true) : setConfirmedByTyping(false)}
          />
        </div>
        <ModalDialog.Footer>
          <Button variant="tertiary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button onClick={() => onConfirm(context)} disabled={!confirmedByTyping}>
            {confirmLabel}
          </Button>
        </ModalDialog.Footer>
      </ModalDialog.Body>
    </ModalDialog>
  );
};

TypeXToConfirmPopup.propTypes = {
  label: PropTypes.string.isRequired,
  bodyText: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  confirmLabel: PropTypes.string.isRequired,
  cancelLabel: PropTypes.string.isRequired,
  X: PropTypes.string.isRequired,
  context: PropTypes.any,
  confirmButtonClass: PropTypes.string,
  cancelButtonClass: PropTypes.string,
  confirmVariant: PropTypes.string,
};
TypeXToConfirmPopup.defaultProps = {
  confirmVariant: 'outline-brand',
  confirmButtonClass: '',
  cancelButtonClass: '',
};

export default React.memo(TypeXToConfirmPopup);
