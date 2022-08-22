import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { html } from '@codemirror/lang-html';
import * as module from './index';
import './index.scss';

export const hooks = {

  createCodeMirrorDomNode: ({ ref, initialText, upstreamRef }) => {
    useEffect(() => {
      const state = EditorState.create({
        doc: initialText,
        extensions: [basicSetup, html()],
      });
      const view = new EditorView({ state, parent: ref.current });
      // eslint-disable-next-line no-param-reassign
      upstreamRef.current = view;
      return () => {
        // called on cleanup
        view.destroy();
      };
    }, []);
  },
};

export const CodeEditor = ({
  innerRef, value,
}) => {
  const DOMref = useRef();
  module.hooks.createCodeMirrorDomNode({ ref: DOMref, initialText: value, upstreamRef: innerRef });

  return (
    <div>
      <div id="editor" ref={DOMref} />
    </div>
  );
};

CodeEditor.propTypes = {
  innerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]).isRequired,
  value: PropTypes.string.isRequired,
};

export default CodeEditor;
