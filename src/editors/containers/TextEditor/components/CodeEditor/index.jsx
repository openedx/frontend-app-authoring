import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
} from '@edx/paragon';

import { basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { html } from '@codemirror/lang-html';

import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import alphanumericMap from './constants';
import * as module from './index';
import messages from './messages';
import './index.scss';

export const hooks = {

  state: {
    showBtnEscapeHTML: (val) => React.useState(val),
  },

  prepareShowBtnEscapeHTML: () => {
    const [visibility, setVisibility] = hooks.state.showBtnEscapeHTML(true);
    const hide = () => setVisibility(false);
    return { showBtnEscapeHTML: visibility, hideBtn: hide };
  },

  createCodeMirrorDomNode: ({ ref, initialText, upstreamRef }) => {
    useEffect(() => {
      const cleanText = hooks.cleanHTML({ initialText });
      const state = EditorState.create({
        doc: cleanText,
        extensions: [basicSetup, html(), EditorView.lineWrapping],
      });
      const view = new EditorView({ state, parent: ref.current });
      // eslint-disable-next-line no-param-reassign
      upstreamRef.current = view;
      view.focus();
      return () => {
        // called on cleanup
        view.destroy();
      };
    }, []);
  },
  cleanHTML: ({ initialText }) => {
    const translateRegex = new RegExp(`&(${Object.keys(alphanumericMap).join('|')});`, 'g');
    const translator = ($0, $1) => alphanumericMap[$1];
    return initialText.replace(translateRegex, translator);
  },
  escapeHTMLSpecialChars: ({ ref, hideBtn }) => {
    const text = ref.current.state.doc.toString(); let
      pos = 0;
    const changes = [];
    Object.keys(alphanumericMap).forEach(
      (escapedKeyword) => {
        // eslint-disable-next-line no-cond-assign
        for (let next; (next = text.indexOf(alphanumericMap[escapedKeyword], pos)) > -1;) {
          changes.push({ from: next, to: next + 1, insert: `&${escapedKeyword};` });
          pos = next + 1;
        }
      },
    );
    ref.current.dispatch({ changes });
    hideBtn();
  },

};

export const CodeEditor = ({
  innerRef,
  value,
  // injected
  intl,
}) => {
  const DOMref = useRef();
  const btnRef = useRef();
  module.hooks.createCodeMirrorDomNode({ ref: DOMref, initialText: value, upstreamRef: innerRef });
  const { showBtnEscapeHTML, hideBtn } = module.hooks.prepareShowBtnEscapeHTML();

  return (
    <div>
      <div id="CodeMirror" ref={DOMref} />
      {showBtnEscapeHTML && (
        <Button
          variant="tertiary"
          aria-label={intl.formatMessage(messages.escapeHTMLButtonLabel)}
          ref={btnRef}
          onClick={() => module.hooks.escapeHTMLSpecialChars({ ref: innerRef, hideBtn })}
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
    PropTypes.shape({ current: PropTypes.any }),
  ]).isRequired,
  value: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(CodeEditor);
