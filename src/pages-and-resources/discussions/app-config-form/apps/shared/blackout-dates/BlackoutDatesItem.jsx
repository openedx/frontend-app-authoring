import React, { useState } from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Form } from '@edx/paragon';
import { useFormikContext } from 'formik';
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
import DeletePopup from '../../../../../../generic/DeletePopup';
import CollapseCardHeading from './CollapseCardHeading';

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
  const { setFieldTouched } = useFormikContext();

  const handleToggle = (isOpen) => {
    if (!isOpen && blackoutDatesHasError) {
      return setCollapseOpen(true);
    }
    return setCollapseOpen(isOpen);
  };

  const getHeading = (isOpen) => (
    <CollapseCardHeading
      isOpen={isOpen}
      expandHeadingText={intl.formatMessage(messages.configureBlackoutDates)}
      collapseHeadingText={formatBlackoutDates(blackoutDate)}
      badgeVariant={badgeVariant[blackoutDate.status]}
      badgeStatus={intl.formatMessage(messages.blackoutDatesStatus, {
        status: _.startCase(_.toLower(blackoutDate.status)),
      })}
    />
  );

  if (showDeletePopup) {
    return (
      <DeletePopup
        label={blackoutDate.status === constants.ACTIVE
          ? intl.formatMessage(messages.activeBlackoutDatesDeletionLabel)
          : intl.formatMessage(messages.blackoutDatesDeletionLabel)}
        bodyText={intl.formatMessage(deleteHelperText[blackoutDate.status])}
        onDelete={onDelete}
        deleteLabel={intl.formatMessage(messages.deleteButton)}
        onCancel={() => setShowDeletePopup(false)}
        cancelLabel={intl.formatMessage(messages.cancelButton)}
      />
    );
  }

  const handleOnClose = () => {
    onClose(hasError);
    ['startDate', 'startTime', 'endDate', 'endTime'].forEach(field => (
      setFieldTouched(`blackoutDates.${index}.${field}`, true)
    ));
  };

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
      onClose={() => handleOnClose()}
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
          feedbackClasses="ml-md-2"
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
          feedbackClasses="ml-md-2"
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
