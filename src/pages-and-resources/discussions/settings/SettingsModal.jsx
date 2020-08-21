import Button from '@edx/paragon/dist/Button';
import Modal from '@edx/paragon/dist/Modal';
import React from 'react';

import BaseForumSettingEditor from './base-forum/SettingsEditor';

function SettingsModal() {
  return (
    <Modal
      open
      title={<h4>Configure discussion settings</h4>}
      body={<BaseForumSettingEditor />}
      buttons={[
        <Button buttonType="primary">Apply</Button>,
      ]}
      closeText="Cancel"
      onClose={null}
    />
  );
}

export default SettingsModal;
