import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import {
  Form, Hyperlink,
} from '@edx/paragon';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import messages from './messages';

function LtiConfigForm({
  appConfig, app, onSubmit, intl, formRef,
}) {
  const {
    handleSubmit,
    handleChange,
    handleBlur,
    values,
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

  return (
    <Form ref={formRef} className="m-5" onSubmit={handleSubmit}>
      <h1>{intl.formatMessage(messages.configureApp, { name: app.name })}</h1>
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
                {intl.formatMessage(messages.documentationPage, { name: app.name })}
              </Hyperlink>
            ),
            name: app.name,
          }}
        />
      </p>
      <Form.Group controlId="consumerKey">
        <Form.Label>{intl.formatMessage(messages.consumerKey)}</Form.Label>
        <Form.Control
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.consumerKey}
          className={{ 'is-invalid': !!errors.consumerKey }}
          aria-describedby="consumerKeyFeedback"
        />
        <Form.Control.Feedback id="consumerKeyFeedback" type="invalid">
          {intl.formatMessage(messages.consumerKeyRequired)}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group controlId="consumerSecret">
        <Form.Label>{intl.formatMessage(messages.consumerSecret)}</Form.Label>
        <Form.Control
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.consumerSecret}
          className={{ 'is-invalid': !!errors.consumerSecret }}
          aria-describedby="consumerSecretFeedback"
        />
        <Form.Control.Feedback id="consumerSecretFeedback" type="invalid">
          {intl.formatMessage(messages.consumerSecretRequired)}
        </Form.Control.Feedback>
      </Form.Group>
      <Form.Group controlId="launchUrl">
        <Form.Label>{intl.formatMessage(messages.launchUrl)}</Form.Label>
        <Form.Control
          onChange={handleChange}
          onBlur={handleBlur}
          value={values.launchUrl}
          className={{ 'is-invalid': !!errors.launchUrl }}
          aria-describedby="launchUrlFeedback"
        />
        <Form.Control.Feedback id="launchUrlFeedback" type="invalid">
          {intl.formatMessage(messages.launchUrlRequired)}
        </Form.Control.Feedback>
      </Form.Group>
    </Form>
  );
}

LtiConfigForm.propTypes = {
  app: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    documentationUrl: PropTypes.string.isRequired,
  }).isRequired,
  appConfig: PropTypes.shape({
    consumerKey: PropTypes.string.isRequired,
    consumerSecret: PropTypes.string.isRequired,
    launchUrl: PropTypes.string.isRequired,
  }).isRequired,
  intl: intlShape.isRequired,
  onSubmit: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  formRef: PropTypes.object.isRequired,
};

export default injectIntl(LtiConfigForm);
