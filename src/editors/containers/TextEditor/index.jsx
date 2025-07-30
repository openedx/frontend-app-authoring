import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import { Spinner, Toast } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import EditorContainer from '../EditorContainer';
import RawEditor from '../../sharedComponents/RawEditor';
import TinyMceWidget from '../../sharedComponents/TinyMceWidget';
import * as hooks from './hooks';
import messages from './messages';
import { prepareEditorRef, replaceStaticWithAsset } from '../../sharedComponents/TinyMceWidget/hooks';
import { actions, selectors } from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';

const TextEditor = ({ onClose, returnFunction }) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  // Redux selectors
  const blockValue = useSelector(selectors.app.blockValue);
  const blockFailed = useSelector((state) => selectors.requests.isFailed(
    state,
    { requestKey: RequestKeys.fetchBlock },
  ));
  const blockId = useSelector(selectors.app.blockId);
  const showRawEditor = useSelector(selectors.app.showRawEditor);
  const blockFinished = useSelector((state) => selectors.app.shouldCreateBlock(state)
    || selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchBlock }));
  const learningContextId = useSelector(selectors.app.learningContextId);
  const images = useSelector(selectors.app.images);
  const isLibrary = useSelector(selectors.app.isLibrary);

  const { editorRef, refReady, setEditorRef } = prepareEditorRef();
  const initialContent = blockValue ? blockValue.data.data : '';
  const newContent = replaceStaticWithAsset({ initialContent, learningContextId });
  const editorContent = newContent || initialContent;

  const initializeEditor = (payload) => {
    dispatch(actions.app.initializeEditor(payload));
  };

  let staticRootUrl;
  if (isLibrary) {
    staticRootUrl = `${getConfig().STUDIO_BASE_URL}/library_assets/blocks/${blockId}/`;
  }

  if (!refReady) { return null; }

  const selectEditor = () => {
    if (showRawEditor) {
      return <RawEditor editorRef={editorRef} content={blockValue} />;
    }
    return (
      <TinyMceWidget
        editorType="text"
        editorRef={editorRef}
        editorContentHtml={editorContent}
        setEditorRef={setEditorRef}
        minHeight={500}
        maxHeight={500}
        initializeEditor={initializeEditor}
        {...{
          images, isLibrary, learningContextId, staticRootUrl,
        }}
      />
    );
  };

  return (
    <EditorContainer
      getContent={hooks.getContent({ editorRef, showRawEditor })}
      isDirty={hooks.isDirty({ editorRef, showRawEditor })}
      onClose={onClose}
      returnFunction={returnFunction}
    >
      <div className="editor-body h-75 overflow-auto">
        <Toast show={blockFailed} onClose={hooks.nullMethod}>
          {intl.formatMessage(messages.couldNotLoadTextContext)}
        </Toast>
        {!blockFinished ? (
          <div className="text-center p-6">
            <Spinner
              animation="border"
              className="m-3"
              screenreadertext={intl.formatMessage(messages.spinnerScreenReaderText)}
            />
          </div>
        ) : (
          selectEditor()
        )}
      </div>
    </EditorContainer>
  );
};

TextEditor.defaultProps = {
  returnFunction: null,
};

TextEditor.propTypes = {
  onClose: PropTypes.func.isRequired,
  returnFunction: PropTypes.func,
};

export const TextEditorInternal = TextEditor; // For testing only
export default TextEditor;
