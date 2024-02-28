import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Card, Form } from '@openedx/paragon';
import { Formik } from 'formik';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

import { useSelector } from 'react-redux';
import * as Yup from 'yup';
import { useModel, useModels } from 'CourseAuthoring/generic/model-store';
import { setupYupExtensions } from 'CourseAuthoring/utils';
import messages from '../../messages';
import { checkFieldErrors } from '../../utils';
import AnonymousPostingFields from '../shared/AnonymousPostingFields';
import AppConfigFormDivider from '../shared/AppConfigFormDivider';
import DiscussionRestriction from '../shared/DiscussionRestriction';
import DiscussionTopics from '../shared/discussion-topics/DiscussionTopics';
import DivisionByGroupFields from '../shared/DivisionByGroupFields';
import ReportedContentEmailNotifications from '../shared/ReportedContentEmailNotifications';
import InContextDiscussionFields from '../shared/InContextDiscussionFields';
import OpenedXConfigFormProvider from './OpenedXConfigFormProvider';

setupYupExtensions();

const OpenedXConfigForm = ({
  onSubmit, formRef, intl, legacy,
}) => {
  const {
    selectedAppId, enableGradedUnits, discussionTopicIds, divideDiscussionIds, postingRestrictions,
  } = useSelector(state => state.discussions);
  const appConfigObj = useModel('appConfigs', selectedAppId);
  const discussionTopicsModel = useModels('discussionTopics', discussionTopicIds);
  const legacyAppConfig = {
    ...(appConfigObj || {}),
    divideDiscussionIds,
    enableInContext: true,
    enableGradedUnits,
    postingRestrictions,
    unitLevelVisibility: true,
    allowAnonymousPostsPeers: appConfigObj?.allowAnonymousPostsPeers || false,
    reportedContentEmailNotifications: appConfigObj?.reportedContentEmailNotifications || false,
    restrictedDates: appConfigObj?.restrictedDates || [],
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
    // eslint-disable-next-line react/forbid-prop-types
    restrictedDates: Yup.array(
      Yup.object().shape({
        startDate: Yup.string()
          .checkFormat(intl.formatMessage(messages.restrictedStartDateInValidFormat), 'date')
          .required(intl.formatMessage(messages.restrictedStartDateRequired)),
        endDate: Yup.string()
          .checkFormat(intl.formatMessage(messages.restrictedEndDateInValidFormat), 'date')
          .required(intl.formatMessage(messages.restrictedEndDateRequired))
          .when('startDate', {
            is: (startDate) => startDate,
            then: Yup.string().compare(intl.formatMessage(messages.restrictedEndDateInPast), 'date'),
          }),
        startTime: Yup.string().checkFormat(
          intl.formatMessage(messages.restrictedStartTimeInValidFormat),
          'time',
        ),
        endTime: Yup.string()
          .checkFormat(intl.formatMessage(messages.restrictedEndTimeInValidFormat), 'time')
          .when('startTime', {
            is: (startTime) => startTime,
            then: Yup.string().compare(intl.formatMessage(messages.restrictedEndTimeInPast), 'time'),
          }),
      }),
    ),
    // eslint-disable-next-line react/forbid-prop-types
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
        const { discussionTopics, restrictedDates } = values;
        const discussionTopicErrors = discussionTopics.map((value, index) => checkFieldErrors(touched, errors, `discussionTopics.${index}`, 'name'));
        const restrictedDatesErrors = restrictedDates.map(
          (value, index) => checkFieldErrors(touched, errors, `restrictedDates.${index}`, 'startDate')
            || checkFieldErrors(touched, errors, `restrictedDates.${index}`, 'endDate')
            || checkFieldErrors(touched, errors, `restrictedDates.${index}`, 'startTime')
            || checkFieldErrors(touched, errors, `restrictedDates.${index}`, 'endTime'),
        );

        const contextValue = {
          validDiscussionTopics,
          setValidDiscussionTopics,
          discussionTopicErrors,
          postingRestrictions,
          restrictedDatesErrors,
          isFormInvalid:
            discussionTopicErrors.some((error) => error)
            || restrictedDatesErrors.some((error) => error),
        };

        return (
          <OpenedXConfigFormProvider value={contextValue}>
            <Card className="mb-5 px-4 px-sm-5 pb-4" data-testid="legacyConfigForm">
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
                <DiscussionRestriction />
              </Form>
            </Card>
          </OpenedXConfigFormProvider>
        );
      }}
    </Formik>
  );
};

OpenedXConfigForm.propTypes = {
  legacy: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  formRef: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(OpenedXConfigForm);
