import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from '@edx/frontend-platform/i18n';

import { ProblemTypeKeys, getProblemTypes } from '@src/editors/data/constants/problem';
import SettingsOption from '../SettingsOption';
import messages from '../messages';
import TypeRow from './TypeRow';

const TypeCard = ({
  answers,
  blockTitle,
  correctAnswerCount,
  problemType,
  setBlockTitle,
  updateField,
  updateAnswer,
}) => {
  const intl = useIntl();
  const localizedProblemTypes = getProblemTypes(intl.formatMessage);
  const problemTypeKeysArray = Object.values(ProblemTypeKeys).filter(key => key !== ProblemTypeKeys.ADVANCED);

  if (problemType === ProblemTypeKeys.ADVANCED) { return null; }

  return (
    <SettingsOption
      title={intl.formatMessage(messages.typeSettingTitle)}
      summary={localizedProblemTypes[problemType].title}
    >
      {problemTypeKeysArray.map((typeKey, i) => (
        <TypeRow
          answers={answers}
          blockTitle={blockTitle}
          correctAnswerCount={correctAnswerCount}
          key={typeKey}
          typeKey={typeKey}
          label={localizedProblemTypes[typeKey].title}
          selected={typeKey !== problemType}
          problemType={problemType}
          lastRow={(i + 1) === problemTypeKeysArray.length}
          setBlockTitle={setBlockTitle}
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
  blockTitle: PropTypes.string.isRequired,
  correctAnswerCount: PropTypes.number.isRequired,
  problemType: PropTypes.string.isRequired,
  setBlockTitle: PropTypes.func.isRequired,
  updateField: PropTypes.func.isRequired,
  updateAnswer: PropTypes.func.isRequired,
};

export default TypeCard;
