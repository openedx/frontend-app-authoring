module.exports = {
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
  usage: null,
  name: 'Team Group: My Group',
  parameters: {
    course_id: 'course-v1:org+101+101',
    team_set_id: '0ec11208-335f-4b48-9475-136f02cc30f3"',
  },
  read_only: true,
  scheme: 'team',
  version: 3,
};
