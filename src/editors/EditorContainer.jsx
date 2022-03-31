import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { EditorPage } from '@edx/frontend-lib-content-components';
import { sendTrackEvent } from '@edx/frontend-platform/analytics';

const EditorContainer = ({
  courseId,
}) => {
  const { blockType, blockId } = useParams();
  sendTrackEvent('edx.ui.authoring.editor.enter', {
    courserun_key: courseId,
    block_type: blockType,
    block_id: blockId,
  });
  return (
    <div className="editor-page">
      <EditorPage
        courseId={courseId}
        blockType={blockType}
        blockId={blockId}
        studioEndpointUrl={process.env.STUDIO_BASE_URL}
      />
    </div>
  );
};
EditorContainer.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default EditorContainer;
