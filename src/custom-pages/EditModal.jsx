import React from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';

import { ModalDialog } from '@edx/paragon';
import { EditorPage } from '@edx/frontend-lib-content-components';

const EditModal = ({
  isOpen,
  page,
  courseId,
  onClose,
}) => (
  <ModalDialog
    isOpen={isOpen}
    hasCloseButton={false}
    size="fullscreen"
  >
    <ModalDialog.Body className="p-0">
      <EditorPage
        courseId={courseId}
        blockType="html"
        blockId={page.id}
        studioEndpointUrl={getConfig().STUDIO_BASE_URL}
        lmsEndpointUrl={getConfig().LMS_BASE_URL}
        returnFunction={onClose}
      />
    </ModalDialog.Body>
  </ModalDialog>
);

EditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  page: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  courseId: PropTypes.string.isRequired,
};

export default EditModal;
