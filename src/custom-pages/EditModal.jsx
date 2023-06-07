import React from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';

import { FullscreenModal } from '@edx/paragon';
import { EditorPage } from '@edx/frontend-lib-content-components';

const EditModal = ({ isOpen, page, handleClose }) => (
  <FullscreenModal
    isOpen={isOpen}
    onClose={handleClose}
  >
    <EditorPage
      courseId="course-v1:krisEdx+ka101+2023-01"
      blockType="html"
      blockId={page.id}
      studioEndpointUrl={getConfig().STUDIO_BASE_URL}
      lmsEndpointUrl={getConfig().LMS_BASE_URL}
    />
  </FullscreenModal>
);

EditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  page: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  handleClose: PropTypes.func.isRequired,
};

export default EditModal;
