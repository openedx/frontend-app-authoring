/* eslint-disable import/no-extraneous-dependencies */
import React, { useCallback } from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, Tabs, Tab } from '@edx/paragon';
import { Add } from '@edx/paragon/icons';

import { FieldArray, useFormikContext } from 'formik';
import { v4 as uuid } from 'uuid';
import ConfirmationPopup from '../../../../../generic/ConfirmationPopup';

import messages from '../../messages';
import DiscussionRestrictionItem from './discussion-restrictions/DiscussionRestrictionItem';
import { checkStatus } from '../../utils';
import { denormalizeRestrictedDate } from '../../../data/api';
import { restrictedDatesStatus as STATUS } from '../../../data/constants';

const DiscussionRestriction = ({ intl }) => {
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

  const onAddNewItem = async (push) => {
    await push(newRestrictedDateItem);
    validateForm();
  };
  return (
    <div className="discussion-restriction">
      <h5 className="text-gray-500 mt-4 mb-3 line-height-20">
        {intl.formatMessage(messages.discussionRestrictionLabel)}
      </h5>
      <Tabs
        defaultActiveKey="off"
        id="uncontrolled-pills-tab-example"
        variant="button-group"
        className="mb-3 w-100 d-flex flex-row height-36"
      >
        <Tab eventKey="off" title="Off" tabClassName="flex-grow-1 text-center rounded-0 font-14 line-height-20">
          <div className="small text-muted font-14 height-24 mb-4">
            {intl.formatMessage(messages.discussionRestrictionHelp)}
          </div>
        </Tab>
        <Tab eventKey="on" title="On" tabClassName="flex-grow-1 text-center font-14 line-height-20">
          <div className="small mb-4 text-muted font-14 height-24">
            {intl.formatMessage(messages.discussionRestrictionHelp)}
          </div>
          <ConfirmationPopup
            label={intl.formatMessage(messages.enableRestrictedDatesConfirmationLabel)}
            bodyText={intl.formatMessage(messages.enableRestrictedDatesConfirmationHelp)}
            onConfirm={() => {}}
            confirmLabel={intl.formatMessage(messages.ok)}
            cancelLabel={intl.formatMessage(messages.cancelButton)}
            confirmVariant="plain"
            confirmButtonClass="bg-primary-500 text-white rounded-0"
            cancelButtonClass="rounded-0"
          />
        </Tab>
        <Tab eventKey="scheduled" title="Scheduled" tabClassName="flex-grow-1 text-center font-14 line-height-20">
          <div className="small mb-3 text-muted font-14 height-24">
            {intl.formatMessage(messages.discussionRestrictionDatesHelp)}
          </div>
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
        </Tab>
      </Tabs>
    </div>
  );
};

DiscussionRestriction.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(DiscussionRestriction);
