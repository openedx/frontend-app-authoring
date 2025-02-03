import React, { useEffect } from 'react';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';

import { LibraryBlock } from '../library-authoring/LibraryBlock';
import { EditorModalWrapper } from './containers/EditorContainer';
import { ToastContext } from '../generic/toast-context';
import messages from './messages';

interface AdvancedEditorProps {
  usageKey: string,
  onClose: Function | null,
}

const AdvancedEditor = ({ usageKey, onClose }: AdvancedEditorProps) => {
  const intl = useIntl();
  const { showToast } = React.useContext(ToastContext);

  useEffect(() => {
    const handleIframeMessage = (event) => {
      if (event.origin !== getConfig().STUDIO_BASE_URL) {
        return;
      }

      if (event.data.type === 'xblock-event') {
        const { eventName, data } = event.data;

        if (onClose && (eventName === 'cancel'
          || (eventName === 'save' && data.state === 'end'))
        ) {
          onClose();
        } else if (eventName === 'error') {
          showToast(intl.formatMessage(messages.advancedEditorGenericError));
        }
      }
    };

    window.addEventListener('message', handleIframeMessage);

    return () => {
      window.removeEventListener('message', handleIframeMessage);
    };
  }, []);

  return (
    <EditorModalWrapper onClose={onClose as () => void}>
      <LibraryBlock
        usageKey={usageKey}
        view="studio_view"
      />
    </EditorModalWrapper>
  );
};

export default AdvancedEditor;
