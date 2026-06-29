import { initializeMocks, render, screen } from '@src/testUtils';
import userEvent from '@testing-library/user-event';

import messages from './messages';
import CertificateDetailsForm from './CertificateDetailsForm';

const renderComponent = (props) =>
  render(
    <CertificateDetailsForm {...props} />,
  );

const defaultProps = {
  courseTitleOverride: '',
  detailsCourseTitle: 'Course Title',
  handleChange: jest.fn(),
  handleBlur: jest.fn(),
};

describe('CertificateDetailsForm', () => {
  beforeEach(() => {
    initializeMocks();
  });

  it('renders section title and course title override input', () => {
    renderComponent(defaultProps);

    expect(screen.getByText(messages.detailsSectionTitle.defaultMessage)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(messages.detailsCourseTitleOverride.defaultMessage)).toBeInTheDocument();
  });

  it('displays the course title', () => {
    renderComponent(defaultProps);

    expect(screen.getByTestId('certificate-details-form')).toHaveTextContent('Course Title');
  });

  it('handles input change', async () => {
    const user = userEvent.setup();
    renderComponent(defaultProps);
    const input = screen.getByPlaceholderText(messages.detailsCourseTitleOverride.defaultMessage);
    const newInputValue = 'New Title';

    await user.type(input, newInputValue);

    expect(defaultProps.handleChange).toHaveBeenCalled();
  });

  it('calls handleBlur when input loses focus', async () => {
    const user = userEvent.setup();
    renderComponent(defaultProps);
    const input = screen.getByPlaceholderText(messages.detailsCourseTitleOverride.defaultMessage);

    await user.click(input);
    await user.tab();

    expect(defaultProps.handleBlur).toHaveBeenCalled();
  });

  it('renders with a pre-filled courseTitleOverride value', () => {
    renderComponent({
      ...defaultProps,
      courseTitleOverride: 'Custom Title',
    });

    expect(screen.getByDisplayValue('Custom Title')).toBeInTheDocument();
  });
});
