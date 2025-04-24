import { PluginSlot } from '@openedx/frontend-plugin-framework/dist';
import React from 'react';

export const AdditionalTranslationsComponentSlot = ({
  setIsAiTranslations,
  closeTranscriptSettings,
  courseId,
  transcriptType,
  isAiTranslationsEnabled,
}: AdditionalTranslationsComponentSlotProps) => (
  <PluginSlot
    id="org.openedx.frontend.authoring.video_transcript_additional_translations_component.v1"
    idAliases={[
      'additonal_translations_component_slot', // original misspelling
      'additional_translations_component_slot',
    ]}
    pluginProps={{
      setIsAiTranslations,
      closeTranscriptSettings,
      courseId,
      additionalProps: { transcriptType, isAiTranslationsEnabled },
    }}
  />
);

interface AdditionalTranslationsComponentSlotProps {
  setIsAiTranslations: React.Dispatch<React.SetStateAction<boolean>>;
  closeTranscriptSettings: () => void;
  courseId: string;
  transcriptType: string;
  isAiTranslationsEnabled: boolean;
}
