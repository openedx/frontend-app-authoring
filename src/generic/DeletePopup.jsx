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
  <Card className="rounded mb-3 px-1">
    <Card.Header
      className="text-primary-500"
      title={label}
      size="sm"
    />
    <Card.Body>
      <Card.Section className="text-justify text-muted pt-2 pb-3">{bodyText}</Card.Section>
      <Card.Footer>
        <Button variant="tertiary" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant="outline-brand" className="ml-2" onClick={onDelete}>
          {deleteLabel}
        </Button>
      </Card.Footer>
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
