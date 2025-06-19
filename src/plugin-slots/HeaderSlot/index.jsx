import { PluginSlot } from '@openedx/frontend-plugin-framework';

const HeaderSlot = ({
    children,
}) => (
  <PluginSlot
    id="header_plugin_slot"
  >
    {children}
  </PluginSlot>
);

export default HeaderSlot;
