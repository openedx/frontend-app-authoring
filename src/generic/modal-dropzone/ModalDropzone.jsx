import PropTypes from 'prop-types';
import {
  Form,
  ModalDialog,
  Dropzone,
  ActionRow,
  Image,
  Card,
  Icon,
  Button,
  IconButton,
  Spinner,
} from '@openedx/paragon';
import { FileUpload as FileUploadIcon } from '@openedx/paragon/icons';

import useModalDropzone from './useModalDropzone';
import messages from './messages';

const ModalDropzone = ({
  fileTypes,
  modalTitle,
  imageHelpText,
  previewComponent,
  imageDropzoneText,
  isOpen,
  onClose,
  onCancel,
  onChange,
  onSavingStatus,
}) => {
  const {
    intl,
    accept,
    previewUrl,
    uploadProgress,
    disabledUploadBtn,
    imageValidator,
    handleUpload,
    handleCancel,
    handleSelectFile,
  } = useModalDropzone({
    onChange, onCancel, onClose, fileTypes, onSavingStatus,
  });

  const inputComponent = previewUrl ? (
    <div>
      {previewComponent || (
        <Image
          src={previewUrl}
          alt={intl.formatMessage(messages.uploadImageDropzoneAlt)}
          fluid
        />
      )}
    </div>
  ) : (
    <>
      <IconButton
        isActive
        src={FileUploadIcon}
        iconAs={Icon}
        variant="secondary"
        alt={intl.formatMessage(messages.uploadImageDropzoneAlt)}
        className="mb-3"
      />
      <p>{imageDropzoneText || intl.formatMessage(messages.uploadImageDropzoneText)}</p>
      <p className="x-small text-center mt-1.5">{imageHelpText}</p>
    </>
  );

  return (
    <ModalDialog
      title={modalTitle}
      size="lg"
      isOpen={isOpen}
      onClose={handleCancel}
      hasCloseButton
      isFullscreenOnMobile
      className="modal-dropzone"
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {modalTitle}
        </ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body>
        <Form.Group className="form-group-custom w-100">
          <Card>
            <Card.Body className="image-body">
              {uploadProgress > 0 ? (
                <Spinner animation="border" variant="primary" className="mr-3" screenReaderText={uploadProgress} />
              ) : (
                <Dropzone
                  onProcessUpload={handleSelectFile}
                  inputComponent={inputComponent}
                  accept={accept}
                  validator={imageValidator}
                />
              )}
            </Card.Body>
          </Card>
        </Form.Group>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <ActionRow>
          <ModalDialog.CloseButton variant="tertiary" onClick={handleCancel}>
            {intl.formatMessage(messages.cancelModal)}
          </ModalDialog.CloseButton>
          <Button onClick={handleUpload} disabled={disabledUploadBtn}>
            {intl.formatMessage(messages.uploadModal)}
          </Button>
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

ModalDropzone.defaultProps = {
  imageHelpText: '',
  previewComponent: null,
  imageDropzoneText: '',
};

ModalDropzone.propTypes = {
  imageHelpText: PropTypes.string,
  previewComponent: PropTypes.element,
  imageDropzoneText: PropTypes.string,
  modalTitle: PropTypes.string.isRequired,
  fileTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onSavingStatus: PropTypes.func.isRequired,
};

export default ModalDropzone;
