import React from 'react';
import { connect } from 'react-redux';

import {
  Spinner,
  Toast,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import { getConfig } from '@edx/frontend-platform';
import { actions, selectors } from '../../data/redux';
import { RequestKeys } from '../../data/constants/requests';

import EditorContainer from '../EditorContainer';
import RawEditor from '../../sharedComponents/RawEditor';
import * as hooks from './hooks';
import messages from './messages';
import TinyMceWidget from '../../sharedComponents/TinyMceWidget';
import { prepareEditorRef, replaceStaticWithAsset } from '../../sharedComponents/TinyMceWidget/hooks';

interface BlockValue {
  data: {
    data: string | Record<string, any>;
  };
}

interface TextEditorProps {
  onClose: (() => void) | null;
  returnFunction?: ((prevPath?: string) => (newData: Record<string, any> | undefined) => void) | null;
  // redux
  showRawEditor: boolean;
  blockValue: BlockValue | null;
  blockId: string;
  blockFailed: boolean;
  initializeEditor: () => void;
  blockFinished: boolean;
  learningContextId: string;
  images: Record<string, any>;
  isLibrary: boolean;
}

const TextEditor: React.FC<TextEditorProps> = ({
  onClose,
  returnFunction,
  // redux
  showRawEditor,
  blockValue,
  blockId,
  blockFailed,
  initializeEditor,
  blockFinished,
  learningContextId,
  images,
  isLibrary,
}) => {
  const intl = useIntl();
  const { editorRef, refReady, setEditorRef } = prepareEditorRef();

  const initialContent = blockValue ? (blockValue.data.data as string) : '';
  const newContent = replaceStaticWithAsset({
    initialContent,
    learningContextId,
  });
  const editorContent = (newContent || initialContent) as string;
  let staticRootUrl: string;
  if (isLibrary) {
    staticRootUrl = `${getConfig().STUDIO_BASE_URL}/library_assets/blocks/${blockId}/`;
  }

  if (!refReady) { return null; }

  const selectEditor = () => {
    if (showRawEditor) {
      return (
        <RawEditor
          editorRef={editorRef}
          // @ts-ignore FIXME: RawEditor content doesn't match the type of blockValue. It only supports data as string
          content={blockValue}
        />
      );
    }
    return (
      // @ts-ignore FIXME: need to fix types from TinyMceWidget
      <TinyMceWidget
        editorType="text"
        editorRef={editorRef}
        editorContentHtml={editorContent}
        setEditorRef={setEditorRef}
        minHeight={500}
        maxHeight={500}
        initializeEditor={initializeEditor}
        {...{
          images,
          isLibrary,
          learningContextId,
          staticRootUrl,
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

        {(!blockFinished)
          ? (
            <div className="text-center p-6">
              <Spinner
                animation="border"
                className="m-3"
                screenReaderText={intl.formatMessage(messages.spinnerScreenReaderText)}
              />
            </div>
          )
          : (selectEditor())}
      </div>
    </EditorContainer>
  );
};

export const mapStateToProps = (state: any) => ({
  blockValue: selectors.app.blockValue(state),
  blockFailed: selectors.requests.isFailed(state, { requestKey: RequestKeys.fetchBlock }),
  blockId: selectors.app.blockId(state),
  showRawEditor: selectors.app.showRawEditor(state),
  blockFinished: selectors.app.shouldCreateBlock(state)
    || selectors.requests.isFinished(state, { requestKey: RequestKeys.fetchBlock }),
  learningContextId: selectors.app.learningContextId(state),
  images: selectors.app.images(state),
  isLibrary: selectors.app.isLibrary(state),
});

export const mapDispatchToProps = {
  initializeEditor: actions.app.initializeEditor,
};

export const TextEditorInternal = TextEditor; // For testing only
export default connect(mapStateToProps, mapDispatchToProps)(TextEditor);
