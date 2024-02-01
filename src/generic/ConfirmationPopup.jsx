import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card } from '@openedx/paragon';

const ConfirmationPopup = ({
  label,
  bodyText,
  onConfirm,
  confirmLabel,
  onCancel,
  cancelLabel,
  confirmVariant,
  confirmButtonClass,
  cancelButtonClass,
  sectionClasses,
}) => (
  <Card className="rounded px-1 mt-4">
    <Card.Header
      className="text-primary-500"
      title={label}
      size="sm"
    />
    <Card.Body>
      <Card.Section className={`text-justify text-muted pt-2 pb-3 ${sectionClasses}`}>{bodyText}</Card.Section>
      <Card.Footer>
        <Button variant="tertiary" className={cancelButtonClass} onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant={confirmVariant} className={`ml-2 ${confirmButtonClass}`} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </Card.Footer>
    </Card.Body>
  </Card>
);

ConfirmationPopup.propTypes = {
  label: PropTypes.string.isRequired,
  bodyText: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  confirmLabel: PropTypes.string.isRequired,
  cancelLabel: PropTypes.string.isRequired,
  confirmButtonClass: PropTypes.string,
  cancelButtonClass: PropTypes.string,
  confirmVariant: PropTypes.string,
  sectionClasses: PropTypes.string,
};
ConfirmationPopup.defaultProps = {
  confirmVariant: 'outline-brand',
  confirmButtonClass: '',
  cancelButtonClass: '',
  sectionClasses: '',
};

export default React.memo(ConfirmationPopup);
