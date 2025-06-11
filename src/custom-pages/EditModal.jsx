import React from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

import EditorPage from '../editors/EditorPage';

const EditModal = ({
  pageId,
  courseId,
  onClose,
}) => (
  <PluginSlot
    id="edit_modal_plugin_slot"
    pluginProps={{ courseId }}
  >
  <div
    style={{
      position: 'fixed',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      'overflow-y': 'scroll',
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
  </PluginSlot>
);

EditModal.propTypes = {
  pageId: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  courseId: PropTypes.string.isRequired,
};

export default EditModal;
