import React from 'react';
import PropTypes from 'prop-types';
import { Editor } from '@tinymce/tinymce-react';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import * as hooks from '../../../hooks';
import { selectors, actions } from '../../../../../data/redux';
import { messages } from './messages';
import './index.scss';

import 'tinymce';
import 'tinymce/themes/silver';
import 'tinymce/skins/ui/oxide/skin.css';
import 'tinymce/icons/default';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/table';
import 'tinymce/plugins/hr';
import 'tinymce/plugins/codesample';
import 'tinymce/plugins/emoticons';
import 'tinymce/plugins/emoticons/js/emojis';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/code';
import 'tinymce/plugins/autoresize';
import 'tinymce/plugins/image';
import 'tinymce/plugins/imagetools';

// This widget should be connected, grab all questions from store, update them as needed.
export const QuestionWidget = ({
  question,
  updateQuestion,
}) => {
  const { refReady, setEditorRef } = hooks.prepareEditorRef();
  if (!refReady) { return null; }
  return (
    <div className="question-widget">
      <div className="h4 mb-3">
        <FormattedMessage {...messages.questionWidgetTitle} />
      </div>
      <Editor {
          ...hooks.problemEditorConfig({
            setEditorRef,
            question,
            updateQuestion,
          })
        }
      />
    </div>
  );
};

QuestionWidget.propTypes = {
  question: PropTypes.string.isRequired,
  updateQuestion: PropTypes.func.isRequired,
};

export const mapStateToProps = (state) => ({
  question: selectors.problem.question(state),
});

export const mapDispatchToProps = {
  updateQuestion: actions.problem.updateQuestion,
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(QuestionWidget));
