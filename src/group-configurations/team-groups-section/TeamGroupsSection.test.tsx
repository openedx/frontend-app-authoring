import React from 'react';

import { initializeMocks, render } from '@src/testUtils';
import { teamGroupsMock } from '@src/group-configurations/__mocks__';
import TeamGroupsSection from '.';

const renderComponent = (
  props: Partial<React.ComponentProps<typeof TeamGroupsSection>> = {},
) => {
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

  it('renders the team group name as a heading', () => {
    const { getByRole } = renderComponent();

    const heading = getByRole('heading', { name: teamGroupsMock.name });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass('configuration-section-name');
  });

  it('renders all team groups from the availableGroup prop', () => {
    const { getByText } = renderComponent();

    teamGroupsMock.groups.forEach((group) => {
      expect(getByText(group.name)).toBeInTheDocument();
    });
  });

  it('renders content group cards as read-only', () => {
    const { getAllByTestId } = renderComponent();

    const cards = getAllByTestId('content-group-card');
    expect(cards).toHaveLength(teamGroupsMock.groups.length);

    // Verify that no edit or delete buttons are present (read-only mode)
    const editButtons = document.querySelectorAll('[data-testid="content-group-card-header-edit"]');
    const deleteButtons = document.querySelectorAll('[data-testid="content-group-card-header-delete"]');

    expect(editButtons).toHaveLength(0);
    expect(deleteButtons).toHaveLength(0);
  });

  it('renders with custom availableGroup prop', () => {
    const customGroup = {
      ...teamGroupsMock,
      name: 'Custom Team Group',
      groups: [
        {
          id: 100,
          name: 'Custom Team 1',
          usage: [],
          version: 1,
        },
      ],
    };

    const { getByText, getAllByTestId } = renderComponent({
      availableGroup: customGroup,
    });

    expect(getByText('Custom Team Group')).toBeInTheDocument();
    expect(getByText('Custom Team 1')).toBeInTheDocument();
    expect(getAllByTestId('content-group-card')).toHaveLength(1);
  });
});
