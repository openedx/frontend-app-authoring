import React, { useCallback, useState } from 'react';
import { injectIntl, useIntl } from '@edx/frontend-platform/i18n';
import { Button, ButtonGroup } from '@edx/paragon';
import { Add } from '@edx/paragon/icons';

import { FieldArray, useFormikContext } from 'formik';
import { v4 as uuid } from 'uuid';
import ConfirmationPopup from '../../../../../generic/ConfirmationPopup';

import messages from '../../messages';
import DiscussionRestrictionItem from './discussion-restrictions/DiscussionRestrictionItem';
import { checkStatus } from '../../utils';
import { denormalizeRestrictedDate } from '../../../data/api';
import { restrictedDatesStatus as STATUS, discussionRestrictionOptions } from '../../../data/constants';
import DiscussionRestrictionOption from './discussion-restrictions/DiscussionRestrictionOption';

const DiscussionRestriction = () => {
  const {
    values: appConfig,
    setFieldValue,
    errors,
    validateForm,
  } = useFormikContext();

  const intl = useIntl();
  const { restrictedDates } = appConfig;
  const [selectedOption, setSelectedOption] = useState('');

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
    <div className="discussion-restriction">
      <h5 className="text-gray-500 mt-4 mb-3 line-height-20">
        {intl.formatMessage(messages.discussionRestrictionLabel)}
      </h5>
      <ButtonGroup className="mb-3 w-100 d-flex flex-row height-36">
        {discussionRestrictionOptions.map((option) => (
          <DiscussionRestrictionOption
            label={option.label}
            value={option.value}
            selectedOption={selectedOption}
            onClick={(value) => setSelectedOption(value)}
          >{option.label}
          </DiscussionRestrictionOption>

        ))}
      </ButtonGroup>
      {selectedOption === 'scheduled' ? (
        <div className="small mb-3 text-muted font-size-14 height-24">
          {intl.formatMessage(messages.discussionRestrictionDatesHelp)}
        </div>
      ) : (
        <div className="small text-muted font-size-14 height-24 mb-4">
          {intl.formatMessage(messages.discussionRestrictionHelp)}
        </div>
      )}

      {selectedOption === 'on' && (
      <ConfirmationPopup
        label={intl.formatMessage(messages.enableRestrictedDatesConfirmationLabel)}
        bodyText={intl.formatMessage(messages.enableRestrictedDatesConfirmationHelp)}
        onCancel={() => setSelectedOption('')}
        confirmLabel={intl.formatMessage(messages.ok)}
        cancelLabel={intl.formatMessage(messages.cancelButton)}
        confirmVariant="plain"
        confirmButtonClass="bg-primary-500 text-white rounded-0 action-btn"
        cancelButtonClass="rounded-0 action-btn w-92"
        confirmBodyClass="card-body-section"
      />
      )}

      {selectedOption === 'scheduled' && (
      <div>
        <FieldArray
          name="restrictedDates"
          render={({ push, remove }) => (
            <div>
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
      )}
    </div>
  );
};

export default injectIntl(React.memo(DiscussionRestriction));
