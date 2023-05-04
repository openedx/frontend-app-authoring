/* eslint-disable import/no-extraneous-dependencies */
import React, { useCallback, useState } from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';
import { Add } from '@edx/paragon/icons';

import { FieldArray, useFormikContext } from 'formik';
import { v4 as uuid } from 'uuid';
import Row from 'react-bootstrap/Row';
import ConfirmationPopup from '../../../../../generic/ConfirmationPopup';

import messages from '../../messages';
import DiscussionRestrictionItem from './discussion-restrictions/DiscussionRestrictionItem';
import DiscussionRestrictionOption from './discussion-restrictions/DiscussionRestrictionOption';
import { checkStatus } from '../../utils';
import { denormalizeRestrictedDate } from '../../../data/api';
import { restrictedDatesStatus as STATUS, discussionRestrictionOptions } from '../../../data/constants';

const DiscussionRestriction = ({ intl }) => {
  const {
    values: appConfig,
    setFieldValue,
    errors,
    validateForm,
  } = useFormikContext();
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

  const onAddNewItem = async (push) => {
    await push(newRestrictedDateItem);
    validateForm();
  };
  return (
    <div className="discussion-restriction">
      <h5 className="text-gray-500 mt-4 mb-3 font-14 height-20">
        {intl.formatMessage(messages.discussionRestrictionLabel)}
      </h5>
      <Row className="no-gutters mb-3">
        {discussionRestrictionOptions.map((restrictionOpt) => (
          <DiscussionRestrictionOption
            name={restrictionOpt}
            key={`restriction-key-${restrictionOpt}`}
            id={restrictionOpt}
            onClick={setSelectedOption}
            selectedOption={selectedOption}
          />
        ))}
      </Row>
      <div className={`small mb-3 text-muted font-14 height-24
      ${selectedOption === messages.discussionRestrictionScheduledLabel.defaultMessage
        || selectedOption === messages.discussionRestrictionOnLabel.defaultMessage ? 'mb-3' : 'mb-4'}`}
      >
        {intl.formatMessage(messages.discussionRestrictionHelp)}
      </div>
      {selectedOption === messages.discussionRestrictionScheduledLabel.defaultMessage && (
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
              <div className="mb-4 height-36">
                <Button
                  onClick={() => onAddNewItem(push)}
                  variant="link"
                  iconBefore={Add}
                  className="text-primary-500 p-0 height-28"
                >
                  {intl.formatMessage(messages.addRestrictedDatesButton)}
                </Button>
              </div>
            </div>
          )}
        />
      </div>
      )}

      {selectedOption === messages.discussionRestrictionOnLabel.defaultMessage && (
      <ConfirmationPopup
        label={intl.formatMessage(messages.enableRestrictedDatesConfirmationLabel)}
        bodyText={intl.formatMessage(messages.enableRestrictedDatesConfirmationHelp)}
        onConfirm={() => {}}
        confirmLabel={intl.formatMessage(messages.ok)}
        onCancel={() => setSelectedOption('')}
        cancelLabel={intl.formatMessage(messages.cancelButton)}
        confirmVariant="plain"
        confirmButtonClass="btn-active text-white rounded-0"
        cancelButtonClass="rounded-0"
      />
    )}
    </div>
  );
};

DiscussionRestriction.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(DiscussionRestriction);
