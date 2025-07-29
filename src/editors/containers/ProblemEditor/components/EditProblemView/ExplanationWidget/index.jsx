import React from 'react';
import { useSelector } from 'react-redux';
import { useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import { selectors } from '../../../../../data/redux';
import messages from './messages';
import TinyMceWidget from '../../../../../sharedComponents/TinyMceWidget';
import { prepareEditorRef, replaceStaticWithAsset } from '../../../../../sharedComponents/TinyMceWidget/hooks';

const ExplanationWidget = () => {
  const intl = useIntl();
  const { editorRef, refReady, setEditorRef } = prepareEditorRef();

  const settings = useSelector(selectors.problem.settings);
  const learningContextId = useSelector(selectors.app.learningContextId);
  const images = useSelector(selectors.app.images);
  const isLibrary = useSelector(selectors.app.isLibrary);
  const blockId = useSelector(selectors.app.blockId);

  const initialContent = settings?.solutionExplanation || '';
  const newContent = replaceStaticWithAsset({
    initialContent,
    learningContextId,
  });
  const solutionContent = newContent || initialContent;

  let staticRootUrl;
  if (isLibrary) {
    staticRootUrl = `${getConfig().STUDIO_BASE_URL}/library_assets/blocks/${blockId}/`;
  }

  if (!refReady) { return null; }

  return (
    <div className="tinyMceWidget mt-4 text-primary-500">
      <div className="h4 mb-3">
        <FormattedMessage {...messages.solutionWidgetTitle} />
      </div>
      <div className="small mb-3">
        <FormattedMessage {...messages.solutionDescriptionText} />
      </div>
      <TinyMceWidget
        id="solution"
        editorType="solution"
        editorRef={editorRef}
        editorContentHtml={solutionContent}
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

export default ExplanationWidget;
