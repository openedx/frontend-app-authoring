import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import {
  injectIntl,
  intlShape,
  FormattedMessage,
} from '@edx/frontend-platform/i18n';
import { FileUpload as FileUploadIcon } from '@edx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';
import {
  Form,
  Dropzone,
  Image,
  Hyperlink,
  Card,
  Icon,
  IconButton,
} from '@edx/paragon';

import { updateAssetsQuery } from '../../data/thunks';
import { getUploadedAssets } from '../../data/selectors';
import messages from './messages';

const CourseCardImage = ({
  intl,
  courseId,
  courseImageAssetPath,
  onChange,
}) => {
  const dispatch = useDispatch();
  const uploadedAssets = useSelector(getUploadedAssets);
  const imageAbsolutePath = new URL(courseImageAssetPath, getConfig().LMS_BASE_URL);
  const assetsUrl = new URL(`/assets/${courseId}`, getConfig().STUDIO_BASE_URL);

  const handleChangeImageAsset = (path) => {
    const assetPath = _.last(path.split('/'));
    const imageName = _.last(assetPath.split('block@'));
    onChange(path, 'courseImageAssetPath');
    onChange(imageName, 'courseImageName');
  };

  useEffect(() => {
    const url = uploadedAssets?.asset?.url;
    if (url) {
      handleChangeImageAsset(url);
    }
  }, [uploadedAssets]);

  const handleProcessUpload = async ({ fileData, handleError }) => {
    try {
      dispatch(updateAssetsQuery(courseId, fileData));
    } catch (error) {
      handleError(error);
    }
  };

  const inputComponent = courseImageAssetPath ? (
    <div className="card-image-preview">
      <Image
        src={imageAbsolutePath}
        alt={intl.formatMessage(messages.courseCardImageDescription)}
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
        alt={intl.formatMessage(messages.courseCardImageIconAlt)}
      />
      <p>{intl.formatMessage(messages.courseCardImageDropzoneText)}</p>
    </>
  );

  const cardImageTextBody = courseImageAssetPath ? (
    <span className="x-small text-gray-700">
      <FormattedMessage
        {...messages.courseCardImageBodyFilled}
        values={{
          hyperlink: (
            <Hyperlink
              destination={assetsUrl}
              target="_blank"
              rel="noopener noreferrer"
              showLaunchIcon={false}
            >
              {intl.formatMessage(messages.courseCardImageFilesAndUploads)}
            </Hyperlink>
          ),
        }}
      />
    </span>
  ) : (
    <span className="x-small text-gray-700">
      {intl.formatMessage(messages.courseCardImageEmpty)}
    </span>
  );

  return (
    <Form.Group className="form-group-custom">
      <Form.Label>
        {intl.formatMessage(messages.courseCardImageLabel)}
      </Form.Label>
      <Card>
        <Card.Body className="card-image-body">
          <Dropzone
            onProcessUpload={handleProcessUpload}
            inputComponent={inputComponent}
            accept={{
              'image/*': ['.png', '.jpeg'],
            }}
          />
          {cardImageTextBody}
        </Card.Body>
        <Card.Divider />
        <Card.Footer className="p-2.5">
          <Form.Control
            value={courseImageAssetPath}
            onChange={(e) => handleChangeImageAsset(e.target.value)}
            placeholder={intl.formatMessage(
              messages.courseCardImageInputPlaceholder,
            )}
          />
        </Card.Footer>
      </Card>
      <Form.Control.Feedback>
        {intl.formatMessage(messages.courseCardImageHelpText)}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

CourseCardImage.defaultProps = {
  courseImageAssetPath: '',
};

CourseCardImage.propTypes = {
  intl: intlShape.isRequired,
  courseId: PropTypes.string.isRequired,
  courseImageAssetPath: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default injectIntl(CourseCardImage);
