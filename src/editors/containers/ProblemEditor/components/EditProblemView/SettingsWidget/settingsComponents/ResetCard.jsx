import React from 'react';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, ButtonGroup, Hyperlink } from '@openedx/paragon';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import SettingsOption from '../SettingsOption';
import messages from '../messages';
import { resetCardHooks } from '../hooks';
import { selectors } from '../../../../../../data/redux';

const ResetCard = ({
  showResetButton,
  defaultValue,
  updateSettings,
  // inject
  intl,
}) => {
  const isLibrary = useSelector(selectors.app.isLibrary);
  const { setResetTrue, setResetFalse } = resetCardHooks(updateSettings);
  const advancedSettingsLink = `${useSelector(selectors.app.studioEndpointUrl)}/settings/advanced/${useSelector(selectors.app.learningContextId)}#show_reset_button`;
  const currentResetButton = showResetButton !== null ? showResetButton : defaultValue;
  return (
    <SettingsOption
      title={intl.formatMessage(messages.resetSettingsTitle)}
      summary={currentResetButton
        ? intl.formatMessage(messages.resetSettingsTrue) : intl.formatMessage(messages.resetSettingsFalse)}
      className="resetCard"
    >
      <div className="halfSpacedMessage">
        <span>
          <FormattedMessage {...messages.resetSettingText} />
        </span>
      </div>
      {!isLibrary && (
        <div className="spacedMessage">
          <Hyperlink destination={advancedSettingsLink} target="_blank">
            <FormattedMessage {...messages.advancedSettingsLinkText} />
          </Hyperlink>
        </div>
      )}
      <ButtonGroup size="sm" className="resetSettingsButtons mb-2">
        <Button variant={currentResetButton ? 'outline-primary' : 'primary'} size="sm" onClick={setResetFalse}>
          <FormattedMessage {...messages.resetSettingsFalse} />
        </Button>
        <Button variant={currentResetButton ? 'primary' : 'outline-primary'} size="sm" onClick={setResetTrue}>
          <FormattedMessage {...messages.resetSettingsTrue} />
        </Button>
      </ButtonGroup>
    </SettingsOption>
  );
};

ResetCard.propTypes = {
  showResetButton: PropTypes.bool.isRequired,
  defaultValue: PropTypes.bool.isRequired,
  updateSettings: PropTypes.func.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export const ResetCardInternal = ResetCard; // For testing only
export default injectIntl(ResetCard);
