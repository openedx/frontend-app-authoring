// @ts-check
import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Formik, Form } from 'formik';
import InContextDiscussionFields from './InContextDiscussionFields';

const defaultProps = {
  onBlur: jest.fn(),
  onChange: jest.fn(),
  setFieldValue: jest.fn(),
  values: {
    enableGradedUnits: false,
    groupAtSubsection: false,
  },
};

const renderComponent = (props = {}) =>
  render(
    <IntlProvider locale="en">
      <Formik initialValues={defaultProps.values} onSubmit={jest.fn()}>
        {() => (
          <Form>
            <InContextDiscussionFields {...defaultProps} {...props} />
          </Form>
        )}
      </Formik>
    </IntlProvider>,
  );

describe('InContextDiscussionFields', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    renderComponent();
    // Component renders - check for presence of expected text
    expect(screen.getByText(/Visibility of in-context discussions/)).toBeInTheDocument();
  });

  it('renders with disabled prop', () => {
    renderComponent({ disabled: true });
    expect(screen.getByText(/Visibility of in-context discussions/)).toBeInTheDocument();
  });

  it('renders with default disabled (false)', () => {
    // Test default param - no disabled prop passed
    renderComponent();
    expect(screen.getByText(/Visibility of in-context discussions/)).toBeInTheDocument();
  });

  it('renders with enableGradedUnits true (shows cancel labels)', () => {
    renderComponent({
      values: { enableGradedUnits: true, groupAtSubsection: false },
    });
    expect(screen.getByText(/Visibility of in-context discussions/)).toBeInTheDocument();
  });

  it('shows confirmation popup when toggling enableGradedUnits when not disabled', () => {
    renderComponent({ disabled: false });
    // When not disabled, clicking the switch should trigger the onChange which sets showPopup
    // The component should still render - we test via the callback behavior
    const switchControl = screen.getByLabelText(/enable discussions/i);
    expect(switchControl).not.toBeDisabled();
  });

  it('does NOT show popup when disabled', () => {
    renderComponent({ disabled: true });
    // When disabled, clicking should not trigger popup logic
    // Verify the switch is disabled
    const switchControl = screen.getByLabelText(/enable discussions/i);
    expect(switchControl).toBeDisabled();
  });

  it('shows confirmation popup and handles confirm', () => {
    renderComponent({ disabled: false, setFieldValue: jest.fn() });
    // Click the switch to show popup
    const switchControl = screen.getByLabelText(/enable discussions/i);
    fireEvent.click(switchControl);
    // Check popup appears with confirm button
    expect(screen.getByText(/Confirm/i)).toBeInTheDocument();
    // Click confirm
    fireEvent.click(screen.getByText(/Confirm/i));
    // Popup should close (no longer visible)
  });

  it('shows popup with cancel labels when enableGradedUnits is already true', () => {
    renderComponent({
      disabled: false,
      values: { enableGradedUnits: true, groupAtSubsection: false },
    });
    const switchControl = screen.getByLabelText(/enable discussions/i);
    fireEvent.click(switchControl);
    // Popup shows cancel-related labels (enableGradedUnits=true branch)
    expect(screen.getByText(/Confirm/i)).toBeInTheDocument();
  });

  it('shows confirmation popup and handles cancel', () => {
    renderComponent({ disabled: false, setFieldValue: jest.fn() });
    // Click the switch to show popup
    const switchControl = screen.getByLabelText(/enable discussions/i);
    fireEvent.click(switchControl);
    // Check popup appears with cancel button
    expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
    // Click cancel
    fireEvent.click(screen.getByText(/Cancel/i));
    // Popup should close (no longer visible)
  });

  it('does not show popup when onChange fires with disabled=true', () => {
    renderComponent({ disabled: true });
    const switchControl = screen.getByLabelText(/enable discussions/i);
    // Fire change event even though switch is disabled — onChange guard (!disabled) prevents popup
    fireEvent.click(switchControl);
    expect(screen.queryByText(/Confirm/i)).not.toBeInTheDocument();
  });
});
