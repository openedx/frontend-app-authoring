import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { getConfig } from '@edx/frontend-platform';

import EditorPage from './EditorPage';

const EditorContainer = ({
  courseId,
}) => {
  const { blockType, blockId } = useParams();
  return (
    <div className="editor-page">
      <EditorPage
        courseId={courseId}
        blockType={blockType}
        blockId={blockId}
        studioEndpointUrl={getConfig().STUDIO_BASE_URL}
        lmsEndpointUrl={getConfig().LMS_BASE_URL}
      />
    </div>
  );
};
EditorContainer.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default EditorContainer;
