import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
} from '@openedx/paragon';

import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import MarkdownToolbar from './EditorToolbar';

import messages from './messages';
import './index.scss';

import * as hooks from './hooks';

const CodeEditor = ({
  innerRef,
  value,
  lang,
}) => {
  const intl = useIntl();
  const DOMref = useRef();
  const btnRef = useRef();

  const [editor, setEditor] = useState(null);

  hooks.createCodeMirrorDomNode({
    ref: DOMref, initialText: value, upstreamRef: innerRef, lang, onReady: setEditor,
  });
  const { showBtnEscapeHTML, hideBtn } = hooks.prepareShowBtnEscapeHTML();

  return (
    <div>
      {lang === 'markdown' && <MarkdownToolbar editorRef={editor} />}
      <div id="CodeMirror" ref={DOMref} />
      {showBtnEscapeHTML && lang !== 'markdown' && (
        <Button
          variant="tertiary"
          aria-label={intl.formatMessage(messages.escapeHTMLButtonLabel)}
          ref={btnRef}
          onClick={() => hooks.escapeHTMLSpecialChars({ ref: innerRef, hideBtn })}
        >
          <FormattedMessage {...messages.escapeHTMLButtonLabel} />
        </Button>
      )}
    </div>
  );
};

CodeEditor.propTypes = {
  innerRef: PropTypes.oneOfType([
    PropTypes.func,
    // eslint-disable-next-line react/forbid-prop-types
    PropTypes.shape({ current: PropTypes.any }),
  ]).isRequired,
  value: PropTypes.string.isRequired,
  lang: PropTypes.string.isRequired,
};

export const CodeEditorInternal = CodeEditor; // For testing only
export default CodeEditor;
