module.exports = {
  active: true,
  description: 'The groups in this configuration can be mapped to cohorts in the Instructor Dashboard.',
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
      usage: [
        {
          label: 'Unit / Blank Problem',
          url: '/container/block-v1:org+101+101+type@vertical+block@3d6d82348e2743b6ac36ac4af354de0e',
        },
        {
          label: 'Unit / Drag and Drop',
          url: '/container/block-v1:org+101+101+type@vertical+block@3d6d82348w2743b6ac36ac4af354de0e',
        },
      ],
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
};
