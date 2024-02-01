import { render } from '@testing-library/react';
import { CheckCircle as CheckCircleIcon } from '@openedx/paragon/icons';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import RenderErrorAlert from '.';
import messages from './messages';

const defaultTitle = messages.alertRenderErrorTitle.defaultMessage;
const defaultDescription = messages.alertRenderErrorDescription.defaultMessage;
const defaultErrorFullMessage = messages.alertRenderErrorMessage.defaultMessage;
const defaultErrorMessage = 'default error message';
const customClassName = 'some-class';
const customErrorMessage = 'custom error message';

const RootWrapper = (props) => (
  <IntlProvider locale="en">
    <RenderErrorAlert
      errorMessage={defaultErrorMessage}
      {...props}
    />
  </IntlProvider>
);

describe('<RenderErrorAlert />', () => {
  it('renders default values when no props are provided', () => {
    const { getByText } = render(<RootWrapper />);
    const titleElement = getByText(defaultTitle);
    const descriptionElement = getByText(defaultDescription);
    expect(titleElement).toBeInTheDocument();
    expect(descriptionElement).toBeInTheDocument();
    expect(getByText(defaultErrorFullMessage.replace('{message}', defaultErrorMessage))).toBeInTheDocument();
  });

  it('renders provided props correctly', () => {
    const customProps = {
      variant: 'success',
      icon: CheckCircleIcon,
      title: 'Custom Title',
      description: 'Custom Description',
      errorMessage: customErrorMessage,
    };
    const { getByText } = render(<RootWrapper {...customProps} />);

    expect(getByText(customProps.title)).toBeInTheDocument();
    expect(getByText(customProps.description)).toBeInTheDocument();
  });

  it('renders the alert with additional props', () => {
    const { getByRole } = render(<RootWrapper className={customClassName} />);
    const alertElement = getByRole('alert');
    const classNameExists = alertElement.classList.contains(customClassName);
    expect(alertElement).toBeInTheDocument();
    expect(classNameExists).toBe(true);
  });
});
