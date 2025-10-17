import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FormattedMessage,
  useIntl,
} from '@edx/frontend-platform/i18n';
import {
  Image,
  Stack,
  Button,
  Icon,
  IconButtonWithTooltip,
  Alert,
} from '@openedx/paragon';
import { DeleteOutline, FileUpload } from '@openedx/paragon/icons';

import { selectors } from '../../../../../../data/redux';
import { isEdxVideo } from '../../../../../../data/services/cms/api';

import { acceptedImgKeys } from './constants';
import * as hooks from './hooks';
import messages from './messages';

import CollapsibleFormWidget from '../CollapsibleFormWidget';
import { FileInput } from '../../../../../../sharedComponents/FileInput';
import ErrorAlert from '../../../../../../sharedComponents/ErrorAlerts/ErrorAlert';
import { ErrorContext } from '../../../../hooks';

const ThumbnailWidget = () => {
  const dispatch = useDispatch();
  const intl = useIntl();

  // Redux selectors
  const isLibrary = useSelector(selectors.app.isLibrary);
  const allowThumbnailUpload = useSelector(selectors.video.allowThumbnailUpload);
  const thumbnail = useSelector(selectors.video.thumbnail);
  const videoId = useSelector(selectors.video.videoId);

  const [error] = React.useContext(ErrorContext).thumbnail;
  const imgRef = React.useRef();
  const [thumbnailSrc, setThumbnailSrc] = React.useState(thumbnail);

  const { fileSizeError } = hooks.fileSizeError();
  const fileInput = hooks.fileInput({
    setThumbnailSrc,
    imgRef,
    fileSizeError,
  });

  const edxVideo = isEdxVideo(videoId);
  const deleteThumbnail = hooks.deleteThumbnail({ dispatch });

  const getSubtitle = () => {
    if (edxVideo) {
      if (thumbnail) {
        return intl.formatMessage(messages.yesSubtitle);
      }
      return intl.formatMessage(messages.noneSubtitle);
    }
    return intl.formatMessage(messages.unavailableSubtitle);
  };

  return (!isLibrary && edxVideo ? (
    <CollapsibleFormWidget
      fontSize="x-small"
      isError={Object.keys(error).length !== 0}
      title={intl.formatMessage(messages.title)}
      subtitle={getSubtitle()}
    >
      <ErrorAlert
        dismissError={fileSizeError.dismiss}
        hideHeading
        isError={fileSizeError.show}
      >
        <FormattedMessage {...messages.fileSizeError} />
      </ErrorAlert>

      {!allowThumbnailUpload && (
        <Alert variant="light">
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
          {allowThumbnailUpload && (
            <IconButtonWithTooltip
              tooltipPlacement="top"
              tooltipContent={intl.formatMessage(messages.deleteThumbnail)}
              iconAs={Icon}
              src={DeleteOutline}
              onClick={deleteThumbnail}
            />
          )}
        </Stack>
      ) : (
        <Stack gap={4}>
          <div className="text-center">
            <FormattedMessage {...messages.addThumbnail} />
            <div className="text-primary-300">
              <FormattedMessage {...messages.aspectRequirements} />
            </div>
          </div>
          <FileInput fileInput={fileInput} acceptedFiles={Object.values(acceptedImgKeys).join()} />
          <Button
            className="text-primary-500 font-weight-bold justify-content-start pl-0"
            size="sm"
            iconBefore={FileUpload}
            onClick={fileInput.click}
            variant="link"
            disabled={!allowThumbnailUpload}
          >
            <FormattedMessage {...messages.uploadButtonLabel} />
          </Button>
        </Stack>
      )}
    </CollapsibleFormWidget>
  ) : null);
};

ThumbnailWidget.propTypes = {};

export default ThumbnailWidget;
