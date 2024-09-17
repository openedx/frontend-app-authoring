import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';

import EditorPage from './EditorPage';

interface Props {
  /** Course ID or Library ID */
  learningContextId: string;
  /** Event handler sometimes called when user cancels out of the editor page */
  onClose?: (prevPath?: string) => void;
  /**
   * Event handler called after when user saves their changes using an editor
   * and sometimes called when user cancels the editor, instead of onClose.
   * If changes are saved, newData will be present, and if it was cancellation,
   * newData will be undefined.
   * TODO: clean this up so there are separate onCancel and onSave callbacks,
   * and they are used consistently instead of this mess.
   */
  returnFunction?: (prevPath?: string) => (newData: Record<string, any> | undefined) => void;
}

const EditorContainer: React.FC<Props> = ({
  learningContextId,
  onClose,
  returnFunction,
}) => {
  const { blockType, blockId } = useParams();
  const location = useLocation();

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
        onClose={onClose ? () => onClose(location.state?.from) : null}
        returnFunction={returnFunction ? () => returnFunction(location.state?.from) : null}
      />
    </div>
  );
};

export default EditorContainer;
