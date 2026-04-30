// @ts-check
import { render, screen, fireEvent } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { Formik, Form } from 'formik';
import InContextDiscussionFields from './InContextDiscussionFields';
import messages from '../../messages';

const gradedUnitLabel = messages.gradedUnitPagesLabel.defaultMessage;

const defaultProps = {
  onBlur: jest.fn(),
  onChange: jest.fn(),
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
    expect(screen.getByText(/Visibility of in-context discussions/)).toBeInTheDocument();
  });

  it('renders with enableGradedUnits true (shows cancel labels)', () => {
    renderComponent({
      values: { enableGradedUnits: true, groupAtSubsection: false },
    });
    expect(screen.getByText(/Visibility of in-context discussions/)).toBeInTheDocument();
  });

  it('shows confirmation popup and handles confirm', () => {
    renderComponent({ setFieldValue: jest.fn() });
    const switchControl = screen.getByLabelText(gradedUnitLabel);
    fireEvent.click(switchControl);
    expect(screen.getByText(/Confirm/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Confirm/i));
  });

  it('shows popup with cancel labels when enableGradedUnits is already true', () => {
    renderComponent({
      values: { enableGradedUnits: true, groupAtSubsection: false },
    });
    const switchControl = screen.getByLabelText(gradedUnitLabel);
    fireEvent.click(switchControl);
    expect(screen.getByText(/Confirm/i)).toBeInTheDocument();
  });

  it('shows confirmation popup and handles cancel', () => {
    renderComponent({ setFieldValue: jest.fn() });
    const switchControl = screen.getByLabelText(gradedUnitLabel);
    fireEvent.click(switchControl);
    expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Cancel/i));
  });
});
