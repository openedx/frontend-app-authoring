import React from 'react';
import PropTypes from 'prop-types';
import { Button, Card } from '@edx/paragon';

const DeletePopup = ({
  label,
  bodyText,
  onDelete,
  deleteLabel,
  onCancel,
  cancelLabel,
}) => (
  <Card className="rounded mb-3 p-1">
    <Card.Body>
      <div className="text-primary-500 mb-2 h4">{label}</div>
      <Card.Text className="text-justify text-muted">{bodyText}</Card.Text>
      <div className="d-flex justify-content-end">
        <Button variant="tertiary" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant="outline-brand" className="ml-2" onClick={onDelete}>
          {deleteLabel}
        </Button>
      </div>
    </Card.Body>
  </Card>
);

DeletePopup.propTypes = {
  label: PropTypes.string.isRequired,
  bodyText: PropTypes.string.isRequired,
  onDelete: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  deleteLabel: PropTypes.string.isRequired,
  cancelLabel: PropTypes.string.isRequired,
};

export default DeletePopup;
