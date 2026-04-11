import { PluginSlot } from '@openedx/frontend-plugin-framework';
import {
  ImageSettingsModalForm,
  type ImageSettingsModalFormProps,
} from '@src/editors/sharedComponents/ImageUploadModal/ImageSettingsModal';

import React from 'react';

const ImageSettingsModalSlot = ({
  isOpen,
  close,
  returnToSelection,
  selection,
  imgDimensions,
  setImgDimensions,
  initialValues,
  validationSchema,
  handleSubmit,
  processValues,
}: ImageSettingsModalFormProps) => (
  <PluginSlot
    id="org.openedx.frontend.authoring.image_settings_modal.v1"
    pluginProps={{
      processValues,
      initialValues,
      validationSchema,
    }}
    slotOptions={{
      mergeProps: true,
    }}
  >
    <ImageSettingsModalForm
      validationSchema={validationSchema}
      initialValues={initialValues}
      handleSubmit={handleSubmit}
      processValues={processValues}
      isOpen={isOpen}
      close={close}
      returnToSelection={returnToSelection}
      selection={selection}
      imgDimensions={imgDimensions}
      setImgDimensions={setImgDimensions}
    />
  </PluginSlot>
);

export default ImageSettingsModalSlot;
