module.exports = {
  allGroupConfigurations: [
    {
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
    },
    {
      active: true,
      description:
        'The groups in this configuration can be mapped to cohorts in the Instructor Dashboard.',
      groups: [
        {
          id: 593758473,
          name: 'My Content Group 1',
          usage: [],
          version: 1,
        },
        {
          id: 256741177,
          name: 'My Content Group 2',
          usage: [],
          version: 1,
        },
        {
          id: 646686987,
          name: 'My Content Group 3',
          usage: [
            {
              label: 'Unit / Drag and Drop',
              url: '/container/block-v1:org+101+101+type@vertical+block@3d6d82348e2743b6ac36ac4af354de0e',
            },
          ],
          version: 1,
        },
      ],
      id: 1791848226,
      name: 'Content Groups',
      parameters: {},
      readOnly: false,
      scheme: 'cohort',
      version: 3,
    },
  ],
  experimentGroupConfigurations: [
    {
      active: true,
      description: 'description',
      groups: [
        {
          id: 276408623,
          name: 'Group A',
          usage: null,
          version: 1,
        },
        {
          id: 805061364,
          name: 'Group B',
          usage: null,
          version: 1,
        },
        {
          id: 1919501026,
          name: 'Group C1',
          usage: null,
          version: 1,
        },
      ],
      id: 875961582,
      name: 'Experiment Group Configurations 5',
      parameters: {},
      scheme: 'random',
      version: 3,
      usage: [],
    },
    {
      active: true,
      description: 'description',
      groups: [
        {
          id: 1712898629,
          name: 'Group M',
          usage: null,
          version: 1,
        },
        {
          id: 374655043,
          name: 'Group N',
          usage: null,
          version: 1,
        },
        {
          id: 997016182,
          name: 'Group O',
          usage: null,
          version: 1,
        },
        {
          id: 361314468,
          name: 'Group P',
          usage: null,
          version: 1,
        },
        {
          id: 505101805,
          name: 'Group Q',
          usage: null,
          version: 1,
        },
      ],
      id: 996450752,
      name: 'Experiment Group Configurations 4',
      parameters: {},
      scheme: 'random',
      version: 3,
      usage: [],
    },
  ],
  mfeProctoredExamSettingsUrl: '',
  shouldShowEnrollmentTrack: true,
  shouldShowExperimentGroups: true,
};
