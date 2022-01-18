import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import { EditorPage } from '@edx/frontend-lib-content-components';

const EditorProvider = ({
  courseId,
}) => {
  const { blockType, blockId } = useParams();
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
EditorProvider.propTypes = {
  courseId: PropTypes.string.isRequired,
};

export default EditorProvider;
