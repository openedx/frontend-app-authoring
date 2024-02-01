import React from 'react';
import PropTypes from 'prop-types';
import {
  ActionRow,
  Button,
  Form,
  Icon,
} from '@openedx/paragon';
import classNames from 'classnames';
import DatePicker from 'react-datepicker/dist';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Calendar as CalendarIcon, Error as ErrorIcon } from '@openedx/paragon/icons';
import { Formik } from 'formik';

import {
  convertToStringFromDate,
  convertToDateFromString,
  isValidDate,
} from '../../utils';
import { DATE_FORMAT, DEFAULT_EMPTY_WYSIWYG_VALUE } from '../../constants';
import { WysiwygEditor } from '../../generic/WysiwygEditor';
import { REQUEST_TYPES } from '../constants';
import { geUpdateFormSettings } from './utils';
import messages from './messages';

const UpdateForm = ({
  close,
  requestType,
  onSubmit,
  courseUpdatesInitialValues,
  isInnerForm,
  isFirstUpdate,
}) => {
  const intl = useIntl();

  const {
    currentContent,
    formTitle,
    validationSchema,
    contentFieldName,
    submitButtonText,
  } = geUpdateFormSettings(requestType, courseUpdatesInitialValues, intl);

  return (
    <div className={classNames('update-form', {
      'update-form__inner': isInnerForm,
      'update-form__inner-first': isFirstUpdate,
    })}
    >
      <Formik
        initialValues={courseUpdatesInitialValues}
        validationSchema={validationSchema}
        validateOnMount
        validateOnBlur
        onSubmit={onSubmit}
      >
        {({
          values, handleSubmit, isValid, setFieldValue,
        }) => (
          <>
            <h3 className="update-form-title">{formTitle}</h3>
            {(requestType !== REQUEST_TYPES.edit_handouts) && (
              <Form.Group className="mb-4 datepicker-field datepicker-custom">
                <Form.Control.Feedback className="datepicker-float-labels">
                  {intl.formatMessage(messages.updateFormDate)}
                </Form.Control.Feedback>
                <div className="position-relative">
                  <Icon
                    src={CalendarIcon}
                    className="datepicker-custom-control-icon"
                    alt={intl.formatMessage(messages.updateFormCalendarAltText)}
                  />
                  <DatePicker
                    name="date"
                    data-testid="course-updates-datepicker"
                    selected={isValidDate(values.date) ? convertToDateFromString(values.date) : ''}
                    dateFormat={DATE_FORMAT}
                    className={classNames('datepicker-custom-control', {
                      'datepicker-custom-control_isInvalid': !isValid,
                    })}
                    autoComplete="off"
                    selectsStart
                    showPopperArrow={false}
                    onChange={(value) => {
                      if (!isValidDate(value)) {
                        return;
                      }
                      setFieldValue('date', convertToStringFromDate(value));
                    }}
                  />
                </div>
                {!isValid && (
                  <div className="datepicker-field-error">
                    <Icon src={ErrorIcon} className="text-danger-500" alt={intl.formatMessage(messages.updateFormErrorAltText)} />
                    <span className="message-error">{intl.formatMessage(messages.updateFormInValid)}</span>
                  </div>
                )}
              </Form.Group>
            )}
            <Form.Group className="m-0 mb-3">
              <WysiwygEditor
                initialValue={currentContent}
                data-testid="course-updates-wisiwyg-editor"
                name={contentFieldName}
                minHeight={300}
                onChange={(value) => {
                  setFieldValue(contentFieldName, value || DEFAULT_EMPTY_WYSIWYG_VALUE);
                }}
              />
            </Form.Group>
            <ActionRow>
              <Button variant="tertiary" type="button" onClick={close}>
                {intl.formatMessage(messages.cancelButton)}
              </Button>
              <Button onClick={handleSubmit} type="submit" disabled={!isValid}>
                {submitButtonText}
              </Button>
            </ActionRow>
          </>
        )}
      </Formik>
    </div>
  );
};

UpdateForm.defaultProps = {
  isInnerForm: false,
  isFirstUpdate: false,
};

UpdateForm.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  courseUpdatesInitialValues: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired,
  requestType: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isInnerForm: PropTypes.bool,
  isFirstUpdate: PropTypes.bool,
};

export default UpdateForm;
