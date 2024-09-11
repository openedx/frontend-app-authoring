import React from 'react';
import { useParams } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';

import EditorPage from './EditorPage';

interface Props {
  /** Course ID or Library ID */
  learningContextId: string;
  /** Event handler for when user cancels out of the editor page */
  onClose?: () => void;
  /** Event handler called after when user saves their changes using an editor */
  afterSave?: () => (newData: Record<string, any>) => void;
}

const EditorContainer: React.FC<Props> = ({
  learningContextId,
  onClose,
  afterSave,
}) => {
  const { blockType, blockId } = useParams();
  if (blockType === undefined || blockId === undefined) {
    // istanbul ignore next - This shouldn't be possible; it's just here to satisfy the type checker.
    return <div>Error: missing URL parameters</div>;
  }
  return (
    <div className="editor-page">
      <EditorPage
        courseId={learningContextId}
        blockType={blockType}
        blockId={blockId}
        studioEndpointUrl={getConfig().STUDIO_BASE_URL}
        lmsEndpointUrl={getConfig().LMS_BASE_URL}
        onClose={onClose}
        returnFunction={afterSave}
      />
    </div>
  );
};

export default EditorContainer;
