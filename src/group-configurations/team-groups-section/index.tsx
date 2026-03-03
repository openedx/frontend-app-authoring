import React from 'react';

import { AvailableGroup } from '@src/group-configurations/types';
import ContentGroupCard from '@src/group-configurations/content-groups-section/ContentGroupCard';

interface TeamGroupsSectionProps {
  availableGroup: AvailableGroup;
}

const TeamGroupsSection: React.FC<TeamGroupsSectionProps> = ({
  availableGroup: { groups, name },
}) => (
  <div className="mt-2.5">
    <h2 className="lead text-black mb-3 configuration-section-name">{name}</h2>
    {groups.map((group) => (
      <ContentGroupCard
        group={group}
        key={group.id}
        readOnly
      />
    ))}
  </div>
);

export default TeamGroupsSection;
