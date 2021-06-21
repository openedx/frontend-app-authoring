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

Yup.addMethod(Yup.object, 'uniqueProperty', function (propertyName, message) {
  return this.test('unique', message, function (discussionTopic) {
    if (!discussionTopic || !discussionTopic[propertyName]) {
      return true;
    }
    const isDuplicate = this.parent.filter(topic => topic !== discussionTopic)
      .some(topic => topic[propertyName] === discussionTopic[propertyName]);

    if (isDuplicate) {
      throw this.createError({
        path: `${this.path}.${propertyName}`,
        error: message,
      });
    }
    return true;
  });
});

function LegacyConfigForm({
  appConfig, onSubmit, formRef, intl, title,
}) {
  const legacyFormValidationSchema = Yup.object().shape({
    blackoutDates: Yup.string().matches(
      blackoutDatesRegex,
      intl.formatMessage(messages.blackoutDatesFormattingError),
    ),
    discussionTopics: Yup.array(
      Yup.object({
        name: Yup.string().required(intl.formatMessage(messages.discussionTopicRequired)),
      }).uniqueProperty('name', intl.formatMessage(messages.discussionTopicNameAlreadyExist)),
    ),
  });

  return (
    <Formik
      initialValues={appConfig}
      validateOnChange={false}
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
            <AppConfigFormDivider thick />
            <DiscussionTopics />
            <AppConfigFormDivider thick />
            <DivisionByGroupFields
              onBlur={handleBlur}
              onChange={handleChange}
              appConfig={values}
            />
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
    divideCourseTopicsByCohorts: PropTypes.bool.isRequired,
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
    divideCourseTopicsByCohorts: false,
    allowAnonymousPosts: false,
    allowAnonymousPostsPeers: false,
    blackoutDates: '[]',
  },
};

export default injectIntl(LegacyConfigForm);
