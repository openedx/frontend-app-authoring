import {
  render,
  fireEvent,
  screen,
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

const courseId = 'testEd123';
const courseNumber = '123';
const courseOrg = 'Ed';
const courseTitle = 'test';

const renderComponent = (screenWidth) => {
  render(
    <ResponsiveContext.Provider value={{ width: screenWidth }}>
      <IntlProvider locale="en">
        <AppProvider store={store}>
          <Header
            {...{
              courseId, courseNumber, courseOrg, courseTitle,
            }}
          />
        </AppProvider>
      </IntlProvider>
    </ResponsiveContext.Provider>,
  );
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
      renderComponent(1280);
      const courseLockUpBlock = screen.getByTestId('course-lock-up-block');
      expect(courseLockUpBlock).toBeVisible();
    });
    it('mobile menu should not be visible', () => {
      renderComponent(1280);
      const mobileMenuButton = screen.queryByTestId('mobile-menu-button');
      expect(mobileMenuButton).toBeNull();
    });
    it('desktop menu should be visible', () => {
      renderComponent(1280);
      const desktopMenu = screen.getByTestId('desktop-menu');
      expect(desktopMenu).toBeVisible();
    });
    it('video uploads should be in content menu', async () => {
      renderComponent(1280);
      const contentMenu = screen.getAllByRole('button')[0];
      await waitFor(() => fireEvent.click(contentMenu));
      const videoUploadButton = screen.getByText(messages['header.links.videoUploads'].defaultMessage);
      expect(videoUploadButton).toBeVisible();
    });
    it('maintenance should not be in user menu', async () => {
      renderComponent(1280);
      const userMenu = screen.getAllByRole('button')[3];
      await waitFor(() => fireEvent.click(userMenu));
      const maintenanceButton = screen.queryByText(messages['header.user.menu.maintenance'].defaultMessage);
      expect(maintenanceButton).toBeNull();
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
        },
      });
      store = initializeStore({});
    });
    it('course lock up should not be visible', async () => {
      renderComponent(500);
      const courseLockUpBlock = screen.queryByTestId('course-lock-up-block');
      expect(courseLockUpBlock).toBeNull();
    });
    it('mobile menu should be visible', async () => {
      renderComponent(500);
      const mobileMenuButton = screen.getByTestId('mobile-menu-button');
      expect(mobileMenuButton).toBeVisible();
      await waitFor(() => fireEvent.click(mobileMenuButton));
      const mobileMenu = screen.getByTestId('mobile-menu');
      expect(mobileMenu).toBeVisible();
    });
    it('desktop menu should not be visible', () => {
      renderComponent(500);
      const desktopMenu = screen.queryByTestId('desktop-menu');
      expect(desktopMenu).toBeNull();
    });
    it('maintenance should be in user menu', async () => {
      renderComponent(500);
      const userMenu = screen.getAllByRole('button')[1];
      await waitFor(() => fireEvent.click(userMenu));
      const maintenanceButton = screen.getByText(messages['header.user.menu.maintenance'].defaultMessage);
      expect(maintenanceButton).toBeVisible();
    });
  });
});
