import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router';
import Placeholder from '@edx/frontend-lib-content-components';

const EditorPage = ({
    courseId,
}) =>{
    const params = useParams();
    const blockType = params.blockType,
        blockId = params.blockId;
    return (
        <div className = "editor-page">
            <Placeholder/>
        </div>
    );
}
EditorPage.propTypes = {
    courseId: PropTypes.string.isRequired,
  };

export default EditorPage;
