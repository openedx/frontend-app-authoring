import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Card, Form } from '@edx/paragon';
import { Formik } from 'formik';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { useSelector } from 'react-redux';
import * as Yup from 'yup';
import { useModel, useModels } from '../../../../../generic/model-store';
import { setupYupExtensions } from '../../../../../utils';
import messages from '../../messages';
import { checkFieldErrors } from '../../utils';
import AnonymousPostingFields from '../shared/AnonymousPostingFields';
import AppConfigFormDivider from '../shared/AppConfigFormDivider';
import BlackoutDatesField from '../shared/BlackoutDatesField';
import DiscussionTopics from '../shared/discussion-topics/DiscussionTopics';
import DivisionByGroupFields from '../shared/DivisionByGroupFields';
import ReportedContentEmailNotifications from '../shared/ReportedContentEmailNotifications';
import InContextDiscussionFields from '../shared/InContextDiscussionFields';
import OpenedXConfigFormProvider from './OpenedXConfigFormProvider';

setupYupExtensions();

function OpenedXConfigForm({
  onSubmit, formRef, intl, legacy,
}) {
  const {
    selectedAppId, enableGradedUnits, discussionTopicIds, divideDiscussionIds,
  } = useSelector(state => state.discussions);
  const appConfigObj = useModel('appConfigs', selectedAppId);
  const discussionTopicsModel = useModels('discussionTopics', discussionTopicIds);
  const legacyAppConfig = {
    ...(appConfigObj || {}),
    divideDiscussionIds,
    enableInContext: true,
    enableGradedUnits,
    unitLevelVisibility: true,
    allowAnonymousPostsPeers: appConfigObj?.allowAnonymousPostsPeers || false,
    reportedContentEmailNotifications: appConfigObj?.reportedContentEmailNotifications || false,
    enableReportedContentEmailNotifications: Boolean(appConfigObj?.enableReportedContentEmailNotifications) || false,
    blackoutDates: appConfigObj?.blackoutDates || [],
    discussionTopics: discussionTopicsModel || [],
    divideByCohorts: appConfigObj?.divideByCohorts || false,
    divideCourseTopicsByCohorts: appConfigObj?.divideCourseTopicsByCohorts || false,
    groupAtSubsection: appConfigObj?.groupAtSubsection || false,
  };

  const [validDiscussionTopics, setValidDiscussionTopics] = useState(discussionTopicsModel);
  // These fields are only used for the new provider and aren't supported for legacy.
  const additionalFields = legacy ? {} : {
    enabledGradedUnits: Yup.bool().default(false),
    groupAtSubsection: Yup.bool().default(false),
  };
  const validationSchema = Yup.object().shape({
    blackoutDates: Yup.array(
      Yup.object().shape({
        startDate: Yup.string()
          .checkFormat(intl.formatMessage(messages.blackoutStartDateInValidFormat), 'date')
          .required(intl.formatMessage(messages.blackoutStartDateRequired)),
        endDate: Yup.string()
          .checkFormat(intl.formatMessage(messages.blackoutEndDateInValidFormat), 'date')
          .required(intl.formatMessage(messages.blackoutEndDateRequired))
          .when('startDate', {
            is: (startDate) => startDate,
            then: Yup.string().compare(intl.formatMessage(messages.blackoutEndDateInPast), 'date'),
          }),
        startTime: Yup.string().checkFormat(
          intl.formatMessage(messages.blackoutStartTimeInValidFormat),
          'time',
        ),
        endTime: Yup.string()
          .checkFormat(intl.formatMessage(messages.blackoutEndTimeInValidFormat), 'time')
          .when('startTime', {
            is: (startTime) => startTime,
            then: Yup.string().compare(intl.formatMessage(messages.blackoutEndTimeInPast), 'time'),
          }),
      }),
    ),
    discussionTopics: Yup.array(
      Yup.object({
        name: Yup.string().required(intl.formatMessage(messages.discussionTopicRequired)),
      }).uniqueObjectProperty('name', intl.formatMessage(messages.discussionTopicNameAlreadyExist)),
    ),
    ...additionalFields,
  });

  return (
    <Formik
      initialValues={legacyAppConfig}
      validateOnChange={false}
      validationSchema={validationSchema}
      onSubmit={(values) => onSubmit(values)}
    >
      {({
        handleSubmit, handleChange, handleBlur, values, errors, touched,
      }) => {
        const { discussionTopics, blackoutDates } = values;
        const discussionTopicErrors = discussionTopics.map((value, index) => checkFieldErrors(touched, errors, `discussionTopics.${index}`, 'name'));
        const blackoutDatesErrors = blackoutDates.map(
          (value, index) => checkFieldErrors(touched, errors, `blackoutDates.${index}`, 'startDate')
            || checkFieldErrors(touched, errors, `blackoutDates.${index}`, 'endDate')
            || checkFieldErrors(touched, errors, `blackoutDates.${index}`, 'startTime')
            || checkFieldErrors(touched, errors, `blackoutDates.${index}`, 'endTime'),
        );

        const contextValue = {
          validDiscussionTopics,
          setValidDiscussionTopics,
          discussionTopicErrors,
          blackoutDatesErrors,
          isFormInvalid:
            discussionTopicErrors.some((error) => error)
            || blackoutDatesErrors.some((error) => error),
        };

        return (
          <OpenedXConfigFormProvider value={contextValue}>
            <Card className="mb-5 px-4 px-sm-5 pb-5" data-testid="legacyConfigForm">
              <Form ref={formRef} onSubmit={handleSubmit}>
                <h3 className="text-primary-500 my-3">{intl.formatMessage(messages[`appName-${selectedAppId}`])}</h3>
                <AppConfigFormDivider thick />
                {!legacy
                  && (
                    <>
                      <InContextDiscussionFields onBlur={handleBlur} onChange={handleChange} values={values} />
                      <AppConfigFormDivider thick />
                    </>
                  )}
                <AnonymousPostingFields
                  onBlur={handleBlur}
                  onChange={handleChange}
                  values={values}
                />
                <AppConfigFormDivider thick />
                <DiscussionTopics />
                <AppConfigFormDivider thick />
                <DivisionByGroupFields />
                <AppConfigFormDivider thick />
                <ReportedContentEmailNotifications />
                <BlackoutDatesField />
              </Form>
            </Card>
          </OpenedXConfigFormProvider>
        );
      }}
    </Formik>
  );
}

OpenedXConfigForm.propTypes = {
  legacy: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  formRef: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(OpenedXConfigForm);
