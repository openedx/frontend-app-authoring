import { PluginSlot } from '@openedx/frontend-plugin-framework';

export const AuthoringAppSlot = ({ children }:AuthoringAppSlotProps) => (
  <PluginSlot id="authoring_app_slot">
    {children}
  </PluginSlot>
);

interface AuthoringAppSlotProps {
  children: React.ReactNode;
}
