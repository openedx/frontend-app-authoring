import {
  render,
  screen,
} from '@testing-library/react';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { initializeMockApp } from '@edx/frontend-platform';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import initializeStore from '../store';
import AccessibilityPage from './index';

const initialState = {
  accessibilityPage: {
    status: {},
  },
};
let store;

const queryClient = new QueryClient();

const renderComponent = () => {
  render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <QueryClientProvider client={queryClient}>
          <AccessibilityPage />
        </QueryClientProvider>
      </AppProvider>
    </IntlProvider>,
  );
};

describe('<AccessibilityPolicyPage />', () => {
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
      store = initializeStore(initialState);
    });
    it('contains the policy body', () => {
      renderComponent();
      expect(screen.getByText('Individualized Accessibility Process for Course Creators')).toBeVisible();
    });
  });
});
