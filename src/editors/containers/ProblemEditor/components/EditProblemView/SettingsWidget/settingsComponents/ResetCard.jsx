import React from 'react';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, ButtonGroup, Hyperlink } from '@edx/paragon';
import PropTypes from 'prop-types';
import SettingsOption from '../SettingsOption';
import messages from '../messages';
import { resetCardHooks } from '../hooks';

export const ResetCard = ({
  showResetButton,
  updateSettings,
  // inject
  intl,
}) => {
  const { setResetTrue, setResetFalse } = resetCardHooks(updateSettings);
  return (
    <SettingsOption
      title={intl.formatMessage(messages.resetSettingsTitle)}
      summary={showResetButton
        ? intl.formatMessage(messages.resetSettingsTrue) : intl.formatMessage(messages.resetSettingsFalse)}
    >
      <div className="halfSpacedMessage">
        <span>
          <FormattedMessage {...messages.resetSettingText} />
        </span>
      </div>
      <div className="spacedMessage">
        <Hyperlink destination="#" target="_blank">
          <FormattedMessage {...messages.advancedSettingsLinkText} />
        </Hyperlink>
      </div>
      <ButtonGroup size="lg" className="mb-2">
        <Button variant={showResetButton ? 'outline-primary' : 'primary'} onClick={setResetFalse}>
          <FormattedMessage {...messages.resetSettingsFalse} />
        </Button>
        <Button variant={showResetButton ? 'primary' : 'outline-primary'} onClick={setResetTrue}>
          <FormattedMessage {...messages.resetSettingsTrue} />
        </Button>
      </ButtonGroup>
    </SettingsOption>
  );
};

ResetCard.propTypes = {
  showResetButton: PropTypes.bool.isRequired,
  updateSettings: PropTypes.func.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(ResetCard);
