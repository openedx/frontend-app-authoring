import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { ensureConfig, getConfig } from '@edx/frontend-platform';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Card, Form, MailtoLink } from '@edx/paragon';

import { useFormik } from 'formik';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';

import { updateValidationStatus } from '../../../data/slice';
import AppExternalLinks from '../shared/AppExternalLinks';
import messages from './messages';

ensureConfig([
  'SITE_NAME',
  'SUPPORT_EMAIL',
], 'LTI Config Form');

function LtiConfigForm({
  appConfig, app, onSubmit, intl, formRef, providerName,
}) {
  const ltiAppConfig = {
    consumerKey: appConfig.consumerKey || '',
    consumerSecret: appConfig.consumerSecret || '',
    launchUrl: appConfig.launchUrl || '',
    piiShareUsername: appConfig.piiShareUsername,
    piiShareEmail: appConfig.piiShareEmail,
  };

  const user = getAuthenticatedUser();
  const dispatch = useDispatch();
  const { externalLinks } = app;
  const {
    handleSubmit,
    handleChange,
    handleBlur,
    values,
    touched,
    errors,
  } = useFormik({
    initialValues: ltiAppConfig,
    validationSchema: Yup.object().shape({
      consumerKey: Yup.string().required(intl.formatMessage(messages.consumerKeyRequired)),
      consumerSecret: Yup.string().required(intl.formatMessage(messages.consumerSecretRequired)),
      launchUrl: Yup.string().required(intl.formatMessage(messages.launchUrlRequired)),
      piiShareUsername: Yup.bool(),
      piiShareEmail: Yup.bool(),
    }),
    onSubmit,
  });
  const isInvalidConsumerKey = Boolean(touched.consumerKey && errors.consumerKey);
  const isInvalidConsumerSecret = Boolean(touched.consumerSecret && errors.consumerSecret);
  const isInvalidLaunchUrl = Boolean(touched.launchUrl && errors.launchUrl);
  const supportEmail = getConfig().SUPPORT_EMAIL;
  const showLTIConfig = user.administrator || !app.adminOnlyConfig;

  useEffect(() => {
    dispatch(updateValidationStatus({ hasError: Object.keys(errors).length > 0 }));
  }, [errors]);

  return (
    <Card className="mb-5 p-5" data-testid="ltiConfigForm">
      <Form ref={formRef} onSubmit={handleSubmit}>
        <h3 className="mb-3">{providerName}</h3>
        <p>{showLTIConfig
          ? intl.formatMessage(messages.formInstructions)
          : (
            <FormattedMessage
              {...messages.adminOnlyConfig}
              values={{
                providerName,
                platformName: getConfig().SITE_NAME,
                supportEmail: supportEmail
                  ? <MailtoLink to={supportEmail}>{supportEmail}</MailtoLink>
                  : 'support',
              }}
            />
          )}
        </p>
        {app.messages && app.messages.map(msg => (
          <p key={msg}>{msg}</p>
        ))}
        {showLTIConfig && (
          <>
            <Form.Group controlId="consumerKey" isInvalid={isInvalidConsumerKey} className="mb-4" data-testid="ltiConfigFields">
              <Form.Control
                floatingLabel={intl.formatMessage(messages.consumerKey)}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.consumerKey}
              />
              {isInvalidConsumerKey && (
                <Form.Control.Feedback type="invalid" hasIcon={false}>
                  <span className="x-small">{errors.consumerKey}</span>
                </Form.Control.Feedback>
              )}
            </Form.Group>
            <Form.Group controlId="consumerSecret" isInvalid={isInvalidConsumerSecret} className="mb-4">
              <Form.Control
                floatingLabel={intl.formatMessage(messages.consumerSecret)}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.consumerSecret}
              />
              {isInvalidConsumerSecret && (
                <Form.Control.Feedback type="invalid" hasIcon={false}>
                  <span className="x-small">{errors.consumerSecret}</span>
                </Form.Control.Feedback>
              )}
            </Form.Group>
            <Form.Group controlId="launchUrl" isInvalid={isInvalidLaunchUrl}>
              <Form.Control
                floatingLabel={intl.formatMessage(messages.launchUrl)}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.launchUrl}
              />
              {isInvalidLaunchUrl && (
                <Form.Control.Feedback type="invalid" hasIcon={false}>
                  <span className="x-small">{errors.launchUrl}</span>
                </Form.Control.Feedback>
              )}
            </Form.Group>
          </>
        )}
        {appConfig.piiSharing && (
          <>
            <Form.Text className="my-2">
              {intl.formatMessage(messages.piiSharing)}
            </Form.Text>
            <Form.Group controlId="piiSharing">
              <Form.Check
                type="checkbox"
                name="piiShareUsername"
                onChange={handleChange}
                onBlur={handleBlur}
                checked={values.piiShareUsername}
                label={intl.formatMessage(messages.piiShareUsername)}
              />
              <Form.Check
                type="checkbox"
                name="piiShareEmail"
                onChange={handleChange}
                onBlur={handleBlur}
                checked={values.piiShareEmail}
                label={intl.formatMessage(messages.piiShareEmail)}
              />
            </Form.Group>
          </>
        )}
      </Form>
      <AppExternalLinks externalLinks={externalLinks} providerName={providerName} />
    </Card>
  );
}

LtiConfigForm.propTypes = {
  app: PropTypes.shape({
    id: PropTypes.string.isRequired,
    adminOnlyConfig: PropTypes.bool,
    externalLinks: PropTypes.shape({
      learnMore: PropTypes.string,
      configuration: PropTypes.string,
      general: PropTypes.string,
      accessibility: PropTypes.string,
      contactEmail: PropTypes.string,
    }).isRequired,
    messages: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  appConfig: PropTypes.shape({
    consumerKey: PropTypes.string,
    consumerSecret: PropTypes.string,
    launchUrl: PropTypes.string,
    piiSharing: PropTypes.bool.isRequired,
    piiShareUsername: PropTypes.bool.isRequired,
    piiShareEmail: PropTypes.bool.isRequired,
  }),
  intl: intlShape.isRequired,
  onSubmit: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  formRef: PropTypes.object.isRequired,
  providerName: PropTypes.string.isRequired,
};

LtiConfigForm.defaultProps = {
  appConfig: {
    consumerKey: '',
    consumerSecret: '',
    launchUrl: '',
  },
};

export default injectIntl(LtiConfigForm);
