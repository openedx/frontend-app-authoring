import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { ensureConfig } from '@edx/frontend-platform';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Card, Form, MailtoLink } from '@openedx/paragon';

import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';

import { updateValidationStatus } from '../../../data/slice';
import AppExternalLinks from '../shared/AppExternalLinks';
import messages from './messages';
import appMessages from '../../messages';
import { useModel } from '../../../../../generic/model-store';

ensureConfig(['SITE_NAME', 'SUPPORT_EMAIL'], 'LTI Config Form');

const LtiConfigForm = ({ onSubmit, intl, formRef }) => {
  const dispatch = useDispatch();

  const { selectedAppId, piiConfig } = useSelector((state) => state.discussions);
  const appConfig = useModel('appConfigs', selectedAppId);
  const app = useModel('apps', selectedAppId);
  const providerName = intl.formatMessage(appMessages[`appName-${app?.id}`]);
  const ltiAppConfig = {
    consumerKey: appConfig?.consumerKey || '',
    consumerSecret: appConfig?.consumerSecret || '',
    launchUrl: appConfig?.launchUrl || '',
    piiShareUsername: piiConfig.piiSharing ? piiConfig.piiShareUsername : undefined,
    piiShareEmail: piiConfig.piiSharing ? piiConfig.piiShareEmail : undefined,
  };
  const user = getAuthenticatedUser();
  const { externalLinks } = app;
  const {
    handleSubmit, handleChange, handleBlur, values, touched, errors,
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
  const showLTIConfig = user.administrator;
  const enablePIISharing = false;
  const supportEmails = {
    Yellowdig: 'learnmore@yellowdig.com',
    'Ed Discussion': 'team@edstem.org',
    InScribe: 'hello@inscribeapp.com',
    Piazza: 'team@piazza.com',
  };

  useEffect(() => {
    dispatch(updateValidationStatus({ hasError: Object.keys(errors).length > 0 }));
  }, [errors]);

  return (
    <Card className="mb-5 p-5" data-testid="ltiConfigForm">
      <Form ref={formRef} onSubmit={handleSubmit}>
        <h3 className="mb-3">{providerName}</h3>
        <p>
          <FormattedMessage
            {...messages.staffOnlyConfigInfo}
            values={{
              providerName,
              supportEmail: supportEmails[providerName] ? (
                <MailtoLink to={supportEmails[providerName]}>{supportEmails[providerName]}</MailtoLink>
              ) : (
                'support'
              ),
            }}
          />
        </p>
        <p>
          <FormattedMessage
            {...messages.staffOnlyConfigGuide}
            values={{
              providerName,
              supportEmail: supportEmails[providerName] ? (
                <MailtoLink to={supportEmails[providerName]}>{supportEmails[providerName]}</MailtoLink>
              ) : (
                'support'
              ),
            }}
          />
        </p>
        {(showLTIConfig && piiConfig.piiSharing) && (
          <>
            <p>{intl.formatMessage(messages.formInstructions)}</p>
            <Form.Group
              controlId="consumerKey"
              isInvalid={isInvalidConsumerKey}
              className="mb-4"
              data-testid="ltiConfigFields"
            >
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
            <Form.Group
              controlId="consumerSecret"
              isInvalid={isInvalidConsumerSecret}
              className="mb-4"
            >
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
        {(enablePIISharing) && (
          <div data-testid="piiSharingFields">
            <Form.Text className="my-2">{intl.formatMessage(messages.piiSharing)}</Form.Text>
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
          </div>
        )}
      </Form>
      <AppExternalLinks
        externalLinks={externalLinks}
        providerName={providerName}
        customClasses="small text-muted"
      />
    </Card>
  );
};

LtiConfigForm.propTypes = {
  intl: intlShape.isRequired,
  onSubmit: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  formRef: PropTypes.object.isRequired,
};

export default injectIntl(LtiConfigForm);
