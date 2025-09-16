import { Bell01 } from '@untitledui/icons';
import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from 'shared/Components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from 'shared/Components/ui/sidebar';

const Notification = () => (
  <SidebarMenu className="!tw-w-auto tw-list-none !tw-p-0">
    <SidebarMenuItem className="tw-flex tw-items-center tw-justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size="lg"
            className="!tw-bg-inherit !tw-p-0 tw-border-none tw-w-full tw-flex tw-items-center tw-justify-center"
          >
            <Bell01 className="!tw-size-5 tw-text-gray-500" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="tw-w-(--radix-dropdown-menu-trigger-width) tw-min-w-56 tw-rounded-lg tw-bg-white"
          side="right"
          align="end"
          sideOffset={4}
        >
          {/* TODO: Add Notification Items */}
          Notification
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
);

export default Notification;
