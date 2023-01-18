import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import SettingsOption from '../SettingsOption';
import { ProblemTypeKeys, ProblemTypes } from '../../../../../../data/constants/problem';
import messages from '../messages';
import TypeRow from './TypeRow';

export const TypeCard = ({
  answers,
  correctAnswerCount,
  problemType,
  updateField,
  updateAnswer,
  // inject
  intl,
}) => {
  const problemTypeKeysArray = Object.values(ProblemTypeKeys).filter(key => key !== ProblemTypeKeys.ADVANCED);

  if (problemType === ProblemTypeKeys.ADVANCED) { return null; }

  return (
    <SettingsOption
      title={intl.formatMessage(messages.typeSettingTitle)}
      summary={ProblemTypes[problemType].title}
    >
      {problemTypeKeysArray.map((typeKey, i) => (
        <TypeRow
          answers={answers}
          correctAnswerCount={correctAnswerCount}
          key={typeKey}
          typeKey={typeKey}
          label={ProblemTypes[typeKey].title}
          selected={typeKey !== problemType}
          lastRow={(i + 1) === problemTypeKeysArray.length}
          updateField={updateField}
          updateAnswer={updateAnswer}
        />
      ))}
    </SettingsOption>
  );
};

TypeCard.propTypes = {
  answers: PropTypes.arrayOf(PropTypes.shape({
    correct: PropTypes.bool,
    id: PropTypes.string,
    selectedFeedback: PropTypes.string,
    title: PropTypes.string,
    unselectedFeedback: PropTypes.string,
  })).isRequired,
  correctAnswerCount: PropTypes.number.isRequired,
  problemType: PropTypes.string.isRequired,
  updateField: PropTypes.func.isRequired,
  updateAnswer: PropTypes.func.isRequired,
  // injected
  intl: intlShape.isRequired,
};

export default injectIntl(TypeCard);
