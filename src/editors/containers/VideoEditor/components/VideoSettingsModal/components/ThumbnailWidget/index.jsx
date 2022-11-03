import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';
import {
  Image,
  Stack,
  Button,
  Icon,
  IconButtonWithTooltip,
  Alert,
} from '@edx/paragon';
import { Delete, FileUpload } from '@edx/paragon/icons';

import { actions, selectors } from '../../../../../../data/redux';
import { acceptedImgKeys } from './constants';
import * as hooks from './hooks';
import messages from './messages';

import CollapsibleFormWidget from '../CollapsibleFormWidget';
import FileInput from '../../../../../../sharedComponents/FileInput';
import ErrorAlert from '../../../../../../sharedComponents/ErrorAlerts/ErrorAlert';
import { ErrorContext } from '../../../../hooks';

/**
 * Collapsible Form widget controlling video thumbnail
 */
export const ThumbnailWidget = ({
  // injected
  intl,
  // redux
  isLibrary,
  allowThumbnailUpload,
  thumbnail,
  updateField,
  videoType,
}) => {
  const [error] = React.useContext(ErrorContext).thumbnail;
  const imgRef = React.useRef();
  const [thumbnailSrc, setThumbnailSrc] = React.useState(thumbnail);
  const { fileSizeError } = hooks.fileSizeError();
  const fileInput = hooks.fileInput({
    setThumbnailSrc,
    imgRef,
    fileSizeError,
  });
  const isEdxVideo = videoType === 'edxVideo';

  return (!isLibrary ? (
    <CollapsibleFormWidget
      isError={Object.keys(error).length !== 0}
      title={intl.formatMessage(messages.title)}
      subtitle={isEdxVideo ? null : intl.formatMessage(messages.unavailableSubtitle)}
    >
      <ErrorAlert
        dismissError={fileSizeError.dismiss}
        hideHeading
        isError={fileSizeError.show}
      >
        <FormattedMessage {...messages.fileSizeError} />
      </ErrorAlert>
      {isEdxVideo ? null : (
        <Alert variant="info">
          <FormattedMessage {...messages.unavailableMessage} />
        </Alert>
      )}
      {thumbnail ? (
        <Stack direction="horizontal" gap={3}>
          <Image
            thumbnail
            fluid
            className="w-75"
            ref={imgRef}
            src={thumbnailSrc || thumbnail}
            alt={intl.formatMessage(messages.thumbnailAltText)}
          />
          { (allowThumbnailUpload && isEdxVideo) ? (
            <IconButtonWithTooltip
              className="d-inline-block"
              tooltipPlacement="top"
              tooltipContent={intl.formatMessage(messages.deleteThumbnail)}
              iconAs={Icon}
              src={Delete}
              onClick={() => updateField({ thumbnail: null })}
            />
          ) : null }
        </Stack>
      ) : (
        <Stack gap={3}>
          <div>
            <FormattedMessage {...messages.addThumbnail} />
          </div>
          <div style={{ color: 'grey' }}>
            <FormattedMessage {...messages.aspectRequirements} />
          </div>
          <FileInput fileInput={fileInput} acceptedFiles={Object.values(acceptedImgKeys).join()} />
          <Button iconBefore={FileUpload} onClick={fileInput.click} variant="link" disabled={!isEdxVideo}>
            <FormattedMessage {...messages.uploadButtonLabel} />
          </Button>
        </Stack>
      )}
    </CollapsibleFormWidget>
  ) : null);
};

ThumbnailWidget.propTypes = {
  // injected
  intl: intlShape.isRequired,
  // redux
  isLibrary: PropTypes.bool.isRequired,
  allowThumbnailUpload: PropTypes.bool.isRequired,
  thumbnail: PropTypes.string.isRequired,
  updateField: PropTypes.func.isRequired,
  videoType: PropTypes.string.isRequired,
};
export const mapStateToProps = (state) => ({
  isLibrary: selectors.app.isLibrary(state),
  allowThumbnailUpload: selectors.video.allowThumbnailUpload(state),
  thumbnail: selectors.video.thumbnail(state),
  videoType: selectors.video.videoType(state),
});

export const mapDispatchToProps = (dispatch) => ({
  updateField: (stateUpdate) => dispatch(actions.video.updateField(stateUpdate)),
});

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(ThumbnailWidget));
