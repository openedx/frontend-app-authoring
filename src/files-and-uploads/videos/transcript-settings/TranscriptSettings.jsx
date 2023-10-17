import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import {
  ActionRow,
  Collapsible,
  Icon, IconButton,
  Sheet,
  TransitionReplace,
} from '@edx/paragon';
import { ChevronLeft, ChevronRight, Close } from '@edx/paragon/icons';
import OrderTranscriptForm from './OrderTranscriptForm';

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
                Transcript settings
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
                  Order Transcripts
                  <Icon src={ChevronRight} />
                </Collapsible.Trigger>
              </Collapsible.Advanced>
              <hr />
              {/* <Collapsible.Advanced>
                <Collapsible.Trigger
                  className="row m-0 justify-content-between align-items-center"
                  onClick={() => setTranscriptType('expert')}
                >
                  Get free translations
                  <Icon src={ChevronRight} />
                </Collapsible.Trigger>
              </Collapsible.Advanced> */}
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

export default TranscriptSettings;
