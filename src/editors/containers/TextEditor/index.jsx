import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
  Spinner,
  Toast,
} from '@edx/paragon';
import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';

import { actions, selectors } from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';

import EditorContainer from '../EditorContainer';
import RawEditor from '../../sharedComponents/RawEditor';
import * as hooks from './hooks';
import messages from './messages';
import TinyMceWidget from '../../sharedComponents/TinyMceWidget';

export const TextEditor = ({
  onClose,
  // redux
  isRaw,
  isLibrary,
  blockValue,
  lmsEndpointUrl,
  studioEndpointUrl,
  blockFailed,
  initializeEditor,
  assetsFinished,
  assets,
  // inject
  intl,
}) => {
  const { editorRef, refReady, setEditorRef } = hooks.prepareEditorRef();

  if (!refReady) { return null; }

  const selectEditor = () => {
    if (isRaw) {
      return (
        <RawEditor
          editorRef={editorRef}
          content={blockValue}
        />
      );
    }
    return (
      <TinyMceWidget
        editorType="text"
        editorRef={editorRef}
        textValue={blockValue ? blockValue.data.data : ''}
        setEditorRef={setEditorRef}
        minHeight={500}
        height="100%"
        initializeEditor={initializeEditor}
        isLibrary={isLibrary}
        lmsEndpointUrl={lmsEndpointUrl}
        studioEndpointUrl={studioEndpointUrl}
        assets={assets}
      />
    );
  };

  return (
    <EditorContainer
      getContent={hooks.getContent({ editorRef, isRaw, assets })}
      onClose={onClose}
    >
      <div className="editor-body h-75 overflow-auto">
        <Toast show={blockFailed} onClose={hooks.nullMethod}>
          <FormattedMessage {...messages.couldNotLoadTextContext} />
        </Toast>

        {(!assetsFinished)
          ? (
            <div className="text-center p-6">
              <Spinner
                animation="border"
                className="m-3"
                screenreadertext={intl.formatMessage(messages.spinnerScreenReaderText)}
              />
            </div>
          ) : (selectEditor())}
      </div>

    </EditorContainer>
  );
};
TextEditor.defaultProps = {
  blockValue: null,
  isRaw: null,
  isLibrary: null,
  lmsEndpointUrl: null,
  studioEndpointUrl: null,
  assetsFinished: null,
  assets: null,
};
TextEditor.propTypes = {
  onClose: PropTypes.func.isRequired,
  // redux
  blockValue: PropTypes.shape({
    data: PropTypes.shape({ data: PropTypes.string }),
  }),
  lmsEndpointUrl: PropTypes.string,
  studioEndpointUrl: PropTypes.string,
  blockFailed: PropTypes.bool.isRequired,
  initializeEditor: PropTypes.func.isRequired,
  isRaw: PropTypes.bool,
  isLibrary: PropTypes.bool,
  assetsFinished: PropTypes.bool,
  assets: PropTypes.shape({}),
  // inject
  intl: intlShape.isRequired,
};

export const mapStateToProps = (state) => ({
  blockValue: selectors.app.blockValue(state),
  lmsEndpointUrl: selectors.app.lmsEndpointUrl(state),
  studioEndpointUrl: selectors.app.studioEndpointUrl(state),
  blockFailed: selectors.requests.isFailed(state, { requestKey: RequestKeys.fetchBlock }),
  isRaw: selectors.app.isRaw(state),
  isLibrary: selectors.app.isLibrary(state),
  assetsFinished: selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchAssets }),
  assets: selectors.app.assets(state),
});

export const mapDispatchToProps = {
  initializeEditor: actions.app.initializeEditor,
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(TextEditor));
