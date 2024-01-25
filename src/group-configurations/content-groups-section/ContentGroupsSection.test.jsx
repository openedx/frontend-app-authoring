import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { contentGroupsMock } from '../__mocks__';
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
});
