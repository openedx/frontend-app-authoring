import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Card, Form } from '@edx/paragon';

import { useFormik } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';

import { updateValidationStatus } from '../../../data/slice';
import AppExternalLinks from './AppExternalLinks';
import messages from './messages';
import appMessages from '../../../app-list/messages';
import { useModel } from '../../../../../generic/model-store';
import FieldFeedback from '../../../../../generic/FieldFeedback';
import { checkFieldErrors } from '../../../../discussions/app-config-form/utils';

function LtiConfigForm({ onSubmit, intl, formRef }) {
  const dispatch = useDispatch();

  const { selectedAppId, piiConfig } = useSelector((state) => state.live);
  const appConfig = useModel('liveAppConfigs', selectedAppId);
  const app = useModel('liveApps', selectedAppId);
  const providerName = intl.formatMessage(appMessages[`appName-${app?.id}`]);
  const ltiAppConfig = {
    consumerKey: appConfig?.consumerKey || '',
    consumerSecret: appConfig?.consumerSecret || '',
    launchUrl: appConfig?.launchUrl || '',
    launchEmail: appConfig?.launchEmail || '',
    piiShareUsername: piiConfig.piiSharing ? piiConfig.piiShareUsername : undefined,
    piiShareEmail: piiConfig.piiSharing ? piiConfig.piiShareEmail : undefined,
  };
  const { externalLinks } = app;
  const {
    handleSubmit, handleChange, handleBlur, values, touched, errors,
  } = useFormik({
    initialValues: ltiAppConfig,
    validationSchema: Yup.object().shape({
      consumerKey: Yup.string().required(intl.formatMessage(messages.consumerKeyRequired)),
      consumerSecret: Yup.string().required(intl.formatMessage(messages.consumerSecretRequired)),
      launchUrl: Yup.string().required(intl.formatMessage(messages.launchUrlRequired)),
      launchEmail: Yup.string().required(intl.formatMessage(messages.launchEmailRequired)),
      piiShareUsername: Yup.bool(),
      piiShareEmail: Yup.bool(),
    }),
    onSubmit,
  });

  const isInvalidConsumerKey = checkFieldErrors(touched, errors, false, 'consumerKey');
  const isInvalidConsumerSecret = checkFieldErrors(touched, errors, false, 'consumerSecret');
  const isInvalidLaunchUrl = checkFieldErrors(touched, errors, false, 'launchUrl');
  const isInvalidLaunchEmail = checkFieldErrors(touched, errors, false, 'launchEmail');

  useEffect(() => {
    dispatch(updateValidationStatus({ hasError: Object.keys(errors).length > 0 }));
  }, [errors]);

  return (
    <Card className="mb-5 p-5" data-testid="ltiConfigForm">
      <Form ref={formRef} onSubmit={handleSubmit}>
        <h3 className="mb-3">{providerName}</h3>
        <p>{intl.formatMessage(messages.helperText)}</p>
        {piiConfig.piiSharing && (
          <>
            <p>{intl.formatMessage(messages.formInstructions)}</p>
            <Form.Group
              controlId="consumerKey"
              isInvalid={isInvalidConsumerKey}
              className="mb-3"
              data-testid="ltiConfigFields"
            >
              <Form.Control
                floatingLabel={intl.formatMessage(messages.consumerKey)}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.consumerKey}
              />
              <FieldFeedback
                errorCondition={isInvalidConsumerKey}
                errorMessage={errors.consumerKey}
                transitionClasses="mt-1"
              />
            </Form.Group>
            <Form.Group
              controlId="consumerSecret"
              isInvalid={isInvalidConsumerSecret}
              className="mb-3"
            >
              <Form.Control
                floatingLabel={intl.formatMessage(messages.consumerSecret)}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.consumerSecret}
              />
              <FieldFeedback
                errorCondition={isInvalidConsumerSecret}
                errorMessage={errors.consumerSecret}
                transitionClasses="mt-1"
              />
            </Form.Group>
            <Form.Group
              controlId="launchUrl"
              isInvalid={isInvalidLaunchUrl}
              className="mb-3"
            >
              <Form.Control
                floatingLabel={intl.formatMessage(messages.launchUrl)}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.launchUrl}
              />
              <FieldFeedback
                errorCondition={isInvalidLaunchUrl}
                errorMessage={errors.launchUrl}
                transitionClasses="mt-1"
              />
            </Form.Group>
            <Form.Group controlId="launchEmail" isInvalid={isInvalidLaunchEmail}>
              <Form.Control
                floatingLabel={intl.formatMessage(messages.launchEmail)}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.launchEmail}
              />
              <FieldFeedback
                errorCondition={isInvalidLaunchEmail}
                errorMessage={errors.launchEmail}
                transitionClasses="mt-1"
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
  intl: intlShape.isRequired,
  onSubmit: PropTypes.func.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  formRef: PropTypes.object.isRequired,
};

export default injectIntl(LtiConfigForm);
