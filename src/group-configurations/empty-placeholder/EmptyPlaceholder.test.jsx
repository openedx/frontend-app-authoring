import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import messages from './messages';
import EmptyPlaceholder from '.';

const onCreateNewGroup = jest.fn();

const renderComponent = (props = {}) =>
  render(
    <IntlProvider locale="en">
      <EmptyPlaceholder onCreateNewGroup={onCreateNewGroup} {...props} />
    </IntlProvider>,
  );

describe('<EmptyPlaceholder />', () => {
  it('renders EmptyPlaceholder component correctly', () => {
    const { getByText, getByRole } = renderComponent();

    expect(getByText(messages.title.defaultMessage)).toBeInTheDocument();
    expect(getByRole('button', { name: messages.button.defaultMessage })).toBeInTheDocument();
  });

  it('renders the read-only message without the create button when readOnly', () => {
    const { getByText, queryByRole } = renderComponent({ readOnly: true });

    expect(getByText(messages.readOnlyTitle.defaultMessage)).toBeInTheDocument();
    expect(queryByRole('button', { name: messages.button.defaultMessage })).not.toBeInTheDocument();
  });

  it('renders the read-only message without the create button when readOnly and isExperiment', () => {
    const { getByText, queryByRole } = renderComponent({ readOnly: true, isExperiment: true });

    expect(getByText(messages.readOnlyTitle.defaultMessage)).toBeInTheDocument();
    expect(queryByRole('button', { name: messages.experimentalButton.defaultMessage })).not.toBeInTheDocument();
  });
});
