import React, { useRef } from 'react';
import PropTypes from 'prop-types';

import {
  Button,
} from '@openedx/paragon';

import { FormattedMessage, injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import messages from './messages';
import './index.scss';

import * as hooks from './hooks';

const CodeEditor = ({
  innerRef,
  value,
  lang,
  // injected
  intl,
}) => {
  const DOMref = useRef();
  const btnRef = useRef();
  hooks.createCodeMirrorDomNode({
    ref: DOMref, initialText: value, upstreamRef: innerRef, lang,
  });
  const { showBtnEscapeHTML, hideBtn } = hooks.prepareShowBtnEscapeHTML();

  return (
    <div>
      <div id="CodeMirror" ref={DOMref} />
      {showBtnEscapeHTML && (
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
  intl: intlShape.isRequired,
  lang: PropTypes.string.isRequired,
};

export const CodeEditorInternal = CodeEditor; // For testing only
export default injectIntl(CodeEditor);
