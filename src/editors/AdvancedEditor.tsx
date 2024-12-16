import { useEffect } from 'react';
import { getConfig } from '@edx/frontend-platform';

import { LibraryBlock } from '../library-authoring/LibraryBlock';
import { EditorModalWrapper } from './containers/EditorContainer';

interface AdvancedEditorProps {
  usageKey: string,
  onClose: Function | null,
}

const AdvancedEditor = ({ usageKey, onClose }: AdvancedEditorProps) => {
  useEffect(() => {
    const handleIframeMessage = (event) => {
      if (event.origin !== getConfig().STUDIO_BASE_URL) {
        return;
      }

      if (onClose && (event.data === 'cancel-clicked' || event.data === 'save-clicked')) {
        onClose();
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
