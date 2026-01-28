import { PluginSlot } from '@openedx/frontend-plugin-framework';

interface ProblemEditorPluginSlotProps {
  blockType: string | null;
}

export const ProblemEditorPluginSlot = ({
  blockType,
}: ProblemEditorPluginSlotProps) => (
  <PluginSlot
    id="org.openedx.frontend.authoring.problem_editor_plugin.v1"
    idAliases={['problem_editor_plugin_slot']}
    pluginProps={{
      blockType,
    }}
  />
);
