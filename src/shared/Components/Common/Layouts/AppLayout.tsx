import React from 'react';
import { Outlet } from 'react-router-dom';
import { IframeProvider } from 'generic/hooks/context/iFrameContext';
import { cn } from 'shared/lib/utils';
import { SidebarInset, SidebarProvider, useSidebar } from 'shared/Components/ui/sidebar';

import AppSidebar from './AppSidebar';
import ChatBoxContainer from './Chatbox/ChatBoxContainer';
import ChatBoxTrigger from './Chatbox/ChatBoxTrigger';

const AppLayout = () => {
  const { open } = useSidebar();
  return (
    <div className="tw-flex tw-flex-row tw-h-screen tw-w-screen">
      <AppSidebar />
      <SidebarInset
        className={cn(
          'tw-bg-gradient-to-r tw-from-[#FBFAFF] tw-to-[#ECE9FE]',
          'tw-flex !tw-flex-row tw-relative',
          open && 'tw-gap-3',
        )}
      >
        <Outlet />
        <IframeProvider>
          <ChatBoxContainer />
          {!open && <ChatBoxTrigger />}
        </IframeProvider>
      </SidebarInset>
    </div>
  );
};

const Wrapper = () => (
  <SidebarProvider
    style={
      {
        '--sidebar-width': 'calc(352px)',
        '--header-height': 'calc(var(--spacing) * 12)',
      } as React.CSSProperties
    }
  >
    <AppLayout />
  </SidebarProvider>
);

export default Wrapper;
