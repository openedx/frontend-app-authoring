import { useIntl } from '@edx/frontend-platform/i18n';

import './index.scss';

import { Button, Image } from '@openedx/paragon';
import { ArrowBackIos } from '@openedx/paragon/icons';
import { Formik, useFormikContext } from 'formik';
import React from 'react';
import * as Yup from 'yup';
import BaseModal from '../../BaseModal';
import ErrorAlert from '../../ErrorAlerts/ErrorAlert';
import AltTextControls from './AltTextControls';
import DimensionControls from './DimensionControls';
import messages from './messages';
import {
  AltText, ImageConfig, ImageDimensions, OrigImageDimensions,
} from './types';

interface ImageSettingsModalCommonProps {
  close: () => void;
  isOpen: boolean;
  returnToSelection: () => void;
  selection: {
    altText: string | null;
    externalUrl: string;
    url: string;
  };
}

interface ImageSettingsModalInternalProps extends ImageSettingsModalCommonProps {
  imgDimensions: OrigImageDimensions;
  setImgDimensions: (dimensions: OrigImageDimensions) => void;
}

interface ImageSettingsModalProps extends ImageSettingsModalCommonProps {
  saveToEditor: (config: AltText & { dimensions: ImageDimensions }) => void;
}

const ImageSettingsModalInternal = ({
  isOpen,
  close,
  returnToSelection,
  selection,
  imgDimensions,
  setImgDimensions,
}: ImageSettingsModalInternalProps) => {
  const intl = useIntl();
  const formik = useFormikContext<ImageConfig>();

  const setOriginalDimensions = React.useCallback(async (event: React.ChangeEvent<HTMLImageElement>) => {
    const img = event.currentTarget as HTMLImageElement;
    setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    await formik.setFieldValue('width', img.naturalWidth, false);
    await formik.setFieldValue('height', img.naturalHeight, false);
  }, [formik]);

  const handleDismissError = React.useCallback(() => formik.setFieldError('altText', ''), [formik]);

  return (
    <BaseModal
      close={close}
      confirmAction={(
        <Button
          variant="primary"
          onClick={formik.submitForm}
        >
          {intl.formatMessage(messages.saveButtonLabel)}
        </Button>
      )}
      isOpen={isOpen}
      title={intl.formatMessage(messages.titleLabel)}
    >
      <ErrorAlert
        dismissError={handleDismissError}
        hideHeading
        isError={Boolean(formik.errors.altText)}
      >
        {intl.formatMessage(messages.altTextError)}
      </ErrorAlert>
      <Button
        iconBefore={ArrowBackIos}
        onClick={returnToSelection}
        size="inline"
        variant="link"
      >
        {intl.formatMessage(messages.replaceImageButtonLabel)}
      </Button>
      <br />
      <div className="d-flex flex-row m-2 img-settings-form-container">
        <div className="img-settings-thumbnail-container">
          <Image
            className="img-settings-thumbnail"
            onError={setOriginalDimensions}
            onLoad={setOriginalDimensions}
            src={selection.externalUrl}
          />
        </div>
        <hr className="h-100 bg-primary-200 m-0" />
        <div className="img-settings-form-controls">
          <DimensionControls originalDimensions={imgDimensions} />
          <AltTextControls />
        </div>
      </div>
    </BaseModal>
  );
};

/**
 * Modal display wrapping the dimension and alt-text controls for image tags
 * inserted into the TextEditor TinyMCE context.
 * Provides a thumbnail and populates dimension and alt-text controls.
 * @param {Object} props
 * @param {bool} props.isOpen - is the modal open?
 * @param {func} props.close - close the modal
 * @param {Object} props.selection - current image selection object
 * @param {func} props.saveToEditor - save the current settings to the editor
 * @param {func} props.returnToSelection - return to image selection
 */
const ImageSettingsModal = ({
  close,
  isOpen,
  returnToSelection,
  saveToEditor,
  selection,
}: ImageSettingsModalProps) => {
  const intl = useIntl();
  const [imgDimensions, setImgDimensions] = React.useState<OrigImageDimensions>({ width: 0, height: 0 });
  const initialValues: ImageConfig = {
    isLocked: true,
    width: imgDimensions.width,
    height: imgDimensions.height,
    isDecorative: false,
    altText: selection.altText || '',
  };
  const validationSchema = Yup.object().shape({
    isLocked: Yup.boolean(),
    isDecorative: Yup.boolean(),
    width: Yup.string().trim().matches(/^[0-9]+%?$/).required(),
    height: Yup.string().trim().matches(/^[0-9]+%?$/).required(),
    altText: Yup.string().when('isDecorative', {
      is: true,
      otherwise: (schema) => schema.required(intl.formatMessage(messages.altTextLocalFeedback)),
    }),
  });

  const handleSubmit = React.useCallback((value, actions) => {
    saveToEditor({
      altText: value.altText,
      dimensions: {
        width: value.width,
        height: value.height,
      },
      isDecorative: value.isDecorative,
    });
    actions.setSubmitting(false);
  }, [saveToEditor]);

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      <ImageSettingsModalInternal
        isOpen={isOpen}
        close={close}
        returnToSelection={returnToSelection}
        selection={selection}
        imgDimensions={imgDimensions}
        setImgDimensions={setImgDimensions}
      />
    </Formik>
  );
};

export default ImageSettingsModal;
