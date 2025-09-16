import { Outlet } from 'react-router-dom';
import { SidebarInset, SidebarProvider } from '@/shared/Components/ui/sidebar';
import background from '@/assets/images/main-content-background.png';

import { cn } from 'shared/lib/utils';

import AppSidebar from './AppSidebar';

const AppLayout = () => (
  <SidebarProvider>
    <div className="tw-flex tw-flex-row tw-h-screen tw-w-screen">
      <AppSidebar />
      <SidebarInset className={cn(
        'tw-bg-gradient-to-r tw-from-[#FBFAFF] tw-to-[#ECE9FE]',
        'tw-p-3 tw-gap-3',
        'tw-flex !tw-flex-row',
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
          </main>
        </div>
        <ChatBoxContainer />
      </SidebarInset>
    </div>
  </SidebarProvider>

);

const ChatBoxContainer = () => (
  <aside
    className={cn(
      'tw-relative tw-z-10 tw-h-full tw-w-[352px]',
      'tw-p-8',
      'tw-border tw-border-white tw-border-solid',
      'tw-rounded-[20px]',
      'tw-shadow-[0px_2px_4px_-2px_#1018280F,0px_4px_8px_-2px_#1018281A]',
      'tw-flex tw-flex-col tw-gap-8',
    )}
  >
    Chat Box
  </aside>
);

export default AppLayout;
