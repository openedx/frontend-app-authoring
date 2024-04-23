import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import messages from './messages';
import EmptyPlaceholder from '.';

const onCreateNewGroup = jest.fn();

const renderComponent = () => render(
  <IntlProvider locale="en">
    <EmptyPlaceholder onCreateNewGroup={onCreateNewGroup} />
  </IntlProvider>,
);

describe('<EmptyPlaceholder />', () => {
  it('renders EmptyPlaceholder component correctly', () => {
    const { getByText, getByRole } = renderComponent();

    expect(getByText(messages.title.defaultMessage)).toBeInTheDocument();
    expect(getByRole('button', { name: messages.button.defaultMessage })).toBeInTheDocument();
  });
});
