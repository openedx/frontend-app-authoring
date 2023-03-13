import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage, intlShape } from '@edx/frontend-platform/i18n';
import { selectors, actions } from '../../../../../data/redux';
import { messages } from './messages';
import './index.scss';

import TinyMceWidget from '../../../../../sharedComponents/TinyMceWidget';
import { prepareEditorRef } from '../../../../../sharedComponents/TinyMceWidget/hooks';

export const QuestionWidget = ({
  // redux
  question,
  // injected
  intl,
}) => {
  const { editorRef, refReady, setEditorRef } = prepareEditorRef();
  if (!refReady) { return null; }
  return (
    <div className="question-widget">
      <div className="h4 mb-3">
        <FormattedMessage {...messages.questionWidgetTitle} />
      </div>
      <TinyMceWidget
        id="question"
        editorType="question"
        editorRef={editorRef}
        textValue={question}
        setEditorRef={setEditorRef}
        minHeight={150}
        placeholder={intl.formatMessage(messages.placeholder)}
      />
    </div>
  );
};

QuestionWidget.propTypes = {
  // redux
  question: PropTypes.string.isRequired,
  // injected
  intl: intlShape.isRequired,
};
export const mapStateToProps = (state) => ({
  question: selectors.problem.question(state),
});

export const mapDispatchToProps = {
  updateQuestion: actions.problem.updateQuestion,
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(QuestionWidget));
