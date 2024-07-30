import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { isEmpty } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { injectIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  ActionRow,
  Collapsible,
  Icon, IconButton,
  Sheet,
  TransitionReplace,
} from '@openedx/paragon';
import { ChevronLeft, ChevronRight, Close } from '@openedx/paragon/icons';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import OrderTranscriptForm from './OrderTranscriptForm';
import messages from './messages';
import {
  clearAutomatedTranscript,
  resetErrors,
  updateTranscriptCredentials,
  updateTranscriptPreference,
} from '../data/thunks';

const TranscriptSettings = ({
  isTranscriptSettingsOpen,
  closeTranscriptSettings,
  courseId,
}) => {
  const dispatch = useDispatch();
  const { errors: errorMessages, pageSettings, transcriptStatus } = useSelector(state => state.videos);
  const {
    activeTranscriptPreferences,
    transcriptCredentials,
    videoTranscriptSettings,
    isAiTranslationsEnabled,
  } = pageSettings;
  const { transcriptionPlans } = videoTranscriptSettings || {};
  const [transcriptType, setTranscriptType] = useState(null);
  const [isAiTranslations, setIsAiTranslations] = useState(false);

  const handleOrderTranscripts = (data, provider) => {
    const noCredentials = isEmpty(transcriptCredentials) || data.apiKey;
    dispatch(resetErrors({ errorType: 'transcript' }));
    if (provider === 'order') {
      dispatch(clearAutomatedTranscript({ courseId }));
    } else if (noCredentials) {
      dispatch(updateTranscriptCredentials({ courseId, data: { ...data, provider, global: false } }));
    } else {
      dispatch(updateTranscriptPreference({ courseId, data: { ...data, provider, global: false } }));
    }
  };

  return (
    <Sheet
      position="right"
      blocking
      show={isTranscriptSettingsOpen}
      onClose={closeTranscriptSettings}
    >
      <div>
        {!isAiTranslations && (
          <>
            <ActionRow>
              <TransitionReplace>
                {transcriptType ? (
                  <IconButton
                    key="back-button"
                    size="sm"
                    iconAs={Icon}
                    src={ChevronLeft}
                    onClick={() => setTranscriptType(null)}
                    alt="back button to main transcript settings view"
                  />
                ) : (
                  <div key="title" className="h3">
                    <FormattedMessage {...messages.transcriptSettingsTitle} />
                  </div>
                )}
              </TransitionReplace>
              <ActionRow.Spacer />
              <IconButton size="sm" iconAs={Icon} src={Close} onClick={closeTranscriptSettings} alt="close settings" />
            </ActionRow>
            <TransitionReplace>
              { transcriptType ? (
                <div key="transcript-settings">
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
                </div>
              ) : (
                <div key="transcript-type-selection" className="mt-3">
                  <Collapsible.Advanced
                    onOpen={() => setTranscriptType('order')}
                  >
                    <Collapsible.Trigger
                      className="row m-0 justify-content-between align-items-center"
                    >
                      <FormattedMessage {...messages.orderTranscriptsTitle} />
                      <Icon src={ChevronRight} />
                    </Collapsible.Trigger>
                  </Collapsible.Advanced>
                </div>
              )}
            </TransitionReplace>
          </>
        )}
        <TransitionReplace>
          <div data-testid="translations-component">
            <PluginSlot
              id="additonal_translations_component_slot"
              pluginProps={{
                setIsAiTranslations,
                closeTranscriptSettings,
                courseId,
                additionalProps: { transcriptType, isAiTranslationsEnabled },
              }}
            />
          </div>
        </TransitionReplace>
      </div>
    </Sheet>
  );
};

TranscriptSettings.propTypes = {
  closeTranscriptSettings: PropTypes.func.isRequired,
  isTranscriptSettingsOpen: PropTypes.bool.isRequired,
  courseId: PropTypes.string.isRequired,
};

export default injectIntl(TranscriptSettings);
