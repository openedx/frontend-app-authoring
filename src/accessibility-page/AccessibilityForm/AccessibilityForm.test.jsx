import {
  render,
  act,
  screen,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { initializeMockApp } from '@edx/frontend-platform';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppProvider } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import initializeStore from '../../store';
import { RequestStatus } from '../../data/constants';

import AccessibilityForm from './index';
import { getZendeskrUrl } from '../data/api';
import messages from './messages';

let axiosMock;
let store;

const defaultProps = {
  accessibilityEmail: 'accessibilityTest@test.com',
};

const initialState = {
  accessibilityPage: {
    savingStatus: '',
  },
};

const renderComponent = () => {
  render(
    <IntlProvider locale="en">
      <AppProvider store={store}>
        <AccessibilityForm {...defaultProps} />
      </AppProvider>
    </IntlProvider>,
  );
};

describe('<AccessibilityPolicyForm />', () => {
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
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
  });

  describe('renders', () => {
    beforeEach(() => {
      renderComponent();
    });

    it('correct number of form fields', () => {
      const formSections = screen.getAllByRole('textbox');
      const formButton = screen.getByText(messages.accessibilityPolicyFormSubmitLabel.defaultMessage);
      expect(formSections).toHaveLength(3);
      expect(formButton).toBeVisible();
    });

    it('hides StatusAlert on initial load', () => {
      expect(screen.queryAllByRole('alert')).toHaveLength(0);
    });
  });

  describe('statusAlert', () => {
    let formSections;
    let submitButton;
    beforeEach(async () => {
      renderComponent();
      formSections = screen.getAllByRole('textbox');
      await act(async () => {
        userEvent.type(formSections[0], 'email@email.com');
        userEvent.type(formSections[1], 'test name');
        userEvent.type(formSections[2], 'feedback message');
      });
      submitButton = screen.getByText(messages.accessibilityPolicyFormSubmitLabel.defaultMessage);
    });

    it('shows correct success message', async () => {
      axiosMock.onPost(getZendeskrUrl()).reply(200);
      await act(async () => {
        userEvent.click(submitButton);
      });
      const { savingStatus } = store.getState().accessibilityPage;
      expect(savingStatus).toEqual(RequestStatus.SUCCESSFUL);

      expect(screen.getAllByRole('alert')).toHaveLength(1);

      expect(screen.getByText(messages.accessibilityPolicyFormSuccess.defaultMessage)).toBeVisible();

      formSections.forEach(input => {
        expect(input.value).toBe('');
      });
    });

    it('shows correct rate limiting message', async () => {
      axiosMock.onPost(getZendeskrUrl()).reply(429);
      await act(async () => {
        userEvent.click(submitButton);
      });
      const { savingStatus } = store.getState().accessibilityPage;
      expect(savingStatus).toEqual(RequestStatus.FAILED);

      expect(screen.getAllByRole('alert')).toHaveLength(1);

      expect(screen.getByTestId('rate-limit-alert')).toBeVisible();

      formSections.forEach(input => {
        expect(input.value).not.toBe('');
      });
    });
  });

  describe('input validation', () => {
    let formSections;
    let submitButton;
    beforeEach(async () => {
      renderComponent();
      formSections = screen.getAllByRole('textbox');
      await act(async () => {
        userEvent.type(formSections[0], 'email@email.com');
        userEvent.type(formSections[1], 'test name');
        userEvent.type(formSections[2], 'feedback message');
      });
      submitButton = screen.getByText(messages.accessibilityPolicyFormSubmitLabel.defaultMessage);
    });

    it('adds validation checking on each input field', async () => {
      await act(async () => {
        userEvent.clear(formSections[0]);
        userEvent.clear(formSections[1]);
        userEvent.clear(formSections[2]);
      });
      const emailError = screen.getByTestId('error-feedback-email');
      expect(emailError).toBeVisible();

      const fullNameError = screen.getByTestId('error-feedback-email');
      expect(fullNameError).toBeVisible();

      const messageError = screen.getByTestId('error-feedback-message');
      expect(messageError).toBeVisible();
    });

    it('sumbit button is disabled when trying to submit with all empty fields', async () => {
      await act(async () => {
        userEvent.clear(formSections[0]);
        userEvent.clear(formSections[1]);
        userEvent.clear(formSections[2]);
        userEvent.click(submitButton);
      });

      expect(submitButton.closest('button')).toBeDisabled();
    });
  });
});
