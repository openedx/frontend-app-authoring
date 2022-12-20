import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage, intlShape } from '@edx/frontend-platform/i18n';
import { Form, Hyperlink } from '@edx/paragon';
import SettingsOption from '../SettingsOption';
import { ShowAnswerTypes, ShowAnswerTypesKeys } from '../../../../../../data/constants/problem';
import messages from '../messages';
import { showAnswerCardHooks } from '../hooks';

export const ShowAnswerCard = ({
  showAnswer,
  updateSettings,
  // inject
  intl,
}) => {
  const {
    handleShowAnswerChange,
    handleAttemptsChange,
    showAttempts,
  } = showAnswerCardHooks(showAnswer, updateSettings);
  return (
    <SettingsOption
      title={intl.formatMessage(messages.showAnswerSettingsTitle)}
      summary={intl.formatMessage(ShowAnswerTypes[showAnswer.on])}
    >
      <div className="halfSpacedMessage">
        <span>
          <FormattedMessage {...messages.showAnswerSettingText} />
        </span>
      </div>
      <div className="spacedMessage">
        <Hyperlink destination="#" target="_blank">
          <FormattedMessage {...messages.advancedSettingsLinkText} />
        </Hyperlink>
      </div>
      <Form.Group>
        <Form.Control
          as="select"
          value={showAnswer.on}
          onChange={handleShowAnswerChange}
        >
          {Object.values(ShowAnswerTypesKeys).map((answerType) => (
            <option
              key={answerType}
              value={answerType}
            >
              {intl.formatMessage(ShowAnswerTypes[answerType])}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
      { showAttempts
        && (
        <Form.Group>
          <Form.Control
            type="number"
            value={showAnswer.afterAttempts}
            onChange={handleAttemptsChange}
            floatingLabel={intl.formatMessage(messages.showAnswerAttemptsInputLabel)}
          />
        </Form.Group>
        )}
    </SettingsOption>
  );
};

ShowAnswerCard.propTypes = {
  intl: intlShape.isRequired,
  // eslint-disable-next-line
  showAnswer: PropTypes.any.isRequired,
  updateSettings: PropTypes.func.isRequired,
};

export default injectIntl(ShowAnswerCard);
