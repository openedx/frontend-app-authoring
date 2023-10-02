import {
  render,
  fireEvent,
  waitFor,
} from '@testing-library/react';

import { initializeMockApp } from '@edx/frontend-platform';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Context as ResponsiveContext } from 'react-responsive';

import initializeStore from '../store';
import Header from './Header';
import messages from './messages';

let store;

const RootWrapper = (props) => (
  // eslint-disable-next-line react/jsx-no-constructed-context-values, react/prop-types
  <ResponsiveContext.Provider value={{ width: props.screenWidth }}>
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <Header
          {...props}
        />
      </AppProvider>
    </IntlProvider>
  </ResponsiveContext.Provider>
);

const props = {
  courseId: 'testEd123',
  courseNumber: '123',
  courseOrg: 'Ed',
  courseTitle: 'test',
};

describe('Header', () => {
  describe('desktop', () => {
    beforeEach(async () => {
      initializeMockApp({
        authenticatedUser: {
          userId: 3,
          username: 'abc123',
          administrator: false,
          roles: [],
        },
      });
      store = initializeStore({});
    });
    it('course lock up should be visible', () => {
      const { getByTestId } = render(<RootWrapper screenWidth={1280} {...props} />);
      const courseLockUpBlock = getByTestId('course-lock-up-block');
      expect(courseLockUpBlock).toBeVisible();
    });
    it('mobile menu should not be visible', () => {
      const { queryByTestId } = render(<RootWrapper screenWidth={1280} {...props} />);
      const mobileMenuButton = queryByTestId('mobile-menu-button');
      expect(mobileMenuButton).toBeNull();
    });
    it('desktop menu should be visible', () => {
      const { getByTestId } = render(<RootWrapper screenWidth={1280} {...props} />);
      const desktopMenu = getByTestId('desktop-menu');
      expect(desktopMenu).toBeVisible();
    });
    it('video uploads should be in content menu', async () => {
      const { getAllByRole, getByText } = render(<RootWrapper screenWidth={1280} {...props} />);
      const contentMenu = getAllByRole('button')[0];
      await waitFor(() => fireEvent.click(contentMenu));
      const videoUploadButton = getByText(messages['header.links.videoUploads'].defaultMessage);
      expect(videoUploadButton).toBeVisible();
    });
    it('maintenance should not be in user menu', async () => {
      const { getAllByRole, queryByText } = render(<RootWrapper screenWidth={1280} {...props} />);
      const userMenu = getAllByRole('button')[3];
      await waitFor(() => fireEvent.click(userMenu));
      const maintenanceButton = queryByText(messages['header.user.menu.maintenance'].defaultMessage);
      expect(maintenanceButton).toBeNull();
    });
    it('user menu should use avatar icon', async () => {
      const { getByTestId } = render(<RootWrapper screenWidth={1280} {...props} />);
      const avatarIcon = getByTestId('avatar-icon');
      expect(avatarIcon).toBeVisible();
    });
    it('should hide nav items if prop isHiddenMainMenu true', async () => {
      const initialProps = { ...props, isHiddenMainMenu: true };
      const { queryByTestId } = render(<RootWrapper screenWidth={1280} {...initialProps} />);
      const desktopMenu = queryByTestId('desktop-menu');
      const mobileMenuButton = queryByTestId('mobile-menu-button');
      expect(mobileMenuButton).toBeNull();
      expect(desktopMenu).toBeNull();
    });
  });
  describe('mobile', () => {
    beforeEach(async () => {
      initializeMockApp({
        authenticatedUser: {
          userId: 3,
          username: 'abc123',
          administrator: true,
          roles: [],
          avatar: '/imges/test.png',
        },
      });
      store = initializeStore({});
    });
    it('course lock up should not be visible', async () => {
      const { queryByTestId } = render(<RootWrapper screenWidth={500} {...props} />);
      const courseLockUpBlock = queryByTestId('course-lock-up-block');
      expect(courseLockUpBlock).toBeNull();
    });
    it('mobile menu should be visible', async () => {
      const { getByTestId } = render(<RootWrapper screenWidth={500} {...props} />);
      const mobileMenuButton = getByTestId('mobile-menu-button');
      expect(mobileMenuButton).toBeVisible();
      await waitFor(() => fireEvent.click(mobileMenuButton));
      const mobileMenu = getByTestId('mobile-menu');
      expect(mobileMenu).toBeVisible();
    });
    it('desktop menu should not be visible', () => {
      const { queryByTestId } = render(<RootWrapper screenWidth={500} {...props} />);
      const desktopMenu = queryByTestId('desktop-menu');
      expect(desktopMenu).toBeNull();
    });
    it('maintenance should be in user menu', async () => {
      const { getAllByRole, getByText } = render(<RootWrapper screenWidth={500} {...props} />);
      const userMenu = getAllByRole('button')[1];
      await waitFor(() => fireEvent.click(userMenu));
      const maintenanceButton = getByText(messages['header.user.menu.maintenance'].defaultMessage);
      expect(maintenanceButton).toBeVisible();
    });
    it('user menu should use avatar image', async () => {
      const { getByTestId } = render(<RootWrapper screenWidth={500} {...props} />);
      const avatarImage = getByTestId('avatar-image');
      expect(avatarImage).toBeVisible();
    });
    it('should hide nav items if prop isHiddenMainMenu true', async () => {
      const initialProps = { ...props, isHiddenMainMenu: true };
      const { queryByTestId } = render(<RootWrapper screenWidth={500} {...initialProps} />);
      const desktopMenu = queryByTestId('desktop-menu');
      const mobileMenuButton = queryByTestId('mobile-menu-button');
      expect(mobileMenuButton).toBeNull();
      expect(desktopMenu).toBeNull();
    });
  });
});
