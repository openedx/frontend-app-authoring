import React from 'react';
import { useSelector } from 'react-redux';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import { selectors } from '../../../../../data/redux';
import messages from './messages';
import TinyMceWidget from '../../../../../sharedComponents/TinyMceWidget';
import {
  prepareEditorRef,
  replaceStaticWithAsset,
} from '../../../../../sharedComponents/TinyMceWidget/hooks';

const QuestionWidget = () => {
  const intl = useIntl();
  const question = useSelector(selectors.problem.question);
  const learningContextId = useSelector(selectors.app.learningContextId);
  const images = useSelector(selectors.app.images);
  const isLibrary = useSelector(selectors.app.isLibrary);
  const blockId = useSelector(selectors.app.blockId);

  const { editorRef, refReady, setEditorRef } = prepareEditorRef();

  const initialContent = question;
  const newContent = replaceStaticWithAsset({
    initialContent,
    learningContextId,
  });
  const questionContent = newContent || initialContent;

  let staticRootUrl;
  if (isLibrary) {
    staticRootUrl = `${getConfig().STUDIO_BASE_URL}/library_assets/blocks/${blockId}/`;
  }

  if (!refReady) { return null; }

  return (
    <div className="tinyMceWidget">
      <div className="h4 mb-3">
        <FormattedMessage {...messages.questionWidgetTitle} />
      </div>
      <TinyMceWidget
        id="question"
        editorType="question"
        editorRef={editorRef}
        editorContentHtml={questionContent}
        setEditorRef={setEditorRef}
        minHeight={150}
        placeholder={intl.formatMessage(messages.placeholder)}
        {...{
          images,
          isLibrary,
          learningContextId,
          staticRootUrl,
        }}
      />
    </div>
  );
};

export default QuestionWidget;
