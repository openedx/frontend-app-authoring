import {
  render,
  screen,
} from '@testing-library/react';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import initializeStore from '../../store';

import AccessibilityBody from './index';

let store;

const renderComponent = () => {
  render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <AccessibilityBody
          communityAccessibilityLink="http://example.com"
          email="example@example.com"
        />
      </AppProvider>
    </IntlProvider>,
  );
};

describe('<AccessibilityBody />', () => {
  describe('renders', () => {
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
    it('contains links', () => {
      renderComponent();
      expect(screen.getAllByTestId('email-element')).toHaveLength(2);
      expect(screen.getAllByTestId('accessibility-page-link')).toHaveLength(1);
    });
  });
});
