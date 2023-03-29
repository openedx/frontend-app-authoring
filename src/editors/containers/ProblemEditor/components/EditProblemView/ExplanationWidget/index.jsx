import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage, intlShape } from '@edx/frontend-platform/i18n';
import { selectors } from '../../../../../data/redux';
import messages from './messages';

import TinyMceWidget from '../../../../../sharedComponents/TinyMceWidget';
import { prepareEditorRef } from '../../../../../sharedComponents/TinyMceWidget/hooks';

export const ExplanationWidget = ({
  // redux
  settings,
  // injected
  intl,
}) => {
  const { editorRef, refReady, setEditorRef } = prepareEditorRef();
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
        textValue={settings?.solutionExplanation}
        setEditorRef={setEditorRef}
        minHeight={150}
        placeholder={intl.formatMessage(messages.placeholder)}
      />
    </div>
  );
};

ExplanationWidget.propTypes = {
  // redux
  // eslint-disable-next-line
  settings: PropTypes.any.isRequired,
  // injected
  intl: intlShape.isRequired,
};
export const mapStateToProps = (state) => ({
  settings: selectors.problem.settings(state),
});

export default injectIntl(connect(mapStateToProps)(ExplanationWidget));
