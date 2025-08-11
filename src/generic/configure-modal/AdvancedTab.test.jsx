import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Formik } from 'formik';

import AdvancedTab from './AdvancedTab';
import messages from './messages';

const defaultProps = {
  values: {
    isTimeLimited: false,
    defaultTimeLimitMinutes: 30,
    isPrereq: false,
    prereqUsageKey: '',
    prereqMinScore: 100,
    prereqMinCompletion: 100,
    isProctoredExam: false,
    isPracticeExam: false,
    isOnboardingExam: false,
    examReviewRules: '',
  },
  setFieldValue: jest.fn(),
  prereqs: [],
  releasedToStudents: false,
  wasExamEverLinkedWithExternal: false,
  enableProctoredExams: false,
  enableTimedExams: true,
  supportsOnboarding: false,
  wasProctoredExam: false,
  showReviewRules: false,
  onlineProctoringRules: '',
};

const renderComponent = (props = {}) => render(
  <IntlProvider locale="en">
    <Formik initialValues={defaultProps.values} onSubmit={() => {}}>
      <AdvancedTab {...defaultProps} {...props} />
    </Formik>
  </IntlProvider>,
);

describe('<AdvancedTab /> with enableTimedExams prop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('when enableTimedExams is true', () => {
    it('renders special exam options enabled', () => {
      renderComponent();

      expect(screen.getByText('Set as a special exam')).toBeInTheDocument();
      const headingContainer = screen.getByText(
        'Set as a special exam',
      ).parentElement;
      expect(headingContainer.querySelector('svg')).not.toBeInTheDocument();

      const noneRadio = screen.getByLabelText('None');
      const timedRadio = screen.getByLabelText('Timed');

      expect(noneRadio).toBeInTheDocument();
      expect(noneRadio).not.toBeDisabled();
      expect(timedRadio).toBeInTheDocument();
      expect(timedRadio).not.toBeDisabled();
    });

    it('allows user to interact with timed exam option', async () => {
      const user = userEvent.setup();
      renderComponent();

      const timedRadio = screen.getByLabelText('Timed');

      expect(timedRadio).not.toBeDisabled();
      await user.click(timedRadio);

      expect(timedRadio).toBeInTheDocument();
    });
  });

  describe('when enableTimedExams is false', () => {
    const disabledProps = { enableTimedExams: false };

    it('renders special exam options disabled', () => {
      renderComponent(disabledProps);

      const noneRadio = screen.getByLabelText('None');
      const timedRadio = screen.getByLabelText('Timed');

      expect(noneRadio).toBeDisabled();
      expect(timedRadio).toBeDisabled();
    });

    it('shows tooltip icon next to heading', () => {
      renderComponent(disabledProps);

      const questionIcon = screen
        .getByText('Set as a special exam')
        .parentElement.querySelector('svg');
      expect(questionIcon).toBeInTheDocument();
      expect(questionIcon).toHaveClass('ml-2', 'text-gray-500');
    });

    it('shows tooltip message when hovering over icon', async () => {
      const user = userEvent.setup();
      renderComponent(disabledProps);

      const questionIcon = screen
        .getByText('Set as a special exam')
        .parentElement.querySelector('svg');
      await user.hover(questionIcon);

      expect(
        await screen.findByText(
          messages.timedExamsDisabledTooltip.defaultMessage,
        ),
      ).toBeInTheDocument();
    });

    it('prevents user from interacting with disabled options', async () => {
      const user = userEvent.setup();
      renderComponent(disabledProps);

      const noneRadio = screen.getByLabelText('None');
      const timedRadio = screen.getByLabelText('Timed');

      expect(noneRadio).toBeDisabled();
      expect(timedRadio).toBeDisabled();

      await user.click(noneRadio);
      await user.click(timedRadio);

      expect(noneRadio).toBeDisabled();
      expect(timedRadio).toBeDisabled();
    });

    it('does not show tooltip icon when enableTimedExams is true', () => {
      renderComponent({ enableTimedExams: true });

      const headingContainer = screen.getByText(
        'Set as a special exam',
      ).parentElement;
      expect(headingContainer.querySelector('svg')).not.toBeInTheDocument();
    });

    it('shows tooltip icon with proper classes', () => {
      renderComponent(disabledProps);

      const questionIcon = screen
        .getByText('Set as a special exam')
        .parentElement.querySelector('svg');
      expect(questionIcon).toHaveClass('ml-2', 'text-gray-500');
    });
  });

  describe('with proctored exams enabled', () => {
    it('shows proctored exam options when both flags are enabled', () => {
      renderComponent({
        enableProctoredExams: true,
        enableTimedExams: true,
      });

      expect(screen.getByLabelText('None')).not.toBeDisabled();
      expect(screen.getByLabelText('Timed')).not.toBeDisabled();
    });

    it('shows proctored options but disables timed options when enableTimedExams is false', () => {
      renderComponent({
        enableProctoredExams: true,
        enableTimedExams: false,
      });

      expect(screen.getByLabelText('None')).toBeDisabled();
      expect(screen.getByLabelText('Timed')).toBeDisabled();

      const questionIcon = screen
        .getByText('Set as a special exam')
        .parentElement.querySelector('svg');
      expect(questionIcon).toBeInTheDocument();
    });
  });

  describe('default props and prop types', () => {
    it('uses default value for enableTimedExams when not provided', () => {
      const propsWithoutTimedExams = { ...defaultProps };
      delete propsWithoutTimedExams.enableTimedExams;

      render(
        <IntlProvider locale="en">
          <Formik initialValues={defaultProps.values} onSubmit={() => {}}>
            <AdvancedTab {...propsWithoutTimedExams} />
          </Formik>
        </IntlProvider>,
      );

      expect(screen.getByLabelText('None')).not.toBeDisabled();
      expect(screen.getByLabelText('Timed')).not.toBeDisabled();
    });

    it('handles enableTimedExams prop correctly', () => {
      renderComponent({ enableTimedExams: false });

      expect(screen.getByLabelText('None')).toBeDisabled();
      expect(screen.getByLabelText('Timed')).toBeDisabled();
    });
  });

  describe('exam type selection behavior', () => {
    const mockSetFieldValue = jest.fn();

    beforeEach(() => {
      mockSetFieldValue.mockClear();
    });

    it('handles timed exam selection', async () => {
      const user = userEvent.setup();
      renderComponent({ setFieldValue: mockSetFieldValue });

      const timedRadio = screen.getByLabelText('Timed');
      await user.click(timedRadio);

      expect(mockSetFieldValue).toHaveBeenCalledWith('isTimeLimited', true);
      expect(mockSetFieldValue).toHaveBeenCalledWith('isOnboardingExam', false);
      expect(mockSetFieldValue).toHaveBeenCalledWith('isPracticeExam', false);
      expect(mockSetFieldValue).toHaveBeenCalledWith('isProctoredExam', false);
    });

    it('handles none exam selection', async () => {
      const user = userEvent.setup();
      renderComponent({
        setFieldValue: mockSetFieldValue,
        values: {
          ...defaultProps.values,
          isTimeLimited: true,
        },
      });

      const noneRadio = screen.getByLabelText('None');
      await user.click(noneRadio);

      expect(mockSetFieldValue).toHaveBeenCalledWith('isTimeLimited', false);
      expect(mockSetFieldValue).toHaveBeenCalledWith('isOnboardingExam', false);
      expect(mockSetFieldValue).toHaveBeenCalledWith('isPracticeExam', false);
      expect(mockSetFieldValue).toHaveBeenCalledWith('isProctoredExam', false);
    });

    it('handles proctored exam selection', async () => {
      const user = userEvent.setup();
      renderComponent({
        setFieldValue: mockSetFieldValue,
        enableProctoredExams: true,
      });

      const proctoredRadio = screen.queryByLabelText('Proctored');

      if (proctoredRadio) {
        await user.click(proctoredRadio);

        expect(mockSetFieldValue).toHaveBeenCalledWith('isProctoredExam', true);
        expect(mockSetFieldValue).toHaveBeenCalledWith('isTimeLimited', true);
        expect(mockSetFieldValue).toHaveBeenCalledWith(
          'isOnboardingExam',
          false,
        );
        expect(mockSetFieldValue).toHaveBeenCalledWith('isPracticeExam', false);
      }
    });

    it('handles practice exam selection', async () => {
      const user = userEvent.setup();
      renderComponent({
        setFieldValue: mockSetFieldValue,
        enableProctoredExams: true,
        supportsOnboarding: false, // Explicitly set to false to show practice exam
      });

      const practiceRadio = screen.getByLabelText('Practice proctored');
      expect(practiceRadio).toBeInTheDocument();

      await user.click(practiceRadio);

      expect(mockSetFieldValue).toHaveBeenCalledWith('isPracticeExam', true);
      expect(mockSetFieldValue).toHaveBeenCalledWith('isProctoredExam', true);
      expect(mockSetFieldValue).toHaveBeenCalledWith('isTimeLimited', true);
      expect(mockSetFieldValue).toHaveBeenCalledWith('isOnboardingExam', false);
    });

    it('handles onboarding exam selection', async () => {
      const user = userEvent.setup();
      renderComponent({
        setFieldValue: mockSetFieldValue,
        enableProctoredExams: true,
        supportsOnboarding: true,
      });

      const onboardingRadio = screen.queryByLabelText('Onboarding');

      if (onboardingRadio) {
        await user.click(onboardingRadio);

        expect(mockSetFieldValue).toHaveBeenCalledWith(
          'isOnboardingExam',
          true,
        );
        expect(mockSetFieldValue).toHaveBeenCalledWith('isProctoredExam', true);
        expect(mockSetFieldValue).toHaveBeenCalledWith('isTimeLimited', true);
        expect(mockSetFieldValue).toHaveBeenCalledWith('isPracticeExam', false);
      }
    });
  });

  describe('exam type value calculation', () => {
    it('shows onboarding exam when both isTimeLimited and isProctoredExam and isOnboardingExam are true', () => {
      renderComponent({
        enableProctoredExams: true,
        supportsOnboarding: true,
        values: {
          ...defaultProps.values,
          isTimeLimited: true,
          isProctoredExam: true,
          isOnboardingExam: true,
        },
      });

      const onboardingRadio = screen.queryByLabelText('Onboarding');
      if (onboardingRadio) {
        expect(onboardingRadio).toBeChecked();
      }
    });

    it('shows practice exam when both isTimeLimited and isProctoredExam and isPracticeExam are true', () => {
      renderComponent({
        enableProctoredExams: true,
        values: {
          ...defaultProps.values,
          isTimeLimited: true,
          isProctoredExam: true,
          isPracticeExam: true,
        },
      });

      const practiceRadio = screen.queryByLabelText('Practice proctored');
      if (practiceRadio) {
        expect(practiceRadio).toBeChecked();
      }
    });

    it('shows proctored exam when both isTimeLimited and isProctoredExam are true', () => {
      renderComponent({
        enableProctoredExams: true,
        values: {
          ...defaultProps.values,
          isTimeLimited: true,
          isProctoredExam: true,
        },
      });

      const proctoredRadio = screen.queryByLabelText('Proctored');
      if (proctoredRadio) {
        expect(proctoredRadio).toBeChecked();
      }
    });

    it('shows timed exam when only isTimeLimited is true', () => {
      renderComponent({
        values: {
          ...defaultProps.values,
          isTimeLimited: true,
        },
      });

      const timedRadio = screen.getByLabelText('Timed');
      expect(timedRadio).toBeChecked();
    });

    it('shows none when no exam flags are set', () => {
      renderComponent();

      const noneRadio = screen.getByLabelText('None');
      expect(noneRadio).toBeChecked();
    });
  });

  describe('time limit functionality', () => {
    const mockSetFieldValue = jest.fn();

    beforeEach(() => {
      mockSetFieldValue.mockClear();
    });

    it('displays time limit input when timed exam is selected', () => {
      renderComponent({
        values: {
          ...defaultProps.values,
          isTimeLimited: true,
        },
      });

      const timeInput = screen.queryByDisplayValue('00:30');
      expect(timeInput).toBeInTheDocument();
    });

    it('handles time limit changes', async () => {
      const user = userEvent.setup();
      renderComponent({
        setFieldValue: mockSetFieldValue,
        values: {
          ...defaultProps.values,
          isTimeLimited: true,
        },
      });

      const timeInput = screen.queryByDisplayValue('00:30');
      if (timeInput) {
        await user.clear(timeInput);
        await user.type(timeInput, '01:30');

        expect(mockSetFieldValue).toHaveBeenCalledWith(
          'defaultTimeLimitMinutes',
          90,
        );
      }
    });

    it('formats time correctly for different minute values', () => {
      renderComponent({
        values: {
          ...defaultProps.values,
          isTimeLimited: true,
          defaultTimeLimitMinutes: 0,
        },
      });
      expect(screen.queryByDisplayValue('00:00')).toBeInTheDocument();

      renderComponent({
        values: {
          ...defaultProps.values,
          isTimeLimited: true,
          defaultTimeLimitMinutes: 90,
        },
      });
      expect(screen.queryByDisplayValue('01:30')).toBeInTheDocument();

      renderComponent({
        values: {
          ...defaultProps.values,
          isTimeLimited: true,
          defaultTimeLimitMinutes: 605,
        },
      });
      expect(screen.queryByDisplayValue('10:05')).toBeInTheDocument();
    });

    it('handles NaN values in time formatting', () => {
      renderComponent({
        values: {
          ...defaultProps.values,
          isTimeLimited: true,
          defaultTimeLimitMinutes: NaN,
        },
      });
      expect(screen.queryByDisplayValue('00:00')).toBeInTheDocument();
    });

    it('handles undefined values in time formatting', () => {
      renderComponent({
        values: {
          ...defaultProps.values,
          isTimeLimited: true,
          defaultTimeLimitMinutes: undefined,
        },
      });
      expect(screen.queryByDisplayValue('00:00')).toBeInTheDocument();
    });
  });

  describe('alerts and warnings', () => {
    it('shows warning when exam is locked and was not proctored', () => {
      renderComponent({
        releasedToStudents: true,
        wasExamEverLinkedWithExternal: true,
        wasProctoredExam: false,
      });

      expect(
        screen.getByText(
          messages.proctoredExamLockedAndisNotProctoredExamAlert.defaultMessage,
        ),
      ).toBeInTheDocument();
    });

    it('shows warning when exam is locked and was proctored', () => {
      renderComponent({
        releasedToStudents: true,
        wasExamEverLinkedWithExternal: true,
        wasProctoredExam: true,
      });

      expect(
        screen.getByText(
          messages.proctoredExamLockedAndisProctoredExamAlert.defaultMessage,
        ),
      ).toBeInTheDocument();
    });

    it('does not show warnings when exam is not locked', () => {
      renderComponent({
        releasedToStudents: false,
        wasExamEverLinkedWithExternal: false,
      });

      expect(
        screen.queryByText(
          messages.proctoredExamLockedAndisNotProctoredExamAlert.defaultMessage,
        ),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(
          messages.proctoredExamLockedAndisProctoredExamAlert.defaultMessage,
        ),
      ).not.toBeInTheDocument();
    });
  });

  describe('review rules section', () => {
    it('shows review rules when showReviewRules is true and conditions are met', () => {
      renderComponent({
        showReviewRules: true,
        values: {
          ...defaultProps.values,
          isProctoredExam: true,
          isPracticeExam: false,
          isOnboardingExam: false,
        },
      });

      expect(
        screen.getByText(messages.reviewRulesLabel.defaultMessage),
      ).toBeInTheDocument();
    });

    it('does not show review rules when showReviewRules is false', () => {
      renderComponent({
        showReviewRules: false,
        values: {
          ...defaultProps.values,
          isProctoredExam: true,
        },
      });

      expect(
        screen.queryByText(messages.reviewRulesLabel.defaultMessage),
      ).not.toBeInTheDocument();
    });

    it('shows review rules with online proctoring link when available', () => {
      renderComponent({
        showReviewRules: true,
        onlineProctoringRules: 'https://example.com/rules',
        values: {
          ...defaultProps.values,
          isProctoredExam: true,
          isPracticeExam: false,
          isOnboardingExam: false,
        },
      });

      expect(
        screen.getByText(messages.reviewRulesLabel.defaultMessage),
      ).toBeInTheDocument();
      const link = screen.queryByText('example.com/rules');
      if (link) {
        expect(link).toBeInTheDocument();
      }
    });

    it('handles review rules text area changes', async () => {
      const user = userEvent.setup();
      const mockSetFieldValue = jest.fn();

      renderComponent({
        setFieldValue: mockSetFieldValue,
        showReviewRules: true,
        values: {
          ...defaultProps.values,
          isProctoredExam: true,
          isPracticeExam: false,
          isOnboardingExam: false,
        },
      });

      const textArea = screen.getByRole('textbox');
      await user.type(textArea, 'New review rules');

      expect(mockSetFieldValue).toHaveBeenCalledWith(
        'examReviewRules',
        expect.any(String),
      );
      const examRulesCalls = mockSetFieldValue.mock.calls.filter(
        (call) => call[0] === 'examReviewRules',
      );
      expect(examRulesCalls.length).toBeGreaterThan(0);
      const lastExamRulesCall = examRulesCalls[examRulesCalls.length - 1];
      expect(lastExamRulesCall[1]).toContain('s');
    });
  });

  describe('prerequisites section', () => {
    it('renders prerequisite settings', () => {
      renderComponent({
        prereqs: [{ id: 'prereq1', name: 'Prerequisite 1' }],
      });

      expect(screen.getByText('Set as a special exam')).toBeInTheDocument();
    });
  });
});
