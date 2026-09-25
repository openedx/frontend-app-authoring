import React, { useState } from 'react';
import { connect } from 'react-redux';
import {
  Spinner,
  Toast,
  Form,
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
  // This is the AxiosResponse from the block fetch, so the API payload (which
  // holds `data` and `metadata`) sits under `.data`.
  data: {
    id: string;
    display_name: string;
    category?: string;
    data: string | Record<string, any>;
    metadata?: {
      display_name?: string;
      include_theme?: boolean;
    };
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

  // The value the block was loaded with, before the user touched the toggle.
  // Kept separately from `includeTheme` so isDirty can tell a toggle-only
  // change from an untouched editor.
  const initialIncludeTheme = Boolean(blockValue?.data?.metadata?.include_theme);

  const [includeThemeOverride, setIncludeThemeOverride] = useState<boolean | null>(null);
  const includeTheme = includeThemeOverride ?? initialIncludeTheme;

  // `content_style` is only read when the editor initializes, so toggling the
  // theme has to rebuild the editor for the preview to follow.
  // uncontrolled -- its content is read from the live instance at save time
  // rather than mirrored into the store -- so the content is snapshotted before
  // the rebuild and handed to the new instance as its initial value, otherwise
  // the unsaved edits go down with the old one.
  const [contentSnapshot, setContentSnapshot] = useState<{ blockId: string; content: string; } | null>(null);

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

  const handleIncludeThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only the mounted TinyMCE instance holds unsaved edits; in raw mode the
    // content lives in the RawEditor, which the rebuild does not touch.
    if (editorRef.current && !showRawEditor) {
      setContentSnapshot({ blockId, content: editorRef.current.getContent() });
    }
    setIncludeThemeOverride(e.target.checked);
  };

  const selectEditor = () => {
    if (showRawEditor) {
      return (
        <RawEditor
          editorRef={editorRef}
          content={blockValue}
        />
      );
    }
    return (
      // @ts-ignore FIXME: need to fix types from TinyMceWidget
      <TinyMceWidget
        // Rebuilds the editor when the theme toggle flips, so the themed
        // content_style takes effect without reopening the block.
        key={String(includeTheme)}
        editorType="text"
        editorRef={editorRef}
        editorContentHtml={contentSnapshot?.blockId === blockId ? contentSnapshot.content : editorContent}
        setEditorRef={setEditorRef}
        minHeight={500}
        maxHeight={500}
        initializeEditor={initializeEditor}
        includeTheme={includeTheme}
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
      getContent={hooks.getContent({ editorRef, showRawEditor, includeTheme })}
      isDirty={hooks.isDirty({
        editorRef,
        showRawEditor,
        includeTheme,
        initialIncludeTheme,
      })}
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
          : (
            <>
              <div className="py-3 px-1">
                <Form.Switch
                  name="include_theme"
                  checked={includeTheme}
                  onChange={handleIncludeThemeChange}
                  floatLabelLeft
                  className="mb-0"
                >
                  {intl.formatMessage(messages.includeThemeLabel)}
                </Form.Switch>
              </div>
              {selectEditor()}
            </>
          )}
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
