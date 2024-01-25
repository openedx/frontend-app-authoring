module.exports = {
  active: true,
  description: 'Partition for segmenting users by enrollment track',
  groups: [
    {
      id: 6,
      name: '1111',
      usage: [],
      version: 1,
    },
    {
      id: 2,
      name: 'Enrollment track group',
      usage: [
        {
          label: 'Subsection / Unit',
          url: '/container/block-v1:org+101+101+type@vertical+block@08772238547242848cef928ba6446a55',
        },
      ],
      version: 1,
    },
  ],
  id: 50,
  usage: null,
  name: 'Enrollment Track Groups',
  parameters: {
    course_id: 'course-v1:org+101+101',
  },
  read_only: true,
  scheme: 'enrollment_track',
  version: 3,
};
