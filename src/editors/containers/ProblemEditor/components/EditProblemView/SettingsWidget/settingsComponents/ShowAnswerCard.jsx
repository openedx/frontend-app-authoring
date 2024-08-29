import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage, intlShape } from '@edx/frontend-platform/i18n';
import { Form, Hyperlink } from '@openedx/paragon';
import SettingsOption from '../SettingsOption';
import { ShowAnswerTypes, ShowAnswerTypesKeys } from '../../../../../../data/constants/problem';
import { selectors } from '../../../../../../data/redux';
import messages from '../messages';
import { useAnswerSettings } from '../hooks';

const ShowAnswerCard = ({
  showAnswer,
  updateSettings,
  defaultValue,
  // inject
  intl,
  // redux
  studioEndpointUrl,
  learningContextId,
  isLibrary,
}) => {
  const {
    handleShowAnswerChange,
    handleAttemptsChange,
    showAttempts,
  } = useAnswerSettings(showAnswer, updateSettings);

  const currentShowAnswer = showAnswer.on || defaultValue;

  const showAnswerSection = (
    <>
      <div className="pb-2">
        <span>
          <FormattedMessage {...messages.showAnswerSettingText} />
        </span>
      </div>
      {!isLibrary && (
        <div className="pb-4">
          <Hyperlink destination={`${studioEndpointUrl}/settings/advanced/${learningContextId}#showanswer`} target="_blank">
            <FormattedMessage {...messages.advancedSettingsLinkText} />
          </Hyperlink>
        </div>
      )}
      <Form.Group className="pb-0 mb-0">
        <Form.Control
          as="select"
          value={currentShowAnswer}
          onChange={handleShowAnswerChange}
        >
          {Object.values(ShowAnswerTypesKeys).map((answerType) => {
            let optionDisplayName = ShowAnswerTypes[answerType];
            if (answerType === defaultValue) {
              optionDisplayName = { ...optionDisplayName, defaultMessage: `${optionDisplayName.defaultMessage} (Default)` };
            }
            return (
              <option
                key={answerType}
                value={answerType}
              >
                {intl.formatMessage(optionDisplayName)}
              </option>
            );
          })}
        </Form.Control>
      </Form.Group>
      {showAttempts
        && (
        <Form.Group className="pb-0 mb-0 mt-4">
          <Form.Control
            type="number"
            min={0}
            value={showAnswer.afterAttempts}
            onChange={handleAttemptsChange}
            floatingLabel={intl.formatMessage(messages.showAnswerAttemptsInputLabel)}
          />
        </Form.Group>
        )}
    </>
  );

  return (
    <SettingsOption
      title={intl.formatMessage(messages.showAnswerSettingsTitle)}
      summary={intl.formatMessage(ShowAnswerTypes[currentShowAnswer])}
    >
      {showAnswerSection}
    </SettingsOption>
  );
};

ShowAnswerCard.propTypes = {
  intl: intlShape.isRequired,
  // eslint-disable-next-line
  showAnswer: PropTypes.any.isRequired,
  solutionExplanation: PropTypes.string,
  updateSettings: PropTypes.func.isRequired,
  studioEndpointUrl: PropTypes.string.isRequired,
  learningContextId: PropTypes.string,
  isLibrary: PropTypes.bool.isRequired,
  defaultValue: PropTypes.string,
};
ShowAnswerCard.defaultProps = {
  solutionExplanation: '',
  learningContextId: null,
  defaultValue: 'finished',
};

export const mapStateToProps = (state) => ({
  studioEndpointUrl: selectors.app.studioEndpointUrl(state),
  learningContextId: selectors.app.learningContextId(state),
  isLibrary: selectors.app.isLibrary(state),
});

export const mapDispatchToProps = {};

export const ShowAnswerCardInternal = ShowAnswerCard; // For testing only
export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(ShowAnswerCard));
