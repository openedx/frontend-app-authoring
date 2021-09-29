import React, { useCallback } from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';
import { Add } from '@edx/paragon/icons';

import { FieldArray, useFormikContext } from 'formik';
import { v4 as uuid } from 'uuid';

import messages from './messages';
import BlackoutDatesItem from './blackout-dates/BlackoutDatesItem';
import { checkStatus } from '../../utils';
import { denormalizeBlackoutDate } from '../../../data/api';
import { blackoutDatesStatus as STATUS } from '../../../data/constants';

const BlackoutDatesField = ({ intl }) => {
  const {
    values: appConfig,
    setFieldValue,
    errors,
    validateForm,
  } = useFormikContext();
  const { blackoutDates } = appConfig;

  const handleOnClose = useCallback((index) => {
    const updatedBlackoutDates = [...blackoutDates];
    updatedBlackoutDates[index] = {
      ...updatedBlackoutDates[index],
      status: checkStatus(denormalizeBlackoutDate(updatedBlackoutDates[index])),
    };
    setFieldValue('blackoutDates', updatedBlackoutDates);
  }, [blackoutDates]);

  const newBlackoutDateItem = {
    id: uuid(),
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    status: STATUS.NEW,
  };

  const onAddNewItem = async (push) => {
    await push(newBlackoutDateItem);
    validateForm();
  };
  return (
    <>
      <h5 className="text-gray-500 mt-4 mb-2">
        {intl.formatMessage(messages.blackoutDatesLabel)}
      </h5>
      <label className="text-primary-500 mb-1 h4">
        {intl.formatMessage(messages.blackoutDates)}
      </label>
      <div className="small mb-4 text-muted">
        {intl.formatMessage(messages.blackoutDatesHelp)}
      </div>
      <div>
        <FieldArray
          name="blackoutDates"
          render={({ push, remove }) => (
            <div>
              {blackoutDates.map((blackoutDate, index) => (
                <BlackoutDatesItem
                  fieldNameCommonBase={`blackoutDates.${index}`}
                  blackoutDate={blackoutDate}
                  key={`date-${blackoutDate.id}`}
                  id={blackoutDate.id}
                  onDelete={() => remove(index)}
                  onClose={() => handleOnClose(index)}
                  hasError={Boolean(errors?.blackoutDates?.[index])}
                />
              ))}
              <div className="mb-4">
                <Button
                  onClick={() => onAddNewItem(push)}
                  variant="link"
                  iconBefore={Add}
                  className="text-primary-500 p-0"
                >
                  {intl.formatMessage(messages.addBlackoutDatesButton)}
                </Button>
              </div>
            </div>
          )}
        />
      </div>
    </>
  );
};

BlackoutDatesField.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(BlackoutDatesField);
