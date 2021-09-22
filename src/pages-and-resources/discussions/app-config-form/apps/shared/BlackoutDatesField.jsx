import React, { useContext, useCallback } from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';
import { Add } from '@edx/paragon/icons';

import { FieldArray, useFormikContext } from 'formik';
import { v4 as uuid } from 'uuid';

import messages from './messages';
import BlackoutDatesItem from './blackout-dates/BlackoutDatesItem';
import { LegacyConfigFormContext } from '../legacy/LegacyConfigFormProvider';
import { checkStatus } from '../../utils';
import { denormalizeBlackoutDate } from '../../../data/api';
import { blackoutDatesStatus as constants } from '../../../data/constants';

const BlackoutDatesField = ({ intl }) => {
  const {
    values: appConfig,
    setFieldValue,
  } = useFormikContext();
  const { blackoutDates } = appConfig;
  const { blackoutDatesErrors } = useContext(LegacyConfigFormContext);

  const handleOnClose = useCallback((id, hasError) => {
    if (!hasError) {
      const updatedBlackoutDates = blackoutDates.map((date) => {
        if (date.id === id) {
          return { ...date, status: checkStatus(denormalizeBlackoutDate(date)) };
        }
        return date;
      });
      setFieldValue('blackoutDates', updatedBlackoutDates);
    }
  }, [blackoutDates]);

  const addNewBlackoutDates = (push) => {
    push({
      id: uuid(),
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      status: constants.ACTIVE,
    });
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
                  blackoutDate={blackoutDate}
                  key={`date-${blackoutDate.id}`}
                  index={index}
                  id={blackoutDate.id}
                  onDelete={() => remove(index)}
                  onClose={(hasError) => handleOnClose(blackoutDate.id, hasError)}
                  hasError={blackoutDatesErrors[index]}
                />
              ))}
              <div className="mb-4">
                <Button
                  onClick={() => addNewBlackoutDates(push)}
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
