import { AvailableGroup } from '@src/group-configurations/types';

const teamGroupsMock: AvailableGroup = {
  active: true,
  description: 'Partition for segmenting users by team-set',
  groups: [
    {
      id: 6,
      name: 'My Team 1',
      usage: [],
      version: 1,
    },
    {
      id: 7,
      name: 'My Team 2',
      usage: [
        {
          label: 'Subsection / Unit',
          url: '/container/block-v1:org+101+101+type@vertical+block@e960cb847be24b8c835ae1a0184d7831',
        },
      ],
      version: 1,
    },
  ],
  id: 92768376,
  name: 'Team Group: My Group',
  parameters: {
    courseId: 'course-v1:org+101+101',
  },
  readOnly: true,
  scheme: 'team',
  version: 3,
};

export default teamGroupsMock;
