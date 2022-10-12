import React from 'react';
import { connect, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
} from '@edx/frontend-platform/i18n';
import {
  Form,
  Button,
  Stack,
  Icon,
  OverlayTrigger,
  Tooltip,
  Alert,
} from '@edx/paragon';
import { FileUpload, Info } from '@edx/paragon/icons';

import { actions, selectors } from '../../../../../../data/redux';
import * as hooks from './hooks';
import messages from './messages';

import { RequestKeys } from '../../../../../../data/constants/requests';

import FileInput from '../../../../../../sharedComponents/FileInput';
import ErrorAlert from '../../../../../../sharedComponents/ErrorAlerts/ErrorAlert';
import CollapsibleFormWidget from '../CollapsibleFormWidget';

import TranscriptListItem from './TranscriptListItem';
import { ErrorContext } from '../../../../hooks';

/**
 * Collapsible Form widget controlling video transcripts
 */
export const TranscriptWidget = ({
  // redux
  transcripts,
  allowTranscriptDownloads,
  showTranscriptByDefault,
  updateField,
  isUploadError,
  isDeleteError,
}) => {
  const [error] = React.useContext(ErrorContext).transcripts;
  const languagesArr = hooks.transcriptLanguages(transcripts);
  const fileInput = hooks.fileInput({ onAddFile: hooks.addFileCallback({ dispatch: useDispatch() }) });
  const hasTranscripts = hooks.hasTranscripts(transcripts);
  return (
    <CollapsibleFormWidget
      isError={Object.keys(error).length !== 0}
      subtitle={languagesArr}
      title="Transcript"
    >
      <ErrorAlert
        hideHeading
        isError={isUploadError}
      >
        <FormattedMessage {...messages.uploadTranscriptError} />
      </ErrorAlert>
      <ErrorAlert
        hideHeading
        isError={isDeleteError}
      >
        <FormattedMessage {...messages.deleteTranscriptError} />
      </ErrorAlert>
      <Stack gap={3}>
        {hasTranscripts ? (

          <Form.Group className="mt-4.5">
            { Object.entries(transcripts).map(([language, value]) => (
              <TranscriptListItem
                language={language}
                title={value.filename}
              />
            ))}
            <div className="mb-1">
              <Form.Checkbox
                checked={allowTranscriptDownloads}
                className="mt-4.5 decorative-control-label"
                onChange={(e) => updateField({ allowTranscriptDownloads: e.target.checked })}
              >
                <Form.Label>
                  <FormattedMessage {...messages.allowDownloadCheckboxLabel} />
                </Form.Label>
              </Form.Checkbox>
              <OverlayTrigger
                key="right"
                placement="right"
                overlay={(
                  <Tooltip>
                    <FormattedMessage {...messages.tooltipMessage} />
                  </Tooltip>
                )}
              >
                <Icon className="d-inline-block mx-3" src={Info} />
              </OverlayTrigger>
            </div>
            <Form.Checkbox
              checked={showTranscriptByDefault}
              className="mt-4.5 decorative-control-label"
              onChange={(e) => updateField({ showTranscriptByDefault: e.target.checked })}
            >
              <Form.Label size="sm">
                <FormattedMessage {...messages.showByDefaultCheckboxLabel} />
              </Form.Label>
            </Form.Checkbox>
          </Form.Group>
        ) : (
          <>
            <Alert variant="danger">
              <FormattedMessage {...messages.fileTypeWarning} />
            </Alert>
            <FormattedMessage {...messages.addFirstTranscript} />
          </>
        )}
        <FileInput fileInput={fileInput} acceptedFiles=".srt" />
        <Button iconBefore={FileUpload} onClick={fileInput.click} variant="link">
          <FormattedMessage {...messages.uploadButtonLabel} />
        </Button>
      </Stack>
    </CollapsibleFormWidget>
  );
};

TranscriptWidget.defaultProps = {
};
TranscriptWidget.propTypes = {
  // redux
  transcripts: PropTypes.shape({}).isRequired,
  allowTranscriptDownloads: PropTypes.bool.isRequired,
  showTranscriptByDefault: PropTypes.bool.isRequired,
  updateField: PropTypes.func.isRequired,
  isUploadError: PropTypes.bool.isRequired,
  isDeleteError: PropTypes.bool.isRequired,
};
export const mapStateToProps = (state) => ({
  transcripts: selectors.video.transcripts(state),
  allowTranscriptDownloads: selectors.video.allowTranscriptDownloads(state),
  showTranscriptByDefault: selectors.video.showTranscriptByDefault(state),
  isUploadError: selectors.requests.isFailed(state, { requestKey: RequestKeys.uploadTranscript }),
  isDeleteError: selectors.requests.isFailed(state, { requestKey: RequestKeys.deleteTranscript }),
});

export const mapDispatchToProps = (dispatch) => ({
  updateField: (stateUpdate) => dispatch(actions.video.updateField(stateUpdate)),
});

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(TranscriptWidget));
