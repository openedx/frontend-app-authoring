import React from 'react';
import PropTypes from 'prop-types';
import { Card, Form } from '@edx/paragon';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import DivisionByGroupFields from '../shared/DivisionByGroupFields';
import AnonymousPostingFields from '../shared/AnonymousPostingFields';
import DiscussionTopics from '../shared/discussion-topics/DiscussionTopics';
import BlackoutDatesField, { blackoutDatesRegex } from '../shared/BlackoutDatesField';

import messages from '../shared/messages';
import AppConfigFormDivider from '../shared/AppConfigFormDivider';

function LegacyConfigForm({
  appConfig, onSubmit, formRef, intl, title,
}) {
  const legacyFormValidationSchema = Yup.object().shape({
    blackoutDates: Yup.string().matches(
      blackoutDatesRegex,
      intl.formatMessage(messages.blackoutDatesFormattingError),
    ),
    discussionTopics: Yup.array()
      .of(
        Yup.object().shape({
          name: Yup.string().required(intl.formatMessage(messages.discussionTopicRequired)),
        }),
      ).test('unique', (
        discussionTopics,
        testContext,
        message = intl.formatMessage(messages.discussionTopicNameAlreadyExist),
      ) => {
        const uniqueDiscussionTopics = [...new Set(discussionTopics.map(topic => topic.name))];
        const isUnique = discussionTopics.length === uniqueDiscussionTopics.length;
        if (isUnique) {
          return true;
        }

        const duplicateNameIndex = discussionTopics.findIndex(
          (topic, index) => topic.name !== uniqueDiscussionTopics[index],
        );
        return testContext.createError({
          path: `[${duplicateNameIndex}].name`,
          message,
        });
      }),
  });

  return (
    <Formik
      initialValues={appConfig}
      validationSchema={legacyFormValidationSchema}
      onSubmit={(values) => (onSubmit(values))}
    >
      {(
        {
          handleSubmit,
          handleChange,
          handleBlur,
          values,
          errors,
        },
      ) => (
        <Card className="mb-5 px-4 px-sm-5 pb-5" data-testid="legacyConfigForm">
          <Form ref={formRef} onSubmit={handleSubmit}>
            <h3 className="text-primary-500 my-3">{title}</h3>
            <AppConfigFormDivider thick />
            <AnonymousPostingFields
              onBlur={handleBlur}
              onChange={handleChange}
              values={values}
            />
            <AppConfigFormDivider />
            <DivisionByGroupFields
              onBlur={handleBlur}
              onChange={handleChange}
              appConfig={values}
            />
            <AppConfigFormDivider thick />
            <DiscussionTopics />
            <AppConfigFormDivider thick />
            <BlackoutDatesField
              errors={errors}
              onBlur={handleBlur}
              onChange={handleChange}
              values={values}
            />
          </Form>
        </Card>
      )}
    </Formik>
  );
}

LegacyConfigForm.propTypes = {
  appConfig: PropTypes.shape({
    divideByCohorts: PropTypes.bool.isRequired,
    divideCourseTopics: PropTypes.bool.isRequired,
    allowAnonymousPosts: PropTypes.bool.isRequired,
    allowAnonymousPostsPeers: PropTypes.bool.isRequired,
    blackoutDates: PropTypes.string.isRequired,
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
    divideCourseTopics: false,
    allowAnonymousPosts: false,
    allowAnonymousPostsPeers: false,
    blackoutDates: '[]',
  },
};

export default injectIntl(LegacyConfigForm);
