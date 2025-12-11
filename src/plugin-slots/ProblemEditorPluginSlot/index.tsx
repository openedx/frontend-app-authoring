import { PluginSlot } from '@openedx/frontend-plugin-framework/dist';
import React from 'react';

interface ProblemEditorPluginSlotProps {
  /** Function to update editor content with new content */
  updateContent: (content: string) => void;
  /** Block type (e.g., 'problem-single-select', 'problem-multi-select') */
  blockType: string | null;
}

/**
 * Plugin slot for Problem Editor
 * 
 * Slot ID: `org.openedx.frontend.authoring.problem_editor_plugin.v1`
 * 
 * This slot allows plugins to add custom widgets to the problem editor.
 * By default, the slot is empty. Add widgets via `env.config.jsx`.
 * 
 * Plugin Props:
 * - `updateContent`: Function to update editor content with new content
 * - `blockType`: Block type (e.g., 'problem-single-select', 'problem-multi-select')
 */
export const ProblemEditorPluginSlot: React.FC<ProblemEditorPluginSlotProps> = ({
  updateContent,
  blockType,
}) => (
  <PluginSlot
    id="org.openedx.frontend.authoring.problem_editor_plugin.v1"
    idAliases={['problem_editor_plugin_slot']}
    pluginProps={{
      updateContent,
      blockType,
    }}
  />
);

