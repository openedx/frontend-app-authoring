import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage, intlShape } from '@edx/frontend-platform/i18n';
import {
  IconButton,
  Icon,
} from '@openedx/paragon';
import { DeleteOutline } from '@openedx/paragon/icons';
import { selectors } from '../../../../../data/redux';
import messages from './messages';

import TinyMceWidget from '../../../../../sharedComponents/TinyMceWidget';
import { prepareEditorRef, replaceStaticWithAsset } from '../../../../../sharedComponents/TinyMceWidget/hooks';

const ExplanationWidget = ({
  // redux
  settings,
  learningContextId,
  images,
  isLibrary,
  // injected
  intl,
}) => {
  const { editorRef, refReady, setEditorRef } = prepareEditorRef();
  const initialContent = settings?.solutionExplanation || '';
  const newContent = replaceStaticWithAsset({
    initialContent,
    learningContextId,
  });
  const solutionContent = newContent || initialContent;
  if (!refReady) { return null; }
  return (
    <div className="tinyMceWidget p-4 text-primary-500 border-top border-light">
      <div className="d-flex align-items-center justify-content-between h4 mb-3">
        <FormattedMessage {...messages.solutionWidgetTitle} />
        <IconButton
          src={DeleteOutline}
          iconAs={Icon}
          alt={intl.formatMessage(messages.explanationDeleteIconAltText)}
          onClick={() => {}}
          variant="primary"
        />
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
        }}
      />
    </div>
  );
};

ExplanationWidget.propTypes = {
  // redux
  // eslint-disable-next-line
  settings: PropTypes.any.isRequired,
  learningContextId: PropTypes.string.isRequired,
  images: PropTypes.shape({}).isRequired,
  isLibrary: PropTypes.bool.isRequired,
  // injected
  intl: intlShape.isRequired,
};
export const mapStateToProps = (state) => ({
  settings: selectors.problem.settings(state),
  learningContextId: selectors.app.learningContextId(state),
  images: selectors.app.images(state),
  isLibrary: selectors.app.isLibrary(state),
});

export const ExplanationWidgetInternal = ExplanationWidget; // For testing only
export default injectIntl(connect(mapStateToProps)(ExplanationWidget));
