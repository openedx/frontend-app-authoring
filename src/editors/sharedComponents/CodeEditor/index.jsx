import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
} from '@openedx/paragon';

import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
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
  hooks.createCodeMirrorDomNode({
    ref: DOMref, initialText: value, upstreamRef: innerRef, lang,
  });
  const { showBtnEscapeHTML, hideBtn } = hooks.prepareShowBtnEscapeHTML();

  // Ensure Editor updates when value prop changes. Triggered when switching editors (markdown->advanced).
  useEffect(() => {
    if (innerRef && innerRef.current) {
      const view = innerRef.current;
      if (view.state && view.state.doc) {
        const currentValue = view.state.doc.toString();
        if (currentValue !== value) {
          view.dispatch({
            changes: { from: 0, to: currentValue.length, insert: value },
          });
        }
      }
    }
  }, [value, innerRef]);

  return (
    <div>
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
