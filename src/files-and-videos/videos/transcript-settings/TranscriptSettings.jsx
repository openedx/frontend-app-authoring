import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { injectIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Collapsible,
  Icon, IconButton,
  Sheet,
  TransitionReplace,
} from '@edx/paragon';
import { ChevronLeft, ChevronRight, Close } from '@edx/paragon/icons';
import OrderTranscriptForm from './OrderTranscriptForm';
import messages from './messages';

const TranscriptSettings = ({
  isTranscriptSettngsOpen,
  closeTranscriptSettings,
  handleOrderTranscripts,
  errorMessages,
  transcriptStatus,
}) => {
  const {
    activeTranscriptPreferences,
    transcriptCredentials,
    videoTranscriptSettings,
  } = useSelector(state => state.videos.pageSettings);
  const { transcriptionPlans } = videoTranscriptSettings;
  const [transcriptType, setTranscriptType] = useState(activeTranscriptPreferences);

  return (
    <Sheet
      position="right"
      blocking
      show={isTranscriptSettngsOpen}
      onClose={closeTranscriptSettings}
    >
      <div style={{ width: '225px' }}>
        <ActionRow>
          <TransitionReplace>
            {transcriptType ? (
              <IconButton
                key="back-button"
                size="sm"
                iconAs={Icon}
                src={ChevronLeft}
                onClick={() => setTranscriptType(null)}
              />
            ) : (
              <div key="title" className="h3">
                <FormattedMessage {...messages.transcriptSettingsTitle} />
              </div>
            )}
          </TransitionReplace>
          <ActionRow.Spacer />
          <IconButton size="sm" iconAs={Icon} src={Close} onClick={closeTranscriptSettings} />
        </ActionRow>
        <TransitionReplace>
          {transcriptType ? (
            <div key="transcript-settings">
              {
                transcriptType === 'expert' ? (
                  'Selected transcript type!'
                ) : (
                  <OrderTranscriptForm
                    {...{
                      setTranscriptType,
                      transcriptType,
                      activeTranscriptPreferences,
                      transcriptCredentials,
                      closeTranscriptSettings,
                      handleOrderTranscripts,
                      transcriptionPlans,
                      errorMessages,
                      transcriptStatus,
                    }}
                  />
                )
              }
            </div>
          ) : (
            <div key="transcript-type-selection" className="mt-3">
              <Collapsible.Advanced>
                <Collapsible.Trigger
                  className="row m-0 justify-content-between align-items-center"
                  onClick={() => setTranscriptType('order')}
                >
                  <FormattedMessage {...messages.orderTranscriptsTitle} />
                  <Icon src={ChevronRight} />
                </Collapsible.Trigger>
              </Collapsible.Advanced>
            </div>
          )}
        </TransitionReplace>
      </div>
    </Sheet>
  );
};

TranscriptSettings.propTypes = {
  closeTranscriptSettings: PropTypes.func.isRequired,
  isTranscriptSettngsOpen: PropTypes.bool.isRequired,
  transcriptStatus: PropTypes.string.isRequired,
  errorMessages: PropTypes.shape({
    transcript: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  handleOrderTranscripts: PropTypes.func.isRequired,
};

export default injectIntl(TranscriptSettings);
