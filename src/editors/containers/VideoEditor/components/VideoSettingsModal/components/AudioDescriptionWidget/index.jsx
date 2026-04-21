import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
  Alert,
  Button,
  Stack,
  ActionRow,
  Spinner,
} from '@openedx/paragon';

import { FileUpload } from '@openedx/paragon/icons';
import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';

import { selectors, thunkActions } from '../../../../../../data/redux';
import { useFileInput, useDurationWarning } from './hooks';
import messages from './messages';

import { FileInput } from '../../../../../../sharedComponents/FileInput';
import { useErrorToggle, parseAssetName } from '../../../../../../sharedComponents/FileInput/fileValidation';
import ErrorAlert from '../../../../../../sharedComponents/ErrorAlerts/ErrorAlert';
import UploadErrorAlert from '../../../../../../sharedComponents/ErrorAlerts/UploadErrorAlert';
import CollapsibleFormWidget from '../CollapsibleFormWidget';
import { ErrorContext } from '../../../../hooks';
import { RequestKeys } from '../../../../../../data/constants/requests';

/**
 * Collapsible widget for uploading and managing audio description tracks.
 * Parent must guard rendering (e.g. skip in library context).
 */
const AudioDescriptionWidget = ({
  audioDescriptionUrl,
  isUploadError,
  isUploadPending,
  deleteAudioDescription,
}) => {
  const intl = useIntl();
  const [error] = React.useContext(ErrorContext).audioDescription;
  const fileSizeError = useErrorToggle();
  const fileTypeError = useErrorToggle();
  const { durationWarning } = useDurationWarning();
  const fileInput = useFileInput({
    fileSizeError,
    fileTypeError,
    onDurationChecked: durationWarning.onDurationChecked,
  });
  const fileName = parseAssetName(audioDescriptionUrl);

  const renderContent = () => {
    if (isUploadPending) {
      return (
        <div className="text-center py-3">
          <Spinner animation="border" screenReaderText={intl.formatMessage(messages.uploadingLabel)} />
          <div className="mt-2 small text-muted">
            <FormattedMessage {...messages.uploadingLabel} />
          </div>
        </div>
      );
    }
    if (audioDescriptionUrl) {
      return (
        <Stack gap={3}>
          <ActionRow className="border border-gray-300 rounded px-3 py-2">
            {fileName}
            <ActionRow.Spacer />
            <Button variant="outline-danger" size="sm" onClick={deleteAudioDescription}>
              <FormattedMessage {...messages.deleteAudioDescription} />
            </Button>
          </ActionRow>
          <FormattedMessage {...messages.helpMessage} />
        </Stack>
      );
    }
    return (
      <Stack gap={3}>
        <FormattedMessage {...messages.addAudioDescriptionMessage} />
        <Button
          className="text-primary-500 font-weight-bold justify-content-start pl-0"
          size="sm"
          iconBefore={FileUpload}
          onClick={fileInput.click}
          variant="link"
        >
          <FormattedMessage {...messages.uploadButtonLabel} />
        </Button>
      </Stack>
    );
  };

  return (
    <CollapsibleFormWidget
      fontSize="x-small"
      isError={Object.keys(error).length > 0}
      title={intl.formatMessage(messages.titleLabel)}
      subtitle={audioDescriptionUrl ? fileName : 'None'}
    >
      <ErrorAlert dismissError={fileSizeError.dismiss} hideHeading isError={fileSizeError.show}>
        <FormattedMessage {...messages.fileSizeError} />
      </ErrorAlert>
      <ErrorAlert dismissError={fileTypeError.dismiss} hideHeading isError={fileTypeError.show}>
        <FormattedMessage {...messages.fileTypeError} />
      </ErrorAlert>
      <UploadErrorAlert isUploadError={isUploadError} message={messages.uploadError} />
      {durationWarning.show && (
        <Alert variant="warning" dismissible onClose={durationWarning.dismiss}>
          <FormattedMessage {...messages.durationMismatchWarning} />
        </Alert>
      )}
      <FileInput fileInput={fileInput} acceptedFiles=".mp3,.ogg,.m4a,.wav,.aac" />
      {renderContent()}
    </CollapsibleFormWidget>
  );
};

AudioDescriptionWidget.propTypes = {
  audioDescriptionUrl: PropTypes.string.isRequired,
  isUploadError: PropTypes.bool.isRequired,
  isUploadPending: PropTypes.bool.isRequired,
  deleteAudioDescription: PropTypes.func.isRequired,
};

export const mapStateToProps = (state) => ({
  audioDescriptionUrl: selectors.video.audioDescriptionUrl(state),
  isUploadError: selectors.requests.isFailed(state, { requestKey: RequestKeys.uploadAudioDescription }),
  isUploadPending: selectors.requests.isPending(state, { requestKey: RequestKeys.uploadAudioDescription }),
});

export const mapDispatchToProps = (dispatch) => ({
  deleteAudioDescription: () => dispatch(thunkActions.video.deleteAudioDescription()),
});

export const AudioDescriptionWidgetInternal = AudioDescriptionWidget;
export default connect(mapStateToProps, mapDispatchToProps)(AudioDescriptionWidget);
