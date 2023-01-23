import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage, intlShape } from '@edx/frontend-platform/i18n';
import { Button } from '@edx/paragon';
import { Add } from '@edx/paragon/icons';
import SettingsOption from '../SettingsOption';
import messages from '../messages';
import { hintsCardHooks, hintsRowHooks } from '../hooks';
import HintRow from './HintRow';

export const HintsCard = ({
  hints,
  updateSettings,
  // inject
  intl,
}) => {
  const { summary, handleAdd } = hintsCardHooks(hints, updateSettings);
  return (
    <SettingsOption
      title={intl.formatMessage(messages.hintSettingTitle)}
      summary={intl.formatMessage(summary.message, { ...summary.values })}
    >
      {hints.map((hint) => (
        <HintRow
          key={hint.id}
          id={hint.id}
          value={hint.value}
          {...hintsRowHooks(hint.id, hints, updateSettings)}
        />
      ))}
      <Button
        className="my-3 ml-2"
        iconBefore={Add}
        variant="tertiary"
        onClick={handleAdd}
      >
        <FormattedMessage {...messages.addHintButtonText} />
      </Button>
    </SettingsOption>
  );
};

HintsCard.propTypes = {
  intl: intlShape.isRequired,
  hints: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })).isRequired,
  updateSettings: PropTypes.func.isRequired,
};

export default injectIntl(HintsCard);
