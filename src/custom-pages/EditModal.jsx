import React from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';

import { EditorPage } from '@edx/frontend-lib-content-components';

const EditModal = ({
  pageId,
  courseId,
  onClose,
}) => (
  <div
    style={{
      position: 'fixed',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      'background-color': 'white',
      'z-index': 100,
    }}
  >
    <EditorPage
      courseId={courseId}
      blockType="html"
      blockId={pageId}
      studioEndpointUrl={getConfig().STUDIO_BASE_URL}
      lmsEndpointUrl={getConfig().LMS_BASE_URL}
      returnFunction={onClose}
    />
  </div>
);

EditModal.propTypes = {
  pageId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  courseId: PropTypes.string.isRequired,
};

export default EditModal;
