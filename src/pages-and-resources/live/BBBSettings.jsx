import React, { useEffect, useState } from 'react';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Form, Hyperlink } from '@edx/paragon';
import PropTypes from 'prop-types';
import messages from './messages';
import { providerNames, bbbPlanTypes } from './constants';
import AppConfigFormDivider from '../discussions/app-config-form/apps/shared/AppConfigFormDivider';
import LiveCommonFields from './LiveCommonFields';
import { useModel } from '../../generic/model-store';

function BbbSettings({
  intl,
  values,
  setFieldValue,
}) {
  const [bbbPlan, setBbbPlan] = useState(values.tierType);

  useEffect(() => {
    setBbbPlan(values.tierType);
  }, [values.tierType]);

  const appInfo = useModel('courseApps', 'live');
  const app = useModel('liveApps', 'big_blue_button');
  const isPiiDisabled = !values.piiSharingEnable;
  function getBbbPlanOptions() {
    const options = ['Select', bbbPlanTypes.commercial];
    if (app.hasFreeTier) { options.push(bbbPlanTypes.free); }
    return options.map(option => (
      <option
        key={option}
        value={option}
        data-testid={option}
      >
        {option}
      </option>
    ));
  }
  const handlePlanChange = (e) => {
    setBbbPlan(e.target.value);
    setFieldValue('tierType', e.target.value);
  };
  return (
    <>
      {isPiiDisabled ? (
        <p data-testid="request-pii-sharing">
          {intl.formatMessage(messages.requestPiiSharingEnableForBbb, { provider: providerNames[values.provider] })}
        </p>
      ) : (
        <p data-testid="helper-text">
          {intl.formatMessage(messages.providerHelperText, { providerName: providerNames[values.provider] })}
        </p>
      )}

      <Form.Group controlId="bbs-settings" data-testid="plansDropDown">
        <Form.Label as="planSelector" className="h6">
          <FormattedMessage
            id="authoring.live.bbb.selectPlan.label"
            defaultMessage="Select a plan"
            description="Label for bbb plan selection"
          />
        </Form.Label>
        <Form.Control
          as="select"
          name="tierType"
          value={bbbPlan}
          onChange={handlePlanChange}
          disabled={isPiiDisabled}
        >
          {getBbbPlanOptions()}
        </Form.Control>
      </Form.Group>

      <Hyperlink
        destination={appInfo.documentationLinks.learnMoreConfiguration}
        target="_blank"
        rel="noopener noreferrer"
        showLaunchIcon
        className="text-primary-500 pt-2"
      >
        { intl.formatMessage(messages.learnMore, { providerName: 'plans' }) }
      </Hyperlink>
      <>
        <AppConfigFormDivider thick marginAdj={{ default: 0, sm: 2 }} />
        {isPiiDisabled ? (
          <p data-testid="help-request-pii-sharing">
            {intl.formatMessage(messages.piiSharingEnableHelpTextBbb)}
          </p>
        ) : (
          <>
            {bbbPlan === bbbPlanTypes.commercial && <LiveCommonFields values={values} />}
            {bbbPlan === bbbPlanTypes.free
              && (
              <p data-testid="free-plan-message">
                {intl.formatMessage(messages.freePlanMessage)}
              </p>
            )}
          </>
        )}
      </>
    </>

  );
}

BbbSettings.propTypes = {
  intl: intlShape.isRequired,
  values: PropTypes.shape({
    consumerKey: PropTypes.string,
    consumerSecret: PropTypes.string,
    launchUrl: PropTypes.string,
    launchEmail: PropTypes.string,
    provider: PropTypes.string,
    piiSharingEmail: PropTypes.bool,
    piiSharingUsername: PropTypes.bool,
    piiSharingEnable: PropTypes.bool,
    tierType: PropTypes.string,
  }).isRequired,
  setFieldValue: PropTypes.func.isRequired,
};

export default injectIntl(BbbSettings);
