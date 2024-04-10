import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import {
  Image, Icon, Stack, IconButtonWithTooltip, FormLabel, Form, Button, useToggle,
} from '@openedx/paragon';
import { DeleteOutline as DeleteOutlineIcon } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import ModalDropzone from '../../../generic/modal-dropzone/ModalDropzone';
import ModalNotification from '../../../generic/modal-notification';
import { updateSavingImageStatus } from '../../data/slice';
import commonMessages from '../../messages';
import messages from '../messages';

const SignatoryForm = ({
  index,
  name,
  title,
  isEdit,
  handleBlur,
  organization,
  handleChange,
  setFieldValue,
  showDeleteButton,
  signatureImagePath,
  handleDeleteSignatory,
  handleCancelUpdateSignatory,
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const [isOpen, open, close] = useToggle(false);
  const [isConfirmOpen, confirmOpen, confirmClose] = useToggle(false);

  const handleImageUpload = (newImagePath) => {
    setFieldValue(`signatories[${index}].signatureImagePath`, newImagePath);
  };

  const handleSavingStatusDispatch = (status) => {
    dispatch(updateSavingImageStatus(status));
  };

  const formData = [
    {
      labelText: intl.formatMessage(messages.nameLabel),
      value: name,
      name: `signatories[${index}].name`,
      placeholder: intl.formatMessage(messages.namePlaceholder),
      feedback: intl.formatMessage(messages.nameDescription),
      onChange: handleChange,
      onBlur: handleBlur,
    },
    {
      as: 'textarea',
      labelText: intl.formatMessage(messages.titleLabel),
      value: title,
      name: `signatories[${index}].title`,
      placeholder: intl.formatMessage(messages.titlePlaceholder),
      feedback: intl.formatMessage(messages.titleDescription),
      onChange: handleChange,
      onBlur: handleBlur,
    },
    {
      labelText: intl.formatMessage(messages.organizationLabel),
      value: organization,
      name: `signatories[${index}].organization`,
      placeholder: intl.formatMessage(messages.organizationPlaceholder),
      feedback: intl.formatMessage(messages.organizationDescription),
      onChange: handleChange,
      onBlur: handleBlur,
    },
  ];

  const uploadReplaceText = intl.formatMessage(
    messages.uploadImageButton,
    {
      uploadText: signatureImagePath
        ? intl.formatMessage(messages.uploadModalReplace)
        : intl.formatMessage(messages.uploadModal),
    },
  );

  return (
    <div className="bg-light-200 p-2.5 signatory-form" data-testid="signatory-form">
      <Stack className="justify-content-between mb-4" direction="horizontal">
        <h3 className="section-title">{`${intl.formatMessage(messages.signatoryTitle)} ${index + 1}`}</h3>
        <Stack direction="horizontal" gap="2">
          {showDeleteButton && (
            <IconButtonWithTooltip
              src={DeleteOutlineIcon}
              iconAs={Icon}
              alt={intl.formatMessage(commonMessages.deleteTooltip)}
              tooltipContent={<div>{intl.formatMessage(commonMessages.deleteTooltip)}</div>}
              onClick={confirmOpen}
            />
          )}
        </Stack>
      </Stack>

      <Stack gap="4">
        {formData.map(({ labelText, feedback, ...rest }) => (
          <Form.Group className="m-0" key={labelText}>
            <FormLabel>{labelText}</FormLabel>
            <Form.Control {...rest} className="m-0" />
            <Form.Control.Feedback>
              <span className="x-small">{feedback}</span>
            </Form.Control.Feedback>
          </Form.Group>
        ))}
        <Form.Group className="m-0">
          <FormLabel> {intl.formatMessage(messages.imageLabel)}</FormLabel>
          {signatureImagePath && (
            <Image
              src={`${getConfig().STUDIO_BASE_URL}${signatureImagePath}`}
              fluid
              alt={intl.formatMessage(messages.imageLabel)}
              className="signatory__image"
            />
          )}
          <Stack direction="horizontal" className="align-items-baseline">
            <Stack>
              <Form.Control
                readOnly
                value={signatureImagePath}
                name={`signatories[${index}].signatureImagePath`}
                placeholder={intl.formatMessage(messages.imagePlaceholder)}
              />
              <Form.Control.Feedback>
                <span className="x-small">{intl.formatMessage(messages.imageDescription)}</span>
              </Form.Control.Feedback>
            </Stack>
            <Button onClick={open}>{uploadReplaceText}</Button>
          </Stack>
        </Form.Group>
      </Stack>
      {isEdit && (
        <Stack direction="horizontal" gap="2" className="mt-4">
          <Button type="submit">
            {intl.formatMessage(commonMessages.saveTooltip)}
          </Button>
          <Button
            variant="outline-primary"
            onClick={() => handleCancelUpdateSignatory()}
          >
            {intl.formatMessage(commonMessages.cardCancel)}
          </Button>
        </Stack>
      )}

      <ModalDropzone
        isOpen={isOpen}
        onClose={close}
        onCancel={close}
        onChange={handleImageUpload}
        fileTypes={['png']}
        onSavingStatus={handleSavingStatusDispatch}
        imageHelpText={intl.formatMessage(messages.imageDescription)}
        modalTitle={uploadReplaceText}
      />
      <ModalNotification
        isOpen={isConfirmOpen}
        title={intl.formatMessage(messages.deleteSignatoryConfirmation, { name })}
        message={intl.formatMessage(messages.deleteSignatoryConfirmationMessage)}
        actionButtonText={intl.formatMessage(commonMessages.deleteTooltip)}
        cancelButtonText={intl.formatMessage(commonMessages.cardCancel)}
        handleCancel={confirmClose}
        handleAction={() => {
          confirmClose();
          handleDeleteSignatory();
        }}
      />
    </div>
  );
};

SignatoryForm.defaultProps = {
  isEdit: false,
  handleChange: null,
  handleBlur: null,
  handleDeleteSignatory: null,
  setFieldValue: null,
  handleCancelUpdateSignatory: null,
};

SignatoryForm.propTypes = {
  name: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  organization: PropTypes.string.isRequired,
  showDeleteButton: PropTypes.bool.isRequired,
  signatureImagePath: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  isEdit: PropTypes.bool,
  handleChange: PropTypes.func,
  handleBlur: PropTypes.func,
  setFieldValue: PropTypes.func,
  handleDeleteSignatory: PropTypes.func,
  handleCancelUpdateSignatory: PropTypes.func,
};

export default SignatoryForm;
