import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  injectIntl,
  intlShape,
} from '@edx/frontend-platform/i18n';
import {
  Form,
  Button,
  Stack,
  Icon,
  OverlayTrigger,
  Tooltip,
  ActionRow,
} from '@openedx/paragon';
import { Add, InfoOutline } from '@openedx/paragon/icons';

import { actions, selectors } from '../../../../../../data/redux';
import messages from './messages';

import { RequestKeys } from '../../../../../../data/constants/requests';
import { in8lTranscriptLanguages } from '../../../../../../data/constants/video';

import ErrorAlert from '../../../../../../sharedComponents/ErrorAlerts/ErrorAlert';
import CollapsibleFormWidget from '../CollapsibleFormWidget';

import ImportTranscriptCard from './ImportTranscriptCard';
import Transcript from './Transcript';
import { ErrorContext } from '../../../../hooks';
// This 'module' self-import hack enables mocking during tests.
// See src/editors/decisions/0005-internal-editor-testability-decisions.md. The whole approach to how hooks are tested
// should be re-thought and cleaned up to avoid this pattern.
// eslint-disable-next-line import/no-self-import
import * as module from './index';

export const hooks = {
  updateErrors: ({ isUploadError, isDeleteError }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
    const [error, setError] = React.useContext(ErrorContext).transcripts;
    if (isUploadError) {
      setError({ ...error, uploadError: messages.uploadTranscriptError.defaultMessage });
    }
    if (isDeleteError) {
      setError({ ...error, deleteError: messages.deleteTranscriptError.defaultMessage });
    }
  },
  transcriptLanguages: (transcripts, intl) => {
    const languages = [];
    if (transcripts && transcripts.length > 0) {
      const fullTextTranslatedStrings = in8lTranscriptLanguages(intl);
      transcripts.forEach(transcript => {
        if (!(transcript === '')) {
          languages.push(fullTextTranslatedStrings[transcript]);
        }
      });

      return languages.join(', ');
    }
    return 'None';
  },
  hasTranscripts: (transcripts) => {
    if (transcripts && transcripts.length > 0) {
      return true;
    }
    return false;
  },
  onAddNewTranscript: ({ transcripts, updateField }) => {
    // keep blank lang code for now, will be updated once lang is selected.
    if (!transcripts) {
      updateField({ transcripts: [''] });
      return;
    }
    const newTranscripts = [...transcripts, ''];
    updateField({ transcripts: newTranscripts });
  },
};

/**
 * Collapsible Form widget controlling video transcripts
 */
const TranscriptWidget = ({
  // redux
  transcripts,
  selectedVideoTranscriptUrls,
  allowTranscriptDownloads,
  showTranscriptByDefault,
  allowTranscriptImport,
  updateField,
  isUploadError,
  isDeleteError,
  // injected
  intl,
}) => {
  const [error] = React.useContext(ErrorContext).transcripts;
  const [showImportCard, setShowImportCard] = React.useState(true);
  const fullTextLanguages = module.hooks.transcriptLanguages(transcripts, intl);
  const hasTranscripts = module.hooks.hasTranscripts(transcripts);

  return (
    <CollapsibleFormWidget
      fontSize="x-small"
      isError={Object.keys(error).length !== 0}
      subtitle={fullTextLanguages}
      title={intl.formatMessage(messages.title)}
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
          <Form.Group className="border-primary-100 border-bottom">
            {transcripts.map((language, index) => (
              <Transcript
                language={language}
                transcriptUrl={selectedVideoTranscriptUrls[language]}
                index={index}
              />
            ))}
            <ActionRow className="mt-3.5">
              <Form.Checkbox
                checked={allowTranscriptDownloads}
                className="decorative-control-label"
                onChange={(e) => updateField({ allowTranscriptDownloads: e.target.checked })}
              >
                <div className="small text-gray-700">
                  <FormattedMessage {...messages.allowDownloadCheckboxLabel} />
                </div>
              </Form.Checkbox>
              <OverlayTrigger
                key="top"
                placement="top"
                overlay={(
                  <Tooltip id="tooltip-top">
                    <FormattedMessage {...messages.tooltipMessage} />
                  </Tooltip>
                )}
              >
                <Icon src={InfoOutline} style={{ height: '16px', width: '16px' }} />
              </OverlayTrigger>
              <ActionRow.Spacer />
            </ActionRow>
            <Form.Checkbox
              checked={showTranscriptByDefault}
              className="mt-3 decorative-control-label"
              onChange={(e) => updateField({ showTranscriptByDefault: e.target.checked })}
            >
              <div className="small text-gray-700">
                <FormattedMessage {...messages.showByDefaultCheckboxLabel} />
              </div>
            </Form.Checkbox>
          </Form.Group>
        ) : (
          <>
            <FormattedMessage {...messages.addFirstTranscript} />
            {showImportCard && allowTranscriptImport
              ? <ImportTranscriptCard setOpen={setShowImportCard} />
              : null}
          </>
        )}
        <div className="mt-2">
          <Button
            className="text-primary-500 font-weight-bold justify-content-start pl-0"
            size="sm"
            iconBefore={Add}
            variant="link"
            onClick={() => module.hooks.onAddNewTranscript({ transcripts, updateField })}
          >
            <FormattedMessage {...messages.uploadButtonLabel} />
          </Button>
        </div>
      </Stack>
    </CollapsibleFormWidget>
  );
};

TranscriptWidget.defaultProps = {
  selectedVideoTranscriptUrls: {},
};
TranscriptWidget.propTypes = {
  // redux
  transcripts: PropTypes.arrayOf(PropTypes.string).isRequired,
  selectedVideoTranscriptUrls: PropTypes.shape(),
  allowTranscriptDownloads: PropTypes.bool.isRequired,
  showTranscriptByDefault: PropTypes.bool.isRequired,
  allowTranscriptImport: PropTypes.bool.isRequired,
  updateField: PropTypes.func.isRequired,
  isUploadError: PropTypes.bool.isRequired,
  isDeleteError: PropTypes.bool.isRequired,
  intl: PropTypes.shape(intlShape).isRequired,
};
export const mapStateToProps = (state) => ({
  transcripts: selectors.video.transcripts(state),
  selectedVideoTranscriptUrls: selectors.video.selectedVideoTranscriptUrls(state),
  allowTranscriptDownloads: selectors.video.allowTranscriptDownloads(state),
  showTranscriptByDefault: selectors.video.showTranscriptByDefault(state),
  allowTranscriptImport: selectors.video.allowTranscriptImport(state),
  isUploadError: selectors.requests.isFailed(state, { requestKey: RequestKeys.uploadTranscript }),
  isDeleteError: selectors.requests.isFailed(state, { requestKey: RequestKeys.deleteTranscript }),
});

export const mapDispatchToProps = (dispatch) => ({
  updateField: (stateUpdate) => dispatch(actions.video.updateField(stateUpdate)),
});

export const TranscriptWidgetInternal = TranscriptWidget; // For testing only
export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(TranscriptWidget));
