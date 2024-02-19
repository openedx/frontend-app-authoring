import { IntlProvider } from '@edx/frontend-platform/i18n';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';

import { contentGroupsMock } from '../__mocks__';
import placeholderMessages from '../empty-placeholder/messages';
import messages from './messages';
import ContentGroupsSection from '.';

const renderComponent = (props = {}) => render(
  <IntlProvider locale="en">
    <ContentGroupsSection availableGroup={contentGroupsMock} {...props} />
  </IntlProvider>,
);

describe('<ContentGroupsSection />', () => {
  it('renders component correctly', () => {
    const { getByText, getByRole, getAllByTestId } = renderComponent();
    expect(getByText(contentGroupsMock.name)).toBeInTheDocument();
    expect(
      getByRole('button', { name: messages.addNewGroup.defaultMessage }),
    ).toBeInTheDocument();

    expect(getAllByTestId('configuration-card')).toHaveLength(
      contentGroupsMock.groups.length,
    );
  });

  it('renders empty section', () => {
    const { getByTestId } = renderComponent({ availableGroup: {} });
    expect(
      getByTestId('group-configurations-empty-placeholder'),
    ).toBeInTheDocument();
  });

  it('renders container with new group on create click if section is empty', async () => {
    const { getByRole, getByTestId } = renderComponent({ availableGroup: {} });
    userEvent.click(
      getByRole('button', { name: placeholderMessages.button.defaultMessage }),
    );
    expect(getByTestId('content-group-new')).toBeInTheDocument();
  });

  it('renders container with new group on create click if section has groups', async () => {
    const { getByRole, getByTestId } = renderComponent();
    userEvent.click(
      getByRole('button', { name: messages.addNewGroup.defaultMessage }),
    );
    expect(getByTestId('content-group-new')).toBeInTheDocument();
  });
});
