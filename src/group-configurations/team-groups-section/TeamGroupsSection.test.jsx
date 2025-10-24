import { initializeMocks, render } from '../../testUtils';

import { teamGroupsMock } from '../__mocks__';
import TeamGroupsSection from '.';

const renderComponent = (props = {}) => {
  initializeMocks();
  return render(
    <TeamGroupsSection
      availableGroup={teamGroupsMock}
      {...props}
    />,
  );
};

describe('<TeamGroupsSection />', () => {
  it('renders component correctly', () => {
    const { getByText, getAllByTestId } = renderComponent();
    expect(getByText(teamGroupsMock.name)).toBeInTheDocument();
    expect(getAllByTestId('content-group-card')).toHaveLength(
      teamGroupsMock.groups.length,
    );
  });
});
