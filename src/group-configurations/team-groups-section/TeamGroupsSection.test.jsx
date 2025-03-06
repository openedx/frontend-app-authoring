import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import { teamGroupsMock } from '../__mocks__';
import TeamGroupsSection from '.';

const renderComponent = (props = {}) => render(
  <IntlProvider locale="en">
    <TeamGroupsSection
      availableGroup={teamGroupsMock}
      {...props}
    />
  </IntlProvider>
);

describe('<TeamGroupsSection />', () => {
  it('renders component correctly', () => {
    const { getByText, getAllByTestId } = renderComponent();
    expect(getByText(teamGroupsMock.name)).toBeInTheDocument();
    expect(getAllByTestId('content-group-card')).toHaveLength(
      teamGroupsMock.groups.length,
    );
  });
});
