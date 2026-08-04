import React from 'react';
import {
  ActionRow,
  Button,
  Form,
  Icon,
} from '@openedx/paragon';
import classNames from 'classnames';
import DatePicker from 'react-datepicker';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Calendar as CalendarIcon, Error as ErrorIcon } from '@openedx/paragon/icons';
import { Formik, FormikConfig } from 'formik';
import type { CourseHandouts } from '../data/api';
import type { ValueOf } from '../../types';
import type { UpdateFormValues } from './utils';

import {
  convertToStringFromDate,
  convertToDateFromString,
  isValidDate,
} from '../../utils';
import { DATE_FORMAT, DEFAULT_EMPTY_WYSIWYG_VALUE } from '../../constants';
import { SUPPORTED_TEXT_EDITORS, WysiwygEditor } from '../../generic/WysiwygEditor';
import { REQUEST_TYPES } from '../constants';
import { geUpdateFormSettings } from './utils';
import messages from './messages';

type RequestType = ValueOf<typeof REQUEST_TYPES>;
type UpdateFormProps = {
  close: () => void;
  requestType: RequestType;
  onSubmit: FormikConfig<UpdateFormValues>['onSubmit'];
  courseUpdatesInitialValues: UpdateFormValues | CourseHandouts;
  isInnerForm?: boolean;
  isFirstUpdate?: boolean;
  isOpen?: boolean;
};

const UpdateForm = ({
  close,
  requestType,
  onSubmit,
  courseUpdatesInitialValues,
  isInnerForm = false,
  isFirstUpdate = false,
}: UpdateFormProps) => {
  const intl = useIntl();

  const {
    currentContent,
    formTitle,
    validationSchema,
    contentFieldName,
    submitButtonText,
  } = geUpdateFormSettings(requestType, courseUpdatesInitialValues, intl);

  return (
    <div
      className={classNames('update-form', {
        'update-form__inner': isInnerForm,
        'update-form__inner-first': isFirstUpdate,
      })}
    >
      <Formik<UpdateFormValues>
        initialValues={courseUpdatesInitialValues as UpdateFormValues}
        validationSchema={validationSchema}
        validateOnMount
        validateOnBlur
        onSubmit={onSubmit}
      >
        {({
          values,
          errors,
          handleSubmit,
          isValid,
          setFieldValue,
        }) => (
          <>
            <h3 className="update-form-title">{formTitle}</h3>
            {(requestType !== REQUEST_TYPES.edit_handouts) && (
              <Form.Group controlId="course-updates-date" className="mb-4 datepicker-field datepicker-custom">
                <Form.Label htmlFor="course-updates-date" className="datepicker-float-labels">
                  {intl.formatMessage(messages.updateFormDate)}
                </Form.Label>
                <div className="position-relative">
                  <Icon
                    src={CalendarIcon}
                    className="datepicker-custom-control-icon"
                    screenReaderText={intl.formatMessage(messages.updateFormCalendarAltText)}
                  />
                  <DatePicker
                    id="course-updates-date"
                    name="date"
                    data-testid="course-updates-datepicker"
                    selected={isValidDate(values.date) ? convertToDateFromString(values.date as string) : undefined}
                    dateFormat={DATE_FORMAT}
                    className={classNames('datepicker-custom-control', {
                      'datepicker-custom-control_isInvalid': Boolean(errors.date),
                    })}
                    autoComplete="off"
                    selectsStart
                    showPopperArrow={false}
                    onChange={(value) => {
                      if (!isValidDate(value)) {
                        /* istanbul ignore next */
                        return;
                      }
                      // eslint-disable-next-line @typescript-eslint/no-floating-promises
                      setFieldValue('date', convertToStringFromDate(value));
                    }}
                  />
                </div>
                {errors.date && (
                  <div className="datepicker-field-error" role="alert">
                    <Icon
                      src={ErrorIcon}
                      className="text-danger-500"
                      screenReaderText={intl.formatMessage(messages.updateFormErrorAltText)}
                    />
                    <span className="message-error">{intl.formatMessage(messages.updateFormInValid)}</span>
                  </div>
                )}
              </Form.Group>
            )}
            <Form.Group className="m-0 mb-3">
              <WysiwygEditor
                initialValue={currentContent}
                editorType={SUPPORTED_TEXT_EDITORS.text}
                minHeight={300}
                onChange={/* istanbul ignore next: we can't test WYSIWYG editors */ async (value) => {
                  await setFieldValue(contentFieldName, value || DEFAULT_EMPTY_WYSIWYG_VALUE);
                }}
              />
              {errors[contentFieldName] && (
                <div id="course-updates-content-error" className="message-error" role="alert">
                  {errors[contentFieldName]}
                </div>
              )}
            </Form.Group>
            <ActionRow>
              <Button variant="tertiary" type="button" onClick={close}>
                {intl.formatMessage(messages.cancelButton)}
              </Button>
              <Button onClick={() => handleSubmit()} type="submit" disabled={!isValid}>
                {submitButtonText}
              </Button>
            </ActionRow>
          </>
        )}
      </Formik>
    </div>
  );
};

export default UpdateForm;
