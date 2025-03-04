import React from 'react';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { Button, ButtonGroup } from '@openedx/paragon';
import PropTypes from 'prop-types';
import SettingsOption from '../SettingsOption';

const ShuffleCard = ({
  showShuffleButton,
  defaultValue,
  updateSettings,
  // inject
  intl,
}) => {
  // const isLibrary = useSelector(selectors.app.isLibrary);
  // const { setResetTrue, setResetFalse } = resetCardHooks(updateSettings);
  // const advancedSettingsLink = `${useSelector(selectors.app.studioEndpointUrl)}/settings/advanced/${useSelector(selectors.app.learningContextId)}#show_reset_button`;
  const currentShuffleButton = showShuffleButton !== null ? showShuffleButton : defaultValue;
  return (
    <SettingsOption
      title="Shuffle"
      summary={showShuffleButton
        ? 'True' : 'False'}
      className="shuffleCard"
    >
      <div className="halfSpacedMessage pb-3">
        <span>
          Shuffle the order of answer choices shown to learners.
        </span>
      </div>
      <ButtonGroup size="sm" className="shuffleSettingsButtons w-100 mb-2">
        <Button variant={currentShuffleButton ? 'outline-primary text-gray-700 border-light-400' : 'primary'} size="sm" onClick={() => {}}>
          False
        </Button>
        <Button variant={currentShuffleButton ? 'primary' : 'outline-primary text-gray-700 border-light-400'} size="sm" onClick={() => {}}>
          True
        </Button>
      </ButtonGroup>
    </SettingsOption>
  );
};

ShuffleCard.propTypes = {
  showShuffleButton: PropTypes.bool.isRequired,
  defaultValue: PropTypes.bool.isRequired,
  updateSettings: PropTypes.func.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export const ShuffleCardInternal = ShuffleCard; // For testing only
export default injectIntl(ShuffleCard);
