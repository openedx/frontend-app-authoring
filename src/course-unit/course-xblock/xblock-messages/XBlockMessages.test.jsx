import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import messages from '../messages';
import XBlockMessages from './XBlockMessages';

const renderComponent = (props) => render(
  <IntlProvider locale="en">
    <XBlockMessages
      {...props}
    />
  </IntlProvider>,
);

describe('<XBlockMessages />', () => {
  it('renders without errors', () => {
    renderComponent({ validationMessages: [] });
  });

  it('does not render anything when there are no errors', () => {
    const { container } = renderComponent({ validationMessages: [] });
    expect(container.firstChild).toBeNull();
  });

  it('renders a warning Alert when there are warning errors', () => {
    const validationMessages = [{ type: 'warning', text: 'This is a warning' }];
    const { getByText } = renderComponent({ validationMessages });

    expect(getByText('This is a warning')).toBeInTheDocument();
    expect(getByText(messages.validationSummary.defaultMessage)).toBeInTheDocument();
  });

  it('renders a danger Alert when there are danger errors', () => {
    const validationMessages = [{ type: 'danger', text: 'This is a danger' }];
    const { getByText } = renderComponent({ validationMessages });

    expect(getByText('This is a danger')).toBeInTheDocument();
    expect(getByText(messages.validationSummary.defaultMessage)).toBeInTheDocument();
  });

  it('renders multiple error messages in a list', () => {
    const validationMessages = [
      { type: 'warning', text: 'Warning 1' },
      { type: 'danger', text: 'Danger 1' },
      { type: 'danger', text: 'Danger 2' },
    ];
    const { getByText } = renderComponent({ validationMessages });

    expect(getByText('Warning 1')).toBeInTheDocument();
    expect(getByText('Danger 1')).toBeInTheDocument();
    expect(getByText('Danger 2')).toBeInTheDocument();
    expect(getByText(messages.validationSummary.defaultMessage)).toBeInTheDocument();
  });
});
