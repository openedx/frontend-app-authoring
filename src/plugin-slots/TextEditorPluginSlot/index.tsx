import { PluginSlot } from '@openedx/frontend-plugin-framework';

interface TextEditorPluginSlotProps {
  blockType: string;
}

export const TextEditorPluginSlot = ({
  blockType,
}: TextEditorPluginSlotProps) => (
  <PluginSlot
    id="org.openedx.frontend.authoring.text_editor_plugin.v1"
    idAliases={['text_editor_plugin_slot']}
    pluginProps={{
      blockType,
    }}
  />
);
