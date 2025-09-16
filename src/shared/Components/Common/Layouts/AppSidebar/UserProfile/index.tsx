import { getAuthenticatedUser, redirectToLogout } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/shared/Components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/Components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/shared/Components/ui/dropdown-menu';
import { User01, LogOut01 } from '@untitledui/icons';
import { useNavigate } from 'react-router';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useMemo } from 'react';
import messages from '../../../../../../messages';

const UserProfile = () => {
  const user = getAuthenticatedUser();
  const navigate = useNavigate();
  const intl = useIntl();

  const menuItems = useMemo(() => [
    {
      icon: User01,
      label: 'Profile',
      url: '/profile',
    },
  ], [intl]);

  return (
    <SidebarMenu className="!tw-w-auto tw-list-none !tw-p-0 tw-mb-0">
      <SidebarMenuItem className="tw-flex tw-items-center tw-justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="!tw-bg-inherit !tw-p-0 tw-border-none tw-w-fit"
            >
              <Avatar className="!tw-size-12 tw-rounded-full">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="tw-bg-brand-200 tw-rounded-full">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="tw-w-(--radix-dropdown-menu-trigger-width) tw-min-w-56 tw-rounded-lg tw-bg-white"
            side="right"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="tw-p-0 tw-font-normal">
              <div className="tw-flex tw-items-center tw-gap-2 tw-px-1 tw-py-1.5 tw-text-left tw-text-sm">
                <Avatar className="tw-h-8 tw-w-8 tw-rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="tw-rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="tw-grid tw-flex-1 tw-text-left tw-text-sm tw-leading-tight">
                  <span className="tw-truncate tw-font-medium">{user.name}</span>
                  <span className="tw-truncate tw-text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="!tw-bg-grayWarm-100" />
            <DropdownMenuGroup>
              {menuItems.map((item) => (
                <DropdownMenuItem className="tw-cursor-pointer" key={item.label} onClick={() => navigate(item.url)}>
                  <item.icon />
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuItem
              className="tw-cursor-pointer"
              onClick={() => redirectToLogout(getConfig().LMS_BASE_URL)}
            >
              <LogOut01 />
              {intl.formatMessage(messages.logOut)}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default UserProfile;
