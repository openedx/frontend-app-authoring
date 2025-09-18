import { Outlet } from 'react-router-dom';
import {
  SidebarInset, SidebarProvider,
  useSidebar,
} from '@/shared/Components/ui/sidebar';
import background from '@/assets/images/main-content-background.png';

import { cn } from 'shared/lib/utils';

import AppSidebar from './AppSidebar';
import ChatBoxContainer from './Chatbox/ChatBoxContainer';
import ChatBoxTrigger from './Chatbox/ChatBoxTrigger';

const AppLayout = () => {
  const { open } = useSidebar();

  return (
    <div className="tw-flex tw-flex-row tw-h-screen tw-w-screen">
      <AppSidebar />
      <SidebarInset className={cn(
        'tw-bg-gradient-to-r tw-from-[#FBFAFF] tw-to-[#ECE9FE]',
        'tw-p-3 tw-gap-3',
        'tw-flex !tw-flex-row',
        open ? 'tw-pr-3' : 'tw-pr-0',
      )}
      >
        <div className="tw-relative tw-flex-1 tw-overflow-hidden tw-rounded-[20px] tw-shadow-[0px_2px_4px_-2px_#1018280F,0px_4px_8px_-2px_#1018281A]">
          {/* Background overlay with 50% opacity */}
          <div
            className="tw-absolute tw-inset-0 tw-opacity-30 tw-z-0 tw-scale-x-[-1] "
            style={{
              backgroundImage: `url(${background})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <main
            className={cn(
              'tw-relative tw-z-10 tw-h-full',
              'tw-p-8 tw-pb-0 tw-flex-1',
              'tw-border tw-border-white tw-border-solid',
              'tw-rounded-[20px]',
              'tw-flex tw-flex-col tw-gap-8',
            )}
          >
            <Outlet />
            {!open && <ChatBoxTrigger />}
          </main>
        </div>
        <ChatBoxContainer />
      </SidebarInset>
    </div>
  );
};

const Wrapper = () => (
  <SidebarProvider
    style={{
      '--sidebar-width': 'calc(352px)',
      '--header-height': 'calc(var(--spacing) * 12)',
    } as React.CSSProperties}
  >
    <AppLayout />
  </SidebarProvider>
);

export default Wrapper;
