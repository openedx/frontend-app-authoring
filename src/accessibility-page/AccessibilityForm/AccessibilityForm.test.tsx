import {
  initializeMocks,
  render,
  screen,
} from '@src/testUtils';
import userEvent from '@testing-library/user-event';

import AccessibilityForm from './index';
import { getZendeskrUrl } from '../data/api';
import messages from './messages';

let axiosMock;

const defaultProps = {
  accessibilityEmail: 'accessibilityTest@test.com',
};

const renderComponent = () => {
  render(
    <AccessibilityForm {...defaultProps} />,
  );
};

describe('<AccessibilityPolicyForm />', () => {
  beforeEach(async () => {
    const mocks = initializeMocks();

    axiosMock = mocks.axiosMock;
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
    let user;
    beforeEach(async () => {
      user = userEvent.setup();
      renderComponent();
      formSections = screen.getAllByRole('textbox');

      await user.type(formSections[0], 'email@email.com');
      await user.type(formSections[1], 'test name');
      await user.type(formSections[2], 'feedback message');

      submitButton = screen.getByText(messages.accessibilityPolicyFormSubmitLabel.defaultMessage);
    });

    it('renders in progress state', async () => {
      axiosMock.onPost(getZendeskrUrl()).reply(
        () => new Promise(() => {
          // always in pending
        }),
      );

      await user.click(submitButton);

      expect(screen.getByRole('button', { name: /submitting/i })).toBeInTheDocument();
    });

    it('shows correct success message', async () => {
      axiosMock.onPost(getZendeskrUrl()).reply(200);

      await user.click(submitButton);

      expect(screen.getAllByRole('alert')).toHaveLength(1);

      expect(screen.getByText(messages.accessibilityPolicyFormSuccess.defaultMessage)).toBeVisible();

      formSections.forEach(input => {
        expect(input.value).toBe('');
      });
    });

    it('shows correct rate limiting message', async () => {
      axiosMock.onPost(getZendeskrUrl()).reply(429);

      await user.click(submitButton);

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
    let user;
    beforeEach(async () => {
      user = userEvent.setup();
      renderComponent();
      formSections = screen.getAllByRole('textbox');

      await user.type(formSections[0], 'email@email.com');
      await user.type(formSections[1], 'test name');
      await user.type(formSections[2], 'feedback message');

      submitButton = screen.getByText(messages.accessibilityPolicyFormSubmitLabel.defaultMessage);
    });

    it('adds validation checking on each input field', async () => {
      await user.clear(formSections[0]);
      await user.clear(formSections[1]);
      await user.clear(formSections[2]);

      const emailError = screen.getByTestId('error-feedback-email');
      expect(emailError).toBeVisible();

      const fullNameError = screen.getByTestId('error-feedback-email');
      expect(fullNameError).toBeVisible();

      const messageError = screen.getByTestId('error-feedback-message');
      expect(messageError).toBeVisible();
    });

    it('sumbit button is disabled when trying to submit with all empty fields', async () => {
      await user.clear(formSections[0]);
      await user.clear(formSections[1]);
      await user.clear(formSections[2]);
      await user.click(submitButton);

      expect(submitButton.closest('button')).toBeDisabled();
    });
  });
});
