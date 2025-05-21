/* eslint-disable linebreak-style */
import { getConfig } from '@edx/frontend-platform';

interface UserMenuItemsParams {
  studioBaseUrl: string;
  logoutUrl: string;
  isAdmin: any;
}

const getUserMenuItems = ({
  studioBaseUrl,
  logoutUrl,
  isAdmin,
}: UserMenuItemsParams) => {
  let items = [
    {
      href: `${studioBaseUrl}`,
      title: 'Studio Home',
    }, {
      href: `${logoutUrl}`,
      title: 'Logout',
    },
  ];
  if (isAdmin) {
    items = [
      {
        href: `${studioBaseUrl}`,
        title: 'Studio Home',
      }, {
        href: `${getConfig().STUDIO_BASE_URL}/maintenance`,
        title: 'Maintenance',
      }, {
        href: `${logoutUrl}`,
        title: 'Logout',
      },
    ];
  }

  return items;
};

export default getUserMenuItems;
