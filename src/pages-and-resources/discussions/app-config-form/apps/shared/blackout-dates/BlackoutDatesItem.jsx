import React, { useState } from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Button,
  Card,
  Form,
  Badge,
} from '@edx/paragon';
import PropTypes from 'prop-types';
import _ from 'lodash';

import messages from '../messages';
import BlackoutDatesInput from './BlackoutDatesInput';
import { formatBlackoutDates } from '../../../utils';
import {
  blackoutDatesStatus as constants,
  deleteHelperText,
  badgeVariant,
} from '../../../../data/constants';
import CollapsableEditor from '../../../../../../generic/CollapsableEditor';

const BlackoutDatesItem = ({
  intl,
  index,
  blackoutDate,
  onDelete,
  hasError,
  onClose,
}) => {
  const blackoutDatesHasError = !blackoutDate.startDate || !blackoutDate.endDate || hasError;
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [collapseIsOpen, setCollapseOpen] = useState(blackoutDatesHasError);

  const handleToggle = (isOpen) => {
    if (!isOpen && blackoutDatesHasError) {
      return setCollapseOpen(true);
    }
    return setCollapseOpen(isOpen);
  };

  const getHeading = (isOpen) => {
    if (isOpen) {
      return (
        <span className="h4 py-2 mr-auto">
          {intl.formatMessage(messages.configureBlackoutDates)}
        </span>
      );
    }
    return (
      <div className="py-2">
        <Badge variant={badgeVariant[blackoutDate.status]}>
          {intl.formatMessage(messages.blackoutDatesStatus, {
            status: _.startCase(_.toLower(blackoutDate.status)),
          })}
        </Badge>
        <div>{formatBlackoutDates(blackoutDate)}</div>
      </div>
    );
  };

  const deleteBlackoutDatesPopup = (status) => (
    <Card className="rounded mb-3 p-1">
      <Card.Body>
        <div className="text-primary-500 mb-2 h4">
          {status === constants.ACTIVE
            ? intl.formatMessage(messages.activeBlackoutDatesDeletionLabel)
            : intl.formatMessage(messages.blackoutDatesDeletionLabel)}
        </div>
        <Card.Text className="text-justify text-muted">
          {intl.formatMessage(deleteHelperText[blackoutDate.status])}
        </Card.Text>
        <div className="d-flex justify-content-end">
          <Button variant="tertiary" onClick={() => setShowDeletePopup(false)}>
            {intl.formatMessage(messages.cancelButton)}
          </Button>
          <Button variant="outline-brand" className="ml-2" onClick={onDelete}>
            {intl.formatMessage(messages.deleteButton)}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  if (showDeletePopup) { return deleteBlackoutDatesPopup(blackoutDate.status); }

  return (
    <CollapsableEditor
      open={collapseIsOpen}
      onToggle={handleToggle}
      title={getHeading(collapseIsOpen)}
      onDelete={() => setShowDeletePopup(true)}
      expandAlt={intl.formatMessage(messages.expandAltText)}
      collapseAlt={intl.formatMessage(messages.collapseAltText)}
      deleteAlt={intl.formatMessage(messages.deleteAltText)}
      data-testid={blackoutDate.id}
      onClose={() => onClose(hasError)}
    >
      <Form.Row className="mx-2 pt-3">
        <BlackoutDatesInput
          index={index}
          value={blackoutDate.startDate}
          type="date"
          label="Start date"
          helpText={intl.formatMessage(messages.blackoutStartDateHelp)}
          fieldName="startDate"
          formGroupClasses="pl-md-0"
          fieldClasses="pr-md-2"
        />
        <BlackoutDatesInput
          index={index}
          value={blackoutDate.startTime}
          type="time"
          label="Start time (optional)"
          helpText={intl.formatMessage(messages.blackoutStartTimeHelp)}
          fieldName="startTime"
          formGroupClasses="pr-md-0"
          fieldClasses="ml-md-2"
          helperClasses="ml-md-2"
        />
      </Form.Row>
      <hr className="mx-2 my-2 border-light-400" />
      <Form.Row className="mx-2 pt-4">
        <BlackoutDatesInput
          index={index}
          value={blackoutDate.endDate}
          type="date"
          label="End date"
          helpText={intl.formatMessage(messages.blackoutEndDateHelp)}
          fieldName="endDate"
          formGroupClasses="pl-md-0"
          fieldClasses="pr-md-2"
        />
        <BlackoutDatesInput
          index={index}
          value={blackoutDate.endTime}
          type="time"
          label="End time (optional)"
          helpText={intl.formatMessage(messages.blackoutEndTimeHelp)}
          fieldName="endTime"
          formGroupClasses="pr-md-0"
          fieldClasses="ml-md-2"
          helperClasses="ml-md-2"
        />
      </Form.Row>
    </CollapsableEditor>
  );
};

BlackoutDatesItem.propTypes = {
  intl: intlShape.isRequired,
  index: PropTypes.number.isRequired,
  onDelete: PropTypes.func.isRequired,
  hasError: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  blackoutDate: PropTypes.shape({
    id: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
};

export default injectIntl(BlackoutDatesItem);
