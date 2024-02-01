import React, { useState, useCallback } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Form } from '@openedx/paragon';
import { useFormikContext } from 'formik';
import PropTypes from 'prop-types';
import _ from 'lodash';

import messages from '../../../messages';
import RestrictDatesInput from './RestrictDatesInput';
import { formatRestrictedDates } from '../../../utils';
import {
  restrictedDatesStatus as constants,
  deleteRestrictedDatesHelperText,
  badgeVariant,
} from '../../../../data/constants';
import CollapsableEditor from '../../../../../../generic/CollapsableEditor';
import ConfirmationPopup from '../../../../../../generic/ConfirmationPopup';
import CollapseCardHeading from './CollapseCardHeading';

const DiscussionRestrictionItem = ({
  restrictedDate,
  onDelete,
  hasError,
  onClose,
  fieldNameCommonBase,
}) => {
  const restrictedDateError = !restrictedDate.startDate || !restrictedDate.endDate || hasError;
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [collapseIsOpen, setCollapseOpen] = useState(restrictedDateError);
  const { setFieldTouched } = useFormikContext();
  const intl = useIntl();

  const handleToggle = useCallback((isOpen) => {
    if (!isOpen && hasError) {
      return setCollapseOpen(true);
    }
    return setCollapseOpen(isOpen);
  }, [hasError]);

  const handleOnClose = useCallback(() => {
    ['startDate', 'startTime', 'endDate', 'endTime'].forEach(field => (
      setFieldTouched(`${fieldNameCommonBase}.${field}`, true)
    ));
    if (!hasError) {
      onClose();
    }
  }, [hasError, onClose]);

  const getHeading = useCallback((isOpen) => (
    <CollapseCardHeading
      isOpen={isOpen}
      expandHeadingText={intl.formatMessage(messages.configureRestrictedDates)}
      collapseHeadingText={formatRestrictedDates(restrictedDate)}
      badgeVariant={badgeVariant[restrictedDate.status]}
      badgeStatus={intl.formatMessage(messages.restrictedDatesStatus, {
        status: _.startCase(_.toLower(restrictedDate.status)),
      })}
    />
  ), [restrictedDate]);

  const handleShowDeletePopup = useCallback(() => {
    setShowDeletePopup(true);
  }, []);

  const handleCancelDeletePopup = useCallback(() => {
    setShowDeletePopup(false);
  }, []);

  if (showDeletePopup) {
    return (
      <ConfirmationPopup
        label={restrictedDate.status === constants.ACTIVE
          ? intl.formatMessage(messages.activeRestrictedDatesDeletionLabel)
          : intl.formatMessage(messages.restrictedDatesDeletionLabel)}
        bodyText={intl.formatMessage(deleteRestrictedDatesHelperText[restrictedDate.status])}
        onConfirm={onDelete}
        confirmLabel={intl.formatMessage(messages.deleteButton)}
        onCancel={handleCancelDeletePopup}
        cancelLabel={intl.formatMessage(messages.cancelButton)}
        confirmVariant="plain"
        confirmButtonClass="text-danger-500 border-gray-300 rounded-0"
      />
    );
  }

  return (
    <CollapsableEditor
      open={collapseIsOpen}
      onToggle={handleToggle}
      title={getHeading(collapseIsOpen)}
      onDelete={handleShowDeletePopup}
      expandAlt={intl.formatMessage(messages.expandAltText)}
      collapseAlt={intl.formatMessage(messages.collapseAltText)}
      deleteAlt={intl.formatMessage(messages.deleteAltText)}
      data-testid={restrictedDate.id}
      onClose={handleOnClose}
    >
      <Form.Row className="mx-2 pt-3">
        <RestrictDatesInput
          value={restrictedDate.startDate}
          type="date"
          label={intl.formatMessage(messages.startDateLabel)}
          helpText={intl.formatMessage(messages.restrictedStartDateHelp)}
          fieldName="startDate"
          formGroupClasses="pl-md-0"
          fieldClasses="pr-md-2"
          dataTestId="startDate"
          fieldNameCommonBase={fieldNameCommonBase}
        />
        <RestrictDatesInput
          value={restrictedDate.startTime}
          type="time"
          label={intl.formatMessage(messages.startTimeLabel, { zone: 'UTC' })}
          helpText={intl.formatMessage(messages.restrictedStartTimeHelp)}
          fieldName="startTime"
          formGroupClasses="pr-md-0"
          fieldClasses="ml-md-2"
          feedbackClasses="ml-md-2"
          dataTestId="startTime"
          fieldNameCommonBase={fieldNameCommonBase}
        />
      </Form.Row>
      <hr className="mx-2 my-2 border-light-400" />
      <Form.Row className="mx-2 pt-4">
        <RestrictDatesInput
          value={restrictedDate.endDate}
          type="date"
          label={intl.formatMessage(messages.endDateLabel)}
          helpText={intl.formatMessage(messages.restrictedEndDateHelp)}
          fieldName="endDate"
          formGroupClasses="pl-md-0"
          fieldClasses="pr-md-2"
          dataTestId="endDate"
          fieldNameCommonBase={fieldNameCommonBase}
        />
        <RestrictDatesInput
          value={restrictedDate.endTime}
          type="time"
          label={intl.formatMessage(messages.endTimeLabel, { zone: 'UTC' })}
          helpText={intl.formatMessage(messages.restrictedEndTimeHelp)}
          fieldName="endTime"
          formGroupClasses="pr-md-0"
          fieldClasses="ml-md-2"
          feedbackClasses="ml-md-2"
          dataTestId="endTime"
          fieldNameCommonBase={fieldNameCommonBase}
        />
      </Form.Row>
    </CollapsableEditor>
  );
};

DiscussionRestrictionItem.propTypes = {
  onDelete: PropTypes.func.isRequired,
  hasError: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  fieldNameCommonBase: PropTypes.string.isRequired,
  restrictedDate: PropTypes.shape({
    id: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
};

export default React.memo(DiscussionRestrictionItem);
