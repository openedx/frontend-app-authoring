import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { useParams } from 'react-router-dom';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { FileUpload as FileUploadIcon } from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';
import {
  Form,
  Dropzone,
  Image,
  Hyperlink,
  Card,
  Icon,
  IconButton,
} from '@openedx/paragon';

import { uploadAssets } from './data/api';
import messages from './messages';

const CourseUploadImage = ({
  label,
  customHelpText,
  assetImagePath,
  imageNameField,
  assetImageField,
  identifierFieldText,
  showImageBodyText,
  customInputPlaceholder,
  onChange,
}) => {
  const { courseId } = useParams();
  const intl = useIntl();
  const imageAbsolutePath = () => new URL(assetImagePath, getConfig().LMS_BASE_URL);
  const assetsUrl = () => new URL(`/assets/${courseId}`, getConfig().STUDIO_BASE_URL);

  const handleChangeImageAsset = (path) => {
    const assetPath = _.last(path.split('/'));
    // If image path is entered directly, we need to strip the asset prefix
    const imageName = _.last(assetPath.split('block@'));
    onChange(path, assetImageField);
    if (imageNameField) {
      onChange(imageName, imageNameField);
    }
  };

  const handleProcessUpload = async ({ fileData, handleError }) => {
    try {
      const response = await uploadAssets(courseId, fileData);
      const url = response?.asset?.url;
      if (url) {
        handleChangeImageAsset(url);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const inputComponent = assetImagePath ? (
    <div className="image-preview">
      <Image
        src={imageAbsolutePath().href}
        alt={intl.formatMessage(messages.uploadImageDropzoneAlt)}
        fluid
      />
    </div>
  ) : (
    <>
      <IconButton
        isActive
        src={FileUploadIcon}
        iconAs={Icon}
        variant="secondary"
        alt={intl.formatMessage(messages.uploadImageDropzoneAlt)}
      />
      <p>
        {intl.formatMessage(messages.uploadImageDropzoneText, {
          identifierFieldText,
        })}
      </p>
    </>
  );

  const cardImageTextBody = assetImagePath ? (
    <span className="x-small text-gray-700">
      <FormattedMessage
        {...messages.uploadImageBodyFilled}
        values={{
          hyperlink: (
            <Hyperlink
              destination={assetsUrl().href}
              target="_blank"
              showLaunchIcon={false}
            >
              {intl.formatMessage(messages.uploadImageFilesAndUploads)}
            </Hyperlink>
          ),
        }}
      />
    </span>
  ) : (
    <span className="x-small text-gray-700">
      {intl.formatMessage(messages.uploadImageEmpty)}
    </span>
  );

  return (
    <Form.Group className="form-group-custom w-100">
      <Form.Label>{label}</Form.Label>
      <Card>
        <Card.Body className="image-body">
          <Dropzone
            onProcessUpload={handleProcessUpload}
            inputComponent={inputComponent}
            accept={{
              'image/*': ['.png', '.jpeg'],
            }}
          />
          {showImageBodyText && cardImageTextBody}
        </Card.Body>
        <Card.Divider />
        <Card.Footer className="p-2.5">
          <Form.Control
            value={assetImagePath}
            onChange={(e) => handleChangeImageAsset(e.target.value)}
            placeholder={
              customInputPlaceholder
              || intl.formatMessage(messages.uploadImageInputPlaceholder, {
                identifierFieldText,
              })
            }
          />
        </Card.Footer>
      </Card>
      <Form.Control.Feedback>
        {customHelpText
          || intl.formatMessage(messages.uploadImageHelpText, {
            identifierFieldText,
          })}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

CourseUploadImage.defaultProps = {
  assetImagePath: '',
  customHelpText: '',
  imageNameField: '',
  assetImageField: '',
  showImageBodyText: false,
  identifierFieldText: '',
  customInputPlaceholder: '',
};

CourseUploadImage.propTypes = {
  label: PropTypes.string.isRequired,
  assetImagePath: PropTypes.string,
  customHelpText: PropTypes.string,
  imageNameField: PropTypes.string,
  assetImageField: PropTypes.string,
  showImageBodyText: PropTypes.bool,
  identifierFieldText: PropTypes.string,
  customInputPlaceholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default CourseUploadImage;
