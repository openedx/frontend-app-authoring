import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Form } from '@edx/paragon';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import DivisionByGroupFields from '../shared/DivisionByGroupFields';
import AnonymousPostingFields from '../shared/AnonymousPostingFields';
import DiscussionTopics from '../shared/discussion-topics/DiscussionTopics';
import BlackoutDatesField from '../shared/BlackoutDatesField';
import LegacyConfigFormProvider from './LegacyConfigFormProvider';
import messages from '../shared/messages';
import AppConfigFormDivider from '../shared/AppConfigFormDivider';
import { checkFieldErrors } from '../../utils';
import { setupYupExtensions } from '../../../../../utils';

setupYupExtensions();

function LegacyConfigForm({
  appConfig, onSubmit, formRef, intl, title,
}) {
  const LegacyAppConfig = {
    ...appConfig,
    allowAnonymousPosts: appConfig.allowAnonymousPosts || false,
    allowAnonymousPostsPeers: appConfig.allowAnonymousPostsPeers || false,
    blackoutDates: appConfig.blackoutDates || [],
    discussionTopics: appConfig.discussionTopics || [],
    divideByCohorts: appConfig.divideByCohorts || false,
    divideCourseTopicsByCohorts: appConfig.divideCourseTopicsByCohorts || false,
  };

  const [validDiscussionTopics, setValidDiscussionTopics] = useState(appConfig.discussionTopics);
  const legacyFormValidationSchema = Yup.object().shape({
    blackoutDates: Yup.array(
      Yup.object().shape({
        startDate: Yup.string().checkFormat(
          intl.formatMessage(messages.blackoutStartDateInValidFormat), 'date',
        ).required(intl.formatMessage(messages.blackoutStartDateRequired)),
        endDate: Yup.string().checkFormat(
          intl.formatMessage(messages.blackoutEndDateInValidFormat), 'date',
        ).required(intl.formatMessage(messages.blackoutEndDateRequired)).when('startDate', {
          is: (startDate) => startDate,
          then: Yup.string().compare(intl.formatMessage(messages.blackoutEndDateInPast), 'date'),
        }),
        startTime: Yup.string().checkFormat(
          intl.formatMessage(messages.blackoutStartTimeInValidFormat), 'time',
        ),
        endTime: Yup.string().checkFormat(
          intl.formatMessage(messages.blackoutEndTimeInValidFormat), 'time',
        ).when('startTime', {
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
  });

  return (
    <Formik
      initialValues={LegacyAppConfig}
      validateOnChange={false}
      validationSchema={legacyFormValidationSchema}
      onSubmit={(values) => onSubmit(values)}
    >
      {(
        {
          handleSubmit,
          handleChange,
          handleBlur,
          values,
          errors,
          touched,
        },
      ) => {
        const { discussionTopics, blackoutDates } = values;
        const discussionTopicErrors = discussionTopics.map((value, index) => (
          checkFieldErrors(touched, errors, `discussionTopics.${index}`, 'name')
        ));
        const blackoutDatesErrors = blackoutDates.map((value, index) => (
          checkFieldErrors(touched, errors, `blackoutDates.${index}`, 'startDate')
          || checkFieldErrors(touched, errors, `blackoutDates.${index}`, 'endDate')
          || checkFieldErrors(touched, errors, `blackoutDates.${index}`, 'startTime')
          || checkFieldErrors(touched, errors, `blackoutDates.${index}`, 'endTime')));

        const contextValue = {
          validDiscussionTopics,
          setValidDiscussionTopics,
          discussionTopicErrors,
          blackoutDatesErrors,
          isFormInvalid: discussionTopicErrors.some((error) => error) || blackoutDatesErrors.some((error) => error),
        };

        return (
          <LegacyConfigFormProvider value={contextValue}>
            <Card className="mb-5 px-4 px-sm-5 pb-5" data-testid="legacyConfigForm">
              <Form ref={formRef} onSubmit={handleSubmit}>
                <h3 className="text-primary-500 my-3">{title}</h3>
                <AppConfigFormDivider thick />
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
                <BlackoutDatesField />
              </Form>
            </Card>
          </LegacyConfigFormProvider>
        );
      }}
    </Formik>
  );
}

LegacyConfigForm.propTypes = {
  appConfig: PropTypes.shape({
    divideByCohorts: PropTypes.bool.isRequired,
    divideCourseTopicsByCohorts: PropTypes.bool.isRequired,
    allowAnonymousPosts: PropTypes.bool.isRequired,
    allowAnonymousPostsPeers: PropTypes.bool.isRequired,
    blackoutDates: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      startDate: PropTypes.string,
      endDate: PropTypes.string,
      startTime: PropTypes.string,
      endTime: PropTypes.string,
      status: PropTypes.string,
    })),
    discussionTopics: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      id: PropTypes.string,
    })),
  }),
  onSubmit: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  formRef: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  title: PropTypes.string.isRequired,
};

LegacyConfigForm.defaultProps = {
  appConfig: {
    divideByCohorts: false,
    allowDivisionByUnit: false,
    divideCourseTopicsByCohorts: false,
    allowAnonymousPosts: false,
    allowAnonymousPostsPeers: false,
    blackoutDates: [],
  },
};

export default injectIntl(LegacyConfigForm);
