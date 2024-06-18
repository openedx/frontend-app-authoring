import React, { useCallback } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import { Add } from '@openedx/paragon/icons';

import { FieldArray, useFormikContext } from 'formik';
import { v4 as uuid } from 'uuid';

import messages from '../../../messages';
import DiscussionRestrictionItem from './DiscussionRestrictionItem';
import { checkStatus } from '../../../utils';
import { denormalizeRestrictedDate } from '../../../../data/api';
import { restrictedDatesStatus as STATUS } from '../../../../data/constants';

const RestrictionSchedules = () => {
  const intl = useIntl();
  const {
    values: appConfig,
    setFieldValue,
    errors,
    validateForm,
  } = useFormikContext();

  const { restrictedDates } = appConfig;

  const handleOnClose = useCallback((index) => {
    const updatedRestrictedDates = [...restrictedDates];
    updatedRestrictedDates[index] = {
      ...updatedRestrictedDates[index],
      status: checkStatus(denormalizeRestrictedDate(updatedRestrictedDates[index])),
    };
    setFieldValue('restrictedDates', updatedRestrictedDates);
  }, [restrictedDates]);

  const newRestrictedDateItem = {
    id: uuid(),
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    status: STATUS.UPCOMING,
  };

  const onAddNewItem = useCallback(async (push) => {
    await push(newRestrictedDateItem);
    validateForm();
  }, []);

  return (
    <div data-testid="restriction-schedules">
      <FieldArray
        name="restrictedDates"
        render={({ push, remove }) => (
          <div className="mt-4">
            {restrictedDates.map((restrictedDate, index) => (
              <DiscussionRestrictionItem
                fieldNameCommonBase={`restrictedDates.${index}`}
                restrictedDate={restrictedDate}
                key={`date-${restrictedDate.id}`}
                id={restrictedDate.id}
                onDelete={() => remove(index)}
                onClose={() => handleOnClose(index)}
                hasError={Boolean(errors?.restrictedDates?.[index])}
              />
            ))}
            <div className="mb-4 mt-4 height-36">
              <Button
                onClick={() => onAddNewItem(push)}
                variant="link"
                iconBefore={Add}
                className="text-primary-500 p-0"
                style={{ height: 28 }}
              >
                {intl.formatMessage(messages.addRestrictedDatesButton)}
              </Button>
            </div>
          </div>
        )}
      />
    </div>
  );
};

export default React.memo(RestrictionSchedules);
