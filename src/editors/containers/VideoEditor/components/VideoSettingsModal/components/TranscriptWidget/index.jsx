import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

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
import {
  FormattedMessage,
  injectIntl,
} from '@edx/frontend-platform/i18n';

import { actions, selectors } from '../../../../../../data/redux';
import * as hooks from './hooks';
import messages from './messages';

import FileInput from '../../../../../../sharedComponents/FileInput';
import ErrorAlert from '../../../../../../sharedComponents/ErrorAlerts/ErrorAlert';
import CollapsibleFormWidget from '../CollapsibleFormWidget';

/**
 * Collapsible Form widget controlling video transcripts
 */
export const TranscriptWidget = ({
  error,
  // redux
  transcripts,
  allowTranscriptDownloads,
  showTranscriptByDefault,
  updateField,
}) => {
  const languagesArr = hooks.transcriptLanguages(transcripts);
  const fileInput = hooks.fileInput();
  const input = {
    error: {
      dismiss: () => { console.log('dismiss'); },
      show: true,
    },
  };
  const upload = {
    error: {
      dismiss: () => { console.log('dismiss'); },
      show: true,
    },
  };

  return (
    <CollapsibleFormWidget
      isError={Object.keys(error).length !== 0}
      subtitle={languagesArr}
      title="Transcript"
    >
      <ErrorAlert
        dismissError={upload.error.dismiss}
        hideHeading
        isError={upload.error.show}
      >
        <FormattedMessage {...messages.uploadTranscriptError} />
      </ErrorAlert>
      <ErrorAlert
        dismissError={input.error.dismiss}
        hideHeading
        isError={input.error.show}
      >
        <FormattedMessage {...messages.fileSizeError} />
      </ErrorAlert>
      <Stack gap={3}>
        {transcripts ? (
          <Form.Group className="mt-4.5">
            <b>Transcript widget:</b>
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
            <Alert variant="danger" icon={Info}>
              Only SRT files can be uploaded. Please select a file ending in .srt to upload.
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
  error: {},
};
TranscriptWidget.propTypes = {
  error: PropTypes.node,
  // redux
  transcripts: PropTypes.shape({}).isRequired,
  allowTranscriptDownloads: PropTypes.bool.isRequired,
  showTranscriptByDefault: PropTypes.bool.isRequired,
  updateField: PropTypes.func.isRequired,
};
export const mapStateToProps = (state) => ({
  transcripts: selectors.video.transcripts(state),
  allowTranscriptDownloads: selectors.video.allowTranscriptDownloads(state),
  showTranscriptByDefault: selectors.video.showTranscriptByDefault(state),
});

export const mapDispatchToProps = (dispatch) => ({
  updateField: (stateUpdate) => dispatch(actions.video.updateField(stateUpdate)),
});

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(TranscriptWidget));
