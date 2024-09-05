import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage, intlShape } from '@edx/frontend-platform/i18n';
import SettingsOption from '../SettingsOption';
import { ProblemTypeKeys } from '../../../../../../data/constants/problem';
import messages from '../messages';
import { hintsCardHooks, hintsRowHooks } from '../hooks';
import HintRow from './HintRow';
import Button from '../../../../../../sharedComponents/Button';

const HintsCard = ({
  hints,
  problemType,
  updateSettings,
  images,
  isLibrary,
  learningContextId,
  // inject
  intl,
}) => {
  const { summary, handleAdd } = hintsCardHooks(hints, updateSettings);

  if (problemType === ProblemTypeKeys.ADVANCED) { return null; }

  return (
    <SettingsOption
      title={intl.formatMessage(messages.hintSettingTitle)}
      summary={intl.formatMessage(summary.message, { ...summary.values })}
      none={!hints.length}
      hasExpandableTextArea
    >
      {hints.map((hint) => (
        <HintRow
          key={hint.id}
          id={hint.id}
          value={hint.value}
          {...{
            ...hintsRowHooks(hint.id, hints, updateSettings),
            images,
            isLibrary,
            learningContextId,
          }}
        />
      ))}
      <Button
        className="m-0 p-0 font-weight-bold"
        variant="add"
        onClick={handleAdd}
        size="sm"
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
  problemType: PropTypes.string.isRequired,
  updateSettings: PropTypes.func.isRequired,
  images: PropTypes.shape({}).isRequired,
  learningContextId: PropTypes.string.isRequired,
  isLibrary: PropTypes.bool.isRequired,
};

export const HintsCardInternal = HintsCard; // For testing only
export default injectIntl(HintsCard);
