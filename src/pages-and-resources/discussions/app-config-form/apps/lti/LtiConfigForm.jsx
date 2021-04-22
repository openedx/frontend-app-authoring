import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Card, Form, Hyperlink } from '@edx/paragon';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import messages from './messages';
import AppConfigFormDivider from '../shared/AppConfigFormDivider';

function LtiConfigForm({
  appConfig, app, onSubmit, intl, formRef, title,
}) {
  const {
    handleSubmit,
    handleChange,
    handleBlur,
    values,
    touched,
    errors,
  } = useFormik({
    initialValues: appConfig,
    validationSchema: Yup.object().shape({
      consumerKey: Yup.string().required(intl.formatMessage(messages.consumerKeyRequired)),
      consumerSecret: Yup.string().required(intl.formatMessage(messages.consumerSecretRequired)),
      launchUrl: Yup.string().required(intl.formatMessage(messages.launchUrlRequired)),
    }),
    onSubmit,
  });

  const isInvalidConsumerKey = touched.consumerKey && errors.consumerKey;
  const isInvalidConsumerSecret = touched.consumerSecret && errors.consumerSecret;
  const isInvalidLaunchUrl = touched.launchUrl && errors.launchUrl;

  return (
    <Card className="mb-5 pt-3 px-5 pb-5" data-testid="ltiConfigForm">
      <Form ref={formRef} onSubmit={handleSubmit}>
        <h3>{title}</h3>
        <AppConfigFormDivider />
        <p>
          <FormattedMessage
            id="authoring.discussions.appDocInstructions"
            defaultMessage="{documentationPageLink} to set up the tool, then paste your consumer key and consumer secret below:"
            description="Instructions for the user to go visit a third party app's documentation to learn how to generate a set of values needed in this form.  documentationPageLink says 'Visit the {name} documentation page'"
            values={{
              documentationPageLink: (
                <Hyperlink
                  destination={app.documentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {intl.formatMessage(messages.documentationPage, { name: title })}
                </Hyperlink>
              ),
            }}
          />
        </p>
        <Form.Group controlId="consumerKey" isInvalid={isInvalidConsumerKey}>
          <Form.Label>{intl.formatMessage(messages.consumerKey)}</Form.Label>
          <Form.Control
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.consumerKey}
          />
          {isInvalidConsumerKey && (
          <Form.Control.Feedback type="invalid">
            {errors.consumerKey}
          </Form.Control.Feedback>
          )}
        </Form.Group>
        <Form.Group controlId="consumerSecret" isInvalid={isInvalidConsumerSecret}>
          <Form.Label>{intl.formatMessage(messages.consumerSecret)}</Form.Label>
          <Form.Control
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.consumerSecret}
          />
          {isInvalidConsumerSecret && (
          <Form.Control.Feedback type="invalid">
            {errors.consumerSecret}
          </Form.Control.Feedback>
          )}
        </Form.Group>
        <Form.Group controlId="launchUrl" isInvalid={isInvalidLaunchUrl}>
          <Form.Label>{intl.formatMessage(messages.launchUrl)}</Form.Label>
          <Form.Control
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.launchUrl}
          />
          {isInvalidLaunchUrl && (
          <Form.Control.Feedback type="invalid">
            {errors.launchUrl}
          </Form.Control.Feedback>
          )}
        </Form.Group>
      </Form>
    </Card>
  );
}

LtiConfigForm.propTypes = {
  app: PropTypes.shape({
    id: PropTypes.string.isRequired,
    documentationUrl: PropTypes.string.isRequired,
  }).isRequired,
  appConfig: PropTypes.shape({
    consumerKey: PropTypes.string.isRequired,
    consumerSecret: PropTypes.string.isRequired,
    launchUrl: PropTypes.string.isRequired,
  }),
  intl: intlShape.isRequired,
  onSubmit: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  formRef: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
};

LtiConfigForm.defaultProps = {
  appConfig: {
    consumerKey: '',
    consumerSecret: '',
    launchUrl: '',
  },
};

export default injectIntl(LtiConfigForm);
